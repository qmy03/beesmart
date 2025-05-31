"use client";

import { AuthProvider } from "@/app/hooks/AuthContext";
import React from "react";
import GradePage from "./component/grade-page";
const Page = () => {
  return (
    <AuthProvider>
      <GradePage/>
    </AuthProvider>
  );
};

export default Page;
