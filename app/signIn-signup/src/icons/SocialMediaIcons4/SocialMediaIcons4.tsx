/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  color: string;
  opacity: string;
  fill: string;
  color1: string;
  color2: string;
  className: any;
}

export const SocialMediaIcons4 = ({
  color = "#C5E152",
  opacity = "unset",
  fill = "#C5E152",
  color1 = "#C5E152",
  color2 = "#C5E152",
  className,
}: Props): JSX.Element => {
  return (
    <svg
      className={`${className}`}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_22_985)">
        <path
          d="M8.00034 6.54543V9.64362H12.3058C12.1167 10.64 11.5494 11.4837 10.6985 12.0509L13.2948 14.0655C14.8076 12.6692 15.6803 10.6182 15.6803 8.18187C15.6803 7.61461 15.6294 7.06911 15.5348 6.54552L8.00034 6.54543Z"
          fill={color}
          fillOpacity={opacity}
        />

        <path
          d="M3.51675 9.52269L2.93117 9.97094L0.858409 11.5855C2.17477 14.1963 4.87275 16 8 16C10.1599 16 11.9712 15.2873 13.2948 14.0655L10.6985 12.0509C9.98575 12.5309 9.07632 12.8219 8 12.8219C5.92001 12.8219 4.15279 11.4182 3.52002 9.5273L3.51675 9.52269Z"
          fill={fill}
          fillOpacity={opacity}
        />

        <path
          d="M0.858455 4.41455C0.31303 5.49087 0.000335693 6.70543 0.000335693 7.99996C0.000335693 9.29448 0.312984 10.5091 0.858409 11.5855C0.858409 11.5927 3.52032 9.51991 3.52032 9.51991C3.36032 9.03991 3.26575 8.53085 3.26575 7.99987C3.26575 7.4689 3.36032 6.95984 3.52032 6.47984L0.858455 4.41455Z"
          fill={color1}
          fillOpacity={opacity}
        />

        <path
          d="M8.00016 3.18545C9.17836 3.18545 10.2256 3.59271 11.062 4.37818L13.3529 2.0873C11.9638 0.792777 10.1602 0 8.00016 0C4.87292 0 2.17482 1.79636 0.858455 4.41455L3.52032 6.47984C4.15301 4.58891 5.92017 3.18545 8.00016 3.18545Z"
          fill={color2}
          fillOpacity={opacity}
        />
      </g>

      <defs>
        <clipPath id="clip0_22_985">
          <rect fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
};
