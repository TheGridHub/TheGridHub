/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React, { useReducer, useState, useEffect } from "react";
import { IconCheckMain3 } from "../../icons/IconCheckMain3";

interface Props {
  checked: boolean;
  stateProp: "hover" | "default";
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = ({ checked: propChecked, stateProp }: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    state: stateProp || "default",
  });

  const [checked, setChecked] = useState(propChecked);

  useEffect(() => {
    setChecked(propChecked);
  }, [propChecked]);

  const handleClick = () => {
    setChecked((prev) => !prev);
    // If onCheckedChange is provided, call it with the new checked state
    // This allows parent components to control the state if needed
    // if (onCheckedChange) {
    //   onCheckedChange(!checked);
    // }
  };

  return (
    <div
      className={`w-4 flex items-center gap-[7.11px] p-[3.56px] h-4 rounded-[var(--collection-spacing-xs)] justify-center relative ${
        checked
          ? state.state === "hover"
            ? "bg-colors-primary-500"
            : "bg-colors-primary-1000"
          : "bg-colors-light-100 border border-solid border-colors-light-100"
      }`}
      onMouseLeave={() => {
        dispatch("mouse_leave");
      }}
      onMouseEnter={() => {
        dispatch("mouse_enter");
      }}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {checked && <IconCheckMain3 className="!relative !w-[8.89px] !h-[8.89px]" />}
    </div>
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
