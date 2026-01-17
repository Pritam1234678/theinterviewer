import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Loader2, StopCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InterviewWorkspaceProps {
    question: any;
    onSubmitAnswer: (answer: string) => Promise<void>;
    loading: boolean;
    onNextQuestion: () => void;
    sessionStatus: any;
}

export const InterviewWorkspace = ({ question, onSubmitAnswer, loading, onNextQuestion }: InterviewWorkspaceProps) => {
    const [answer, setAnswer] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Reset answer when question changes
        setAnswer("");
        setIsSubmitting(false); // Reset submission state on new question
    }, [question?.questionId]);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setAnswer(prev => transcript);
            };

            recognitionRef.current.start();
            setIsListening(true);
        } else {
            toast.error("Speech recognition is not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleCreateSubmission = async () => {
        if (!answer.trim() || isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);
        try {
            await onSubmitAnswer(answer);
        } finally {
            // Don't reset here - it will be reset when new question loads
            // setIsSubmitting(false);
        }
    };

    return (
        <div className="grid h-auto min-h-[calc(100vh-140px)] grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 px-4 sm:px-0">
            {/* Left: Question Panel */}
            <motion.div
                key={question?.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col justify-center rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black p-5 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden min-h-[300px]"
            >
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-500/20 text-xs sm:text-sm font-bold text-blue-400">
                            Q
                        </span>
                        <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500">
                            {question?.roundType || "Questions"}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight text-white">
                        {question?.questionText || "Loading next question..."}
                    </h2>

                    {/* Hint or Context if available */}
                    {question?.context && (
                        <div className="mt-6 sm:mt-8 rounded-xl bg-white/5 p-3 sm:p-4 text-xs sm:text-sm text-gray-400 border-l-2 border-blue-500">
                            {question.context}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Right: Answer Panel */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <motion.div
                    className="group relative flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black shadow-inner transition-all focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                >
                    <textarea
                        className="h-full w-full resize-none bg-transparent p-5 sm:p-6 lg:p-8 text-base sm:text-lg lg:text-xl leading-relaxed text-white outline-none placeholder:text-gray-700"
                        placeholder="Type your answer here or use the microphone..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={loading}
                    />

                    {/* Mic Pulse Animation */}
                    {isListening && (
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                            </span>
                            <span className="text-xs font-medium text-red-400">Listening...</span>
                        </div>
                    )}
                </motion.div>

                {/* Action Bar */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={loading}
                        className={cn(
                            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl border transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                            isListening
                                ? "border-red-500/50 bg-red-500/10 text-red-500"
                                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {isListening ? <StopCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </button>

                    <button
                        onClick={handleCreateSubmission}
                        disabled={!answer.trim() || loading || isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white h-12 sm:h-14 text-sm sm:text-base lg:text-lg font-bold text-black transition-all hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading || isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                <span className="hidden xs:inline">Simulating Feedback...</span>
                                <span className="xs:hidden">Loading...</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden xs:inline">Submit Answer</span>
                                <span className="xs:hidden">Submit</span>
                                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
