// src/components/landing/BackgroundMesh.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function BackgroundMesh() {
  const particles = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 w-full h-full bg-[#F3F4F6] overflow-hidden select-none pointer-events-none z-0">
      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* Floating Aurora Glowing Orb 1: Soft Orange/Amber (Top Left) */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-orange-400/10 via-amber-300/5 to-transparent blur-[100px]"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Aurora Glowing Orb 2: Soft Blue-Purple (Bottom Right) */}
      <motion.div
        className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-400/10 via-purple-400/5 to-transparent blur-[120px]"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Aurora Glowing Orb 3: Soft Lavender (Center-Left) */}
      <motion.div
        className="absolute top-[30%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[90px]"
        animate={{
          x: [0, 25, -25, 0],
          y: [0, 40, -15, 0],
          scale: [1, 1.12, 0.88, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Dynamic Floating Particles */}
      <div className="absolute inset-0 w-full h-full">
        {particles.map((_, i) => {
          const size = Math.random() * 3 + 2; // 2px to 5px
          const delay = Math.random() * 5;
          const duration = Math.random() * 12 + 10;
          const left = `${Math.random() * 100}%`;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-orange-400/10"
              style={{
                width: size,
                height: size,
                left,
                top: '110%',
                boxShadow: '0 0 6px rgba(249, 115, 22, 0.2)',
              }}
              animate={{
                top: '-10%',
                x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40],
                opacity: [0, 0.6, 0.6, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      {/* Subtle bottom fade to create soft transitions */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#EFEFEF] to-transparent" />
    </div>
  );
}
