import { cva, type VariantProps } from "class-variance-authority";
import { Text as RNText, TextProps } from "react-native";

import { cn } from "@/lib/utils";

const textVariants = cva("font-brockmann-medium", {
  variants: {
    variant: {
      default: "text-fg",
      muted: "text-fg-muted",
      heading: "text-fg",
      display: "text-fg font-integral-bold",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type Props = TextProps & VariantProps<typeof textVariants>;

// const normalizeText = (children: React.ReactNode): React.ReactNode => {
//   if (typeof children === "string") {
//     return children
//       .replace(/\u2018|\u2019/g, "'") // curly single quotes → straight
//       .replace(/\u201C|\u201D/g, '"'); // curly double quotes → straight
//   }
//   return children;
// };

export function Text({ className, variant, size, children, ...props }: Props) {
  return (
    <RNText
      className={cn(textVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </RNText>
  );
}
