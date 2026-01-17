"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Quote } from "lucide-react";

export default function SuccessStoriesPage() {
    const { user } = useUser();
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(".story-card",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.15, duration: 0.8 }
        );

    }, { scope: containerRef });

    const stories = [
        {
            initials: "AR",
            color: "bg-blue-600",
            name: "Aditya R.",
            role: "Final Year Student",
            quote: "I used to freeze during interviews. Practicing with the AI voice mode helped me get comfortable speaking English and explaining my logic clearly. Finally got placed in an MNC!"
        },
        {
            initials: "SK",
            color: "bg-emerald-600",
            name: "Sneha K.",
            role: "Job Seeker",
            quote: "My resume wasn't getting shortlisted anywhere. The AI analyzer pointed out I was missing key skills and my formatting was wrong. Fixed it and got 3 interview calls next week."
        },
        {
            initials: "MP",
            color: "bg-purple-600",
            name: "Manish P.",
            role: "Frontend Intern",
            quote: "I needed to brush up on React questions for my internship interview. The mock interview asked me exactly what the interviewer asked in the real round. Saved me!"
        },
        {
            initials: "TJ",
            color: "bg-amber-600",
            name: "Tanya J.",
            role: "Fresh Graduate",
            quote: "It's a great tool for practice. Much better than staring at a mirror. The feedback told me I speak too fast, which I didn't realize before."
        }
    ];

    return (
        <MarketingPage
            title="Success Stories"
            description="Real engineers. Real results. Join the community."
        >
            <div ref={containerRef} className="not-prose max-w-5xl mx-auto space-y-16">

                {/* Stories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stories.map((story, index) => (
                        <div
                            key={index}
                            className="story-card p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300 group hover:-translate-y-1"
                        >
                            <Quote className="w-8 h-8 text-white/20 mb-6 group-hover:text-blue-500/50 transition-colors" />

                            <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
                                "{story.quote}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${story.color} rounded-full flex items-center justify-center text-white font-bold text-sm tracking-widest shadow-lg`}>
                                    {story.initials}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-base">{story.name}</div>
                                    <div className="text-sm text-gray-500 font-medium">{story.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="text-center pt-8 border-t border-white/10 story-card opacity-0">
                    <h3 className="text-xl font-bold text-white mb-6">Write your own success story.</h3>

                    <div className="space-y-6">
                        <Link
                            href={user ? "/interviews" : "/signup"}
                            className="inline-block bg-white text-black hover:bg-gray-200 font-bold py-4 px-10 rounded-full transition-colors"
                        >
                            {user ? "Start Practicing" : "Get Started for Free"}
                        </Link>

                       
                    </div>
                </div>

            </div>
        </MarketingPage>
    );
}
