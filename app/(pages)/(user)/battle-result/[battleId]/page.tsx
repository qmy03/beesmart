"use client";
import BattleResultPage from "@/app/components/user/BattleResult/battle-result";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function BattleDetail() {
    return (
        <>
        <AuthProvider>
            <BattleResultPage/>
        </AuthProvider>
        </>
    )
}