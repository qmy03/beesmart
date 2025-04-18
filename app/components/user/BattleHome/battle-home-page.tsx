"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";

export default function BattlePage() {
    const { accessToken, userInfo } = useAuth();
    const router = useRouter();
    const [matching, setMatching] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [error, setError] = useState('');
    const socketRef = useRef<WebSocket | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch subjects and grades on mount
    useEffect(() => {
        if (!accessToken) return;

        const fetchData = async () => {
            try {
                const [subjectsRes, gradesRes] = await Promise.all([
                    apiService.get('/subjects', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }),
                    apiService.get('/grades', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                ]);

                const fetchedSubjects = subjectsRes.data?.data?.subjects || [];
                const fetchedGrades = gradesRes.data?.data?.grades || [];

                setSubjects(fetchedSubjects);
                console.log("Subjects:", fetchedSubjects);
                setGrades(fetchedGrades);

                if (fetchedSubjects.length > 0) {
                    setSelectedSubject(fetchedSubjects[0].subjectId);
                }
                if (fetchedGrades.length > 0) {
                    setSelectedGrade(fetchedGrades[0].gradeId);
                }

            } catch (err) {
                console.error("❌ Error fetching subjects/grades:", err);
                setError("Could not load subjects and grades. Please try again later.");
            }
        };

        fetchData();
    }, [accessToken]);

    // Handle countdown
    useEffect(() => {
        if (matching) {
            intervalRef.current = setInterval(() => {
                setCountdown(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current as NodeJS.Timeout);
        }

        return () => clearInterval(intervalRef.current as NodeJS.Timeout);
    }, [matching]);

    // Cleanup socket on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const startMatching = () => {
        if (!accessToken || !userInfo?.userId) {
            setError("You must be logged in to join a battle.");
            return;
        }

        if (!selectedSubject || !selectedGrade) {
            setError("Please select both a subject and a grade.");
            return;
        }

        setError('');
        setMatching(true);
        setCountdown(0);

        const socket = new WebSocket(
            `ws://localhost:8080/ws/battle?userId=${userInfo.userId}&subjectId=${selectedSubject}&gradeId=${selectedGrade}&token=${accessToken}`
        );

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("🔗 WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "START") {
                    router.push(`/battle-detail/${msg.battleId}`);
                } else if (msg.type === "STATUS") {
                    console.log("🟡 Status:", msg.message);
                }
            } catch (err) {
                console.error("💥 Failed to parse WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
            setError("Connection error. Please try again.");
            setMatching(false);
        };

        socket.onclose = () => {
            console.log("🔌 WebSocket disconnected");
            setMatching(false);
        };
    };

    const cancelMatching = () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
        setMatching(false);
        setCountdown(0);
    };

    return (
        <Layout>
            <div className="p-6 max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold">Battle Mode</h1>

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            {subjects.map(subject => (
                                <option key={subject.subjectId} value={subject.subjectId}>
                                    {subject.subjectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Grade</label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            {grades.map(grade => (
                                <option key={grade.gradeId} value={grade.gradeId}>
                                    {grade.gradeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!matching ? (
                        <Button onClick={startMatching}>Start Matching</Button>
                    ) : (
                        <>
                            <div className="text-blue-600 font-semibold">
                                Matching... {countdown}s
                            </div>
                            <Button onClick={cancelMatching} variant="destructive">
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
