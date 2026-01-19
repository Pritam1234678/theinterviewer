import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ectros = localFont({
  src: "../lib/fonts/Ectros-Exfont5c57.otf",
  variable: "--font-ectros",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TheInterviewer - Master Technical Interviews with Precision",
  description: "Master your technical interviews with TheInterviewer - an AI-powered interview preparation platform. Practice coding interviews, system design, behavioral questions, and get real-time AI feedback. Perfect for software engineers, developers, and tech professionals preparing for FAANG, startups, and top tech companies. Features include mock interviews, resume analysis, personalized feedback, and comprehensive interview tips.",
  keywords: [
    "technical interview preparation",
    "coding interview practice",
    "AI interview coach",
    "mock interviews",
    "software engineer interview",
    "FAANG interview prep",
    "system design interview",
    "behavioral interview questions",
    "resume analysis",
    "interview feedback",
    "tech interview platform",
    "developer interview practice",
  ],
  authors: [{ name: "TheInterviewer Team" }],
  creator: "TheInterviewer",
  publisher: "TheInterviewer",
  icons: {
    icon: [
      { url: 'public/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={`${inter.variable} ${ectros.variable} antialiased`}>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
