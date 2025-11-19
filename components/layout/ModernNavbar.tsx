"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Loader2, LogOut, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth/store";
import { ROUTES } from "@/lib/utils/constants";

export function ModernNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticating, setAuthenticating, setUser, logout } = useAuthStore();
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

  useEffect(() => {
    if (user) return;
    let isMounted = true;
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!isMounted || !authUser) return;
      const metadata = authUser.user_metadata as Record<string, any>;
      setUser({
        id: authUser.id,
        name: metadata?.name ?? authUser.email ?? "Showra Maker",
        username: metadata?.user_name ?? metadata?.nickname ?? authUser.email ?? "maker",
        avatarUrl:
          metadata?.avatar_url ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${metadata?.user_name ?? "showra"}`,
        email: authUser.email ?? undefined,
      });
    });
    return () => {
      isMounted = false;
    };
  }, [setUser, user]);

  const handleGetStarted = async () => {
    if (authLoading) return;
    try {
      setAuthenticating(true);
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}?next=${ROUTES.DASHBOARD}` },
      });
    } catch (error) {
      console.error("GitHub login failed", error);
      setAuthenticating(false);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-2xl border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2.5 group"
              onClick={closeMobileMenu}
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/logo.png"
                  alt="Showra logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain transition-transform group-hover:scale-110"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent">
                Showra
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
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
                  className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00E5FF]/20 via-[#FF00CC]/20 to-[#9D4BFF]/20 backdrop-blur-md border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#00E5FF]/30 hover:via-[#FF00CC]/30 hover:to-[#9D4BFF]/30 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Github className="h-4 w-4" />
                      <span>Get Started</span>
                    </>
                  )}
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-full p-2 text-white transition-all hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-[#0A0A0A]/98 backdrop-blur-2xl px-6 pb-12 pt-24 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-1 flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleGetStarted();
                    closeMobileMenu();
                  }}
                  disabled={authLoading}
                  className={`flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00E5FF]/20 via-[#FF00CC]/20 to-[#9D4BFF]/20 backdrop-blur-md border border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:from-[#00E5FF]/30 hover:via-[#FF00CC]/30 hover:to-[#9D4BFF]/30 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Github className="h-5 w-5" />
                      <span>Get Started with GitHub</span>
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
