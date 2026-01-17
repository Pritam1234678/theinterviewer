"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, FileText } from "lucide-react";

import { ResumeAnalysisData } from "@/lib/api";

interface AnalysisWidgetsProps {
  data?: ResumeAnalysisData;
}

export function AnalysisWidgets({ data }: AnalysisWidgetsProps) {
  // Safe defaults if data is missing (e.g. dev mode)
  const score = data?.atsScore || 0;
  const strengths = data?.strengths || ["No analysis data available."];
  const weaknesses = data?.weaknesses || ["No analysis data available."];
  const missing = data?.missingSections || [];
  const tips = data?.improvementTips ? [data.improvementTips] : []; // improvementTips is a string in DTO, adapting to array layout if needed or string display

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. ATS Compatibility - Hero Widget */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.1 }}
         className="rounded-[22px] border border-white/5 bg-black p-6 shadow-[0_0_30px_-10px_rgba(37,99,235,0.15)] overflow-hidden relative"
      >
          <div className="flex justify-between items-start mb-6">
              <div>
                  <h3 className="text-lg font-semibold text-white">ATS Compatibility Score</h3>
                  <p className="text-sm text-light-muted">How well your resume parses for automated systems.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-accent/10 px-3 py-1 text-blue-accent border border-blue-accent/20">
                  <span className="h-2 w-2 rounded-full bg-blue-accent animate-pulse" />
                  <span className="text-sm font-bold">{score}/100</span>
              </div>
          </div>
          
          <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: "anticipate" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-accent to-[#60A5FA] shadow-[0_0_20px_rgba(37,99,235,0.5)]"
               />
          </div>
      </motion.div>

      {/* 2. Grid for Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="rounded-[22px] border border-white/5 bg-black p-6 shadow-sm hover:shadow-md transition-all"
          >
              <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Key Strengths
              </h4>
              <ul className="space-y-3">
                  {strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-light-secondary">
                          <CheckCircle2 className="h-4 w-4 text-green-500/50 mt-0.5 shrink-0" />
                          {item}
                      </li>
                  ))}
              </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="rounded-[22px] border border-white/5 bg-black p-6 shadow-sm hover:shadow-md transition-all"
          >
              <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Areas for Improvement
              </h4>
              <ul className="space-y-3">
                  {weaknesses.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-light-secondary">
                          <XCircle className="h-4 w-4 text-red-500/50 mt-0.5 shrink-0" />
                          {item}
                      </li>
                  ))}
              </ul>
          </motion.div>
      </div>

      {/* 3. Missing Sections Pills */}
      {missing.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[22px] border border-white/5 bg-black p-6"
          >
              <h4 className="text-sm font-medium text-light-muted mb-4 uppercase tracking-wider">Missing Sections</h4>
              <div className="flex flex-wrap gap-3">
                  {missing.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-light-secondary hover:border-blue-accent/30 hover:text-blue-accent transition-colors cursor-default">
                          + Add {tag}
                      </span>
                  ))}
              </div>
          </motion.div>
      )}

       {/* 4. Overall Summary */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
       >
           <h3 className="text-lg font-semibold text-white mb-6">AI Summary</h3>
           <p className="text-sm text-light-secondary leading-relaxed">
             {data?.overallSummary || "Automated analysis pending..."}
           </p>
       </motion.div>

    </div>
  );
}
