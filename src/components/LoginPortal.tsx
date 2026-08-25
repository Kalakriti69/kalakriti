"use client";

import React, { useState } from "react";

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPortal({ isOpen, onClose }: LoginPortalProps) {
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234" && otp.length < 4) {
      alert("Please enter a valid 4-digit code (use '1234' for demo login).");
      return;
    }
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("dashboard");
    }, 800);
  };

  const handleLogout = () => {
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    onClose();
  };

  // Mock Dashboard Data for Farmers
  const MOCK_FARMER = {
    name: "Ramesh Kumar",
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
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Kisan</span>Setu
            </span>
            <span className="text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-800 bg-slate-850">
              {step === "dashboard" ? "Farmer Dashboard" : "Secure Login Portal"}
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
          {step === "phone" && (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🌾</span>
                <h3 className="text-2xl font-black text-slate-900">Farmer's Portal Login</h3>
                <p className="text-sm text-slate-500">
                  Enter your mobile number registered with PM-Kisan or Mandi card. We will send a 4-digit OTP code to log in.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Mobile Number
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
                  {isSubmitting ? "Sending OTP..." : "Get OTP Verification Code"}
                </button>
              </form>
            </div>
          )}

          {step === "otp" && (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🔐</span>
                <h3 className="text-2xl font-black text-slate-900">Enter OTP Verification</h3>
                <p className="text-sm text-slate-500">
                  Verification OTP code sent to <span className="font-bold text-slate-800">+91 {phoneNumber}</span>. 
                  (Use code <strong className="text-emerald-600 font-extrabold">1234</strong> for quick demo access).
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    4-Digit Verification Code
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="• • • •"
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
                  {isSubmitting ? "Verifying..." : "Verify & Access Account"}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep("phone")}
                  className="text-xs font-bold text-slate-500 hover:text-emerald-600"
                >
                  ← Change Mobile Number
                </button>
              </div>
            </div>
          )}

          {step === "dashboard" && (
            <div className="space-y-8 py-2">
              {/* Profile Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{MOCK_FARMER.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {MOCK_FARMER.district}, {MOCK_FARMER.state} | Bank Link: {MOCK_FARMER.bankAccount}
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
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Active Token Delivery Booking</h4>
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
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Mandi Sales & DBT Payout Invoices</h4>
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
                          {s.payment} (Direct Benefit Transfer)
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
