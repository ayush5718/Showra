"use client";

export function CardSkeleton() {
  return (
    <div className="w-full max-w-[420px] mx-auto rounded-[28px] border border-white/10 bg-[rgba(20,18,36,0.72)] p-6 sm:p-8 backdrop-blur-[18px]">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 w-full bg-white/10 rounded mb-2 animate-pulse" />
            <div className="h-3 w-12 mx-auto bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-32 w-full bg-white/5 rounded animate-pulse mt-4" />
      </div>
    </div>
  );
}

