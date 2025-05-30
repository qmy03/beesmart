"use client";

import BattleDetailPage from "@/app/components/user/Battle/battle";
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