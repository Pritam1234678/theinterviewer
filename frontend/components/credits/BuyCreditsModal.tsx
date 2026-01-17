"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CREDIT_PACKAGES = [
    { credits: 25, price: 25, popular: false },
    { credits: 50, price: 50, popular: false },
    { credits: 100, price: 100, popular: true },
    { credits: 200, price: 200, popular: false },
];

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function BuyCreditsModal({ isOpen, onClose, onSuccess }: BuyCreditsModalProps) {
    const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[2]); // Default to 100 credits
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async () => {
        try {
            setLoading(true);

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway');
                return;
            }

            // Step 1: Create order
            const orderResponse = await api.post('/payments/create-order', {
                credits: selectedPackage.credits,
            });

            const { razorpayOrderId, amount, currency, razorpayKeyId } = orderResponse.data;

            // Step 2: Open Razorpay checkout
            const options = {
                key: razorpayKeyId,
                amount: amount,
                currency: currency,
                name: 'The Interviewer',
                description: `${selectedPackage.credits} Credits`,
                order_id: razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        // Step 3: Verify payment
                        const verifyResponse = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResponse.data.success) {
                            toast.success(`Successfully added ${verifyResponse.data.creditsAdded} credits!`);
                            onSuccess?.();
                            onClose();
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                },
                theme: {
                    color: '#2563eb',
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mb-4 inline-flex rounded-full bg-yellow-500/10 p-3">
                                    <Coins className="h-8 w-8 text-yellow-500" />
                                </div>
                                <h2 className="mb-2 text-3xl font-bold text-white">Buy Credits</h2>
                                <p className="text-gray-400">Choose a package to continue your interview journey</p>
                            </div>

                            {/* Credit Packages */}
                            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {CREDIT_PACKAGES.map((pkg) => (
                                    <button
                                        key={pkg.credits}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${selectedPackage.credits === pkg.credits
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute right-2 top-2">
                                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                            </div>
                                        )}

                                        <div className="mb-2 flex items-center justify-center">
                                            <Coins className={`h-6 w-6 ${selectedPackage.credits === pkg.credits ? 'text-yellow-500' : 'text-gray-400'}`} />
                                        </div>

                                        <div className="text-center">
                                            <div className="mb-1 text-2xl font-bold text-white">{pkg.credits}</div>
                                            <div className="text-xs text-gray-400">Credits</div>
                                            <div className="mt-2 text-sm font-semibold text-blue-400">₹{pkg.price}</div>
                                        </div>

                                        {selectedPackage.credits === pkg.credits && (
                                            <div className="absolute bottom-2 right-2">
                                                <div className="rounded-full bg-blue-500 p-1">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                                    <span>Credits</span>
                                    <span>{selectedPackage.credits}</span>
                                </div>
                                <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                                    <span>Price per credit</span>
                                    <span>₹1</span>
                                </div>
                                <div className="border-t border-white/10 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-white">Total</span>
                                        <span className="text-2xl font-bold text-blue-400">₹{selectedPackage.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Button */}
                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : `Pay ₹${selectedPackage.price}`}
                            </button>

                            {/* Info */}
                            <p className="mt-4 text-center text-xs text-gray-500">
                                Secure payment powered by Razorpay • 1 Credit = ₹1
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
