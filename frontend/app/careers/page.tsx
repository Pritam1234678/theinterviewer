"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export default function CareersPage() {
    const { user } = useUser();

    return (
        <MarketingPage
            title="Join the Mission"
            description="Help us build the future of technical hiring."
        >
            <div className="not-prose max-w-5xl mx-auto space-y-16">

                {/* No Roles State - Minimal */}
                <div className="text-center py-12 px-6 border border-dashed border-white/20 rounded-2xl bg-white/[0.02]">
                    <h3 className="text-2xl font-bold text-white mb-3">No Open Roles Currently</h3>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8 text-base">
                        We're growing fast, but we don't have any open positions right now.
                        Check back later or follow us for updates.
                    </p>
                    <Link
                        href={user ? "/dashboard" : "/"}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        &larr; {user ? "Back to Dashboard" : "Back to Home"}
                    </Link>
                </div>

                {/* Cultural/Benefits Grid - Minimal Text */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-8">Life at The Interviewer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors">
                            <h4 className="text-lg font-bold text-white mb-2">Remote First</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">We believe in hiring the best talent, regardless of where they live. Work from anywhere.</p>
                        </div>
                        {/* Card 2 */}
                        <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors">
                            <h4 className="text-lg font-bold text-white mb-2">High Impact</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">Work on cutting-edge AI technology that directly impacts thousands of careers and lives.</p>
                        </div>
                        {/* Card 3 */}
                        <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors">
                            <h4 className="text-lg font-bold text-white mb-2">People Focused</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">We care about our team as much as our users. Healthy work-life balance is core to us.</p>
                        </div>
                    </div>
                </div>

            </div>
        </MarketingPage>
    );
}
