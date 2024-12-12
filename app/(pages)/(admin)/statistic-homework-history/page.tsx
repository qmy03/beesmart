"use client";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import { Box, Typography } from "@mui/material";
import React from "react";
import StatisticHomeworkHistory from "./component/user-page";
const Page = () => {
  return (
    <AuthProvider>
      <StatisticHomeworkHistory/>
    </AuthProvider>
  );
};

export default Page;