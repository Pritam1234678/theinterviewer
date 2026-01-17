"use client";

import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { resumeAPI } from "@/lib/api";
import { toast } from "sonner";

interface UploadCardProps {
  onUploadSuccess?: (resumeId: number, file: File) => void;
}

export function UploadCard({ onUploadSuccess }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await resumeAPI.upload(file);

      if (onUploadSuccess) {
        onUploadSuccess(response.resumeId, file);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-12 rounded-[26px] border border-white/5 bg-black transition-all duration-300 group cursor-pointer overflow-hidden",
          isDragging ? "border-blue-accent ring-2 ring-blue-accent/20 bg-blue-accent/5" : "hover:border-white/10 hover:bg-white/5",
          file ? "border-green-500/30 bg-green-500/5" : ""
        )}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        {file ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center z-10"
          >
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6 ring-1 ring-green-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold text-white">{file.name}</h3>
            <p className="mt-2 text-sm text-light-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Analysis</p>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-8 rounded-full bg-white text-black px-8 py-3 text-sm font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group w-48 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Resume</span>
              )}
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center z-10">
            <div className={cn(
              "h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-light-secondary mb-6 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-accent group-hover:bg-blue-accent/10",
              isDragging ? "scale-110 text-blue-accent bg-blue-accent/10" : ""
            )}>
              <UploadCloud className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-semibold text-white tracking-tight">
              Upload your Resume
            </h3>
            <p className="mt-3 text-center text-light-secondary max-w-sm">
              Drag and drop your PDF or DOCX file here, or click to browse. We'll analyze it instantly.
            </p>

            <div className="mt-8 flex items-center gap-6 text-xs font-medium text-light-muted uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> PDF
              </span>
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> DOCX
              </span>
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> TXT
              </span>
            </div>
            {/* Hidden File Input for Click to Upload */}
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              accept=".pdf,.docx,.txt"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
