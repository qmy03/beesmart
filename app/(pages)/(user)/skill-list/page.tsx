"use client";
import SkillListPage from "@/app/components/user/SkillList/skill-list-page";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function SkillList() {
    return (
        <>
        <AuthProvider>
            <SkillListPage/>
        </AuthProvider>
        </>
    )
}