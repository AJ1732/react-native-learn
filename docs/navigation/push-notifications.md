# Push Notifications

Push notifications are server-triggered messages delivered to a user's device. The app receives them — it never sends them to itself.

---

## How It Works End-to-End

```
User's device                Your backend              External trigger
──────────────────────────────────────────────────────────────────────
1. App opens
2. Gets push token ──────→ Saves token to DB
                           (linked to user ID)

                                                  [event happens]
                           3. Backend detects
                              relevant event
                           4. Looks up user's ──→ Expo Push API ──→ Device
                              push token                             shows notification
```

The app only registers a token and handles incoming notifications. The backend decides when and why to send.

---

## Installation

```bash
npx expo install expo-notifications expo-device
```

**Requires a dev build** — `expo-notifications` has native code. Run `npx expo run:ios` after installing.

---

## app.json Configuration

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#bf00ff",
          "sounds": []
        }
      ]
    ]
  }
}
```

---

## The 4 Parts

### 1. Permissions

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) return false; // won't work on simulator

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};
```

Always check existing status before requesting — iOS will only show the system prompt once. If the user denied it, you need to direct them to Settings.

### 2. Push Token

```ts
import Constants from "expo-constants";

const getPushToken = async (): Promise<string | null> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data; // "ExponentPushToken[xxxxxx]"
};
```

Send this token to your backend after login, linked to the user ID:

```ts
// After successful login
const token = await getPushToken();
if (token) {
  await api.post("/users/push-token", { token });
}
```

### 3. Foreground Handler

By default, notifications are suppressed when the app is open. Configure how they appear:

```ts
// app/_layout.tsx — outside component, runs once
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### 4. Tap Handler (Deep Link on Tap)

```ts
// Inside your root layout
useEffect(() => {
  // Handles taps when app is already open
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      if (data?.screen === "opportunities" && data?.id) {
        router.push({
          pathname: "/opportunities/[id]",
          params: { id: data.id },
        });
      }
    }
  );

  return () => subscription.remove();
}, []);
```

For handling taps when the app was closed (cold start):

```ts
// Check if app was opened via a notification
const lastResponse = await Notifications.getLastNotificationResponseAsync();
if (lastResponse?.notification.request.content.data?.screen) {
  // navigate to the appropriate screen
}
```

---

## What Your Backend Does

Stores the push token linked to each user, then calls the Expo Push API when an event occurs:

```ts
// Your backend (Node.js example)
await fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "ExponentPushToken[xxxxxx]",      // token from your DB
    title: "New application",
    body: "John applied to Senior Developer role",
    data: { screen: "opportunities", id: "123" }, // used for deep linking
    sound: "default",
    badge: 1,
  }),
});
```

---

## Real World Triggers

| Event | Who gets notified | Data payload |
|---|---|---|
| Someone applies to opportunity | Recruiter | `{ screen: "opportunities", id }` |
| Application status changes | Applicant | `{ screen: "profile" }` |
| New message received | Recipient | `{ screen: "messages", id }` |
| Profile viewed | Profile owner | `{ screen: "profile" }` |

---

## Where to Register the Token

Register after login, unregister on logout:

```ts
// hooks/use-push-token.ts
export const usePushToken = () => {
  const registerToken = async () => {
    const token = await getPushToken();
    if (token) await api.post("/users/push-token", { token });
  };

  const unregisterToken = async () => {
    await api.delete("/users/push-token");
  };

  return { registerToken, unregisterToken };
};
```

---

## Platform Notes

| | iOS | Android |
|---|---|---|
| Permission prompt | Required — shown once | Not required (Android 12 and below) |
| Permission prompt | — | Required on Android 13+ |
| Foreground display | Hidden by default | Shown by default |
| Simulator support | ❌ — use real device | ✅ emulator works |

---

## Testing Without a Backend

Use Expo's push notification tool to send test notifications:
[expo.dev/notifications](https://expo.dev/notifications)

Paste your `ExponentPushToken` and send a test payload directly from the browser.
