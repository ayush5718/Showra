"use client";

import { useEffect, useRef } from "react";

export const useParallax = (speed: number) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let raf = 0;
    const update = () => {
      if (!ref.current) return;
      const offset = window.scrollY * speed;
      ref.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const handleScroll = () => {
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return ref;
};
