"use client";

import React, { useState, useEffect } from "react";

interface LanguageSelectorProps {
  onLanguageSelect: (language: string) => void;
}

const LANGUAGES = [
  { code: "en", name: "English", script: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", script: "हिन्दी", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", script: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", script: "বাংলা", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", script: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", script: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", script: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", script: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", script: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", script: "മലയാളം", flag: "🇮🇳" },
  { code: "or", name: "Odia", script: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", script: "اردو", flag: "🇮🇳" },
];

const TRANSLATIONS = [
  "SELECT YOUR LANGUAGE",
  "अपनी भाषा चुनें",
  "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
  "আপনার ভাষা নির্বাচন করুন",
  "તમારી ભાષા પસંદ કરો",
  "आपली भाषा निवडा",
  "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
  "మీ భాషను ఎంచుకోండి",
  "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
  "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ",
  "اپنی زبان منتخب کریں"
];

export default function LanguageSelector({ onLanguageSelect }: LanguageSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTranslationIndex, setActiveTranslationIndex] = useState(0);

  // Trigger pop-up after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Vertical text rotation every 2 seconds
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveTranslationIndex((prev) => (prev + 1) % TRANSLATIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSelection = (langName: string) => {
    setIsVisible(false);
    onLanguageSelect(langName);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/70 backdrop-blur-md px-4">
      {/* Pop-up Box */}
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-100 shadow-2xl p-6 sm:p-10 text-center animate-fade-in-up">
        {/* Animated Icon */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 0 6-.371m0 0c1.12 2.233 3.007 4.184 5.062 5.51m-5.062-5.51A48.245 48.245 0 0 0 12 4.5m-9 1.121c.53.057 1.06.113 1.591.168m5-1.289V3m0 2.25c.026.002.052.002.078.002.97 0 1.906-.02 2.822-.06"
            />
          </svg>
        </div>

        {/* Vertical Carousel Header */}
        <div className="h-12 overflow-hidden mb-2 relative">
          <div
            className="transition-transform duration-500 ease-out flex flex-col justify-start items-center"
            style={{ transform: `translateY(-${activeTranslationIndex * 48}px)` }}
          >
            {TRANSLATIONS.map((text, idx) => (
              <h3
                key={idx}
                className="text-xl sm:text-2xl font-black text-slate-900 h-12 flex items-center justify-center tracking-tight"
              >
                {text}
              </h3>
            ))}
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold mb-8 uppercase tracking-widest">
          KisanSetu Multi-Language Portal
        </p>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 pb-2 scrollbar-thin">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelection(lang.name)}
              className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center group active:scale-95"
            >
              <span className="text-lg mb-1 group-hover:scale-110 transition-transform">{lang.flag}</span>
              <span className="text-sm font-bold text-slate-800">{lang.script}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{lang.name}</span>
            </button>
          ))}
        </div>

        {/* Footer skip */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Default: English / हिन्दी</span>
          <button
            onClick={() => handleSelection("English")}
            className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Skip Language Selection →
          </button>
        </div>
      </div>
    </div>
  );
}
