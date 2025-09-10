import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { EmailVerification } from "./screens/EmailVerification";
import { PasswordReset } from "./screens/PasswordReset";
import { PasswordResetScreen } from "./screens/PasswordResetScreen";
import { SetNewPassword } from "./screens/SetNewPassword";
import { SignIn } from "./screens/SignIn";
import { SignUp } from "./screens/SignUp";
import { SuccessConfirmation } from "./screens/SuccessConfirmation";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <SignUp />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/email-verification",
    element: <EmailVerification />,
  },
  {
    path: "/set-new-password",
    element: <SetNewPassword />,
  },
  {
    path: "/password-reset-success-confirmation",
    element: <PasswordReset />,
  },
  {
    path: "/password-reset-request",
    element: <PasswordResetScreen />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/success-confirmation-page",
    element: <SuccessConfirmation />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
