"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import Navbar from "./Navbar";
import LoginPortal from "./LoginPortal";

interface FarmerProfileData {
  name: string;
  phone: string;
  state: string;
  district: string;
  location: string;
  area: number;
  primaryCrop: string;
  bankAccount: string;
  dbtStatus: string;
  farmerId: string;
  joinedDate: string;
}

const DEFAULT_PROFILE: FarmerProfileData = {
  name: "Rameshwar Singh",
  phone: "+91 9876543210",
  state: "Uttar Pradesh",
  district: "Kanpur Nagar",
  location: "Kalyanpur, Block-4",
  area: 6.5,
  primaryCrop: "Paddy (धान)",
  bankAccount: "SBI ****4920",
  dbtStatus: "Active & Verified ✅",
  farmerId: "KS-FARM-8291",
  joinedDate: "Mar 2026",
};

const MOCK_BOOKINGS = [
  {
    id: "KS-593021",
    token: 593021,
    crop: "Paddy (Common)",
    weight: 35,
    center: "GreenValley Agriculture Hub",
    date: "2026-08-28",
    slot: "08:00 AM - 10:00 AM",
    status: "Confirmed & Scheduled",
  },
  {
    id: "KS-582109",
    token: 582109,
    crop: "Wheat (Grade A)",
    weight: 40,
    center: "Northern Mandi Depot",
    date: "2026-06-15",
    slot: "10:00 AM - 12:00 PM",
    status: "Completed & Paid",
  },
];

const MOCK_DBT_PAYMENTS = [
  {
    id: "DBT-940281",
    crop: "Paddy (Common)",
    weight: "35 Qtl",
    rate: "₹2,300 / Qtl",
    amount: "₹80,500",
    date: "2026-07-10",
    utr: "SBIN8291048201",
    status: "Transferred to SBI ****4920",
  },
  {
    id: "DBT-882910",
    crop: "Wheat (Grade A)",
    weight: "45 Qtl",
    rate: "₹2,275 / Qtl",
    amount: "₹1,02,375",
    date: "2026-04-18",
    utr: "SBIN7192840192",
    status: "Transferred to SBI ****4920",
  },
  {
    id: "DBT-772901",
    crop: "Mustard",
    weight: "15 Qtl",
    rate: "₹5,650 / Qtl",
    amount: "₹84,750",
    date: "2026-03-24",
    utr: "SBIN6629102948",
    status: "Transferred to SBI ****4920",
  },
];

export default function FarmerProfilePage() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [profile, setProfile] = useState<FarmerProfileData>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FarmerProfileData>(DEFAULT_PROFILE);
  const [toast, setToast] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "slots" | "payments">("details");

  useEffect(() => {
    const loadProfile = () => {
      const stored = localStorage.getItem("kisanSetu_farmer_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const merged = { ...DEFAULT_PROFILE, ...parsed };
          setProfile(merged);
          setFormData(merged);
        } catch {
          setProfile(DEFAULT_PROFILE);
          setFormData(DEFAULT_PROFILE);
        }
      } else {
        // Fallback default
        setProfile(DEFAULT_PROFILE);
        setFormData(DEFAULT_PROFILE);
      }
    };

    loadProfile();

    window.addEventListener("kisanSetu_profile_updated", loadProfile);
    window.addEventListener("storage", loadProfile);
    return () => {
      window.removeEventListener("kisanSetu_profile_updated", loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kisanSetu_farmer_profile", JSON.stringify(formData));
    setProfile(formData);
    setIsEditing(false);
    setToast("🎉 Profile details updated successfully!");
    window.dispatchEvent(new Event("kisanSetu_profile_updated"));
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => setToast(""), 3500);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out from Farmer's Portal?")) {
      localStorage.removeItem("kisanSetu_farmer_profile");
      window.dispatchEvent(new Event("kisanSetu_profile_updated"));
      window.dispatchEvent(new Event("storage"));
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar onLoginClick={() => setLoginModalOpen(true)} />
      <LoginPortal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Toast Alert */}
        {toast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-fade-in-up">
            <span>{toast}</span>
            <button onClick={() => setToast("")} className="text-emerald-400 font-black cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Farmer Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl mb-8">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="relative">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 p-1 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl">
                    👨‍🌾
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-3 border-slate-900 flex items-center justify-center text-[10px] text-slate-950 font-black">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    KYC Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-2">
                  <span>📍 {profile.location}, {profile.district}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400">{profile.phone}</span>
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                  <span>ID: <strong className="text-slate-300 font-bold">{profile.farmerId}</strong></span>
                  <span>•</span>
                  <span>Member Since: <strong className="text-slate-300 font-bold">{profile.joinedDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push("/scheduler")}
                className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                🌾 Book Delivery Slot
              </button>
              <button
                onClick={handleLogout}
                className="bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs sm:text-sm px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold flex items-center gap-1.5"
                title="Log out"
              >
                🚪 Log Out
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Land Holding</span>
              <span className="text-lg font-black text-white">{profile.area} Acres</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Crop</span>
              <span className="text-lg font-black text-emerald-400">{profile.primaryCrop}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DBT Linked Account</span>
              <span className="text-lg font-black text-white font-mono">{profile.bankAccount}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
              <span className="text-lg font-black text-emerald-400">{profile.dbtStatus}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "details"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            📋 Profile Details
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "slots"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🎫 Active Tokens & Slots ({MOCK_BOOKINGS.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            💰 DBT Sales Ledger
          </button>
        </div>

        {/* Tab Content 1: Editable Profile Details */}
        {activeTab === "details" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-xl font-black text-white">Farmer Personal & Land Information</h3>
                <p className="text-xs text-slate-400">Update your official contact and agriculture details for seamless mandi delivery.</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  ✏️ Edit Details
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Farmer Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Mobile</label>
                  <input
                    type="text"
                    disabled
                    value={formData.phone}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-4 py-3 text-sm font-mono font-semibold cursor-not-allowed"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Village / Tehsil */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Village / Tehsil</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Land Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cultivable Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={!isEditing}
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Primary Crop */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Crop Cultivated</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.primaryCrop}
                    onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Bank Account (DBT) */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Linked Bank Account</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 text-white rounded-xl px-4 py-3 text-sm font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* DBT Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">DBT Aadhaar Seeding</label>
                  <div className="w-full bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    {profile.dbtStatus}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    💾 Save Profile Updates
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Tab Content 2: Active Tokens & Slots */}
        {activeTab === "slots" && (
          <div className="space-y-4">
            {MOCK_BOOKINGS.map((slot) => (
              <div
                key={slot.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-2xl font-black font-mono">
                    #{slot.token}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-lg text-white">{slot.center}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {slot.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      🌾 Crop: <strong className="text-white">{slot.crop}</strong> ({slot.weight} Quintals)
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      📅 Date: <strong className="text-white">{slot.date}</strong> | ⏰ Time: <strong className="text-white">{slot.slot}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/queue?token=${slot.token}&center=${encodeURIComponent(slot.center)}`)}
                    className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    ⚡ Track in Live Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: DBT Payment Ledger */}
        {activeTab === "payments" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <h3 className="text-xl font-black text-white mb-2">Direct Benefit Transfer (DBT) Ledger</h3>
            <p className="text-xs text-slate-400 mb-6">Transparent government procurement payment records transferred straight to your bank account.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Crop & Quantity</th>
                    <th className="pb-3">MSP Rate</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Transfer Date</th>
                    <th className="pb-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {MOCK_DBT_PAYMENTS.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-300">{pay.id}</td>
                      <td className="py-4 text-white font-bold">{pay.crop} ({pay.weight})</td>
                      <td className="py-4 text-slate-300">{pay.rate}</td>
                      <td className="py-4 text-emerald-400 font-black text-base">{pay.amount}</td>
                      <td className="py-4 text-slate-400">{pay.date}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
