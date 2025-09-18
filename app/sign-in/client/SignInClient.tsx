"use client";

import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SignIn } from "@/app/signIn-signup/src/screens/SignIn";
import { EmailVerification } from "@/app/signIn-signup/src/screens/EmailVerification";
import { SignUp } from "@/app/signIn-signup/src/screens/SignUp";
import { PasswordResetScreen } from "@/app/signIn-signup/src/screens/PasswordResetScreen";
import { SetNewPassword } from "@/app/signIn-signup/src/screens/SetNewPassword";
import { PasswordReset } from "@/app/signIn-signup/src/screens/PasswordReset";
import { SuccessConfirmation } from "@/app/signIn-signup/src/screens/SuccessConfirmation";

export default function SignInClient() {
  return (
    <MemoryRouter initialEntries={["/sign-in"]}>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/password-reset-request" element={<PasswordResetScreen />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/password-reset-success-confirmation" element={<PasswordReset />} />
        <Route path="/success-confirmation-page" element={<SuccessConfirmation />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<SignIn />} />
      </Routes>
    </MemoryRouter>
  );
}

