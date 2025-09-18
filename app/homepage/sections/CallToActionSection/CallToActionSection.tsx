import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CallToActionSection = (): JSX.Element => {
  return (
    <section className="flex flex-col items-center gap-12 px-0 py-6 self-stretch w-full z-[1] bg-[#873bff] justify-center relative flex-[0_0_auto]">
      <img
        className="absolute w-[1440px] h-[346px] top-px left-0"
        alt="Layer"
        src="/images/migrated-homepage/layer-1.svg"
      />

      <div className="flex flex-col items-center gap-10 px-0 py-14 relative self-stretch w-full flex-[0_0_auto] rounded translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
        <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative self-stretch mt-[-1.00px] font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-white text-[length:var(--heading-desktop-h2-font-size)] text-center tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            Take Your Business to the Next Level
          </h2>

          <p className="relative self-stretch font-body-large-regular font-[number:var(--body-large-regular-font-weight)] text-white text-[length:var(--body-large-regular-font-size)] text-center tracking-[var(--body-large-regular-letter-spacing)] leading-[var(--body-large-regular-line-height)] [font-style:var(--body-large-regular-font-style)] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            Dive into the advantages of our CRM platform and witness the impact
            on your business.
          </p>
        </div>

        <div className="inline-flex items-start gap-3 justify-center relative flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <Button asChild className="gap-2 px-[18px] py-3 bg-white inline-flex items-center justify-center relative flex-[0_0_auto] rounded h-auto hover:bg-gray-100 transition-colors">
            <Link href="/sign-up" className="w-[102px] h-6 mt-[-0.50px] text-black text-[length:var(--body-extra-large-medium-font-size)] leading-[var(--body-extra-large-medium-line-height)] font-body-extra-large-medium font-[number:var(--body-extra-large-medium-font-weight)] tracking-[var(--body-extra-large-medium-letter-spacing)] whitespace-nowrap [font-style:var(--body-extra-large-medium-font-style)]">
              Get Started
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="gap-2.5 px-[18px] py-3 inline-flex items-center justify-center relative flex-[0_0_auto] rounded h-auto hover:bg-white/10 transition-colors"
          >
            <span className="w-fit mt-[-1.00px] text-white text-[length:var(--body-extra-large-underlined-font-size)] leading-[var(--body-extra-large-underlined-line-height)] underline font-body-extra-large-underlined font-[number:var(--body-extra-large-underlined-font-weight)] tracking-[var(--body-extra-large-underlined-letter-spacing)] whitespace-nowrap [font-style:var(--body-extra-large-underlined-font-style)]">
              Request a Demo
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};
