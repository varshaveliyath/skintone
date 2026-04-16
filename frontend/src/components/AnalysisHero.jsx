import React from 'react';
import { motion } from 'framer-motion';

export function AnalysisHero() {
  return (
    <section className="relative w-full pt-32 md:pt-48 pb-16 md:pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <div className="absolute top-0 left-1/4 w-[40%] h-[60%] bg-purple-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40%] h-[60%] bg-cyan-600/10 blur-[180px] rounded-full animate-pulse" />
        
        {/* Architectural Mesh Grid */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 100%)'
          }} 
        />
        
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-6 max-w-5xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-8 md:mb-10 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-300">
            Precision Color Science
          </span>
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.9] text-white">
          Automated Personalized <br /> 
          <span className="text-zinc-500 hover:text-white transition-colors duration-700 cursor-default">
            Fashion Stylist
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-lg text-zinc-600 max-w-2xl mx-auto font-medium leading-relaxed mb-10 md:mb-12 tracking-wide">
          An AI-powered project that analyzes your skin tone and identifies your perfect color palette using machine learning models.
        </p>

        <div className="flex items-center justify-center gap-6 opacity-30">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/20" />
          <div className="text-[9px] uppercase font-bold tracking-[0.3em] text-zinc-500">
            AI Analysis System
          </div>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </motion.div>
    </section>
  );
}
