"use client";
import { AuthProvider } from "@/app/hooks/AuthContext";
import DashboardReportPage from "./component/dashboard-report-page";

export default function Home() {
    return (
        <>
        <AuthProvider>
            <DashboardReportPage/>
        </AuthProvider>
        </>
    )
}