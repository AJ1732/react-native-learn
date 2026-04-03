# Drawer Animation — Implementation Notes

## Architecture

```
(tabs)/_layout.tsx
└── <Drawer>                         ← context provider + root View
    ├── <Drawer.Sidebar>             ← absolute, behind scene, z-order 0
    │   └── sidebar content
    └── <Drawer.Scene>               ← flex: 1, animated, z-order 1
        └── <Tabs> + all tab screens
```

## File

`components/layout/drawer.tsx`

Exports:
- `Drawer` — compound component (`Drawer.Sidebar`, `Drawer.Scene`)
- `useDrawer()` — hook for any child to call `open / close / toggle`

## The Animation (3 values, all on the UI thread)

`Drawer.Scene` reads `progress` (SharedValue 0→1) via context and applies
`useAnimatedStyle`. Nothing runs on the JS thread during the gesture.

| Property     | Closed → Open        | Effect                              |
|--------------|----------------------|-------------------------------------|
| `scale`      | `1 → 0.84`           | content shrinks away                |
| `translateX` | `0 → sidebarWidth + width*(scale-1)/2` | scene slides right, revealing sidebar |
| `borderRadius`| `0 → 16`            | rounded corners appear on scene     |

The `translateX` formula places the scene's left edge exactly at
`sidebarWidth` when fully open, so the sidebar is fully revealed.

`overflow: 'hidden'` is a static style on the `Animated.View` so that the
animated `borderRadius` actually clips the content (required in React Native).

## Spring Config

```ts
{ damping: 22, stiffness: 200, mass: 0.8 }
```

Snappy but not over-damped. Increase `damping` to slow the bounce.

## Closing the Drawer

Three ways:
1. Call `useDrawer().close()` programmatically
2. Tap the overlay that covers `Drawer.Scene` when `isOpen === true`
3. Swipe left on the scene content

### Why we replaced `Pressable` with `GestureDetector`

The original implementation used a `Pressable` overlay to close the drawer on tap.
It was replaced with a `GestureDetector` (from `react-native-gesture-handler`) composing
two gestures via `Gesture.Race`:

**`Gesture.Pan` (swipe-to-close)**
- `activeOffsetX: -10` — only activates for leftward movement (≥ 10px), so scrollable content inside the scene is not blocked.
- `onUpdate` — writes directly to `progress` SharedValue on the UI thread, giving real-time 1:1 finger tracking with no JS bridge overhead.
- `onEnd` — snaps to closed if `progress < 0.5` or swipe velocity is fast enough (`velocityX < -300`), otherwise snaps back open.

**`Gesture.Tap` (tap-to-close)**
- Replaces the `Pressable` 1:1. Fires `close()` on a successful tap.

**`Gesture.Race`**
- The two gestures compete. `Pan` requires 10px of leftward movement before it activates, so quick taps always resolve via `Tap`. A drag activates `Pan` first and cancels `Tap`.

**Why not keep `Pressable`?**
`Pressable` only handles discrete press events — it has no concept of drag progress.
To get interactive drag feedback (scene following the finger in real-time), everything
needs to live inside Reanimated worklets on the UI thread. `GestureDetector` with a
`Pan` gesture achieves that; `Pressable` cannot.

**Scheduling JS-thread calls from worklets**
Gesture callbacks (`.onUpdate`, `.onEnd`) run on the UI thread as worklets. Any function
that touches React state must be explicitly scheduled back onto the JS (RN) thread.

The API has evolved across library versions:

| Version | API | Usage |
|---|---|---|
| Reanimated ≤ 3 | `runOnJS` from `react-native-reanimated` | `runOnJS(fn)()` |
| Reanimated 4 (early) | `runOnJS` from `react-native-worklets` | `runOnJS(fn)()` |
| Reanimated 4 (current) | `scheduleOnRN` from `react-native-worklets` | `scheduleOnRN(fn)` |

`scheduleOnRN` does not return a callable — it schedules the function immediately.
Calling it as `scheduleOnRN(fn)()` causes a "not callable" TS error.

Without this, `close()` calls `setIsOpen(false)` on the UI thread, which crashes the app.

## Constants (tweak in drawer.tsx)

```ts
const SIDEBAR_WIDTH_RATIO = 0.72;   // sidebar = 72% of screen width
const SCENE_SCALE        = 0.84;    // scene shrinks to 84%
const SCENE_BORDER_RADIUS = 16;     // px, rounded corners when open
```

## Usage Pattern

```tsx
// _layout.tsx — wrap your navigator
<Drawer>
  <Drawer.Sidebar>
    <MySidebarContent />
  </Drawer.Sidebar>
  <Drawer.Scene>
    <Tabs>...</Tabs>
  </Drawer.Scene>
</Drawer>

// Any screen — trigger the drawer
const { toggle } = useDrawer();
<IconButton onPress={toggle}>
  <MenuIcon color={colors.icon} />
</IconButton>
```

## Dependencies

- `react-native-reanimated` — SharedValue, useAnimatedStyle, withSpring
- `react-native-gesture-handler` — GestureDetector, Gesture.Pan, Gesture.Tap, Gesture.Race
- `react-native-worklets` — scheduleOnRN (schedule JS-thread calls from UI-thread worklets)
