"use client";
import React from "react";
import LoginForm from "./component/login-form";
import Image from "next/image";
import { AuthProvider } from "@/app/hooks/AuthContext";
// import AuthLayout from '../auth-layout';

const LoginPage = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-[#FFFBF3] overflow-hidden md:overflow-hidden">
        <div
          className="flex grow flex-col gap-4 md:flex-row"
          style={{ height: "100vh" }}
        >
          <div className="flex items-center justify-center p-12 md:w-3/5">
            <Image
              src="/LG.png"
              width={523}
              height={679}
              alt="Login Image"
            ></Image>
          </div>
          <div className="flex flex-col justify-center gap-6 rounded-lg px-12 py-12 md:w-2/5">
            <LoginForm />
          </div>
        </div>
        <style jsx>{`
          @media (max-width: 768px) {
            .overflow-hidden {
              overflow: auto; /* Allow scrolling on smaller screens */
            }
          }
          @media (min-width: 768px) {
            .overflow-hidden {
              overflow: hidden; /* Prevent scrolling on larger screens */
            }
          }
        `}</style>
      </div>
    </AuthProvider>
  );
};

export default LoginPage;
