import { useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/atoms/text";
import { ChevronIcon } from "@/components/svgs/chevron-icon";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function ProfileAccordion({
  title,
  children,
  defaultOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const chevronRotation = useSharedValue(defaultOpen ? 180 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(`${chevronRotation.value}deg`, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const toggle = () => {
    setIsOpen((prev) => !prev);
    chevronRotation.value = chevronRotation.value === 0 ? 180 : 0;
  };

  return (
    <Animated.View layout={LinearTransition.duration(250)}>
      <Pressable
        onPress={toggle}
        className="flex-row justify-between gap-4 bg-surface p-4"
      >
        <Text>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronIcon style={{ marginTop: 2 }} />
        </Animated.View>
      </Pressable>
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(200).easing(Easing.out(Easing.cubic))}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}
