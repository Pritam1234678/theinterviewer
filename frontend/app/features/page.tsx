"use client";
import MarketingPage from "@/components/landing/MarketingPage";

export default function FeaturesPage() {
    const features = [
        {
            id: "01",
            title: "AI Resume Analysis",
            description: "Get detailed, actionable feedback on your resume. Our system analyzes formatting, keywords, and impact to drastically improve your ATS score."
        },
        {
            id: "02",
            title: "Real-time Simulation",
            description: "Experience the pressure of a real interview. Speak with our voice-enabled AI that adapts its questions based on your responses, just like a human interviewer."
        },
        {
            id: "03",
            title: "Performance Tracking",
            description: "Data-driven insights into your growth. View detailed transcripts, scores, and historical trends to identify weak points and measure improvement."
        },
        {
            id: "04",
            title: "Customizable Preps",
            description: "Target specific domains. Select from Data Structures, System Design, Behavioral, or specific tech stacks to tailor your practice sessions."
        }
    ];

    return (
        <MarketingPage
            title="Features"
            description="Everything you need to master your technical interview."
        >
            <div className="not-prose max-w-5xl mx-auto space-y-16">

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="group p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="text-sm font-mono text-gray-500 mb-6 group-hover:text-blue-400 transition-colors">
                                {feature.id}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:translate-x-1 transition-transform">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Call to Action - Text Only */}
                <div className="text-center pt-12 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Ready to start?</h3>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Join thousands of engineers who are practicing smarter, not harder.
                    </p>
                    {/* Note: Links/Buttons handled by Navbar usually, but could add one here if needed. Keeping it clean as per request. */}
                </div>

            </div>
        </MarketingPage>
    );
}
