"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<{ name: string } | null>(null);
  const { t, lang, changeLanguage } = useTranslation();

  const syncProfile = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kisanSetu_farmer_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setFarmerProfile(parsed);
            return;
          }
        } catch {}
      }
      setFarmerProfile(null);
    }
  };

  useEffect(() => {
    syncProfile();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("kisanSetu_profile_updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("kisanSetu_profile_updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  return (
    <>
      {/* Backdrop blur overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-md z-40 md:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto transition-all duration-300">
        <nav
          className={`w-full transition-all duration-300 ${mobileMenuOpen
            ? "rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-blue-500/30 shadow-[0_8px_32px_0_rgba(14,165,233,0.15)] py-3.5 px-5"
            : scrolled
              ? "rounded-2xl md:rounded-full bg-slate-950/75 backdrop-blur-md border border-blue-500/20 shadow-[0_8px_32px_0_rgba(14,165,233,0.1)] py-2 md:py-2.5 px-4 md:px-6"
              : "rounded-2xl md:rounded-full bg-slate-950/60 backdrop-blur-sm border border-blue-500/15 py-2.5 md:py-3.5 px-5 md:px-8"
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2.5 group">
              <div className="relative flex items-center justify-center">
                <img
                  src="/icon.svg"
                  alt="KisanSetu Logo"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight select-none leading-none">
                  <span className="text-emerald-400">Kisan</span>
                  <span className="text-white">Setu</span>
                </span>
                <span className="text-[9px] font-bold tracking-wider text-emerald-400/80 uppercase mt-0.5 hidden sm:block">
                  Farmer's Portal
                </span>
              </div>
            </a>

            {/* Navigation Options - Middle */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/centers"
                className="text-slate-300 hover:text-white font-semibold text-sm transition-colors relative group py-1"
              >
                {t("nav_centers")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/scheduler"
                className="text-slate-300 hover:text-white font-semibold text-sm transition-colors relative group py-1"
              >
                {t("nav_schedule")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/queue"
                className="text-slate-300 hover:text-white font-semibold text-sm transition-colors relative group py-1"
              >
                {t("nav_queue")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>

            {/* Action Buttons - Rightmost */}
            <div className="hidden md:flex items-center">
              {farmerProfile ? (
                <a
                  href="/profile"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-sm px-5 py-2.5 rounded-full shadow-md shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs">
                    👨‍🌾
                  </span>
                  <span>{farmerProfile.name.split(" ")[0]}</span>
                </a>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="bg-white hover:bg-emerald-400 text-black font-extrabold text-sm px-5 py-2.5 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  {t("nav_login")}
                </button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-emerald-400 p-2 focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu with Slide Down effect */}
          <div className={`md:hidden flex flex-col space-y-4 px-2 overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen
            ? "max-h-[500px] opacity-100 mt-4 pt-4 border-t border-slate-800/80 pb-2"
            : "max-h-0 opacity-0 pointer-events-none mt-0 pt-0 border-t-0 pb-0"
            }`}>
            <a
              href="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-bold text-base py-1 transition-colors"
            >
              {t("nav_centers")}
            </a>
            <a
              href="/scheduler"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-bold text-base py-1 transition-colors"
            >
              {t("nav_schedule")}
            </a>
            <a
              href="/queue"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-bold text-base py-1 transition-colors"
            >
              {t("nav_queue")}
            </a>
            {farmerProfile ? (
              <a
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-center py-3 rounded-full transition-all flex items-center justify-center gap-2"
              >
                <span>👨‍🌾</span>
                <span>{farmerProfile.name} (Profile)</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="w-full bg-white hover:bg-emerald-400 text-black font-extrabold text-center py-3 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                {t("nav_login_portal")}
              </button>
            )}

            {/* Mobile Settings Block with Blue Glass theme */}
            <div className="pt-4 mt-2 border-t border-slate-800/80 space-y-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                ⚙️ Quick Options
              </span>

              {/* Mobile Language */}
              <div className="space-y-1 px-1">
                <span className="text-xs text-slate-400 font-semibold block">Change Language</span>
                <select
                  value={lang}
                  onChange={(e) => {
                    changeLanguage(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-950 border border-blue-500/20 text-white rounded-xl py-2 px-3 text-sm font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="or">ଓଡ଼ିଆ (Odia)</option>
                </select>
              </div>

              {/* Mobile operator/admin */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    alert("Operator login page is under maintenance.");
                  }}
                  className="bg-slate-950/80 hover:bg-slate-900 border border-blue-500/20 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  🛠️ Operator
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    alert("Admin login portal is restricted.");
                  }}
                  className="bg-slate-950/80 hover:bg-slate-900 border border-blue-500/20 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  👮 Admin
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Floating Settings Button for PC View with Blue Glass styling */}
        <div className="hidden md:block fixed top-6 right-6 z-100">
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="bg-slate-950/90 hover:bg-emerald-500 text-white p-3 rounded-full shadow-lg border border-blue-500/20 backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-center hover:rotate-45"
              title="Settings"
              aria-label="Settings options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5.5 h-5.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>

            {/* Settings Dropdown Popover */}
            {settingsOpen && (
              <div className="absolute right-0 mt-3 bg-slate-950/95 border border-blue-500/30 text-white rounded-2xl p-4 w-72 shadow-2xl z-100 animate-fade-in-up space-y-4 backdrop-blur-xl">
                {/* Language Selection */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    🌐 Quick Language
                  </span>
                  <select
                    value={lang}
                    onChange={(e) => {
                      changeLanguage(e.target.value);
                      setSettingsOpen(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="or">ଓଡ଼ିଆ (Odia)</option>
                  </select>
                </div>

                {/* Administrative Login Portals */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    🔐 Staff Access
                  </span>

                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      alert("Operator login page is under maintenance. Please contact IT center.");
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>🛠️ Operator Login</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold uppercase">Operator</span>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      alert("Administrative login portal requires secondary hardware security key.");
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>👮 Admin Portal Login</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold uppercase">Admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
