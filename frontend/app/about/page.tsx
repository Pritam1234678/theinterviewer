"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import { Users, Trophy } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // Animate Line growing downwards
        tl.fromTo(lineRef.current,
            { height: "0%" },
            { height: "100%", duration: 1.5 }
        );

        // Animate Items fading in and sliding right
        tl.fromTo(".timeline-item",
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, stagger: 0.4, duration: 0.8 },
            "<0.1"
        );

        // Animate Values Grid separately
        tl.fromTo(".values-grid",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.5"
        );

    }, { scope: containerRef });

    return (
        <MarketingPage
            title="About The Interviewer"
            description="Empowering engineers to crack their dream jobs."
        >
            <div ref={containerRef} className="not-prose max-w-4xl mx-auto relative pl-2 sm:pl-0">

                {/* The Timeline Container */}
                {/* Responsive Padding: pl-10 (40px) on mobile, pl-16 (64px) on desktop */}
                <div className="relative pl-10 sm:pl-16 space-y-12 sm:space-y-20 py-4">

                    {/* The Continuous Vertical Line */}
                    {/* Mobile Center: 20px (left-10/2). Line w-0.5 (2px). Left: 19px. */}
                    {/* Desktop Center: 32px (left-16/2). Line w-0.5. Left: 31px. */}
                    <div
                        ref={lineRef}
                        className="absolute left-[19px] sm:left-[31px] top-0 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-transparent origin-top"
                    />

                    {/* Mission Section */}
                    <section className="timeline-item relative">
                        {/* Dot Size: w-4 (16px). Center: 8px to edges. */}
                        {/* Mobile: Center at 20px. Left edge at 12px. Relative Left: 12 - 40 = -28px. */}
                        {/* Desktop: Center at 32px. Left edge at 24px. Relative Left: 24 - 64 = -40px. */}
                        <div className="absolute -left-[28px] sm:-left-[40px] mt-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-black z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Our Mission</h3>
                            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                                We are on a mission to democratize interview preparation. We believe that talent is evenly distributed, but opportunity is not.
                                Our goal is to level the playing field by providing high-quality, accessible coaching to everyone.
                            </p>
                        </div>
                    </section>

                    {/* The Problem Section */}
                    <section className="timeline-item relative">
                        <div className="absolute -left-[28px] sm:-left-[40px] mt-1.5 w-4 h-4 bg-red-500 rounded-full border-4 border-black z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">The Problem</h3>
                            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                                Technical interviews are broken. Too often, qualified candidates fail because of anxiety, lack of specific preparation, or implicit bias—not a lack of skill.
                                The traditional "whiteboard" interview often measures performance under pressure rather than actual engineering capability.
                            </p>
                        </div>
                    </section>

                    {/* The Solution Section */}
                    <section className="timeline-item relative">
                        <div className="absolute -left-[28px] sm:-left-[40px] mt-1.5 w-4 h-4 bg-amber-500 rounded-full border-4 border-black z-10 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Our Solution</h3>
                            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                                By harnessing the power of advanced AI, we provide a safe, realistic environment for engineers to practice, fail, and improve—before the stakes are high.
                                Get instant, objective feedback on your code, communication, and problem-solving skills.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Values Grid */}
                <section className="values-grid pt-12 sm:pt-16 mt-8 border-t border-white/10">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 text-center">Why We Do It</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-3 text-white font-semibold">
                                <Users className="w-5 h-5 text-emerald-400" />
                                Community First
                            </div>
                            <p className="text-sm sm:text-base text-gray-400">We build for the community of developers who want to grow together.</p>
                        </div>
                        <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-3 text-white font-semibold">
                                <Trophy className="w-5 h-5 text-purple-400" />
                                Excellence
                            </div>
                            <p className="text-sm sm:text-base text-gray-400">We strive for the highest quality in our AI feedback and platform experience.</p>
                        </div>
                    </div>
                </section>

            </div>
        </MarketingPage>
    );
}
