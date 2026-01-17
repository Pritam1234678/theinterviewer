"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { historyAPI } from "@/lib/api";

interface InterviewHistoryItem {
  id: number;
  role: string;
  date: string;
  averageScore: number;
  roundsCompleted: number;
  feedbackStatus: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-white/10 bg-black/95 px-3 py-2 sm:px-4 sm:py-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-400">{data.role || "Interview"}</p>
        <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-white">
          <span className="text-blue-400">{payload[0].value.toFixed(2)}</span>
          <span className="text-sm sm:text-base text-zinc-600 ml-1">/10</span>
        </p>
        {data.actualDate && (
          <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-zinc-500">{data.actualDate}</p>
        )}
      </div>
    );
  }
  return null;
};

export function ProgressChart() {
  const [chartData, setChartData] = useState<{ name: string; score: number; role: string; actualDate: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interviews: InterviewHistoryItem[] = await historyAPI.getInterviewHistory();

        // Convert interview data to chart format
        // Reverse to show oldest to newest (left to right)
        const formattedData = [...interviews]
          .reverse()
          .map((interview, index) => ({
            name: `Int ${index + 1}`,
            score: interview.averageScore,
            role: interview.role,
            actualDate: new Date(interview.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch interview history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative col-span-2 h-[300px] sm:h-[350px] overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/5 bg-black p-4 sm:p-6 shadow-[0_0_30px_-10px_rgba(37,99,235,0.15)] backdrop-blur-xl"
    >
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex-1 pr-2">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">Performance Trend</h3>
          <p className="text-xs sm:text-sm text-light-muted truncate">Your interview scores over time</p>
        </div>
        <div className="flex gap-2">
          <button className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-white ring-1 ring-white/10 transition-hover hover:bg-white/20">
            All Time
          </button>
        </div>
      </div>

      <div className="h-[210px] sm:h-[250px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-500">
            <p className="text-xs sm:text-sm">No interview data yet</p>
            <p className="text-[10px] sm:text-xs mt-1 text-center">Complete your first interview to see progress</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }} // Smaller font for mobile
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }} // Smaller font for mobile
                domain={[0, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#2563EB"
                strokeWidth={2} // Slightly thinner on mobile maybe? kept standard but 2 is fine
                activeDot={{ r: 6, strokeWidth: 0 }} // Enhanced active dot
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
