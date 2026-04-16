import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shirt, ArrowRight, Zap, RefreshCcw, PersonStanding, Check, Maximize2 } from 'lucide-react';
import AvatarViewer from './AvatarViewer';
import { GlassCard } from './GlassCard';

/* ────────────────────────────────────────────
   SKIN TONE SCALE (Used for overlay labels)
──────────────────────────────────────────── */
const SKIN_TONES = [
  { label: 'Fair',         hex: '#F3D2B3' },
  { label: 'Light',        hex: '#EACBAF' },
  { label: 'Med-Light',    hex: '#C68642' },
  { label: 'Medium',       hex: '#B58B5F' },
  { label: 'Med-Deep',     hex: '#8D5524' },
  { label: 'Deep',         hex: '#5E3A26' },
  { label: 'Richest',      hex: '#4E2F1E' },
];

/* ────────────────────────────────────────────
   HELPER COMPONENTS
──────────────────────────────────────────── */
const ItemDescription = ({ text }) => {
  if (!text || text === "None" || text === "N/A") {
    return <span className="text-zinc-200 text-xs font-medium">{text}</span>;
  }
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

const SkeletonOutfitCard = () => (
  <GlassCard className="flex flex-col h-full w-full p-5 border border-white/5 animate-pulse">
    <div className="mb-4 flex items-center justify-between">
      <div className="h-5 w-24 bg-white/10 rounded" />
      <div className="flex gap-1">
        <div className="w-5 h-5 rounded-full bg-white/10" />
        <div className="w-5 h-5 rounded-full bg-white/10" />
      </div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5">
          <div className="h-2 w-10 bg-white/5 rounded" />
          <div className="h-2 w-20 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </GlassCard>
);

const TabSelector = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{label}</span>
    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              isSelected 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

/* ────────────────────────────────────────────
   MAIN COMPONENT: SIDE-BY-SIDE TRIANGLE STUDIO
──────────────────────────────────────────── */
export function AvatarSection({ 
  result, 
  gender: externalGender, 
  activeOutfit, 
  outfits = [], 
  onRefresh, 
  onCurate, 
  loading,
  onApplyOutfit 
}) {
  const [gender, setGender] = useState(externalGender || 'female');
  const [skinColor, setSkinColor] = useState(result?.avg_total_hex || '#c68642');
  const [topColor, setTopColor] = useState('#1a1a1a');
  const [bottomColor, setBottomColor] = useState('#1a1a1a');
  const [shoeColor, setShoeColor] = useState('#1a1a1a');
  const [appliedLabel, setAppliedLabel] = useState(null);
  const [appliedIdx, setAppliedIdx] = useState(null);

  // Curation state
  const [event, setEvent] = useState('');
  const [season, setSeason] = useState('Summer');

  // Sync with external state
  useEffect(() => { setGender(externalGender); }, [externalGender]);
  useEffect(() => { if (result?.avg_total_hex) setSkinColor(result.avg_total_hex); }, [result?.avg_total_hex]);

  // Handle Try On
  useEffect(() => {
    if (!activeOutfit) return;
    // Use backend-provided snake_case hexes if available, otherwise fallback to camelCase
    const tH = activeOutfit.top_hex || activeOutfit.topHex;
    const bH = activeOutfit.bottom_hex || activeOutfit.bottomHex;
    const sH = activeOutfit.footwear_hex || activeOutfit.shoeHex || activeOutfit.footwearHex;

    if (tH) setTopColor(tH);
    if (bH) setBottomColor(bH);
    if (sH) setShoeColor(sH);
    
    setAppliedLabel(activeOutfit.outfitName || 'Outfit');
    const t = setTimeout(() => setAppliedLabel(null), 3000);
    return () => clearTimeout(t);
  }, [activeOutfit]);

  const closestTone = SKIN_TONES.reduce((prev, curr) => {
    const prevDist = Math.abs(parseInt(prev.hex.slice(1), 16) - parseInt(skinColor.slice(1), 16));
    const currDist = Math.abs(parseInt(curr.hex.slice(1), 16) - parseInt(skinColor.slice(1), 16));
    return currDist < prevDist ? curr : prev;
  }, SKIN_TONES[3]);

  if (!result && !loading) return null;

  // We only show up to 3 outfits for the triangle formation
  const displayOutfits = outfits.slice(0, 3);

  return (
    <section className="mt-12 md:mt-24 px-4 md:px-0 scroll-mt-20" id="try-on-studio">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <span className="text-xs uppercase font-black tracking-[0.4em] text-zinc-500">ML Precision Studio</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Try-On</span> Studio
          </h2>
        </div>

        {/* Studio Controls */}
        <div className="flex flex-col xl:flex-row items-end gap-6 bg-white/[0.02] p-3 rounded-2xl border border-white/5 backdrop-blur-2xl">
          <TabSelector 
            label="Season"
            value={season}
            onChange={setSeason}
            options={[
              { label: 'Spring', value: 'Spring' },
              { label: 'Summer', value: 'Summer' },
              { label: 'Autumn', value: 'Autumn' },
              { label: 'Winter', value: 'Winter' }
            ]}
          />

          <TabSelector 
            label="Event"
            value={event}
            onChange={setEvent}
            options={[
              { label: 'Casual', value: '' },
              { label: 'Office', value: 'Work' },
              { label: 'Night', value: 'Night' },
              { label: 'Gala', value: 'Wedding' }
            ]}
          />

          <button 
            onClick={() => onCurate(event, season)}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 whitespace-nowrap h-[38px]"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            Sync Palette
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Unified Stage (40/60 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
        
        {/* LEFT COLUMN: 3D Studio (40% / 4 Columns) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex-1 rounded-[32px] overflow-hidden border border-white/10 shadow-3xl bg-black"
            style={{ 
              height: '650px',
              background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.1) 0%, rgba(0,0,0,1) 100%)' 
            }}
          >
            {/* Visual Grid Overlays */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

            <AvatarViewer
              gender={gender}
              skinColor={skinColor}
              topColor={topColor}
              bottomColor={bottomColor}
              shoeColor={shoeColor}
            />

            {/* HUD: Active Status */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: skinColor, color: skinColor }} />
                 <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">{closestTone.label} Stage</span>
              </div>
              <AnimatePresence>
                {appliedLabel && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -10, opacity: 0 }}
                    className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl flex items-center gap-2"
                  >
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{appliedLabel} Active</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stage Info (Bottom Right) */}
            <div className="absolute bottom-6 right-6">
               <div className="flex gap-2.5 bg-black/50 backdrop-blur-2xl p-3 rounded-2xl border border-white/5">
                  {[{ l: 'T', c: topColor }, { l: 'B', c: bottomColor }, { l: 'S', c: shoeColor }].map(v => (
                    <div key={v.l} className="w-7 h-7 rounded-lg border border-white/10 shadow-lg" style={{ backgroundColor: v.c }} title={v.l} />
                  ))}
               </div>
            </div>
            
            {/* View Hint */}
            <div className="absolute bottom-6 left-6 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
               360° Viewport ACTIVE
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Triangle Formation (60% / 6 Columns) */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-6 relative">
            
            {/* Background Decorative Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none rounded-[32px] -m-4" />

            {loading ? (
              <>
                <div className="col-span-2 flex justify-center">
                  <div className="w-full max-w-[340px]"><SkeletonOutfitCard /></div>
                </div>
                <SkeletonOutfitCard />
                <SkeletonOutfitCard />
              </>
            ) : (
              <>
                {/* 1. TOP CARD (Triangle Apex) */}
                {displayOutfits[0] && (
                  <div className="col-span-2 flex justify-center mb-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-[340px]"
                    >
                      <OutfitCard 
                        outfit={displayOutfits[0]} 
                        idx={0} 
                        isApplied={appliedIdx === 0} 
                        onApply={() => {
                          onApplyOutfit(displayOutfits[0]);
                          setAppliedIdx(0);
                        }}
                      />
                    </motion.div>
                  </div>
                )}

                {/* 2 & 3. BOTTOM CARDS (Triangle Base) */}
                {displayOutfits.slice(1, 3).map((outfit, i) => {
                  const realIdx = i + 1;
                  return (
                    <motion.div
                      key={realIdx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * realIdx }}
                    >
                      <OutfitCard 
                        outfit={outfit} 
                        idx={realIdx} 
                        isApplied={appliedIdx === realIdx}
                        onApply={() => {
                          onApplyOutfit(outfit);
                          setAppliedIdx(realIdx);
                        }}
                      />
                    </motion.div>
                  );
                })}
              </>
            )}
            
            {/* If more than 3 outfits exist, provide hint */}
            {outfits.length > 3 && (
              <div className="col-span-2 text-center mt-4">
                <button 
                  onClick={() => onRefresh()}
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-indigo-400 transition-colors"
                >
                  Explore more variations <ArrowRight className="inline w-3 h-3 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   OUTFIT CARD COMPONENT (Uniform Size)
──────────────────────────────────────────── */
function OutfitCard({ outfit, idx, isApplied, onApply }) {
  return (
    <GlassCard className={`flex flex-col h-full w-full p-6 transition-all duration-500 border-2 ${isApplied ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 hover:border-white/10'}`}>
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

      <div className="space-y-3 mb-8 flex-1">
        {[
          { l: 'Top',      v: outfit.top },
          { l: 'Bottom',   v: outfit.bottom },
          { l: 'Footwear', v: outfit.footwear },
          { l: 'Layer',    v: outfit.layer }
        ].map(row => (
          <div key={row.l} className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-zinc-500 text-[10px] uppercase tracking-tighter">{row.l}</span>
            <ItemDescription text={row.v} />
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/10 pt-6 flex items-center justify-between gap-4">
        <p className="text-zinc-400 text-xs italic leading-relaxed flex-1 line-clamp-2 pr-2">
           {outfit.jewelry}
        </p>
        <button
          onClick={onApply}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all duration-300 ${
            isApplied
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40'
          }`}
        >
          {isApplied ? <Check className="w-3 h-3" /> : <PersonStanding className="w-3 h-3" />}
          {isApplied ? 'Applied' : 'Try On'}
        </button>
      </div>
    </GlassCard>
  );
}
