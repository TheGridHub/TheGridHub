import React, { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import { Property1SmileSizeBig } from "../../icons/Property1SmileSizeBig";

export const SuccessConfirmation = (): JSX.Element => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('registeredUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div
className="flex flex-col min-h-screen items-center justify-center gap-[21px] p-6 relative bg-white"
      data-model-id="24:180"
    >
      <div className="justify-around gap-[21px] self-stretch w-full flex items-center relative flex-1 grow">
        <div className="flex-col min-w-80 max-w-[520px] gap-6 pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] rounded-3xl flex items-center relative flex-1 grow">
          <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <Property1SmileSizeBig
                className="!relative !w-6 !h-6"
                color="#C5E152"
              />
            </div>

            <div className="self-stretch font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              You&#39;re All Set!
            </div>

            <p className="w-fit font-[number:var(--md-font-weight)] text-colors-light-500 text-[length:var(--md-font-size)] relative font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
              <span className="text-[#ffffff80] font-md [font-style:var(--md-font-style)] font-[number:var(--md-font-weight)] tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] text-[length:var(--md-font-size)]">
                Welcome aboard,{" "}
              </span>

              <span className="text-white font-md [font-style:var(--md-font-style)] font-[number:var(--md-font-weight)] tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] text-[length:var(--md-font-size)]">
                {username || "[First Name]"}
              </span>

              <span className="text-[#ffffff80] font-md [font-style:var(--md-font-style)] font-[number:var(--md-font-weight)] tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] text-[length:var(--md-font-size)]">
                ! Let’s get started.
              </span>
            </p>
          </div>

          <Button
            label="Complete my profile"
            showIcon={false}
            size="big"
            stateProp="default"
            type="primary"
          />
          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-1000 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Want to create a new account?
            </p>

            <Button
              label="Sign Up"
              showIcon={false}
              size="small"
              stateProp="default"
              to="/sign-up"
              type="tertiary"
              typeSecondaryStateClassName="!flex-[0_0_auto]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
