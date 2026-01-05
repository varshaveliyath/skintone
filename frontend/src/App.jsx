import React, { useState, useEffect } from "react";
import { Loader2, Linkedin, Github } from "lucide-react";
import { subtypeDescriptions } from "./data/skinSubtyoeDescriptions";
import { generateOutfitIdeas } from "./utils/generateOutfitIdeas";
import { getRandomFashionRule } from "./utils/fashionRules";
/**
 * ImageAnalysisPage
 * -----------------
 * Allows users to upload an image, sends it to the backend for skin tone analysis,
 * and displays detailed skin insights along with color recommendations.
 */
export default function ImageAnalysisPage() {
  /* -------------------- STATE -------------------- */
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);

  /* -------------------- IMAGE UPLOAD HANDLER -------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setOutfits([]);
  };

  /* -------------------- ANALYSIS API CALL -------------------- */
   const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);
    setOutfits([]);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error("VITE_API_URL is not defined");

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
      if (!res.ok) throw new Error(data.error || "Failed to analyze image");

      setResult(data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  /* -------------------- GENERATE OUTFITS ON RESULT -------------------- */
  useEffect(() => {
    if (result?.recommended_colors?.length) {
      setOutfits(generateOutfitIdeas(result.recommended_colors));
    }
  }, [result]);

  /* -------------------- REFRESH OUTFITS -------------------- */
  const refreshOutfits = () => {
    setOutfits(generateOutfitIdeas(result.recommended_colors));
  };

  // -------------------- FASHION RULES --------------------
  const [fashionRule1, setFashionRule1] = useState(() => getRandomFashionRule());
  const [fashionRule2, setFashionRule2] = useState(() => {
    let rule;
    do {
      rule = getRandomFashionRule();
    } while (rule.title === fashionRule1?.title);
    return rule;
  });

/* -------------------- UI -------------------- */
return (
  <main className="flex flex-col min-h-screen bg-white">
    {/* ---------- HEADER ---------- */}
<header className="w-full bg-gradient-to-r from-purple-700 to-purple-900 py-5 shadow-md">
  <div className="max-w-7xl mx-auto  flex items-center justify-center  ">
    {/* Logo */}
    <img
      src="/logo.png"
      alt="Moodwear Logo"
      className="h-8 w-12 mr-1"
    />

    {/* Brand Name */}
    <h1
      className="text-white text-2xl"
      style={{ fontFamily: "'Dancing Script', cursive" }}
    >
      Moodwear
    </h1>

      </div>
</header>


    {/* ---------- HERO SECTION ---------- */}
    <section
      className="relative w-full h-[320px] sm:h-[420px] bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/skintone-hero.png')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Skin Tone Analysis
        </h2>
        <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto">
          Discover your skin tone and undertone to make confident fashion and
          color choices tailored just for you.
        </p>
      </div>
    </section>

    {/* ---------- MAIN CONTENT ---------- */}
    <div className="-mt-10 relative z-10">
      <div className="flex-grow max-w-7xl w-full mx-auto bg-white rounded-t-3xl shadow-2xl px-4 sm:px-6 lg:px-10 py-10">

        {/* Instructions */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-1 text-center shadow-sm">
            <p className="text-sm text-amber-800 leading-relaxed">
              Upload a clear, front-facing photo in natural lighting. Avoid makeup,
              filters, or accessories for the most accurate analysis.
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="max-w-xl mx-auto bg-white p-2 mb-4">
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

        {/* Preview */}
        {previewUrl && (
          <div className="max-w-xl mx-auto mb-10">
            <div className="bg-white rounded-2xl shadow-xl border p-6">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-xl w-full max-h-[280px] object-contain mx-auto"
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
            className={`flex items-center gap-3 px-7 py-3 rounded-xl font-semibold shadow-lg transition-all
              ${
                loading
                  ? "bg-purple-500 text-white"
                  : "bg-purple-700 hover:bg-purple-800 text-white hover:scale-105"
              }`}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? "Analyzing" : "Analyze Image"}
          </button>
        </div>

        {/* ---------- RESULTS ---------- */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Skin Analysis */}
            <div className="bg-white rounded-3xl shadow-xl border p-8">
              <h2 className="text-2xl font-bold text-purple-800 mb-6">
                Your Skin Analysis
              </h2>

              <div className="bg-purple-50 rounded-2xl p-6 mb-8 text-center">
                <h3 className="text-lg font-semibold text-purple-800 mb-1">
                  Detected Skin Subtype
                </h3>
                <p className="font-semibold text-gray-700">
                  {result.skin_subtype}
                </p>

                <div
                  className="w-28 h-28 mx-auto rounded-full border-4 border-purple-300 my-4"
                  style={{ backgroundColor: result.avg_total_hex }}
                />

                <p className="text-sm text-gray-600">
                  HEX: {result.avg_total_hex}
                </p>
                <p className="text-sm text-gray-600">
                  RGB: {JSON.stringify(result.avg_total_rgb)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Analysis
                </h3>

                <ol className="space-y-3 list-decimal list-inside text-gray-700">
                  {(subtypeDescriptions[result.skin_subtype] || []).map(
                    (point, index) => {
                      const [title, description] = point.split(":");
                      return (
                        <li key={index}>
                          <span className="font-semibold text-gray-900">
                            {title.trim()}:
                          </span>{" "}
                          <span className="text-gray-600">
                            {description?.trim()}
                          </span>
                        </li>
                      );
                    }
                  )}
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {[
                  {
                    label: "Light Areas",
                    hex: result.avg_light_hex,
                    rgb: result.avg_light_rgb,
                    desc: "Naturally brighter regions reflecting highlights.",
                  },
                  {
                    label: "Dark Areas",
                    hex: result.avg_dark_hex,
                    rgb: result.avg_dark_rgb,
                    desc: "Shadows and deeper facial contours.",
                  },
                ].map((item, idx) => (
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

            {/* Color Recommendations */}
            <div className="bg-white rounded-3xl shadow-xl border p-8">
              <h2 className="text-2xl font-bold text-purple-800 mb-6">
                Clothing Color Guidance
              </h2>

              {/* Recommended Colors */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Colors That Enhance Your Skin
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                  {result.recommended_colors.map((color, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className="w-14 h-14 rounded-full mx-auto border-2 border-gray-300 mb-2"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                      <p className="text-xs font-medium text-gray-700">
                        {color.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid Colors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Colors That May Dull Your Skin
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                  {result.avoid_colors.map((color, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className="w-14 h-14 rounded-full mx-auto border-2 border-gray-300 mb-2"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                      <p className="text-xs font-medium text-gray-700">
                        {color.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outfit Ideas */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-purple-800 mb-6 text-center">
                  Outfit Ideas Curated for Your Skin Tone
                </h3>

                <div className="flex justify-center mb-6">
                  <button
                    onClick={refreshOutfits}
                    className="px-5 py-2 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-md"
                  >
                    Refresh Outfit Ideas
                  </button>
                </div>

                {outfits.map((outfit, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6 shadow-sm"
                  >
                    <h4 className="text-lg font-semibold text-purple-900 mb-3 text-center">
                      {outfit.outfitName}
                    </h4>

                    <div className="flex justify-center mb-5">
                      <div className="flex">
                        {outfit.colors.map((color, i) => (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-full border-2 border-white shadow-md ${
                              i !== 0 ? "-ml-3" : ""
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                      <p><span className="font-semibold">Top:</span> {outfit.top}</p>
                      <p><span className="font-semibold">Bottom:</span> {outfit.bottom}</p>
                      <p><span className="font-semibold">Footwear:</span> {outfit.footwear}</p>
                      <p><span className="font-semibold">Layer:</span> {outfit.layer}</p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold">Jewelry:</span> {outfit.jewelry}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- FASHION TIPS ---------- */}
            {[fashionRule1, fashionRule2].map((rule, idx) => (
              <div
                key={idx}
                className="bg-yellow-50 rounded-3xl shadow-xl border p-8 mt-10 w-full flex flex-col lg:flex-row items-center gap-8"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-purple-900 mb-4">
                    Fashion Tip: {rule.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{rule.description}</p>

                  <div className="flex flex-wrap gap-3">
                    {rule.colors.map((color, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-12 h-12 border-2 border-gray-300 mb-1"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <span className="text-xs text-gray-700">
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* ---------- FOOTER ---------- */}
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
          href="https://github.com/varshaveliyath/skintone"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-800"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
      <p>© {new Date().getFullYear()} All Rights Reserved.</p>
    </footer>
  </main>
);
}