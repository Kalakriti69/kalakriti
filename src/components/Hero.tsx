"use client";

import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-emerald-50/50 via-white to-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60 translate-x-10 -translate-y-10"></div>
      <div className="absolute bottom-10 left-0 -z-10 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-80 -translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content Left */}
          <div className="lg:col-span-6 flex flex-col space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-200/60 rounded-full px-3 py-1.5 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-950 font-semibold text-xs tracking-wide uppercase">
                Digital Procurement Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Connecting Farms to Markets with <span className="text-emerald-600">KisanSetu</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Book crop delivery slots, locate available procurement centers in real-time, and track your queue position directly from your mobile. Simple, transparent, and built for our farmers.
            </p>

            {/* CTA Buttons - Green background with Black text, and White background with Black text */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#scheduler"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
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
                Book Your Schedule
              </a>
              <a
                href="#centers"
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-black hover:border-emerald-500 hover:bg-emerald-50 font-bold text-base px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Find Centers Near Me
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
              <div>
                <span className="block text-2xl font-extrabold text-emerald-600">45+</span>
                <span className="text-sm text-slate-500 font-medium">Procurement Hubs</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-600">12k+</span>
                <span className="text-sm text-slate-500 font-medium">Happy Farmers</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-600">Live</span>
                <span className="text-sm text-slate-500 font-medium">Queue Tracking</span>
              </div>
            </div>
          </div>

          {/* Animated Mockup Content Right */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* The main animated image container */}
            <div className="relative w-full max-w-lg aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 animate-float transition-all duration-500 hover:shadow-emerald-100/50">
              <Image
                src="/hero_farm.jpg"
                alt="Modern Agriculture Analytics and Fields"
                fill
                priority
                className="object-cover"
                sizes="(max-w-768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Widget 1 - Live Queue Card */}
            <div className="absolute -top-6 -right-2 md:right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-emerald-100 flex items-center space-x-3 animate-pulse-slow">
              <div className="bg-emerald-500 p-2.5 rounded-lg text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.97 5.97 0 0 0-.75-2.906m-.179-1.944H18a3 3 0 0 0 3-3V11.25a3 3 0 0 0-3-3h-1.5m-9 0H6a3 3 0 0 0-3 3v.169a3 3 0 0 0 3 3h1.5m-1.5-6a3 3 0 0 1 3.75-2.906m0 5.812a3 3 0 0 1-3.75-2.906m0 0a5.97 5.97 0 0 1 .75-2.906m12 0a5.97 5.97 0 0 1-.75 2.906m-6 3.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20.25a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Live Center Serving
                </span>
                <span className="block text-lg font-bold text-slate-900">Token #238</span>
              </div>
            </div>

            {/* Floating Widget 2 - Fast Booking */}
            <div className="absolute -bottom-6 -left-2 md:-left-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-emerald-100 flex items-center space-x-3">
              <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
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
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">
                  Verified Booking
                </span>
                <span className="block text-sm font-bold text-slate-800">Done in 2 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
