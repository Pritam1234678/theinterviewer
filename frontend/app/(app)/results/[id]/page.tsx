"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResultStage } from "@/components/interview/ResultStage";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, Share2, Calendar, Clock, Download } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const sessionId = params.id;
        if (!sessionId) return;
        const response = await api.get(`/api/interviews/${sessionId}/report`);
        setReport(response.data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const generatePDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header Branding ---
    doc.setFillColor(5, 5, 5); // Black Background Header
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("TheInterviewer", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("Performance Report & Analysis", 15, 28);

    doc.setFontSize(30);
    doc.setTextColor(59, 130, 246); // Blue Score
    doc.text(`${(report.overallScore || 0).toFixed(3)}/10`, pageWidth - 40, 25, { align: 'right' });

    // --- Meta Data ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let yPos = 50;
    const dateStr = new Date().toLocaleDateString(); // Ideally from report date
    doc.text(`Interview Role: Technical Interview`, 15, yPos);
    doc.text(`Date: ${dateStr}`, 15, yPos + 6);
    doc.text(`Session ID: ${params.id}`, 15, yPos + 12);

    // --- Competency Scores Table ---
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Competency Breakdown", 15, yPos);

    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Score', 'Status']],
      body: [
        ['Technical Skills', `${report.technicalScore || 0}/10`, report.technicalScore >= 8 ? 'Excellent' : 'Needs Practice'],
        ['Communication (HR)', `${report.hrScore || 0}/10`, report.hrScore >= 8 ? 'Strong' : 'Average'],
        ['Project Depth', `${report.projectScore || 0}/10`, report.projectScore >= 7 ? 'Good' : 'Improving'],
      ],
      headStyles: { fillColor: [5, 5, 5], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      theme: 'grid'
    });

    // --- Feedback Summary ---
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // AI Executive Summary
    if (report.summary) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("AI Executive Summary", 15, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const splitText = doc.splitTextToSize(report.summary, pageWidth - 30);
      doc.text(splitText, 15, yPos);
      yPos += (splitText.length * 5) + 10;
    }

    // Resume Insights
    if (report.resumeFeedback) {
      doc.setFontSize(14);
      doc.text("Resume Insights", 15, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const splitText = doc.splitTextToSize(report.resumeFeedback, pageWidth - 30);
      doc.text(splitText, 15, yPos);
      yPos += (splitText.length * 5) + 10;
    }

    // Question Review
    if (report.questions && report.questions.length > 0) {
      // Check for page break
      if (yPos > 250) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Question Analysis", 15, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Question', 'Your Answer', 'AI Feedback', 'Score']],
        body: report.questions.map((q: any) => [
          q.questionText || "N/A",
          q.userAnswer || "N/A",
          q.aiFeedback || "No feedback provided",
          q.score
        ]),
        headStyles: { fillColor: [5, 5, 5], textColor: [255, 255, 255], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 45 },  // Question
          1: { cellWidth: 50 },  // Answer
          2: { cellWidth: 'auto' }, // Feedback
          3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' } // Score
        },
        styles: {
          fontSize: 9,
          overflow: 'linebreak',
          cellPadding: 4,
          valign: 'middle',
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { top: 20 }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`TheInterviewer | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`TheInterviewer_Report_${params.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black text-white">
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <button
          onClick={() => router.push("/reports")}
          className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:bg-zinc-200"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  // Transform metrics for Radar Chart
  const radarData = [
    { subject: 'Technical', A: parseFloat((report.technicalScore || 0).toFixed(3)), fullMark: 10 },
    { subject: 'Communication', A: parseFloat((report.hrScore || 0).toFixed(3)), fullMark: 10 },
    { subject: 'Project Depth', A: parseFloat((report.projectScore || 0).toFixed(3)), fullMark: 10 },
    { subject: 'Problem Solving', A: parseFloat((report.technicalScore || 0).toFixed(3)), fullMark: 10 },
    { subject: 'Cultural Fit', A: parseFloat((report.hrScore || 0).toFixed(3)), fullMark: 10 },
  ];

  const dateObj = new Date(); // Use current or saved date if available

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">

      {/* Navbar / Back */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <button
            onClick={() => router.push("/reports")}
            className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <div className="rounded-full bg-white/5 p-2 transition-colors group-hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">Back to Reports</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-6 md:p-12 space-y-12">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Interview Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Performance <span className="text-blue-500">Breakdown</span>
            </h1>
            <p className="max-w-xl text-zinc-400 leading-relaxed">
              Detailed analysis of your technical competency, communication skills, and project depth based on AI evaluation.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="h-4 w-4" />
                <span>~15 min session</span>
              </div>
            </div>
          </div>

          {/* Radar Chart Card */}
          <div className="relative h-[300px] w-full overflow-hidden rounded-[32px] border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Competency Map
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                  name="Candidate"
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* The Result Stage Component (Detailed Analysis) */}
        <ResultStage report={report} />

      </main>
    </div>
  );
}

