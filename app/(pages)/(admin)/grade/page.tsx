"use client";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import { Box, Typography } from "@mui/material";
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
