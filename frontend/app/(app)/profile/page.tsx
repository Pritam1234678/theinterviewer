"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authAPI } from "@/lib/api";
import { User, Mail, Save, ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Call API to update profile
      const updatedUser = await authAPI.updateProfile({ fullName, email });

      // Update local storage to reflect changes immediately
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, fullName, email }));

      setMessage({ type: 'success', text: "Profile updated successfully" });

      // Force refresh data if needed or just let useUser pick it up on next mount/reload
      // For now, simple reload or manual update
      window.dispatchEvent(new Event("storage")); // Trigger storage event for hooks if they listen to it

      // Optional: Redirect back or stay here
      // router.push('/dashboard');
    } catch (error: any) {
      console.error("Profile update error:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return <div className="flex min-h-screen items-center justify-center text-light-muted">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 border-b border-zinc-800 pb-4 sm:pb-6">
          <Link href="/dashboard" className="group p-2 rounded-lg hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-zinc-400 text-xs sm:text-sm">Update your personal account details</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Sidebar Info */}

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-black p-5 sm:p-6 flex flex-col items-center text-center h-full justify-center">
              <div className="relative mb-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-black border-4 border-zinc-900 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-xl">
                  {fullName ? fullName[0].toUpperCase() : "U"}
                </div>

              </div>

              <h2 className="text-base sm:text-lg font-semibold text-white">{fullName || "User"}</h2>
              <p className="text-xs sm:text-sm text-zinc-500">{email || "No email"}</p>

              <div className="mt-4 sm:mt-6 w-full pt-4 sm:pt-6 border-t border-zinc-800 grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Role</p>
                  <p className="text-xs sm:text-sm font-medium mt-1">Candidate</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Status</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-zinc-800 bg-black p-5 sm:p-6 lg:p-8 h-full">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid gap-2">
                    <label className="text-xs sm:text-sm font-medium text-zinc-300">Full Name</label>
                    <div className="relative">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        className="h-10 sm:h-11 bg-black border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs sm:text-sm font-medium text-zinc-300">Email Address</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      type="email"
                      className="h-10 sm:h-11 bg-black border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-sm transition-all"
                    />
                    <p className="text-xs text-zinc-500">This email will be used for account notifications.</p>
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg flex items-center gap-3 text-xs sm:text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                  >
                    {message.type === 'success' ? <Save className="h-4 w-4" /> : <span className="font-bold">!</span>}
                    {message.text}
                  </motion.div>
                )}

                <div className="pt-4 sm:pt-6 border-t border-zinc-800 flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 sm:h-11 px-5 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors w-full sm:w-auto"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
