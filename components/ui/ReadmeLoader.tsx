"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Terminal, GitBranch, Code2, Sparkles, Zap, CheckCircle2 } from "lucide-react";

const loadingSteps = [
  { icon: GitBranch, text: "Fetching GitHub profile...", color: "text-cyan-400" },
  { icon: Code2, text: "Analyzing repositories...", color: "text-purple-400" },
  { icon: Sparkles, text: "Detecting tech stack...", color: "text-pink-400" },
  { icon: Zap, text: "Generating README...", color: "text-yellow-400" },
  { icon: CheckCircle2, text: "Finalizing...", color: "text-green-400" },
];

export function ReadmeLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const step = loadingSteps[currentStep];
    let currentIndex = 0;
    setTypedText("");
    
    const typingInterval = setInterval(() => {
      if (currentIndex < step.text.length) {
        setTypedText(step.text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentStep]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 5;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] rounded-lg border border-white/10 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 2;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: `${randomX}%`,
              y: `${randomY}%`,
              opacity: 0,
            }}
            animate={{
              y: [`${randomY}%`, `${(randomY + 30) % 100}%`],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
            }}
          />
        );
      })}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto p-8">
        {/* Terminal-style container */}
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-cyan-500/30 shadow-2xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-b border-cyan-500/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-mono">README Generator</span>
            </div>
          </div>

          {/* Terminal body */}
          <div className="p-6 space-y-6">
            {/* Animated icon and text */}
            <div className="flex items-center gap-4">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CurrentIcon className={`w-12 h-12 ${loadingSteps[currentStep].color}`} />
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-mono text-sm">$</span>
                  <span className="text-white font-mono text-sm">
                    {typedText}
                    <motion.span
                      animate={{ opacity: showCursor ? 1 : 0 }}
                      className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Code output simulation */}
            <div className="bg-gray-900/50 rounded p-4 border border-gray-700 font-mono text-xs">
              <div className="space-y-1 text-gray-400">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-cyan-400">readme</span> ={" "}
                  <span className="text-yellow-400">await</span>{" "}
                  <span className="text-green-400">generate</span>(
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="ml-4"
                >
                  <span className="text-blue-400">profile</span>:{" "}
                  <span className="text-orange-400">githubProfile</span>,
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="ml-4"
                >
                  <span className="text-blue-400">repos</span>:{" "}
                  <span className="text-orange-400">repositories</span>,
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  );
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="text-green-400"
                >
                  ✓ README generated successfully
                </motion.div>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex gap-2 justify-center">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full ${
                    index <= currentStep ? "bg-cyan-400" : "bg-gray-700"
                  }`}
                  initial={{ width: 8 }}
                  animate={{
                    width: index === currentStep ? 24 : 8,
                    opacity: index <= currentStep ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-400"
        >
          Crafting your professional GitHub profile README...
        </motion.p>
      </div>
    </div>
  );
}
