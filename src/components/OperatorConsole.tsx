"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffSession, signOutStaff } from "@/lib/firebase/config";

interface QueueToken {
  tokenNumber: number;
  farmerName: string;
  phone: string;
  crop: string;
  estWeightQtl: number;
  status: "waiting" | "processing" | "completed";
  calledAt?: string;
}

const INITIAL_QUEUE: QueueToken[] = [
  { tokenNumber: 110, farmerName: "Ram Singh", phone: "+91 98765 43210", crop: "Wheat", estWeightQtl: 40.0, status: "completed" },
  { tokenNumber: 111, farmerName: "Rajesh Nayak", phone: "+91 94371 88201", crop: "Paddy (Common)", estWeightQtl: 28.5, status: "processing", calledAt: "10:15 AM" },
  { tokenNumber: 112, farmerName: "Bikash Mohanty", phone: "+91 97782 10934", crop: "Paddy (Common)", estWeightQtl: 35.0, status: "waiting" },
  { tokenNumber: 113, farmerName: "Gurpreet Gill", phone: "+91 98140 33412", crop: "Paddy (Grade A)", estWeightQtl: 60.0, status: "waiting" },
  { tokenNumber: 114, farmerName: "Rameshwar Patil", phone: "+91 98220 91823", crop: "Soybean", estWeightQtl: 22.0, status: "waiting" },
];

const MSP_RATES: Record<string, number> = {
  "Paddy (Common)": 2300,
  "Paddy (Grade A)": 2320,
  "Wheat": 2275,
  "Mustard Seed": 5450,
  "Groundnut (Peanut)": 6780,
  "Soybean": 4892,
  "Maize (Corn)": 2090,
};

export default function OperatorConsole() {
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [selectedYard, setSelectedYard] = useState("Chandaka RMC Procurement Yard, Odisha");
  const [queue, setQueue] = useState<QueueToken[]>(INITIAL_QUEUE);
  const [activeToken, setActiveToken] = useState<QueueToken>(INITIAL_QUEUE[1]);

  // Weighment State
  const [grossWeight, setGrossWeight] = useState<number>(31.2);
  const [tareWeight, setTareWeight] = useState<number>(2.7);
  const [moisturePercent, setMoisturePercent] = useState<number>(12.8);
  const [cropQuality, setCropQuality] = useState<"Grade A (Super)" | "FAQ (Fair Average Quality)" | "Grade B">("FAQ (Fair Average Quality)");
  const [selectedCrop, setSelectedCrop] = useState<string>("Paddy (Common)");
  const [issuedSlip, setIssuedSlip] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kisanSetu_operator_session");
      if (stored) {
        try {
          setSession(JSON.parse(stored));
        } catch {}
      } else {
        const defaultOperator: StaffSession = {
          uid: "operator-default",
          name: "Manoj Kumar Das (Yard Desk)",
          email: "manoj.operator@odishamandi.gov.in",
          role: "operator",
          loginTime: new Date().toISOString(),
        };
        setSession(defaultOperator);
        localStorage.setItem("kisanSetu_operator_session", JSON.stringify(defaultOperator));
      }
    }
  }, []);

  const handleLogout = async () => {
    await signOutStaff("operator");
    router.push("/");
  };

  const netWeight = Math.max(0, Number((grossWeight - tareWeight).toFixed(2)));
  const ratePerQtl = MSP_RATES[selectedCrop] || 2300;
  const totalPayout = Math.round(netWeight * ratePerQtl);

  const handleCallNextToken = () => {
    const nextWaiting = queue.find((q) => q.status === "waiting");
    if (nextWaiting) {
      setQueue((prev) =>
        prev.map((t) => {
          if (t.tokenNumber === activeToken?.tokenNumber) return { ...t, status: "completed" };
          if (t.tokenNumber === nextWaiting.tokenNumber) return { ...t, status: "processing", calledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
          return t;
        })
      );
      setActiveToken({ ...nextWaiting, status: "processing" });
      setSelectedCrop(nextWaiting.crop);
      setGrossWeight(Number((nextWaiting.estWeightQtl + 2.5).toFixed(2)));
      setTareWeight(2.5);
      setNotification(`Called Token #${nextWaiting.tokenNumber} (${nextWaiting.farmerName}) to Counter 1 Weighbridge.`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification("No more waiting tokens in queue.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCompleteAndIssueSlip = () => {
    const slip = {
      slipNumber: `WSLIP-${Date.now().toString().slice(-6)}`,
      yard: selectedYard,
      tokenNumber: activeToken.tokenNumber,
      farmerName: activeToken.farmerName,
      phone: activeToken.phone,
      crop: selectedCrop,
      grossWeight,
      tareWeight,
      netWeight,
      moisturePercent,
      cropQuality,
      ratePerQtl,
      totalPayout,
      timestamp: new Date().toLocaleString(),
      operatorName: session?.name || "Yard Operator",
    };
    setIssuedSlip(slip);
    setNotification(`Successfully generated Weighment Slip #${slip.slipNumber} for ${activeToken.farmerName}`);

    // Mark current active as completed
    setQueue((prev) =>
      prev.map((t) => (t.tokenNumber === activeToken.tokenNumber ? { ...t, status: "completed" } : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Top Operator Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-2 group">
              <img src="/icon.svg" alt="Logo" className="w-8 h-8 rounded-xl" />
              <span className="text-xl font-black">
                <span className="text-emerald-400">Kisan</span>
                <span className="text-white">Setu</span>
              </span>
            </a>
            <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider hidden sm:inline-block">
              APMC Yard Operator Desk
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-black text-white">{session?.name || "Operator Officer"}</span>
              <span className="block text-[10px] text-emerald-400 font-bold">{session?.email || "operator@kisansetu.gov.in"}</span>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer hidden md:inline-flex items-center gap-1.5"
            >
              <span>👮</span>
              <span>Admin Registry</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-black bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Operator Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Yard Selector & Status Banner */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
              🏬
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Procurement Yard</span>
              <select
                value={selectedYard}
                onChange={(e) => setSelectedYard(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white font-extrabold text-sm sm:text-base rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="Chandaka RMC Procurement Yard, Odisha">Chandaka RMC Procurement Yard, Odisha</option>
                <option value="Kalyanpur Krishi Mandi, Uttar Pradesh">Kalyanpur Krishi Mandi, Uttar Pradesh</option>
                <option value="GreenValley Agriculture Hub, Kanpur">GreenValley Agriculture Hub, Kanpur</option>
                <option value="Ludhiana Central Grain Depot, Punjab">Ludhiana Central Grain Depot, Punjab</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">Weighbridge Status</span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active & Calibrated</span>
              </span>
            </div>
            <button
              onClick={handleCallNextToken}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>📢</span>
              <span>Call Next Token</span>
            </button>
          </div>
        </div>

        {/* Live Notification */}
        {notification && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>🔔</span>
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 2-Column Workstation: Left (Queue) + Right (Digital Weighbridge) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live Yard Queue */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🚜 Live Yard Queue</span>
                  <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {queue.filter((q) => q.status === "waiting").length} waiting
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {queue.map((token) => (
                  <div
                    key={token.tokenNumber}
                    onClick={() => {
                      if (token.status !== "completed") {
                        setActiveToken(token);
                        setSelectedCrop(token.crop);
                        setGrossWeight(Number((token.estWeightQtl + 2.5).toFixed(2)));
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      token.tokenNumber === activeToken?.tokenNumber
                        ? "bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                        : token.status === "completed"
                        ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                        : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-base text-white flex items-center gap-2">
                        <span className="text-emerald-400">Token #{token.tokenNumber}</span>
                        {token.tokenNumber === activeToken?.tokenNumber && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                            AT WEIGHBRIDGE
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          token.status === "processing"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : token.status === "completed"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {token.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-bold text-white">{token.farmerName}</span>
                      <span className="text-emerald-400 font-bold">{token.crop} (~{token.estWeightQtl} Qtl)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Digital Weighment & Payout Terminal */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>⚖️ Digital Weighment Station</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Processing Farmer: <span className="text-white font-bold">{activeToken?.farmerName || "None"}</span> (Token #{activeToken?.tokenNumber})
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  Counter 1
                </span>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Crop Type Selection */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Delivered Crop Variety</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    {Object.keys(MSP_RATES).map((crop) => (
                      <option key={crop} value={crop}>
                        {crop} — Official MSP: ₹{MSP_RATES[crop].toLocaleString()}/Qtl
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight Inputs (Gross & Tare) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Gross Truck/Tractor (Qtl)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-black text-base rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tare Vehicle Weight (Qtl)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-black text-base rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Moisture & Grade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Moisture Level (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={moisturePercent}
                      onChange={(e) => setMoisturePercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-black text-base rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className={`text-[10px] font-bold mt-1 block ${moisturePercent <= 14 ? "text-emerald-400" : "text-amber-400"}`}>
                      {moisturePercent <= 14 ? "✓ Within Permissible Limit (≤14%)" : "⚠️ High Moisture Content"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Assessed Quality Grade</label>
                    <select
                      value={cropQuality}
                      onChange={(e) => setCropQuality(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-2xl px-3 py-3 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Grade A (Super)">Grade A (Super Quality)</option>
                      <option value="FAQ (Fair Average Quality)">FAQ (Fair Average Quality)</option>
                      <option value="Grade B">Grade B (Minor Dockage)</option>
                    </select>
                  </div>
                </div>

                {/* Net Calculation Summary Box */}
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-5 mt-6">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-500/20">
                    <span className="text-xs text-slate-300 font-bold">Net Crop Weight:</span>
                    <span className="text-xl font-black text-white font-mono">{netWeight} Quintals</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-500/20">
                    <span className="text-xs text-slate-300 font-bold">Govt MSP Rate:</span>
                    <span className="text-sm font-bold text-emerald-400">₹{ratePerQtl.toLocaleString()} / Quintal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-300">Total Direct DBT Transfer Payout:</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      ₹{totalPayout.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  onClick={handleCompleteAndIssueSlip}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Complete Weighment & Issue DBT Token</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Generated Weighment Slip Modal */}
      {issuedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIssuedSlip(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full cursor-pointer"
            >
              ✕
            </button>

            {/* Slip Printable Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
              <span className="text-2xl">🌾</span>
              <h3 className="text-xl font-black tracking-tight text-slate-900">APMC GOVT PROCUREMENT RECEIPT</h3>
              <p className="text-xs text-slate-600 font-semibold">{issuedSlip.yard}</p>
              <span className="inline-block mt-2 font-mono font-extrabold text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                {issuedSlip.slipNumber} • Token #{issuedSlip.tokenNumber}
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Farmer Beneficiary:</span>
                <span className="font-extrabold text-slate-900">{issuedSlip.farmerName} ({issuedSlip.phone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Commodity Variety:</span>
                <span className="font-bold text-slate-900">{issuedSlip.crop}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gross Weight:</span>
                <span className="font-mono text-slate-900">{issuedSlip.grossWeight} Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tare Weight:</span>
                <span className="font-mono text-slate-900">{issuedSlip.tareWeight} Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Net Procured Weight:</span>
                <span className="font-mono font-black text-slate-900 text-base">{issuedSlip.netWeight} Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Moisture Content:</span>
                <span className="font-bold text-slate-900">{issuedSlip.moisturePercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">MSP Rate:</span>
                <span className="font-bold text-emerald-800">₹{issuedSlip.ratePerQtl}/Qtl</span>
              </div>
              <div className="flex justify-between py-2 mt-2 bg-emerald-50 px-3 rounded-xl border border-emerald-200">
                <span className="font-black text-emerald-950">Total DBT Disbursal Amount:</span>
                <span className="font-black text-emerald-800 text-lg">₹{issuedSlip.totalPayout.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-2 mb-4">
              Authorized by Operator: {issuedSlip.operatorName} • {issuedSlip.timestamp}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Print Official Slip</span>
              </button>
              <button
                onClick={() => setIssuedSlip(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
