import { cva, type VariantProps } from "class-variance-authority";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  View,
} from "react-native";

import { haptics } from "@/lib/haptics";
import { brandColor } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { Text } from "./text";

const buttonVariants = cva(
  "flex-row items-center justify-center active:opacity-80",
  {
    variants: {
      variant: {
        primary: "bg-brand-500",
        secondary:
          "border border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-950",
        outline: "border-outline-strong border bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-red-600",
      },
      size: {
        sm: "h-10 gap-1.5 px-4",
        md: "h-12 gap-2 px-5",
        lg: "h-14 gap-2.5 px-6",
      },
      fullWidth: {
        true: "w-full",
        false: "self-start",
      },
      disabled: {
        true: "opacity-40",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      disabled: false,
    },
  },
);

const buttonTextVariants = cva("font-brockmann-medium", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-brand-600 dark:text-brand-300",
      outline: "text-fg",
      ghost: "text-fg",
      destructive: "text-white",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type Props = Omit<PressableProps, "disabled"> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  };

export function Button({
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  const loaderColor =
    variant === "primary" || variant === "destructive" ? "white" : brandColor;

  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size, fullWidth, disabled: isDisabled }),
        className,
      )}
      disabled={isDisabled}
      {...props}
      onPressIn={(e) => {
        if (variant === "destructive") haptics.heavy();
        else haptics.light();
        props.onPressIn?.(e);
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text className={cn(buttonTextVariants({ variant, size }))}>
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
