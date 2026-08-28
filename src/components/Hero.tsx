"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface LiveWeatherData {
  temp: number;
  condition: string;
  icon: string;
  locationName: string;
  windSpeed: number;
  advisory: string;
}

const WMO_WEATHER_MAP: Record<number, { condition: string; icon: string }> = {
  0: { condition: "Clear Sky", icon: "☀️" },
  1: { condition: "Mainly Clear", icon: "🌤️" },
  2: { condition: "Partly Cloudy", icon: "⛅" },
  3: { condition: "Overcast", icon: "☁️" },
  45: { condition: "Foggy", icon: "🌫️" },
  48: { condition: "Depositing Rime Fog", icon: "🌫️" },
  51: { condition: "Light Drizzle", icon: "🌦️" },
  53: { condition: "Moderate Drizzle", icon: "🌦️" },
  55: { condition: "Dense Drizzle", icon: "🌧️" },
  61: { condition: "Slight Rain", icon: "🌧️" },
  63: { condition: "Moderate Rain", icon: "🌧️" },
  65: { condition: "Heavy Rain", icon: "⛈️" },
  80: { condition: "Rain Showers", icon: "🌦️" },
  95: { condition: "Thunderstorm", icon: "⛈️" },
};

export default function Hero() {
  const { t, lang } = useTranslation();

  const [weather, setWeather] = useState<LiveWeatherData>({
    temp: 28,
    condition: "Clear Sunshine",
    icon: "☀️",
    locationName: "Kanpur Agri Zone",
    windSpeed: 11,
    advisory: "Clear skies expected. Optimal conditions for crop harvesting and transport to centers.",
  });

  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const fetchLiveWeather = async (lat: number, lon: number, defaultName?: string) => {
      try {
        // 1. Fetch live Open-Meteo Forecast
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherJson = await weatherRes.json();

        // 2. Fetch Locality Name
        let resolvedLocation = defaultName || "Local Mandi Hub";
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          const geoJson = await geoRes.json();
          if (geoJson) {
            const city = geoJson.city || geoJson.locality || geoJson.principalSubdivisionDistrict || "Agri Zone";
            const state = geoJson.principalSubdivision || "";
            resolvedLocation = state ? `${city}, ${state}` : city;
          }
        } catch {}

        if (weatherJson?.current_weather) {
          const current = weatherJson.current_weather;
          const codeInfo = WMO_WEATHER_MAP[current.weathercode] || { condition: "Clear Sky", icon: "☀️" };
          const temperature = Math.round(current.temperature);
          const wind = Math.round(current.windspeed);

          let customAdvisory = "";
          if (current.weathercode >= 51 && current.weathercode <= 99) {
            customAdvisory =
              lang === "hi"
                ? `${temperature}°C बारिश की संभावना - मंडी ले जाते समय तिरपाल से ढकें और कतार टोकन पहले से बुक करें।`
                : lang === "bn"
                ? `${temperature}°C বৃষ্টির সম্ভাবনা - মান্ডিতে শস্য পরিবহনে ত্রিপল ব্যবহার করুন এবং আগে থেকে টোকেন বুক করুন।`
                : lang === "pa"
                ? `${temperature}°C ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ - ਮੰਡੀ ਜਾਣ ਸਮੇਂ ਫ਼ਸਲ ਨੂੰ ਤਰਪਾਲ ਨਾਲ ਢੱਕੋ।`
                : `${temperature}°C Rain expected - Keep tarpaulins ready during mandi transport and book token in advance.`;
          } else {
            customAdvisory =
              lang === "hi"
                ? `${temperature}°C ${codeInfo.condition} - मौसम अनुकूल है। फसल कटाई और खरीद केंद्र परिवहन के लिए उपयुक्त समय।`
                : lang === "bn"
                ? `${temperature}°C ${codeInfo.condition} - আবহাওয়া পরিষ্কার। ফসল কাটা ও ক্রয় কেন্দ্রে পরিবহনের জন্য আদর্শ দিন।`
                : lang === "pa"
                ? `${temperature}°C ${codeInfo.condition} - ਮੌਸਮ ਸਾਫ਼ ਹੈ। ਫ਼ਸਲ ਕਟਾਈ ਤੇ ਮੰਡੀ ਢੋਆ-ਢੁਆਈ ਲਈ ਵਧੀਆ ਸਮਾਂ।`
                : `${temperature}°C ${codeInfo.condition} - Clear skies. Optimal conditions for crop harvesting and mandi delivery.`;
          }

          setWeather({
            temp: temperature,
            condition: codeInfo.condition,
            icon: codeInfo.icon,
            locationName: resolvedLocation,
            windSpeed: wind,
            advisory: customAdvisory,
          });
        }
      } catch (err) {
        console.error("Live weather fetch error:", err);
      } finally {
        setWeatherLoading(false);
      }
    };

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLiveWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback to central Northern Agri belt (Kanpur / Lucknow)
          fetchLiveWeather(26.8467, 80.9462, "Kanpur, UP");
        },
        { timeout: 8000 }
      );
    } else {
      fetchLiveWeather(26.8467, 80.9462, "Kanpur, UP");
    }
  }, [lang]);

  const tickerCrops: Record<string, Record<string, string>> = {
    en: { paddy: "Paddy (Common)", wheat: "Wheat", mustard: "Mustard Seed", stable: "Stable", today: "today" },
    hi: { paddy: "धान (सामान्य)", wheat: "गेहूं", mustard: "सरसों", stable: "स्थिर", today: "आज" },
    or: { paddy: "ଧାନ (ସାଧାରଣ)", wheat: "ଗହମ", mustard: "ସୋରିଷ", stable: "ସ୍ଥିର", today: "ଆଜି" },
    pa: { paddy: "ਝੋਨਾ (ਆਮ)", wheat: "ਕਣਕ", mustard: "ਸਰ੍ਹੋਂ", stable: "ਸਥਿਰ", today: "ਅੱਜ" },
    bn: { paddy: "ধান (সাধারণ)", wheat: "গম", mustard: "সরিষা", stable: "স্থিতিশীল", today: "আজ" },
  };
  const labels = tickerCrops[lang] || tickerCrops["en"];

  return (
    <section className="relative w-full min-h-[90vh] pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden flex items-center bg-slate-950 font-sans">
      {/* Clean Crisp Background Image - Fixed Viewport Position for Parallax Effect */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-500"
        style={{ backgroundImage: "url('/farmers_field.jpg')" }}
      ></div>

      {/* Directional Gradient Overlay - Dark on the left for text contrast, fading to fully transparent on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Modern Minimalist Typography */}
          <div className="lg:col-span-6 flex flex-col space-y-6 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-shadow-md">
              {t("hero_title")} <span className="text-emerald-400">KisanSetu</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl text-shadow-sm">
              {t("hero_desc")}
            </p>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="/scheduler"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                {t("hero_cta_book")}
              </a>
              <a
                href="/centers"
                className="flex items-center justify-center gap-2 bg-white/10 border-2 border-white/20 text-white hover:bg-white hover:text-black font-extrabold text-base px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {t("hero_cta_find")}
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/15 max-w-md text-shadow-sm">
              <div>
                <span className="block text-2xl font-extrabold text-emerald-400">45+</span>
                <span className="text-xs text-slate-300 font-bold">{t("hero_hubs")}</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-400">12k+</span>
                <span className="text-xs text-slate-300 font-bold">{t("hero_farmers")}</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-400">Live</span>
                <span className="text-xs text-slate-300 font-bold">{t("hero_live_track")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Mandi Ticker & Live Location Weather */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
            <div className="w-full max-w-md space-y-5 text-white">
              {/* Header Info */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <h4 className="font-bold text-sm text-slate-200 tracking-wider uppercase">{t("hero_mandi_rates")}</h4>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping"></span>
                  {t("hero_msp")}
                </span>
              </div>

              {/* Ticker Rates: Borderless dividers */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌾</span>
                    <div>
                      <span className="block text-sm font-semibold text-white">{labels.paddy}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-white">₹2,300 / Qtl</span>
                    <span className="block text-[10px] text-emerald-400 font-bold">▲ +₹50 {labels.today}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌾</span>
                    <div>
                      <span className="block text-sm font-semibold text-white">{labels.wheat}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-white">₹2,275 / Qtl</span>
                    <span className="block text-[10px] text-slate-300 font-bold">{labels.stable}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌾</span>
                    <div>
                      <span className="block text-sm font-semibold text-white">{labels.mustard}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-white">₹5,450 / Qtl</span>
                    <span className="block text-[10px] text-emerald-400 font-bold">▲ +₹120 {labels.today}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Live Location Weather & Agro Advisory Banner */}
              <div className="pt-2">
                <div className="bg-slate-900/60 border border-emerald-500/20 p-4 rounded-2xl text-slate-200 leading-relaxed backdrop-blur-md shadow-lg">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{weather.icon}</span>
                      <div>
                        <span className="text-xs font-black text-white block leading-tight">
                          {weatherLoading ? "Fetching Weather..." : `${weather.temp}°C, ${weather.condition}`}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold block">
                          📍 {weather.locationName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      Live Weather
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 leading-normal">
                    {weather.advisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
