"use client";
import MarketingPage from "@/components/landing/MarketingPage";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <MarketingPage
            title="Contact Us"
            description="Have questions? We're here to help you succeed."
        >
            <div className="not-prose max-w-4xl mx-auto space-y-12">

                {/* Contact Cards Grid - Clean Text Only */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Email Card */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-2">General Inquiries</h3>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">For general questions, partnerships, or press inquiries.</p>
                        <a href="mailto:help@theinterviewer.site" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 break-all sm:break-normal">
                            help@theinterviewer.site

                        </a>
                    </div>

                    {/* Support Card */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-2">Customer Support</h3>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">Need help with your account or interview practice?</p>
                        <Link href="/support" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                            Visit Support Center
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                        </Link>
                    </div>
                </div>

                {/* Additional Info - Clean */}
                <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-gray-500 text-sm">
                        Check our <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link> for data handling practices.
                    </p>
                </div>

            </div>
        </MarketingPage>
    );
}
