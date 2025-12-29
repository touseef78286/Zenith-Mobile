
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { ChevronDown, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface DetailViewProps {
  project: Project;
  onClose: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ project, onClose }) => {
  const { vibrate } = useHaptics();

  useEffect(() => {
    // Subtle haptic nudge every 3.5 seconds to reinforce the exit mechanic
    // Using a tight [5, 5] pattern as requested for a clean tactile 'tick'
    const hapticInterval = setInterval(() => {
      vibrate([5, 5]);
    }, 3500);

    // Initial nudge on mount
    const initialNudge = setTimeout(() => vibrate([5, 5]), 800);

    return () => {
      clearInterval(hapticInterval);
      clearTimeout(initialNudge);
    };
  }, [vibrate]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto overflow-x-hidden">
      {/* Background Media */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-screen relative"
      >
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        
        <div className="absolute bottom-20 left-8 right-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-bold tracking-[0.5em] text-cyan-400 mb-2 block uppercase">Deep Dive Sequence</span>
            <h1 className="text-4xl font-bold leading-tight mb-4">{project.title}</h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              The Zenith experience translates complex architectural data into visceral spatial emotions. 
              This monolith represents the convergence of liquid state reality and digital permanence.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Blocks (Glass Slabs) */}
      <div className="relative z-10 p-8 space-y-8 pb-32">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-blur p-4 rounded-xl border-l-2 border-cyan-500">
            <span className="text-[8px] text-white/50 block mb-1">DENSITY</span>
            <span className="text-sm font-mono tracking-tighter">0.88 FL/OZ</span>
          </div>
          <div className="glass-blur p-4 rounded-xl border-l-2 border-cyan-500">
            <span className="text-[8px] text-white/50 block mb-1">LATENCY</span>
            <span className="text-sm font-mono tracking-tighter">0.003 MS</span>
          </div>
        </div>

        <div className="glass-blur p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full" />
          <h2 className="text-xs font-bold mb-4 tracking-[0.2em]">Kinetic Framework</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Exploring the limits of mobile-first spatial interaction through 120fps fluid motion 
            and sub-surface scattering simulations.
          </p>
        </div>
      </div>

      {/* Exit Button */}
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 w-12 h-12 rounded-full glass-blur flex items-center justify-center z-[60] text-white hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Pinch Close Hint with Synchronized Pulse */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ChevronDown className="mx-auto mb-1 animate-bounce" size={16} />
        <span className="text-[8px] tracking-[0.4em] uppercase font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Pinch to Exit</span>
      </motion.div>
    </div>
  );
};
