"use client";
import AccountPage from "@/app/components/user/Account/account-page";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function Account() {
    return (
        <>
        <AuthProvider>
            <AccountPage/>
        </AuthProvider>
        </>
    )
}