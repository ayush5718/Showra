"use client";

const year = new Date().getFullYear();

export function ModernFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm text-white/60">
              © {year} Showra. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#privacy"
              className="text-white/60 transition hover:text-white"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="text-white/60 transition hover:text-white"
            >
              Terms
            </a>
            <a
              href="#contact"
              className="text-white/60 transition hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

