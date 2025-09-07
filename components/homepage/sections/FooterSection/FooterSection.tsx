import React from "react";

const footerData = {
  pages: ["About Us", "Features", "Product", "Pricing"],
  company: ["Careers", "Guide", "Startup Program"],
  support: ["Help Center", "Customer Support", "API Docs", "System Status"],
  resources: ["FAQ", "Blog", "Privacy Policy", "Terms of Service"],
};

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="flex flex-col items-start gap-10 md:gap-14 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[120px] py-12 md:py-16 relative self-stretch w-full flex-[0_0_auto] z-0 bg-white translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
      <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="hidden md:block relative flex-1 self-stretch grow translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
          alt="Frame"
          src="/images/migrated-homepage/frame-48233.svg"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-start relative flex-[0_0_auto]">
          <div className="flex flex-col w-[200px] items-start gap-4 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <div className="relative w-fit mt-[-1.00px] font-body-extra-large-semibold font-[number:var(--body-extra-large-semibold-font-weight)] text-black text-[length:var(--body-extra-large-semibold-font-size)] tracking-[var(--body-extra-large-semibold-letter-spacing)] leading-[var(--body-extra-large-semibold-line-height)] whitespace-nowrap [font-style:var(--body-extra-large-semibold-font-style)]">
              Pages
            </div>

            <nav className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
              {footerData.pages.map((item, index) => (
                <a
                  key={`pages-${index}`}
                  href="/"
                  className="relative w-fit font-body-large-regular font-[number:var(--body-large-regular-font-weight)] text-[#717171] text-[length:var(--body-large-regular-font-size)] tracking-[var(--body-large-regular-letter-spacing)] leading-[var(--body-large-regular-line-height)] whitespace-nowrap [font-style:var(--body-large-regular-font-style)] hover:text-black transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col w-[200px] items-start gap-4 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
            <div className="relative w-fit mt-[-1.00px] font-body-extra-large-semibold font-[number:var(--body-extra-large-semibold-font-weight)] text-black text-[length:var(--body-extra-large-semibold-font-size)] tracking-[var(--body-extra-large-semibold-letter-spacing)] leading-[var(--body-extra-large-semibold-line-height)] whitespace-nowrap [font-style:var(--body-extra-large-semibold-font-style)]">
              Company
            </div>

            <nav className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
              {footerData.company.map((item, index) => (
                <a
                  key={`company-${index}`}
                  href="/"
                  className="relative w-fit font-body-large-regular font-[number:var(--body-large-regular-font-weight)] text-[#717171] text-[length:var(--body-large-regular-font-size)] tracking-[var(--body-large-regular-letter-spacing)] leading-[var(--body-large-regular-line-height)] whitespace-nowrap [font-style:var(--body-large-regular-font-style)] hover:text-black transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col w-[200px] items-start gap-4 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
            <div className="relative w-fit mt-[-1.00px] font-body-extra-large-semibold font-[number:var(--body-extra-large-semibold-font-weight)] text-black text-[length:var(--body-extra-large-semibold-font-size)] tracking-[var(--body-extra-large-semibold-letter-spacing)] leading-[var(--body-extra-large-semibold-line-height)] whitespace-nowrap [font-style:var(--body-extra-large-semibold-font-style)]">
              Support
            </div>

            <nav className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
              {footerData.support.map((item, index) => (
                <a
                  key={`support-${index}`}
                  href="/"
                  className="relative w-fit font-body-large-regular font-[number:var(--body-large-regular-font-weight)] text-[#717171] text-[length:var(--body-large-regular-font-size)] tracking-[var(--body-large-regular-letter-spacing)] leading-[var(--body-large-regular-line-height)] whitespace-nowrap [font-style:var(--body-large-regular-font-style)] hover:text-black transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col w-[200px] items-start gap-4 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms]">
            <div className="relative w-fit mt-[-1.00px] font-body-extra-large-semibold font-[number:var(--body-extra-large-semibold-font-weight)] text-black text-[length:var(--body-extra-large-semibold-font-size)] tracking-[var(--body-extra-large-semibold-letter-spacing)] leading-[var(--body-extra-large-semibold-line-height)] whitespace-nowrap [font-style:var(--body-extra-large-semibold-font-style)]">
              Resources
            </div>

            <nav className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
              {footerData.resources.map((item, index) => (
                <a
                  key={`resources-${index}`}
                  href="/"
                  className="relative w-fit font-body-large-regular font-[number:var(--body-large-regular-font-weight)] text-[#717171] text-[length:var(--body-large-regular-font-size)] tracking-[var(--body-large-regular-letter-spacing)] leading-[var(--body-large-regular-line-height)] whitespace-nowrap [font-style:var(--body-large-regular-font-style)] hover:text-black transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="relative self-stretch font-body-base-regular font-[number:var(--body-base-regular-font-weight)] text-transparent text-[length:var(--body-base-regular-font-size)] text-center tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] [font-style:var(--body-base-regular-font-style)] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1200ms]">
        <span className="text-[#aeaeae] font-body-base-regular [font-style:var(--body-base-regular-font-style)] font-[number:var(--body-base-regular-font-weight)] tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] text-[length:var(--body-base-regular-font-size)]">
          ©2025.{" "}
        </span>

        <span className="text-[#873bff] font-body-base-regular [font-style:var(--body-base-regular-font-style)] font-[number:var(--body-base-regular-font-weight)] tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] text-[length:var(--body-base-regular-font-size)]">
          TheGridHub Ltd
        </span>

        <span className="text-[#aeaeae] font-body-base-regular [font-style:var(--body-base-regular-font-style)] font-[number:var(--body-base-regular-font-weight)] tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] text-[length:var(--body-base-regular-font-size)]">
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

