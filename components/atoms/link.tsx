import { VariantProps, cva } from "class-variance-authority";
import { Link as ExpoLink, LinkProps } from "expo-router";

import { cn } from "@/lib/utils";

const linkVariants = cva("font-brockmann-medium", {
  variants: {
    variant: {
      default: "text-fg",
      accent: "text-brand-purple-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type Props = LinkProps & VariantProps<typeof linkVariants>;

export function Link({ className, variant, ...props }: Props) {
  return (
    <ExpoLink className={cn(linkVariants({ variant }), className)} {...props} />
  );
}
