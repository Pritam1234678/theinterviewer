"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost";
}

export default function PremiumButton({
    children,
    className = "",
    variant = "primary",
    ...props
}: PremiumButtonProps) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Handle Mouse Move for Spotlight & Magnetic Effect
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate normalized position for magnetic effect (center is 0,0)
        const xNorm = (x / rect.width) - 0.5;
        const yNorm = (y / rect.height) - 0.5;

        // Spotlight position
        setPosition({ x, y });

        // Apply magnetic transform directly via DOM for performance
        btnRef.current.style.transform = `translate(${xNorm * 10}px, ${yNorm * 10}px) scale(1.05)`;
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (btnRef.current) {
            btnRef.current.style.transform = "translate(0px, 0px) scale(1)";
        }
    };

    const baseStyles = "relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 overflow-hidden isolate";

    const variants = {
        primary: "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] border border-blue-400/20",
        secondary: "bg-transparent text-white border-2 border-white/10 hover:border-white/30 hover:bg-white/5",
        ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10",
    };

    return (
        <button
            ref={btnRef}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {/* Spotlight Effect Gradient */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 -z-10 pointer-events-none mix-blend-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/30 rounded-full blur-2xl"
                        style={{
                            left: position.x,
                            top: position.y
                        }}
                    />
                </motion.div>
            )}

            {/* Shine Sweep Effect for Primary */}
            {variant === "primary" && (
                <div className="absolute inset-0 -z-20 overflow-hidden">
                    <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12`} />
                </div>
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
}
