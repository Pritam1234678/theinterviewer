"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SetupStage } from "@/components/interview/SetupStage";
import { InterviewWorkspace } from "@/components/interview/InterviewWorkspace";
import { ResultStage } from "@/components/interview/ResultStage";
import { interviewAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { HamburgerButton } from "@/components/dashboard/HamburgerButton";
import { useCreditBalance } from "@/hooks/useCreditBalance";

type InterviewState = "SETUP" | "SESSION_START" | "LIVE" | "COMPLETED";

export default function InterviewPage() {
    const [stage, setStage] = useState<InterviewState>("SETUP");
    const [loading, setLoading] = useState(false);
    const [profileId, setProfileId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [report, setReport] = useState<any>(null);

    // Error handling state
    const [error, setError] = useState<string | null>(null);

    // Credit balance hook for instant refresh
    const { refetch: refetchCredits } = useCreditBalance();

    // Auto-dismiss error
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // 1. Handle Setup Completion -> Start Session
    const handleSetupComplete = async (profileData: any) => {
        setLoading(true);
        setError(null);
        try {
            const profileRes = await interviewAPI.createProfile({ ...profileData, resumeId: 0 });
            setProfileId(profileRes.id);

            const sessionRes = await interviewAPI.startInterview(profileRes.id);
            const newSessionId = sessionRes.sessionId;
            setSessionId(newSessionId);

            // Add timeout for question fetch
            const questionRes = await Promise.race([
                interviewAPI.getQuestion(newSessionId),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Question loading timeout")), 10000)
                )
            ]) as any;

            if (!questionRes || !questionRes.questionText) {
                throw new Error("Invalid question data received");
            }

            setCurrentQuestion(questionRes);
            setStage("LIVE");
        } catch (error: any) {
            console.error("Setup failed:", error);
            setError(error.message || "Failed to initialize session. Please try again.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Answer Submission
    const handleSubmitAnswer = async (answer: string) => {
        if (!sessionId || !currentQuestion) return;
        setLoading(true);
        setError(null);
        try {
            const response = await interviewAPI.submitAnswer(sessionId, currentQuestion.questionId, answer);

            // Validate nextQuestion response
            if (response.nextQuestion) {
                // Check if it's a different question
                if (response.nextQuestion.questionId !== currentQuestion.questionId) {
                    setCurrentQuestion(response.nextQuestion);
                } else {
                    // Same question ID, complete interview
                    await finishInterview();
                }
            } else {
                // No more questions, complete interview
                await finishInterview();
            }

        } catch (error: any) {
            console.error("Submission failed:", error);
            console.log("Full error details:", error);
            console.log("Response data:", error.response?.data);
            setError(error.message || "Failed to submit answer. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const finishInterview = async () => {
        if (!sessionId) return;
        try {
            await interviewAPI.completeInterview(sessionId);
            const reportData = await interviewAPI.getReport(sessionId);
            setReport(reportData);
            setStage("COMPLETED");

            // Instantly refresh credit balance after interview completion
            await refetchCredits();
        } catch (error) {
            console.error("Completion failed:", error);
            setError("Failed to generate report. Please try again.");
        }
    };

    const handleAbandonInterview = async () => {
        if (!sessionId) return;
        try {
            await interviewAPI.abandonInterview(sessionId);
            // Redirect to dashboard
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Abandon failed:", error);
            setError("Failed to exit interview. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#000000] text-white overflow-hidden relative">
            {/* Global noise & vignette */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90"></div>
            </div>

            {/* Custom Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/40 p-4 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-500">Error Occurred</h4>
                            <p className="text-xs text-red-200/80">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-2 rounded-lg p-1 text-red-400 hover:bg-red-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 flex h-full flex-col p-6">
                {/* Header - Minimal */}
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HamburgerButton />
                        <div className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></span>
                        </div>
                        <span className="text-xl font-bold uppercase tracking-widest bg-linear-to-r from-blue-400 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                            AI Interview Mode
                        </span>
                    </div>
                    {stage === "LIVE" && (
                        <button
                            onClick={handleAbandonInterview}
                            className="text-xs font-medium text-red-500 hover:text-red-400 transition-colors"
                        >
                            Exit Interview
                        </button>
                    )}
                </header>

                <main className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {stage === "SETUP" && (
                            <SetupStage key="setup" onComplete={handleSetupComplete} loading={loading} />
                        )}

                        {stage === "LIVE" && (
                            <InterviewWorkspace
                                key="workspace"
                                question={currentQuestion}
                                onSubmitAnswer={handleSubmitAnswer}
                                loading={loading}
                                onNextQuestion={() => { }} // Handle internal transition
                                sessionStatus={{}}
                            />
                        )}

                        {stage === "COMPLETED" && (
                            <ResultStage key="result" report={report} />
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
