"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-visible bg-black w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-100 sm:scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "12rem" }}
          whileInView={{ opacity: 1, width: "20rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-40 sm:h-48 md:h-56 overflow-visible w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[30rem] bg-gradient-conic from-[#00E5FF] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute  w-[100%] left-0 bg-black h-24 sm:h-32 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute  w-24 sm:w-32 md:w-40 h-[100%] left-0 bg-black  bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "12rem" }}
          whileInView={{ opacity: 1, width: "20rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-40 sm:h-48 md:h-56 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[30rem] bg-gradient-conic from-transparent via-transparent to-[#FF00CC] text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute  w-24 sm:w-32 md:w-40 h-[100%] right-0 bg-black  bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute  w-[100%] right-0 bg-black h-24 sm:h-32 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-32 sm:h-40 md:h-48 w-full translate-y-12 scale-x-125 sm:scale-x-150 bg-black blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-32 sm:h-40 md:h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-24 sm:h-28 md:h-36 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[28rem] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-70 blur-3xl"></div>
        <motion.div
          initial={{ width: "6rem" }}
          whileInView={{ width: "12rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-24 sm:h-28 md:h-36 w-40 sm:w-48 md:w-64 -translate-y-[4rem] sm:-translate-y-[5rem] md:-translate-y-[6rem] rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FF00CC] opacity-80 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "12rem" }}
          whileInView={{ width: "20rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[30rem] -translate-y-[5rem] sm:-translate-y-[6rem] md:-translate-y-[7rem] bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-90"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-32 sm:h-36 md:h-44 w-full -translate-y-[8rem] sm:-translate-y-[10rem] md:-translate-y-[12.5rem] bg-black "></div>
      </div>

      <div className="relative z-50 flex -translate-y-8 sm:-translate-y-12 md:-translate-y-16 lg:-translate-y-20 flex-col items-center px-2 sm:px-3 md:px-4">
        {children}
      </div>
    </div>
  );
};
