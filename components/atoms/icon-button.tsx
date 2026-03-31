import { Pressable, PressableProps } from "react-native";

import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Props = PressableProps & {
  children: React.ReactNode;
};

export function IconButton({ children, className, ...props }: Props) {
  return (
    <Pressable
      className={cn("size-11 items-center justify-center active:opacity-60", className)}
      {...props}
      onPressIn={(e) => {
        haptics.light();
        props.onPressIn?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}
