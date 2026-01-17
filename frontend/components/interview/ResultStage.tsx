// ... imports ...
import { motion } from "framer-motion";
import { ChevronRight, Share2, Award, Zap, BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ResultStageProps {
    report: any;
}

export const ResultStage = ({ report }: ResultStageProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("DEBUG: Report Data Received:", report); // DEBUGGING MISSING DATA
        const target = report?.overallScore || 0;
        const duration = 1500;
        const steps = 60;
        const interval = duration / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            setCount(parseFloat(current.toFixed(3)));
        }, interval);

        return () => clearInterval(timer);
    }, [report]);

    if (!report) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-5xl p-4 sm:p-6 pb-16 sm:pb-20"
        >
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
                {/* Main Score Card - Pure Black */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 flex flex-col items-center justify-center rounded-[24px] sm:rounded-[32px] border border-white/10 bg-black p-8 sm:p-10 shadow-none md:col-span-3 text-center"
                >
                    <div className="mb-3 sm:mb-4 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Overall Performance</div>
                    <div className={cn(
                        "text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter mb-3 sm:mb-4",
                        count >= 7 ? "text-green-500" : count >= 4 ? "text-yellow-500" : "text-red-500"
                    )}>
                        {count.toFixed(3)}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-medium text-gray-300">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        {report.finalVerdict || "COMPLETED"}
                    </div>
                </motion.div>

                {/* Detailed Metrics - Pure Black */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <MetricCard title="Technical" score={report.technicalScore || 0} icon={Zap} delay={0.2} />
                    <MetricCard title="Communication" score={report.hrScore || 0} icon={Share2} delay={0.3} />
                    <MetricCard title="Project Depth" score={report.projectScore || 0} icon={BookOpen} delay={0.4} />
                </div>



                {/* AI Executive Summary */}
                {report.summary && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.42 }}
                        className="md:col-span-3 rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black p-5 sm:p-6 lg:p-8"
                    >
                        <h3 className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-white">
                            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            AI Executive Summary
                        </h3>
                        <div className="rounded-xl border border-blue-500/10 text-white p-4 sm:p-6 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {report.summary}
                        </div>
                    </motion.div>
                )}

                {/* Resume Insights */}
                {report.resumeFeedback ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="md:col-span-3 rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black p-5 sm:p-6 lg:p-8"
                    >
                        <h3 className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-white">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                            Resume Content Insights
                        </h3>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4 sm:p-6 text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {report.resumeFeedback}
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-red-500 md:col-span-3 text-center">Debug: Resume Feedback Missing</div>
                )}

                {/* Question Analysis */}
                <div className="md:col-span-3 space-y-4 sm:space-y-6 mt-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        Detailed Question Analysis
                    </h3>

                    <div className="grid gap-4 sm:gap-6">
                        {report.questions && report.questions.length > 0 ? (
                            report.questions.map((q: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black p-5 sm:p-6 lg:p-8 hover:border-white/20 transition-colors"
                                >
                                    <div className="mb-4 sm:mb-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
                                        <span className="rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                                            {q.roundType}
                                        </span>
                                        <div className={cn(
                                            "flex items-center gap-2 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold",
                                            q.score >= 8 ? "bg-green-500/10 text-green-500" :
                                                q.score >= 5 ? "bg-yellow-500/10 text-yellow-500" :
                                                    "bg-red-500/10 text-red-500"
                                        )}>
                                            <span className="text-base sm:text-lg">{q.score.toFixed(3)}</span>
                                            <span className="text-xs opacity-70">/ 10</span>
                                        </div>
                                    </div>

                                    <h4 className="mb-4 sm:mb-6 text-lg sm:text-xl font-medium leading-relaxed text-white">
                                        {q.questionText}
                                    </h4>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 p-4 sm:p-5 lg:p-6">
                                            <div className="mb-2 sm:mb-3 flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400">
                                                <Zap className="h-3 w-3" />
                                                AI Feedback
                                            </div>
                                            <p className="text-sm sm:text-base leading-relaxed text-gray-300 whitespace-pre-wrap">
                                                {q.aiFeedback}
                                            </p>
                                        </div>

                                        {q.userAnswer && (
                                            <details className="group/answer">
                                                <summary className="flex cursor-pointer items-center gap-2 rounded-xl p-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300">
                                                    <ChevronRight className="h-4 w-4 transition-transform group-open/answer:rotate-90" />
                                                    View My Answer
                                                </summary>
                                                <div className="pl-8 pr-2 pt-2 pb-2">
                                                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-gray-400 italic">
                                                        "{q.userAnswer}"
                                                    </div>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-red-500 text-center p-4 border border-red-500 rounded">Debug: No Questions Found in Report Data</div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-3 flex justify-center mt-8 sm:mt-12 mb-6 sm:mb-8">
                    <button
                        onClick={() => window.location.href = "/dashboard"}
                        className="group relative flex items-center gap-2 sm:gap-3 rounded-full bg-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-black transition-all hover:scale-105"
                    >
                        Return to Dashboard
                        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-black/10 transition-transform group-hover:translate-x-1">
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </span>
                    </button>
                </div>
            </div>
        </motion.div >
    );
};

const MetricCard = ({ title, score, icon: Icon, delay }: any) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-[24px] sm:rounded-[32px] border border-white/10 bg-black p-6 sm:p-8 hover:border-white/20 transition-colors"
    >
        <div className="mb-1 sm:mb-2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-white/5 text-gray-400">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600">{title}</div>
        <div className="text-3xl sm:text-4xl font-black text-white">{score.toFixed(3)}</div>
    </motion.div>
);
