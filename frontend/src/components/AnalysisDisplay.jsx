import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';

export function AnalysisDisplay({ result, subtypeDescriptions }) {
  const [displayColors, setDisplayColors] = useState([]);

  useEffect(() => {
    if (result?.recommended_colors) {
      setDisplayColors(result.recommended_colors.slice(0, 8));
    }
  }, [result]);

  if (!result) return null;

  const descriptions = subtypeDescriptions[result.skin_subtype] || [];

  const handleRefreshColors = () => {
    if (!result?.recommended_colors || result.recommended_colors.length <= 8) return;
    
    // Pick 8 random colors from the total recommended pool
    const shuffled = [...result.recommended_colors].sort(() => 0.5 - Math.random());
    setDisplayColors(shuffled.slice(0, 8));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
      {/* Primary Result View */}
      <GlassCard className="lg:col-span-4 flex flex-col items-center justify-center text-center py-8 md:py-12">
        <div className="relative mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-white/5 shadow-[0_0_50px_rgba(147,51,234,0.3)]"
            style={{ backgroundColor: result.avg_total_hex }}
          />
          <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-purple-600 px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-white">
            ML Precise
          </div>
        </div>
        
        <h3 className="text-[10px] md:text-sm uppercase tracking-widest text-zinc-500 mb-2 font-black">Classification Result</h3>
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-1 uppercase tracking-tight">
          {result.skin_subtype}
        </h2>
        <span className="text-[10px] md:text-xs text-zinc-500 font-mono mb-4">{result.avg_total_hex}</span>
        
        {/* Personalized Gradient Strip */}
        <div className="w-full px-4 md:px-6 mb-6">
            <h3 className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-[0.2em]">Complete Match Spectrum</h3>
            <div 
              className="w-full h-6 md:h-8 rounded-full shadow-inner opacity-90 border border-white/5"
              style={{
                background: `linear-gradient(to right, ${(() => {
                  const getVibgyorScore = (hex) => {
                    const rawHex = hex.replace('#', '');
                    const r = parseInt(rawHex.substring(0, 2), 16) / 255;
                    const g = parseInt(rawHex.substring(2, 4), 16) / 255;
                    const b = parseInt(rawHex.substring(4, 6), 16) / 255;
                    const max = Math.max(r, g, b), min = Math.min(r, g, b);
                    let h = 0;
                    if (max !== min) {
                      const d = max - min;
                      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                      else if (max === g) h = (b - r) / d + 2;
                      else h = (r - g) / d + 4;
                      h /= 6;
                    }
                    let hue = h * 360;
                    if (hue > 330) hue -= 360;
                    return hue;
                  };
                  return [...result.recommended_colors]
                    .sort((a, b) => getVibgyorScore(b.hex) - getVibgyorScore(a.hex))
                    .map(c => c.hex)
                    .join(', ');
                })()})`
              }}
              title="Personalized Color Spectrum (VIBGYOR)"
            />
        </div>

        <div className="flex gap-4 mt-2 md:mt-4">
           <div className="flex flex-col items-center max-w-[80px]">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-white/10 mb-1" style={{ backgroundColor: result.avg_light_hex }} />
              <span className="text-[8px] md:text-[10px] text-zinc-100 font-bold uppercase mb-1">Highlight</span>
              <span className="text-[8px] text-zinc-500 font-mono mb-1">{result.avg_light_hex}</span>
           </div>
           <div className="flex flex-col items-center max-w-[80px]">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-white/10 mb-1" style={{ backgroundColor: result.avg_dark_hex }} />
              <span className="text-[8px] md:text-[10px] text-zinc-100 font-bold uppercase mb-1">Shadow</span>
              <span className="text-[8px] text-zinc-500 font-mono mb-1">{result.avg_dark_hex}</span>
           </div>
        </div>
      </GlassCard>

      {/* Detailed Insights */}
      <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
        <GlassCard className="flex-1 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3 text-white uppercase tracking-tight">
            <CheckCircle2 className="text-purple-500 w-5 h-5 md:w-6 md:h-6" />
            Your Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {descriptions.map((point, idx) => {
              const [title, desc] = point.split(':');
              return (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 + (idx * 0.1) }}
                   className="border-l-2 border-purple-500/30 pl-4 py-1"
                >
                  <h4 className="font-bold text-zinc-200 text-xs md:text-sm mb-1 uppercase tracking-wider">{title}</h4>
                  <p className="text-zinc-500 text-[11px] md:text-[13px] leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Palette Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <GlassCard className="border-green-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-green-400 font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Recommended
                    </h4>
                    {result.recommended_colors && result.recommended_colors.length > 8 && (
                        <button 
                          onClick={handleRefreshColors}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-tighter transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {displayColors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: c.hex }} title={c.name} />
                            <span className="text-[8px] md:text-[9px] text-zinc-300 font-bold text-center leading-tight truncate w-full px-1">{c.name}</span>
                            <span className="text-[7px] md:text-[8px] text-zinc-600 font-mono uppercase">{c.hex}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
            
            <GlassCard className="border-red-500/20 p-6">
                <h4 className="text-red-400 font-black text-xs md:text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Avoid Tones
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {result.avoid_colors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: c.hex }} title={c.name} />
                            <span className="text-[8px] md:text-[9px] text-zinc-300 font-bold text-center leading-tight truncate w-full px-1">{c.name}</span>
                            <span className="text-[7px] md:text-[8px] text-zinc-600 font-mono uppercase">{c.hex}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
      </div>
    </section>
  );
}
