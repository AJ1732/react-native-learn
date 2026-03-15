import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  View,
} from "react-native";

import { Text } from "./text";

const buttonVariants = cva(
  "flex-row items-center justify-center active:opacity-80",
  {
    variants: {
      variant: {
        primary: "bg-brand-purple-500",
        secondary: "border border-brand-purple-200 bg-brand-purple-50",
        outline: "border border-neutral-300 bg-transparent",
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
      secondary: "text-brand-purple-600",
      outline: "text-neutral-900",
      ghost: "text-neutral-900",
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
    variant === "primary" || variant === "destructive" ? "white" : "#bf00ff";

  return (
    <Pressable
      className={clsx(
        buttonVariants({ variant, size, fullWidth, disabled: isDisabled }),
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text className={clsx(buttonTextVariants({ variant, size }))}>
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
