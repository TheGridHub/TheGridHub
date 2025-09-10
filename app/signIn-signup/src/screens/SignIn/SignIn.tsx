import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Checkbox } from "../../components/Checkbox";
import { InputField } from "../../components/InputField";
import { Property1LockSizeMedium } from "../../icons/Property1LockSizeMedium";
import { Property1MailSizeMedium } from "../../icons/Property1MailSizeMedium";
import { Property1UserSizeBig } from "../../icons/Property1UserSizeBig";
import { SocialMediaIcons7 } from "../../icons/SocialMediaIcons7";
import { SocialMediaIcons8 } from "../../icons/SocialMediaIcons8";
import { SocialMediaIcons9 } from "../../icons/SocialMediaIcons9";

export const SignIn = (): JSX.Element => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate email when it changes
    if (field === 'email') {
      if (value && !value.includes('@')) {
        setErrors(prev => ({ ...prev, email: "Please enter valid email." }));
      } else {
        setErrors(prev => ({ ...prev, email: "" }));
      }
    }
  };

  // Check if all fields are filled and valid
  const isFormValid = () => {
    return formData.email.trim() !== '' && 
           formData.email.includes('@') && 
           formData.password.trim() !== '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in form submitted with data:", formData, "Remember me:", rememberMe);
    // Form validation would go here
    // If valid, navigate to success page
    navigate("/success-confirmation-page");
  };

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center gap-[21px] p-6 relative bg-colors-dark-1000"
      data-model-id="15:554"
    >
      <div className="justify-between flex-1 self-stretch w-full grow flex items-center relative">
        <img
          className="relative flex-1 min-w-80 grow h-[784px] object-cover rounded-[var(--collection-corner-radius-xl)]"
          alt="Image placeholder"
          src="https://c.animaapp.com/mfa3eag73a5fU0/img/image-placeholder-1.png"
        />

        <div className="flex-col min-w-80 max-w-[520px] gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xl)] flex-1 grow rounded-3xl flex items-center relative">
          <div className="flex-col gap-2 self-stretch w-full flex-[0_0_auto] flex items-center relative">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <Property1UserSizeBig
                className="!relative !w-6 !h-6"
                color="#C5E152"
              />
            </div>

            <p className="font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative self-stretch font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              Sign In To Your Account
            </p>

            <p className="font-[number:var(--md-font-weight)] text-colors-light-500 text-[length:var(--md-font-size)] relative self-stretch font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
              Welcome back, please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col items-start gap-[var(--collection-spacing-lg)] relative self-stretch w-full flex-[0_0_auto]">
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
                text="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                errorMessage={errors.email}
              />
              <InputField
                className="!self-stretch !flex-[0_0_auto] !w-full"
                icon={
                  <Property1LockSizeMedium className="!relative !w-[18px] !h-[18px]" />
                }
                infoMessage={false}
                label="Password"
                property1="default"
                text="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange("password")}
              />
            </div>

            <div className="mt-6 w-full">
              <button 
                type="submit"
                disabled={!isFormValid()}
                className={`w-full font-normal py-2.5 px-8 rounded-lg h-11 transition-colors duration-200 ${
                  isFormValid() 
                    ? "bg-colors-primary-1000 hover:bg-colors-primary-500 text-colors-dark-1000" 
                    : "bg-colors-light-100 text-colors-light-500 cursor-not-allowed"
                }`}
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
              <Checkbox 
                checked={rememberMe} 
                onCheckedChange={setRememberMe} 
                stateProp="default" 
              />
              <p 
                className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]"
                onClick={() => setRememberMe(prev => !prev)}
                style={{ cursor: "pointer" }}
              >
                Remember Me for 30 days
              </p>
            </div>

            <Link
              className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)] block"
              to="/password-reset-request"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <img
                className="relative flex-1 grow h-px object-cover"
                alt="Line"
                src="https://c.animaapp.com/mfa3eag73a5fU0/img/line-609-1.svg"
              />

              <div className="relative w-fit mt-[-1.00px] font-body-small-reguler font-[number:var(--body-small-reguler-font-weight)] text-colors-light-1000 text-[length:var(--body-small-reguler-font-size)] tracking-[var(--body-small-reguler-letter-spacing)] leading-[var(--body-small-reguler-line-height)] whitespace-nowrap [font-style:var(--body-small-reguler-font-style)]">
                Or sign in with:
              </div>

              <img
                className="relative flex-1 grow h-px object-cover"
                alt="Line"
                src="https://c.animaapp.com/mfa3eag73a5fU0/img/line-608-1.svg"
              />
            </div>

            <div className="flex flex-wrap items-start gap-[12px_12px] relative self-stretch w-full flex-[0_0_auto]">
              <Button
                icon={
                  <SocialMediaIcons9 className="!relative !w-[18px] !h-[18px]" />
                }
                label="Gmail"
                size="big"
                stateProp="default"
                type="secondary"
                typeSecondaryStateClassName="!flex-1 !flex !grow"
              />
              <Button
                icon={
                  <SocialMediaIcons7 className="!relative !w-[18px] !h-[18px]" />
                }
                label="Github"
                size="big"
                stateProp="default"
                type="secondary"
                typeSecondaryStateClassName="!flex-1 !flex !grow"
              />
              <Button
                icon={
                  <SocialMediaIcons8 className="!relative !w-[18px] !h-[18px]" />
                }
                label="Gitlab"
                size="big"
                stateProp="default"
                type="secondary"
                typeSecondaryStateClassName="!flex-1 !flex !grow"
              />
            </div>
          </div>

          <p className="relative self-stretch font-xs font-[number:var(--xs-font-weight)] text-colors-light-500 text-[length:var(--xs-font-size)] tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] [font-style:var(--xs-font-style)]">
            <span className="text-[#ffffff80] font-xs [font-style:var(--xs-font-style)] font-[number:var(--xs-font-weight)] tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] text-[length:var(--xs-font-size)]">
              By creating an account, you agree to the{" "}
            </span>

            <span className="text-white font-xs [font-style:var(--xs-font-style)] font-[number:var(--xs-font-weight)] tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] text-[length:var(--xs-font-size)]">
              Terms of Service
            </span>

            <span className="text-[#ffffff80] font-xs [font-style:var(--xs-font-style)] font-[number:var(--xs-font-weight)] tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] text-[length:var(--xs-font-size)]">
              .&nbsp;&nbsp;We&#39;ll occasionally send you account-related
              emails.
            </span>
          </p>

          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Don’t have an account?
            </div>

            <Button
              label="Sign Up"
              showIcon={false}
              size="small"
              stateProp="default"
              to="/sign-up"
              to1="/sign-up"
              type="tertiary"
              typeSecondaryStateClassName="!flex-[0_0_auto]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
