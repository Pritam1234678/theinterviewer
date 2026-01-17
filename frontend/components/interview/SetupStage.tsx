import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Briefcase, Code, Layers, User, Sparkles, FileText, AlertCircle, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { resumeAPI } from "@/lib/api";
import { useCreditBalance } from "@/hooks/useCreditBalance";

interface SetupStageProps {
  onComplete: (data: any) => void;
  loading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const SetupStage = ({ onComplete, loading }: SetupStageProps) => {
  const router = useRouter();
  const { credits, loading: creditsLoading } = useCreditBalance();
  const [formData, setFormData] = useState({
    currentRole: "",
    experienceYears: 0,
    difficultyLevel: "MODERATE",
    techStack: "",
    recentProjects: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null); // null = loading/unknown
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const INTERVIEW_COST = 25; // Credits per interview

  useEffect(() => {
    const checkResume = async () => {
      try {
        const resumes = await resumeAPI.getMyResumes();
        setHasResume(resumes && resumes.length > 0);
      } catch (error) {
        console.error("Failed to check resumes:", error);
        // Default to true or false? Better false to be safe, or null to retry?
        // Let's assume false to enforce check, but prevent blocking if API fails?
        // User requested strict check.
        setHasResume(false);
      }
    };
    checkResume();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasResume === false) {
      setShowResumeModal(true);
      return;
    }

    // Check if user has enough credits
    if (credits < INTERVIEW_COST) {
      setShowCreditModal(true);
      return;
    }

    const payload = {
      ...formData,
      techStack: formData.techStack.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
    };
    onComplete(payload);
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl relative z-10 px-4 sm:px-0"
      >
        {/* Decorative Glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/5 bg-black/40 p-5 sm:p-6 lg:p-8 xl:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Credit Info Banner */}
          <motion.div
            variants={itemVariants}
            className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Interview Cost</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{INTERVIEW_COST} <span className="text-sm sm:text-base text-gray-400">Credits</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Your Balance</p>
                  <p className={cn(
                    "text-lg sm:text-xl lg:text-2xl font-bold",
                    creditsLoading ? "text-gray-400" :
                      credits >= INTERVIEW_COST ? "text-green-400" : "text-red-400"
                  )}>
                    {creditsLoading ? "..." : credits} <span className="text-sm sm:text-base text-gray-400">Credits</span>
                  </p>
                </div>

              </div>
            </div>
            {!creditsLoading && credits < INTERVIEW_COST && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 text-xs sm:text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Insufficient credits. You need <strong>{INTERVIEW_COST - credits} more credits</strong> to start an interview.</span>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5 sm:mb-6 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Configuration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Interview Setup</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Design your interview environment.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role */}
            <motion.div variants={itemVariants} className="group flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-400">Target Role</label>
              <div className={cn(
                "relative transition-all duration-300 rounded-xl overflow-hidden",
                focusedField === "role" ? "transform scale-[1.01] shadow-lg shadow-blue-900/10" : ""
              )}>
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center bg-white/5 border-r border-white/5 z-10">
                  <Briefcase className={cn("h-4 w-4 transition-colors", focusedField === "role" ? "text-blue-400" : "text-gray-500")} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Java Backend Engineer"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-14 pr-3 text-sm text-white placeholder-gray-700 outline-none transition-all focus:border-blue-500/30 focus:bg-white/10"
                  value={formData.currentRole}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  onFocus={() => setFocusedField("role")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </motion.div>

            {/* Row: Experience & Difficulty */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              <motion.div variants={itemVariants} className="group flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-400">Experience (Years)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center z-10">
                    <User className={cn("h-4 w-4 transition-colors", focusedField === "exp" ? "text-blue-400" : "text-gray-500")} />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder-gray-700 outline-none transition-all focus:border-blue-500/30 focus:bg-white/10"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseFloat(e.target.value) || 0 })}
                    onFocus={() => setFocusedField("exp")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-400">Difficulty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center z-10">
                    <Layers className={cn("h-4 w-4 transition-colors", focusedField === "diff" ? "text-blue-400" : "text-gray-500")} />
                  </div>
                  <select
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-8 text-sm text-white outline-none transition-all focus:border-blue-500/30 focus:bg-white/10"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                    onFocus={() => setFocusedField("diff")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="EASY" className="bg-neutral-900">Easy</option>
                    <option value="MODERATE" className="bg-neutral-900">Moderate</option>
                    <option value="HARD" className="bg-neutral-900">Hard</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="absolute inset-y-0 right-3 flex items-center justify-center pointer-events-none">
                    <div className="h-0 w-0 border-l-[3px] border-l-transparent border-t-[5px] border-t-gray-500 border-r-[3px] border-r-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="group flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-400">Tech Stack</label>
              <div className={cn(
                "relative transition-all duration-300 rounded-xl overflow-hidden",
                focusedField === "tech" ? "transform scale-[1.01] shadow-lg shadow-blue-900/10" : ""
              )}>
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center bg-white/5 border-r border-white/5 z-10">
                  <Code className={cn("h-4 w-4 transition-colors", focusedField === "tech" ? "text-blue-400" : "text-gray-500")} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Java, Spring Boot, AWS"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-14 pr-3 text-sm text-white placeholder-gray-700 outline-none transition-all focus:border-blue-500/30 focus:bg-white/10"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  onFocus={() => setFocusedField("tech")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </motion.div>

            {/* Optional Project Section - Collapsible or very minimal */}
            <motion.div variants={itemVariants} className="group flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-400">Recent Projects <span className="text-gray-700 font-normal normal-case tracking-normal">(Optional)</span></label>
              <textarea
                placeholder="Brief description..."
                className="h-20 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-700 outline-none transition-all focus:border-blue-500/30 focus:bg-white/10"
                value={formData.recentProjects}
                onChange={(e) => setFormData({ ...formData, recentProjects: e.target.value })}
                onFocus={() => setFocusedField("proj")}
                onBlur={() => setFocusedField(null)}
              />
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white p-3 sm:p-4 font-bold text-black transition-all hover:bg-neutral-100 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent -translate-x-full group-hover:animate-shimmer" />

              {loading ? (
                <span className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-r-transparent" />
                  Initializing...
                </span>
              ) : (
                <>
                  <span className="text-xs sm:text-sm">Start Session</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Resume Requirement Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowResumeModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 rounded-full bg-white/5 p-4 text-white ring-1 ring-white/10">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">Resume Required</h3>
                <p className="mb-8 text-sm leading-relaxed text-zinc-400">
                  Please upload your resume to continue. We use your professional background to tailor the interview questions specifically for you.
                </p>

                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={() => router.push("/resume")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200"
                  >
                    Upload Resume <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="w-full rounded-xl py-3.5 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insufficient Credits Modal */}
      <AnimatePresence>
        {showCreditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowCreditModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-400 ring-1 ring-red-500/20">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">Insufficient Credits</h3>
                <p className="mb-2 text-sm leading-relaxed text-zinc-400">
                  You need <strong className="text-white">{INTERVIEW_COST} credits</strong> to start an interview.
                </p>
                <p className="mb-8 text-sm text-zinc-500">
                  Current balance: <span className="text-red-400 font-semibold">{credits} credits</span>
                </p>

                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={() => router.push("/credits")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:from-blue-600 hover:to-blue-700"
                  >
                    Buy Credits <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowCreditModal(false)}
                    className="w-full rounded-xl py-3.5 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
