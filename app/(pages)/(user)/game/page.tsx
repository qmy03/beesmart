"use client";
import HomePage from "@/app/components/user/Home/home-page";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function Home() {
    return (
        <>
        <AuthProvider>
            <HomePage/>
        </AuthProvider>
        </>
    )
}