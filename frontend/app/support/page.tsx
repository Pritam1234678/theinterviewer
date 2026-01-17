"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { supportAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2, HelpCircle, FileText, Bot, ChevronLeft, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";

export default function SupportPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.fullName || "",
        email: user?.email || "",
        query: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await supportAPI.submitQuery({
                name: formData.name || user?.fullName || "",
                email: formData.email || user?.email || "",
                query: formData.query
            });

            setSuccess(true);
            toast.success("Support query sent successfully!");
            setFormData(prev => ({ ...prev, query: "" }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to send query. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const faqItems = [
        {
            question: "How does the AI Resume Analysis work?",
            answer: "Our system uses advanced Gemini 2.0 Pro models to parse your PDF resume. It maps your skills, experience, and projects against industry standards to provide a detailed ATS score and actionable improvement tips."
        },
        {
            question: "Are the mock interviews recorded?",
            answer: "Yes, interview sessions are transcribed in real-time. You can access your full interview history, including questions, your answers, and AI-generated feedback, from the 'History' tab in your dashboard."
        },
        {
            question: "What should I do if my resume upload fails?",
            answer: "First, ensure your file is a PDF and under 5MB. If the issue persists, try refreshing the page. If it still fails, please use the form above to contact support with the error message."
        },
        {
            question: "Can I delete my interview history?",
            answer: "Currently, we don't allow deletion of individual history items to preserve your progress tracking. proper deletion features are coming in the next update."
        },
        {
            question: "Is my data private?",
            answer: "Absolutely. Your resumes and interview data are processed securely and are only accessible to you. We do not share your personal data with third parties."
        }
    ];

    return (
        <div className="flex-1 w-full min-h-screen flex flex-col bg-dark-primary relative">
            <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-24">
                <Navbar/>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 sm:mb-10 max-w-5xl mx-auto w-full text-center lg:text-left"
                >
                    <div className="flex flex-col items-center lg:items-start">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                            <LifeBuoy className="w-4 h-4" />
                            Support Center
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            How can we <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-white">help you?</span>
                        </h1>
                        <p className="text-light-secondary text-base sm:text-lg max-w-2xl mx-auto lg:mx-0">
                            Find answers to common questions or reach out to our support team directly. We're here to ensure your interview prep is seamless.
                        </p>
                    </div>
                </motion.div>

                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
                    {/* Left Column: Contact Form OR Success Message */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-7"
                    >
                        <div className="bg-dark-glass backdrop-blur-xl border border-white/5 rounded-3xl p-1 overflow-hidden shadow-2xl shadow-blue-900/10 h-full min-h-[600px] relative">
                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-8 lg:p-12 relative z-10"
                                >
                                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-green-500/20 shadow-lg shadow-green-500/5">
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Message Sent Successfully</h3>
                                    <p className="text-light-secondary mb-10 text-lg max-w-md mx-auto leading-relaxed">
                                        Thanks {formData.name ? ` ${formData.name}` : ""}, we've received your query. <br />
                                        Our team will review it and send a response to <span className="text-blue-400 font-medium">{formData.email}</span> within 24 hours.
                                    </p>
                                    <Button
                                        onClick={() => setSuccess(false)}
                                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-7 text-lg rounded-xl transition-all hover:scale-105 hover:border-white/20"
                                    >
                                        Send Another Message
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className="p-8 lg:p-10 relative h-full flex flex-col z-10">
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Send className="w-6 h-6 text-blue-400" />
                                        Send a Message
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-light-secondary ml-1">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name || user?.fullName || ""}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-light-secondary ml-1">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email || user?.email || ""}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 flex-1">
                                            <label className="text-sm font-medium text-light-secondary ml-1">Message</label>
                                            <textarea
                                                required
                                                value={formData.query}
                                                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                                                className="w-full h-full min-h-[160px] bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none font-medium leading-relaxed"
                                                placeholder="How can we help you today?"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full md:w-auto bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-6 rounded-xl text-md font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: FAQ & Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* FAQ Section */}
                        <div className="bg-dark-glass backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-glass">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-400" />
                                Freq. Asked Questions
                            </h3>

                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {faqItems.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border-white/5 px-2">
                                        <AccordionTrigger className="text-white hover:text-blue-400 hover:no-underline text-left text-sm py-4">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-light-secondary leading-relaxed pb-4">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/interviews" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer group block">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Bot className="w-5 h-5 text-blue-400" />
                                </div>
                                <h4 className="text-white font-medium text-sm">Interview Guide</h4>
                            </Link>
                            <Link href="/resume" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer group block">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="text-white font-medium text-sm">Resume Tips</h4>
                            </Link>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-light-muted">
                                Need instant help? Email us directly at <br />
                                <a href="mailto:support@theinterviewer.online" className="text-blue-400 hover:underline mt-1 inline-block">support@theinterviewer.online</a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
