"use client";

import { AnalysisWidgets } from "@/components/resume/AnalysisWidgets";
import { Copy, Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { ResumeAnalysisData } from "@/lib/api";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisSplitViewProps {
  data?: ResumeAnalysisData;
  file?: File | null;
}

export function AnalysisSplitView({ data, file }: AnalysisSplitViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fileUrl = file ? URL.createObjectURL(file) : null;
  const isImage = file?.type.startsWith('image/');
  const isPdf = file?.type === 'application/pdf';

  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const PreviewContent = ({ full = false }) => (
    <div className={cn("w-full h-full flex items-center justify-center p-4", full ? "bg-black/90" : "bg-[#111]")}
         style={{ overflow: full ? 'auto' : 'hidden' }}>
         {fileUrl ? (
             isImage ? (
                 <div className="relative overflow-auto flex items-center justify-center w-full h-full" ref={scrollContainerRef}>
                    <img 
                        src={fileUrl} 
                        alt="Resume Preview"
                        className="transition-transform duration-300 max-w-full max-h-full object-contain shadow-2xl"
                        style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
                    />
                 </div>
             ) : (
                 <iframe 
                    src={fileUrl} 
                    className="w-full h-full rounded-lg shadow-2xl" 
                    title="Resume Preview"
                 />
             )
         ) : (
            <div className="flex flex-col items-center justify-center opacity-20 pointer-events-none">
                 <p className="text-6xl font-black text-white/10 rotate-[-15deg]">PDF PREVIEW</p>
            </div>
         )}
    </div>
  );

  return (
    <>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[800px]">
      
      {/* LEFT: Resume Preview (Fixed/Sticky) */}
      <div className="xl:col-span-7 flex flex-col h-full">
         <div className="flex items-center justify-between mb-4 px-2">
             <h2 className="text-lg font-semibold text-white">Document Preview</h2>
             <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                 {isImage && (
                    <>
                        <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-white/10 text-light-secondary hover:text-white transition-colors" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
                        <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-white/10 text-light-secondary hover:text-white transition-colors" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
                         <button onClick={handleRotate} className="p-2 rounded-md hover:bg-white/10 text-light-secondary hover:text-white transition-colors" title="Rotate"><RotateCcw className="h-4 w-4" /></button>
                    </>
                 )}
                 <button onClick={() => setIsFullscreen(true)} className="p-2 rounded-md hover:bg-white/10 text-light-secondary hover:text-white transition-colors" title="Fullscreen"><Maximize2 className="h-4 w-4" /></button>
             </div>
         </div>
         
         <div className="flex-1 rounded-[22px] border border-white/5 bg-[#111] overflow-hidden relative shadow-inner group">
             <PreviewContent />
         </div>
      </div>

      {/* RIGHT: Analysis Scrollable */}
      <div className="xl:col-span-5 h-full overflow-y-auto pr-2 custom-scrollbar">
          <AnalysisWidgets data={data} />
      </div>

    </div>

    {/* Fullscreen Modal */}
    <AnimatePresence>
        {isFullscreen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0C10]">
                    <h2 className="text-xl font-semibold text-white">Document Preview</h2>
                    <div className="flex gap-3">
                        {isImage && (
                            <div className="flex gap-1 bg-white/5 rounded-lg p-1 mr-4">
                                <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-white/10 text-white" title="Zoom Out"><ZoomOut className="h-5 w-5" /></button>
                                <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-white/10 text-white" title="Zoom In"><ZoomIn className="h-5 w-5" /></button>
                                <button onClick={handleRotate} className="p-2 rounded-md hover:bg-white/10 text-white" title="Rotate"><RotateCcw className="h-5 w-5" /></button>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsFullscreen(false)}
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                            title="Close Preview"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-8 relative">
                    <PreviewContent full={true} />
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}

