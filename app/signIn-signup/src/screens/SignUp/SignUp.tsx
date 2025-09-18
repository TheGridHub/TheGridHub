import React, { useState } from "react";
import { Button } from "../../components/Button";
import { InputField } from "../../components/InputField";
import { Property1LockSizeMedium } from "../../icons/Property1LockSizeMedium";
import { Property1MailSizeMedium } from "../../icons/Property1MailSizeMedium";
import { SocialMediaIcons7 } from "../../icons/SocialMediaIcons7";

export const SignUp = (): JSX.Element => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

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
    } else if (field === 'password') {
      if (value && value.length < 8) {
        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters." }));
      } else {
        setErrors(prev => ({ ...prev, password: "" }));
      }
    }
  };

  // Check if all fields are filled and valid
  const isFormValid = () => {
    return formData.username.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.email.includes('@') &&
           formData.password.trim() !== '' &&
           formData.password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.username } }
      })
      if (error) {
        alert(error.message)
        return
      }
      // Ensure profile row exists (RLS insert will work if you have trigger; otherwise upsert client-side)
      await supabase.from('profiles').upsert({ user_id: data.user?.id, plan: 'free', onboarding_complete: false, subscription_status: 'pending' })
      // Redirect to onboarding for newly registered users
      window.location.href = '/onboarding'
    } catch (err) {
      console.error(err)
      alert('Unable to sign up')
    }
  };

  return (
    <div
className="flex flex-col min-h-screen items-center justify-center gap-[21px] p-6 relative bg-white"
      data-model-id="13:369"
    >
      <div className="flex-wrap justify-between gap-[21px_21px] flex-1 self-stretch w-full grow flex items-center relative">
        <img
          className="relative flex-1 min-w-80 grow h-[784px] object-cover rounded-[var(--collection-corner-radius-xl)]"
          alt="Image placeholder"
          src="https://c.animaapp.com/mfa3eag73a5fU0/img/image-placeholder.png"
        />

        <div className="flex-col min-w-80 max-w-[520px] gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] flex-1 grow rounded-3xl flex items-center relative">
          <div className="flex-col gap-2 self-stretch w-full flex-[0_0_auto] flex items-center relative">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <div className="relative w-6 h-6">
                <img
                  className="absolute w-[21px] h-6 top-0 left-0.5"
                  alt="Vector"
                  src="https://c.animaapp.com/mfa3eag73a5fU0/img/vector.svg"
                />
              </div>
            </div>

            <div className="relative self-stretch font-lg font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              Create Account
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="gap-[var(--collection-spacing-lg)] flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <InputField
                className="!self-stretch !flex-[0_0_auto] !w-full"
                frameClassName="!gap-2 ![justify-content:unset]"
                infoMessage={false}
                label="Username"
                property1="default"
                showRightIcon={false}
                text="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange("username")}
              />
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
                divClassName="!text-colors-light-500"
                icon={
                  <Property1LockSizeMedium className="!relative !w-[18px] !h-[18px]" />
                }
                label="Password"
                property1="default"
                text="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                errorMessage={errors.password}
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
                Sign Up
              </button>
            </div>
          </form>
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

          <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <img
                className="relative flex-1 grow h-px object-cover"
                alt="Line"
                src="https://c.animaapp.com/mfa3eag73a5fU0/img/line-608.svg"
              />
              <div className="relative w-fit mt-[-1.00px] font-body-small-reguler font-[number:var(--body-small-reguler-font-weight)] text-colors-light-1000 text-[length:var(--body-small-reguler-font-size)] tracking-[var(--body-small-reguler-letter-spacing)] leading-[var(--body-small-reguler-line-height)] whitespace-nowrap [font-style:var(--body-small-reguler-font-style)]">Or sign up with:</div>
              <img
                className="relative flex-1 grow h-px object-cover"
                alt="Line"
                src="https://c.animaapp.com/mfa3eag73a5fU0/img/line-608.svg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
              <Button
                label="Gmail"
                size="big"
                socialMediaIcons4Color="#4285F4"
                socialMediaIcons4Color1="#FBBC05"
                socialMediaIcons4Color2="#34A853"
                socialMediaIcons4Fill="#EA4335"
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
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Already have an account?
            </div>

            <Button
              label="Sign In"
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
