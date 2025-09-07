import { GlobeIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 px-4 sm:px-6 md:pl-20 md:pr-0 py-8 md:py-0 self-stretch w-full z-[7] bg-white shadow-[0px_4px_200px_#e8f9f733] overflow-hidden">
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-10 md:opacity-100 pointer-events-none select-none"
        alt="Pattern"
        src="/images/migrated-homepage/pattern.svg"
      />

      <div className="flex flex-col w-full md:w-[624px] items-start gap-6 md:gap-9 relative bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-0 rounded-xl md:rounded-none p-4 md:p-0">
        <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
          {/* Compact mobile heading */}
          <h1 className="md:hidden text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight translate-y-[-1rem] animate-fade-in opacity-0">
            Dedicated to teams. Growth without the limits.
          </h1>

          {/* Original desktop heading */}
          <h1 className="hidden md:block relative self-stretch mt-[-2.00px] ml-[-1.00px] [-webkit-text-stroke:1px_#000000] font-display-display-1 font-[number:var(--display-display-1-font-weight)] text-black text-[length:var(--display-display-1-font-size)] tracking-[var(--display-display-1-letter-spacing)] leading-[var(--display-display-1-line-height)] [font-style:var(--display-display-1-font-style)] translate-y-[-1rem] animate-fade-in opacity-0">
            Dedicated to teams. Growth without the limits.
          </h1>

          {/* Compact mobile subheading */}
          <p className="md:hidden text-base sm:text-lg text-gray-600 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            Streamline Operations, Boost Efficiency, and Drive Growth
          </p>

          {/* Original desktop subheading */}
          <p className="hidden md:block relative self-stretch font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-[#717171] text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            Streamline Operations, Boost Efficiency, and Drive Growth
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-8 relative self-stretch w-full flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:300ms]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm sm:text-base text-[#717171]">
                No credit card
              </span>
            </div>

            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm sm:text-base text-[#717171]">
                No time limit
              </span>
            </div>

            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm sm:text-base text-[#717171]">
                Full API access
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-wrap items-center justify-start md:justify-center gap-3 sm:gap-4 relative flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <Button className="gap-2 px-[18px] py-3 bg-[#873bff] overflow-hidden border-[none] shadow-[0px_0px_0px_4px_#0000000a,inset_0px_10px_12px_#ffffff42] inline-flex items-center justify-center relative flex-[0_0_auto] rounded before:content-[''] before:absolute before:inset-0 before:p-px before:rounded before:[background:linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.07)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#7a35e6] transition-colors h-auto">
              <span className="w-[102px] h-6 mt-[-1.00px] text-white text-[length:var(--body-extra-large-medium-font-size)] leading-[var(--body-extra-large-medium-line-height)] relative font-body-extra-large-medium font-[number:var(--body-extra-large-medium-font-weight)] tracking-[var(--body-extra-large-medium-letter-spacing)] whitespace-nowrap [font-style:var(--body-extra-large-medium-font-style)]">
                Get Started
              </span>
            </Button>

            <Button
              variant="outline"
              className="gap-2 px-[18px] py-3 mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-white border border-solid border-black inline-flex items-center justify-center relative flex-[0_0_auto] rounded hover:bg-gray-50 transition-colors h-auto"
            >
              <span className="w-fit mt-[-0.50px] text-black text-[length:var(--body-extra-large-medium-font-size)] leading-[var(--body-extra-large-medium-line-height)] relative font-body-extra-large-medium font-[number:var(--body-extra-large-medium-font-weight)] tracking-[var(--body-extra-large-medium-letter-spacing)] whitespace-nowrap [font-style:var(--body-extra-large-medium-font-style)]">
                Learn More
              </span>
            </Button>
          </div>

          <div className="gap-2 px-3 py-0 inline-flex items-center justify-center relative flex-[0_0_auto] rounded translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
            <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-transparent text-sm tracking-[0] leading-[14px]">
              <span className="text-[#717171] leading-[var(--body-base-regular-line-height)] font-body-base-regular [font-style:var(--body-base-regular-font-style)] font-[number:var(--body-base-regular-font-weight)] tracking-[var(--body-base-regular-letter-spacing)] text-[length:var(--body-base-regular-font-size)]">
                Used and helping over more
              </span>

              <span className="font-medium text-black leading-[21px]"> 2</span>

              <span className="font-semibold text-black leading-[21px]">
                0+ Companies
              </span>
            </div>

            <GlobeIcon className="relative w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Mobile image preview */}
      <div className="w-full md:hidden translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <img
          src="/images/migrated-homepage/image-194.png"
          alt="Dashboard interface mockup"
          className="w-full rounded-2xl border border-[#e4e4e4] shadow-lg"
        />
      </div>

      {/* Desktop framed mockup */}
      <div className="hidden md:block relative w-full md:w-[704px] h-[360px] md:h-[680px] rounded-3xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
        <div className="relative w-[896px] h-[627px] top-[63px] -left-px bg-white rounded-[14px] overflow-hidden border-[1.43px] border-solid border-[#e4e4e4] shadow-[0px_41.59px_48.76px_4.3px_#efeff47a]">
          <div className="absolute w-[895px] h-[37px] top-0 left-0 bg-white rounded-[13.51px_13.51px_0px_0px] border-[0.84px] border-solid border-[#e8ecf3]">
            <div className="relative w-11 h-2.5 top-[17px] left-[18px]">
              <img
                className="absolute w-2.5 h-2.5 top-0 left-0"
                alt="Close"
                src="/images/migrated-homepage/close.svg"
              />

              <img
                className="absolute w-2.5 h-2.5 top-0 left-[17px]"
                alt="Minimize"
                src="/images/migrated-homepage/minimize.svg"
              />

              <img
                className="absolute w-2.5 h-2.5 top-0 left-[34px]"
                alt="Fullscreen"
                src="/images/migrated-homepage/fullscreen.svg"
              />
            </div>
          </div>

          <img
            className="w-[704px] h-[579px] top-[37px] left-0 absolute object-cover"
            alt="Dashboard interface mockup"
            src="/images/migrated-homepage/image-194.png"
          />
        </div>
      </div>

      <div className="absolute w-[1440px] h-[120px] top-[560px] left-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_100%)]" />

    </section>
  );
};
