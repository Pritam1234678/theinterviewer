"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import { Check, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function PricingPage() {
    const { user } = useUser();
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Use fromTo to strictly define start and end states (fixes React Strict Mode visibility issues)
        tl.fromTo(".pricing-header",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 }
        );

        tl.fromTo(".pricing-card",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 },
            "-=0.4"
        );

    }, { scope: containerRef });

    return (
        <MarketingPage
            title="Simple, Transparent Pricing"
            description="Start for free. Pay only when you need more."
        >
            <div ref={containerRef} className="not-prose max-w-5xl mx-auto space-y-16">

                {/* Header (Invisible wrapper for animation target, can contain text if needed) */}
                <div className="pricing-header"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Free Plan */}
                    <div className="pricing-card p-8 rounded-3xl bg-black border border-white/10 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1 duration-300">
                        <div className="absolute top-0 right-0 p-4 bg-white/5 rounded-bl-2xl font-mono text-xs uppercase tracking-wider text-gray-400">
                            Starter
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Free Account</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">₹0</span>
                            <span className="text-gray-500">/ forever</span>
                        </div>

                        <p className="text-gray-400 mb-8 text-sm">Perfect for getting started and fixing your resume.</p>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-gray-500 shrink-0" />
                                <span><strong className="text-white">100 Credits</strong> Free on Sign Up</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-gray-500 shrink-0" />
                                <span>Equivalent to <strong className="text-white">~4 Interviews</strong></span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-gray-500 shrink-0" />
                                <span><strong className="text-white">Unlimited</strong> Resume Analysis</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-gray-500 shrink-0" />
                                <span>Detailed AI Feedback</span>
                            </li>
                        </ul>

                        <Link
                            href={user ? "/dashboard" : "/signup"}
                            className="block w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-center transition-all border border-white/5 hover:scale-[1.02]"
                        >
                            {user ? "Go to Dashboard" : "Get Started Free"}
                        </Link>
                    </div>

                    {/* Pay As You Go */}
                    {/* Replaced 'Zap' icon with 'TrendingUp' for professional look */}
                    <div className="pricing-card p-8 rounded-3xl bg-black border border-white/10 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 duration-300">
                        <div className="absolute top-0 right-0 p-4 bg-blue-600 rounded-bl-2xl font-bold text-xs uppercase tracking-wider text-white">
                            Pro Choice
                        </div>

                        <div className="relative">
                            <h3 className="text-xl font-bold text-white mb-2">Pay As You Go</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">₹25</span>
                                <span className="text-gray-500">/ interview</span>
                            </div>

                            <p className="text-gray-400 mb-8 text-sm">No monthly subscriptions. Just top up credits when you run out.</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-white">
                                    <TrendingUp className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Top up anytime instantly</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Credits never expire</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Access to Premium Interview Models</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Full Resume Tools Included</span>
                                </li>
                            </ul>

                            <Link
                                href={user ? "/credits" : "/signup"}
                                className="block w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center transition-all shadow-lg shadow-blue-900/20 hover:scale-[1.02]"
                            >
                                {user ? "Top Up Credits" : "Start Now"}
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="text-center pricing-header space-y-8">
                    <p className="text-gray-500 text-sm">
                        Prices are in INR. No hidden fees. <Link href="/contact" className="underline hover:text-white">Contact us</Link> for bulk hiring solutions.
                    </p>

                    <div>
                        <Link
                            href={user ? "/dashboard" : "/"}
                            className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
                        >
                            &larr; {user ? "Back to Dashboard" : "Back to Home"}
                        </Link>
                    </div>
                </div>

            </div>
        </MarketingPage>
    );
}
