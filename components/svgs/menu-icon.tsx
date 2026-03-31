import Svg, { Path } from "react-native-svg";

import { IconProps } from "@/types/domain/svg.types";

export const MenuIcon = ({
  color = "#1E0010",
  size = 24,
  style,
}: IconProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M3 7H21"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <Path
        d="M3 12H21"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <Path
        d="M3 17H21"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </Svg>
  );
};
