"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { READMEPreview } from "@/components/features/card/READMEPreview";
import { ReadmeLoader } from "@/components/ui/ReadmeLoader";

interface DashboardReadmeSectionProps {
  readme: string | null;
  isLoading: boolean;
  error: string | null;
  onReadmeChange: (readme: string) => void;
  onRetry: () => void;
}

export function DashboardReadmeSection({
  readme,
  isLoading,
  error,
  onReadmeChange,
  onRetry,
}: DashboardReadmeSectionProps) {
  if (isLoading && !readme) {
    return (
      <div className="space-y-6">
        <ReadmeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-300 font-semibold mb-2">Error Loading Data</p>
        <p className="text-sm text-red-300/80 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!readme) {
    return (
      <div className="space-y-6">
        <ReadmeLoader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <READMEPreview 
        readmeContent={readme} 
        onContentChange={onReadmeChange}
      />
    </motion.div>
  );
}

