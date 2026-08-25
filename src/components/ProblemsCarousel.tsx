"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface Slide {
  id: number;
  farmer: string;
  location: string;
  problemTitle: string;
  problem: string;
  solutionTitle: string;
  solution: string;
  icon: string;
}

export default function ProblemsCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { t } = useTranslation();

  const slides: Slide[] = [
    {
      id: 0,
      farmer: "Harpreet Singh",
      location: "Sangrur, Punjab",
      problemTitle: "🚜 Scorching 18-Hour Queue Delays",
      problem: "I used to line up my tractor at the mandi gate for 18 hours in the burning heat, wasting fuel and food, just waiting for my turn to deliver grain.",
      solutionTitle: "⚡ KisanSetu Live Token Scheduler",
      solution: "Now, I book a delivery schedule slot online, track the queue status on my phone, and arrive exactly when my token is next. No waiting!",
      icon: "🌾",
    },
    {
      id: 1,
      farmer: "Devendra Patra",
      location: "Bargarh, Odisha",
      problemTitle: "❌ Traveling to Closed or Full Mandis",
      problem: "Last season, I traveled 15km with my harvest only to find the center had run out of capacity. I had to pay extra for overnight tractor rent.",
      solutionTitle: "📊 Real-Time Mandi Capacity Meter",
      solution: "KisanSetu displays live space utilization and wait times for every hub. I check capacity before loading my crop, ensuring a guaranteed entry.",
      icon: "📦",
    },
    {
      id: 2,
      farmer: "Ramesh Naskar",
      location: "Burdwan, West Bengal",
      problemTitle: "💰 Payment Delays of 2-3 Months",
      problem: "After selling my crop, it used to take months of visits to cooperative banks and commission agents to get my hard-earned payment cleared.",
      solutionTitle: "🏦 Direct Benefit Transfer (DBT) Payouts",
      solution: "With KisanSetu portal registration, my crop sales invoice is verified instantly at the gate, and MSP payout is credited to my bank account in 72 hours.",
      icon: "💸",
    },
  ];

  // Auto-play sliding animation every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-20 bg-slate-900 text-white overflow-hidden relative border-t border-slate-800">
      {/* Visual background decorations */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            Real Challenges, Smart Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">
            How KisanSetu Resolves Farmer Problems
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto my-4 rounded-full"></div>
        </div>

        {/* Carousel Frame */}
        <div className="relative w-full flex items-center justify-center py-2">
          {/* Inner slide container with swipe transform transition */}
          <div className="w-full relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out w-full"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div 
                  key={slide.id} 
                  className="w-full flex-shrink-0 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
                >
                  {/* Left Column - The Farmer Problem */}
                  <div className="bg-slate-950/50 border border-slate-800 p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-4 hover:border-slate-700/60 transition-colors">
                    <div className="space-y-3">
                      <span className="text-3xl">{slide.icon}</span>
                      <h4 className="text-lg font-bold text-red-400 uppercase tracking-wide">
                        {slide.problemTitle}
                      </h4>
                      <p className="text-sm sm:text-base text-slate-300 italic leading-relaxed font-medium">
                        "{slide.problem}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-800">
                      <span className="block font-black text-slate-100 text-sm">{slide.farmer}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">📍 {slide.location}</span>
                    </div>
                  </div>

                  {/* Right Column - The KisanSetu Solution */}
                  <div className="bg-emerald-950/20 border-2 border-emerald-500/30 p-6 sm:p-8 rounded-3xl flex flex-col justify-center space-y-4 shadow-lg shadow-emerald-950/20">
                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                      KisanSetu Advantage
                    </span>
                    <h4 className="text-xl font-black text-emerald-400">
                      {slide.solutionTitle}
                    </h4>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-semibold">
                      {slide.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swipe Buttons (Prev/Next Arrows) */}
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-0 md:-translate-x-6 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-750 hover:text-emerald-400 border border-slate-700 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer z-10"
            aria-label="Previous challenge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-0 md:translate-x-6 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-750 hover:text-emerald-400 border border-slate-700 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer z-10"
            aria-label="Next challenge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Carousel Indicators (Dots) */}
        <div className="flex justify-center space-x-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? "w-8 bg-emerald-500" : "w-2.5 bg-slate-800 hover:bg-slate-750"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
