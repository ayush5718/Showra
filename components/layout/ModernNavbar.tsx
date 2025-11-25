"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Loader2, LogOut, Github, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth/store";
import { ROUTES } from "@/lib/utils/constants";
import { Logo } from "@/components/common/Logo";

export function ModernNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticating, setAuthenticating, logout } = useAuthStore();
  const authLoading = isAuthenticating;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  // User is now managed by AuthProvider, no need to fetch here

  const handleGetStarted = async (e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (authLoading) {
      console.log('⏸️ Auth already loading, skipping...');
      return;
    }
    
    try {
      console.log('🚀 Get Started clicked');
      setAuthenticating(true);
      // Build the full callback URL with next parameter
      const callbackUrl = `${window.location.origin}${ROUTES.AUTH_CALLBACK}?next=${encodeURIComponent(ROUTES.DASHBOARD)}`;
      console.log('🔐 Starting OAuth with redirectTo:', callbackUrl);
      console.log('🔐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { 
          redirectTo: callbackUrl,
        },
      });
      
      console.log('📦 OAuth response:', { data, error, hasUrl: !!data?.url });
      
      if (error) {
        console.error('❌ OAuth error:', error);
        setAuthenticating(false);
        alert(`OAuth Error: ${error.message}`);
        return;
      }
      
      if (data?.url) {
        console.log('✅ OAuth URL generated, redirecting to:', data.url);
        // Use replace instead of href to prevent back button issues
        // Also ensure we redirect immediately
        window.location.replace(data.url);
      } else {
        console.warn('⚠️ No URL in OAuth response');
        console.log('Full response:', JSON.stringify({ data, error }, null, 2));
        setAuthenticating(false);
      }
    } catch (error: any) {
      console.error("❌ GitHub login failed:", error);
      setAuthenticating(false);
      alert(`Login failed: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${scrolled
            ? "bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/98 to-[#0A0A0A]/95 backdrop-blur-2xl shadow-2xl"
            : "bg-transparent"
          }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 sm:h-24 items-center justify-between">
            {/* Logo */}
            <Logo
              showText={true}
              size="md"
              onClick={closeMobileMenu}
            />

            {/* Desktop Navigation - REDESIGNED */}
            <nav className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="group relative rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-[#FF00CC]/10 to-[#9D4BFF]/10 backdrop-blur-md border border-white/20 px-6 py-3 text-sm font-bold text-white transition-all hover:from-[#00E5FF]/20 hover:via-[#FF00CC]/20 hover:to-[#9D4BFF]/20 hover:border-white/30"
                  >
                    <Sparkles className="inline-block h-4 w-4 mr-2 text-[#00E5FF]" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={authLoading}
                  className={`group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-[#00E5FF]/30 transition-all hover:shadow-xl hover:shadow-[#00E5FF]/50 disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {authLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Github className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Get Started</span>
                    </>
                  )}
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-3 text-white transition-all hover:bg-white/10 hover:border-white/20 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - REDESIGNED */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-[#0A0A0A] backdrop-blur-2xl px-6 pb-12 pt-32 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-1 flex-col gap-4 max-w-md mx-auto w-full">
              {user ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="group rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-[#FF00CC]/10 to-[#9D4BFF]/10 backdrop-blur-md border border-white/20 px-6 py-4 text-center text-base font-bold text-white transition-all hover:from-[#00E5FF]/20 hover:via-[#FF00CC]/20 hover:to-[#9D4BFF]/20 hover:border-white/30"
                    onClick={closeMobileMenu}
                  >
                    <Sparkles className="inline-block h-5 w-5 mr-2 text-[#00E5FF]" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    handleGetStarted(e);
                    closeMobileMenu();
                  }}
                  disabled={authLoading}
                  className={`group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-6 py-4 text-base font-black text-white shadow-lg shadow-[#00E5FF]/30 transition-all hover:shadow-xl hover:shadow-[#00E5FF]/50 disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {authLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Github className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Get Started with GitHub</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
