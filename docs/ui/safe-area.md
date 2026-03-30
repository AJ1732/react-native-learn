# Safe Area Handling in React Native / Expo

## The Problem

Modern iPhones have a notch (top) and a home indicator (bottom) that occupy screen
space. Without safe area handling, content renders behind these areas. The wrong
approach adds double insets — a common source of mystery gaps.

---

## The `edges` Prop — Most Important Rule

`SafeAreaView` from `react-native-safe-area-context` applies insets on **all 4
sides** by default. Always specify `edges` explicitly to avoid double-applying
insets that the navigator already handles.

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

// Applies top inset only — correct for tab screens
<SafeAreaView className="flex-1 bg-white" edges={["top"]}>
  ...
</SafeAreaView>
```

### When to use which edges

| Context | `edges` value | Reason |
|---|---|---|
| Screen inside Tab navigator | `["top"]` | Tab bar handles bottom inset |
| Screen inside Stack navigator (no tab bar) | `["top", "bottom"]` | Nothing else handles bottom |
| Modal / form sheet | Omit `SafeAreaView` entirely | Sheet handles its own insets |
| Full-screen page (no nav) | `["top", "bottom", "left", "right"]` | Nothing else present |

---

## The Gap Bug

A blue/white gap between content and the tab bar is almost always caused by
`SafeAreaView` adding a bottom inset that the tab navigator has already accounted
for.

```tsx
// BAD — double bottom inset inside a tab screen
<SafeAreaView className="flex-1 bg-white">
  <ScrollView>...</ScrollView>
</SafeAreaView>

// GOOD — restrict to top only
<SafeAreaView className="flex-1 bg-white" edges={["top"]}>
  <ScrollView>...</ScrollView>
</SafeAreaView>
```

---

## ScrollView with Safe Areas

For screens whose primary content is a `ScrollView`, prefer
`contentInsetAdjustmentBehavior="automatic"` — it lets iOS handle safe areas
natively and allows content to scroll under translucent headers naturally.

```tsx
// No SafeAreaView needed
<ScrollView contentInsetAdjustmentBehavior="automatic">
  ...
</ScrollView>
```

Use `SafeAreaView` + `edges` when you need a background color to fill the safe
area (e.g. a white status bar area on a white screen). For purely scrollable
screens without a custom header, `contentInsetAdjustmentBehavior` is cleaner.

---

## Modal / Form Sheet

Do **not** wrap modal content in `SafeAreaView`. The native sheet manages its own
top inset (the grabber area). Adding `SafeAreaView` creates extra padding at the top.

```tsx
// modal/index.tsx
const Modal = () => (
  <ScrollView>
    ...
  </ScrollView>
);
```

---

## `useSafeAreaInsets` — Manual Control

When you need fine-grained control (e.g. a sticky footer that sits above the home
indicator):

```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Footer = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom + 16 }}>
      ...
    </View>
  );
};
```

---

## Checklist

- [ ] `SafeAreaView` always has `edges` explicitly set
- [ ] Tab screens use `edges={["top"]}`
- [ ] Modals / form sheets use no `SafeAreaView`
- [ ] `SafeAreaView` always has `flex-1` so children can fill the space
- [ ] No gap between content and tab bar (double bottom inset check)
