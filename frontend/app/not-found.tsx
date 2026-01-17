"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 overflow-hidden relative selection:bg-purple-500/30">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />

                {/* Floating Particles */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500 rounded-full blur-sm"
                />
                <motion.div
                    animate={{
                        y: [0, 30, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-3/4 right-1/4 w-3 h-3 bg-blue-500 rounded-full blur-sm"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl text-center"
            >
                <div className="relative inline-block">
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="text-[180px] leading-none font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-white/5 select-none font-mono tracking-tighter"
                    >
                        404
                    </motion.h1>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-white/5 rounded-full pointer-events-none"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full box-shadow-glow" />
                    </motion.div>
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full pointer-events-none border-dashed opacity-50"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-6 mt-6"
                >
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Lost in the <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">Void</span>?
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                        The page you're looking for seems to have drifted away.
                        Let's get you back on track to your interview preparation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/dashboard" passHref>
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-gray-200 transition-all rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 group"
                            >
                                <Home className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Link href="/" passHref>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/10 text-white hover:bg-white/5 hover:text-white transition-all rounded-full px-8 py-6 text-base"
                            >
                                <ArrowLeft className="mr-2 w-5 h-5" />
                                Go Home
                            </Button>
                        </Link>
                    </div>
                </motion.div>

            </motion.div>

            {/* Footer Element */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-8 left-0 w-full text-center"
            >
                <p className="text-white/20 text-xs uppercase tracking-widest">
                    The Interviewer &copy; {new Date().getFullYear()}
                </p>
            </motion.div>
        </div>
    );
}
