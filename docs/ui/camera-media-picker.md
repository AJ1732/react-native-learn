# Camera & Media Picker

`expo-image-picker` provides access to the device camera and photo library. No need for `expo-camera` unless you need a fully custom camera UI with live preview and manual controls — for photo capture and library selection, `expo-image-picker` covers everything.

---

## Installation

```bash
npx expo install expo-image-picker
```

**Requires a dev build** — has native code. Run `npx expo run:ios` after installing.

---

## The Two Launch Methods

```ts
import * as ImagePicker from "expo-image-picker";

// Open the device photo library
const result = await ImagePicker.launchImageLibraryAsync(options);

// Open the camera
const result = await ImagePicker.launchCameraAsync(options);
```

Both return the same result shape:

```ts
if (!result.canceled) {
  const asset = result.assets[0];
  asset.uri       // local file path
  asset.mimeType  // "image/jpeg", "image/png", etc.
  asset.fileName  // original file name
  asset.width     // pixels
  asset.height    // pixels
}
```

---

## Permissions

Always request before launching. Handle the denied case by directing the user to Settings:

```ts
import { Alert, Linking } from "react-native";

const requestLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === "granted") return true;

  Alert.alert(
    "Permission required",
    "We need access to your photo library.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
  return false;
};

const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status === "granted") return true;

  Alert.alert(
    "Permission required",
    "We need access to your camera.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
  return false;
};
```

**iOS behaviour:** the system prompt only appears once. If the user denies it, future calls to `requestPermissionsAsync` return `denied` immediately — always provide the Settings fallback.

---

## Common Options

```ts
const options: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],     // "images" | "videos" | "livePhotos"
  allowsEditing: true,        // show crop UI after selection
  aspect: [1, 1],             // crop ratio (only applies when allowsEditing: true)
  quality: 0.8,               // 0–1 compression (1 = lossless)
  allowsMultipleSelection: false,
};
```

---

## Pattern: Action Sheet + Permission + Launch

The standard UX — show an action sheet so the user picks camera or library:

```ts
const pickImage = (onSelect: (asset: ImageAsset) => void) => {
  Alert.alert("Select Image", "Choose an option", [
    { text: "Take Photo", onPress: () => openCamera(onSelect) },
    { text: "Choose from Library", onPress: () => openLibrary(onSelect) },
    { text: "Cancel", style: "cancel" },
  ]);
};

const openLibrary = async (onSelect: (asset: ImageAsset) => void) => {
  const allowed = await requestLibraryPermission();
  if (!allowed) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    onSelect(toImageAsset(result.assets[0]));
  }
};

const openCamera = async (onSelect: (asset: ImageAsset) => void) => {
  const allowed = await requestCameraPermission();
  if (!allowed) return;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    onSelect(toImageAsset(result.assets[0]));
  }
};
```

---

## How It's Used in This Project

`components/ui/form-image-picker.tsx` — a `react-hook-form` controlled component that wraps the full flow. Used in the profile update screen.

```tsx
<FormImagePicker
  control={control}
  name="profileImage"
/>
```

Handles: action sheet → permission request → launch → crop → preview → clear.

---

## Uploading the Image

The `uri` from the picker is a **temporary local path** — it must be uploaded before the app closes or the OS clears temp files. Use `FormData`:

```ts
const uploadImage = async (asset: ImageAsset) => {
  const formData = new FormData();
  formData.append("file", {
    uri: asset.uri,
    type: asset.mimeType ?? "image/jpeg",
    name: asset.fileName ?? "photo.jpg",
  } as any);

  await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

**Important:** image URIs cannot be queued for offline upload — the temp file may not exist when the device reconnects. Always require the user to be online before uploading images.

---

## expo-camera vs expo-image-picker

| | `expo-image-picker` | `expo-camera` |
|---|---|---|
| Pick from library | ✅ | ❌ |
| Take a photo | ✅ | ✅ |
| Custom camera UI | ❌ | ✅ |
| Live preview control | ❌ | ✅ |
| QR / barcode scanning | ❌ | ✅ |
| Complexity | Low | High |

Use `expo-image-picker` for profile photos, attachments, and standard image capture. Use `expo-camera` only when you need a custom camera experience (filters, overlays, scanning).

---

## Platform Notes

- **iOS Simulator** — camera is not available, library picker works with simulated photos
- **Android Emulator** — both work
- **iOS permissions** — add `NSPhotoLibraryUsageDescription` and `NSCameraUsageDescription` to your `app.json` info.plist if not already present via the plugin
