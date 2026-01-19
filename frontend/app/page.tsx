"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Play, Star, Terminal, Zap } from "lucide-react";
import Image from "next/image";

import InteractiveDroplets from "@/components/landing/InteractiveDroplets";
import PremiumButton from "@/components/landing/PremiumButton";
import Footer from "@/components/landing/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    // Skip all GSAP animations on mobile for smooth performance
    if (isMobile) {
      return;
    }

    const ctx = gsap.context(() => {
      // ... existing GSAP code ...
      // Hero 3D Title Animation
      gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        filter: "blur(10px)",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.2,
      });

      // Subtitle Word Animation
      gsap.from(".hero-word", {
        opacity: 0,
        y: 20,
        filter: "blur(5px)",
        duration: 1,
        delay: 0.5,
        ease: "power2.out",
        stagger: 0.05,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        scale: 0.9,
        filter: "blur(5px)",
        duration: 1,
        delay: 1.2,
        ease: "power3.out",
      });

      // Features Scroll Animation
      gsap.utils.toArray(".feature-card").forEach((card: any, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 15%",
            scrub: 1,
          },
          opacity: 0,
          y: 50,
          rotationX: 10,
          transformOrigin: "center center",
          ease: "power2.out",
        });
      });

      // Stats Counter Animation
      gsap.utils.toArray(".stat-number").forEach((stat: any) => {
        gsap.from(stat, {
          scrollTrigger: {
            trigger: stat,
            start: "top 85%",
          },
          textContent: 0,
          duration: 1.5,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate: function () {
            stat.textContent = Math.ceil(stat.textContent);
          },
        });
      });

      // Parallax Background
      gsap.to(".parallax-bg", {
        scrollTrigger: {
          trigger: ".parallax-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        y: -100,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* 3D Background - Desktop Only */}
      <div className="hidden md:block">
        <InteractiveDroplets />
      </div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="hover:opacity-80 transition-opacity"
          >
            {/* Mobile: Text only */}
            <span className="md:hidden text-2xl font-bold text-white font-ectros">
              T<span className="text-blue-accent">I</span>
            </span>
            {/* Desktop: Image */}
            <img
              src="/logo.png"
              alt="TheInterviewer"
              className="hidden md:block h-12 w-auto object-contain transform scale-[4] origin-left"
            />
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <PremiumButton
              onClick={() => router.push("/support")}
              variant="ghost"
              className="px-6 py-2 text-sm font-medium tracking-wide"
            >
              Support
            </PremiumButton>
            <PremiumButton
              onClick={() => router.push("/login")}
              variant="ghost"
              className="px-6 py-2 text-sm font-medium tracking-wide"
            >
              Login
            </PremiumButton>
            <PremiumButton
              onClick={() => router.push("/signup")}
              variant="primary"
              className="px-6 py-2 text-sm font-bold tracking-wide shadow-none hover:shadow-lg"
            >
              Sign Up
            </PremiumButton>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              const menu = document.getElementById("mobile-menu");
              menu?.classList.toggle("hidden");
            }}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden border-t border-white/10 bg-gradient-to-b from-black/95 to-gray-900/95 backdrop-blur-2xl">
          <div className="px-6 py-4 space-y-2">
            <button
              onClick={() => router.push("/support")}
              className="block w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium text-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </span>
            </button>
            <button
              onClick={() => router.push("/login")}
              className="block w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium text-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </span>
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="block w-full text-left px-3 py-2 rounded-lg text-blue-600 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium text-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </span>
            </button>
          </div>
        </div>
      </header >

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center justify-center px-6 sm:px-12"
      >
        {/* Animated Background Grid - Desktop Only */}
        <div className="hidden md:block absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              transform: "perspective(500px) rotateX(60deg)",
              transformOrigin: "center top",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center mt-20">
          {/* 3D Title */}
          <div className="mb-8 overflow-visible">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none font-ectros">
              <span
                className="hero-title inline-block text-white mb-2"
                style={{ transformStyle: "preserve-3d" }}
              >
                The
              </span>
              <br />
              <span
                className="hero-title inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                style={{ transformStyle: "preserve-3d" }}
              >
                Interviewer
              </span>
            </h1>
          </div>

          <p className="min-h-[6rem] text-xl sm:text-2xl md:text-3xl text-gray-300/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            {/* Split text for stagger animation */}
            {"Master your interviews with AI-powered practice, real-time feedback, and personalized coaching".split(" ").map((word, i) => (
              <span key={i} className="hero-word inline-block mr-2">
                {word}
              </span>
            ))}
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
            <PremiumButton
              onClick={() => router.push("/signup")}
              variant="primary"
              className="group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </PremiumButton>

            <PremiumButton
              onClick={() => router.push("/login")}
              variant="secondary"
            >
              Sign In
            </PremiumButton>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-700" />
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: "Active Users", value: 50, suffix: "+" },
            { label: "Interviews Completed", value: 100, suffix: "+" },
            { label: "Success Rate", value: 99, suffix: "%" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl sm:text-6xl font-black mb-2">
                <span className="stat-number text-blue-400">
                  {stat.value}
                </span>
                <span className="text-blue-400">{stat.suffix}</span>
              </div>
              <div className="text-gray-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </section >

      {/* Features Section */}
      < section ref={featuresRef} className="parallax-section py-32 px-6 relative" >
        <div className="parallax-bg absolute inset-0 bg-linear-to-b from-gray-900 to-black opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-black font-ectros text-center mb-20 text-transparent bg-clip-text bg-linear-to-b from-blue-600 via-blue-400 to-white">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description: "Get instant feedback on your responses with advanced AI technology",
              },
              {
                title: "Real-Time Practice",
                description: "Practice with realistic interview scenarios tailored to your role",
              },
              {
                title: "Personalized Coaching",
                description: "Receive customized tips and strategies to improve your performance",
              },
              {
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics and insights",
              },
              {
                title: "Resume Analysis",
                description: "Optimize your resume with ATS-friendly suggestions",
              },
              {
                title: "24/7 Availability",
                description: "Practice anytime, anywhere at your own pace",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative p-8 rounded-3xl bg-linear-to-br from-white/5 to-white/2 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105"
                style={{ transformStyle: "preserve-3d" }}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-blue-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section >



      {/* Footer */}
      <Footer />
    </div >
  );
}
