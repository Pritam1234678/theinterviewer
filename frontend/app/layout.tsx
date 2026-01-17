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
  description: "AI-powered technical interview platform for engineers and professionals",
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
