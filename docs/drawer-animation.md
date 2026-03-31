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

Two ways:
1. Call `useDrawer().close()` programmatically
2. Tap the transparent `Pressable` overlay that covers `Drawer.Scene` when `isOpen === true`

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

No new packages — uses `react-native-reanimated` (already installed).
