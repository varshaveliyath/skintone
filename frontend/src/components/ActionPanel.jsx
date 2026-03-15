import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Loader2, Sparkles, RefreshCcw, RefreshCw, User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { GlassCard } from './GlassCard';

export function ActionPanel({ onImageChange, onAnalyze, loading, previewUrl, gender, onGenderChange }) {
  const [activeTab, setActiveTab] = useState('upload');
  const webcamRef = useRef(null);

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'camera', label: 'Capture', icon: Camera },
  ];

  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const file = base64ToFile(imageSrc, 'capture.png');
      onImageChange(file);
    }
  }, [webcamRef, onImageChange]);

  const handleRetake = () => {
    onImageChange(null);
  };

  return (
    <div className="max-w-4xl mx-auto mb-12 relative z-30">
      <GlassCard className="p-6">
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button
            onClick={() => onGenderChange('female')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              gender === 'female' 
              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            FEMALE BASE
          </button>
          <button
            onClick={() => onGenderChange('male')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              gender === 'male' 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            MALE BASE
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <label className="relative group cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
                <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/10 group-hover:border-purple-500/50 bg-white/5 flex flex-col items-center justify-center transition-all overflow-hidden relative">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-white">
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 md:p-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                      </div>
                      <p className="text-white font-semibold mb-1 text-sm md:text-base">Click or drag to upload</p>
                      <p className="text-zinc-500 text-xs md:text-sm">Supports JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              </label>

              <div className="mb-6 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl max-w-md mx-auto">
                <p className="text-[11px] md:text-sm text-purple-300 font-medium leading-relaxed text-center">
                  Tip: Use natural lighting (no direct sun or filters) and avoid accessories like glasses or masks for the most accurate results.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={onAnalyze}
                  disabled={!previewUrl || loading}
                  className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-5 h-5" />
                      Analyze Skin Tone
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/10 bg-black flex flex-col items-center justify-center overflow-hidden relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                {previewUrl ? (
                  <>
                    <button
                      onClick={handleRetake}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2 justify-center"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Retake
                    </button>
                    <button
                      onClick={onAnalyze}
                      disabled={loading}
                      className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze Capture
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={capture}
                    className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
