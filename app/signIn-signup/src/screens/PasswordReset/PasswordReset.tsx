import React from "react";
import { Button } from "../../components/Button";
import { Property1SmileSizeBig } from "../../icons/Property1SmileSizeBig";

export const PasswordReset = (): JSX.Element => {
  return (
    <div
className="flex flex-col min-h-screen gap-[21px] p-6 bg-white items-center justify-center relative"
      data-model-id="18:2166"
    >
      <div className="justify-around gap-[21px] self-stretch w-full flex items-center relative flex-1 grow">
        <div className="flex-col min-w-80 max-w-[480px] gap-[var(--collection-spacing-xl)] pt-[var(--collection-spacing-xl)] pr-[var(--collection-spacing-xxl)] pb-[var(--collection-spacing-xl)] pl-[var(--collection-spacing-xxl)] rounded-3xl flex items-center relative flex-1 grow">
          <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex w-11 h-11 items-center justify-center gap-2 p-2.5 relative bg-colors-primary-100 rounded-lg">
              <Property1SmileSizeBig
                className="!relative !w-6 !h-6"
                color="#C5E152"
              />
            </div>

            <div className="self-stretch font-[number:var(--lg-font-weight)] text-colors-light-1000 text-[length:var(--lg-font-size)] relative font-lg text-center tracking-[var(--lg-letter-spacing)] leading-[var(--lg-line-height)] [font-style:var(--lg-font-style)]">
              Password Reset Successful
            </div>

            <div className="w-fit font-[number:var(--md-font-weight)] text-colors-light-500 text-[length:var(--md-font-size)] relative font-md text-center tracking-[var(--md-letter-spacing)] leading-[var(--md-line-height)] [font-style:var(--md-font-style)]">
              You&#39;re good to go!
            </div>
          </div>

          <Button
            label="Sign in"
            showIcon={false}
            size="big"
            stateProp="default"
            to="/sign-in"
            type="primary"
          />
          <div className="inline-flex items-center justify-center gap-1 relative flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] font-sm font-[number:var(--sm-font-weight)] text-colors-light-500 text-[length:var(--sm-font-size)] tracking-[var(--sm-letter-spacing)] leading-[var(--sm-line-height)] whitespace-nowrap [font-style:var(--sm-font-style)]">
              Use your new password to access your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
