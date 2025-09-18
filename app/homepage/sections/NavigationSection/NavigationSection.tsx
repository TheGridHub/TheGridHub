import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const NavigationSection = (): JSX.Element => {
  const navigationItems = [
    { label: "About", href: "/#about" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/#blog" },
  ];

  return (
    <nav className="flex items-center justify-between px-20 py-6 w-full bg-white translate-y-[-1rem] animate-fade-in opacity-0">
      <Link href="/">
        <img
          className="w-[220px] h-[35px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
          alt="Logo"
          src="/images/logo.svg"
        />
      </Link>

      <div className="flex items-center gap-10 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        {navigationItems.map((item) => (
          <Link key={item.label} href={item.href} className="h-auto p-0 font-body-base-regular font-[number:var(--body-base-regular-font-weight)] text-black text-[length:var(--body-base-regular-font-size)] tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] [font-style:var(--body-base-regular-font-style)] hover:text-gray-600 transition-colors">
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <Link href="/sign-in" className="h-auto px-3 py-2 font-body-base-underlined font-[number:var(--body-base-underlined-font-weight)] text-black text-[length:var(--body-base-underlined-font-size)] tracking-[var(--body-base-underlined-letter-spacing)] leading-[var(--body-base-underlined-line-height)] underline [font-style:var(--body-base-underlined-font-style)] hover:text-gray-600 transition-colors">
          Log in
        </Link>

        <Link href="/sign-up" className="h-auto gap-2 px-3 py-2 bg-[#873bff] text-white font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)] shadow-[0px_0px_0px_4px_#0000000a,inset_0px_10px_12px_#ffffff42] border-none rounded hover:bg-[#7a35e6] transition-colors inline-flex items-center justify-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded before:[background:linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.07)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          Get Started
        </Link>
      </div>
    </nav>
  );
};
