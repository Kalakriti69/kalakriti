"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MOCK_CENTERS } from "./ProcurementCenters";
import { createClient } from "@/lib/supabase/client";

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
  const { t, lang } = useTranslation();
  const [selectedCenterId, setSelectedCenterId] = useState(MOCK_CENTERS[0].id);
  const [userToken, setUserToken] = useState("");
  const [positionResult, setPositionResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [secondsUntilSync, setSecondsUntilSync] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time queue state from operator table
  const [servingToken, setServingToken] = useState<number>(105);
  const [avgWaitPerToken, setAvgWaitPerToken] = useState<number>(8);
  const [activeCounter, setActiveCounter] = useState("Weighbridge Counter 1");

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchActiveQueue();
    setSecondsUntilSync(10);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Helper to normalize high IDs into realistic yard token numbers (e.g., #110 - #120)
  const normalizeToYardToken = (rawVal: string | number): number => {
    const rawNum = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal).replace(/\D/g, ""), 10);
    if (isNaN(rawNum) || rawNum <= 0) return servingToken + 4;
    if (rawNum >= 100 && rawNum <= 999) return rawNum;
    return 100 + (rawNum % 30) + 3;
  };

  // Auto-fill user token from props, search params, or localStorage
  useEffect(() => {
    let tokenToSet = "";
    let centerToSet = "";

    if (activeBooking?.tokenId) {
      tokenToSet = String(normalizeToYardToken(activeBooking.tokenId));
      if (activeBooking.center) centerToSet = activeBooking.center;
    } else if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
      const urlCenter = urlParams.get("center");

      if (urlToken) {
        tokenToSet = String(normalizeToYardToken(urlToken));
      } else {
        const storedBooking = localStorage.getItem("kisanSetu_latest_booking");
        if (storedBooking) {
          try {
            const parsed = JSON.parse(storedBooking);
            if (parsed.tokenNumber) {
              tokenToSet = String(parsed.tokenNumber);
            } else if (parsed.tokenId) {
              tokenToSet = String(normalizeToYardToken(parsed.tokenId));
            }
            if (parsed.center) centerToSet = parsed.center;
          } catch {}
        }
      }
      if (urlCenter) centerToSet = urlCenter;
    }

    if (!tokenToSet) {
      tokenToSet = "110";
    }

    setUserToken(tokenToSet);

    if (centerToSet) {
      const match = MOCK_CENTERS.find((c) => c.name.toLowerCase().includes(centerToSet.toLowerCase()));
      if (match) setSelectedCenterId(match.id);
    }
  }, [activeBooking]);

  // Fetch Centre Queue Stats (Read-Only from Supabase / Operator Records)
  const fetchActiveQueue = async () => {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: processing } = await supabase
        .from("bookings")
        .select("token_number")
        .eq("centre_id", selectedCenterId)
        .eq("booking_date", today)
        .eq("status", "processing")
        .order("token_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (processing?.token_number) {
        setServingToken(processing.token_number);
      } else {
        const { data: recent } = await supabase
          .from("bookings")
          .select("token_number")
          .eq("centre_id", selectedCenterId)
          .eq("booking_date", today)
          .order("token_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recent?.token_number) {
          setServingToken(recent.token_number);
        } else if (typeof window !== "undefined") {
          const savedRegistry = localStorage.getItem("kisanSetu_checked_in_registry");
          if (savedRegistry) {
            try {
              const list = JSON.parse(savedRegistry);
              if (Array.isArray(list) && list.length > 0) {
                const active = list.find((f) => f.status === "At Weighbridge") || list[0];
                if (active?.tokenNumber) setServingToken(active.tokenNumber);
              }
            } catch {}
          }
        }
      }

      setAvgWaitPerToken(8);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.warn("Live queue fetch note:", err);
    }
  };

  // Farmer Queue Position Calculation
  const calculateQueuePosition = (userTokenNum: number) => {
    const currentServing = servingToken || 105;
    const diff = userTokenNum - currentServing;

    if (diff < 0) {
      setPositionResult({
        status: "served",
        message: t("queue_status_served") || "Your token has already been served! Please report to the dispatch counter.",
        slotsAhead: 0,
        estWait: 0,
        alertColor: "bg-slate-100 border-slate-300 text-slate-700",
      });
    } else if (diff === 0) {
      setPositionResult({
        status: "serving_now",
        slotsAhead: 0,
        estWait: 0,
        message: "🎉 YOUR TURN! Proceed directly to Weighbridge 1.",
        alertColor: "bg-emerald-50 border-emerald-300 text-emerald-800 animate-pulse",
      });
    } else {
      const slotsAhead = diff;
      const estWait = slotsAhead * (avgWaitPerToken || 8);
      let statusMsg = "";
      let alertColor = "";

      if (slotsAhead <= 3) {
        statusMsg = t("queue_status_immediate") || "🚨 Please report immediately! You are next in line.";
        alertColor = "bg-rose-50 border-rose-300 text-rose-800 animate-pulse";
      } else if (slotsAhead <= 6) {
        statusMsg = t("queue_status_prepare") || "🚚 Prepare for transport. Your turn will arrive shortly.";
        alertColor = "bg-amber-50 border-amber-300 text-amber-900";
      } else {
        statusMsg = t("queue_status_safe") || "🏡 Safe at home. You have ample time before your turn.";
        alertColor = "bg-emerald-50 border-emerald-300 text-emerald-800";
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

  // 10-Second Auto-Refresh Interval
  useEffect(() => {
    fetchActiveQueue();

    const refreshInterval = setInterval(() => {
      fetchActiveQueue();
      setSecondsUntilSync(10);
    }, 10000);

    const countdownInterval = setInterval(() => {
      setSecondsUntilSync((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [selectedCenterId]);

  // Recalculate position when userToken or servingToken changes
  useEffect(() => {
    const num = parseInt(userToken, 10);
    if (!isNaN(num)) {
      calculateQueuePosition(num);
    }
  }, [userToken, servingToken]);

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) return;
    const num = parseInt(userToken.replace(/\D/g, ""), 10);
    if (isNaN(num)) return;
    setIsChecking(true);
    calculateQueuePosition(num);
    setTimeout(() => setIsChecking(false), 200);
  };

  const parsedUserToken = parseInt(userToken, 10) || (servingToken + 4);
  const slotsAheadCount = Math.max(0, parsedUserToken - servingToken);
  const maxVisibleTractors = 5;
  const isOverflow = slotsAheadCount > maxVisibleTractors;
  const displayCount = Math.min(slotsAheadCount, maxVisibleTractors);

  return (
    <section id="queue" className="py-10 bg-white text-slate-900 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live APMC Mandi Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t("queue_title") || "Live Yard Queue & Tractor Tracker"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            {t("queue_desc") || "Track live yard intake and vehicle progress in real-time."}
          </p>
        </div>

        {/* TOP POSITIONED: CLEAN MINIMALIST LIVE YARD PROGRESSION (TRACTOR CONVOY) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚜</span>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Live Yard Progression Convoy
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time vehicle movement towards the weighbridge</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                {slotsAheadCount} {t("queue_status_vehicles") || "Tractors"} Ahead
              </span>
              
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs px-3.5 py-1 rounded-full border border-slate-200 hover:border-emerald-300 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer group"
                title="Click to refresh live yard telemetry"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-3.5 h-3.5 text-emerald-600 transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Minimalist Road Track */}
          <div className="relative py-8 px-6 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-inner">
            {/* Connecting Track Line */}
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-400"></div>
            </div>

            {/* Road Items */}
            <div className="relative z-10 flex items-center justify-between min-w-[520px] gap-4 px-2">
              {/* Destination: Electronic Weighbridge Scale */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-3xl sm:text-4xl transition-transform hover:scale-110">
                  ⚖️
                </span>
                <span className="text-[10px] font-black text-emerald-800 mt-1 uppercase font-mono">
                  Weighbridge
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded mt-0.5">
                  #{servingToken}
                </span>
              </div>

              {/* Tractors Ahead (Facing Left Towards the Weighbridge) */}
              {Array.from({ length: displayCount }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center shrink-0">
                  <div className="relative flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl transition-transform hover:scale-110">
                      🚜
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md mt-1">
                      #{servingToken + idx + 1}
                    </span>
                  </div>
                </div>
              ))}

              {/* Clean Overflow Badge if more than 5 */}
              {isOverflow && (
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-mono text-xs font-bold shadow-sm">
                    +{slotsAheadCount - maxVisibleTractors}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">more</span>
                </div>
              )}

              {/* Farmer's Own Spot (Facing Left Towards Weighbridge) */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl transition-transform hover:scale-110">
                    🚜
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full mt-1 uppercase font-mono shadow-sm">
                    YOU #{parsedUserToken}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LOWER SECTION: OPERATOR BROADCAST + POSITION CHECKER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Clean Operator Broadcast Card (Read-Only) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm">
            {/* Live Indicator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>OPERATOR FEED • LIVE</span>
              </span>

              <span className="text-[11px] text-slate-500 font-mono">
                Syncing in <strong className="text-slate-800">{secondsUntilSync}s</strong>
              </span>
            </div>

            {/* Procurement Center Selection */}
            <div className="space-y-4 my-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Procurement Center Hub
                </label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
                >
                  {MOCK_CENTERS.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      {t(`center_${idx + 1}_name`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Active Terminal
                </span>
                <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>{activeCounter}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Serving Token Banner */}
            <div className="text-center bg-white border-2 border-emerald-500/30 rounded-2xl py-6 px-4 my-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t("queue_serving") || "CURRENTLY SERVING"}
              </span>
              <p className="text-5xl sm:text-6xl font-black text-emerald-600 font-mono tracking-tight my-1.5">
                #{servingToken || 105}
              </p>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Weighbridge Active</span>
              </p>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Avg Pace per Load</span>
                <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">~{avgWaitPerToken} Mins</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Last Sync</span>
                <span className="text-xs font-mono font-bold text-emerald-700 mt-1 block">{lastSyncedTime}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Farmer Position Checker & Milestones */}
          <div className="lg:col-span-7 space-y-6">
            {/* Token Input Search */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-900">{t("queue_check_title") || "Track Your Position"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your token number to view live queue position and estimated arrival time.
                </p>
              </div>

              <form onSubmit={handleManualCheck} className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Token Number (e.g. 110)"
                    value={userToken}
                    onChange={(e) => setUserToken(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-mono font-bold rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChecking}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isChecking ? "Checking..." : "Track"}
                </button>
              </form>

              {/* Status Alert Banner */}
              {positionResult && (
                <div className="mt-5 space-y-3">
                  <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${positionResult.alertColor}`}>
                    <span>📢</span>
                    <span>{positionResult.message}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        TRACTORS AHEAD
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono block mt-0.5">
                        {slotsAheadCount} {t("queue_status_vehicles") || "Tractors"}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        ESTIMATED WAIT
                      </span>
                      <span className="text-2xl font-black text-emerald-600 font-mono block mt-0.5">
                        ~{positionResult.estWait} Mins
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Timeline Steps */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                {t("queue_timeline") || "Intake Milestones"}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-black text-xs mb-1.5">
                    1
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Serving Now</span>
                  <span className="text-xs font-black text-emerald-700 font-mono mt-0.5 block">#{servingToken}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto font-black text-xs mb-1.5">
                    2
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Gate</span>
                  <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block">#{servingToken + 1}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto font-black text-xs mb-1.5">
                    3
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">In Yard</span>
                  <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block">{slotsAheadCount} Tractors</span>
                </div>

                <div className="bg-white p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-black text-xs mb-1.5">
                    📍
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Your Spot</span>
                  <span className="text-xs font-black text-emerald-800 font-mono mt-0.5 block">#{parsedUserToken}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
