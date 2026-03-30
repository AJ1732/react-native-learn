import type { ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

type Props = ViewProps & {
  className?: string;
};

export function Skeleton({ className, style, ...props }: Props) {
  const opacity = useSharedValue(1);

  useMountEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={cn("bg-subtle", className)}
      {...props}
    />
  );
}
