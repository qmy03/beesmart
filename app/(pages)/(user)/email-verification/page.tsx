"use client";
import React from "react";
import EmailVerification from "./component/email-verification-page";
import Image from "next/image";
import { AuthProvider } from "@/app/hooks/AuthContext";
// import AuthLayout from '../auth-layout';

const LoginPage = () => {
  return (
    <AuthProvider>
      <EmailVerification />
    </AuthProvider>
  );
};

export default LoginPage;