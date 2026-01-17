"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Bot,
  FileText,
  BarChart3,
  History,
  LogOut,
  Pencil,
  Settings,
  LifeBuoy,
  Coins,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useCreditBalance, useCreditStore } from "@/hooks/useCreditBalance";
import { useMobileMenu } from "@/contexts/MobileMenuContext";


const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Interview", href: "/interviews", icon: Bot },
  { name: "Resume Analysis", href: "/resume", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "History", href: "/history", icon: History },
  { name: "Support", href: "/support", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { credits, loading } = useCreditBalance();
  const fetchCredits = useCreditStore((state) => state.fetchCredits);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  // Fetch credits on mount (initializes the global store)
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Close mobile menu when pathname changes (navigation happens)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, shown when menu open */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-white/5 bg-dark-glass backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group overflow-hidden shadow-glass",
        // Mobile: hidden by default, show when menu open
        "w-64 -translate-x-full lg:translate-x-0",
        isMobileMenuOpen && "translate-x-0",
        // Desktop: hover to expand
        "lg:w-[72px] lg:hover:w-64"
      )}>
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-6 shrink-0 transition-all duration-300">
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* TI Initials for collapsed state - Desktop only */}
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-white bg-clip-text text-transparent shrink-0 hidden lg:block lg:group-hover:hidden">
              TI
            </span>
            {/* Full Name - Always visible on mobile, hover on desktop */}
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-white bg-clip-text text-transparent whitespace-nowrap block lg:hidden lg:group-hover:block transition-all duration-500">
              TheInterviewer
            </span>
          </Link>

          {/* Mobile Close Button - Inline with logo */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
              aria-label="Close Menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-2 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 group/item overflow-hidden",
                  isActive
                    ? "text-white"
                    : "text-light-secondary hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-accent shadow-[0_0_12px_rgba(37,99,235,0.8)] rounded-r-full"
                  />
                )}

                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-blue-accent/10 to-transparent opacity-100 transition-opacity" />
                )}

                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-300 z-10",
                  isActive ? "text-blue-accent drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "text-gray-400 group-hover/item:text-white"
                )} />

                <span className="opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-4 transition-all duration-300 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 z-10 whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Credits Section */}
        <div className="px-4 pb-3">
          <Link href="/credits">
            <div className="group relative rounded-xl bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/[0.07] hover:border-white/20 cursor-pointer lg:opacity-0 lg:group-hover:opacity-100">
              <div className="flex items-center justify-between gap-3">
                {/* Coin Icon */}
                <Coins className="w-6 h-6 text-white shrink-0" />

                {/* Credits Count */}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-2xl font-bold text-white">{loading ? "..." : credits}</div>
                  <div className="text-xs text-light-secondary">Credits</div>
                </div>

                {/* Buy Button - Hidden on mobile, shows on desktop hover */}
                <span className="hidden lg:inline-block px-4 py-1.5 text-sm font-medium bg-white text-black rounded-lg shrink-0">
                  Buy
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* User Section (Bottom) */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* User Profile & Edit */}
          <div className="group/profile relative flex items-center justify-between rounded-xl px-3 py-2 transition-all hover:bg-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-sm font-semibold text-blue-accent opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-4 transition-all duration-300 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 whitespace-nowrap">
                {user?.fullName ? user.fullName.split(' ')[0] : "User"}
              </span>
            </div>

            <Link
              href="/profile"
              className="opacity-100 translate-x-0 lg:opacity-0 lg:translate-x-4 transition-all duration-300 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 p-1.5 rounded-lg text-light-muted hover:text-white hover:bg-white/10"
              title="Edit Profile"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>

          <button
            onClick={() => {
              // Clear auth data
              localStorage.clear();
              document.cookie = "token=; path=/; max-age=0";
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-light-secondary transition-all hover:bg-white/5 hover:text-white overflow-hidden"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-4 transition-all duration-300 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 whitespace-nowrap">Sign Out</span>
          </button>

        </div>

      </aside>
    </>
  );
}
