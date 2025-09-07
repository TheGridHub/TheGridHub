import React from "react";

export const SocialProofSection = (): JSX.Element => {
  return (
    <section className="flex w-full items-center justify-center gap-8 px-4 sm:px-6 md:px-20 py-16 md:py-24 relative bg-white backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
      <div className="flex flex-col w-full max-w-[720px] items-start md:items-start gap-4 relative">
        <h2 className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] relative self-stretch mt-[-1.00px] font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-black text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)]">
          Partners By Established Companies
        </h2>

        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] relative w-full max-w-[520px] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#873bff] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-body-extra-large-regular font-[number:var(--body-extra-large-regular-font-weight)] text-[#717171] text-[length:var(--body-extra-large-regular-font-size)] tracking-[var(--body-extra-large-regular-letter-spacing)] leading-[var(--body-extra-large-regular-line-height)] [font-style:var(--body-extra-large-regular-font-style)]">
              Task & Project Management
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#873bff] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-body-extra-large-regular font-[number:var(--body-extra-large-regular-font-weight)] text-[#717171] text-[length:var(--body-extra-large-regular-font-size)] tracking-[var(--body-extra-large-regular-letter-spacing)] leading-[var(--body-extra-large-regular-line-height)] [font-style:var(--body-extra-large-regular-font-style)]">
              Built-in Time Tracking
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#873bff] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.9999 15.6182 20.2 15.4386" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8003 3.30948 17.5037 3.75142 18.0098 4.39841C18.5159 5.04541 18.8004 5.85581 18.8004 6.69141C18.8004 7.527 18.5159 8.3374 18.0098 8.9844C17.5037 9.6314 16.8003 10.0733 16 10.2528" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-body-extra-large-regular font-[number:var(--body-extra-large-regular-font-weight)] text-[#717171] text-[length:var(--body-extra-large-regular-font-size)] tracking-[var(--body-extra-large-regular-letter-spacing)] leading-[var(--body-extra-large-regular-line-height)] [font-style:var(--body-extra-large-regular-font-style)]">
              Real-time Team Collaboration and More.
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 grow h-12" />
    </section>
  );
};
