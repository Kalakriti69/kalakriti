"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MOCK_CENTERS } from "./ProcurementCenters";

interface ScheduleBookingProps {
  preselectedCenter?: string;
  preselectedCrop?: string;
  preselectedWeight?: number;
  preselectedDate?: string;
  preselectedSlot?: string;
  preselectedStep?: number;
  onBookingSuccess: (bookingDetails: {
    center: string;
    crop: string;
    weight: number;
    date: string;
    timeSlot: string;
    tokenId: string;
  }) => void;
}

const TIME_SLOTS = [
  { time: "08:00 AM - 10:00 AM", status: "Available", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { time: "10:00 AM - 12:00 PM", status: "Almost Full", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { time: "12:00 PM - 02:00 PM", status: "Filled", color: "text-red-500 bg-red-50 border-red-100 opacity-60 cursor-not-allowed" },
  { time: "02:00 PM - 04:00 PM", status: "Available", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { time: "04:00 PM - 06:00 PM", status: "Available", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export default function ScheduleBooking({
  preselectedCenter,
  preselectedCrop,
  preselectedWeight,
  preselectedDate,
  preselectedSlot,
  preselectedStep,
  onBookingSuccess,
}: ScheduleBookingProps) {
  const [step, setStep] = useState(1);
  const [center, setCenter] = useState("");
  const [crop, setCrop] = useState("Paddy");
  const [weight, setWeight] = useState<number>(30); // in quintals
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const { t } = useTranslation();
  
  // Receipt details
  const [receipt, setReceipt] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Sync preselected parameters from URL/Chatbot
  useEffect(() => {
    if (preselectedCenter) setCenter(preselectedCenter);
    if (preselectedCrop) setCrop(preselectedCrop);
    if (preselectedWeight && !isNaN(preselectedWeight)) setWeight(preselectedWeight);
    if (preselectedDate) setSelectedDate(preselectedDate);
    if (preselectedSlot) setSelectedSlot(preselectedSlot);
    if (preselectedStep && preselectedStep >= 1 && preselectedStep <= 4) {
      setStep(preselectedStep);
    } else if (preselectedCenter) {
      setStep(1);
    }
  }, [preselectedCenter, preselectedCrop, preselectedWeight, preselectedDate, preselectedSlot, preselectedStep]);

  // Generate date options (Next 6 days starting today)
  const [dateOptions, setDateOptions] = useState<any[]>([]);
  useEffect(() => {
    const days = [];
    const localeDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const localeMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        id: date.toISOString().split("T")[0],
        dayName: localeDays[date.getDay()],
        dayNum: date.getDate(),
        month: localeMonths[date.getMonth()],
      });
    }
    setDateOptions(days);
    setSelectedDate(days[0].id); // default to today
  }, []);

  const handleNextStep = async () => {
    if (step === 1 && !center) {
      alert("Please select a procurement center first.");
      return;
    }
    if (step === 2 && (!weight || weight <= 0)) {
      alert("Please enter a valid weight in quintals.");
      return;
    }
    if (step === 3 && !selectedSlot) {
      alert("Please choose an available time slot.");
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (isBooking) return;
      setIsBooking(true);
      try {
        const matchCenter = MOCK_CENTERS.find(c => c.name === center);
        const centreId = matchCenter ? matchCenter.id : MOCK_CENTERS[0].id;

        // Map selectedSlot string to UUID format matching database.types.ts schemas
        const slotMap: Record<string, string> = {
          "08:00 AM - 10:00 AM": "11111111-aaa1-1111-1111-111111111111",
          "10:00 AM - 12:00 PM": "11111111-aaa2-1111-1111-111111111111",
          "12:00 PM - 02:00 PM": "11111111-aaa3-1111-1111-111111111111",
          "02:00 PM - 04:00 PM": "11111111-aaa4-1111-1111-111111111111",
          "04:00 PM - 06:00 PM": "11111111-aaa5-1111-1111-111111111111",
        };
        const slotId = slotMap[selectedSlot] || "11111111-aaa1-1111-1111-111111111111";
        const farmerId = "99999999-9999-9999-9999-999999999999";

        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ farmerId, centreId, slotId }),
        });
        const data = await res.json();
        
        if (data.success && data.booking) {
          const bookingData = {
            center,
            crop,
            weight,
            date: selectedDate,
            timeSlot: selectedSlot,
            tokenId: `KS-${data.booking.token_number}`,
          };
          setReceipt(bookingData);
          setStep(4);
          onBookingSuccess(bookingData);
        } else {
          alert("Booking failed: " + (data.error || "Please try again."));
        }
      } catch (err) {
        console.error("Booking error:", err);
        alert("An error occurred during booking. Generating offline receipt...");
        
        // Fallback to random offline token if API is down
        const randomToken = "KS-" + Math.floor(100000 + Math.random() * 900000);
        const bookingData = {
          center,
          crop,
          weight,
          date: selectedDate,
          timeSlot: selectedSlot,
          tokenId: randomToken,
        };
        setReceipt(bookingData);
        setStep(4);
        onBookingSuccess(bookingData);
      } finally {
        setIsBooking(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetForm = () => {
    setStep(1);
    setCenter(preselectedCenter || "");
    setCrop("Paddy");
    setWeight(30);
    setSelectedSlot("");
    setReceipt(null);
  };

  return (
    <section id="scheduler" className="py-20 bg-emerald-50/30 border-y border-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("sched_title")}
          </h2>
          <div className="h-1.5 w-24 bg-emerald-500 mx-auto my-4 rounded-full"></div>
          <p className="text-slate-600">
            {t("sched_desc")}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Progress Indicators */}
          {step <= 3 && (
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              {[
                { s: 1, label: t("sched_step_center") },
                { s: 2, label: t("sched_step_crop") },
                { s: 3, label: t("sched_step_date") },
              ].map((item) => (
                <div key={item.s} className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= item.s
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.s}
                  </div>
                  <span
                    className={`text-sm font-semibold hidden sm:inline ${
                      step === item.s ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form Step Body */}
          <div className="min-h-[250px] mb-8">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-800">{t("sched_step_1_title")}</h3>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {t("sched_step_center")}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {MOCK_CENTERS.map((c, idx) => {
                      const localizedCenterName = t(`center_${idx + 1}_name`);
                      const localizedLoc = t(`center_${idx + 1}_loc`);

                      return (
                        <div
                          key={c.id}
                          onClick={() => setCenter(c.name)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                            center === c.name
                              ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{localizedCenterName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{localizedLoc}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                              {c.distance}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                center === c.name ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                              }`}
                            >
                              {center === c.name && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-800">{t("sched_step_2_title")}</h3>
                
                {/* Crop Type Select */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {t("sched_step_2_crop")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["Paddy", "Wheat", "Maize", "Mustard"].map((item) => (
                      <div
                        key={item}
                        onClick={() => setCrop(item)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer font-bold ${
                          crop === item
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-xl mb-1">🌾</span>
                        <span className="text-sm">{t("crop_" + item)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weight Input (Quintals) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {t("sched_step_2_weight")}
                    </label>
                    <span className="text-lg font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      {weight} Qtl <span className="text-xs font-normal text-slate-500">({weight * 100} kg)</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-semibold px-1">
                    <span>5 Qtl {t("sched_step_2_min")}</span>
                    <span>50 Qtl</span>
                    <span>100 Qtl</span>
                    <span>150 Qtl {t("sched_step_2_max")}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-800">{t("sched_step_3_title")}</h3>

                {/* Date Slider */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {t("sched_step_3_date")}
                  </label>
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                    {dateOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedDate(opt.id)}
                        className={`flex-1 min-w-[70px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between ${
                          selectedDate === opt.id
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-400 uppercase">{opt.dayName}</span>
                        <span className="text-lg font-extrabold text-slate-800 my-0.5">{opt.dayNum}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{opt.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {t("sched_step_3_slots")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isFilled = slot.status === "Filled";
                      return (
                        <div
                          key={slot.time}
                          onClick={() => !isFilled && setSelectedSlot(slot.time)}
                          className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            selectedSlot === slot.time
                              ? "border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]"
                              : isFilled
                              ? slot.color
                              : `${slot.color} border hover:scale-[1.01] hover:shadow-sm`
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold">{slot.time}</p>
                            <p
                              className={`text-[10px] font-semibold uppercase mt-0.5 ${
                                selectedSlot === slot.time ? "text-emerald-300" : ""
                              }`}
                            >
                              {slot.status}
                            </p>
                          </div>
                          {!isFilled && (
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                selectedSlot === slot.time ? "border-emerald-400" : "border-slate-300"
                              }`}
                            >
                              {selectedSlot === slot.time && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && receipt && (
              <div className="text-center py-4 space-y-6 animate-fade-in-up">
                {/* Visual success alert */}
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900">{t("sched_success")}</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm">
                  {t("sched_success_desc")}
                </p>

                {/* Digital Token Receipt Mockup */}
                <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-left relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full flex items-center justify-center font-bold text-emerald-800 text-xs">
                    ACTIVE
                  </div>

                  <div className="border-b border-dashed border-slate-300 pb-4 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("sched_ticket_token")}</span>
                    <p className="text-2xl font-black text-emerald-600 tracking-wider mt-0.5">{receipt.tokenId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 block mb-0.5">{t("sched_ticket_center")}</span>
                      <span className="text-slate-800 block text-sm font-bold leading-tight">
                        {t(`center_${MOCK_CENTERS.findIndex(c => c.name === receipt.center) + 1}_name`)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">{t("sched_ticket_crop")}</span>
                      <span className="text-slate-800 block text-sm font-bold">
                        🌾 {t("crop_" + receipt.crop)} ({receipt.weight} Qtl)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">{t("sched_ticket_date")}</span>
                      <span className="text-slate-800 block text-sm font-bold">
                        📅 {receipt.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">{t("sched_ticket_slot")}</span>
                      <span className="text-slate-800 block text-sm font-bold">
                        ⏰ {receipt.timeSlot}
                      </span>
                    </div>
                  </div>

                  {/* Mock QR Code Visual */}
                  <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 font-bold text-[10px] mt-1 inline-block">
                        {t("sched_ticket_status")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="w-24 h-6 bg-slate-900 relative flex items-center justify-between px-1.5 py-1 rounded">
                        <div className="h-full w-1 bg-white"></div>
                        <div className="h-full w-0.5 bg-white"></div>
                        <div className="h-full w-2 bg-white"></div>
                        <div className="h-full w-0.5 bg-white"></div>
                        <div className="h-full w-1 bg-white"></div>
                        <div className="h-full w-1.5 bg-white"></div>
                        <div className="h-full w-0.5 bg-white"></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1">{t("sched_ticket_scan")}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    🖨️ {t("sched_btn_print")}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    🔄 {t("sched_btn_another")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Action Controls */}
          {step <= 3 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handlePrevStep}
                disabled={step === 1}
                className={`px-5 py-3 rounded-full font-bold text-sm transition-all ${
                  step === 1
                    ? "text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed"
                    : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                }`}
              >
                {t("sched_btn_prev")}
              </button>

              <button
                onClick={handleNextStep}
                disabled={isBooking}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-7 py-3 rounded-full shadow-md transition-all duration-300 cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {isBooking ? "Booking..." : (step === 3 ? t("sched_btn_gen") : t("sched_btn_next"))}
                {!isBooking && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
