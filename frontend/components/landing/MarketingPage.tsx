"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";

import { useUser } from "@/hooks/useUser";

interface MarketingPageProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export default function MarketingPage({ title, description, children }: MarketingPageProps) {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Navbar / Header */}
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed mb-12 border-l-2 border-blue-500 pl-6">
                        {description}
                    </p>

                    <div className="prose prose-invert prose-lg max-w-none">
                        {children || (
                            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm dashed-border">
                                <p className="text-gray-500 italic">
                                    Detailed content for {title} is currently being crafted by our team.
                                    Check back soon for updates!
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
