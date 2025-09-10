import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { InputField } from "../../components/InputField";
import { Property1KeySizeBig } from "../../icons/Property1KeySizeBig";
import { Property1LockSizeMedium } from "../../icons/Property1LockSizeMedium";

export const SetNewPassword = (): JSX.Element => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };

      if (field === 'password') {
        if (value && value.length < 8) {
          setErrors(prevErrors => ({ ...prevErrors, password: "Password must be at least 8 characters." }));
        } else {
          setErrors(prevErrors => ({ ...prevErrors, password: "" }));
        }
        if (newFormData.confirmPassword && newFormData.confirmPassword !== value) {
          setErrors(prevErrors => ({ ...prevErrors, confirmPassword: "Please enter the same password as above." }));
        } else {
          setErrors(prevErrors => ({ ...prevErrors, confirmPassword: "" }));
        }
      } else if (field === 'confirmPassword') {
        if (value && newFormData.password !== value) {
          setErrors(prevErrors => ({ ...prevErrors, confirmPassword: "Please enter the same password as above." }));
        } else {
          setErrors(prevErrors => ({ ...prevErrors, confirmPassword: "" }));
        }
      }
      return newFormData;
    });
  };

  const isFormValid = () => {
    return formData.password.trim() !== '' && 
           formData.confirmPassword.trim() !== '' && 
           formData.password === formData.confirmPassword &&
           formData.password.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Please enter the same password as above." }));
      return;
    }
    
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters." }));
      return;
    }
    
    console.log("Password reset form submitted");
    navigate("/password-reset-success-confirmation");
  };

  return (
    <div
      className="flex flex-col min-h-screen gap-[21px] p-6 bg-[#2c2c2c] items-center justify-center relative"
      data-model-id="18:2045"
    >
      <div className="justify-around gap-[21px] self-stretch w-full flex items-center relative flex-1 grow">
        <div className="flex-col min-w-80 max-w-[480px] gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] rounded-3xl flex items-center relative flex-1 grow">
          <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <Property1KeySizeBig
                className="!relative !w-6 !h-6"
                color="#C5E152"
              />
            </div>

            <div className="self-stretch font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              Create A New Password
            </div>

            <p className="w-fit font-[number:var(--md-font-weight)] text-colors-light-500 text-[length:var(--md-font-size)] relative font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
              Choose a strong password you haven't used before.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
            <InputField
              className="!self-stretch !flex-[0_0_auto] !w-full"
              divClassName="!text-colors-light-500"
              icon={
                <Property1LockSizeMedium className="!relative !w-[18px] !h-[18px]" />
              }
              label="Password"
              property1="default"
              text="Type your password here"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              errorMessage={errors.password}
            />
            <InputField
              className="!self-stretch !flex-[0_0_auto] !w-full"
              icon={
                <Property1LockSizeMedium className="!relative !w-[18px] !h-[18px]" />
              }
              infoMessage={false}
              label="Confirm Password"
              property1="default"
              text="Retype your password here"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              errorMessage={errors.confirmPassword}
            />
            
            <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
              <p className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-500 text-[length:var(--sm-font-size)] tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] whitespace-nowrap [font-style:var(--xs-font-style)]">
                Your password has to be different from previous ones.
              </p>
            </div>

            <button 
              type="submit"
              disabled={!isFormValid()}
              className={`w-full font-normal py-2.5 px-8 rounded-lg h-11 transition-colors duration-200 ${
                isFormValid() 
                  ? "bg-colors-primary-1000 hover:bg-colors-primary-500 text-colors-dark-1000" 
                  : "bg-colors-light-100 text-colors-light-500 cursor-not-allowed"
              }`}
            >
              Reset Password
            </button>
          </form>
          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Remembered your password?
            </div>

            <Button
              label="Back to Sign In"
              showIcon={false}
              size="small"
              stateProp="default"
              to="/sign-in"
              type="tertiary"
              typeSecondaryStateClassName="!flex-[0_0_auto]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
