import React from "react";
import Sidebar from "./side-bar";
import { useAuth } from "@/app/hooks/AuthContext";
import ProgressOverlay from "../progress-Overlay";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 px-3 bg-white overflow-y-auto">{children}</main>
      <ProgressOverlay />
    </div>
  );
};

export default Layout;