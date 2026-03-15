import React from 'react';
import { motion } from 'framer-motion';

export function PremiumHeader() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.03] py-3 md:py-5 overflow-hidden"
    >
      {/* Decorative Symmetric Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-20, 20, -20]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 -top-20 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [20, -20, 20]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full"
        />
        
        {/* Subtle Geometric Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-center relative z-10 px-4">
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
             <img 
               src="/logo.png" 
               alt="Moodwear Logo" 
               className="h-6 md:h-8 w-auto brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity" 
             />
             <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute inset-0 bg-purple-500 blur-xl rounded-full -z-10"
             />
          </motion.div>
          <h1 
            className="text-lg md:text-xl text-zinc-400 group-hover:text-white transition-colors duration-500 tracking-[0.1em] font-accent font-bold" 
          >
            Moodwear
          </h1>
        </div>
      </div>
    </motion.header>
  );
}
