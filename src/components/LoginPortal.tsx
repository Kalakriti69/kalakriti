"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPortal({ isOpen, onClose }: LoginPortalProps) {
  const [step, setStep] = useState<"phone" | "otp" | "profile" | "dashboard">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [farmerProfile, setFarmerProfile] = useState<{ name: string; location: string; area: number } | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", location: "", area: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const cachedProfile = localStorage.getItem("kisanSetu_farmer_profile");
    if (cachedProfile) {
      try {
        setFarmerProfile(JSON.parse(cachedProfile));
        setStep("dashboard");
      } catch {
        localStorage.removeItem("kisanSetu_farmer_profile");
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneNumber}` }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send OTP.");
      setIsSubmitting(false);
      setStep("otp");
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : "Could not send OTP.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit code sent by SMS.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneNumber}`, otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not verify OTP.");
      const profileResponse = await fetch("/api/farmers/profile");
      const profileResult = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileResult.error || "Could not load farmer profile.");
      setIsSubmitting(false);
      if (profileResult.profile) {
        setFarmerProfile(profileResult.profile);
        localStorage.setItem("kisanSetu_farmer_profile", JSON.stringify(profileResult.profile));
        setStep("dashboard");
      } else {
        setStep("profile");
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : "Could not verify OTP.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const area = Number(profileForm.area);
    if (!profileForm.name.trim() || !profileForm.location.trim() || !Number.isFinite(area) || area <= 0) {
      setErrorMessage("Enter your name, location, and a valid area.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/farmers/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name.trim(), location: profileForm.location.trim(), area }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile.");
      setFarmerProfile(result.profile);
      localStorage.setItem("kisanSetu_farmer_profile", JSON.stringify(result.profile));
      setIsSubmitting(false);
      setStep("dashboard");
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("kisanSetu_farmer_profile");
    setFarmerProfile(null);
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    onClose();
  };

  const MOCK_FARMER = {
    name: farmerProfile?.name || "Farmer",
    location: farmerProfile?.location || "",
    area: farmerProfile?.area || 0,
    state: "Uttar Pradesh",
    district: "Kalyanpur",
    bankAccount: "SBI ****4920",
    activeBookings: [
      { id: "KS-593021", crop: "Paddy", weight: 35, center: "GreenValley Agriculture Hub", date: "2026-08-26", slot: "08:00 AM - 10:00 AM", status: "Verified" }
    ],
    salesHistory: [
      { id: "INV-9402", crop: "Wheat", weight: 45, rate: "₹2,275/Qtl", amount: "₹1,02,375", date: "2026-06-12", payment: "DBT Transferred" },
      { id: "INV-8912", crop: "Mustard", weight: 15, rate: "₹5,450/Qtl", amount: "₹81,750", date: "2026-04-18", payment: "DBT Transferred" }
    ]
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-8">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src="/icon.svg"
              alt="KisanSetu Logo"
              className="w-7 h-7 rounded-lg shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Kisan</span>Setu
            </span>
            <span className="text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-800 bg-slate-850">
              {step === "dashboard" ? "Farmer Dashboard" : t("nav_login_portal")}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          {errorMessage && (
            <p role="alert" className="max-w-md mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}
          {step === "phone" && (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🌾</span>
                <h3 className="text-2xl font-black text-slate-900">{t("login_title")}</h3>
                <p className="text-sm text-slate-500">
                  {t("login_desc")}
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {t("login_phone")}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-bold shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? t("login_sending") : t("login_btn_otp")}
                </button>
              </form>
            </div>
          )}

          {step === "otp" && (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🔐</span>
                <h3 className="text-2xl font-black text-slate-900">{t("login_otp_title")}</h3>
                <p className="text-sm text-slate-500">
                  {t("login_otp_desc")}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {t("login_otp_label")}
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[1.5em] text-center py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-black text-lg shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? t("login_otp_verifying") : t("login_otp_verify")}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep("phone")}
                  className="text-xs font-bold text-slate-500 hover:text-emerald-600"
                >
                  ← {t("login_otp_change")}
                </button>
              </div>
            </div>
          )}

          {step === "profile" && (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">👨‍🌾</span>
                <h3 className="text-2xl font-black text-slate-900">Complete your farmer profile</h3>
                <p className="text-sm text-slate-500">Tell us a little about your farm to finish setting up your account.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <input
                  required
                  placeholder="Full name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold shadow-inner"
                />
                <input
                  required
                  placeholder="Village, district, state"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold shadow-inner"
                />
                <div className="flex gap-3">
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Farm area"
                    value={profileForm.area}
                    onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold shadow-inner"
                  />
                  <span className="flex items-center px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500">acres</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? "Saving profile..." : "Save farmer profile"}
                </button>
              </form>
            </div>
          )}

          {step === "dashboard" && (
            <div className="space-y-8 py-2">
              {/* Profile Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{MOCK_FARMER.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {MOCK_FARMER.location} | Farm area: {MOCK_FARMER.area} acres
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-4 py-2 rounded-full border border-slate-200 transition-all cursor-pointer"
                >
                  Logout Portal
                </button>
              </div>

              {/* Active Bookings Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{t("dash_active")}</h4>
                {MOCK_FARMER.activeBookings.map((b, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">TOKEN NUMBER</span>
                        <span className="text-lg font-black text-emerald-600 font-mono tracking-wide">{b.id}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 block">Center Hub</span>
                        <span className="text-slate-800 mt-0.5 block leading-tight">{b.center}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Crop Type</span>
                        <span className="text-slate-800 mt-0.5 block">🌾 {b.crop}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Date</span>
                        <span className="text-slate-800 mt-0.5 block">📅 {b.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Arrival Hours</span>
                        <span className="text-slate-800 mt-0.5 block">⏰ {b.slot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DBT Completed Payouts Transactions */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{t("dash_mandi")}</h4>
                <div className="space-y-3">
                  {MOCK_FARMER.salesHistory.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl bg-slate-50 p-2.5 rounded-xl border border-slate-100">💰</span>
                        <div>
                          <p className="font-bold text-slate-800">🌾 {s.crop} Sale ({s.weight} Quintals)</p>
                          <p className="text-xs text-slate-400">
                            Inv ID: {s.id} | Rate: {s.rate} | Date: {s.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <span className="text-base font-black text-slate-800">{s.amount}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {s.payment} ({t("dash_dbt")})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
