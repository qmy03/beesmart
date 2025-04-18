"use client";
import BattleDetailPage from "@/app/components/user/BattleDetail/battle-detail";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function BattleDetail() {
    return (
        <>
        <AuthProvider>
            <BattleDetailPage/>
        </AuthProvider>
        </>
    )
}