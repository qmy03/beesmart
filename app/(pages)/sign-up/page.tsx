"use client";
import React from "react";
import SignUpForm from "./component/sign-up-form";
import AuthLayout from "../auth-layout";
import { AuthProvider } from "@/app/hooks/AuthContext";
import Image from "next/image";

const SignUp = () => {
  return (
    <AuthProvider>
      <SignUpForm />
    </AuthProvider>
  );
};

export default SignUp;
