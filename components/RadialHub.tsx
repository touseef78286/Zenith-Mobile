
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';

interface RadialHubProps {
  activeIndex: number;
  total: number;
  onSelect: (idx: number) => void;
  isDiving: boolean;
}

export const RadialHub: React.FC<RadialHubProps> = ({ activeIndex, total, onSelect, isDiving }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const { vibrate } = useHaptics();

  const handleTouchStart = () => {
    setIsExpanding(true);
    vibrate(20);
  };

  const handleTouchEnd = () => {
    setIsExpanding(false);
  };

  return (
    <div className="relative flex justify-center items-end pb-12 pointer-events-auto">
      {/* Central Aura Hub */}
      <div 
        className="relative z-50 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Rings */}
        <motion.div 
          className="absolute inset-0 bg-cyan-500/20 rounded-full border border-cyan-500/30"
          animate={{ scale: isExpanding ? 1.4 : 1, opacity: isExpanding ? 0.8 : 0.4 }}
        />
        <motion.div 
          className="absolute inset-2 bg-white rounded-full mix-blend-overlay"
          animate={{ scale: isExpanding ? 0.8 : 1 }}
        />
        
        {/* Core Dot */}
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />

        {/* Haptic Visual Aura */}
        <AnimatePresence>
          {isExpanding && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Radial Menu Items (Slide Indicator) */}
      <motion.div 
        className="absolute bottom-32 flex gap-4 px-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanding ? 1 : 0, y: isExpanding ? 0 : 20 }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div 
            key={i}
            className={`w-1 h-6 transition-all duration-300 ${i === activeIndex ? 'bg-cyan-400 scale-y-150' : 'bg-white/20'}`}
          />
        ))}
      </motion.div>

      {/* Label */}
      <motion.div 
        className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"
        animate={{ opacity: isDiving ? 0 : 1 }}
      >
        <span className="text-[8px] tracking-[0.6em] uppercase text-white/40">Hold to Reveal Aura</span>
      </motion.div>
    </div>
  );
};
