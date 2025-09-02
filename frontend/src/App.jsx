import React, { useState } from "react";
import { Loader2, Mail, Linkedin } from "lucide-react";

export default function ImageAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setResult(null);

    setTimeout(async () => {
      if (!selectedImage) return;

      const formData = new FormData();
      formData.append("image", selectedImage);

      try {
        const API_URL = process.env.REACT_APP_API_URL; // e.g., https://skintone-lime.vercel.app

        // ✅ Updated API endpoint to match FastAPI route
        const res = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          body: formData,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Expected JSON, got:\n${text.slice(0, 200)}\n\n(Status: ${res.status})`
          );
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to analyze");

        setResult(data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }, 3000);
  };

  // --- Professional descriptions for each skin subtype ---
  const subtypeDescriptions = {
    "Light Warm":
      "Light warm skin tones have delicate peachy, golden, or ivory undertones. These tones naturally radiate warmth but can be easily overshadowed by icy blues, silvers, or grays, which contrast too sharply and create a washed-out look. Instead, soft earthy shades, coral pinks, warm beiges, and creamy pastels harmonize beautifully with the skin. Gold jewelry tends to flatter more than silver, and muted warm tones like terracotta, apricot, and sage enhance the fresh glow of this subtype.",
    "Light Cool":
      "Light cool skin tones carry gentle pink, rosy, or bluish undertones. Warm and overly yellow colors such as mustard or bright orange can clash, giving the complexion an unbalanced or flushed look. Instead, shades like lavender, icy pinks, mint green, powder blue, and jewel tones such as amethyst or sapphire create elegance and clarity. Silver jewelry complements these tones better than gold. Crisp cool colors highlight the skin's natural brightness without overwhelming its delicacy.",
    "Light Neutral":
      "Light neutral skin tones balance soft warm and cool undertones, creating a versatile base. Because they don't lean strongly in either direction, overly intense hues, like neon shades, can overpower the natural balance. Soft neutrals such as taupe, blush pink, dusty lavender, and creamy beige highlight the skin's harmony. Both silver and gold jewelry suit this subtype, but rose gold is particularly flattering. Light neutrals work best with subtle contrasts and gentle, blended shades rather than stark opposites.",
    "Dusky Warm":
      "Dusky warm skin tones feature golden, amber, or olive undertones layered over a medium-deep complexion. These tones radiate depth and richness, but overly cool shades like icy blue, stark gray, or lavender can make the skin look dull. Instead, warm earthy hues: burnt orange, copper, turmeric yellow, teal, and deep greens, enhance vibrancy. Gold jewelry brings out warmth, while fabrics with sheen like silk or satin elevate the glow. This subtype looks particularly striking in autumnal palettes.",
    "Dusky Cool":
      "Dusky cool skin tones carry bluish or rosy undertones over a medium-deep complexion. Overly warm tones like mustard, pumpkin orange, or golden yellow can overpower the coolness of the skin. Jewel tones: emerald, plum, ruby, sapphire, and berry shades, add a sophisticated vibrance. Dusty mauves, navy, and icy pastels also flatter beautifully. Silver jewelry often complements these tones better, though platinum or white gold adds even more refinement. Dusky cool skin shines with colors that emphasize richness without leaning too warm.",
    "Dusky Neutral":
      "Dusky neutral skin tones strike a balance between warm golden and cool bluish undertones across a deeper complexion. This versatility allows them to wear both warm and cool shades, though extremes on either side can look mismatched. Muted jewel tones like deep teal, burgundy, olive, charcoal, and coffee brown enhance the natural harmony. Both silver and gold jewelry complement this subtype, with mixed metals looking especially chic. Dusky neutrals carry off bold palettes well, provided the colors aren't overly neon or icy.",
    "Dark Warm":
      "Dark warm skin tones glow with golden, bronze, or earthy undertones, offering a radiant base for bold styling. Light pastels or overly cool shades can feel flat and fail to capture the richness of the skin. Instead, saturated jewel tones: emerald, mustard, ruby red, burnt orange, and forest green, create a striking balance. Metallic gold enhances the warmth, and rich earth tones like terracotta and mahogany emphasize depth. Fabrics with warmth and texture, such as velvet or brocade, highlight the natural vibrance of this subtype.",
    "Dark Cool":
      "Dark cool skin tones feature bluish, violet, or deep rosy undertones, creating a naturally regal base. Bright yellows, golden oranges, or warm mustard shades can clash harshly with this subtype. Instead, cool vivid colors: royal blue, plum, magenta, amethyst, and fuchsia, add brilliance and sophistication. Silver, platinum, and white gold jewelry complement the undertones best, while deep, cool neutrals like navy, charcoal, and black bring elegance. Dark cool tones pair beautifully with jewel-inspired palettes that emphasize contrast and richness.",
    "Dark Neutral":
      "Dark neutral skin tones combine both warm and cool undertones, creating a deep, versatile complexion. This balance allows for a wide range of colors, though extremely warm oranges or icy blues may look unflattering. Earthy neutrals like mocha, espresso, deep olive, and burgundy provide harmony, while jewel tones such as teal, garnet, and sapphire create bold impact. Both gold and silver jewelry complement this subtype, making it adaptable to personal style. Dark neutral tones excel in palettes that combine richness with balance, avoiding extremes."
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <header className="w-full bg-gradient-to-r from-purple-700 to-purple-800 border-b border-gray-200 py-4 mb-4 shadow-sm">
        <h1 className="text-sm sm:text-base font-normal text-white text-center">
          Hi there!  Discover your natural tones and personal color analysis.
        </h1>
      </header>

      <div className="flex-grow max-w-6xl w-full mx-auto py-10 px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-purple-900 text-center drop-shadow-sm">
          Skin Tone Analysis
        </h1>

        {/* Instruction Container */}
        <div className="max-w-xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 text-center p-2 rounded-md mb-6">
          <p className="text-sm">
            Upload a clear picture of your face in natural lighting, without makeup or any other accessories for best results.
          </p>
        </div>

        {/* Upload Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-8  block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0 file:text-sm file:font-semibold
                     file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 "
        />

        {/* Preview */}
        {previewUrl && (
          <div className="mb-10 p-4 bg-gray-300 rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-lg  w-full max-h-96 object-contain mx-auto"
            />
            <p className="text-center text-sm text-gray-500 mt-3">
              Preview
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleAnalyze}
            className={`flex items-center gap-2 px-5 py-1 rounded-lg font-semibold text-lg transition duration-300
              ${loading
                ? 'bg-purple-500 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Card 1: Color Analysis */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 border">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Color Analysis</h2>

              {/* Overall Skin Tone */}
              <div className="bg-purple-100 rounded-xl p-6 mb-6 text-center shadow-md">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">Overall Skin Tone</h3>
                <p className="text-gray-700 mb-4">
                  Your detected skin type is{" "}
                  <span className="font-semibold">{result.skin_subtype}</span>.
                </p>
                <div
                  className="w-28 h-28 mx-auto rounded-full border-2 border-purple-300 mb-3"
                  style={{ backgroundColor: result.avg_total_hex }}
                />
                <p className="text-lg font-semibold text-purple-800">
                  {result.skin_tone.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">HEX: {result.avg_total_hex}</p>
                <p className="text-sm text-gray-600">RGB: {JSON.stringify(result.avg_total_rgb)}</p>
              </div>

              {/* Skin Tone Insights */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Skin Tone Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  {subtypeDescriptions[result.skin_subtype] || subtypeDescriptions["Unknown"]}
                </p>
              </div>

              {/* Average Light/Dark Tones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md ">
                  <div
                    className="w-20 h-20 rounded-full border border-gray-300 mb-3"
                    style={{ backgroundColor: result.avg_light_hex }}
                  />
                  <p className="text-sm text-gray-700 font-medium">Light Areas</p>
                  <p className="text-xs text-center text-gray-700 mb-2">
                    Highlights and naturally lighter regions of your face.
                  </p>
                  <p className="text-xs text-gray-500">HEX: {result.avg_light_hex}</p>
                  <p className="text-xs text-gray-500">RGB: {JSON.stringify(result.avg_light_rgb)}</p>
                </div>

                <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md ">
                  <div
                    className="w-20 h-20 rounded-full border border-gray-300 mb-3"
                    style={{ backgroundColor: result.avg_dark_hex }}
                  />
                  <p className="text-sm text-gray-700 font-medium">Dark Areas</p>
                  <p className="text-xs text-center text-gray-700 mb-2">
                    Shadows and naturally darker contours of your face.
                  </p>
                  <p className="text-xs text-gray-500">HEX: {result.avg_dark_hex}</p>
                  <p className="text-xs text-gray-500">RGB: {JSON.stringify(result.avg_dark_rgb)}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Clothing Recommendations */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 border">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Clothing Recommendations</h2>

              {/* Colors To Go For */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Colors to Go For</h3>
                <div className="grid grid-cols-5 gap-4">
                  {result.recommended_colors.map((colorObj, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300 mb-1 mx-auto cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: colorObj.hex }}
                        title={colorObj.name}
                      />
                      <p className="text-xxs text-gray-600">{colorObj.name}</p>
                      {colorObj.reason && (
                        <p className="text-xs text-gray-400">{colorObj.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors to Avoid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Colors to Avoid</h3>
                <div className="grid grid-cols-5 gap-4">
                  {result.avoid_colors.map((colorObj, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300 mb-1 mx-auto cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: colorObj.hex }}
                        title={colorObj.name}
                      />
                      <p className="text-xxs text-gray-600">{colorObj.name}</p>
                      {colorObj.reason && (
                        <p className="text-xs text-gray-400">{colorObj.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      


      {/* Footer */}
      <footer className="mt-10 px-6 pb-2 text-center text-sm text-gray-500 pt-4 space-y-3">
        <div className="w-3/4 mx-auto border-t border-gray-400 mb-2"></div>

        <p className="flex justify-center gap-8 mb-1">
          <a
            href="https://www.linkedin.com/in/varshaveliyath"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-500 hover:underline"
          >
            <Linkedin className="h-5 w-5" /> 
          </a>
          <a
            href="mailto:veliyathvarsha@gmail.com"
            className="flex items-center gap-1 text-purple-500 hover:underline"
          >
            <Mail className="h-5 w-5" /> 
          </a>
        </p>
        <p>© {new Date().getFullYear()} All Rights Reserved.</p>
      </footer>
    </main>
  );
}
