"use client";

import { FileText, Zap, Menu } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useUser();
  const router = useRouter();
  const displayName = user?.fullName || "Candidate";
  const { toggleMobileMenu } = useMobileMenu();

  return (
    <header className="sticky top-2 sm:top-4 z-30 mx-3 sm:mx-6 mb-6 sm:mb-8 flex h-auto sm:h-16 min-h-[56px] items-center justify-between rounded-2xl border border-white/5 bg-black px-3 sm:px-6 py-3 sm:py-0 shadow-[0_0_30px_-10px_rgba(37,99,235,0.15)] backdrop-blur-md transition-all duration-300">
      {/* Left Section: Hamburger + User Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden shrink-0 p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
          aria-label="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate">
            {displayName}
          </h1>
          {subtitle && <p className="text-xs text-light-secondary mt-0.5 truncate hidden sm:block">{subtitle}</p>}
        </div>

        {/* Pencil Edit Button - Right beside name */}
        <button
          onClick={() => router.push("/profile")}
          className="group shrink-0 rounded-full p-1.5 sm:p-2 text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
          aria-label="Edit Profile"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Action Buttons - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:flex items-center gap-3">
        {/* Resume Analysis Button */}
        <button
          onClick={() => router.push("/resume")}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 lg:px-5 py-2 lg:py-2.5 font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:scale-110" />
          <span className="text-xs lg:text-sm">Resume Analysis</span>
        </button>

        {/* Take Interview Button */}
        <button
          onClick={() => router.push("/interviews")}
          className="group flex items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-blue-600 px-4 lg:px-5 py-2 lg:py-2.5 font-bold text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-current transition-transform group-hover:scale-110" />
          <span className="text-xs lg:text-sm">Take Interview</span>
        </button>
      </div>
    </header>
  );
}
