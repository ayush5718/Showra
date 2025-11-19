"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth/store";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticating, setAuthenticating, setUser } = useAuthStore();
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
        className={`navbar-shell fixed top-0 left-0 z-50 w-full overflow-visible transition-all duration-500 ${
          scrolled ? "navbar-shell--scrolled" : ""
        }`}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(140%_180%_at_10%_-50%,rgba(120,126,255,0.22),transparent_65%)] opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_160%_at_80%_-60%,rgba(54,216,255,0.18),transparent_68%)] opacity-70" />
        </div>

        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-10">
          <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <Image
              src="/logo.png"
              alt="Showra logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow-[0_12px_30px_rgba(108,140,255,0.45)]"
              priority
            />
            <span className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.82rem] font-semibold uppercase tracking-[0.32em] text-white/85 shadow-[0_12px_30px_-18px_rgba(86,108,255,0.75)] backdrop-blur">
              Showra
            </span>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium text-white/65 transition duration-300 hover:text-white"
              >
                <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(108,99,255,0.92),rgba(51,208,255,0.92))] px-4 py-[0.55rem] text-sm font-semibold text-white shadow-[0_22px_65px_-28px_rgba(70,140,255,0.88)] transition duration-300 hover:-translate-y-[1px] hover:shadow-[0_28px_85px_-30px_rgba(78,205,255,0.92)] sm:px-5 sm:py-[0.65rem]"
              >
                Dashboard
              </Link>
            ) : (
              <button
                type="button"
                className={`inline-flex items-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(108,99,255,0.92),rgba(51,208,255,0.92))] px-4 py-[0.55rem] text-sm font-semibold text-white shadow-[0_22px_65px_-28px_rgba(70,140,255,0.88)] transition duration-300 hover:-translate-y-[1px] hover:shadow-[0_28px_85px_-30px_rgba(78,205,255,0.92)] sm:px-5 sm:py-[0.65rem] ${
                  authLoading ? "cursor-not-allowed opacity-80" : ""
                }`}
                onClick={handleGetStarted}
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting ready…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Get Started
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:border-white/20 hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#060716]/95 px-6 pb-12 pt-24 backdrop-blur-2xl md:hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(140%_120%_at_50%_-20%,rgba(112,126,255,0.18),transparent_75%)] opacity-80" />
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_110%_at_50%_120%,rgba(30,200,255,0.12),transparent_70%)] opacity-70 blur-3xl" />
          <nav className="flex flex-1 flex-col gap-6 text-lg text-white/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/8 px-4 py-3 font-medium tracking-wide text-white/75 transition hover:border-white/18 hover:text-white"
                onClick={closeMobileMenu}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </nav>
          <Link
            href="/generate"
            className="mt-10 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(120deg,rgba(108,99,255,0.92),rgba(51,208,255,0.9))] px-5 py-3 text-base font-semibold text-white shadow-[0_30px_90px_-30px_rgba(76,155,255,0.92)] transition hover:-translate-y-[1px] hover:shadow-[0_35px_110px_-32px_rgba(84,205,255,0.95)]"
            onClick={closeMobileMenu}
          >
            Launch Generator
          </Link>
          <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/30">
            <span>© Showra</span>
            <span>Build Bold</span>
          </div>
        </div>
      )}
    </>
  );
}
