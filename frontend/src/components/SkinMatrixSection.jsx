import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Zap, Layers } from 'lucide-react';
import { GlassCard } from './GlassCard';

const MATRIX_DATA = [
  {
    tone: 'Light Warm',
    depth: 'Light',
    temp: 'Warm',
    hex: '#F3D2B3', // Realistic Fair Wheatish (Golden)
    description: 'Delicate ivory or peachy profile with high luminosity. Sensitive to color weight.',
    bestPalette: ['#fecaca', '#ebf4ff', '#ecfdf5', '#fffbeb'], // Soft Pastels
    logic: 'Requires high-chroma, low-weight colors to prevent "drowning" the features.'
  },
  {
    tone: 'Light Cool',
    depth: 'Light',
    temp: 'Cool',
    hex: '#EFC6A6', // Realistic Fair Olive/Cool
    description: 'Porcelain-like skin with distinct rosy or violet undertones. Naturally elegant and fresh.',
    bestPalette: ['#93c5fd', '#c4b5fd', '#f9a8d4', '#e0e7ff'], // Icy Pastels
    logic: 'Harmonizes with blue-based pigments to reduce surface redness.'
  },
  {
    tone: 'Light Neutral',
    depth: 'Light',
    temp: 'Neutral',
    hex: '#EACBAF', // Balanced Fair Wheatish
    description: 'Balanced undertones with exceptional surface clarity. High light-reflectance.',
    bestPalette: ['#fbbf24', '#22d3ee', '#818cf8', '#f472b6'], // Vivid Saturation
    logic: 'Thrives on clarity and high saturation to lift the natural glow.'
  },
  {
    tone: 'Dusky Warm',
    depth: 'Dusky',
    temp: 'Warm',
    hex: '#C68642', // Realistic Golden Tan (South Asian Medium)
    description: 'Rich earthy warmth with a muted, low-saturation surface. Soft, approachable glow.',
    bestPalette: ['#78350f', '#9a3412', '#3f6212', '#b45309'], // Earth Tones
    logic: 'Matches internal warm frequency to ensure a seamless visual transition.'
  },
  {
    tone: 'Dusky Cool',
    depth: 'Dusky',
    temp: 'Cool',
    hex: '#A67B5B', // Realistic Medium Olive/Cool
    description: 'Velvet or ashy quality. Refined tonal sophistication without sharp contrast.',
    bestPalette: ['#475569', '#6d28d9', '#be185d', '#1e40af'], // Muted Jewels
    logic: 'Focuses on tonal harmony over sharp contrast to avoid "clashing" with muted base.'
  },
  {
    tone: 'Dusky Neutral',
    depth: 'Dusky',
    temp: 'Neutral',
    hex: '#B58B5F', // Balanced South Asian Medium Brown
    description: 'Sun-kissed median. Neither too light nor too dark, with balanced carotene.',
    bestPalette: ['#0d9488', '#4f46e5', '#db2777', '#f59e0b'], // Balanced Saturated
    logic: 'Versatile category that handles both warm and cool medium-value tones.'
  },
  {
    tone: 'Dark Warm',
    depth: 'Dark',
    temp: 'Warm',
    hex: '#8D5524', // Realistic Deep Bronze/Mahogany
    description: 'High-intensity deep warmth. Rich, glowing carotene concentration.',
    bestPalette: ['#ea580c', '#ca8a04', '#166534', '#991b1b'], // Deep Autumn
    logic: 'Requires strong, heavy-weight colors to match the skin\'s natural depth.'
  },
  {
    tone: 'Dark Cool',
    depth: 'Dark',
    temp: 'Cool',
    hex: '#5E3A26', // Realistic Deep Cool Ebony/Brown
    description: 'Deep blue/violet undertones. High-contrast, dramatic, and regal appearance.',
    bestPalette: ['#581c87', '#111827', '#065f46', '#1e3a8a'], // Midnight Jewels
    logic: 'Aligns with intense cool temperatures to make facial features "pop" brilliantly.'
  },
  {
    tone: 'Dark Neutral',
    depth: 'Dark',
    temp: 'Neutral',
    hex: '#4E2F1E', // Darkest Coffee/Balanced South Asian
    description: 'Rich, unified depth with high visual weight. Naturally authoritative.',
    bestPalette: ['#1e293b', '#4c1d95', '#831843', '#0f172a'], // Deep Contrast
    logic: 'Matches the intensity of the skin with equally "weighty" materials and colors.'
  }
];

export function SkinMatrixSection() {
  return (
    <section className="mt-12 px-4 md:px-0 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span className="text-xs uppercase font-black tracking-[0.3em] text-zinc-500">The Science of Harmony</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              The 9-Category <span className="text-indigo-500">Skin Matrix</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-2xl font-medium">
              Our automated engine classifies every user into a 3x3 matrix based on Depth and Temperature. 
              Explore your archetype below to understand the biological logic of your palette.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {MATRIX_DATA.map((item, idx) => (
            <motion.div
              key={item.tone}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
            >
              <GlassCard className="h-full group hover:border-indigo-500/20 transition-all duration-500 p-4 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl shadow-lg border border-white/10" 
                      style={{ backgroundColor: item.hex }}
                    />
                    <div>
                      <h3 className="text-white font-black uppercase tracking-tight text-[11px] leading-tight">{item.tone}</h3>
                      <div className="flex gap-1 mt-0.5">
                        <span className="text-[9px] px-1 py-0 bg-white/5 text-zinc-500 rounded uppercase font-bold">{item.depth}</span>
                        <span className="text-[9px] px-1 py-0 bg-indigo-500/10 text-indigo-400 rounded uppercase font-bold">{item.temp}</span>
                      </div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-800 group-hover:text-indigo-500 transition-colors" />
                </div>

                <p className="text-zinc-500 text-[10px] leading-relaxed mb-4 flex-1">
                  {item.description}
                </p>

                <div className="space-y-3">
                  <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Palette className="w-2.5 h-2.5 text-zinc-600" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Palette</span>
                    </div>
                    <div className="flex gap-1.5">
                      {item.bestPalette.map(c => (
                        <div key={c} className="w-5 h-5 rounded border border-white/5" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 px-0.5">
                    <Zap className="w-2.5 h-2.5 text-indigo-500/60 mt-0.5" />
                    <p className="text-[9px] text-zinc-600 leading-tight">
                      <span className="text-zinc-400 font-bold">Logic:</span> {item.logic}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
