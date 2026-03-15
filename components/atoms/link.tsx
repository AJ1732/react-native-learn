import { VariantProps, cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Link as ExpoLink, LinkProps } from "expo-router";

const linkVariants = cva("font-brockmann-medium", {
  variants: {
    variant: {
      default: "",
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
    <ExpoLink
      className={clsx(linkVariants({ variant }), className)}
      {...props}
    />
  );
}
