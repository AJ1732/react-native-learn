import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { TextInput as RNTextInput, TextInputProps } from "react-native";

const inputVariants = cva(
  "h-14 border px-4 font-brockmann-medium text-base text-neutral-900",
  {
    variants: {
      variant: {
        default: "border-neutral-200 bg-white",
        filled: "border-transparent bg-neutral-100",
        error: "border-red-400 bg-red-50",
        disabled: "border-neutral-100 bg-neutral-50 text-neutral-400",
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
      className={clsx(inputVariants({ variant }), className)}
      style={[{ lineHeight: undefined }, style]}
      {...props}
    />
  );
}
