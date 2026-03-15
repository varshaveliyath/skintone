import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Layers, Zap, Info, ShieldCheck, FileText, Code, Database, Brain, Rocket } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function ProjectDocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "Frontend Details",
      icon: Cpu,
      content: [
        { label: "Frontend Framework", value: "React 18 + JavaScript" },
        { label: "Design System", value: "Tailwind CSS + Custom Glow Effects" },
        { label: "Motion Engine", value: "Framer Motion for smooth transitions" }
      ]
    },
    {
      title: "5 AI Models",
      icon: Layers,
      content: [
        { label: "Skin Classifier", value: "Gradient Boosting model mapping spectral data to 12 seasonal subtypes." },
        { label: "Color Scorer", value: "Random Forest Regressor measuring harmony with 100,000 reference points." },
        { label: "Female Stylist", value: "KNN Engine (F) for chic, high-fashion feminine recommendations." },
        { label: "Male Stylist", value: "KNN Engine (M) for tailored, versatile masculine recommendations." },
        { label: "Static Router", value: "Unified server logic delivering both API and UI from a single core." }
      ]
    },
    {
      title: "Backend & Workflow",
      icon: Zap,
      content: [
        { label: "Core Backend", value: "FastAPI + Gunicorn Production Server" },
        { label: "Static Integration", value: "Single-port SPA routing for dist assets" },
        { label: "AI Framework", value: "Scikit-learn + NumPy + Joblib" },
        { label: "Face Mapping", value: "MediaPipe FaceMesh (468 landmarks)" },
        { label: "Pipeline", value: "Spectral Analysis → Neutral Inference → Stylist Curation" }
      ]
    }
  ];

  const technicalDocs = [
    {
      id: "vision",
      title: "1. Project Vision & Overview",
      icon: Rocket,
      text: "Moodwear represents the frontier of Personalized Color Theory integrated with state-of-the-art Computer Vision and Machine Learning. The fundamental problem it solves is the disconnect between digital fashion curation and individual biological harmony. Most fashion recommendation systems focus on trend-following or item-similarity; Moodwear refocuses the lens on the user's unique spectral profile. By analyzing the nuanced interaction between skin undertones, depth, and color luminosity, Moodwear provides a scientifically-backed wardrobe curation that enhances the user's natural aesthetic."
    },
    {
      id: "frontend",
      title: "2. Frontend Architecture",
      icon: Code,
      text: "The Moodwear frontend is engineered for a premium, high-fidelity experience, adhering to the 'Obsidian Prism' design philosophy. This aesthetic is characterized by deep matte blacks, subtle violet and cyan glows, and high-contrast prism edge highlights that guide the user's eye through the data-rich interface.\n\nReact 18 was chosen for its robust state management and concurrent rendering capabilities, ensuring the UI remains responsive even during complex image processing phases. Tailwind CSS is utilized for a highly customizable design system, extended with custom utility classes for 'glass-morphism' effects and 'cyber-glow' animations. Framer Motion powers the fluid transitions, while Lucide React provides a cohesive, minimalist icon set."
    },
    {
      id: "backend",
      title: "3. Backend Infrastructure",
      icon: Database,
      text: "The backend is a high-performance Python-based microservice designed for low-latency inference and secure data handling. FastAPI serves as the core web framework, selected for its native support for asynchronous programming (ASGI), automatic OpenAPI documentation, and superior speed in handling high-concurrency requests. Uvicorn acts as the ASGI server, providing a stable and fast production environment. The RESTful API serves as the communication bridge, with dedicated endpoints for image analysis and outfit generation."
    },
    {
      id: "cv",
      title: "4. Computer Vision Pipeline",
      icon: Brain,
      text: "The journey from a raw image to a personalized palette begins with our Computer Vision pipeline. We utilize Google's MediaPipe FaceMesh to generate a high-density 3D coordinate map of the user's face, consisting of 468 landmarks. Instead of taking a broad average, the system targets specific 'safe zones' for skin tone extraction: the cheeks, jawline, and forehead. Thousands of pixels are extracted, calculating average RGB values and a 'Darkness Score' crucial for determining skin depth."
    },
    {
      id: "ai",
      title: "5. AI Models: The Intelligence Core",
      icon: Brain,
      text: "Moodwear employs a multi-stage AI inference engine. The Skin Classifier (Gradient Boosting) classifies users into one of the 12 professional seasonal subtypes. The Color Compatibility Scorer (Random Forest) predicts Match Scores by capturing multi-dimensional feature interactions. \n\nA key advancement in our latest build is the Gender-Specific Curation system. We've deployed dual KNN (K-Nearest Neighbors) models—one fine-tuned on feminine high-fashion aesthetics and another on tailored masculine styles. This ensures that recommendations aren't just color-accurate, but stylistically relevant to the user's selected gender base."
    },
    {
      id: "data",
      title: "6. Data Science Methodology",
      icon: FileText,
      text: "Data is the lifeblood of Moodwear. In the absence of public accurately labeled datasets, we engineered a 'Legit Dataset' generator mapping the 12 seasons to Munsell Color System (Hue, Value, Chroma) ranges. Our training methodology uses continuous harmony scores based on complementary hues, contrast ratios, and luminosity levels, allowing models to learn the nuance of aesthetic harmony rather than just static lists."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-5xl relative z-10"
        >
          <GlassCard className="p-8 md:p-12 overflow-hidden border-white/10 bg-[#0c0c0e]/95 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500">System Documentation</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Project Intelligence</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{section.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {section.content.map((item, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1 group-hover:text-purple-500 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-zinc-300 text-xs font-medium leading-relaxed">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Detailed Technical Specs</h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-12">
                {technicalDocs.map((doc) => (
                  <div key={doc.id} className="relative group">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/50 transition-all duration-500">
                          <doc.icon className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <div className="w-[1px] flex-1 bg-gradient-to-b from-purple-500/20 to-transparent mt-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="text-lg font-bold text-white mb-4 group-hover:text-purple-400 transition-colors tracking-tight">{doc.title}</h4>
                        <p className="text-zinc-400 text-sm leading-8 tracking-wide font-medium whitespace-pre-line text-justify group-hover:text-zinc-300 transition-colors">
                          {doc.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-green-500/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Security Status: Logic Verified</span>
              </div>
              <div className="text-[10px] font-mono opacity-50">
                KERNEL_BUILD: 2024.03.14.PRISM
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
