import Svg, { Path } from "react-native-svg";

import { IconProps } from "@/types/domain/svg.types";

export const ArrowIcon = ({ color = "#1E0010", size = 24, style }: IconProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M14.4301 5.92993L20.5001 11.9999L14.4301 18.0699"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 12H20.33"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
