"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export type CardVariant = 'card1' | 'card2' | 'card3' | 'card4';

interface CardSelectorProps {
  selectedCard: CardVariant;
  onSelectCard: (variant: CardVariant) => void;
}

const cardVariants: Array<{ id: CardVariant; name: string; description: string; gradient: string }> = [
  {
    id: 'card1',
    name: 'Classic Neon',
    description: 'Original gradient design with neon borders',
    gradient: 'from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF]'
  },
  {
    id: 'card2',
    name: 'Vertical Flow',
    description: 'Vertical layout with enhanced stats display',
    gradient: 'from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF]'
  },
  {
    id: 'card3',
    name: 'Compact Modern',
    description: 'Compact design with modern aesthetics',
    gradient: 'from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF]'
  },
  {
    id: 'card4',
    name: 'Minimalist',
    description: 'Clean minimalist design with subtle gradients',
    gradient: 'from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF]'
  },
];

export function CardSelector({ selectedCard, onSelectCard }: CardSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {cardVariants.map((variant) => (
          <motion.button
            key={variant.id}
            onClick={() => onSelectCard(variant.id)}
            className={`group relative px-4 py-3 rounded-xl border transition-all duration-300 text-left ${
              selectedCard === variant.id
                ? 'border-transparent bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] shadow-lg shadow-[#00E5FF]/30'
                : 'border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient border effect for selected */}
            {selectedCard === variant.id && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-50 blur-sm -z-10" />
            )}
            
            <div className="relative flex items-center gap-2.5">
              {selectedCard === variant.id && (
                <Check className="h-4 w-4 text-white flex-shrink-0" />
              )}
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className={`text-sm font-bold whitespace-nowrap ${
                  selectedCard === variant.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`}>
                  {variant.name}
                </span>
                <span className={`text-xs leading-tight ${
                  selectedCard === variant.id ? 'text-white/90' : 'text-white/50 group-hover:text-white/70'
                }`}>
                  {variant.description}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

