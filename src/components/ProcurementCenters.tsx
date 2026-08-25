"use client";

import React, { useState } from "react";

export interface Center {
  id: string;
  name: string;
  location: string;
  distance: string;
  crops: string[];
  capacity: number; // percentage
  waitTime: string;
  status: "available" | "busy" | "full";
  phone: string;
}

export const MOCK_CENTERS: Center[] = [
  {
    id: "center-1",
    name: "GreenValley Agriculture Hub",
    location: "Kalyanpur Market Link Rd, Block A",
    distance: "1.2 km away",
    crops: ["Paddy", "Wheat", "Maize"],
    capacity: 42,
    waitTime: "15 mins wait",
    status: "available",
    phone: "+91 98765 43210",
  },
  {
    id: "center-2",
    name: "Kalyanpur Krishi Mandi",
    location: "Mandi Bypass Chowk, Sector 4",
    distance: "3.8 km away",
    crops: ["Paddy", "Maize", "Mustard"],
    capacity: 78,
    waitTime: "45 mins wait",
    status: "busy",
    phone: "+91 98765 43211",
  },
  {
    id: "center-3",
    name: "Jai Kisan Sangrah Kendra",
    location: "National Highway 2, Near Toll Plaza",
    distance: "5.5 km away",
    crops: ["Wheat", "Mustard", "Barley"],
    capacity: 94,
    waitTime: "90 mins wait",
    status: "full",
    phone: "+91 98765 43212",
  },
  {
    id: "center-4",
    name: "Setu Sahakari Samiti Kendra",
    location: "Rampur Village Panchayat Office",
    distance: "7.1 km away",
    crops: ["Paddy", "Wheat", "Barley"],
    capacity: 18,
    waitTime: "5 mins wait",
    status: "available",
    phone: "+91 98765 43213",
  },
];

interface ProcurementCentersProps {
  onSelectCenter: (centerName: string) => void;
}

export default function ProcurementCenters({ onSelectCenter }: ProcurementCentersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");

  const filteredCenters = MOCK_CENTERS.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === "All" || center.crops.includes(selectedCrop);
    return matchesSearch && matchesCrop;
  });

  return (
    <section id="centers" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Available Procurement Centers
          </h2>
          <div className="h-1.5 w-24 bg-emerald-500 mx-auto my-4 rounded-full"></div>
          <p className="text-lg text-slate-600">
            Check the real-time capacity and wait times of centers near you. Select a center to book your crop delivery schedule instantly.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-emerald-50/50 rounded-3xl p-6 sm:p-8 mb-10 border border-emerald-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-1/2">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by center name, village or road..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 text-sm shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-slate-500 font-semibold text-sm whitespace-nowrap mr-2">Filter Crop:</span>
            {["All", "Paddy", "Wheat", "Maize", "Mustard", "Barley"].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  selectedCrop === crop
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Center Grid */}
        {filteredCenters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Stats */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {center.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-emerald-500 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"
                          />
                        </svg>
                        {center.location}
                      </p>
                    </div>

                    <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {center.distance}
                    </span>
                  </div>

                  {/* Accepted Crops tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {center.crops.map((crop) => (
                      <span
                        key={crop}
                        className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                      >
                        🌾 {crop}
                      </span>
                    ))}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Live Space Utilization</span>
                      <span
                        className={`font-bold ${
                          center.status === "available"
                            ? "text-emerald-600"
                            : center.status === "busy"
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {center.capacity}% {center.status === "available" ? "Available" : center.status === "busy" ? "Moderately Busy" : "Almost Full"}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          center.status === "available"
                            ? "bg-emerald-500"
                            : center.status === "busy"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${center.capacity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    {center.waitTime}
                  </div>

                  <button
                    onClick={() => onSelectCenter(center.name)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-3 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 group-hover:bg-slate-950 group-hover:hover:bg-emerald-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Select for Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-slate-400 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <h3 className="text-lg font-bold text-slate-800">No centers found</h3>
            <p className="text-sm text-slate-500 mt-1">Try modifying your search or crop filter options.</p>
          </div>
        )}
      </div>
    </section>
  );
}
