import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Sparkles, RefreshCcw } from 'lucide-react';

const ItemDescription = ({ text }) => {
  if (!text || text === "None" || text === "N/A") {
    return <span className="text-zinc-200 text-xs font-medium">{text}</span>;
  }
  
  // Look for the "Color (Item Description)" pattern
  const match = text.match(/^(.*?)\s\((.*?)\)$/);
  
  if (match) {
    const [, color, item] = match;
    return (
      <span className="text-xs font-medium">
        <span className="text-white">{color}</span>
        <span className="text-zinc-500 text-[10px] ml-1">({item})</span>
      </span>
    );
  }
  
  return <span className="text-zinc-200 text-xs font-medium">{text}</span>;
};

export function OutfitSection({ result, outfits, onRefresh, onCurate }) {
  const [event, setEvent] = React.useState('');
  const [season, setSeason] = React.useState('Summer');

  if (!outfits || outfits.length === 0) return null;

  return (
    <section className="mt-12 md:mt-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-6 md:h-8 bg-purple-600 rounded-full" />
            <span className="text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-zinc-500">ML Recommendations</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            Associated <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Palettes</span>
          </h2>
          <p className="text-zinc-500 text-sm md:text-lg font-medium max-w-xl italic">
            Visualizing three distinct style archetypes calibrated to your unique pigment signature.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/5 justify-between sm:justify-start">
             <span className="text-[10px] font-black text-zinc-500 uppercase">Season</span>
             <select 
               value={season}
               onChange={(e) => setSeason(e.target.value)}
               className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
             >
               {['Spring', 'Summer', 'Autumn', 'Winter'].map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
             <input 
               type="text" 
               placeholder="Specify event (e.g. Wedding)" 
               className="bg-zinc-900/50 border border-white/5 rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-48 md:w-64"
               value={event}
               onChange={(e) => setEvent(e.target.value)}
             />
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => onCurate(event, season)}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-black text-white uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 active:scale-95"
               >
                 <Sparkles className="w-4 h-4" />
                 Curate
               </button>
               <button 
                 onClick={onRefresh}
                 className="p-2.5 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors active:rotate-180 duration-500"
               >
                 <RefreshCcw className="w-5 h-5" />
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {outfits.map((outfit, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard 
              className="flex flex-col h-full w-full p-6 transition-all duration-500 border-2 border-white/5"
            >
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-lg font-bold text-white tracking-tight">{outfit.outfitName}</h4>
                <div className="flex gap-2">
                  {outfit.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full border-2 border-zinc-900 shadow-lg"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-tighter">Top</span>
                  <ItemDescription text={outfit.top} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-tighter">Bottom</span>
                  <ItemDescription text={outfit.bottom} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-tighter">Footwear</span>
                  <ItemDescription text={outfit.footwear} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-tighter">Layer</span>
                  <ItemDescription text={outfit.layer} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-zinc-400 text-xs italic leading-relaxed">{outfit.jewelry}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
