"use client";

import { Suspense } from "react";
import { CardPageContent } from "./CardPageContent";

export default function CardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-[#00E5FF]"></div>
            <p className="mt-4 text-gray-400">Loading card...</p>
          </div>
        </div>
      }
    >
      <CardPageContent params={params} />
    </Suspense>
  );
}

