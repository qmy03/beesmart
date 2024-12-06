import React from "react";
import Sidebar from "./side-bar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 px-3 bg-white overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout;
