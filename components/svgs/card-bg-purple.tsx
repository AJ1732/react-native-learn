import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import { IllustrationProps } from "@/types/domain/svg.types";

export function CardBgPurple({ width = 256, height = 250, style }: IllustrationProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 256 250"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      style={style}
    >
      <Defs>
        <ClipPath id="clip0">
          <Rect width="256" height="250" rx="8" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0)">
        <Rect width="256" height="250" rx="8" fill="#F9E6FE" />
        <Path
          d="M973.008 322C963.008 268.5 690.008 -193 289.508 -40.4999C-110.992 112 188.508 358.5 1291.51 -472"
          stroke="#F0D1F9"
          strokeWidth="20"
        />
        <Path
          d="M-767.5 -29.0001C-757.5 24.4999 -484.5 486 -84 333.5C316.5 181 17 -65.5 -1086 765"
          stroke="#F0D1F9"
          strokeWidth="20"
        />
        <Path
          d="M988.008 522C978.008 468.5 705.008 7.00006 304.508 159.5C-95.9922 312 203.508 558.5 1306.51 -272"
          stroke="#FCF4FF"
          strokeWidth="32"
        />
        <Path
          d="M-687.5 -311C-677.5 -257.5 -404.5 204 -4 51.4999C396.5 -101 97 -347.5 -1006 483"
          stroke="#FCF4FF"
          strokeWidth="32"
        />
      </G>
    </Svg>
  );
}
