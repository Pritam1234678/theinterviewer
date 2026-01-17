"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardAPI, UserRankResponse } from "@/lib/api";

export function RankingCard() {
  const [rankData, setRankData] = useState<UserRankResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const data = await dashboardAPI.getRank();
        setRankData(data);
      } catch (error) {
        console.error("Failed to fetch rank:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRank();
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[22px] border border-white/5 bg-black p-6 shadow-[0_0_30px_-10px_rgba(37,99,235,0.15)]">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const rank = rankData?.rank || 0;
  const totalUsers = rankData?.totalUsers || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-[22px] border border-white/5 bg-black p-6 shadow-[0_0_30px_-10px_rgba(37,99,235,0.15)] group"
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-blue-accent/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-blue-accent/10 p-2 text-blue-accent ring-1 ring-blue-accent/20">
          <Trophy className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Your Rank</h3>
      </div>

      <div className="mt-8 text-center">
         {rank === 0 ? (
           <>
             <p className="text-sm text-light-secondary">Complete your first interview</p>
             <div className="relative mt-2 inline-block">
                <span className="absolute -inset-1 blur-lg bg-zinc-500/30 rounded-full" />
                <h2 className="relative text-3xl font-bold tracking-tighter text-zinc-400">
                    Not Ranked
                </h2>
             </div>
             <p className="mt-4 text-xs font-medium text-light-muted uppercase tracking-wider">to see your ranking</p>
           </>
         ) : (
           <>
             <p className="text-sm text-light-secondary">You achieved</p>
             <div className="relative mt-2 inline-block">
                <span className="absolute -inset-1 blur-lg bg-blue-accent/30 rounded-full" />
                <h2 className="relative text-5xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    Rank {rank}
                </h2>
             </div>
             <p className="mt-4 text-xs font-medium text-light-muted uppercase tracking-wider">of all {totalUsers} candidates</p>
           </>
         )}
      </div>

      {rank > 0 && (
        <div className="mt-8">
          <div className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(5, 100 - ((rank - 1) / totalUsers) * 100)}%` }}
                transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-accent to-purple-500 shadow-[0_0_10px_#2563EB]"
              />
          </div>
        </div>
      )}
    </motion.div>
  );
}
