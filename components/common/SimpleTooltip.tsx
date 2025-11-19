"use client";

import { useState } from "react";

interface SimpleTooltipProps {
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function SimpleTooltip({ children, text, position = "top" }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-black/80 backdrop-blur-sm rounded-lg whitespace-nowrap pointer-events-none ${positionClasses[position]}`}
        >
          {text}
          <div
            className={`absolute w-0 h-0 border-4 ${
              position === "top"
                ? "top-full left-1/2 -translate-x-1/2 border-t-black/80 border-r-transparent border-b-transparent border-l-transparent"
                : position === "bottom"
                ? "bottom-full left-1/2 -translate-x-1/2 border-b-black/80 border-r-transparent border-t-transparent border-l-transparent"
                : position === "left"
                ? "left-full top-1/2 -translate-y-1/2 border-l-black/80 border-r-transparent border-t-transparent border-b-transparent"
                : "right-full top-1/2 -translate-y-1/2 border-r-black/80 border-l-transparent border-t-transparent border-b-transparent"
            }`}
          />
        </div>
      )}
    </div>
  );
}

