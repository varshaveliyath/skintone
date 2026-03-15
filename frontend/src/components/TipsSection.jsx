import React from 'react';
import { GlassCard } from './GlassCard';
import { Lightbulb, Share2 } from 'lucide-react';

export function TipsSection({ rules }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 bg-zinc-900/30 rounded-3xl md:rounded-[4rem] mb-20 border border-white/5">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">Style Guidelines</h2>
        <div className="w-16 md:w-20 h-1 bg-purple-600 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {rules.map((rule, idx) => (
          <GlassCard key={idx} className="bg-purple-600/5 border-purple-500/10 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
               <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb className="text-purple-400" />
               </div>
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">{rule.title}</h3>
                  <p className="text-zinc-500 text-xs md:text-sm leading-relaxed mb-6 font-medium">{rule.description}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    {rule.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                        <span className="text-[10px] text-zinc-300 font-medium">{color.name}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
