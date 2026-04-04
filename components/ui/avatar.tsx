import { useThemeColors } from "@/lib/theme";
import { Image } from "expo-image";
import { View } from "react-native";
import { ProfileIcon } from "../svgs/profile-icon";

interface AvatarProps {
  size?: number;
  uri?: string;
}

export const Avatar = ({ size = 20, uri }: AvatarProps) => {
  const colors = useThemeColors();

  return (
    <View
      className="items-center justify-center rounded-full border border-dashed border-outline-subtle bg-subtle"
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%", borderRadius: 48 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <ProfileIcon size={size / 3} color={colors.icon} />
      )}
    </View>
  );
};
