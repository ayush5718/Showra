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
            ? "bg-[#0A0A0A]/90 backdrop-blur-2xl border-b border-white/10"
            : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Showra logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold text-white">
              Showra
            </span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 ${
                  authLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
                onClick={handleGetStarted}
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Get Started"
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-full p-2 text-white transition-all hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-[#0A0A0A]/95 backdrop-blur-2xl px-6 pb-12 pt-24 md:hidden border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative flex flex-1 flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20 ${
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
