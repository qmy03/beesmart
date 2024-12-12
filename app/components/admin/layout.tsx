import React from "react";
import Sidebar from "./side-bar";
import { AuthProvider } from "@/app/hooks/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 px-3 bg-white overflow-y-auto">{children}</main>
    </div>
    </AuthProvider>
  );
};

export default Layout;
