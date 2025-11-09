"use client";

import { useState } from "react";
import { ArrowRightIcon, Sparkles } from "lucide-react";

interface InputBoxProps {
  onSubmit?: (value: string) => void;
}

export function InputBox({ onSubmit }: InputBoxProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let next = value.trim();
    if (!next) return;

    next = next.replace(/^https?:\/\/github\.com\/?/i, "");
    next = next.replace(/^github\.com\/?/i, "");

    if (!next) return;

    onSubmit?.(`https://github.com/${next}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="group relative mx-auto w-full">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_50%_-20%,rgba(110,99,255,0.35),transparent_60%)] opacity-80 blur-2xl transition-all duration-700 group-hover:opacity-100 group-hover:blur-xl" />

        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] border border-white/12 bg-[#060716]/92 p-4 shadow-[0_22px_60px_-38px_rgba(24,38,80,0.85)] backdrop-blur-xl transition duration-500 group-hover:border-white/22 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="group/input relative flex h-[3rem] w-full items-center gap-3 rounded-[14px] bg-white/6 px-4 text-sm text-white/65 ring-white/10 transition duration-300 focus-within:bg-white/10 focus-within:ring-2 sm:h-[3.4rem] sm:px-5">
              <span className="hidden items-center gap-2 text-white/55 sm:inline-flex">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-[#6c63ff] via-[#7f7bff] to-[#33d3ff]" />
                github.com/
              </span>
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="showra-labs/showcase"
                className="flex-1 min-w-0 bg-transparent text-base text-white placeholder:text-white/45 focus:outline-none sm:text-lg"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-[3rem] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#5e5bff] via-[#6c63ff] to-[#33d3ff] px-5 text-sm font-semibold text-white shadow-[0_16px_40px_-24px_rgba(86,132,255,0.85)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_22px_60px_-28px_rgba(62,168,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c63ff]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060716] sm:h-[3.4rem] sm:w-auto sm:px-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-[14px] border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#33d3ff]" />
              Works with public repositories today
            </span>
            <span className="inline-flex items-center gap-1 text-white/70">
              <Sparkles className="h-4 w-4 text-[#6c63ff]" />
              Private repo support coming soon
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
