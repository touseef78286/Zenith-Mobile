
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { usePinch } from '@use-gesture/react';
import { RadialHub } from './components/RadialHub';
import { KineticPillar } from './components/KineticPillar';
import { DetailView } from './components/DetailView';
import { useGyroscope } from './hooks/useGyroscope';
import { useHaptics } from './hooks/useHaptics';
import { PROJECTS } from './constants';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDiving, setIsDiving] = useState(false);
  const [scale, setScale] = useState(1);
  const gyro = useGyroscope();
  const { vibrate } = useHaptics();

  // Gesture Ref for the pinch-to-dive mechanic
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = usePinch(({ offset: [d], memo }) => {
    const s = Math.max(0.8, Math.min(3, 1 + d / 200));
    setScale(s);
    
    if (s > 2.2 && !isDiving) {
      setIsDiving(true);
      vibrate(50);
    } else if (s < 1.2 && isDiving) {
      setIsDiving(false);
      vibrate(30);
    }
  });

  return (
    <div 
      ref={containerRef}
      {...(bind() as any)}
      className="relative w-screen h-screen bg-black overflow-hidden perspective-1000"
      style={{ touchAction: 'none' }}
    >
      {/* Background Liquid Glass Glow */}
      <div 
        className="fixed inset-0 pointer-events-none transition-transform duration-300 ease-out opacity-40"
        style={{
          background: `radial-gradient(circle at ${50 + gyro.gamma}% ${50 + gyro.beta}%, #22d3ee 0%, transparent 60%)`,
          filter: 'blur(100px)',
          transform: `translate(${gyro.gamma * 2}px, ${gyro.beta * 2}px)`
        }}
      />

      {/* Main Content Pillar */}
      <AnimatePresence mode="wait">
        {!isDiving ? (
          <motion.div
            key="pillar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 3, filter: 'blur(20px)' }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <KineticPillar 
              projects={PROJECTS} 
              activeIndex={activeIndex} 
              onIndexChange={setActiveIndex} 
              gyro={gyro}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="w-full h-full"
          >
            <DetailView 
              project={PROJECTS[activeIndex]} 
              onClose={() => setIsDiving(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radial Hub UI */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <RadialHub 
          activeIndex={activeIndex} 
          total={PROJECTS.length} 
          onSelect={setActiveIndex}
          isDiving={isDiving}
        />
      </div>

      {/* HUD Info */}
      <div className="fixed top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-40">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.4em] text-cyan-400 font-bold mb-1 opacity-60">SYSTEM STATUS</span>
          <span className="text-xs font-mono uppercase">Zenith v2.5 Mobile</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] tracking-[0.4em] text-cyan-400 font-bold mb-1 opacity-60">COORDINATES</span>
          <div className="text-xs font-mono">
            {gyro.gamma.toFixed(1)}° X / {gyro.beta.toFixed(1)}° Y
          </div>
        </div>
      </div>
    </div>
  );
}
