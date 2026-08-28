"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";

export interface FarmerBookingPass {
  tokenId: string;
  tokenNumber?: number;
  farmerName: string;
  farmerPhone?: string;
  phone?: string;
  center: string;
  crop: string;
  weight: number;
  date: string;
  timeSlot: string;
  confirmationStatus?: string;
  qrCode?: string;
}

const DEFAULT_DEMO_PASS: FarmerBookingPass = {
  tokenId: "KS-781920",
  tokenNumber: 112,
  farmerName: "Ramesh Kumar",
  farmerPhone: "+91 98765 43210",
  center: "Chandaka RMC Procurement Yard, Odisha",
  crop: "Paddy (Common)",
  weight: 35.0,
  date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  timeSlot: "08:00 AM - 10:00 AM",
  confirmationStatus: "Confirmed",
};

export default function FarmerPassView() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [pass, setPass] = useState<FarmerBookingPass>(DEFAULT_DEMO_PASS);
  const [generatedQr, setGeneratedQr] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTokenInput, setSearchTokenInput] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      let activePass = DEFAULT_DEMO_PASS;

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("kisanSetu_latest_booking");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.tokenId || parsed.center)) {
              activePass = {
                ...DEFAULT_DEMO_PASS,
                ...parsed,
              };
            }
          } catch {}
        }

        // Check if user has registered a profile
        const farmerProfile = localStorage.getItem("farmer_profile") || localStorage.getItem("kisanSetu_farmer_profile");
        if (farmerProfile) {
          try {
            const p = JSON.parse(farmerProfile);
            if (p.name) activePass.farmerName = p.name;
            if (p.phone) activePass.farmerPhone = p.phone;
          } catch {}
        }
      }

      if (urlToken) {
        const num = urlToken.replace(/\D/g, "");
        activePass = {
          ...activePass,
          tokenId: urlToken.startsWith("KS-") ? urlToken : `KS-${num || urlToken}`,
          tokenNumber: Number(num) || activePass.tokenNumber,
        };
      }

      setPass(activePass);

      // Generate Working Scannable QR Payload with complete farmer data
      const qrPayload = JSON.stringify({
        tokenId: activePass.tokenId,
        tokenNumber: activePass.tokenNumber || Number(activePass.tokenId.replace(/\D/g, "")) || 112,
        farmerName: activePass.farmerName,
        phone: activePass.farmerPhone || activePass.phone || "+91 98765 43210",
        center: activePass.center,
        crop: activePass.crop,
        weight: activePass.weight,
        date: activePass.date,
        timeSlot: activePass.timeSlot,
        oneTimePass: true,
        valid: true,
        issuedAt: new Date().toISOString(),
      });

      try {
        const dataUrl = await QRCode.toDataURL(qrPayload, {
          margin: 1,
          width: 320,
          errorCorrectionLevel: "H",
          color: {
            dark: "#022c22",
            light: "#ffffff",
          },
        });
        setGeneratedQr(dataUrl);
      } catch (err) {
        console.error("QR Generation error:", err);
      }
    };

    loadBooking();
  }, [urlToken]);

  const handleSearchLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTokenInput.trim()) return;

    const formattedToken = searchTokenInput.trim().toUpperCase().startsWith("KS-")
      ? searchTokenInput.trim().toUpperCase()
      : `KS-${searchTokenInput.trim().replace(/\D/g, "") || searchTokenInput.trim()}`;

    const updatedPass: FarmerBookingPass = {
      ...pass,
      tokenId: formattedToken,
      tokenNumber: Number(formattedToken.replace(/\D/g, "")) || 112,
    };

    setPass(updatedPass);

    const qrPayload = JSON.stringify({
      tokenId: updatedPass.tokenId,
      tokenNumber: updatedPass.tokenNumber,
      farmerName: updatedPass.farmerName,
      phone: updatedPass.farmerPhone || "+91 98765 43210",
      center: updatedPass.center,
      crop: updatedPass.crop,
      weight: updatedPass.weight,
      date: updatedPass.date,
      timeSlot: updatedPass.timeSlot,
      oneTimePass: true,
    });

    try {
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: "H",
        color: { dark: "#022c22", light: "#ffffff" },
      });
      setGeneratedQr(dataUrl);
    } catch {}

    setIsSearching(false);
  };

  const copyTokenNumber = () => {
    navigator.clipboard?.writeText(pass.tokenId);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans print:min-h-0 print:bg-white print:text-black print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto print:max-w-none print:w-full">
        {/* Top Header */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-3">
            <span>🎫</span>
            <span>Digital APMC Yard Entry Gate Pass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Farmer's Official Gate Pass & QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
            Show this scannable dynamic QR code at the procurement center entry gate for instant contactless check-in.
          </p>
        </div>

        {/* Quick Search / Token Switcher */}
        <div className="flex justify-center mb-6 print:hidden">
          {!isSearching ? (
            <button
              onClick={() => setIsSearching(true)}
              className="text-xs font-bold text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🔍</span>
              <span>Look Up Different Token / Phone</span>
            </button>
          ) : (
            <form onSubmit={handleSearchLookup} className="flex items-center gap-2 max-w-md w-full animate-fadeIn">
              <input
                type="text"
                placeholder="Enter Token ID (e.g. KS-781920 or 112)"
                value={searchTokenInput}
                onChange={(e) => setSearchTokenInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => setIsSearching(false)}
                className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {/* OFFICIAL PRINTABLE GATE PASS SLIP */}
        <div
          id="printable-gate-pass"
          className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-600/30 relative overflow-hidden printable-slip-area print:border-2 print:border-black print:shadow-none print:p-6 print:text-black print:bg-white print:rounded-2xl"
        >
          {/* Watermark badge */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-bl-full flex items-start justify-end p-4 font-black text-emerald-800 text-[11px] uppercase tracking-widest pointer-events-none">
            VALID PASS
          </div>

          {/* Slip Header */}
          <div className="flex items-center gap-3 pb-5 border-b-2 border-dashed border-slate-300">
            <img src="/icon.svg" alt="Logo" className="w-12 h-12 rounded-2xl shadow-md" />
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                Government of India • Ministry of Agriculture & Farmers Welfare
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5">
                APMC YARD ENTRY GATE PASS
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Direct Benefit Transfer (DBT) Crop Procurement Hub
              </p>
            </div>
          </div>

          {/* Big Token Number & Pass Validity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ASSIGNED TOKEN NUMBER
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight">
                  {pass.tokenId}
                </span>
                <button
                  onClick={copyTokenNumber}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 print:hidden"
                  title="Copy Token ID"
                >
                  <span>📋</span>
                  <span>{copiedNotification ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] text-slate-400 block font-bold uppercase">Pass Status</span>
              <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-full px-3.5 py-1 font-black text-xs inline-flex items-center gap-2 mt-1 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ONE-TIME PASS • VALID</span>
              </span>
            </div>
          </div>

          {/* Appointment Time Window Banner (Prominently Displayed) */}
          <div className="bg-emerald-950/5 border-2 border-emerald-500/20 rounded-2xl p-4 my-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md">
                ⏰
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  SCHEDULED ARRIVAL TIME WINDOW
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                  {pass.timeSlot}
                </span>
              </div>
            </div>

            <div className="sm:text-right font-semibold text-xs text-slate-600">
              <span>Delivery Date: </span>
              <span className="font-bold text-slate-900 font-mono">{pass.date}</span>
            </div>
          </div>

          {/* Beneficiary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Farmer Beneficiary</span>
              <span className="text-slate-900 font-black text-base block mt-0.5">{pass.farmerName}</span>
              <span className="text-slate-500 font-mono text-xs block mt-0.5">{pass.farmerPhone || "+91 98765 43210"}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Designated Procurement Center</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5 leading-snug">{pass.center}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Commodity Crop Variety</span>
              <span className="text-emerald-800 font-black text-sm block mt-0.5">🌾 {pass.crop}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Declared Intake Weight</span>
              <span className="text-slate-900 font-mono font-black text-base block mt-0.5">
                {pass.weight} Quintals <span className="text-xs font-normal text-slate-500">({pass.weight * 100} kg)</span>
              </span>
            </div>
          </div>

          {/* DYNAMIC SCANNABLE QR CODE SECTION */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-emerald-50/80 to-slate-50 p-5 rounded-3xl border border-emerald-500/20">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-lg">📷</span>
                <span className="text-sm font-black text-emerald-950">Operator Verification QR Code</span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                Scan with the APMC Operator Camera at the yard gate. All farmer details, token ID, weight, and appointment time will be parsed automatically.
              </p>
              <div className="pt-1">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                  ✓ High-Resolution Dynamic 2D Data Matrix
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              {generatedQr ? (
                <img
                  src={generatedQr}
                  alt="Farmer Gate Pass QR Code"
                  className="w-40 h-40 rounded-2xl border-2 border-emerald-600/40 bg-white p-2 shadow-lg"
                />
              ) : (
                <div className="w-40 h-40 border-2 border-dashed border-emerald-400 bg-white rounded-2xl flex items-center justify-center font-bold text-emerald-800 text-xs">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] font-mono text-slate-500 font-bold mt-1.5 tracking-wider uppercase">
                SCANNABLE BY OPERATOR
              </span>
            </div>
          </div>

          {/* Slip Footer Security Stamp */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between">
            <span>🔒 Verified Digitally via KisanSetu National Mandi Portal</span>
            <span>Gate Entry Token: {pass.tokenId}</span>
          </div>
        </div>

        {/* USER ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-8 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <span>🖨️</span>
            <span>Print Official Gate Pass</span>
          </button>

          {generatedQr && (
            <a
              href={generatedQr}
              download={`KisanSetu_Pass_${pass.tokenId}.png`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md border border-slate-700 transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
            >
              <span>📥</span>
              <span>Download QR Code Image</span>
            </a>
          )}

          <a
            href={`/queue?token=${pass.tokenId.replace(/\D/g, "")}&center=${encodeURIComponent(pass.center)}`}
            className="bg-slate-900 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📍</span>
            <span>Track Live Yard Queue</span>
          </a>

          <a
            href="/scheduler"
            className="text-slate-400 hover:text-white font-bold text-xs px-4 py-2 cursor-pointer"
          >
            🔄 Book New Appointment
          </a>
        </div>
      </div>
    </div>
  );
}
