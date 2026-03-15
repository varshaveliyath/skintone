import React, { useState, useEffect } from "react";
import { subtypeDescriptions } from "./data/skinSubtypeDescriptions";
import { generateOutfitIdeas } from "./utils/generateOutfitIdeas";
import { getRandomFashionRule } from "./utils/fashionRules";

// Premium Components
import { PremiumHeader } from "./components/PremiumHeader";
import { AnalysisHero } from "./components/AnalysisHero";
import { ActionPanel } from "./components/ActionPanel";
import { AnalysisDisplay } from "./components/AnalysisDisplay";
import { OutfitSection } from "./components/OutfitSection";
import { TipsSection } from "./components/TipsSection";
import { PremiumFooter } from "./components/PremiumFooter";
import { ProjectDocsModal } from "./components/ProjectDocsModal";

export default function App() {
  /* -------------------- STATE -------------------- */
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [fashionRules, setFashionRules] = useState([]);
  const [userEvent, setUserEvent] = useState("");
  const [userSeason, setUserSeason] = useState("Summer");
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    document.title = "Moodwear | Personal Styling";
    
    // Pick two unique fashion rules
    const r1 = getRandomFashionRule();
    let r2;
    do {
      r2 = getRandomFashionRule();
    } while (r2.title === r1.title);
    setFashionRules([r1, r2]);
  }, []);

  /* -------------------- HANDLERS -------------------- */
  const handleImageChange = (e) => {
    let file = null;
    if (e && e.target && e.target.files) {
      file = e.target.files[0];
    } else if (e instanceof File || e instanceof Blob) {
      file = e;
    }
    
    if (!file) {
      setSelectedImage(null);
      setPreviewUrl(null);
      setResult(null);
      setOutfits([]);
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setOutfits([]);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);
    setOutfits([]);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);
      
      // Auto-generate outfits
      if (data.recommended_colors) {
        const generatedOutfits = await generateOutfitIdeas(data.recommended_colors, data.undertone, userEvent, data.dark_score, userSeason);
        setOutfits(generatedOutfits);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Analysis failed. Please try again with a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOutfits = async (event = userEvent, season = userSeason) => {
    if (result?.recommended_colors) {
        setOutfits([]); // Show loading state briefly
        const newOutfits = await generateOutfitIdeas(result.recommended_colors, result.undertone, event, result.dark_score, season);
        setOutfits(newOutfits);
    }
  };

  const handleCurate = async (event, season) => {
    setUserEvent(event);
    setUserSeason(season);
    await refreshOutfits(event, season);
  };

  return (
    <div className="min-h-screen bg-bg-dark selection:bg-purple-500/30">
      <PremiumHeader />
      
      {/* 1. Hero Section */}
      <AnalysisHero />

      {/* 2. Upload & Action Panel */}
      <ActionPanel 
        onImageChange={handleImageChange}
        onAnalyze={handleAnalyze}
        loading={loading}
        previewUrl={previewUrl}
      />

      {/* 3. Results Section */}
      {result && (
        <div className="max-w-7xl mx-auto px-6 mb-24 space-y-8">
           <div className="space-y-8">
             <AnalysisDisplay 
              result={result} 
              subtypeDescriptions={subtypeDescriptions} 
             />
             <OutfitSection 
               result={result}
               outfits={outfits} 
               onRefresh={refreshOutfits} 
               onCurate={handleCurate}
             />
           </div>
        </div>
      )}

      {/* 4. Tips & Education */}
      {result && <TipsSection rules={fashionRules} />}

      {/* 5. Luxury Footer */}
      <PremiumFooter onDocsClick={() => setIsDocsOpen(true)} />

      {/* 6. System Documentation Modal */}
      <ProjectDocsModal 
        isOpen={isDocsOpen} 
        onClose={() => setIsDocsOpen(false)} 
      />
    </div>
  );
}