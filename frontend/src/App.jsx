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

  const formData = new FormData();
  formData.append("image", selectedImage);

  try {
    const API_URL = import.meta.env.VITE_API_URL;

    if (!API_URL) {
      throw new Error("VITE_API_URL is not defined");
    }

    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Expected JSON, got:\n${text.slice(0, 200)}\n(Status: ${res.status})`
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
};


  // --- Professional descriptions for each skin subtype ---
  const subtypeDescriptions = {
  "Light Warm": [
    "What suits & why: Soft warm shades like peach, coral, warm beige, ivory, apricot, and light terracotta suit light warm skin because they echo the skin’s natural golden and peach undertones, creating a seamless, glowing look rather than contrast-heavy separation.",
    "What to avoid & why: Icy blues, cool greys, stark white, and silver-heavy tones should be avoided because they oppose the warmth in the skin, draining color from the face and making the complexion appear washed out or dull.",
    "Jewelry & why: Yellow gold and soft rose gold flatter best because warm metals reflect golden light back onto the skin, enhancing brightness, whereas silver can look too harsh and flat against warm undertones.",
    "Fabric & finish guidance & why: Soft, matte, or lightly luminous fabrics like cotton, silk blends, or chiffon work well because overly shiny or stark textures can overpower the delicacy of light warm skin.",
    "Overall styling logic: Light warm skin looks healthiest when warmth is maintained consistently — gentle warmth enhances glow, while cool extremes break harmony."
  ],

  "Light Cool": [
    "What suits & why: Cool pastels, lavender, icy pinks, powder blue, mint, and jewel tones like sapphire or amethyst work well because they align with the skin’s pink or bluish undertones, preserving clarity and freshness.",
    "What to avoid & why: Mustard, orange, camel, and overly yellow shades should be avoided because they clash with cool undertones, often making the skin look flushed or uneven.",
    "Jewelry & why: Silver, platinum, and white gold suit best as cool metals reinforce the skin’s undertone without adding unwanted warmth.",
    "Fabric & finish guidance & why: Smooth, crisp fabrics such as satin, fine knits, or lightweight wool enhance cool skin by keeping the overall look clean and refined rather than heavy.",
    "Overall styling logic: Light cool skin thrives on clarity — clean, cool colors sharpen features instead of overpowering them."
  ],

  "Light Neutral": [
    "What suits & why: Soft neutrals like blush, taupe, dusty lavender, muted peach, and creamy beige work because they respect the skin’s balanced undertones without pulling too warm or too cool.",
    "What to avoid & why: Neon colors or very dark, high-contrast shades should be avoided as they overpower the subtle balance of neutral skin and disrupt its natural harmony.",
    "Jewelry & why: Both gold and silver work, but rose gold is especially flattering because it sits perfectly between warm and cool, mirroring the skin’s neutrality.",
    "Fabric & finish guidance & why: Balanced textures like soft linen, silk, or light wool blends work best, avoiding extremes like overly glossy or very rough finishes.",
    "Overall styling logic: Light neutral skin is about moderation — balanced tones enhance elegance, extremes create imbalance."
  ],

  "Dusky Warm": [
    "What suits & why: Earthy and warm tones like burnt orange, copper, mustard, olive, teal, and warm greens suit this skin because they amplify the golden and olive undertones, adding richness and depth.",
    "What to avoid & why: Icy pastels, cool greys, and pale lavenders should be avoided as they dull the warmth and make the complexion appear flat or ashy.",
    "Jewelry & why: Gold jewelry enhances warmth by reflecting yellow light onto the skin, intensifying natural radiance and depth.",
    "Fabric & finish guidance & why: Rich fabrics with depth like silk, satin, velvet, or subtle sheen materials elevate dusky warm skin by adding dimension.",
    "Overall styling logic: Dusky warm skin shines when warmth and depth are emphasized — autumnal palettes feel naturally harmonious."
  ],

  "Dusky Cool": [
    "What suits & why: Jewel tones such as emerald, plum, ruby, sapphire, berry, and deep navy complement the cool undertones, enhancing richness without overwhelming the skin.",
    "What to avoid & why: Warm yellows, pumpkin orange, mustard, and golden browns should be avoided as they overpower the cool base and create imbalance.",
    "Jewelry & why: Silver, platinum, and white gold work best because they align with the skin’s cool undertones and add refinement.",
    "Fabric & finish guidance & why: Structured fabrics and smooth finishes like satin, crepe, or fine wool enhance the skin’s sophistication.",
    "Overall styling logic: Dusky cool skin benefits from richness without warmth — cool depth creates elegance."
  ],

  "Dusky Neutral": [
    "What suits & why: Muted jewel tones like burgundy, deep teal, olive, charcoal, and coffee brown work because they respect both warm and cool undertones equally.",
    "What to avoid & why: Extremely icy pastels or overly warm neon shades disrupt the balance and can make the skin appear mismatched.",
    "Jewelry & why: Both silver and gold work well; mixed metals look especially harmonious as they reflect the skin’s balanced nature.",
    "Fabric & finish guidance & why: Medium-weight fabrics with subtle texture enhance versatility without overpowering the skin.",
    "Overall styling logic: Dusky neutral skin thrives on balance — richness paired with restraint creates polish."
  ],

  "Dark Warm": [
    "What suits & why: Saturated warm tones like emerald, mustard, burnt orange, ruby red, forest green, and terracotta enhance golden undertones and highlight depth.",
    "What to avoid & why: Pale pastels and overly cool shades lack contrast and fail to capture the richness of dark warm skin.",
    "Jewelry & why: Gold and bronze metals amplify warmth and glow, making features appear more luminous.",
    "Fabric & finish guidance & why: Luxurious fabrics like velvet, brocade, silk, and textured weaves elevate the skin’s natural vibrance.",
    "Overall styling logic: Dark warm skin excels with intensity — richness and warmth bring out its power."
  ],

  "Dark Cool": [
    "What suits & why: Royal blue, plum, magenta, fuchsia, amethyst, and jewel-inspired shades enhance cool undertones while maintaining bold contrast.",
    "What to avoid & why: Golden yellows, orange-based browns, and mustard clash strongly with the cool base, creating harsh imbalance.",
    "Jewelry & why: Silver, platinum, and white gold enhance cool undertones and maintain elegance.",
    "Fabric & finish guidance & why: Sleek, polished fabrics with structure emphasize contrast and sophistication.",
    "Overall styling logic: Dark cool skin thrives on contrast — cool intensity highlights its regal quality."
  ],

  "Dark Neutral": [
    "What suits & why: Deep neutrals like espresso, mocha, burgundy, olive, and jewel tones like teal and sapphire suit because they balance warmth and coolness.",
    "What to avoid & why: Extremely warm oranges or icy blues push the skin too far in one direction and disrupt harmony.",
    "Jewelry & why: Both gold and silver work equally well, allowing flexibility in styling.",
    "Fabric & finish guidance & why: Rich fabrics with controlled shine or texture enhance depth without overwhelming the skin.",
    "Overall styling logic: Dark neutral skin is most powerful when balance meets richness — controlled contrast is key."
  ]
};

return (
  <main className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white">
    {/* Header */}
    <header className="w-full bg-gradient-to-r from-purple-700 to-purple-900 py-5 shadow-md">
      <h1 className="text-sm sm:text-base font-medium text-white text-center px-4">
        Discover your natural tones through AI-powered skin analysis
      </h1>
    </header>

    {/* Main Container */}
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 text-center mb-10">
        Skin Tone Analysis
      </h1>

      {/* Instruction Card */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-amber-800 leading-relaxed">
            Upload a clear, front-facing photo in natural lighting. Avoid makeup,
            filters, or accessories for the most accurate analysis.
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border p-6 mb-10">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2.5 file:px-5
            file:rounded-lg file:border-0
            file:font-semibold
            file:bg-purple-100 file:text-purple-700
            hover:file:bg-purple-200 transition"
        />
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl border p-6">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-xl w-full max-h-[420px] object-contain mx-auto"
            />
            <p className="text-center text-sm text-gray-500 mt-3">
              Image Preview
            </p>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center mb-14">
        <button
          onClick={handleAnalyze}
          className={`flex items-center gap-3 px-7 py-3 rounded-xl font-semibold text-base shadow-lg transition-all
            ${loading
              ? "bg-purple-500 text-white"
              : "bg-purple-700 hover:bg-purple-800 text-white hover:scale-105"}`}
        >
          {loading && <Loader2 className="animate-spin h-5 w-5" />}
          {loading ? "Analyzing your tones..." : "Analyze Image"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT CARD — SKIN ANALYSIS */}
          <div className="bg-white rounded-3xl shadow-xl border p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">
              Your Skin Analysis
            </h2>

            {/* Main Tone */}
            <div className="bg-purple-50 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-lg font-semibold text-purple-800 mb-1">
                Detected Skin Subtype
              </h3>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">{result.skin_subtype}</span>
              </p>

              <div
                className="w-28 h-28 mx-auto rounded-full border-4 border-purple-300 mb-3"
                style={{ backgroundColor: result.avg_total_hex }}
              />

              <p className="text-sm text-gray-600">
                HEX: {result.avg_total_hex}
              </p>
              <p className="text-sm text-gray-600">
                RGB: {JSON.stringify(result.avg_total_rgb)}
              </p>
            </div>

            {/* Insights */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Why this matters
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm space-y-2">
                {subtypeDescriptions[result.skin_subtype] ||
                  subtypeDescriptions["Unknown"]}
              </p>
            </div>

            {/* Light / Dark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {[{
                label: "Light Areas",
                hex: result.avg_light_hex,
                rgb: result.avg_light_rgb,
                desc: "Naturally brighter regions reflecting highlights."
              },
              {
                label: "Dark Areas",
                hex: result.avg_dark_hex,
                rgb: result.avg_dark_rgb,
                desc: "Shadows and deeper facial contours."
              }].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-5 text-center border"
                >
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-3 border"
                    style={{ backgroundColor: item.hex }}
                  />
                  <p className="font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
                  <p className="text-xs text-gray-500">HEX: {item.hex}</p>
                  <p className="text-xs text-gray-500">
                    RGB: {JSON.stringify(item.rgb)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD — CLOTHING */}
          <div className="bg-white rounded-3xl shadow-xl border p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">
              Clothing Color Guidance
            </h2>

            {/* Recommended */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Colors That Enhance Your Skin
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {result.recommended_colors.map((colorObj, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto border-2 border-gray-300 mb-2 hover:scale-110 transition"
                      style={{ backgroundColor: colorObj.hex }}
                      title={colorObj.name}
                    />
                    <p className="text-xs font-medium text-gray-700">
                      {colorObj.name}
                    </p>
                    {colorObj.reason && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {colorObj.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Colors That May Dull Your Skin
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {result.avoid_colors.map((colorObj, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto border-2 border-gray-300 mb-2 hover:scale-110 transition"
                      style={{ backgroundColor: colorObj.hex }}
                      title={colorObj.name}
                    />
                    <p className="text-xs font-medium text-gray-700">
                      {colorObj.name}
                    </p>
                    {colorObj.reason && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {colorObj.reason}
                      </p>
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
    <footer className="mt-14 px-6 pb-6 text-center text-sm text-gray-500">
      <div className="max-w-md mx-auto border-t border-gray-300 mb-4" />
      <div className="flex justify-center gap-10 mb-2">
        <a
          href="https://www.linkedin.com/in/varshaveliyath"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-800"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href="mailto:veliyathvarsha@gmail.com"
          className="text-purple-600 hover:text-purple-800"
        >
          <Mail className="h-5 w-5" />
        </a>
      </div>
      <p>© {new Date().getFullYear()} All Rights Reserved.</p>
    </footer>
  </main>
);
}