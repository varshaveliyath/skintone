import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { subtypeDescriptions } from "./data/skinSubtypeDescriptions";
import { generateOutfitIdeas } from "./utils/generateOutfitIdeas";
import { getRandomFashionRule } from "./utils/fashionRules";

// Premium Components
import { PremiumHeader } from "./components/PremiumHeader";
import { AnalysisHero } from "./components/AnalysisHero";
import { ActionPanel } from "./components/ActionPanel";
import { AnalysisDisplay } from "./components/AnalysisDisplay";
import { AvatarSection } from "./components/AvatarSection";
import { TipsSection } from "./components/TipsSection";
import { PremiumFooter } from "./components/PremiumFooter";
import { ProjectDocsModal } from "./components/ProjectDocsModal";
import { SkinMatrixSection } from "./components/SkinMatrixSection";
import { ColorTheorySection } from "./components/ColorTheorySection";

export default function App() {
  /* -------------------- STATE -------------------- */
  const [gender, setGender] = useState("female");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [fashionRules, setFashionRules] = useState([]);
  const [userEvent, setUserEvent] = useState("");
  const [userSeason, setUserSeason] = useState("Summer");
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [activeAvatarOutfit, setActiveAvatarOutfit] = useState(null);

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

    // Ensure hero section is visible on load
    window.scrollTo(0, 0);
  }, []);

  /* -------------------- HANDLERS -------------------- */
  const handleGenderSelect = (selected) => {
    setGender(selected);
  };

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
    formData.append("gender", gender);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/analyze?gender=${gender}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Analysis failed");
      }
      
      const data = await res.json();
      setResult(data);
      
      // Auto-generate outfits
      if (data.recommended_colors) {
        const generatedOutfits = await generateOutfitIdeas(
          data.recommended_colors, 
          data.undertone, 
          userEvent, 
          data.dark_score, 
          userSeason,
          gender
        );
        setOutfits(generatedOutfits);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      // Try to get error message from response if it was a valid response but not ok
      const errorMsg = err.message || "Analysis failed. Please try again with a clearer photo.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const refreshOutfits = async (event = userEvent, season = userSeason) => {
    if (result?.recommended_colors) {
        setOutfitsLoading(true);
        
        // Shuffle colors to ensure variety on refresh
        const shuffledColors = [...result.recommended_colors].sort(() => Math.random() - 0.5);
        
        const newOutfits = await generateOutfitIdeas(
          shuffledColors, 
          result.undertone, 
          event, 
          result.dark_score, 
          season,
          gender
        );
        setOutfits(newOutfits);
        setOutfitsLoading(false);
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
        gender={gender}
        onGenderChange={setGender}
      />

      {result && (
        <div className="max-w-6xl mx-auto px-4 md:px-6 mb-24 space-y-8">
           <div className="space-y-8">
             <AnalysisDisplay 
              result={result} 
              subtypeDescriptions={subtypeDescriptions} 
             />
             <AvatarSection
               result={result}
               gender={gender}
               activeOutfit={activeAvatarOutfit}
               outfits={outfits}
               onRefresh={refreshOutfits}
               onCurate={handleCurate}
               loading={outfitsLoading}
               onApplyOutfit={setActiveAvatarOutfit}
             />
           </div>
        </div>
      )}

      {/* 4. Tips & Education */}
      {result && <TipsSection rules={fashionRules} />}

      {/* 5. Skin Science & Color Theory (Technical Deep Dive) */}
      <SkinMatrixSection />
      <ColorTheorySection result={result} />

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