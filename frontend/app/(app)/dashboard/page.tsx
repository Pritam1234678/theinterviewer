"use client";

import { StatTile } from "@/components/dashboard/StatTile";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RankingCard } from "@/components/dashboard/RankingCard";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import Header from "@/components/dashboard/Header";
import { Users, BarChart3, FileText, TrendingUp } from "lucide-react";

import { dashboardAPI, DashboardSummaryResponse } from "@/lib/api";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getSummary();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Check if user has no data (empty state)
  const hasNoData = !loading && (stats?.totalInterviews ?? 0) === 0 && (stats?.resumeAtsScore ?? 0) === 0;

  return (
    <>
      <Header title="Overview" subtitle={`Welcome back, ${stats?.fullName || 'Candidate'}`} />

      {hasNoData ? (
        <EmptyDashboard />
      ) : (
        <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-10 px-3 sm:px-0">
          {/* Hero Metrics Row */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
            <StatTile
              title="Total Interviews"
              value={loading ? "-" : (stats?.totalInterviews?.toString() || "0")}
              trend={loading ? "-" : ((stats?.totalInterviews ?? 0) > 0 ? "Good" : "Bad")}
              trendUp={loading ? false : ((stats?.totalInterviews ?? 0) > 0)}
              icon={Users}
              delay={0.1}
            />
            <StatTile
              title="Latest Score"
              value={loading ? "-" : (stats?.latestInterviewScore ? `${stats.latestInterviewScore.toFixed(1)}` : "0")}
              trend={loading ? "-" : (stats?.interviewScoreTrend || "N/A")}
              trendUp={loading ? false : (stats?.interviewScoreTrend?.startsWith("+") ?? false)}
              icon={BarChart3}
              delay={0.2}
            />
            <StatTile
              title="Resume Score"
              value={loading ? "-" : (stats?.resumeAtsScore?.toString() || "0")}
              trend={loading ? "-" : (stats?.resumeScoreTrend || "N/A")}
              trendUp={loading ? false : (stats?.resumeScoreTrend?.startsWith("+") ?? false)}
              icon={FileText}
              delay={0.3}
            />
            <StatTile
              title="Improvement"
              value={loading ? "-" : (stats?.interviewScoreTrend || "0")}
              trend={loading ? "-" : (stats?.interviewScoreTrend?.startsWith("+") ? "Good" : "Needs Work")}
              trendUp={loading ? false : (stats?.interviewScoreTrend?.startsWith("+") ?? false)}
              icon={TrendingUp}
              delay={0.4}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Left Column: Progress Chart (Span 2) */}
            <div className="col-span-1 flex flex-col gap-4 sm:gap-6 lg:col-span-2">
              <ProgressChart />
            </div>

            {/* Right Column: Ranking (Span 1) */}
            <div className="col-span-1 flex flex-col gap-4 sm:gap-6">
              <RankingCard />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
