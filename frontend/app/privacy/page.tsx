"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import { ShieldCheck, Lock, Globe } from "lucide-react";

export default function PrivacyPage() {
    return (
        <MarketingPage
            title="Privacy Policy"
            description="Clear. Transparent. Secure."
        >
            <div className="not-prose max-w-3xl mx-auto space-y-12">
                {/* Intro Section */}
                <div className="pb-8 border-b border-white/10">
                    <p className="text-xl text-gray-300 leading-relaxed">
                        We believe your data belongs to you. This policy outlines exactly what we collect, how we secure it, and why we need it. No hidden clauses, no data selling.
                    </p>
                </div>

                {/* Section 1 */}
                <div className="flex gap-6 items-start">
                    <div className="shrink-0 mt-1">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-500/30 text-blue-400 font-mono text-sm">01</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Data Collection</h3>
                        <p className="text-gray-400 leading-relaxed">
                            We collect the minimum data necessary to function:
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-400 list-disc pl-4 marker:text-blue-500">
                            <li><strong className="text-gray-200">Account Info:</strong> Your email and name for authentication.</li>
                            <li><strong className="text-gray-200">Resume Data:</strong> Parsed content required for AI analysis.</li>
                            <li><strong className="text-gray-200">Interview Records:</strong> Audio and transcripts for performance scoring.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="flex gap-6 items-start">
                    <div className="shrink-0 mt-1">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-500/30 text-purple-400 font-mono text-sm">02</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Data Security</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Security is built into our architecture, not added as an afterthought.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-white font-medium">
                                    <Lock className="w-4 h-4 text-emerald-400" />
                                    Encryption
                                </div>
                                <p className="text-sm text-gray-400">AES-256 encryption for data at rest and TLS 1.3 for data in transit.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-white font-medium">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                                    Compliance
                                </div>
                                <p className="text-sm text-gray-400">Infrastructure adheres to SOC2 and GDPR standards.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="flex gap-6 items-start">
                    <div className="shrink-0 mt-1">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border border-green-500/30 text-green-400 font-mono text-sm">03</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Data Ownership</h3>
                        <p className="text-gray-400 leading-relaxed">
                            We claim <strong>zero ownership</strong> over your data.
                        </p>
                        <p className="text-gray-400 mt-2 leading-relaxed">
                            We do not sell, rent, or trade your personal information to third parties. Your resume and interview performance data are used strictly to provide you with feedback and improvements. You can export or delete your data at any time.
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="pt-8 border-t border-white/10 flex items-center gap-3 text-sm text-gray-500">
                    <Globe className="w-4 h-4" />
                    <p>Last updated: January 2026</p>
                </div>
            </div>
        </MarketingPage>
    );
}
