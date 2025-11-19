export interface RepoCardProps {
  name: string;
  owner: string;
  avatarUrl?: string;
  description?: string;
  stars?: number;
  forks?: number;
  commits?: number;
}

function formatStat(value?: number) {
  if (value == null) return "-";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

export function RepoCard({
  name,
  owner,
  avatarUrl,
  description,
  stars,
  forks,
  commits,
}: RepoCardProps) {
  return (
    <article className="group relative flex w-full max-w-2xl flex-col gap-6 rounded-[28px] border border-white/10 bg-[rgba(20,18,36,0.72)] p-6 text-left shadow-[0_30px_120px_-35px_rgba(108,99,255,0.55)] backdrop-blur-[18px] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_40px_140px_-30px_rgba(108,99,255,0.65)] sm:gap-8 sm:rounded-[32px] sm:p-8">
      {/* Outer glow + gradient border layers */}
      <div className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit] bg-[radial-gradient(circle_at_20%_0%,rgba(109,98,255,0.36),transparent_65%)] opacity-80 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[linear-gradient(135deg,rgba(111,99,255,0.45),rgba(53,99,255,0.12)_35%,rgba(2,211,255,0.28)_70%,rgba(19,25,46,0.65)_100%)] opacity-90" />
      <div className="pointer-events-none absolute inset-[2px] -z-5 rounded-[30px] border border-white/15 bg-[rgba(16,15,30,0.65)] p-[1px]" />

      {/* Header */}
      <header className="relative flex items-start justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_12px_40px_-12px_rgba(104,92,255,0.75)] sm:h-14 sm:w-14">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Owner avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/80">
                {owner[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10 mix-blend-screen opacity-60" />
          </div>
          <div className="space-y-1">
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-white/55 sm:text-xs sm:tracking-[0.35em]">
              Showra Showcase
            </p>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">
              {owner} / <span className="bg-gradient-to-r from-[#7d72ff] via-[#5ce4ff] to-[#7d72ff] bg-clip-text text-transparent">{name}</span>
            </h3>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-white/60 sm:px-4 sm:text-[11px] sm:tracking-[0.35em]">
          Live
        </div>
      </header>

      {/* Description */}
      {description && (
        <p className="relative text-sm leading-relaxed text-white/70 sm:text-base">
          {description}
          <span className="pointer-events-none absolute inset-x-0 -bottom-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />
        </p>
      )}

      {/* Stats */}
      <dl className="relative grid gap-4 sm:grid-cols-3">
        {[
          { label: "Stars", value: formatStat(stars) },
          { label: "Forks", value: formatStat(forks) },
          { label: "Commits", value: formatStat(commits) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group/stat relative overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-center transition duration-300 hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)] sm:rounded-[22px] sm:px-5"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60 transition duration-300 group-hover/stat:opacity-90" />
            <dt className="text-[0.65rem] uppercase tracking-[0.28em] text-white/50 sm:text-xs sm:tracking-[0.3em]">
              {stat.label}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-white sm:text-xl">{stat.value}</dd>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 -z-20 rounded-[26px] bg-[radial-gradient(circle_at_50%_120%,rgba(122,105,255,0.12),transparent_60%)] blur-[80px]" />
      </dl>

      {/* Footer */}
      <footer className="relative flex flex-col items-start gap-2 rounded-[20px] border border-white/10 bg-gradient-to-r from-white/6 via-white/4 to-white/8 px-5 py-4 text-[0.7rem] text-white/60 sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:px-6 sm:text-xs">
        <span className="uppercase tracking-[0.35em]">Powered by Showra</span>
        <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-[#7d72ff] to-[#5ce4ff] bg-clip-text">
          showra.dev
        </span>
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10 opacity-50" />
      </footer>

      {/* Motion accents */}
      <div className="pointer-events-none absolute inset-0 -z-30 rounded-[inherit] border border-white/10 opacity-30" />
      <div className="pointer-events-none absolute -top-20 left-[18%] -z-30 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(109,98,255,0.4),transparent_70%)] blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-24 right-[12%] -z-30 h-40 w-40 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.32),transparent_75%)] blur-[90px]" />
    </article>
  );
}
