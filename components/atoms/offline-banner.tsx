import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { Text } from "./text";

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isConnected ? -64 : 0) }],
    opacity: withTiming(isConnected ? 0 : 1),
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute left-0 right-0 top-0 z-50 h-16 items-center justify-end bg-neutral-800 pb-1"
    >
      <Text className="text-sm text-white">No internet connection</Text>
    </Animated.View>
  );
}
