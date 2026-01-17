"use client";

import { motion } from "framer-motion";
import { FileText, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyDashboard() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full text-center"
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-200 to-white bg-clip-text text-transparent">
            Welcome to TheInterviewer!
          </h1>
          <p className="text-lg text-zinc-400">
            Get started with your performance analysis
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          {/* Resume Analysis Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black p-8 backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div className="space-y-6">
              <div className="inline-flex rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-2">Resume Analysis</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Upload your resume and get AI-powered insights to improve your ATS score
                </p>
              </div>

              <button
                onClick={() => router.push("/resume")}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:border-blue-500/50 hover:bg-white/10"
              >
                <span>Analyze Resume</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </motion.div>

          {/* Take Interview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-blue-500/30 bg-black p-8 backdrop-blur-sm transition-all hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <div className="space-y-6">
              <div className="inline-flex rounded-xl bg-blue-500/20 p-3 ring-1 ring-blue-500/30">
                <Zap className="h-8 w-8 fill-blue-400 text-blue-400" />
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-2">Take Interview</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Practice with AI-powered mock interviews and get real-time feedback
                </p>
              </div>

              <button
                onClick={() => router.push("/interviews")}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-600 hover:shadow-xl"
              >
                <span>Start Interview</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500"
        >
          
          <span>Complete both to unlock detailed analytics</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
