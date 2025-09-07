import React from "react";
import { CallToActionSection } from "./sections/CallToActionSection/CallToActionSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { NavigationSection } from "./sections/NavigationSection/NavigationSection";
import { SocialProofSection } from "./sections/SocialProofSection/SocialProofSection";
import { TestimonialSection } from "./sections/TestimonialSection/TestimonialSection";

export const Homepage = (): JSX.Element => {
  return (
    <div
      className="flex flex-col items-start relative bg-[#f9f9f9]"
      data-model-id="691:106681"
    >
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] w-full">
        <NavigationSection />
      </div>
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] w-full">
        <HeroSection />
      </div>
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] w-full">
        <SocialProofSection />
      </div>
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms] w-full">
        <TestimonialSection />
      </div>
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms] w-full">
        <CallToActionSection />
      </div>
      <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms] w-full">
        <FooterSection />
      </div>
    </div>
  );
};
