import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Alert, Linking, Pressable, View } from "react-native";

import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/common/api";

import { Text } from "../atoms/text";
import { ImageIcon } from "../svgs/image-icon";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

const toImageAsset = (asset: ImagePicker.ImagePickerAsset): ImageAsset => ({
  uri: asset.uri,
  mimeType: asset.mimeType ?? null,
  fileName: asset.fileName ?? null,
});

const showPermissionAlert = (message: string) => {
  Alert.alert("Permission required", message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: () => Linking.openSettings() },
  ]);
};

type OnChange = (value: ImageAsset | null) => void;

const pickFromLibrary = async (onChange: OnChange) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    showPermissionAlert(
      "We need access to your photo library to select a profile image.",
    );
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (!result.canceled && result.assets[0]) {
    onChange(toImageAsset(result.assets[0]));
  }
};

const takePhoto = async (onChange: OnChange) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    showPermissionAlert("We need access to your camera to take a photo.");
    return;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (!result.canceled && result.assets[0]) {
    onChange(toImageAsset(result.assets[0]));
  }
};

const showImagePicker = (onChange: OnChange) => {
  Alert.alert("Select Profile Image", "Choose an option", [
    { text: "Take Photo", onPress: () => takePhoto(onChange) },
    { text: "Choose from Library", onPress: () => pickFromLibrary(onChange) },
    { text: "Cancel", style: "cancel" },
  ]);
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  className?: string;
  containerClassName?: string;
  showError?: boolean;
};

export function FormImagePicker<T extends FieldValues>({
  control,
  name,
  className,
  containerClassName,
  showError = true,
}: Props<T>) {
  const colors = useThemeColors();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className={cn("gap-2", containerClassName)}>
          <View className="relative self-start">
            <Pressable
              onPress={() => showImagePicker(onChange)}
              className={cn(
                "border-fg-muted bg-subtle size-24 items-center justify-center rounded-full border border-dashed",
                className,
              )}
            >
              {value?.uri ? (
                <Image
                  source={{ uri: value.uri }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <ImageIcon size={32} color={colors.icon} />
              )}
            </Pressable>
            {!!value?.uri && (
              <Pressable
                onPress={() => onChange(null)}
                className="border-fg-muted bg-subtle absolute -right-1 -top-1 size-6 items-center justify-center rounded-full border border-dashed"
              >
                <Text className="text-xs font-bold leading-none">✕</Text>
              </Pressable>
            )}
          </View>
          {showError && error && (
            <Text size="sm" className="text-red-500">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
