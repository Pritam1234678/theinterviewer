"use client";

import { Menu } from "lucide-react";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

export function HamburgerButton() {
    const { toggleMobileMenu } = useMobileMenu();

    return (
        <button
            onClick={toggleMobileMenu}
            className="lg:hidden shrink-0 p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
            aria-label="Open Menu"
        >
            <Menu className="h-5 w-5" />
        </button>
    );
}
