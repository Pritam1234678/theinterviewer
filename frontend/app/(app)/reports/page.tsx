"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Zap,
  Calendar,
  ArrowRight,
  Activity,
  ChevronRight,
  Search
} from "lucide-react";
import { historyAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { HamburgerButton } from "@/components/dashboard/HamburgerButton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// --- Types ---
interface InterviewHistoryItem {
  id: number;
  role: string;
  date: string;
  averageScore: number;
  roundsCompleted: number;
  feedbackStatus: string;
}

// --- Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-white/10 bg-black/95 px-4 py-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-zinc-400">{data.role || "Interview"}</p>
        <p className="mt-2 text-3xl font-bold text-white">
          <span className="text-blue-400">{payload[0].value.toFixed(2)}</span>
          <span className="text-base text-zinc-600 ml-1">/10</span>
        </p>
        {data.actualDate && (
          <p className="mt-2 text-xs text-zinc-500">{data.actualDate}</p>
        )}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, subtext, icon: Icon, delay, active }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn(
      "relative overflow-hidden rounded-2xl sm:rounded-[24px] border p-4 sm:p-5 lg:p-6 transition-all",
      active
        ? "border-blue-500/30 bg-black shadow-[0_0_30px_rgba(59,130,246,0.1)]"
        : "border-white/5 bg-black hover:border-white/10"
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
        <h3 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">{value}</h3>
      </div>
      <div className={cn("rounded-full p-2 sm:p-2.5", active ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-500")}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
    </div>
    {subtext && (
      <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        {subtext}
      </div>
    )}
  </motion.div>
);

const SessionRow = ({ item, index }: { item: InterviewHistoryItem; index: number }) => {
  const router = useRouter();
  const dateStr = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + (index * 0.05) }}
      onClick={() => router.push(`/results/${item.id}`)}
      className="group flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border border-transparent bg-white/2 p-3 sm:p-4 transition-all hover:border-white/5 hover:bg-white/4 gap-3"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className={cn(
          "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-bold shrink-0",
          item.averageScore >= 8 ? "bg-emerald-500/10 text-emerald-500" :
            item.averageScore >= 5 ? "bg-yellow-500/10 text-yellow-500" :
              "bg-red-500/10 text-red-500"
        )}>
          {item.averageScore.toFixed(2)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm sm:text-base text-zinc-200 group-hover:text-white truncate">{item.role || "Interview Session"}</h4>
          <p className="text-xs text-zinc-500">{dateStr} • {item.roundsCompleted || 1} Rounds</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <span className={cn(
          "hidden px-3 py-1 text-[10px] font-bold uppercase tracking-wider md:block rounded-full border",
          item.averageScore >= 8 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" :
            item.averageScore >= 5 ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-500" :
              "border-red-500/20 bg-red-500/5 text-red-500"
        )}>
          {item.averageScore >= 8 ? "Excellent" : item.averageScore >= 5 ? "Good" : "Needs Review"}
        </span>
        <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </motion.div>
  );
};

export default function ReportsPage() {
  const [reports, setReports] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await historyAPI.getInterviewHistory();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Compute Stats
  const total = reports.length;
  const avg = total > 0 ? (reports.reduce((a, b) => a + b.averageScore, 0) / total).toFixed(2) : 0;
  const best = total > 0 ? Math.max(...reports.map(r => r.averageScore)).toFixed(2) : 0;

  // Format Data for Chart (Reverse to show oldest to newest left-to-right if fetched newest first)
  const chartData = [...reports].reverse().map((r, index) => ({
    date: `Interview ${index + 1}`,
    value: r.averageScore,
    role: r.role,
    actualDate: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }));

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-xs font-medium text-zinc-500 animate-pulse">Loading Analytics...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 selection:bg-blue-500/30 text-white">
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <HamburgerButton />
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-200 to-zinc-500 mb-1 sm:mb-2">
                Analytics Hub
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">Your technical evolution, visualized.</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/interviews")}
            className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 max-w-xs mx-auto md:mx-0 md:max-w-none"
          >
            <Zap className="h-4 w-4 fill-current" />
            New Interview
          </button>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl sm:rounded-[24px] border border-white/5 bg-black p-5 sm:p-6 lg:p-8 lg:col-span-2"
          >
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Performance Trend</h3>
                <p className="text-xs text-zinc-500">Score history over time</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-400">
                {reports.length} Sessions
              </div>
            </div>

            <div className="h-[250px] sm:h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#52525b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#52525b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center flex-col gap-3 text-zinc-600">
                  <Activity className="h-8 w-8 opacity-20" />
                  <span className="text-sm">Not enough data to chart</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Side Stats - Visible on larger screens */}
          <div className="hidden lg:flex lg:flex-col gap-6">
            <StatCard
              label="Current Average"
              value={avg}
              subtext="Based on all sessions"
              icon={Activity}
              delay={0.3}
              active
            />
            <StatCard
              label="Best Performance"
              value={best}
              icon={Trophy}
              delay={0.35}
            />
            <StatCard
              label="Total Sessions"
              value={total}
              icon={BarChart3}
              delay={0.4}
            />
          </div>
        </div>
      </div>

      {/* Recent List */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-400">
            <HistoryIcon className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-bold text-white">Recent Sessions</h3>
        </motion.div>

        <div className="space-y-2">
          {reports.length > 0 ? (
            reports.map((item, i) => (
              <SessionRow key={item.id} item={item} index={i} />
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-12 text-center text-zinc-500">
              No activity recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function HistoryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
      <path d="M3 3v9h9" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
