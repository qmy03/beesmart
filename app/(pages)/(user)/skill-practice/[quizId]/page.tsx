"use client";
import SkillPracticePage from "@/app/components/user/SkillPractice/skill-practice-page";
import { AuthProvider } from "@/app/hooks/AuthContext";

export default function SkillDetail() {
    return (
        <>
        <AuthProvider>
            <SkillPracticePage/>
        </AuthProvider>
        </>
    )
}