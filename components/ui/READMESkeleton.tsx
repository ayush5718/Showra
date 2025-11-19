"use client";

export function READMESkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[rgba(20,18,36,0.72)] p-6 sm:p-8 backdrop-blur-[18px]">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-6 w-full bg-white/10 rounded animate-pulse" style={{ width: `${100 - i * 5}%` }} />
        ))}
      </div>
    </div>
  );
}

