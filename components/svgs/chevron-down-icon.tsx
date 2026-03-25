import Svg, { Path } from "react-native-svg";

import { IconProps } from "@/types/domain/svg.types";

export function ChevronDownIcon({
  color = "#1E0010",
  size = 12,
  style,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={style}
    >
      <Path
        d="M3 4.5L6 7.5L9 4.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
