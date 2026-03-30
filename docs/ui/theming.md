# Theming

Dark/light mode via NativeWind v4 CSS variables.

## Architecture

```
lib/theme.ts          — CSS variable definitions + useThemeColors hook
tailwind.config.js    — semantic color tokens referencing CSS variables
app/_layout.tsx       — applies active theme to root view
app/(tabs)/_layout.tsx — dynamic tab bar colors
```

## How it works

`vars()` from NativeWind injects CSS variables onto a View. All descendants can use those variables via Tailwind semantic tokens.

```tsx
// _layout.tsx
const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
<GestureHandlerRootView style={[{ flex: 1 }, theme]}>
```

## Semantic tokens

| Token             | Light              | Dark               | Usage                        |
|-------------------|--------------------|--------------------|------------------------------|
| `canvas`          | `#ffffff`          | `#0a0a0a`          | Page backgrounds             |
| `surface`         | `#fafafa`          | `#171717`          | Cards, elevated surfaces     |
| `subtle`          | `#f5f5f5`          | `#262626`          | Input fills, skeletons       |
| `fg`              | `#171717`          | `#fafafa`          | Primary text                 |
| `fg-muted`        | `#737373`          | `#a3a3a3`          | Secondary text, placeholders |
| `outline`         | `#e5e5e5`          | `#404040`          | Card/input borders           |
| `outline-subtle`  | `#f5f5f5`          | `#262626`          | Dividers, dashed borders     |
| `outline-strong`  | `#d4d4d4`          | `#525252`          | Button outlines              |

Usage in components:
```tsx
<View className="bg-canvas">
  <Text className="text-fg">Title</Text>
  <Text className="text-fg-muted">Subtitle</Text>
  <TextInput className="border-outline bg-subtle" />
</View>
```

## JS prop colors (icons, RefreshControl)

CSS variables don't reach SVG color props. Use `useThemeColors()`:

```tsx
import { useThemeColors } from '@/lib/theme';

const colors = useThemeColors();
<EditIcon color={colors.icon} />
<ArrowIcon color={colors.iconMuted} />
<ChevronIcon color={colors.brandChevron} />
<RefreshControl tintColor={colors.refreshTint} />
```

| Key            | Light       | Dark        |
|----------------|-------------|-------------|
| `icon`         | `#262626`   | `#d4d4d4`   |
| `iconMuted`    | `#737373`   | `#a3a3a3`   |
| `brandChevron` | `#260033`   | `#e599ff`   |
| `refreshTint`  | `#bf00ff`   | `#bf00ff`   |

## Toggling the theme

The profile screen switch calls `setColorScheme` from NativeWind:

```tsx
import { useColorScheme } from 'nativewind';

const { colorScheme, setColorScheme } = useColorScheme();

<Switch
  value={colorScheme === 'dark'}
  onValueChange={(val) => setColorScheme(val ? 'dark' : 'light')}
/>
```

## Brand accent exceptions

A small number of brand-specific colors use `dark:` prefix since they have no neutral semantic equivalent:

- `Button` secondary: `dark:border-brand-purple-700 dark:bg-brand-purple-950`
- `Button` secondary text: `dark:text-brand-purple-300`
- Back button (detail screen): `dark:bg-brand-purple-900`
- `Switch` inactive track: `dark:bg-neutral-600`
- Error input: `dark:bg-red-950`
