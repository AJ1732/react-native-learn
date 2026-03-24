import { clsx } from "clsx";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Alert, Linking, Pressable, View } from "react-native";

import type { ImageAsset } from "@/types/common/api";

import { Text } from "../atoms/text";
import { ImageIcon } from "../svgs/image-icon";

const toImageAsset = (asset: ImagePicker.ImagePickerAsset): ImageAsset => ({
  uri: asset.uri,
  mimeType: asset.mimeType ?? null,
  fileName: asset.fileName ?? null,
});

type OnChange = (value: ImageAsset | null) => void;

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
  const showImagePicker = (onChange: OnChange) => {
    Alert.alert("Selet Profile Image", "choose an option", [
      {
        text: "Take Photo",
        onPress: () => handleTakePhoto(onChange),
      },
      {
        text: "Choose from Library",
        onPress: () => handlePickImage(onChange),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handlePickImage = async (onChange: OnChange) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photo library to select a profile image.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(toImageAsset(result.assets[0]));
    }
  };

  const handleTakePhoto = async (onChange: OnChange) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your camera to take a photo.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(toImageAsset(result.assets[0]));
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <View className={clsx("gap-2", containerClassName)}>
            <View className="relative self-start">
              <Pressable
                onPress={() => showImagePicker(onChange as unknown as OnChange)}
                className={clsx(
                  "size-24 items-center justify-center rounded-full border border-dashed border-neutral-500 bg-neutral-100",
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
                  <ImageIcon size={32} color="#262626" />
                )}
              </Pressable>
              {!!value?.uri && (
                <Pressable
                  onPress={() => onChange(null)}
                  className="absolute -right-1 -top-1 size-6 items-center justify-center rounded-full border border-dashed border-neutral-500 bg-neutral-100"
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
        );
      }}
    />
  );
}
