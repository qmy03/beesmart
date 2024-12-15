"use client";
import HomePage from "./component/home-page";
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