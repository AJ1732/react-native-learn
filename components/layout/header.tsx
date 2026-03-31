import { View, ViewProps } from "react-native";

import { cn } from "@/lib/utils";

type SlotProps = {
  children?: React.ReactNode;
  className?: string;
};

function Left({ children, className }: SlotProps) {
  return (
    <View className={cn("w-11 items-start justify-center", className)}>
      {children}
    </View>
  );
}

function Center({ children, className }: SlotProps) {
  return (
    <View className={cn("flex-1 items-center justify-center", className)}>
      {children}
    </View>
  );
}

function Right({ children, className }: SlotProps) {
  return (
    <View className={cn("min-w-11 items-end justify-center", className)}>
      {children}
    </View>
  );
}

type HeaderProps = ViewProps & {
  children: React.ReactNode;
};

function HeaderRoot({ children, className, ...props }: HeaderProps) {
  return (
    <View
      className={cn("h-14 flex-row items-center px-4", className)}
      {...props}
    >
      {children}
    </View>
  );
}

export const Header = Object.assign(HeaderRoot, { Left, Center, Right });
