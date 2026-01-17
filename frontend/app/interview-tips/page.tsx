"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export default function InterviewTipsPage() {
    const { user } = useUser();

    const tips = [
        {
            id: "01",
            title: "The STAR Method",
            description: "Situation, Task, Action, Result. Use this framework for behavioral questions to keep your answers structured and impactful."
        },
        {
            id: "02",
            title: "Clarify Before Coding",
            description: "Don't jump straight into code. Ask clarifying questions about edge cases, input constraints, and return values to show maturity."
        },
        {
            id: "03",
            title: "Think Out Loud",
            description: "Interviewers care about your thought process. Narrate your problem-solving steps as you write code to keep them engaged."
        },
        {
            id: "04",
            title: "Mock Interviews",
            description: "The best way to reduce anxiety is exposure. Practice in a realistic environment to desensitize yourself to the pressure."
        }
    ];

    return (
        <MarketingPage
            title="Interview Tips"
            description="Expert advice to help you ace your next technical interview."
        >
            <div className="not-prose max-w-5xl mx-auto space-y-16">

                {/* Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tips.map((tip) => (
                        <div
                            key={tip.id}
                            className="group p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="text-sm font-mono text-gray-500 mb-6 group-hover:text-amber-400 transition-colors">
                                {tip.id}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:translate-x-1 transition-transform">
                                {tip.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                                {tip.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Actions & Navigation */}
                <div className="text-center pt-12 border-t border-white/10 space-y-8">

                    {/* Primary CTA */}
                    <div>
                        <Link
                            href={user ? "/interviews" : "/signup"}
                            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-1"
                        >
                            {user ? "Start a Practice Interview" : "Practice Now for Free"}
                        </Link>
                    </div>

                    
                   

                </div>

            </div>
        </MarketingPage>
    );
}
