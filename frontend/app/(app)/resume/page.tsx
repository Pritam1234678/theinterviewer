"use client";

import { UploadCard } from "@/components/resume/UploadCard";
import { AnalysisSplitView } from "@/components/resume/AnalysisSplitView";
import { motion } from "framer-motion";
import { useState } from "react";
import { HamburgerButton } from "@/components/dashboard/HamburgerButton";
import { toast } from "sonner";

import { resumeAPI, ResumeAnalysisData } from "@/lib/api";

export default function ResumePage() {
  const [view, setView] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisData | null>(null);

  const handleUploadSuccess = async (id: number, file: File) => {
    setResumeId(id);
    setUploadedFile(file);
    setView('analyzing');

    try {
      // Trigger AI Analysis
      const data = await resumeAPI.analyze(id);
      setAnalysisData(data);
      setView('results');
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Failed to analyze resume. Please try again.");
      setView('upload');
    }
  };

  return (
    <div className="min-h-screen pb-20">

      <main className="min-h-screen bg-black pt-16 sm:pt-20 lg:pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Hamburger Menu - Mobile Only */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <HamburgerButton />
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Upload View */}
        {view === 'upload' && (
          <section className="relative z-10 animate-fade-in-up">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight px-4">
                Resume Intelligence <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-accent to-blue-400">
                  Optimization Engine
                </span>
              </h1>
              <p className="text-base sm:text-lg text-light-secondary max-w-2xl mx-auto px-4">
                Our advanced AI mimics top-tier recruiters to scrutinize your resume, providing actionable insights to get you hired faster.
              </p>
            </div>

            <UploadCard onUploadSuccess={handleUploadSuccess} />
          </section>
        )}

        {/* Analyzing Loading State */}
        {view === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-accent/30 border-t-blue-accent rounded-full animate-spin mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Analyzing Resume...</h2>
            <p className="text-sm sm:text-base text-light-secondary">Our AI is reading your document and generating insights.</p>
          </div>
        )}

        {/* Detailed Analysis Section */}
        {view === 'results' && analysisData && (
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-white bg-clip-text text-transparent">Analysis Results</h2>
              <button
                onClick={() => setView('upload')}
                className="group relative inline-flex h-10 sm:h-12 items-center justify-center overflow-hidden rounded-lg bg-white/5 px-4 sm:px-6 font-medium text-sm sm:text-base text-white transition-all duration-300 hover:bg-white/10 hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-black w-full sm:w-auto"
              >
                <span className="mr-2 h-4 w-4 text-blue-400 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                </span>
                <span className="relative">Upload New Resume</span>
                <div className="absolute inset-0 -z-10 bg-linear-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </button>
            </div>
            <AnalysisSplitView data={analysisData} file={uploadedFile} />
          </div>
        )}
      </main>
    </div>
  );
}
