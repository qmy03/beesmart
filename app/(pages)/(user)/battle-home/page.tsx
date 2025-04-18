"use client";
import BattlePage from "@/app/components/user/BattleHome/battle-home-page";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function BattleHome() {
    return (
        <>
        <AuthProvider>
            <BattlePage/>
        </AuthProvider>
        </>
    )
}