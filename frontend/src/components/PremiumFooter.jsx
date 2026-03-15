import { Github, Linkedin, FileText } from 'lucide-react';

export function PremiumFooter({ onDocsClick }) {
  return (
    <footer className="w-full py-16 border-t border-white/[0.03] bg-[#050505] mt-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 text-center md:text-left">
        <div className="flex items-center gap-4 group cursor-pointer justify-center md:justify-start">
           <img src="/logo.png" alt="Logo" className="h-6 w-auto brightness-0 invert opacity-40 group-hover:opacity-80 transition-all" />
           <span className="text-lg text-zinc-500 group-hover:text-white transition-colors duration-500 font-accent font-bold tracking-[0.1em]">Moodwear</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-10">
            <button 
              onClick={onDocsClick}
              className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all"
              title="Project Documentation"
            >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Documentation</span>
            </button>

            <div className="hidden sm:block w-px h-6 bg-zinc-800" />

            <div className="flex items-center gap-6">
                <a 
                  href="https://linkedin.com/in/varshaveliyath" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-zinc-600 hover:text-white transition-all hover:scale-110"
                >
                    <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/varshaveliyath/skintone" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-zinc-600 hover:text-white transition-all hover:scale-110"
                >
                    <Github className="w-5 h-5" />
                </a>
            </div>
        </div>
        
        <div className="text-[8px] md:text-[9px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-zinc-800 font-black">
           © {new Date().getFullYear()} Aesthetic Intelligence Engine
        </div>
      </div>
    </footer>
  );
}
