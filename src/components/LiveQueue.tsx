"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MOCK_CENTERS } from "./ProcurementCenters";

interface LiveQueueProps {
  activeBooking: {
    center: string;
    crop: string;
    weight: number;
    date: string;
    timeSlot: string;
    tokenId: string;
  } | null;
}

export default function LiveQueue({ activeBooking }: LiveQueueProps) {
  const [selectedCenterId, setSelectedCenterId] = useState(MOCK_CENTERS[0].id);
  const [userToken, setUserToken] = useState("");
  const [positionResult, setPositionResult] = useState<any>(null);
  const { t, lang } = useTranslation();
  
  // Real-time queue simulation state
  const [servingToken, setServingToken] = useState(104);
  const [avgWaitPerToken, setAvgWaitPerToken] = useState(6); // minutes

  // Auto-fill user token if they recently booked a slot
  useEffect(() => {
    if (activeBooking) {
      const matchCenter = MOCK_CENTERS.find(c => c.name === activeBooking.center);
      if (matchCenter) {
        setSelectedCenterId(matchCenter.id);
      }
      const numericToken = activeBooking.tokenId.replace(/\D/g, "");
      const shortToken = Number(numericToken) % 100 + 110;
      setUserToken(shortToken.toString());
    }
  }, [activeBooking]);

  const handleCheckQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) return;

    const tokenNum = parseInt(userToken);
    if (isNaN(tokenNum)) {
      alert("Please enter a valid numeric token number.");
      return;
    }

    calculatePosition(tokenNum);
  };

  const calculatePosition = (tokenNum: number) => {
    if (tokenNum <= servingToken) {
      setPositionResult({
        status: "served",
        message: t("queue_status_served"),
        slotsAhead: 0,
        estWait: 0,
      });
    } else {
      const slotsAhead = tokenNum - servingToken;
      const estWait = slotsAhead * avgWaitPerToken;
      
      let statusMsg = "";
      let alertColor = "";
      if (slotsAhead <= 3) {
        statusMsg = t("queue_status_immediate");
        alertColor = "text-red-700 bg-red-50 border-red-200 animate-pulse";
      } else if (slotsAhead <= 8) {
        statusMsg = t("queue_status_prepare");
        alertColor = "text-amber-700 bg-amber-50 border-amber-200";
      } else {
        statusMsg = t("queue_status_safe");
        alertColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      }

      setPositionResult({
        status: "waiting",
        slotsAhead,
        estWait,
        message: statusMsg,
        alertColor,
      });
    }
  };

  useEffect(() => {
    if (userToken && !isNaN(parseInt(userToken))) {
      calculatePosition(parseInt(userToken));
    }
  }, [servingToken]);

  const handleSimulateNext = () => {
    setServingToken(prev => prev + 1);
  };

  const activeCenter = MOCK_CENTERS.find(c => c.id === selectedCenterId) || MOCK_CENTERS[0];

  // Localized Inline Labels
  const vehiclesAheadLabels: Record<string, string> = {
    en: "Vehicles Ahead",
    hi: "आगे वाहन",
    or: "ଆଗରେ ଥିବା ଗାଡ଼ି",
    pa: "ਅੱਗੇ ਵਾਹਨ",
    bn: "আগের যানবাহন"
  };

  const estWaitLabels: Record<string, string> = {
    en: "Estimated Wait",
    hi: "अनुमानित प्रतीक्षा",
    or: "ଆନୁମାନିକ ଅପେକ୍ଷା",
    pa: "ਅੰਦਾਜ਼ਨ ਉਡੀਕ",
    bn: "আনুমানিক অপেক্ষা"
  };

  const timelineLabels: Record<string, Record<string, string>> = {
    en: { serving: "Serving Now", next: "Next Gate", weigh: "Weighbridge", spot: "Your Token Spot" },
    hi: { serving: "अभी सेवा में", next: "अगला गेट", weigh: "धर्मकांटा", spot: "आपका टोकन स्थान" },
    or: { serving: "ବର୍ତ୍ତମାନ ସେବା", next: "ପରବର୍ତ୍ତୀ ଗେଟ୍", weigh: "ୱେବ୍ରିଜ୍", spot: "ଆପଣଙ୍କ ଟୋକନ ସ୍ଥାନ" },
    pa: { serving: "ਹੁਣ ਚੱਲ ਰਿਹਾ", next: "ਅਗਲਾ ਗੇਟ", weigh: "ਧਰਮਕੰਡਾ", spot: "ਤੁਹਾਡਾ ਟੋਕਨ" },
    bn: { serving: "এখন সেবা", next: "পরবর্তী গেট", weigh: "ওয়েব্রিজ", spot: "আপনার টোকেন" }
  };

  const currentTimeline = timelineLabels[lang] || timelineLabels["en"];

  return (
    <section id="queue" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("queue_title")}
          </h2>
          <div className="h-1.5 w-24 bg-emerald-500 mx-auto my-4 rounded-full"></div>
          <p className="text-lg text-slate-600">
            {t("queue_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left panel - Active Counter Widget */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6">
              {t("queue_feed")}
            </span>

            {/* Selector */}
            <div className="space-y-2 mb-8">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                {t("sched_step_center")}
              </label>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-sm font-semibold"
              >
                {MOCK_CENTERS.map((c, idx) => (
                  <option key={c.id} value={c.id}>
                    {t(`center_${idx + 1}_name`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Display active serving */}
            <div className="space-y-1 mb-8 text-center bg-slate-800/50 rounded-2xl py-8 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t("queue_serving")}
              </span>
              <p className="text-6xl font-black text-emerald-400 tracking-wider font-mono my-2 animate-pulse">
                #{servingToken}
              </p>
              <p className="text-xs text-slate-400">
                {t("queue_serving_desc")}
              </p>
            </div>

            {/* Center stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t("queue_serving_avg")}</span>
                <span className="text-lg font-bold text-white mt-0.5">{avgWaitPerToken} {t("queue_serving_mins")}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t("queue_serving_gate")}</span>
                <span className="text-lg font-bold text-white mt-0.5">{servingToken + 12} {t("queue_status_vehicles")}</span>
              </div>
            </div>

            {/* Simulation trigger */}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                onClick={handleSimulateNext}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                ⚡ {t("queue_serving_simulate")}
              </button>
            </div>
          </div>

          {/* Right panel - Token Position Checker */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t("queue_check_title")}</h3>
              <p className="text-sm text-slate-500 mb-6">
                {t("queue_check_desc")}
              </p>

              <form onSubmit={handleCheckQueue} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t("queue_check_placeholder")}
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {t("queue_check_btn")}
                </button>
              </form>

              {/* Status Report Result Box */}
              {positionResult && (
                <div className="mt-6 animate-fade-in-up">
                  {positionResult.status === "served" ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl text-sm font-semibold flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <p>{positionResult.message}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-2 ${positionResult.alertColor}`}>
                        {positionResult.message}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            {vehiclesAheadLabels[lang] || "Vehicles Ahead"}
                          </span>
                          <span className="text-2xl font-black text-slate-800 block mt-0.5">
                            {positionResult.slotsAhead} {t("queue_status_vehicles")}
                          </span>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            {estWaitLabels[lang] || "Estimated Wait"}
                          </span>
                          <span className="text-2xl font-black text-emerald-600 block mt-0.5">
                            ~{positionResult.estWait} {t("queue_serving_mins")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Timeline Tracker */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">{t("queue_timeline")}</h4>
              
              <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0">
                <div className="absolute left-1/2 sm:left-4 sm:right-4 top-0 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:translate-x-0 h-full sm:h-0.5 w-0.5 sm:w-auto bg-slate-100 -z-10"></div>
                
                {[
                  { token: servingToken, label: currentTimeline.serving, color: "bg-emerald-500 text-white border-emerald-200" },
                  { token: servingToken + 1, label: currentTimeline.next, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                  { token: servingToken + 2, label: currentTimeline.weigh, color: "bg-slate-50 text-slate-500 border-slate-200" },
                  { token: userToken ? parseInt(userToken) : servingToken + 8, label: currentTimeline.spot, color: "bg-slate-900 text-white border-slate-900" },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative bg-white px-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-sm ${step.color}`}>
                      #{step.token}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 mt-2 block whitespace-nowrap leading-none">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
