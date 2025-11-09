import { GridBackdrop } from "./ui/GridBackdrop";

const year = new Date().getFullYear();

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#roadmap" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy", href: "#privacy" },
  ],
  resources: [
    { label: "Docs", href: "#docs" },
    { label: "Support", href: "#support" },
    { label: "Changelog", href: "#changelog" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-transparent">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(150%_160%_at_50%_-30%,rgba(38,30,84,0.8),rgba(8,11,24,0.96))]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(110%_110%_at_50%_40%,rgba(90,84,255,0.22),transparent_75%)]" />
      <GridBackdrop variant="muted" className="-z-10" />
      <div className="pointer-events-none absolute top-0 left-1/2 -z-5 h-64 w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.25),transparent_70%)] blur-[140px]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 text-white/70 md:gap-14 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-white/70">
              Built for Builders
            </span>
            <h4 className="bg-gradient-to-r from-[#8f84ff] via-[#61d5ff] to-[#b39aff] bg-clip-text text-2xl font-semibold text-transparent">
              Showra
            </h4>
            <p className="text-sm leading-relaxed text-white/65">
              Transform GitHub repos into immersive project cards. Inspire your community, pitch faster, and ship with polish.
            </p>
          </div>

          <div className="grid flex-1 gap-8 text-sm sm:grid-cols-3">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="space-y-4">
                <h5 className="text-xs uppercase tracking-[0.35em] text-white/55">
                  {group}
                </h5>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-white/70 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex max-w-xs flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-6 text-xs text-white/65 backdrop-blur-xl">
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
              Early Access
            </span>
            <p className="text-sm text-white/80">
              Join the waitlist to get notified when we drop the next wave of showcase templates.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-r from-[#6c63ff] via-[#5155ff] to-[#3bd4ff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_32px_-18px_rgba(82,110,255,0.9)] transition duration-300 hover:shadow-[0_16px_40px_-18px_rgba(90,210,255,0.95)]"
            >
              Notify Me
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Showra. Crafted for builders and dreamers.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#terms" className="transition hover:text-white">
              Terms
            </a>
            <a href="#status" className="transition hover:text-white">
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
