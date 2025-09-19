/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";
import { Link } from "react-router-dom";
import { SocialMediaIcons4 } from "../../icons/SocialMediaIcons4";

interface Props {
  showIcon?: boolean;
  label?: string;
  type?: "primary" | "secondary" | "tertiary";
  stateProp?: "hover" | "default";
  size?: "small" | "big";
  typeSecondaryStateClassName?: any;
  socialMediaIcons4Color?: string;
  socialMediaIcons4Fill?: string;
  socialMediaIcons4Color1?: string;
  socialMediaIcons4Color2?: string;
  icon?: JSX.Element;
  divClassName?: any;
  to?: string;
  to1?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Button = ({
  showIcon = true,
  label = "Button",
  type,
  stateProp,
  size,
  typeSecondaryStateClassName,
  socialMediaIcons4Color = "white",
  socialMediaIcons4Fill = "white",
  socialMediaIcons4Color1 = "white",
  socialMediaIcons4Color2 = "white",
  icon = (
    <SocialMediaIcons4
      className="!relative !w-[18px] !h-[18px]"
      color={socialMediaIcons4Color}
      color1={socialMediaIcons4Color1}
      color2={socialMediaIcons4Fill}
      fill={socialMediaIcons4Color2}
    />
  ),
  divClassName,
  to,
  to1,
  onClick,
}: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    type: type || "secondary",

    state: stateProp || "default",

    size: size || "big",
  });

  return (
    <Link
      to={to || to1 || "#"}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      <button
        className={`all-[unset] box-border inline-flex items-center relative gap-[var(--collection-spacing-sm)] justify-center ${state.state === "default" && state.type === "secondary" ? "border-colors-light-100" : (state.type === "secondary" && state.state === "hover") ? "border-colors-light-250" : ""} ${state.size === "big" ? "pr-[var(--collection-spacing-xxl)] pl-[var(--collection-spacing-xxl)] py-2.5" : ""} ${state.size === "small" ? "rounded-lg" : "rounded-[var(--collection-corner-radius-sm)]"} ${state.type === "secondary" ? "bg-colors-light-100" : (state.state === "default" && state.type === "primary") ? "bg-colors-primary-1000" : state.type === "primary" && state.state === "hover" ? "bg-colors-primary-500" : ""} ${state.type === "secondary" ? "border border-solid" : ""} ${state.size === "big" ? "min-w-[140px]" : ""} ${state.size === "big" ? "h-11" : ""} ${typeSecondaryStateClassName}`}
        onMouseEnter={() => {
          dispatch("mouse_enter");
        }}
        onMouseLeave={() => {
          dispatch("mouse_leave");
        }}
      >
        {showIcon && <>{icon}</>}

        <span
          className={`[font-family:'Open_Sans',Helvetica] w-fit tracking-[0] font-normal leading-5 whitespace-nowrap relative block ${state.size === "small" ? "mt-[-1.00px]" : ""} ${state.size === "small" ? "text-sm" : "text-base"} ${state.type === "secondary" ? "text-colors-light-1000" : (state.type === "primary") ? "text-colors-dark-1000" : state.state === "default" && state.size === "small" ? "text-colors-primary-1000" : state.size === "small" && state.state === "hover" ? "text-colors-primary-500" : ""} ${divClassName}`}
        >
          {label}
        </span>
      </button>
    </Link>
  );
};

function reducer(state: any, action: any) {
  switch (action) {
    case "mouse_enter":
      return {
        ...state,
        state: "hover",
      };

    case "mouse_leave":
      return {
        ...state,
        state: "default",
      };
  }

  return state;
}
