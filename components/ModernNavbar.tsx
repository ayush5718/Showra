"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth/store";

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
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
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
            ? "bg-black/80 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect when scrolled */}
        {scrolled && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
        )}

        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Showra logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                priority
              />
            </div>
            <span
              className={`text-lg font-bold transition-all ${
                scrolled
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              }`}
            >
              Showra
            </span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="group relative rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                </Link>
                <button
                  onClick={logout}
                  className="group relative flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="relative z-10">Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`group relative rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                  authLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
                onClick={handleGetStarted}
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                  </>
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            className={`inline-flex items-center justify-center rounded-full p-2 transition-all md:hidden ${
              scrolled
                ? "text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-2xl px-6 pb-12 pt-24 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile menu glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative flex flex-1 flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-base font-semibold text-red-300 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                    authLoading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  onClick={() => {
                    handleGetStarted();
                    closeMobileMenu();
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Get Started"
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
