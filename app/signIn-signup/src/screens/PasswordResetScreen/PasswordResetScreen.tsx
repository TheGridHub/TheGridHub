import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { InputField } from "../../components/InputField";
import { InputIcons15 } from "../../icons/InputIcons15";
import { Property1MailSizeMedium } from "../../icons/Property1MailSizeMedium";

export const PasswordResetScreen = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // Declare emailError state
  const navigate = useNavigate();

  // Check if email field is filled and valid
  const isFormValid = () => {
    return email.trim() !== '' && email.includes('@');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (value && !value.includes('@')) {
      setEmailError("Please enter valid email.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for email:", email);
    // Validation would go here
    navigate("/set-new-password");
  };

  return (
    <div
className="flex flex-col min-h-screen gap-[21px] p-6 bg-white items-center justify-center relative"
      data-model-id="18:1993"
    >
      <div className="justify-around gap-[21px] self-stretch w-full flex items-center relative flex-1 grow">
        <div className="flex-col min-w-80 max-w-[480px] gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] rounded-3xl flex items-center relative flex-1 grow">
          <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <InputIcons15 className="!relative !w-6 !h-6" color="#C5E152" />
            </div>

            <div className="font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative self-stretch font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              Forgot Your Password?
            </div>

            <p className="font-[number:var(--md-font-weight)] text-colors-light-250 text-[length:var(--md-font-size)] relative self-stretch font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
              No worries. We&#39;ll send you a link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
            <InputField
              className="!self-stretch !flex-[0_0_auto] !w-full"
              frameClassName="!gap-2 ![justify-content:unset]"
              icon={
                <Property1MailSizeMedium className="!relative !w-[18px] !h-[18px]" />
              }
              infoMessage={false}
              label="Email"
              property1="default"
              showRightIcon={false}
              text="Enter your email address"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              errorMessage={emailError}
            />
            
            <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
              <p className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-500 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
                Don't have access to your email?
              </p>

              <Button
                divClassName="!text-colors-light-1000 !underline"
                label="Contact support"
                showIcon={false}
                size="small"
                stateProp="default"
                type="tertiary"
                typeSecondaryStateClassName="!flex-[0_0_auto]"
              />
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
              Send Reset Link
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
