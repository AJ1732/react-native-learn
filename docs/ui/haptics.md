# Haptics in React Native

Haptic feedback adds tactile responses to user interactions. On iOS it uses the Taptic Engine; on Android it uses the vibration motor. Done well, it makes an app feel native and responsive. Done poorly (overused), it becomes annoying.

---

## Installation

`expo-haptics` is included with Expo by default:

```bash
npx expo install expo-haptics
```

No additional native setup required.

---

## The 3 APIs

```ts
import * as Haptics from "expo-haptics";

// 1. Impact — simulates a physical collision
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// 2. Notification — communicates an outcome
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// 3. Selection — subtle tick for value changes
Haptics.selectionAsync();
```

---

## When to Use Each

| API | When to use | Example |
|---|---|---|
| `Impact.Light` | Standard taps and toggles | Button press, switch toggle |
| `Impact.Medium` | Drag confirmations, contextual actions | Dropping a dragged item |
| `Impact.Heavy` | Destructive or high-stakes actions | Delete confirmation |
| `Notification.Success` | Positive outcome | Form submitted, item saved |
| `Notification.Warning` | Caution state | Approaching a limit |
| `Notification.Error` | Failed action | Login failed, network error |
| `selectionAsync` | Discrete value changes | Tab switch, picker scroll |

---

## Usage Examples

### Button press

```tsx
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

<Pressable onPress={() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // your action
}}>
```

### Switch toggle

```tsx
<Switch
  value={enabled}
  onValueChange={(val) => {
    Haptics.selectionAsync();
    setEnabled(val);
  }}
/>
```

### Form submission

```tsx
const handleSubmit = async () => {
  try {
    await submitForm();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};
```

### Destructive action

```tsx
const handleDelete = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  deleteItem();
};
```

---

## Platform Notes

| Platform | Behaviour |
|---|---|
| iOS | Full Taptic Engine support — all styles feel distinct |
| Android | Maps to vibration patterns — less nuanced than iOS |
| Simulator / Emulator | No haptics — test on a real device |

---

## Rules of Thumb

- **Trigger on press, not on release** — feedback should feel immediate.
- **One haptic per action** — never stack multiple haptic calls for a single interaction.
- **Don't haptic-ify everything** — navigation, passive list scrolling, and informational UI should have no haptics.
- **Match intensity to weight** — light taps get `Light`, destructive actions get `Heavy` or `Error`.
- **Respect user settings** — iOS will automatically suppress haptics if the user has disabled them in Settings. You don't need to handle this manually.

---

## React Native–Specific Notes

- `expo-haptics` calls are fire-and-forget — they are `async` but you don't need to `await` them in most cases.
- They are safe to call from event handlers, animation callbacks, and gesture handlers.
- To call from a Reanimated UI thread callback, you must use `runOnJS`:

```tsx
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Inside a gesture or animation worklet:
runOnJS(triggerHaptic)();
```
