"use client";

import React from "react";
import dynamic from "next/dynamic";

// We'll render the existing Vite/React-Router screens inside this Next page via a lightweight wrapper
const SignInApp = dynamic(() => import("./client/SignInClient"), { ssr: false });

export default function Page() {
  return <SignInApp />;
}

