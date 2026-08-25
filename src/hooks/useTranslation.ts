"use client";

import { useState, useEffect } from "react";
import { TRANSLATIONS } from "../lib/translations";

const LANG_MAPPING: Record<string, string> = {
  "English": "en",
  "Hindi": "hi",
  "Punjabi": "pa",
  "Bengali": "bn",
  "Odia": "or",
  "en": "en",
  "hi": "hi",
  "pa": "pa",
  "bn": "bn",
  "or": "or",
};

export function useTranslation() {
  const [langCode, setLangCode] = useState("en");

  const syncLanguage = () => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("kisanSetu_lang") || "en";
      const code = LANG_MAPPING[savedName] || "en";
      setLangCode(code);
    }
  };

  useEffect(() => {
    syncLanguage();

    // Listen for custom change events
    const handleLangChange = () => {
      syncLanguage();
    };

    window.addEventListener("kisanSetu_language_changed", handleLangChange);
    window.addEventListener("storage", handleLangChange);

    return () => {
      window.removeEventListener("kisanSetu_language_changed", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  const changeLanguage = (newLangName: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kisanSetu_lang", newLangName);
      const code = LANG_MAPPING[newLangName] || "en";
      setLangCode(code);
      // Dispatch custom events to notify other wrapper layouts and pages
      window.dispatchEvent(new Event("kisanSetu_language_changed"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const t = (key: string) => {
    const dict = TRANSLATIONS[langCode] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || key;
  };

  return { t, lang: langCode, changeLanguage };
}
