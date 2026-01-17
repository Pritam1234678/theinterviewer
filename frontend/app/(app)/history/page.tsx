"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { historyAPI, ResumeHistoryItem, InterviewHistoryItem } from "@/lib/api";
import { HistoryCard } from "@/components/history/HistoryCard";
import DashboardHeader from "@/components/dashboard/Header";
import { HamburgerButton } from "@/components/dashboard/HamburgerButton";
import { FileText, Briefcase, Filter, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState<"resume" | "interview">("resume");
    const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);
    const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resumes, interviews] = await Promise.all([
                    historyAPI.getResumeHistory(),
                    historyAPI.getInterviewHistory(),
                ]);
                setResumeHistory(resumes);
                setInterviewHistory(interviews);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalResumes = resumeHistory.length;
    const totalInterviews = interviewHistory.length;

    return (
        <div className="min-h-screen w-full bg-[#000000] text-white">
            {/* Subtle Background Noise/Vignette */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Custom Gradient Heading */}
                <div className="flex items-start gap-3">
                    <div className="lg:hidden">
                        <HamburgerButton />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-linear-to-r from-blue-500 via-blue-100 to-white bg-clip-text text-transparent">
                            History
                        </h1>
                        <p className="text-sm sm:text-base text-gray-400">Your interview and resume analysis timeline</p>
                    </div>
                </div>

                {/* Summary Strip */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6"
                >
                    <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/5 bg-black px-3 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] w-full sm:w-auto">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-400">Total Analyses:</span>
                        <span className="text-xs sm:text-sm font-bold text-blue-400">{totalResumes}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/5 bg-black px-3 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] w-full sm:w-auto">
                        <Briefcase className="h-4 w-4 text-purple-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-400">Total Interviews:</span>
                        <span className="text-xs sm:text-sm font-bold text-purple-400">{totalInterviews}</span>
                    </div>
                </motion.div>

                {/* Filters & Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3 sm:pb-4 gap-4 sm:gap-0">
                    {/* Tabs */}
                    <div className="flex items-center gap-6 sm:gap-8 relative w-full sm:w-auto overflow-x-auto">
                        {/* Resume Tab */}
                        <button
                            onClick={() => setActiveTab("resume")}
                            className={cn(
                                "relative pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-colors hover:text-white whitespace-nowrap",
                                activeTab === "resume" ? "text-white" : "text-gray-500"
                            )}
                        >
                            Resume Analysis
                            {activeTab === "resume" && (
                                <motion.div
                                    layoutId="activeHistoryTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            )}
                        </button>

                        {/* Interview Tab */}
                        <button
                            onClick={() => setActiveTab("interview")}
                            className={cn(
                                "relative pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-colors hover:text-white whitespace-nowrap",
                                activeTab === "interview" ? "text-white" : "text-gray-500"
                            )}
                        >
                            AI Interview
                            {activeTab === "interview" && (
                                <motion.div
                                    layoutId="activeHistoryTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            )}
                        </button>
                    </div>

                    {/* Right Side Options */}

                </div>

                {/* Content List */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex h-64 w-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === "resume" ? (
                                <motion.div
                                    key="resume-list"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-4"
                                >
                                    {resumeHistory.length > 0 ? (
                                        resumeHistory.map((item, index) => (
                                            <HistoryCard
                                                key={item.id}
                                                type="resume"
                                                index={index}
                                                title={item.fileName}
                                                date={item.analyzedAt}
                                                score={item.atsScore}
                                                subtitle={`ATS Analysis • ${item.id}`} // Using ID as placeholder reference
                                                status={item.atsScore >= 80 ? "Optimized" : "Needs Review"}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex h-64 items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/5 text-gray-500">
                                            No resume analyses found.
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="interview-list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-4"
                                >
                                    {interviewHistory.length > 0 ? (
                                        interviewHistory.map((item, index) => (
                                            <HistoryCard
                                                key={item.id}
                                                type="interview"
                                                index={index}
                                                title={item.role}
                                                date={item.date}
                                                score={item.averageScore}
                                                subtitle={`${item.roundsCompleted} Round(s) Completed`}
                                                status={item.feedbackStatus}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex h-64 items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/5 text-gray-500">
                                            No interview history found.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
