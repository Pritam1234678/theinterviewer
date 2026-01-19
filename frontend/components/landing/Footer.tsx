
"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "/features" },
                { name: "Pricing", href: "/pricing" },
                { name: "Interview Tips", href: "/interview-tips" },
                { name: "Success Stories", href: "/success-stories" },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "/careers" },
                { name: "Contact", href: "/support" },
                { name: "Privacy Policy", href: "/privacy" },
            ]
        },
        {
            title: "Connect",
            links: [
                { name: "Twitter", href: "https://x.com/Pritammandal143" },
                { name: "LinkedIn", href: "https://www.linkedin.com/in/pritammandal143/" },
                { name: "GitHub", href: "https://github.com/Pritam1234678" },
                { name: "Portfolio", href: "https://pritammandalportfolio.netlify.app/" }


            ]
        }
    ];

    return (
        <footer className="relative bg-black pt-20 pb-10 border-t border-white/10 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Brand Column (Larger) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-block group">
                            <h2 className="text-3xl font-black tracking-tighter font-ectros text-white flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                                    <span className="text-lg">Ti</span>
                                </div>
                                The<span className="text-blue-500">Interviewer</span>
                            </h2>
                        </Link>
                        <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                            Level up your career with AI-driven mock interviews. Real-time feedback, personalized coaching, and success at your fingertips.
                        </p>

                        {/* Newsletter Input (Visual only for now) */}
                        <div className="relative max-w-sm mt-4">
                            <input
                                type="email"
                                placeholder="Enter your email for updates"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                            />
                            <button className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden lg:block lg:col-span-2" />

                    {/* Links Columns */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="lg:col-span-2">
                            <h3 className="text-white font-bold mb-6 font-ectros tracking-wide">{section.title}</h3>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            target={link.href.startsWith("http") ? "_blank" : undefined}
                                            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="text-gray-400 hover:text-blue-400 transition-colors text-sm font-medium block hover:translate-x-1 duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {currentYear} TheInterviewer Inc. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm group cursor-help">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 group-hover:text-green-400 transition-colors uppercase tracking-wider">
                                System Online
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
