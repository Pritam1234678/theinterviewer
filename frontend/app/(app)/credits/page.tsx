"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { HamburgerButton } from "@/components/dashboard/HamburgerButton";
import { toast } from "sonner";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CreditPackage {
    credits: number;
    price: number;
    popular?: boolean;
}

const packages: CreditPackage[] = [
    { credits: 25, price: 25 },
    { credits: 50, price: 50 },
    { credits: 100, price: 100, popular: true },
    { credits: 200, price: 200 },
];

export default function BuyCreditsPage() {
    const router = useRouter();
    const { credits, loading: balanceLoading, refetch } = useCreditBalance();
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(packages[2]); // Default to 100 credits
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePurchase = async () => {
        if (!selectedPackage) return;

        try {
            setProcessing(true);

            // Create order
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const response = await fetch(`${API_URL}/api/payments/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    credits: selectedPackage.credits,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(`Payment Error: ${errorData.error || "Failed to create order"}`);
                return;
            }

            const orderData = await response.json();

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "TheInterviewer",
                description: `${selectedPackage.credits} Credits`,
                order_id: orderData.razorpayOrderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    if (verifyResponse.ok) {
                        // Refetch credits to update balance
                        await refetch();

                        // Small delay to ensure state updates
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Redirect to dashboard with refresh
                        router.push("/dashboard");
                        router.refresh(); // Force refresh to trigger credit balance refetch
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                },
                theme: {
                    color: "#3B82F6",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment Error: Unable to process payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 w-full sm:w-auto">
                        <div className="lg:hidden">
                            <HamburgerButton />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Buy Credits</h1>
                            <p className="text-sm sm:text-base text-gray-400">Choose a package to continue</p>
                        </div>
                    </div>

                    {/* Current Balance */}
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-xs sm:text-sm text-gray-400">Balance:</span>
                        <span className="text-base sm:text-lg font-bold text-white">
                            {balanceLoading ? "..." : credits}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left: Credit Packages (2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {packages.map((pkg, index) => (
                            <motion.div
                                key={pkg.credits}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`relative cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${selectedPackage?.credits === pkg.credits
                                    ? "bg-black border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    : "bg-black border-white/10 hover:border-blue-500/50"
                                    }`}
                            >
                                {/* Popular Badge */}
                                {pkg.popular && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 rounded-full bg-blue-500 text-[9px] sm:text-[10px] font-bold">
                                        POPULAR
                                    </div>
                                )}

                                {/* Selected Checkmark */}
                                {selectedPackage?.credits === pkg.credits && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 sm:top-3 right-2 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center"
                                    >
                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </motion.div>
                                )}

                                {/* Content */}
                                <div className="text-center space-y-1.5 sm:space-y-2">
                                    <div className="text-3xl sm:text-4xl font-bold text-white">{pkg.credits}</div>
                                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">Credits</div>
                                    <div className="h-px bg-white/10 my-1.5 sm:my-2" />
                                    <div className="text-xl sm:text-2xl font-bold text-blue-400">₹{pkg.price}</div>
                                    <div className="text-[9px] sm:text-[10px] text-gray-500">₹1 per credit</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right: Checkout Summary (1/3 width) */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-8"
                    >
                        <div className="rounded-xl sm:rounded-2xl bg-black border border-white/10 p-5 sm:p-6 space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-bold">Checkout</h3>

                            {selectedPackage ? (
                                <>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-400">Credits</span>
                                            <span className="font-semibold">{selectedPackage.credits}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-400">Price per credit</span>
                                            <span className="text-gray-400">₹1</span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-400">Interviews</span>
                                            <span className="text-gray-400">{Math.floor(selectedPackage.credits / 25)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-base sm:text-lg font-bold">Total</span>
                                        <span className="text-xl sm:text-2xl font-bold text-blue-400">
                                            ₹{selectedPackage.price}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handlePurchase}
                                        disabled={processing}
                                        className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            `Pay ₹${selectedPackage.price}`
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-500">
                                        🔒 Secure payment via Razorpay
                                    </p>
                                </>
                            ) : (
                                <p className="text-center text-gray-400 text-sm">Select a package</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}