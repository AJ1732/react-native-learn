import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const SPRING = { damping: 20, stiffness: 250, mass: 0.5 };

const sizes = {
  sm: { track: { width: 36, height: 20, padding: 2 }, thumb: 16 },
  md: { track: { width: 48, height: 26, padding: 3 }, thumb: 20 },
  lg: { track: { width: 60, height: 32, padding: 3 }, thumb: 26 },
} as const;

type Size = keyof typeof sizes;

type Props = Omit<PressableProps, "onPress" | "disabled"> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: Size;
  disabled?: boolean;
};

export function Switch({
  value,
  onValueChange,
  size = "md",
  disabled = false,
  className,
  ...props
}: Props) {
  const { track, thumb } = sizes[size];
  const travel = track.width - thumb * 1.5 - track.padding * 2;

  const offset = useDerivedValue(
    () => withSpring(value ? travel : 0, SPRING),
    [value, travel],
  );

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onValueChange(!value);
      }}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      {...props}
    >
      <Animated.View
        style={{
          width: track.width,
          height: track.height,
          borderRadius: track.height / 2,
          padding: track.padding,
          justifyContent: "center",
        }}
        className={cn(
          value ? "bg-brand-500" : "bg-neutral-300 dark:bg-neutral-600",
          disabled && "opacity-40",
          className,
        )}
      >
        <Animated.View
          style={[
            { width: thumb * 1.5, height: thumb, borderRadius: thumb / 2 },
            thumbStyle,
          ]}
          className="shadow-xs bg-white"
        />
      </Animated.View>
    </Pressable>
  );
}
