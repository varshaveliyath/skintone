import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Zap, Target, Thermometer, Sun, Moon, Wind } from 'lucide-react';
import { GlassCard } from './GlassCard';

/* ────────────────────────────────────────────
   SEASONAL QUADRANT DATA
──────────────────────────────────────────── */
const SEASONS = [
  {
    id: 'spring',
    name: 'Spring',
    pos: 'top-right',
    temp: 'Warm',
    depth: 'Bright / Clear',
    icon: Sun,
    color: 'amber',
    hexes: ['#fde047', '#f97316', '#4ade80', '#fb7185', '#fbbf24'],
    desc: 'High-chroma, warm pigments that mimic the clarity of sunrise. Ideal for light wheatish to medium-warm skin.',
    coord: '+X, +Y'
  },
  {
    id: 'summer',
    name: 'Summer',
    pos: 'top-left',
    temp: 'Cool',
    depth: 'Muted / Soft',
    icon: Wind,
    color: 'cyan',
    hexes: ['#93c5fd', '#c084fc', '#f9a8d4', '#818cf8', '#2dd4bf'],
    desc: 'Dusky, low-saturation cool tones. These hues provide a serene, sophisticated elegance for cool-medium skin.',
    coord: '-X, +Y'
  },
  {
    id: 'autumn',
    name: 'Autumn',
    pos: 'bottom-right',
    temp: 'Warm',
    depth: 'Muted / Deep',
    icon: Target,
    color: 'orange',
    hexes: ['#78350f', '#9a3412', '#3f6212', '#ea580c', '#d97706'],
    desc: 'Rich, organic warmth with high visual weight. Matches the depth of dusky-warm and deep-warm Indian skin tones.',
    coord: '+X, -Y'
  },
  {
    id: 'winter',
    name: 'Winter',
    pos: 'bottom-left',
    temp: 'Cool',
    depth: 'Clear / Dark',
    icon: Moon,
    color: 'indigo',
    hexes: ['#1e3a8a', '#4c1d95', '#be185d', '#064e3b', '#0f172a'],
    desc: 'Intense, icy cool jewel tones. These provide a powerful, authority-driven contrast for deep-cool skin profiles.',
    coord: '-X, -Y'
  }
];

export function ColorTheorySection() {
  return (
    <section className="mt-24 mb-40 px-4 md:px-0 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Header: The Map Identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase font-black tracking-widest text-indigo-400">
                  Aesthetic Cartography
               </div>
               <div className="h-px w-12 bg-zinc-800" />
               <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600">The 4-Direction theory</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85]">
               Seasonal <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500 italic">Quadrant</span> Map
            </h2>
            <p className="text-zinc-500 text-sm max-w-2xl font-medium leading-relaxed">
               Navigate the intersection of Temperature (X) and Clarity (Y). Our central wheel acts as the 
               origin point for the four biological seasons in fashion.
            </p>
          </div>
        </div>

        {/* 2. The Quadrant Grid */}
        <div className="relative min-h-[800px] flex items-center justify-center p-4">
           
           {/* COORDINATE AXES */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* X-Axis */}
              <div className="w-full h-px bg-white/10 relative">
                 <div className="absolute left-4 -top-6 text-[10px] font-black text-zinc-600 tracking-widest uppercase">Cool Tones (-X)</div>
                 <div className="absolute right-4 -top-6 text-[10px] font-black text-zinc-600 tracking-widest uppercase">Warm Tones (+X)</div>
              </div>
              {/* Y-Axis */}
              <div className="h-full w-px bg-white/10 absolute">
                 <div className="absolute -left-12 top-4 -rotate-90 text-[10px] font-black text-zinc-600 tracking-widest uppercase origin-right">Clear Profile (+Y)</div>
                 <div className="absolute -left-12 bottom-4 rotate-90 text-[10px] font-black text-zinc-600 tracking-widest uppercase origin-right">Muted Profile (-Y)</div>
              </div>
           </div>

           {/* CENTRAL COLOR WHEEL (The 0,0 Point) */}
           <div className="relative z-20">
              <div className="absolute inset-0 bg-indigo-500/30 blur-[100px] rounded-full" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full p-2 bg-zinc-950 border-2 border-white/20 shadow-2xl flex items-center justify-center group overflow-hidden">
                 <div 
                   className="w-full h-full rounded-full"
                   style={{
                     background: 'conic-gradient(from 180deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)',
                   }}
                 />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white italic tracking-tighter">0 , 0</span>
                 </div>
              </div>
           </div>

           {/* SEASONAL CARDS */}
           <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4 md:p-12 gap-6 md:gap-12">
              {SEASONS.map((season, idx) => {
                const Icon = season.icon;
                return (
                  <motion.div
                    key={season.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex ${season.pos.includes('left') ? 'justify-start' : 'justify-end'} ${season.pos.includes('top') ? 'items-start' : 'items-end'}`}
                  >
                    <GlassCard className="max-w-[340px] p-6 space-y-5 group hover:border-white/20 transition-all duration-500">
                       <div className="flex items-start justify-between">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                                <span className={`text-sm font-black uppercase tracking-widest ${
                                   season.id === 'spring' ? 'text-amber-400' :
                                   season.id === 'summer' ? 'text-cyan-400' :
                                   season.id === 'autumn' ? 'text-orange-500' :
                                   'text-indigo-400'
                                }`}>
                                   {season.name} Phase
                                </span>
                             </div>
                          </div>
                          <div className="text-[8px] font-black text-zinc-600 bg-white/5 px-1.5 py-1 rounded-md border border-white/5">
                             {season.coord}
                          </div>
                       </div>

                       <div className="space-y-3">
                          <div className="flex gap-1.5">
                             {season.hexes.map(hex => (
                               <div key={hex} className="w-5 h-5 rounded-md border border-white/5" style={{ backgroundColor: hex }} />
                             ))}
                          </div>
                          <p className="text-zinc-500 text-[10px] leading-relaxed font-medium">
                            {season.desc}
                          </p>
                       </div>

                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Temperature</p>
                             <p className="text-[10px] text-zinc-300 font-bold uppercase">{season.temp}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Surface Logic</p>
                             <p className="text-[10px] text-zinc-300 font-bold uppercase">{season.depth}</p>
                          </div>
                       </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
           </div>

        </div>

        {/* Tactical Footer Note */}
        <div className="mt-20 flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 text-zinc-800">
              <div className="h-px w-24 bg-current" />
              <Zap className="w-5 h-5" />
              <div className="h-px w-24 bg-current" />
           </div>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] text-center">
              Coordinated Spectral Synthesis
           </p>
        </div>

      </div>
    </section>
  );
}
