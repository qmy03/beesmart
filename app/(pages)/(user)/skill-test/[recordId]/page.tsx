"use client";
import SkillTestPage from "@/app/components/user/SkillTest/skill-test";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function SkillList() {
    return (
        <>
        <AuthProvider>
            <SkillTestPage/>
        </AuthProvider>
        </>
    )
}