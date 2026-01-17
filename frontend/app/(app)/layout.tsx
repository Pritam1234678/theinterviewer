"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/landing/Footer";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileMenuProvider>
      <div className="flex min-h-screen bg-dark-primary text-light-primary selection:bg-blue-accent/30">
        {/* Global Sidebar for all protected pages */}
        <Sidebar />

        {/* Main Content Area */}
        {/* Note: Individual pages (Dashboard, Resume, etc.) will render their own specific Headers if needed */}
        <main className="flex-1 flex flex-col pl-0 lg:pl-[72px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex-1 p-4 sm:p-8 lg:p-10 relative">
            <div className="mx-auto max-w-[1600px] animate-fade-in-up">
              {children}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </MobileMenuProvider>
  );
}
