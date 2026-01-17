"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatTileProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: any;
  delay?: number;
}

export function StatTile({ title, value, subtitle, trend, trendUp, icon: Icon, delay = 0 }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[22px] border border-white/5 bg-black p-4 sm:p-6 transition-all duration-300 hover:border-white/10"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-accent/5 blur-2xl transition-all duration-500 group-hover:bg-blue-accent/10" />

      <div className="relative flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-light-secondary truncate">{title}</p>
          <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tighter text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-light-muted truncate">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="ml-2 sm:ml-3 flex-shrink-0 rounded-xl bg-white/5 p-2 sm:p-3 text-light-secondary ring-1 ring-white/10 transition-colors duration-300 group-hover:bg-blue-accent/10 group-hover:text-blue-accent group-hover:ring-blue-accent/20">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 sm:mt-4 flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            <span>{trendUp ? "↗" : "↘"}</span>
            <span className="truncate">{trend}</span>
          </div>

        </div>
      )}
    </motion.div>
  );
}
