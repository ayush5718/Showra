"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { CardWrapper } from "@/components/features/card/variants/CardWrapper";
import { CardSelector, CardVariant } from "@/components/features/card/variants/CardSelector";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import type { DevCardData } from "./types";

interface DashboardCardSectionProps {
  cardData: DevCardData | null;
  selectedCard: CardVariant;
  onCardChange: (variant: CardVariant) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardCardSection({
  cardData,
  selectedCard,
  onCardChange,
  onRefresh,
  isRefreshing,
}: DashboardCardSectionProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardData) return;

    try {
      setDownloading(true);
      
      // Wait a bit for card to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the card element
      const cardSelector = `[data-card-variant="${selectedCard}"]`;
      let cardElement = document.querySelector(cardSelector) as HTMLElement;
      
      if (!cardElement) {
        const allCards = document.querySelectorAll('[data-card-variant]');
        cardElement = allCards[0] as HTMLElement;
      }
      
      if (!cardElement) {
        alert('Could not find card element. Please try again.');
        return;
      }
      
      // Wait for images to load
      const imgs = cardElement.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img => {
        if ((img as HTMLImageElement).complete) return Promise.resolve();
        return new Promise(res => {
          (img as HTMLImageElement).onload = res;
          (img as HTMLImageElement).onerror = res;
          setTimeout(res, 3000);
        });
      }));
      
      const variantNames: Record<CardVariant, string> = {
        'card1': 'classic-neon',
        'card2': 'vertical-flow',
        'card3': 'compact-modern',
        'card4': 'minimalist'
      };
      const variantName = variantNames[selectedCard] || selectedCard;
      
      const dataUrl = await htmlToImage.toPng(cardElement, {
        pixelRatio: 3,
        backgroundColor: '#0A0A0A',
        cacheBust: true,
        quality: 1,
        skipFonts: false,
      });
      
      const link = document.createElement('a');
      link.download = `devcard-${cardData.profile.login}-${variantName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!cardData) {
    return <CardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="flex justify-center">
        <CardSelector
          selectedCard={selectedCard}
          onSelectCard={onCardChange}
        />
      </div>

      {/* Card Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="w-full max-w-2xl">
          <CardWrapper
            variant={selectedCard}
            profile={cardData.profile}
            stats={cardData.stats}
            topRepo={cardData.topRepo}
            topLanguages={cardData.languages}
            technologies={cardData.technologies}
            heatmap={cardData.heatmap}
            repositories={cardData.repositories}
            skipAI={false}
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 backdrop-blur-xl border-2 border-[#00E5FF]/30 text-sm font-bold text-white shadow-lg shadow-[#00E5FF]/20 transition-all hover:from-[#00E5FF]/30 hover:to-[#00E5FF]/20 hover:scale-105 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Downloading..." : "Download Card"}
        </button>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-sm font-bold text-white/70 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>
    </div>
  );
}

