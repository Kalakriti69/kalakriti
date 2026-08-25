"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Hero() {
  const { t, lang } = useTranslation();

  const tickerCrops: Record<string, Record<string, string>> = {
    en: { paddy: "Paddy (Common)", wheat: "Wheat", mustard: "Mustard Seed", stable: "Stable", today: "today" },
    hi: { paddy: "धान (सामान्य)", wheat: "गेहूं", mustard: "सरसों", stable: "स्थिर", today: "आज" },
    or: { paddy: "ଧାନ (ସାଧାରଣ)", wheat: "ଗହମ", mustard: "ସୋରିଷ", stable: "ସ୍ଥିର", today: "ଆଜି" },
    pa: { paddy: "ਝੋਨਾ (ਆਮ)", wheat: "ਕਣਕ", mustard: "ਸਰ੍ਹੋਂ", stable: "ਸਥਿਰ", today: "ਅੱਜ" },
    bn: { paddy: "ধান (সাধারণ)", wheat: "গম", mustard: "সরিষা", stable: "স্থিতিশীল", today: "আজ" }
  };
  const labels = tickerCrops[lang] || tickerCrops["en"];

  return (
    <section className="relative w-full min-h-[90vh] pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center bg-slate-950">
      {/* Blurred Isolated Background Image - Light blur to keep the farmers visible */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-[1.5px] scale-[1.02] z-0 transition-all duration-500"
        style={{ backgroundImage: "url('/farmers_field.jpg')" }}
      ></div>

      {/* Dark Vignette and Gradient Overlays for Peak Text Visibility and Image Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-slate-950/70 z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#020617_85%)] z-10 opacity-55"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content Left - Wrapped in a Premium Fully Transparent Glass Container */}
          <div className="lg:col-span-6 flex flex-col space-y-6 animate-fade-in-up bg-transparent backdrop-blur-md border border-white/15 p-6 sm:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] shadow-blue-500/5">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1.5 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-semibold text-xs tracking-wide uppercase text-shadow-sm">
                {t("hero_badge")}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight text-shadow-md">
              {t("hero_title")} <span className="text-emerald-400">KisanSetu</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed text-shadow-sm">
              {t("hero_desc")}
            </p>

            {/* CTA Buttons */}
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
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 text-shadow-sm">
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

          {/* Interactive Live Mandi & Weather Ticker Widget Right - Premium Fully Transparent Glass */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="w-full max-w-md bg-transparent backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] shadow-blue-500/5 space-y-6 text-white animate-float">
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h4 className="font-bold text-base text-white tracking-wide">🌾 {t("hero_mandi_rates")}</h4>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  {t("hero_msp")}
                </span>
              </div>

              {/* Ticker rates */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌾</span>
                    <div>
                      <span className="block text-sm font-bold text-white">{labels.paddy}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-white">₹2,300 / Qtl</span>
                    <span className="block text-[10px] text-emerald-400 font-bold">▲ +₹50 {labels.today}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌾</span>
                    <div>
                      <span className="block text-sm font-bold text-white">{labels.wheat}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-white">₹2,275 / Qtl</span>
                    <span className="block text-[10px] text-slate-300 font-bold">{labels.stable}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌾</span>
                    <div>
                      <span className="block text-sm font-bold text-white">{labels.mustard}</span>
                      <span className="block text-[10px] text-slate-400">{t("hero_mandi_price")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-white">₹5,450 / Qtl</span>
                    <span className="block text-[10px] text-emerald-400 font-bold">▲ +₹120 {labels.today}</span>
                  </div>
                </div>
              </div>

              {/* Weather & Advisory */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{t("hero_weather_adv")}</span>
                <div className="flex items-start space-x-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-300 font-semibold leading-relaxed">
                  <span className="text-lg shrink-0">☀️</span>
                  <p>{t("hero_weather_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
