"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, LayoutDashboard, LifeBuoy, BookOpen, FileText, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
    const { user, loading } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Do not render navbar on dashboard routes as they have their own sidebar
    if (pathname?.startsWith("/dashboard")) return null;

    if (loading) return null;

    const navLinks = user ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Support", href: "/support", icon: LifeBuoy },
        { name: "Interviews", href: "/interviews", icon: BookOpen },
        { name: "Resume", href: "/resume", icon: FileText }
    ] : [
        { name: "Home", href: "/", icon: Home },
        { name: "Support", href: "/support", icon: LifeBuoy }
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${user ? 'bg-transparent border-none' : 'bg-black/50 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-black/20'}`}>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between relative">

                    {/* LEFT SIDE: Brand / Logo - Only for Guests */}
                    <div className="flex items-center gap-8 relative z-50">
                        {!user ? (
                            <Link href="/" className="font-ectros font-bold text-xl tracking-tight text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                                    <span className="text-sm font-bold">Ti</span>
                                </div>
                                <span>The<span className="text-blue-500">Interviewer</span></span>
                            </Link>
                        ) : (
                            <div /> /* Empty div to maintain spacing/structure if needed */
                        )}
                    </div>

                    {/* RIGHT SIDE ACTIONS */}
                    <div className="flex items-center gap-6">
                        {!user ? (
                            <>
                                {/* Guest Desktop Navigation */}
                                <div className="hidden md:flex items-center gap-6">
                                    {navLinks.map(item => (
                                        <Link key={item.name} href={item.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="h-4 w-px bg-white/10 hidden md:block" />

                                {/* Guest Auth Buttons */}
                                <Link href="/login" className="text-sm font-medium text-white hover:text-blue-400 transition-colors hidden md:block">
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-900/20 hidden md:block"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            /* Logged In Navigation - ONLY 4 BUTTONS (Desktop) */
                            <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 pr-2 backdrop-blur-2xl shadow-xl">
                                {navLinks.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}

                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white relative z-50 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Full Screen Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-24 px-6 md:hidden flex flex-col"
                        >
                            <div className="flex flex-col gap-6">
                                {navLinks.map((item, idx) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-4 text-2xl font-bold p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon className="w-6 h-6" />
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                ))}

                                {!user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8"
                                    >
                                        <Link href="/login" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </Link>
                                        <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30">
                                            <UserPlus className="w-5 h-5" />
                                            Create Account
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Spacer for non-logged-in users on inner pages */}
            {!user && pathname !== "/" && <div className="h-8 md:h-10" />}
        </>
    );
}
