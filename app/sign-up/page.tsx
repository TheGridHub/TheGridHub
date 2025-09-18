"use client";

import React from "react";
import dynamic from "next/dynamic";

const SignUpApp = dynamic(() => import("./client/SignUpClient"), { ssr: false });

export default function Page() {
  return <SignUpApp />;
}

