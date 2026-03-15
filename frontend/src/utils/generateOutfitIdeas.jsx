export async function generateOutfitIdeas(recommendedColors = [], undertone = "Neutral", userEvent = "", darkScore = 5.0, userSeason = "") {
  if (!recommendedColors.length) return [];

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${API_URL}/api/outfits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dark_score: darkScore,
        undertone: undertone,
        event: userEvent,
        season: userSeason,
        recommended_colors: recommendedColors
      })
    });

    if (!res.ok) throw new Error("Failed to generate ML outfits");
    
    const data = await res.json();
    return data.outfits || [];
  } catch (error) {
    console.error("Outfit ML Error:", error);
    // Fallback simple if server fails for outfit generation
    return [];
  }
}
