import { motion } from "framer-motion";
import { FileText, Calendar, ChevronRight, Award, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  type: "resume" | "interview";
  title: string;
  subtitle: string;
  score: number;
  status: string;
  date: string;
  index: number;
}

export const HistoryCard = ({ type, title, subtitle, score, status, date, index }: HistoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl sm:rounded-[20px] border border-white/10 bg-black p-4 sm:p-5 lg:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/20 hover:bg-neutral-950 hover:shadow-2xl hover:shadow-blue-900/10"
    >
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0 flex-1">
        <div className={cn(
          "flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl sm:rounded-2xl border transition-colors duration-300 shrink-0",
          type === "resume"
            ? "border-blue-500/20 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-500/20"
            : "border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover:border-purple-500/30 group-hover:bg-purple-500/20"
        )}>
          {type === "resume" ? <FileText className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" /> : <Briefcase className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />}
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white group-hover:text-blue-200 transition-colors truncate">{title}</h3>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="sm:hidden">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-600 hidden sm:block" />
            <span className="truncate hidden sm:inline">{subtitle}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 shrink-0">
        <div className="flex flex-col items-end gap-0.5 sm:gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500">Score</span>
          </div>
          <div className={cn(
            "text-lg sm:text-xl lg:text-2xl font-bold tracking-tight",
            score >= 8.0 ? "text-green-400" : score >= 6.0 ? "text-yellow-400" : "text-red-400"
          )}>
            {type === "interview" ? score.toFixed(3) : score}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300 backdrop-blur-sm">
            {status}
          </div>

        </div>
      </div>

      {/* Background Gradient Effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-[50px] transition-all duration-500 group-hover:bg-blue-500/10" />
    </motion.div>
  );
};
