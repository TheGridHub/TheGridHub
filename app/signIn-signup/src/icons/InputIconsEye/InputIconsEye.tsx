/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
  color?: string;
  opacity?: string;
  onClick?: () => void;
}

export const InputIconsEye = ({
  className,
  color = "white",
  opacity = "0.5",
  onClick,
}: Props): JSX.Element => {
  return (
    <svg
      className={`${className}`}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <g clipPath="url(#clip0_29_274)">
        <path
          d="M9 3.00002C14.25 3.00002 17.25 9.00002 17.25 9.00002C17.25 9.00002 14.25 15 9 15C3.75 15 0.75 9.00002 0.75 9.00002C0.75 9.00002 3.75 3.00002 9 3.00002ZM9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={opacity}
          strokeWidth="1.5"
        />
      </g>
      <defs>
        <clipPath id="clip0_29_274">
          <rect fill="white" height="18" width="18" />
        </clipPath>
      </defs>
    </svg>
  );
};
