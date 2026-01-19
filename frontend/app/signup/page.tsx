"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authAPI } from "@/lib/api";
import { initializeGoogleSignIn } from "@/lib/google-auth";
import { TrendingUp, Shield, Zap, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/landing/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    initializeGoogleSignIn(handleGoogleResponse);
    // Check for Google ID token in URL hash (Manual Flow)
    const hash = window.location.hash;
    if (hash && hash.includes("id_token=")) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const idToken = params.get("id_token");
      if (idToken) {
        handleGoogleResponse({ credential: idToken });
        // Clear hash
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    // The 'timer' variable is not defined in the provided context.
    // If a timer was intended to be set, it should be defined here.
    // For now, this line is commented out to prevent a ReferenceError.
    // return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.googleLogin(response.credential);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        userId: data.userId
      }));
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.register(fullName, email, password);
      // Store in localStorage for client-side access
      localStorage.setItem("token", data.token);

      // Set cookie for middleware access (expires in 7 days)
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      router.push("/dashboard");
    } catch (err: any) {
      // Extract the actual error message from the response
      const errorMessage = err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-dark-primary">
      {/* Mobile Header with Hamburger Menu */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-primary/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-white font-ectros">
              T<span className="text-blue-accent">I</span>
            </span>
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => {
              const menu = document.getElementById("mobile-menu-signup");
              menu?.classList.toggle("hidden");
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu-signup" className="hidden border-t border-white/10 bg-gradient-to-b from-dark-primary/95 to-dark-secondary/95 backdrop-blur-2xl">
          <div className="px-6 py-6 space-y-3">
            <Link
              href="/"
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </span>
            </Link>
            <Link
              href="/support"
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full relative pb-10 pt-20 md:pt-0">
        {/* Desktop Navigation - Top Right */}
        <div className="hidden md:flex absolute top-6 right-6 z-20 items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-light-secondary hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/support"
            className="text-sm font-medium text-light-secondary hover:text-white transition-colors"
          >
            Support
          </Link>
        </div>
        {/* Left Section - Signup Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex w-full lg:w-[35%] flex-col justify-start pt-4 md:pt-0 px-8 lg:px-16"
        >
          <div className="mx-auto w-full max-w-md">
            {/* Logo */}
            <div className="mb-4 md:mb-8 flex justify-center lg:justify-start lg:-ml-16 lg:-mb-12">
              {/* Mobile: Text only */}
              <h1 className="md:hidden text-2xl font-bold text-white font-ectros">
                The <span className="text-blue-accent">Interviewer</span>
              </h1>
              {/* Desktop: Image */}
              <Image
                src="/logo.png"
                alt="The Interviewer"
                width={220}
                height={55}
                className="hidden md:block w-auto h-auto object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-accent via-blue-300 to-white">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-light-secondary">
                Start your journey to interview mastery.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-light-secondary">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-light-secondary">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={error}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-light-secondary">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-light-muted">
                  Must be at least 8 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-light-muted/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-dark-primary px-2 text-light-muted">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
                  const redirectUri = `${window.location.origin}/signup`;
                  const scope = "email profile";
                  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token id_token&scope=${scope}&nonce=${Math.random()}`;
                  window.location.href = googleAuthUrl;
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-light-muted">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-light-primary hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </motion.div>

        {/* Right Section - Same as Login */}
        <div className="hidden lg:flex lg:w-[65%] flex-col justify-center bg-dark-secondary p-16 relative overflow-hidden">
          {/* Beautiful Grid Background with Radial Mask */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 100%)",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 mx-auto max-w-3xl flex flex-col items-center text-center"
          >
            {/* Floating Stat Card - Perfectly Centered */}
            <div className="mb-12 w-full max-w-lg rounded-2xl border border-blue-accent/10 bg-black/90 p-8 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(37,99,235,0.25)] ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="text-left">
                  <p className="text-xs font-medium tracking-wider text-blue-accent uppercase">Weekly Progress</p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-bold tracking-tight text-white">85%</span>
                    <span className="flex items-center text-sm font-medium text-blue-accent bg-blue-accent/10 px-2 py-0.5 rounded-full">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-accent/10 p-3 ring-1 ring-blue-accent/20">
                  <TrendingUp className="h-6 w-6 text-blue-accent" />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Technical", value: 85 },
                  { label: "Behavioral", value: 78 },
                  { label: "System Design", value: 92 },
                ].map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-light-secondary group-hover:text-white transition-colors">{item.label}</span>
                      <span className="text-blue-accent font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-dark-primary/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "circOut" }}
                        className="h-full bg-blue-accent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Symmetrical Text & Features */}
            <div className="space-y-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Master technical interviews<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-light-secondary">
                  with absolute precision.
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "Enterprise Security",
                    desc: "SOC2 Encrypted",
                  },
                  {
                    icon: Zap,
                    title: "Real-time Feedback",
                    desc: "Instant Analysis",
                  },
                  {
                    icon: TrendingUp,
                    title: "Professional Growth",
                    desc: "Track Progress",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex flex-col items-center gap-3 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-accent/10 ring-1 ring-blue-accent/20 group-hover:bg-blue-accent/20 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-blue-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm whitespace-nowrap">{item.title}</h3>
                      <p className="text-xs text-light-muted mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
