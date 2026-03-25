import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { Platform } from "react-native";
import { Text } from "./text";

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { top } = useSafeAreaInsets();

  // Content area below the status bar/notch/island
  const CONTENT_HEIGHT = Platform.OS === "ios" ? 20 : 28;
  const bannerHeight = top + CONTENT_HEIGHT;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isConnected ? -bannerHeight : 0) }],
    opacity: withTiming(isConnected ? 0 : 1),
  }));

  return (
    <Animated.View
      style={[animatedStyle, { height: bannerHeight }]}
      className="absolute left-0 right-0 top-0 z-50 items-center justify-end bg-neutral-800 pb-2"
    >
      <Text className="text-sm text-white">No internet connection</Text>
    </Animated.View>
  );
}
