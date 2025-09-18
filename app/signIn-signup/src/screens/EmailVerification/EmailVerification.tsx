import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { InputIcons8 } from "../../icons/InputIcons8";

export const EmailVerification = (): JSX.Element => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [displayedEmail, setDisplayedEmail] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    const emailFromStorage = localStorage.getItem('userEmailForVerification');
    if (emailFromStorage) {
      setDisplayedEmail(emailFromStorage);
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const isFormValid = () => {
    return verificationCode.every(digit => digit.trim() !== '') && verificationCode.length === 6;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    console.log("Verification code submitted:", code);
    
    if (code.length === 6) {
      navigate("/sign-in");
    }
  };

  const handleResendCode = () => {
    console.log("Resending verification code");
    setVerificationCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div
      className="flex flex-col h-[832px] items-center justify-center gap-[21px] p-6 relative bg-colors-dark-1000"
      data-model-id="16:1672"
    >
      <div className="flex flex-col min-w-80 max-w-[520px] items-center gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] relative w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
            <InputIcons8 className="!relative !w-6 !h-6" color="#C5E152" />
          </div>

          <div className="self-stretch font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
            Verify Your Mail
          </div>

          <p className="w-fit font-[number:var(--md-font-weight)] text-colors-light-500 text-[length:var(--md-font-size)] relative font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
            <span className="text-[#ffffff80] font-md [font-style:var(--md-font-style)] font-[number:var(--md-font-weight)] tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] text-[length:var(--md-font-size)]">
              We've sent a 6-digit code to{" "}
            </span>

            <span className="text-white font-md [font-style:var(--md-font-style)] font-[number:var(--md-font-weight)] tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] text-[length:var(--md-font-size)]">
              {displayedEmail || "your email"}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Enter the code below
            </div>

            <div className="flex items-start justify-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
              {verificationCode.map((digit, index) => (
                <div key={index} className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative rounded-lg border border-solid border-colors-light-100">
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-full h-full bg-transparent border-none outline-none text-center text-colors-light-1000 text-base"
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-500 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Didn't get the email?
            </div>

            <button
              type="button"
              onClick={handleResendCode}
              className="text-colors-primary-1000 hover:text-colors-primary-500 text-sm font-normal transition-colors duration-200"
            >
              Resend code
            </button>
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
            Verify email
          </button>
        </form>
        <p className="relative self-stretch font-xs font-[number:var(--xs-font-weight)] text-colors-light-500 text-[length:var(--xs-font-size)] text-center tracking-[var(--xs-letter-spacing)] leading-[var(--xs-line-height)] [font-style:var(--xs-font-style)]">
          Check your spam folder if you don’t see it soon.
        </p>
      </div>
    </div>
  );
};
