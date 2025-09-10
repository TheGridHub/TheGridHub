/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const InputIcons3 = ({ className, onClick, style }: Props): JSX.Element => {
  return (
    <svg
      className={`${className}`}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={style}
    >
      <g clipPath="url(#clip0_29_274)">
        <path
          d="M7.425 3.18002C7.94125 3.05918 8.4698 2.99877 9 3.00002C14.25 3.00002 17.25 9.00002 17.25 9.00002C16.7947 9.85172 16.2518 10.6536 15.63 11.3925M10.59 10.59C10.384 10.8111 10.1356 10.9884 9.85961 11.1114C9.58362 11.2343 9.28568 11.3005 8.98357 11.3058C8.68146 11.3111 8.38137 11.2555 8.10121 11.1424C7.82104 11.0292 7.56654 10.8608 7.35288 10.6471C7.13923 10.4335 6.97079 10.179 6.85763 9.89881C6.74447 9.61865 6.68889 9.31856 6.69423 9.01645C6.69956 8.71434 6.76568 8.4164 6.88866 8.1404C7.01163 7.86441 7.18894 7.61601 7.41 7.41002M0.75 0.75L17.25 17.25M13.455 13.455C12.1729 14.4323 10.6118 14.9737 9 15C3.75 15 0.75 9.00002 0.75 9.00002C1.68292 7.26144 2.97685 5.74247 4.545 4.54502L13.455 13.455Z"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.5"
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
