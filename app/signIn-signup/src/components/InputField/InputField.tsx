import React, { useReducer, useState, ChangeEvent } from "react";
import { InputIcons3 } from "../../icons/InputIcons3"; // Eye-off icon
import { InputIconsEye } from "../../icons/InputIconsEye"; // Eye icon
import { Property1UserSizeMedium } from "../../icons/Property1UserSizeMedium";

interface Props {
  showLabel: boolean;
  showLeftIcon: boolean;
  infoMessage: boolean;
  label: string;
  showRightIcon: boolean;
  property1: "hover" | "default";
  className: any;
  frameClassName: any;
  text: string;
  icon: JSX.Element;
  divClassName: any;
  onChange?: (value: string) => void;
  type?: string;
  name?: string;
  value?: string;
  errorMessage?: string;
}

export const InputField = ({
  showLabel = true,
  showLeftIcon = true,
  infoMessage = true,
  label = "First Name",
  showRightIcon = true,
  property1,
  className,
  frameClassName,
  text = "First Name",
  icon = <Property1UserSizeMedium className="!relative !w-[18px] !h-[18px]" />,
  divClassName,
  onChange,
  type = "text",
  name,
  value: propValue,
  errorMessage,
}: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    property1: property1 || "default",
  });
  
  const [value, setValue] = useState(propValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div
      className={`w-60 flex flex-col items-start gap-[var(--collection-spacing-sm)] relative ${className}`}
      onMouseLeave={() => {
        dispatch("mouse_leave");
      }}
      onMouseEnter={() => {
        dispatch("mouse_enter");
      }}
    >
      {showLabel && (
        <div className="font-sm w-fit mt-[-1.00px] tracking-[var(--sm-letter-spacing)] text-[length:var(--sm-font-size)] [font-style:var(--sm-font-style)] text-colors-light-1000 relative font-[number:var(--sm-font-weight)] whitespace-nowrap leading-[var(--sm-line-height)]">
          {state.property1 === "default" && <>{label}</>}
          {state.property1 === "hover" && <>{text}</>}
        </div>
      )}

      <div
        className={`border border-solid w-full flex self-stretch items-center p-3 h-11 rounded-[var(--collection-corner-radius-sm)] justify-between bg-colors-light-100 relative ${
          errorMessage ? "border-red-500" : 
          state.property1 === "hover" || isFocused ? "border-colors-light-500" : "border-colors-light-100"
        } ${frameClassName}`}
      >
        <div className="inline-flex items-center gap-[var(--collection-spacing-sm)] flex-[1_1_auto] relative">
          {showLeftIcon && <>{icon}</>}

          <input
            type={inputType}
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={text}
            className="bg-transparent border-none outline-none w-full font-body-small-reguler tracking-[var(--body-small-reguler-letter-spacing)] text-[length:var(--body-small-reguler-font-size)] [font-style:var(--body-small-reguler-font-style)] text-colors-light-1000 relative font-[number:var(--body-small-reguler-font-weight)] leading-[var(--body-small-reguler-line-height)]"
          />
        </div>

        {showRightIcon && (
          type === "password" ? (
            showPassword ? (
              <InputIconsEye 
                className="!relative !w-[18px] !h-[18px]" 
                onClick={togglePasswordVisibility} 
                color="white"
                opacity="0.5"
              />
            ) : (
              <InputIcons3 
                className="!relative !w-[18px] !h-[18px]" 
                onClick={togglePasswordVisibility} 
                style={{ cursor: 'pointer' }}
              />
            )
          ) : (
            <InputIcons3 className="!relative !w-[18px] !h-[18px]" />
          )
        )}
      </div>

      {errorMessage ? (
        <p
          className="font-xs w-fit tracking-[var(--xs-letter-spacing)] [font-style:var(--xs-font-style)] text-[length:var(--xs-font-size)] text-red-500 font-[number:var(--xs-font-weight)] leading-[var(--xs-line-height)] whitespace-nowrap relative"
        >
          {errorMessage}
        </p>
      ) : infoMessage && (
        <p
          className={`font-xs w-fit tracking-[var(--xs-letter-spacing)] [font-style:var(--xs-font-style)] text-[length:var(--xs-font-size)] text-colors-light-250 font-[number:var(--xs-font-weight)] leading-[var(--xs-line-height)] whitespace-nowrap relative ${divClassName}`}
        >
          Minimum length is 8 characters.
        </p>
      )}
    </div>
  );
};

function reducer(state: any, action: any) {
  switch (action) {
    case "mouse_enter":
      return {
        ...state,
        property1: "hover",
      };

    case "mouse_leave":
      return {
        ...state,
        property1: "default",
      };
  }

  return state;
}
