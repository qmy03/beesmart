"use client";
import SkillDetailPage from "@/app/components/user/SkillDetail/skill-detail";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function SkillDetail() {
    return (
        <>
        <AuthProvider>
            <SkillDetailPage/>
        </AuthProvider>
        </>
    )
}