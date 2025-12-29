
import React, { useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Project } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface KineticPillarProps {
  projects: Project[];
  activeIndex: number;
  onIndexChange: (idx: number) => void;
  gyro: { beta: number; gamma: number };
}

export const KineticPillar: React.FC<KineticPillarProps> = ({ projects, activeIndex, onIndexChange, gyro }) => {
  const { vibrate, playClick } = useHaptics();
  const y = useMotionValue(activeIndex * -150);
  const lastHapticIndex = useRef(activeIndex);
  
  // Cylinder geometry constants
  const radius = 350; // Radius of our "glass pillar"
  
  const bind = useDrag(({ movement: [mx, my], last, memo = y.get() }) => {
    // Increased sensitivity multiplier for faster scrolling with less physical movement
    const sensitivity = 1.8;
    const newY = memo + (my * sensitivity);
    y.set(newY);
    
    // Calculate which index should be center based on total displacement
    const rawIndex = Math.round(-newY / 150);
    // Wrap index for infinite feel logic
    const normalizedIndex = ((rawIndex % projects.length) + projects.length) % projects.length;
    
    if (normalizedIndex !== lastHapticIndex.current) {
      onIndexChange(normalizedIndex);
      vibrate(5); // Ultra-short tick
      playClick(); // Procedural sound
      lastHapticIndex.current = normalizedIndex;
    }

    if (last) {
      // Kinetic Flick: Settle into the nearest slot with grounded spring physics
      const finalY = Math.round(y.get() / 150) * 150;
      
      // Trigger a "catch" sound/haptic right as we start settling
      playClick();
      vibrate(8);

      animate(y, finalY, {
        type: "spring",
        stiffness: 180, // Snappier return
        damping: 24,    // More damped to stop oscillation quickly
        mass: 2.2,      // Significantly heavier feel
        onComplete: () => {
          // Sharp mechanical "engagement" feel
          vibrate([10, 4, 10]); 
          playClick();
        }
      });
    }
    return memo;
  }, {
    from: () => [0, y.get()],
    filterTaps: true,
  });

  const handleTap = (idx: number) => {
    if (idx === activeIndex) return;

    vibrate([10, 5, 10]); // Distinct tap haptic
    playClick();
    
    const targetY = idx * -150;
    animate(y, targetY, {
      type: "spring",
      stiffness: 140,
      damping: 20,
      mass: 1.5
    });
    
    onIndexChange(idx);
    lastHapticIndex.current = idx;
  };

  // Calculate global refractive intensity based on tilt intensity (capped at 45 degrees)
  const tiltIntensity = Math.min(1, (Math.abs(gyro.beta) + Math.abs(gyro.gamma)) / 45);

  return (
    <div 
      {...(bind() as any)}
      className="w-full h-[60vh] relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d', rotateY: gyro.gamma * 0.3 }}
      >
        {projects.map((project, idx) => {
          const angle = (idx - activeIndex) * (360 / projects.length);
          const isActive = idx === activeIndex;
          
          return (
            <motion.div
              key={project.id}
              onClick={() => handleTap(idx)}
              className={`absolute w-72 h-48 rounded-2xl glass-blur overflow-hidden flex flex-col justify-end p-6 transition-all duration-500 cursor-pointer ${
                isActive 
                  ? 'ring-2 ring-cyan-500/60 scale-105 z-30 opacity-100 shadow-[0_0_80px_rgba(34,211,238,0.7)]' 
                  : 'opacity-10 blur-[8px] scale-75 z-10 grayscale-[100%]'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${-angle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
              }}
              whileHover={{ 
                scale: isActive ? 1.18 : 0.8, 
                opacity: isActive ? 1 : 0.3,
                grayscale: isActive ? 0 : 80,
                boxShadow: isActive 
                  ? "0 0 120px rgba(34, 211, 238, 0.9)" 
                  : "0 0 50px rgba(255, 255, 255, 0.4)",
                transition: { duration: 0.25, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Layer 1: Hyper-Intensified Deepest "Void" Background (Scale 5.0, 30x Multiplier) */}
              {/* Dynamic Blur intensified: Base 4px, up to 24px more at max tilt */}
              <div 
                className="absolute inset-[-250px] z-0 opacity-90 pointer-events-none"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${4 + tiltIntensity * 24}px) brightness(${1 - tiltIntensity * 0.45})`,
                  transform: `
                    scale(5.0) 
                    translate(${gyro.gamma * 30}px, ${gyro.beta * 30}px)
                    rotateY(${gyro.gamma * 1.2}deg)
                    rotateX(${gyro.beta * -1.2}deg)
                  `,
                  transition: 'transform 0.03s linear, filter 0.1s ease-out'
                }}
              />

              {/* Layer 2: Triple Chromatic Refraction Layer (Red Split - 35x Multiplier) */}
              {/* Added dynamic blur for scattering effect */}
              <div 
                className="absolute inset-[-250px] z-0 opacity-30 mix-blend-screen pointer-events-none"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `contrast(1.8) saturate(1.8) blur(${tiltIntensity * 12}px)`,
                  transform: `
                    scale(5.1) 
                    translate(${gyro.gamma * 35}px, ${gyro.beta * 35}px)
                  `,
                  transition: 'transform 0.05s linear, filter 0.1s ease-out'
                }}
              />

              {/* Layer 3: Triple Chromatic Refraction Layer (Blue Split - 40x Multiplier) */}
              {/* Added dynamic blur for scattering effect */}
              <div 
                className="absolute inset-[-250px] z-0 opacity-30 mix-blend-screen pointer-events-none"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `contrast(1.8) hue-rotate(180deg) blur(${tiltIntensity * 16}px)`,
                  transform: `
                    scale(5.2) 
                    translate(${gyro.gamma * 40}px, ${gyro.beta * 40}px)
                  `,
                  transition: 'transform 0.06s linear, filter 0.1s ease-out'
                }}
              />
              
              {/* Layer 4: Ultra-High-Velocity Dynamic Reflections (45x Multiplier) */}
              <div 
                className="absolute inset-[-150px] z-10 pointer-events-none bg-gradient-to-tr from-white/70 via-transparent to-white/40 opacity-90 mix-blend-overlay"
                style={{
                  transform: `translate(${gyro.gamma * 45}px, ${gyro.beta * 45}px) rotate(${gyro.gamma * 0.4}deg)`,
                  transition: 'transform 0.03s linear'
                }}
              />
              
              {/* Layer 5: Dual Dynamic Glints (Light Catching Edges - 60x Counter-Movement) */}
              <div 
                className="absolute inset-0 z-11 pointer-events-none opacity-80 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,1) 0%, transparent 60%)',
                  width: '180px',
                  height: '180px',
                  left: '20%',
                  top: '30%',
                  transform: `translate(${gyro.gamma * -60}px, ${gyro.beta * -60}px) scale(${1.2 + tiltIntensity * 2})`,
                  transition: 'transform 0.02s linear'
                }}
              />
              <div 
                className="absolute inset-0 z-11 pointer-events-none opacity-50 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle at center, rgba(34,211,238,0.9) 0%, transparent 70%)',
                  width: '240px',
                  height: '240px',
                  left: '75%',
                  top: '65%',
                  transform: `translate(${gyro.gamma * -50}px, ${gyro.beta * -50}px) scale(${1 + tiltIntensity * 1.2})`,
                  transition: 'transform 0.03s linear'
                }}
              />

              {/* Layer 6: Floating Spatial UI Content (Counter-Movement for Depth) */}
              <div 
                className="relative z-20 flex flex-col pointer-events-none"
                style={{
                    transform: `translate(${gyro.gamma * -5}px, ${gyro.beta * -5}px) translateZ(60px)`,
                    transition: 'transform 0.05s ease-out'
                }}
              >
                <div className="backdrop-blur-xl bg-black/50 p-4 -m-4 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    <span className="text-[10px] tracking-[0.7em] text-cyan-400 font-bold uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Project 0{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">{project.title}</h3>
                  <p className="text-[12px] text-white/90 mt-1 uppercase tracking-[0.45em] font-semibold drop-shadow-md">{project.category}</p>
                </div>
              </div>

              {/* Enhanced Sub-Surface Scattering & Edge Glow */}
              <div 
                className="absolute inset-0 z-15 pointer-events-none border-[3px] border-white/40 rounded-2xl"
                style={{
                    boxShadow: `
                      inset ${gyro.gamma * 6}px ${gyro.beta * 6}px 40px rgba(255,255,255,0.25),
                      inset ${gyro.gamma * -4}px ${gyro.beta * -4}px 20px rgba(34,211,238,0.2)
                    `
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
