# Background Tasks

Background tasks let your app run code when it is closed or backgrounded. The OS wakes your app periodically, runs the task, then suspends it again.

---

## Packages

```bash
npx expo install expo-background-fetch expo-task-manager
```

**Requires a dev build** — both packages have native code. Run `npx expo run:ios` after installing.

| Package | Role |
|---|---|
| `expo-task-manager` | Registers named tasks — defines *what* to run |
| `expo-background-fetch` | Schedules tasks — defines *when* to run them |

---

## The Critical Rule

**Task definitions must live at the top level of a file, outside any component or function.**

When the OS wakes your app in the background, it doesn't mount your React tree — it just runs the registered task. If the task is defined inside a component, it won't exist when the OS calls it.

```ts
// ✅ Top level — available when OS wakes the app
TaskManager.defineTask("SYNC_DATA", async () => { ... });

// ❌ Inside a component — not available in background
export default function App() {
  TaskManager.defineTask("SYNC_DATA", async () => { ... }); // won't work
}
```

---

## Implementation Pattern

### 1. Define the task

Create a dedicated file for task definitions — imported once at app startup:

```ts
// lib/tasks/sync-task.ts
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

export const SYNC_TASK = "SYNC_DATA";

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    // do your background work here
    // e.g. sync offline queue, refresh tokens, fetch new data
    await syncOfflineQueue();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
```

Return values tell the OS what happened:

| Return value | Meaning |
|---|---|
| `NewData` | Task ran and fetched new data |
| `NoData` | Task ran but nothing new |
| `Failed` | Task failed |

### 2. Import the task file at startup

```ts
// app/_layout.tsx
import "@/lib/tasks/sync-task"; // import for side effects — registers the task
```

### 3. Register the schedule

Register after the user logs in (or on app startup if no auth needed):

```ts
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { SYNC_TASK } from "@/lib/tasks/sync-task";

const registerBackgroundSync = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK);
  if (isRegistered) return; // avoid double registration

  await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
    minimumInterval: 15 * 60, // 15 minutes — iOS minimum
    stopOnTerminate: false,   // keep running after app close (Android)
    startOnBoot: true,        // restart after device reboot (Android)
  });
};
```

### 4. Unregister on logout

```ts
const unregisterBackgroundSync = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK);
  }
};
```

---

## Real World Use Cases

| Use case | What the task does |
|---|---|
| **Offline queue sync** | Flush queued mutations when network is available |
| **Token refresh** | Silently refresh auth token before it expires |
| **Data prefetch** | Fetch fresh data so the app feels instant on open |
| **Badge count** | Fetch unread count and update the app icon badge |
| **Analytics flush** | Send batched analytics events to the server |

---

## Platform Constraints

### iOS
- **Minimum interval is 15 minutes** — you cannot run more frequently
- **The OS decides when to actually run it** — it learns from usage patterns (e.g. if the user opens the app every morning, iOS may run the task just before that)
- **No guarantee of execution** — iOS can skip tasks if battery is low or the device is in Low Power Mode
- **Time limit** — tasks have ~30 seconds to complete before being killed

### Android
- More permissive — tasks run closer to the scheduled interval
- `stopOnTerminate: false` keeps the task alive after the app is force-closed
- `startOnBoot: true` re-registers the task after device restart

---

## Checking Task Status

```ts
// Is the task registered?
const isRegistered = await TaskManager.isTaskRegisteredAsync("SYNC_DATA");

// List all registered tasks
const tasks = await TaskManager.getRegisteredTasksAsync();
console.log(tasks);
```

---

## Testing

Background fetch is hard to test naturally (15 min minimum interval). Trigger it manually during development:

```ts
// Manually trigger the task for testing
await BackgroundFetch.performFetchWithDelay(0);
```

Or from the Expo dev menu on a physical device, use the "Trigger Background Fetch" option.

---

## Recommended Project Structure

```
lib/
  tasks/
    sync-task.ts       # task definition + TASK_NAME constant
    token-task.ts      # separate file per task

app/
  _layout.tsx          # imports task files for registration
```

Keep one task per file. Each file is imported at app startup via `_layout.tsx` for its side effects (registering the task with `TaskManager`).

---

## Important Notes

- Background tasks run in a **separate JS context** — they don't have access to your React state or component tree
- Network requests work normally inside tasks
- `AsyncStorage` and `SecureStore` are accessible inside tasks
- Do not update React state directly — write to storage, then read on foreground
