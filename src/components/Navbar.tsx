"use client";

import React, { useState, useEffect } from "react";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto transition-all duration-300">
      <nav
        className={`w-full rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/80 backdrop-blur-md border border-slate-800/40 shadow-xl py-3 px-6"
            : "bg-slate-900/70 backdrop-blur-sm border border-slate-800/20 py-4 px-8"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight select-none">
              <span className="text-emerald-400">Kisan</span>
              <span className="text-white">Setu</span>
            </span>
          </a>

          {/* Navigation Options - Middle */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#centers"
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors relative group py-1"
            >
              Procurement Centers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#scheduler"
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors relative group py-1"
            >
              Book Schedule
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#queue"
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors relative group py-1"
            >
              Live Queue Status
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          {/* Login Portal Button - Rightmost */}
          <div className="hidden md:block">
            <button
              onClick={onLoginClick}
              className="bg-white hover:bg-emerald-400 text-black font-bold text-sm px-5 py-2.5 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
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
              Farmer's Login
            </button>
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col space-y-4 px-2 pb-2">
            <a
              href="#centers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium text-base py-1 transition-colors"
            >
              Procurement Centers
            </a>
            <a
              href="#scheduler"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium text-base py-1 transition-colors"
            >
              Book Schedule
            </a>
            <a
              href="#queue"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium text-base py-1 transition-colors"
            >
              Live Queue Status
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
              className="w-full bg-white hover:bg-emerald-400 text-black font-bold text-center py-3 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              Farmer's Login Portal
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
