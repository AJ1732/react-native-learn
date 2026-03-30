import { cva, type VariantProps } from "class-variance-authority";
import { TextInput as RNTextInput, TextInputProps } from "react-native";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "text-fg h-14 border px-4 font-brockmann-medium text-base",
  {
    variants: {
      variant: {
        default: "border-outline bg-canvas",
        filled: "bg-subtle border-transparent",
        error: "border-red-400 bg-red-50 dark:bg-red-950",
        disabled: "border-outline-subtle bg-surface text-fg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type Props = TextInputProps & VariantProps<typeof inputVariants>;

export function TextInput({ className, variant, style, ...props }: Props) {
  return (
    <RNTextInput
      placeholderTextColor="#a3a3a3"
      textAlignVertical="center"
      className={cn(inputVariants({ variant }), className)}
      style={[{ lineHeight: undefined }, style]}
      {...props}
    />
  );
}
