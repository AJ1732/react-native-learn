# Drawer Animation — Implementation Notes

## Architecture

```
<Drawer>
    ├── <Drawer.Sidebar>   ← absolute, behind scene, z-order 0
    └── <Drawer.Scene>     ← flex: 1, animated, z-order 1
```

## File

`components/layout/drawer.tsx`

Exports:
- `Drawer` — compound component (`Drawer.Sidebar`, `Drawer.Scene`, `Drawer.Item`)
- `useDrawer()` — hook for any child to call `open / close / toggle`

## Animation

The sidebar is a static absolute panel on the left. Only the `Scene` animates —
it slides right and scales down, revealing the sidebar behind it.

| Property       | Closed → Open                          | Effect                                |
|----------------|----------------------------------------|---------------------------------------|
| `scale`        | `1 → 0.84`                            | content shrinks away                  |
| `translateX`   | `0 → sidebarWidth + width*(scale-1)/2` | scene slides right, revealing sidebar |
| `borderRadius` | `0 → 24`                              | rounded corners appear on scene       |

The `translateX` formula places the scene's left edge exactly at `sidebarWidth`
when fully open.

**Close gestures (on the scene overlay):**
- Swipe left (`activeOffsetX: -10`) — real-time drag tracking
- Tap — instant close

## Shared Mechanics

### Single `progress` SharedValue (0 → 1)

`progress` drives all animations on the UI thread via `useAnimatedStyle`.
Nothing runs on the JS thread during a gesture.

### Spring Config

```ts
{ damping: 28, stiffness: 200, mass: 0.8 }
```

`damping: 28` exceeds the critical threshold (25.3) for the element mass, so
there is no overshoot/bounce. Raise `stiffness` to make it snappier.
Springs are interruptible mid-animation — the velocity carries over correctly.

### Scheduling JS-thread calls from worklets

Gesture callbacks (`.onUpdate`, `.onEnd`) run on the UI thread as worklets.
`close()` calls `setIsOpen(false)` which is a React state update and must run
on the JS thread. Use `scheduleOnRN` from `react-native-worklets`:

```ts
scheduleOnRN(close); // NOT scheduleOnRN(close)() — it does not return a callable
```

The API has evolved across library versions:

| Version | API | Usage |
|---|---|---|
| Reanimated ≤ 3 | `runOnJS` from `react-native-reanimated` | `runOnJS(fn)()` |
| Reanimated 4 (early) | `runOnJS` from `react-native-worklets` | `runOnJS(fn)()` |
| Reanimated 4 (current) | `scheduleOnRN` from `react-native-worklets` | `scheduleOnRN(fn)` |

### Why `GestureDetector` instead of `Pressable`

`Pressable` only handles discrete press events — it has no concept of drag
progress. `GestureDetector` with `Gesture.Pan` writes directly to the
`progress` SharedValue on the UI thread, giving real-time 1:1 finger tracking.
`Gesture.Race(panGesture, tapGesture)` lets quick taps fall through to `Tap`
while a drag activates `Pan` first.

## Constants (tweak in drawer.tsx)

```ts
const SIDEBAR_WIDTH_RATIO = 0.72;  // sidebar = 72% of screen width
const SCENE_SCALE         = 0.84;  // scene shrinks to 84%
const SCENE_BORDER_RADIUS = 24;    // rounded corners on scene when open
```

## Usage

```tsx
<Drawer>
  <Drawer.Sidebar>
    <MySidebarContent />
  </Drawer.Sidebar>
  <Drawer.Scene>
    <Tabs>...</Tabs>
  </Drawer.Scene>
</Drawer>

// Trigger from any child
const { toggle, open, close } = useDrawer();
```

## `Drawer.Item`

Sidebar navigation link that closes the drawer before navigating.

```tsx
<Drawer.Item label="Home" href="/" />
```

Calls `close()` then `router.push(href)` with a light haptic on press.

## Dependencies

- `react-native-reanimated` — SharedValue, useAnimatedStyle, withSpring
- `react-native-gesture-handler` — GestureDetector, Gesture.Pan, Gesture.Tap, Gesture.Race
- `react-native-worklets` — scheduleOnRN (schedule JS-thread calls from UI-thread worklets)
- `expo-router` — router.push (used by Drawer.Item)

---

# BottomPanel — Implementation Notes

## Why a separate component (not a vertical Drawer)

A vertical `Drawer` placed inside a screen is always constrained to that
screen's content area — it cannot render above the tab bar because the tab bar
is mounted at the `(tabs)/_layout.tsx` level.

Two nested `<Drawer>` instances would cause **context shadowing**: React returns
the nearest context value, so any screen calling `useDrawer()` would get the
inner drawer. A separate `BottomPanel` with its own context avoids this.

## Architecture

```
(tabs)/_layout.tsx
└── <BottomPanel>                        ← wraps entire layout
    ├── <Animated.View (scene)>          ← scales down + dims when panel opens
    │   └── <Drawer> ... <Tabs> ...
    ├── <Animated.View (dim overlay)>    ← full-screen, sibling to scene (not inside it)
    └── <PanelOverlay />                 ← absolutely positioned panel, zIndex: 20
```

`PanelOverlay` is rendered **internally** by `BottomPanelRoot` — callers never
reference it directly. The dim overlay is a **sibling** of the scene (not a
child), so it covers the full screen including the edge gaps left by the
`0.96` scale transform.

## File

`components/layout/bottom-panel.tsx`

Exports:
- `BottomPanel` — root component (alias for `BottomPanelRoot`)
- `useBottomPanel()` — hook to call `open(content, options?) / close`

## API

```ts
type OpenOptions = {
  detents?: number[]; // fractions of available height to snap to, e.g. [0.5, 1.0]
};

type BottomPanelContextValue = {
  isOpen: boolean;
  content: ReactNode;
  translateY: SharedValue<number>;
  containerHeight: SharedValue<number>;
  snapPoints: SharedValue<number[]>;
  open: (content: ReactNode, options?: OpenOptions) => void;
  close: () => void;
};
```

**`open(content, options?)`** — sets content, computes snap points from `detents`,
animates panel up to the first (smallest) detent.
**`close()`** — animates panel off-screen, then sets `isOpen = false` on the JS thread.

## Detents and height

Available height = `screenHeight − topSafeAreaInset` (panel never overlaps
the status bar / Dynamic Island).

For each detent `d`, the visible panel height = `d × availableHeight`.
`containerHeight` = `maxDetent × availableHeight` (the panel View's fixed height).

`translateY` encodes position:

| State                    | `translateY`                        |
|--------------------------|-------------------------------------|
| Off-screen (closed)      | `containerHeight`                   |
| At detent `d`            | `containerHeight − d × availableHeight` |
| Fully open (detent `1.0`)| `0`                                 |

Default detents: `[0.65]` (one snap point at 65% of available height).

## Gesture

`Gesture.Pan().activeOffsetY([-10, 10])` — activates for **both** upward and
downward movement. `activeOffsetY(10)` (positive-only) would silently ignore
upward swipes.

On release, velocity determines the next snap point:

| Condition            | Behaviour                                      |
|----------------------|------------------------------------------------|
| `velocityY > 500`    | Snap to next lower detent (or close)           |
| `velocityY < -500`   | Snap to next higher detent                     |
| Otherwise            | Snap to nearest detent (including closed)      |

If `target ≥ containerHeight`, the panel closes via `scheduleOnRN(close)`.

## Scene animation

| Property       | Panel closed → fully open        | Effect                          |
|----------------|----------------------------------|---------------------------------|
| `scale`        | `1 → 0.96`                       | content shrinks away            |
| `borderRadius` | `0 → 16`                         | rounded corners appear on scene |
| `dimOpacity`   | `0 → 0.4`                        | overlay darkens scene           |

`dimProgress` (0 → 1) is derived from `translateY` and drives all three values
on the UI thread.

## Constants (tweak in bottom-panel.tsx)

```ts
const DEFAULT_DETENTS     = [0.65];  // default snap point
const PANEL_BORDER_RADIUS = 24;      // rounded top corners on panel
const SCENE_SCALE         = 0.96;    // scene shrinks when panel opens
const SCENE_BORDER_RADIUS = 16;      // rounded corners on scene when panel opens
const SCENE_DIM_OPACITY   = 0.4;     // max dim opacity over scene
```

## Usage

```tsx
// Wrap the layout once
<BottomPanel>
  <Drawer>...</Drawer>
</BottomPanel>

// From any screen, no matter how deep
const { open, close, isOpen } = useBottomPanel();

<Pressable onPress={() => open(<CommentsPanel />, { detents: [0.5, 1.0] })}>
  <Text>Open comments</Text>
</Pressable>
```

## Spring config

Same as `Drawer`: `{ damping: 28, stiffness: 200, mass: 0.8 }` — consistent
feel across both components.

## Dependencies

- `react-native-reanimated` — SharedValue, useAnimatedStyle, withSpring, useDerivedValue
- `react-native-gesture-handler` — GestureDetector, Gesture.Pan
- `react-native-worklets` — scheduleOnRN
- `react-native-safe-area-context` — useSafeAreaInsets (caps panel height at safe area top)
