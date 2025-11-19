"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/utils/constants";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: {
    icon: "w-8 h-8",
    text: "text-xl",
    gap: "gap-2",
  },
  md: {
    icon: "w-10 h-10 sm:w-12 sm:h-12",
    text: "text-2xl sm:text-3xl",
    gap: "gap-3",
  },
  lg: {
    icon: "w-12 h-12 sm:w-14 sm:h-14",
    text: "text-3xl sm:text-4xl",
    gap: "gap-4",
  },
};

export function Logo({ 
  showText = true, 
  size = "md", 
  className = "",
  href = ROUTES.HOME,
  onClick
}: LogoProps) {
  const sizes = sizeClasses[size];
  const Component = href ? Link : "div";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`flex items-center ${sizes.gap} group relative ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-20 blur-md group-hover:opacity-30 transition-opacity -z-10" />
        <div className={`relative ${sizes.icon} z-10`}>
          <Image
            src="/logo.png"
            alt="Showra logo"
            width={56}
            height={56}
            className="h-full w-full object-contain relative z-10"
            priority
          />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes.text} font-black bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent leading-tight`}>
            Showra
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            Developer Cards
          </span>
        </div>
      )}
    </Component>
  );
}

