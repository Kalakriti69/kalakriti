"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { MOCK_CENTERS } from "./ProcurementCenters";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: Array<{ label: string; action: () => void | string | Promise<any>; primary?: boolean }>;
  ticket?: {
    tokenId: string;
    tokenNumber: number;
    center: string;
    crop: string;
    weight: number;
    date: string;
    timeSlot: string;
  };
  redirectUrl?: string;
  redirectLabel?: string;
}

interface BookingDraft {
  center: string;
  centreId: string;
  crop: string;
  weight: number;
  date: string;
  timeSlot: string;
  slotId: string;
}

const CROPS = ["Paddy", "Wheat", "Maize", "Mustard", "Barley"];

const CROP_LABELS: Record<string, Record<string, string>> = {
  Paddy: { en: "Paddy", hi: "धान (Paddy)", bn: "ধান (Paddy)", pa: "ਝੋਨਾ (Paddy)", or: "ଧାନ (Paddy)" },
  Wheat: { en: "Wheat", hi: "गेहूं (Wheat)", bn: "গম (Wheat)", pa: "ਕਣਕ (Wheat)", or: "ଗହମ (Wheat)" },
  Maize: { en: "Maize", hi: "मक्का (Maize)", bn: "ভুট্টা (Maize)", pa: "ਮੱਕੀ (Maize)", or: "ମକା (Maize)" },
  Mustard: { en: "Mustard", hi: "सरसों (Mustard)", bn: "সর্ষে (Mustard)", pa: "ਸਰ੍ਹੋਂ (Mustard)", or: "ସୋରିଷ (Mustard)" },
  Barley: { en: "Barley", hi: "जौ (Barley)", bn: "বার্লি (Barley)", pa: "ਜੌਂ (Barley)", or: "ଯବ (Barley)" },
};

const TIME_SLOTS = [
  { time: "08:00 AM - 10:00 AM", id: "11111111-aaa1-1111-1111-111111111111" },
  { time: "10:00 AM - 12:00 PM", id: "11111111-aaa2-1111-1111-111111111111" },
  { time: "12:00 PM - 02:00 PM", id: "11111111-aaa3-1111-1111-111111111111" },
  { time: "02:00 PM - 04:00 PM", id: "11111111-aaa4-1111-1111-111111111111" },
  { time: "04:00 PM - 06:00 PM", id: "11111111-aaa5-1111-1111-111111111111" },
];

const CHAT_I18N: Record<string, Record<string, string>> = {
  en: {
    title: "KisanMitra",
    subtitle: "AI Assistant",
    tagline: "Voice & Auto-Booking",
    welcome: "Namaste! 🙏 I am **KisanMitra**, your AI Assistant. I can help you **book delivery slots**, check **live queues**, or navigate anywhere on KisanSetu. Speak or type below!",
    btn_book_slot: "🌾 Book a Delivery Slot",
    btn_login_otp: "🔐 Farmer's Login & OTP",
    btn_my_profile: "👨‍🌾 Farmer Profile",
    btn_centers: "📍 View Nearby Centers",
    btn_queue: "⚡ Check Live Queue",
    btn_msp: "💰 Mandi MSP Rates",
    profile_summary: "👨‍🌾 **Farmer Profile Details Found!**\n\n• **Name**: {name}\n• **Farmer ID**: {id}\n• **Location**: {location}, {district}\n• **Land Area**: {area} Acres\n• **Primary Crop**: {crop}\n• **DBT Account**: {bank}\n\nYou can update details, view active tokens, or check DBT sales ledger on your profile page!",
    btn_open_profile: "🚀 Open Full Profile Dashboard",
    step_1_center: "Step 1 of 4: Please choose your nearest **Procurement Center** for crop delivery:",
    step_2_crop: "📍 Center: **{center}** ✅\n\nStep 2 of 4: Which **crop variety** are you delivering?",
    step_3_weight: "🌾 Crop: **{crop}** ✅\n\nStep 3 of 4: What is your estimated **weight in Quintals**? (1 Qtl = 100 kg):",
    step_4_date: "⚖️ Weight: **{weight} Quintals** ✅\n\nStep 4 of 4: Select your **delivery date**:",
    step_5_slot: "📅 Date: **{date}** ✅\n\nFinal Step: Choose an available **arrival time window**:",
    confirm_title: "📋 **Booking Summary Ready!**\n\n• **Center**: {center}\n• **Crop**: {crop}\n• **Weight**: {weight} Quintals ({kg} kg)\n• **Date**: {date}\n• **Time Slot**: {slot}\n\nReady to generate your live digital queue token?",
    btn_confirm_token: "⚡ Yes, Generate Digital Token",
    btn_modify: "🔄 Modify Details",
    booking_success: "🎉 **Booking Confirmed! Token #{token} Generated!**\n\nYour digital token has been registered. Opening Live Queue tracker...",
    btn_track_queue: "⚡ View in Live Queue Tracker",
    btn_book_another: "🔄 Book Another Slot",
    login_ask_phone: "📲 **Farmer Login Portal**\n\nPlease speak or type your **10-digit mobile number** (e.g. 9876543210). I will open the portal with Demo OTP (**4241**) and take you to your Profile! ⚡",
    login_otp_sent: "📱 **Farmer Portal Opened!**\n\nAuto-filled mobile number **+91 {mobile}** and generated Demo OTP **4241**.\n\nPlease enter code **4241** in the popup to open your full profile! 🔐",
    btn_view_login: "🔑 View Login Window",
    fallback_out_of_scope: "I am **KisanMitra**, the digital assistant for **KisanSetu Farmer's Portal** 🌾.\n\nI can only assist with **KisanSetu platform services**, such as:\n• **Booking Delivery Slots & Generating Tokens**\n• **Finding Nearby Procurement Centers & Mandis**\n• **Live Queue Position & Wait Times**\n• **Today's Mandi MSP Crop Rates**\n• **Farmer Login & Profile Access**\n\nPlease select one of the platform options below or ask me about any of these services!",
    input_placeholder: "Type or speak: 'Book Paddy slot', 'Login'...",
    listening_banner: "Listening to your voice... Speak now!",
    mic_blocked: "🎙️ Microphone access is blocked in browser settings. Please allow microphone permissions in your address bar or type below!",
    date_today: "Today",
    date_tomorrow: "Tomorrow",
    date_2days: "In 2 Days",
    qtl_10: "10 Quintals (1,000 kg)",
    qtl_25: "25 Quintals (2,500 kg)",
    qtl_35: "35 Quintals (3,500 kg)",
    qtl_50: "50 Quintals (5,000 kg)",
  },
  hi: {
    title: "किसान मित्र",
    subtitle: "एआई सहायक",
    tagline: "आवाज और ऑटो-बुकिंग",
    welcome: "नमस्ते किसान भाई! 🙏 मैं **किसान मित्र** हूँ, किसानसेतु का एआई सहायक। मैं फसल डिलीवरी स्लॉट बुक करने, लाइव कतार देखने, केंद्र ढूंढने या लॉगिन करने में आपकी पूरी मदद करूँगा। बोलकर या लिखकर बताएं!",
    btn_book_slot: "🌾 फसल स्लॉट बुक करें",
    btn_login_otp: "🔐 किसान लॉगिन व OTP",
    btn_my_profile: "👨‍🌾 मेरी किसान प्रोफाइल",
    btn_centers: "📍 नजदीकी खरीद केंद्र",
    btn_queue: "⚡ लाइव कतार स्थिति",
    btn_msp: "💰 मंडी MSP रेट्स",
    profile_summary: "👨‍🌾 **किसान प्रोफाइल विवरण!**\n\n• **नाम**: {name}\n• **किसान ID**: {id}\n• **स्थान**: {location}, {district}\n• **जमीन**: {area} एकड़\n• **मुख्य फसल**: {crop}\n• **DBT बैंक**: {bank}\n\nआप प्रोफाइल पेज पर सभी विवरण अपडेट कर सकते हैं व टोकन व DBT लेजर देख सकते हैं!",
    btn_open_profile: "🚀 पूरा प्रोफाइल पेज खोलें",
    step_1_center: "चरण 1: कृपया फसल डिलीवरी के लिए अपना नजदीकी **खरीद केंद्र** चुनें:",
    step_2_crop: "📍 केंद्र: **{center}** ✅\n\nचरण 2: आप कौन सी **फसल** ला रहे हैं?",
    step_3_weight: "🌾 फसल: **{crop}** ✅\n\nचरण 3: आपका अनुमानित **वजन (क्विंटल में)** कितना है? (1 क्विंटल = 100 किग्रा):",
    step_4_date: "⚖️ वजन: **{weight} क्विंटल** ✅\n\nचरण 4: अपनी **डिलीवरी की तारीख** चुनें:",
    step_5_slot: "📅 तारीख: **{date}** ✅\n\nअंतिम चरण: उपलब्ध **आगमन समय स्लॉट** चुनें:",
    confirm_title: "📋 **बुकिंग विवरण तैयार है!**\n\n• **केंद्र**: {center}\n• **फसल**: {crop}\n• **वजन**: {weight} क्विंटल ({kg} किग्रा)\n• **तारीख**: {date}\n• **समय स्लॉट**: {slot}\n\nक्या आप लाइव डिजिटल टोकन जनरेट करने के लिए तैयार हैं?",
    btn_confirm_token: "⚡ हाँ, डिजिटल टोकन जनरेट करें",
    btn_modify: "🔄 विवरण बदलें",
    booking_success: "🎉 **बुकिंग सफल! टोकन #{token} जनरेट हो गया!**\n\nआपका डिजिटल टोकन दर्ज हो चुका है। लाइव कतार ट्रैकर खोला जा रहा है...",
    btn_track_queue: "⚡ लाइव कतार ट्रैकर देखें",
    btn_book_another: "🔄 दूसरा स्लॉट बुक करें",
    login_ask_phone: "📲 **किसान लॉगिन पोर्टल**\n\nकृपया अपना **10 अंकों का मोबाइल नंबर** (उदा. 9876543210) बोलें या लिखें। मैं डेमो OTP (**4241**) के साथ पोर्टल खोल दूंगा! ⚡",
    login_otp_sent: "📱 **किसान पोर्टल खुल गया!**\n\nमोबाइल नंबर **+91 {mobile}** भरकर डेमो OTP **4241** तैयार है।\n\nकृपया पॉपअप में **4241** दर्ज करके अपनी प्रोफाइल खोलें! 🔐",
    btn_view_login: "🔑 लॉगिन विंडो देखें",
    fallback_out_of_scope: "मैं **किसान मित्र** हूँ, किसानसेतु पोर्टल का डिजिटल सहायक 🌾।\n\nमैं केवल **किसानसेतु पोर्टल सेवाओं** में आपकी सहायता कर सकता हूँ:\n• **फसल टोकन व स्लॉट बुकिंग**\n• **नजदीकी खरीद केंद्र व मंडियां**\n• **लाइव कतार स्थिति व वाहन ट्रैकिंग**\n• **आज के मंडी MSP रेट्स**\n• **किसान लॉगिन व प्रोफाइल एक्सेस**\n\nकृपया नीचे दिए गए विकल्पों में से चुनें या किसानसेतु से संबंधित सवाल पूछें!",
    input_placeholder: "बोलें या लिखें: 'धान का स्लॉट बुक करें', 'लॉगिन'...",
    listening_banner: "आवाज सुनी जा रही है... अब बोलें!",
    mic_blocked: "🎙️ माइक्रोफ़ोन की अनुमति ब्लॉक है। कृपया एड्रेस बार में माइक्रोफ़ोन चालू करें या नीचे लिखें!",
    date_today: "आज",
    date_tomorrow: "कल",
    date_2days: "2 दिन बाद",
    qtl_10: "10 क्विंटल (1,000 kg)",
    qtl_25: "25 क्विंटल (2,500 kg)",
    qtl_35: "35 क्विंटल (3,500 kg)",
    qtl_50: "50 क्विंटल (5,000 kg)",
  },
  bn: {
    title: "কিষাণমিত্র",
    subtitle: "এআই সহকারী",
    tagline: "ভয়েস ও অটো-বুকিং",
    welcome: "নমস্কার কৃষক ভাই! 🙏 আমি **কিষাণমিত্র**, কিষাণসেতু পোর্টালের এআই সহকারী। আমি শস্য ডেলিভারি স্লট বুক করতে, লাইভ কাতার দেখতে, কেন্দ্র খুঁজতে বা লগইন করতে সাহায্য করব। কথা বলুন বা টাইপ করুন!",
    btn_book_slot: "🌾 ডেলিভারি স্লট বুক করুন",
    btn_login_otp: "🔐 কৃষক লগইন ও OTP",
    btn_my_profile: "👨‍🌾 আমার কৃষক প্রোফাইল",
    btn_centers: "📍 নিকটবর্তী ক্রয় কেন্দ্র",
    btn_queue: "⚡ লাইভ কাতার স্ট্যাটাস",
    btn_msp: "💰 আজকের মান্ডি MSP দর",
    profile_summary: "👨‍🌾 **কৃষক প্রোফাইল বিবরণ!**\n\n• **নাম**: {name}\n• **কৃষক আইডি**: {id}\n• **অবস্থান**: {location}, {district}\n• **জমি**: {area} একর\n• **প্রধান শস্য**: {crop}\n• **ডিবিটি ব্যাংক**: {bank}\n\nআপনি আপনার ফুল-স্ক্রিন প্রোফাইল পেজে সমস্ত বিবরণ দেখতে ও আপডেট করতে পারেন!",
    btn_open_profile: "🚀 সম্পূর্ণ প্রোফাইল পেজ খুলুন",
    step_1_center: "ধাপ ১: অনুগ্রহ করে শস্য ডেলিভারির জন্য আপনার নিকটবর্তী **ক্রয় কেন্দ্র** নির্বাচন করুন:",
    step_2_crop: "📍 কেন্দ্র: **{center}** ✅\n\nধাপ ২: আপনি কোন **শস্য** ডেলিভারি করছেন?",
    step_3_weight: "🌾 শস্য: **{crop}** ✅\n\nধাপ ৩: আপনার আনুমানিক **ওজন (কুইন্টালে)** কত? (১ কুইন্টাল = ১০০ কেজি):",
    step_4_date: "⚖️ ওজন: **{weight} কুইন্টাল** ✅\n\nধাপ ৪: আপনার **ডেলিভারির তারিখ** নির্বাচন করুন:",
    step_5_slot: "📅 তারিখ: **{date}** ✅\n\nশেষ ধাপ: একটি উপলব্ধ **সময় স্লট** নির্বাচন করুন:",
    confirm_title: "📋 **বুকিং বিবরণ প্রস্তুত!**\n\n• **কেন্দ্র**: {center}\n• **শস্য**: {crop}\n• **ওজন**: {weight} কুইন্টাল ({kg} কেজি)\n• **তারিখ**: {date}\n• **সময় স্লট**: {slot}\n\nআপনি কি লাইভ ডিজিটাল টোকেন তৈরি করতে প্রস্তুত?",
    btn_confirm_token: "⚡ হ্যাঁ, ডিজিটাল টোকেন তৈরি করুন",
    btn_modify: "🔄 বিবরণ পরিবর্তন করুন",
    booking_success: "🎉 **বুকিং নিশ্চিত! টোকেন #{token} তৈরি হয়েছে!**\n\nআপনার ডিজিটাল টোকেন নিবন্ধিত হয়েছে। লাইভ কাতার ট্র্যাকার খোলা হচ্ছে...",
    btn_track_queue: "⚡ লাইভ কাতার ট্র্যাকার দেখুন",
    btn_book_another: "🔄 অন্য স্লট বুক করুন",
    login_ask_phone: "📲 **কৃষক লগইন পোর্টাল**\n\nঅনুগ্রহ করে আপনার **১০-সংখ্যার মোবাইল নম্বর** বলুন বা লিখুন। ডেমো OTP (**4241**) দিয়ে পোর্টাল খুলে দেওয়া হবে! ⚡",
    login_otp_sent: "📱 **কৃষক পোর্টাল খোলা হয়েছে!**\n\nমোবাইল নম্বর **+91 {mobile}** তৈরি এবং ডেমো OTP **4241**। পপআপে **4241** লিখুন! 🔐",
    btn_view_login: "🔑 লগইন উইন্ডো দেখুন",
    fallback_out_of_scope: "আমি **কিষাণমিত্র**, কিষাণসেতু পোর্টালের ডিজিটাল সহকারী 🌾।\n\nআমি কেবল **কিষাণসেতু প্ল্যাটফর্মের পরিষেবাগুলিতে** সাহায্য করতে পারি:\n• **শস্য টোকেন ও স্লট বুকিং**\n• **নিকটবর্তী ক্রয় কেন্দ্র ও মান্ডি**\n• **লাইভ কাতার অবস্থান ও সময়**\n• **আজকের মান্ডি এমএসপি দর**\n• **কৃষক লগইন ও প্রোফাইল**\n\nঅনুগ্রহ করে নিচের বিকল্পগুলি থেকে নির্বাচন করুন!",
    input_placeholder: "বলুন বা লিখুন: 'ধানের স্লট বুক করুন', 'লগইন'...",
    listening_banner: "কথা শুনছি... এখন বলুন!",
    mic_blocked: "🎙️ মাইক্রোফোনের অনুমতি বন্ধ আছে। অ্যাড্রেস বারে অনুমতি দিন অথবা নিচে লিখুন!",
    date_today: "আজ",
    date_tomorrow: "আগামীকাল",
    date_2days: "২ দিন পর",
    qtl_10: "১০ কুইন্টাল (১,০০০ কেজি)",
    qtl_25: "২৫ কুইন্টাল (২,৫০০ কেজি)",
    qtl_35: "৩৫ কুইন্টাল (৩,৫০০ কেজি)",
    qtl_50: "৫০ কুইন্টাল (৫,০০০ কেজি)",
  },
  pa: {
    title: "ਕਿਸਾਨ ਮਿੱਤਰ",
    subtitle: "ਏਆਈ ਸਹਾਇਕ",
    tagline: "ਆਵਾਜ਼ ਤੇ ਆਟੋ-ਬੁਕਿੰਗ",
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! 🙏 ਮੈਂ **ਕਿਸਾਨ ਮਿੱਤਰ** ਹਾਂ, ਕਿਸਾਨਸੇਤੂ ਦਾ ਏਆਈ ਸਹਾਇਕ। ਮੈਂ ਫ਼ਸਲ ਡਿਲਿਵਰੀ ਸਲਾਟ ਬੁੱਕ ਕਰਨ, ਲਾਈਵ ਲਾਈਨ ਵੇਖਣ, ਮੰਡੀ ਕੇਂਦਰ ਲੱਭਣ ਜਾਂ ਲੌਗਇਨ ਕਰਨ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਬੋਲੋ ਜਾਂ ਲਿਖੋ!",
    btn_book_slot: "🌾 ਫ਼ਸਲ ਸਲਾਟ ਬੁੱਕ ਕਰੋ",
    btn_login_otp: "🔐 ਕਿਸਾਨ ਲੌਗਇਨ ਤੇ OTP",
    btn_my_profile: "👨‍🌾 ਮੇਰੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
    btn_centers: "📍 ਨੇੜਲੇ ਖਰੀਦ ਕੇਂਦਰ",
    btn_queue: "⚡ ਲਾਈਵ ਲਾਈਨ ਸਥਿਤੀ",
    btn_msp: "💰 ਮੰਡੀ MSP ਰੇਟ",
    profile_summary: "👨‍🌾 **ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ!**\n\n• **ਨਾਮ**: {name}\n• **ਕਿਸਾਨ ID**: {id}\n• **ਸਥਾਨ**: {location}, {district}\n• **ਜ਼ਮੀਨ**: {area} ਏਕੜ\n• **ਮੁੱਖ ਫ਼ਸਲ**: {crop}\n• **DBT ਬੈਂਕ**: {bank}\n\nਤੁਸੀਂ ਆਪਣੇ ਪੂਰੇ ਪ੍ਰੋਫਾਈਲ ਪੇਜ 'ਤੇ ਸਾਰੇ ਵੇਰਵੇ ਵੇਖ ਤੇ ਅੱਪਡੇਟ ਕਰ ਸਕਦੇ ਹੋ!",
    btn_open_profile: "🚀 ਪੂਰਾ ਪ੍ਰੋਫਾਈਲ ਪੇਜ ਖੋਲ੍ਹੋ",
    step_1_center: "ਪੜਾਅ 1: ਕਿਰਪਾ ਕਰਕੇ ਫ਼ਸਲ ਡਿਲਿਵਰੀ ਲਈ ਆਪਣਾ ਨੇੜਲਾ **ਖਰੀਦ ਕੇਂਦਰ** ਚੁਣੋ:",
    step_2_crop: "📍 ਕੇਂਦਰ: **{center}** ✅\n\nਪੜਾਅ 2: ਤੁਸੀਂ ਕਿਹੜੀ **ਫ਼ਸਲ** ਲਿਆ ਰਹੇ ਹੋ?",
    step_3_weight: "🌾 ਫ਼ਸਲ: **{crop}** ✅\n\nਪੜਾਅ 3: ਤੁਹਾਡਾ ਅਨੁਮਾਨਿਤ **ਭਾਰ (ਕੁਇੰਟਲ ਵਿੱਚ)** ਕਿੰਨਾ ਹੈ? (1 ਕੁਇੰਟਲ = 100 ਕਿੱਲੋ):",
    step_4_date: "⚖️ ਭਾਰ: **{weight} ਕੁਇੰਟਲ** ✅\n\nਪੜਾਅ 4: ਆਪਣੀ **ਡਿਲਿਵਰੀ ਮਿਤੀ** ਚੁਣੋ:",
    step_5_slot: "📅 ਮਿਤੀ: **{date}** ✅\n\nਆਖਰੀ ਪੜਾਅ: ਉਪਲਬਧ **ਸਮਾਂ ਸਲਾਟ** ਚੁਣੋ:",
    confirm_title: "📋 **ਬੁਕਿੰਗ ਵੇਰਵੇ ਤਿਆਰ ਹਨ!**\n\n• **ਕੇਂਦਰ**: {center}\n• **ਫ਼ਸਲ**: {crop}\n• **ਭਾਰ**: {weight} ਕੁਇੰਟਲ ({kg} ਕਿੱਲੋ)\n• **ਮਿਤੀ**: {date}\n• **ਸਮਾਂ ਸਲਾਟ**: {slot}\n\nਕੀ ਤੁਸੀਂ ਡਿਜੀਟਲ ਟੋਕਨ ਬਣਾਉਣ ਲਈ ਤਿਆਰ ਹੋ?",
    btn_confirm_token: "⚡ ਹਾਂ, ਡਿਜੀਟਲ ਟੋਕਨ ਬਣਾਓ",
    btn_modify: "🔄 ਵੇਰਵੇ ਬਦਲੋ",
    booking_success: "🎉 **ਬੁਕਿੰਗ ਪੱਕੀ! ਟੋਕਨ #{token} ਬਣ ਗਿਆ!**\n\nਤੁਹਾਡਾ ਡਿਜੀਟਲ ਟੋਕਨ ਦਰਜ ਹੋ ਚੁੱਕਾ ਹੈ। ਲਾਈਵ ਲਾਈਨ ਟਰੈਕਰ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    btn_track_queue: "⚡ ਲਾਈਵ ਲਾਈਨ ਵੇਖੋ",
    btn_book_another: "🔄 ਹੋਰ ਸਲਾਟ ਬੁੱਕ ਕਰੋ",
    login_ask_phone: "📲 **ਕਿਸਾਨ ਲੌਗਇਨ ਪੋਰਟਲ**\n\nਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ **10-ਅੰਕਾਂ ਵਾਲਾ ਮੋਬਾਈਲ ਨੰਬਰ** (ਜਿਵੇਂ 9876543210) ਬੋਲੋ ਜਾਂ ਲਿਖੋ। ਡੈਮੋ OTP (**4241**) ਨਾਲ ਪੋਰਟਲ ਖੋਲ੍ਹਿਆ ਜਾਵੇਗਾ! ⚡",
    login_otp_sent: "📱 **ਕਿਸਾਨ ਪੋਰਟਲ ਖੁੱਲ੍ਹ ਗਿਆ!**\n\nਮੋਬਾਈਲ ਨੰਬਰ **+91 {mobile}** ਅਤੇ ਡੈਮੋ OTP **4241**। ਪੌਪਅੱਪ ਵਿੱਚ **4241** ਭਰੋ! 🔐",
    btn_view_login: "🔑 ਲੌਗਇਨ ਵਿੰਡੋ ਵੇਖੋ",
    fallback_out_of_scope: "ਮੈਂ **ਕਿਸਾਨ ਮਿੱਤਰ** ਹਾਂ, ਕਿਸਾਨਸੇਤੂ ਪੋਰਟਲ ਦਾ ਡਿਜੀਟਲ ਸਹਾਇਕ 🌾।\n\nਮੈਂ ਕੇਵਲ **ਕਿਸਾਨਸੇਤੂ ਪੋਰਟਲ ਸੇਵਾਵਾਂ** ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n• **ਫ਼ਸਲ ਟੋਕਨ ਤੇ ਸਲਾਟ ਬੁਕਿੰਗ**\n• **ਨੇੜਲੇ ਖਰੀਦ ਕੇਂਦਰ ਤੇ ਮੰਡੀਆਂ**\n• **ਲਾਈਵ ਲਾਈਨ ਸਥਿਤੀ**\n• **ਅੱਜ ਦੇ ਮੰਡੀ MSP ਰੇਟ**\n• **ਕਿਸਾਨ ਲੌਗਇਨ ਤੇ ਪ੍ਰੋਫਾਈਲ**\n\nਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਚੁਣੋ!",
    input_placeholder: "ਬੋਲੋ ਜਾਂ ਲਿਖੋ: 'ਝੋਨੇ ਦਾ ਸਲਾਟ ਬੁੱਕ ਕਰੋ', 'ਲੌਗਇਨ'...",
    listening_banner: "ਆਵਾਜ਼ ਸੁਣ ਰਿਹਾ ਹਾਂ... ਹੁਣ ਬੋਲੋ!",
    mic_blocked: "🎙️ ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਬੰਦ ਹੈ। ਐਡਰੈੱਸ ਬਾਰ ਵਿੱਚ ਇਜਾਜ਼ਤ ਦਿਓ ਜਾਂ ਹੇਠਾਂ ਲਿਖੋ!",
    date_today: "ਅੱਜ",
    date_tomorrow: "ਭਲਕੇ (ਕੱਲ੍ਹ)",
    date_2days: "2 ਦਿਨਾਂ ਬਾਅਦ",
    qtl_10: "10 ਕੁਇੰਟਲ (1,000 kg)",
    qtl_25: "25 ਕੁਇੰਟਲ (2,500 kg)",
    qtl_35: "35 ਕੁਇੰਟਲ (3,500 kg)",
    qtl_50: "50 ਕੁਇੰਟਲ (5,000 kg)",
  },
  or: {
    title: "କିଷାନ ମିତ୍ର",
    subtitle: "ଏଆଇ ସହାୟକ",
    tagline: "ଭଏସ୍ ଓ ଅଟୋ-ବୁକିଂ",
    welcome: "ନମସ୍କାର କୃଷକ ଭାଇ! 🙏 ମୁଁ **କିଷାନ ମିତ୍ର**, କିଷାନସେତୁର ଏଆଇ ସହାୟକ। ଫସଲ ଡେଲିଭରୀ ସ୍ଲଟ୍ ବୁକିଂ, ଲାଇଭ୍ ଧାଡ଼ି ସ୍ଥିତି ଏବଂ ମଣ୍ଡି କେନ୍ଦ୍ର ଖୋଜିବାରେ ମୁଁ ସାହାଯ୍ୟ କରିବି। କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ!",
    btn_book_slot: "🌾 ଫସଲ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ",
    btn_login_otp: "🔐 କୃଷକ ଲଗଇନ୍ ଓ OTP",
    btn_my_profile: "👨‍🌾 ମୋର କୃଷକ ପ୍ରୋଫାଇଲ୍",
    btn_centers: "📍 ନିକଟସ୍ଥ କ୍ରୟ କେନ୍ଦ୍ର",
    btn_queue: "⚡ ଲାଇଭ୍ ଧାଡ଼ି ସ୍ଥିତି",
    btn_msp: "💰 ଆଜିର ମଣ୍ଡି MSP ଦର",
    profile_summary: "👨‍🌾 **କୃଷକ ପ୍ରୋଫାଇଲ୍ ବିବରଣୀ!**\n\n• **ନାମ**: {name}\n• **କୃଷକ ID**: {id}\n• **ସ୍ଥାନ**: {location}, {district}\n• **ଜମି**: {area} ଏକର\n• **ମୁଖ୍ୟ ଫସଲ**: {crop}\n• **DBT ବ୍ୟାଙ୍କ**: {bank}\n\nଆପଣ ପ୍ରୋଫାଇଲ୍ ପେଜ୍ ଖୋଲି ବିବରଣୀ ଅଦ୍ୟତନ କରିପାରିବେ!",
    btn_open_profile: "🚀 ପ୍ରୋଫାଇଲ୍ ପେଜ୍ ଖୋଲନ୍ତୁ",
    step_1_center: "ପର୍ଯ୍ୟାୟ ୧: ଦୟାକରି ଫସଲ ଡେଲିଭରୀ ପାଇଁ ଆପଣଙ୍କ ନିକଟସ୍ଥ **କ୍ରୟ କେନ୍ଦ୍ର** ବାଛନ୍ତୁ:",
    step_2_crop: "📍 କେନ୍ଦ୍ର: **{center}** ✅\n\nପର୍ଯ୍ୟାୟ ୨: ଆପଣ କେଉଁ **ଫସଲ** ଆଣୁଛନ୍ତି?",
    step_3_weight: "🌾 ଫସଲ: **{crop}** ✅\n\nପର୍ଯ୍ୟାୟ ୩: ଆପଣଙ୍କର ଆନୁମାନିକ **ଓଜନ (କ୍ୱିଣ୍ଟାଲରେ)** କେତେ? (୧ କ୍ୱିଣ୍ଟାଲ = ୧୦୦ କିଗ୍ରା):",
    step_4_date: "⚖️ ଓଜନ: **{weight} କ୍ୱିଣ୍ଟାଲ** ✅\n\nପର୍ଯ୍ୟାୟ ୪: ଆପଣଙ୍କ **ଡେଲିଭରୀ ତାରିଖ** ବାଛନ୍ତୁ:",
    step_5_slot: "📅 ତାରିଖ: **{date}** ✅\n\nଶେଷ ପର୍ଯ୍ୟାୟ: ଉପଲବ୍ଧ **ସମୟ ସ୍ଲଟ୍** ବାଛନ୍ତୁ:",
    confirm_title: "📋 **ବୁକିଂ ବିବରଣୀ ପ୍ରସ୍ତୁତ!**\n\n• **କେନ୍ଦ୍ର**: {center}\n• **ଫସଲ**: {crop}\n• **ଓଜନ**: {weight} କ୍ୱିଣ୍ଟାଲ ({kg} କିଗ୍ରା)\n• **ତାରିଖ**: {date}\n• **ସମୟ ସ୍ଲଟ୍**: {slot}\n\nଆପଣ କଣ ଡିଜିଟାଲ୍ ଟୋକନ ସୃଷ୍ଟି କରିବାକୁ ପ୍ରସ୍ତୁତ?",
    btn_confirm_token: "⚡ ହଁ, ଡିଜିଟାଲ୍ ଟୋକନ ସୃଷ୍ଟି କରନ୍ତୁ",
    btn_modify: "🔄 ବିବରଣୀ ବଦଳାନ୍ତୁ",
    booking_success: "🎉 **ବੁକିଂ ନିଶ୍ଚିତ! ଟୋକନ #{token} ସୃଷ୍ଟି ହୋଇଛି!**\n\nଲାଇଭ୍ ଧାଡ଼ି ଟ୍ରାକର୍ ଖୋଲାଯାଉଛି...",
    btn_track_queue: "⚡ ଲାଇଭ୍ ଧାଡ଼ି ଦେਖନ୍ତୁ",
    btn_book_another: "🔄 ଅନ୍ୟ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ",
    login_ask_phone: "📲 **କୃଷକ ଲଗଇନ୍ ପୋର୍ଟାଲ୍**\n\nଦୟାକରି ଆପଣଙ୍କର **୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର** କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ। ଡେମୋ OTP (**4241**) ବ୍ୟବହାର ହେବ! ⚡",
    login_otp_sent: "📱 **କୃଷକ ପୋର୍ଟାଲ୍ ଖୋଲିଗଲା!**\n\nମୋବାଇଲ୍ ନମ୍ବର **+91 {mobile}** ଓ ଡେମୋ OTP **4241**। ପପ୍-ଅପ୍ ରେ **4241** ଦିଅନ୍ତୁ! 🔐",
    btn_view_login: "🔑 ଲଗଇନ୍ ୱିଣ୍ଡୋ ଦେଖନ୍ତୁ",
    fallback_out_of_scope: "ମୁଁ **କିଷାନ ମିତ୍ର**, କିଷାନସେତୁ ପୋର୍ଟାଲର ଡିଜିଟାଲ୍ ସହାୟକ 🌾।\n\nମୁଁ କେବଳ **କିଷାନସେତୁ ସେବା**ରେ ସାହାଯ୍ୟ କରିପାରିବି:\n• **ଫସଲ ଟୋକନ ଓ ସ୍ଲଟ୍ ବୁକିଂ**\n• **ନିକଟସ୍ଥ କ୍ରୟ କେନ୍ଦ୍ର ଓ ମଣ୍ଡି**\n• **ଲାଇଭ୍ ଧାଡ଼ି ସ୍ଥିତି**\n• **ଆଜିର ମଣ୍ଡି MSP ଦର**\n• **କୃଷକ ଲଗଇନ୍**",
    input_placeholder: "କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ: 'ଧାନ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ'...",
    listening_banner: "ଶୁଣୁଛି... ଏବେ କୁହନ୍ତୁ!",
    mic_blocked: "🎙️ ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ବନ୍ଦ ଅଛି। ତଳେ ଲେଖନ୍ତୁ!",
    date_today: "ଆଜି",
    date_tomorrow: "ଆସନ୍ତାକାଲି",
    date_2days: "୨ ଦିନ ପରେ",
    qtl_10: "୧୦ କ୍ୱିଣ୍ଟାଲ (୧,୦୦୦ kg)",
    qtl_25: "୨୫ କ୍ୱିଣ୍ଟାଲ (୨,୫୦୦ kg)",
    qtl_35: "୩୫ କ୍ୱିଣ୍ଟାଲ (୩,୫୦୦ kg)",
    qtl_50: "୫୦ କ୍ୱିଣ୍ଟାଲ (୫,୦୦୦ kg)",
  },
};

function renderFormattedText(text: string, isUser: boolean) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, lIdx) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={lIdx} className="block leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                const inner = part.slice(2, -2);
                return (
                  <strong
                    key={pIdx}
                    className={isUser ? "font-extrabold text-slate-950" : "font-extrabold text-emerald-300"}
                  >
                    {inner}
                  </strong>
                );
              }
              return part;
            })}
          </span>
        );
      })}
    </div>
  );
}

export default function KisanChatbot() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const voiceReplyRef = useRef<boolean>(true);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isAwaitingLoginPhone, setIsAwaitingLoginPhone] = useState(false);

  useEffect(() => {
    try {
      const storedVoice = localStorage.getItem("kisansetu_voice_reply");
      if (storedVoice !== null) {
        const val = storedVoice === "true";
        setVoiceReply(val);
        voiceReplyRef.current = val;
      }
    } catch {}
  }, []);

  useEffect(() => {
    voiceReplyRef.current = voiceReply;
  }, [voiceReply]);

  const loc = CHAT_I18N[lang] || CHAT_I18N.en;

  const triggerFarmerLogin = (phone?: string, autoSendOtp: boolean = true) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kisansetu_open_login", {
          detail: { phone, autoSendOtp },
        })
      );
    }
  };

  // Restore open state across navigations
  useEffect(() => {
    try {
      const storedOpen = sessionStorage.getItem("kisansetu_chat_open");
      if (storedOpen === "true") {
        setIsOpen(true);
      }
    } catch {}
  }, []);

  const toggleOpenState = (open: boolean) => {
    if (!open) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      setIsClosing(true);
      try {
        sessionStorage.setItem("kisansetu_chat_open", "false");
      } catch {}
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 260);
    } else {
      setIsClosing(false);
      setIsOpen(true);
      try {
        sessionStorage.setItem("kisansetu_chat_open", "true");
      } catch {}
    }
  };

  // Persistent reference to booking state
  const bookingDraftRef = useRef<BookingDraft>({
    center: "",
    centreId: "",
    crop: "",
    weight: 0,
    date: "",
    timeSlot: "",
    slotId: "",
  });

  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(bookingDraftRef.current);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial welcome message or update on language change
  useEffect(() => {
    const welcomeMsg = getWelcomeMessage(lang);
    setMessages([welcomeMsg]);
  }, [lang]);

  // Web Speech Synthesis (Text to Speech)
  const speakText = (text: string) => {
    if (!voiceReplyRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/[*_#•]/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        pa: "pa-IN",
        bn: "bn-IN",
        or: "or-IN",
      };
      utterance.lang = langMap[lang] || "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Web Speech Recognition (Speech to Text)
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        pa: "pa-IN",
        bn: "bn-IN",
        or: "or-IN",
      };
      recognition.lang = langMap[lang] || "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          const l = CHAT_I18N[lang] || CHAT_I18N.en;
          const micMsg: Message = {
            id: "mic-err-" + Date.now(),
            sender: "bot",
            text: l.mic_blocked,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, micMsg]);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  function getWelcomeMessage(currentLang: string): Message {
    const l = CHAT_I18N[currentLang] || CHAT_I18N.en;

    return {
      id: "welcome-1",
      sender: "bot",
      text: l.welcome,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: l.btn_book_slot, action: () => startBookingFlow({}) },
        { label: "🌤️ Live Weather", action: () => showLiveWeather() },
        { label: l.btn_my_profile || "👨‍🌾 Farmer Profile", action: () => handleNavigate("/profile", "Opening Farmer Profile Dashboard...") },
        { label: l.btn_login_otp, action: () => promptLogin() },
        { label: l.btn_centers, action: () => handleNavigate("/centers", "Navigating to Procurement Centers...") },
        { label: l.btn_queue, action: () => handleNavigate("/queue", "Opening Live Queue Tracker...") },
        { label: l.btn_msp, action: () => showMspRates() },
      ],
    };
  }

  const promptLogin = () => {
    const l = CHAT_I18N[lang] || CHAT_I18N.en;
    setIsAwaitingLoginPhone(true);
    const askPhoneMsg: Message = {
      id: "login-ask-" + Date.now(),
      sender: "bot",
      text: l.login_ask_phone,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: l.btn_view_login, action: () => triggerFarmerLogin() },
      ],
    };
    setMessages((prev) => [...prev, askPhoneMsg]);
    speakText(l.login_ask_phone.replace(/[*_#•]/g, ""));
  };

  // Real-time navigation sync
  const handleNavigate = (path: string, message: string) => {
    const botMsg: Message = {
      id: "nav-" + Date.now(),
      sender: "bot",
      text: `${message} 🚀`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      redirectUrl: path,
      redirectLabel: `Open ${path === "/centers" ? "Centers" : path === "/queue" ? "Live Queue" : "Scheduler"}`,
    };
    setMessages((prev) => [...prev, botMsg]);
    speakText(message);
    router.push(path);
  };

  const showMspRates = () => {
    const text =
      lang === "hi"
        ? `🌾 **वर्तमान न्यूनतम समर्थन मूल्य (MSP 2026)**:\n• **धान (Paddy)**: ₹2,300 / क्विंटल\n• **गेहूं (Wheat)**: ₹2,275 / क्विंटल\n• **मक्का (Maize)**: ₹2,090 / क्विंटल\n• **सरसों (Mustard)**: ₹5,650 / क्विंटल\n• **जौ (Barley)**: ₹1,850 / क्विंटल\n\nसभी भुगतान **DBT** के माध्यम से 48-72 घंटों में सीधे बैंक खाते में जमा होते हैं!`
        : lang === "bn"
        ? `🌾 **বর্তমান নূন্যতম সহায়ক মূল্য (MSP 2026)**:\n• **ধান (Paddy)**: ₹২,৩০০ / কুইন্টাল\n• **গম (Wheat)**: ₹২,২৭৫ / কুইন্টাল\n• **ভুট্টা (Maize)**: ₹২,০৯০ / কুইন্টাল\n• **সর্ষে (Mustard)**: ₹৫,৬৫০ / কুইন্টাল\n• **বার্লি (Barley)**: ₹১,৮৫০ / কুইন্টাল\n\nসমস্ত পেমেন্ট **DBT** এর মাধ্যমে ৪৮-৭২ ঘন্টার মধ্যে সরাসরি ব্যাংক অ্যাকাউন্টে দেওয়া হয়!`
        : lang === "pa"
        ? `🌾 **ਮੌਜੂਦਾ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP 2026)**:\n• **ਝੋਨਾ (Paddy)**: ₹2,300 / ਕੁਇੰਟਲ\n• **ਕਣਕ (Wheat)**: ₹2,275 / ਕੁਇੰਟਲ\n• **ਮੱਕੀ (Maize)**: ₹2,090 / ਕੁਇੰਟਲ\n• **ਸਰ੍ਹੋਂ (Mustard)**: ₹5,650 / ਕੁਇੰਟਲ\n• **ਜੌਂ (Barley)**: ₹1,850 / ਕੁਇੰਟਲ\n\nਸਾਰੀ ਰਕਮ **DBT** ਰਾਹੀਂ 48-72 ਘੰਟਿਆਂ ਵਿੱਚ ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ!`
        : lang === "or"
        ? `🌾 **ବର୍ତ୍ତମାନର ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP 2026)**:\n• **ଧାନ (Paddy)**: ₹୨,୩୦୦ / କ୍ୱିଣ୍ଟାଲ\n• **ଗହମ (Wheat)**: ₹୨,୨୭୫ / କ୍ୱିଣ୍ଟାଲ\n• **ମକା (Maize)**: ₹୨,୦୯୦ / କ୍ୱିଣ୍ଟାଲ\n• **ସୋରିଷ (Mustard)**: ₹୫,୬୫୦ / କ୍ୱିଣ୍ଟାଲ\n• **ଯବ (Barley)**: ₹୧,୮୫୦ / କ୍ୱିଣ୍ଟାଲ\n\nସମସ୍ତ ଦେୟ **DBT** ମାଧ୍ୟମରେ ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତାରେ ଜମା ହୁଏ!`
        : `🌾 **Current MSP Procurement Rates (2026 Season)**:\n• **Paddy (Common)**: ₹2,300 / Quintal\n• **Wheat**: ₹2,275 / Quintal\n• **Maize**: ₹2,090 / Quintal\n• **Mustard**: ₹5,650 / Quintal\n• **Barley**: ₹1,850 / Quintal\n\nAll payments are transferred directly via **DBT** within 48-72 hours!`;

    const l = CHAT_I18N[lang] || CHAT_I18N.en;
    const botMsg: Message = {
      id: "msp-" + Date.now(),
      sender: "bot",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: l.btn_book_slot, action: () => startBookingFlow({}) },
        { label: l.btn_centers, action: () => handleNavigate("/centers", "Opening centers list...") },
      ],
    };
    setMessages((prev) => [...prev, botMsg]);
    speakText(text.replace(/[*_#•]/g, ""));
  };

  const showLiveWeather = async () => {
    const l = CHAT_I18N[lang] || CHAT_I18N.en;

    const loadId = "weather-load-" + Date.now();
    const loadingMsg: Message = {
      id: loadId,
      sender: "bot",
      text:
        lang === "hi"
          ? "🌤️ आपके लाइव स्थान का मौसम और कृषि सलाह खोजी जा रही है..."
          : lang === "bn"
          ? "🌤️ আপনার লাইভ অবস্থানের আবহাওয়া দেখা হচ্ছে..."
          : lang === "pa"
          ? "🌤️ ਤੁਹਾਡੇ ਲਾਈਵ ਸਥਾਨ ਦਾ ਮੌਸਮ ਵੇਖਿਆ ਜਾ ਰਿਹਾ ਹੈ..."
          : lang === "or"
          ? "🌤️ ପାଣିପାଗ ସୂଚନା ଯାଞ୍ଚ ହେଉଛି..."
          : "🌤️ Fetching live weather report for your current location...",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, loadingMsg]);

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherJson = await weatherRes.json();

        let resolvedArea = "Chandaka";
        let resolvedCity = "Bhubaneswar";
        let resolvedState = "Odisha";

        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          const geoJson = await geoRes.json();
          if (geoJson) {
            const adminList = geoJson.localityInfo?.administrative || [];
            resolvedState = geoJson.principalSubdivision || "Odisha";

            const subdistrict =
              adminList.find((a: any) => a.order >= 4 || a.adminLevel >= 6)?.name ||
              geoJson.localityInfo?.informative?.[0]?.name;
            const mainCity = geoJson.city || geoJson.locality || "Bhubaneswar";
            const district = geoJson.principalSubdivisionDistrict || adminList.find((a: any) => a.order === 3)?.name || mainCity;

            if (subdistrict && subdistrict.toLowerCase() !== mainCity.toLowerCase()) {
              resolvedArea = subdistrict;
              resolvedCity = mainCity;
            } else if (district && district.toLowerCase() !== mainCity.toLowerCase()) {
              resolvedArea = district;
              resolvedCity = mainCity;
            } else {
              resolvedArea = geoJson.localityInfo?.informative?.[0]?.name || geoJson.locality || "Local Area";
              resolvedCity = mainCity;
            }

            const POPULAR_METROS = ["Bhubaneswar", "Cuttack", "Kolkata", "Delhi", "New Delhi", "Mumbai", "Pune", "Lucknow", "Kanpur", "Patna", "Ludhiana", "Amritsar", "Jaipur", "Ahmedabad", "Chandigarh", "Bengaluru", "Hyderabad", "Chennai"];
            if (POPULAR_METROS.includes(resolvedArea) && !POPULAR_METROS.includes(resolvedCity)) {
              const temp = resolvedArea;
              resolvedArea = resolvedCity;
              resolvedCity = temp;
            }
          }
        } catch {}

        const current = weatherJson?.current_weather || { temperature: 28, windspeed: 11, weathercode: 0 };
        const temp = Math.round(current.temperature);
        const wind = Math.round(current.windspeed);

        let icon = "☀️";
        let conditionText = "Clear Sky";
        let advisory = "Optimal conditions for crop harvesting, transit, and mandi delivery.";

        if (current.weathercode >= 51 && current.weathercode <= 99) {
          icon = "🌧️";
          conditionText = lang === "hi" ? "बारिश / बूंदाबांदी" : lang === "bn" ? "বৃষ্টিপাত" : lang === "pa" ? "ਮੀਂਹ" : lang === "or" ? "ବର୍ଷା" : "Rain / Drizzle";
          advisory =
            lang === "hi"
              ? `${resolvedCity} मंडी में फसल ले जाते समय तिरपाल से ढकें और कतार टोकन पहले से बुक करें।`
              : lang === "bn"
              ? `${resolvedCity} মান্ডিতে শস্য পরিবহনে ত্রিপল ব্যবহার করুন।`
              : lang === "pa"
              ? `${resolvedCity} ਮੰਡੀ ਜਾਣ ਸਮੇਂ ਫ਼ਸਲ ਨੂੰ ਤਰਪਾਲ ਨਾਲ ਢੱਕੋ।`
              : `Keep tarpaulins ready during ${resolvedCity} mandi transit and pre-book token.`;
        } else if (current.weathercode >= 1 && current.weathercode <= 3) {
          icon = "⛅";
          conditionText = lang === "hi" ? "आंशिक रूप से बादल" : lang === "bn" ? "আংশিক মেঘলা" : lang === "pa" ? "ਬੱਦਲਵਾਈ" : lang === "or" ? "ମେଘୁଆ" : "Partly Cloudy";
        }

        const weatherCardText =
          `🌤️ **Live Weather & Mandi Advisory**\n\n` +
          `• **Location**: 📍 ${resolvedArea}, ${resolvedCity}, ${resolvedState}\n` +
          `• **Temperature**: ${temp}°C ${icon} (${conditionText})\n` +
          `• **Wind Speed**: ${wind} km/h 💨\n\n` +
          `🌾 **Agro Advisory**: ${advisory}`;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadId
              ? {
                  ...m,
                  text: weatherCardText,
                  options: [
                    { label: l.btn_book_slot, primary: true, action: () => startBookingFlow({}) },
                    { label: l.btn_msp, action: () => showMspRates() },
                    { label: l.btn_queue, action: () => handleNavigate("/queue", "Opening Live Queue tracker...") },
                  ],
                }
              : m
          )
        );

        speakText(
          lang === "hi"
            ? `${resolvedArea}, ${resolvedCity} में तापमान ${temp} डिग्री है। ${advisory}`
            : lang === "bn"
            ? `${resolvedArea}, ${resolvedCity} এলাকায় তাপমাত্রা ${temp} ডিগ্রি সেলসিয়াস।`
            : lang === "pa"
            ? `${resolvedArea}, ${resolvedCity} ਵਿੱਚ ਤਾਪਮਾਨ ${temp} ਡਿਗਰੀ ਹੈ।`
            : `Live weather in ${resolvedArea}, ${resolvedCity} is ${temp} degrees Celsius with ${conditionText}. ${advisory}`
        );
      } catch (err) {
        console.error("Chatbot weather error:", err);
      }
    };

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(20.2961, 85.8245),
        { timeout: 8000 }
      );
    } else {
      fetchWeather(20.2961, 85.8245);
    }
  };

  // Sync scheduler URL with currently selected parameters
  const syncSchedulerUrl = (draft: BookingDraft, stepNum: number) => {
    const params = new URLSearchParams();
    if (draft.center) params.set("center", draft.center);
    if (draft.crop) params.set("crop", draft.crop);
    if (draft.weight) params.set("weight", draft.weight.toString());
    if (draft.date) params.set("date", draft.date);
    if (draft.timeSlot) params.set("slot", draft.timeSlot);
    params.set("step", stepNum.toString());

    router.push(`/scheduler?${params.toString()}`);
  };

  // Core Guided Booking Wizard
  const startBookingFlow = (updates: Partial<BookingDraft>) => {
    const current = { ...bookingDraftRef.current, ...updates };
    bookingDraftRef.current = current;
    setBookingDraft(current);

    const l = CHAT_I18N[lang] || CHAT_I18N.en;

    // Step 1: Center
    if (!current.center) {
      syncSchedulerUrl(current, 1);
      const msg: Message = {
        id: "step-center-" + Date.now(),
        sender: "bot",
        text: l.step_1_center,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: MOCK_CENTERS.map((c) => ({
          label: `📍 ${c.name} (${c.distance})`,
          action: () => selectCenter(c.name, c.id),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText(l.step_1_center.replace(/[*_#•]/g, ""));
      return;
    }

    // Step 2: Crop
    if (!current.crop) {
      syncSchedulerUrl(current, 2);
      const textCrop = l.step_2_crop.replace("{center}", current.center);
      const msg: Message = {
        id: "step-crop-" + Date.now(),
        sender: "bot",
        text: textCrop,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: CROPS.map((crop) => ({
          label: `🌾 ${CROP_LABELS[crop]?.[lang] || crop}`,
          action: () => selectCrop(crop),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText(textCrop.replace(/[*_#•]/g, ""));
      return;
    }

    // Step 3: Weight
    if (!current.weight || current.weight <= 0) {
      syncSchedulerUrl(current, 2);
      const cropDisplay = CROP_LABELS[current.crop]?.[lang] || current.crop;
      const textWeight = l.step_3_weight.replace("{crop}", cropDisplay);
      const msg: Message = {
        id: "step-weight-" + Date.now(),
        sender: "bot",
        text: textWeight,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: l.qtl_10, action: () => selectWeight(10) },
          { label: l.qtl_25, action: () => selectWeight(25) },
          { label: l.qtl_35, action: () => selectWeight(35) },
          { label: l.qtl_50, action: () => selectWeight(50) },
        ],
      };
      setMessages((prev) => [...prev, msg]);
      speakText(textWeight.replace(/[*_#•]/g, ""));
      return;
    }

    // Step 4: Date
    if (!current.date) {
      syncSchedulerUrl(current, 3);
      const today = new Date().toISOString().split("T")[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split("T")[0];

      const dayAfterDate = new Date();
      dayAfterDate.setDate(dayAfterDate.getDate() + 2);
      const dayAfter = dayAfterDate.toISOString().split("T")[0];

      const textDate = l.step_4_date.replace("{weight}", current.weight.toString());
      const msg: Message = {
        id: "step-date-" + Date.now(),
        sender: "bot",
        text: textDate,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: `📅 ${l.date_today} (${today})`, action: () => selectDate(today) },
          { label: `📅 ${l.date_tomorrow} (${tomorrow})`, action: () => selectDate(tomorrow) },
          { label: `📅 ${l.date_2days} (${dayAfter})`, action: () => selectDate(dayAfter) },
        ],
      };
      setMessages((prev) => [...prev, msg]);
      speakText(textDate.replace(/[*_#•]/g, ""));
      return;
    }

    // Step 5: Time Slot
    if (!current.timeSlot) {
      syncSchedulerUrl(current, 3);
      const textSlot = l.step_5_slot.replace("{date}", current.date);
      const msg: Message = {
        id: "step-slot-" + Date.now(),
        sender: "bot",
        text: textSlot,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: TIME_SLOTS.map((s) => ({
          label: `⏰ ${s.time}`,
          action: () => selectSlot(s.time, s.id),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText(textSlot.replace(/[*_#•]/g, ""));
      return;
    }

    // All details complete -> Show Confirmation Card
    showBookingConfirmation(current);
  };

  const selectCenter = (centerName: string, centreId: string) => {
    startBookingFlow({ center: centerName, centreId });
  };

  const selectCrop = (cropName: string) => {
    startBookingFlow({ crop: cropName });
  };

  const selectWeight = (weightVal: number) => {
    startBookingFlow({ weight: weightVal });
  };

  const selectDate = (dateStr: string) => {
    startBookingFlow({ date: dateStr });
  };

  const selectSlot = (slotStr: string, slotId: string) => {
    const current = { ...bookingDraftRef.current, timeSlot: slotStr, slotId };
    bookingDraftRef.current = current;
    setBookingDraft(current);
    showBookingConfirmation(current);
  };

  const showBookingConfirmation = (draft: BookingDraft) => {
    syncSchedulerUrl(draft, 3);

    const l = CHAT_I18N[lang] || CHAT_I18N.en;
    const cropDisplay = CROP_LABELS[draft.crop]?.[lang] || draft.crop;
    const summaryText = l.confirm_title
      .replace("{center}", draft.center)
      .replace("{crop}", cropDisplay)
      .replace("{weight}", draft.weight.toString())
      .replace("{kg}", (draft.weight * 100).toString())
      .replace("{date}", draft.date)
      .replace("{slot}", draft.timeSlot);

    const confirmMsg: Message = {
      id: "confirm-" + Date.now(),
      sender: "bot",
      text: summaryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        {
          label: l.btn_confirm_token,
          primary: true,
          action: () => executeBooking(draft),
        },
        {
          label: l.btn_modify,
          action: () => {
            bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
            setBookingDraft(bookingDraftRef.current);
            startBookingFlow({});
          },
        },
      ],
    };
    setMessages((prev) => [...prev, confirmMsg]);
    speakText(summaryText.replace(/[*_#•]/g, ""));
  };

  const executeBooking = async (draft: BookingDraft) => {
    if (isProcessingBooking) return;
    setIsProcessingBooking(true);

    const centreId = draft.centreId || MOCK_CENTERS[0].id;
    const slotId = draft.slotId || TIME_SLOTS[0].id;
    const farmerId = "99999999-9999-9999-9999-999999999999";

    const l = CHAT_I18N[lang] || CHAT_I18N.en;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId, centreId, slotId }),
      });
      const data = await res.json();

      if (data.success && data.booking) {
        const tokenNum = data.booking.token_number;
        const tokenId = `KS-${tokenNum}`;

        const ticketData = {
          tokenId,
          tokenNumber: tokenNum,
          center: draft.center || MOCK_CENTERS[0].name,
          crop: CROP_LABELS[draft.crop]?.[lang] || draft.crop || "Paddy",
          weight: draft.weight || 30,
          date: draft.date || new Date().toISOString().split("T")[0],
          timeSlot: draft.timeSlot || TIME_SLOTS[0].time,
        };

        const targetUrl = `/queue?token=${tokenNum}&center=${encodeURIComponent(ticketData.center)}`;
        const successText = l.booking_success.replace("{token}", tokenNum.toString());

        const successMsg: Message = {
          id: "success-" + Date.now(),
          sender: "bot",
          text: successText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ticket: ticketData,
          redirectUrl: targetUrl,
          redirectLabel: `🚀 ${l.btn_track_queue} #${tokenNum}`,
          options: [
            {
              label: `⚡ ${l.btn_track_queue}`,
              primary: true,
              action: () => {
                router.push(targetUrl);
              },
            },
            {
              label: l.btn_book_another,
              action: () => {
                bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
                setBookingDraft(bookingDraftRef.current);
                startBookingFlow({});
              },
            },
          ],
        };

        setMessages((prev) => [...prev, successMsg]);
        speakText(successText.replace(/[*_#•]/g, ""));

        setTimeout(() => {
          router.push(targetUrl);
        }, 1200);

        bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
        setBookingDraft(bookingDraftRef.current);
      } else {
        throw new Error(data.error || "Booking failed");
      }
    } catch (err: any) {
      console.error("Chatbot booking error:", err);
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        sender: "bot",
        text: `⚠️ Could not complete booking: ${err.message || "Please check server status"}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: "Try Again", action: () => executeBooking(draft) },
          { label: "Open Manual Scheduler", action: () => handleNavigate("/scheduler", "Opening scheduler page...") },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  // Natural Language Understanding with multilingual keyword recognition
  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim()) return;

    const userText = rawText.trim();
    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      processUserInput(userText.toLowerCase());
    }, 200);
  };

  const processUserInput = (text: string) => {
    const l = CHAT_I18N[lang] || CHAT_I18N.en;

    // 1. Navigation Commands (English, Hindi, Bengali, Punjabi, Odia)
    if (
      text.includes("center") ||
      text.includes("kendra") ||
      text.includes("मंडी") ||
      text.includes("केंद्र") ||
      text.includes("কেন্দ্র") ||
      text.includes("ਕੇਂਦਰ") ||
      text.includes("କେନ୍ଦ୍ର") ||
      text.includes("location") ||
      text.includes("place")
    ) {
      handleNavigate("/centers", lang === "hi" ? "खरीद केंद्रों की सूची पर ले जाया जा रहा है।" : lang === "bn" ? "ক্রয় কেন্দ্রের তালিকায় নিয়ে যাওয়া হচ্ছে।" : lang === "pa" ? "ਖਰੀਦ ਕੇਂਦਰਾਂ ਦੀ ਸੂਚੀ 'ਤੇ ਲਿਜਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।" : "Taking you to the Procurement Centers list.");
      return;
    }

    if (
      text.includes("queue") ||
      text.includes("line") ||
      text.includes("wait") ||
      text.includes("कतार") ||
      text.includes("लाइन") ||
      text.includes("কাতার") ||
      text.includes("ਲਾਈਨ") ||
      text.includes("ଧାଡ଼ି") ||
      text.includes("status") ||
      text.includes("position")
    ) {
      handleNavigate("/queue", lang === "hi" ? "लाइव कतार स्थिति पृष्ठ पर ले जाया जा रहा है।" : lang === "bn" ? "লাইভ কাতার পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে।" : lang === "pa" ? "ਲਾਈਵ ਲਾਈਨ ਪੰਨੇ 'ਤੇ ਲਿਜਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।" : "Taking you to the Live Queue Status tracker.");
      return;
    }

    if (text.includes("home") || text.includes("main page") || text.includes("होम") || text.includes("হোম") || text.includes("ਹੋਮ")) {
      handleNavigate("/", "Returning to home page.");
      return;
    }

    if (
      text.includes("weather") ||
      text.includes("मौसम") ||
      text.includes("आबोहवा") ||
      text.includes("আবহাওয়া") ||
      text.includes("ਮੌਸਮ") ||
      text.includes("ਪਾଣିਪାਗ") ||
      text.includes("temperature") ||
      text.includes("तापमान") ||
      text.includes("बारिश") ||
      text.includes("rain") ||
      text.includes("বৃষ্টি") ||
      text.includes("ਮੀਂਹ") ||
      text.includes("ବର୍ଷା") ||
      text.includes("climate")
    ) {
      showLiveWeather();
      return;
    }

    if (
      text.includes("msp") ||
      text.includes("rate") ||
      text.includes("price") ||
      text.includes("कीमत") ||
      text.includes("दाम") ||
      text.includes("भाव") ||
      text.includes("দর") ||
      text.includes("ਮੁੱਲ") ||
      text.includes("ଦର")
    ) {
      showMspRates();
      return;
    }

    // 2. Farmer Profile Intent Handling
    const isProfileIntent =
      text.includes("profile") ||
      text.includes("प्रोफाइल") ||
      text.includes("প্রোফাইল") ||
      text.includes("ਪ੍ਰੋਫਾਈਲ") ||
      text.includes("ପ୍ରୋଫାଇଲ୍") ||
      text.includes("account") ||
      text.includes("details") ||
      text.includes("my account") ||
      text.includes("mera account") ||
      text.includes("update detail");

    if (isProfileIntent) {
      let storedProfile: any = null;
      try {
        const stored = localStorage.getItem("kisanSetu_farmer_profile");
        if (stored) storedProfile = JSON.parse(stored);
      } catch {}

      if (storedProfile?.name) {
        const summary = (l.profile_summary || "")
          .replace("{name}", storedProfile.name)
          .replace("{id}", storedProfile.farmerId || "KS-FARM-8291")
          .replace("{location}", storedProfile.location || "Kalyanpur")
          .replace("{district}", storedProfile.district || "Kanpur Nagar")
          .replace("{area}", (storedProfile.area || 5).toString())
          .replace("{crop}", storedProfile.primaryCrop || "Paddy")
          .replace("{bank}", storedProfile.bankAccount || "SBI ****4920");

        const profileMsg: Message = {
          id: "prof-" + Date.now(),
          sender: "bot",
          text: summary,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          redirectUrl: "/profile",
          redirectLabel: l.btn_open_profile || "🚀 Open Full Profile Dashboard",
          options: [
            {
              label: l.btn_open_profile || "🚀 Open Full Profile Dashboard",
              primary: true,
              action: () => handleNavigate("/profile", "Opening your full-screen farmer profile dashboard..."),
            },
            {
              label: l.btn_book_slot,
              action: () => startBookingFlow({}),
            },
          ],
        };
        setMessages((prev) => [...prev, profileMsg]);
        speakText(`Farmer profile found for ${storedProfile.name}. You can manage all details on your profile page.`);
        return;
      } else {
        promptLogin();
        return;
      }
    }

    // 3. Farmer Login Request Handling
    const isLoginIntent =
      text.includes("login") ||
      text.includes("लॉगिन") ||
      text.includes("লগইন") ||
      text.includes("ਲੌਗਇਨ") ||
      text.includes("ଲଗଇନ୍") ||
      text.includes("sign in") ||
      text.includes("signin") ||
      text.includes("portal") ||
      text.includes("खाता") ||
      text.includes("otp") ||
      text.includes("ओटीपी") ||
      text.includes("ওটিপি");

    const phoneDigits = text.replace(/\D/g, "");
    const phoneMatch = text.match(/\b([6-9]\d{9})\b/) || (phoneDigits.length === 10 ? [phoneDigits, phoneDigits] : null);

    if (isLoginIntent || isAwaitingLoginPhone) {
      if (phoneMatch && phoneMatch[1]) {
        const mobile = phoneMatch[1];
        setIsAwaitingLoginPhone(false);
        triggerFarmerLogin(mobile, true);

        const loginSuccessText = l.login_otp_sent.replace("{mobile}", mobile);
        const loginSuccessMsg: Message = {
          id: "login-otp-" + Date.now(),
          sender: "bot",
          text: loginSuccessText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          options: [
            { label: l.btn_view_login, action: () => triggerFarmerLogin(mobile, false) },
            { label: l.btn_book_slot, action: () => startBookingFlow({}) },
          ],
        };
        setMessages((prev) => [...prev, loginSuccessMsg]);
        speakText(loginSuccessText.replace(/[*_#•]/g, ""));
        return;
      }

      if (isLoginIntent) {
        promptLogin();
        return;
      }
    }

    // 3. Direct Confirmation trigger
    if (
      (text.includes("yes") ||
        text.includes("confirm") ||
        text.includes("हाँ") ||
        text.includes("হ্যাঁ") ||
        text.includes("ਹਾਂ") ||
        text.includes("ହଁ") ||
        text.includes("बुक करो") ||
        text.includes("generate")) &&
      bookingDraftRef.current.center &&
      bookingDraftRef.current.crop &&
      bookingDraftRef.current.weight &&
      bookingDraftRef.current.date &&
      bookingDraftRef.current.timeSlot
    ) {
      executeBooking(bookingDraftRef.current);
      return;
    }

    // 4. Direct Booking Request / Multilingual Slot Parsing
    let detectedCrop: string | undefined;
    for (const crop of CROPS) {
      if (
        text.includes(crop.toLowerCase()) ||
        (crop === "Paddy" && (text.includes("धान") || text.includes("ধান") || text.includes("ਝੋਨਾ") || text.includes("ଧାନ") || text.includes("rice") || text.includes("dhan"))) ||
        (crop === "Wheat" && (text.includes("गेहूं") || text.includes("গম") || text.includes("ਕਣਕ") || text.includes("ଗହମ") || text.includes("gehu") || text.includes("atta"))) ||
        (crop === "Mustard" && (text.includes("सरसों") || text.includes("সর্ষে") || text.includes("ਸਰ੍ਹੋਂ") || text.includes("ସୋରିଷ") || text.includes("sarson") || text.includes("rai"))) ||
        (crop === "Maize" && (text.includes("मक्का") || text.includes("ভুট্টা") || text.includes("ਮੱਕੀ") || text.includes("ମକା") || text.includes("makka") || text.includes("corn"))) ||
        (crop === "Barley" && (text.includes("जौ") || text.includes("বার্লি") || text.includes("ਜੌਂ") || text.includes("ଯବ") || text.includes("jau")))
      ) {
        detectedCrop = crop;
        break;
      }
    }

    let detectedWeight: number | undefined;
    const weightMatch = text.match(/(\d+)\s*(quintal|qtl|kg|क्विंटल|কুইন্টাল|ਕੁਇੰਟਲ|କ୍ୱିଣ୍ଟାଲ|टन|kilo)?/i);
    if (weightMatch && weightMatch[1]) {
      const parsed = parseInt(weightMatch[1], 10);
      if (parsed > 0 && parsed <= 500) {
        detectedWeight = parsed;
      }
    }

    let detectedCenter: string | undefined;
    let detectedCentreId: string | undefined;
    for (const c of MOCK_CENTERS) {
      const shortName = c.name.toLowerCase().split(" ")[0];
      if (text.includes(shortName) || text.includes(c.name.toLowerCase()) || text.includes(c.location.toLowerCase().split(" ")[0])) {
        detectedCenter = c.name;
        detectedCentreId = c.id;
        break;
      }
    }

    let detectedDate: string | undefined;
    if (text.includes("today") || text.includes("आज") || text.includes("আজ") || text.includes("ਅੱਜ") || text.includes("ଆଜି")) {
      detectedDate = new Date().toISOString().split("T")[0];
    } else if (text.includes("tomorrow") || text.includes("कल") || text.includes("আগামীকাল") || text.includes("ਕੱਲ੍ਹ") || text.includes("ଆସନ୍ତାକାଲି")) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      detectedDate = tom.toISOString().split("T")[0];
    }

    let detectedSlot: string | undefined;
    let detectedSlotId: string | undefined;
    if (text.includes("8 am") || text.includes("8:00") || text.includes("morning") || text.includes("सुबह") || text.includes("সকাল") || text.includes("ਸਵੇਰੇ")) {
      detectedSlot = TIME_SLOTS[0].time;
      detectedSlotId = TIME_SLOTS[0].id;
    } else if (text.includes("10 am") || text.includes("10:00")) {
      detectedSlot = TIME_SLOTS[1].time;
      detectedSlotId = TIME_SLOTS[1].id;
    } else if (text.includes("12 pm") || text.includes("12:00") || text.includes("noon") || text.includes("दोपहर") || text.includes("দুপুর") || text.includes("ਦੁਪਹਿਰ")) {
      detectedSlot = TIME_SLOTS[2].time;
      detectedSlotId = TIME_SLOTS[2].id;
    } else if (text.includes("2 pm") || text.includes("2:00") || text.includes("14:00")) {
      detectedSlot = TIME_SLOTS[3].time;
      detectedSlotId = TIME_SLOTS[3].id;
    } else if (text.includes("4 pm") || text.includes("4:00") || text.includes("evening") || text.includes("शाम") || text.includes("সন্ধ্যা") || text.includes("ਸ਼ਾਮ")) {
      detectedSlot = TIME_SLOTS[4].time;
      detectedSlotId = TIME_SLOTS[4].id;
    }

    if (
      text.includes("book") ||
      text.includes("slot") ||
      text.includes("token") ||
      text.includes("टोकन") ||
      text.includes("টোকেন") ||
      text.includes("ਟੋਕਨ") ||
      text.includes("ଟୋକନ") ||
      text.includes("स्लॉट") ||
      text.includes("ਸਲਾਟ") ||
      text.includes("বুক") ||
      text.includes("schedule") ||
      detectedCrop ||
      detectedWeight ||
      detectedCenter ||
      detectedDate ||
      detectedSlot
    ) {
      const updates: Partial<BookingDraft> = {};
      if (detectedCenter) {
        updates.center = detectedCenter;
        updates.centreId = detectedCentreId;
      }
      if (detectedCrop) updates.crop = detectedCrop;
      if (detectedWeight) updates.weight = detectedWeight;
      if (detectedDate) updates.date = detectedDate;
      if (detectedSlot) {
        updates.timeSlot = detectedSlot;
        updates.slotId = detectedSlotId;
      }

      startBookingFlow(updates);
      return;
    }

    // Greetings
    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("namaste") ||
      text.includes("नमस्ते") ||
      text.includes("নমস্কার") ||
      text.includes("ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ") ||
      text.includes("help") ||
      text.includes("मदद") ||
      text.includes("সাহায্য") ||
      text.includes("ਮਦਦ")
    ) {
      const response: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: l.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: l.btn_book_slot, action: () => startBookingFlow({}) },
          { label: l.btn_login_otp, action: () => promptLogin() },
          { label: l.btn_centers, action: () => handleNavigate("/centers", "Opening centers...") },
          { label: l.btn_queue, action: () => handleNavigate("/queue", "Opening queue...") },
          { label: l.btn_msp, action: () => showMspRates() },
        ],
      };
      setMessages((prev) => [...prev, response]);
      speakText(l.welcome.replace(/[*_#•]/g, ""));
      return;
    }

    // Fallback response for queries outside website scope
    const fallbackMsg: Message = {
      id: "bot-" + Date.now(),
      sender: "bot",
      text: l.fallback_out_of_scope,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: l.btn_book_slot, primary: true, action: () => startBookingFlow({}) },
        { label: l.btn_login_otp, action: () => promptLogin() },
        { label: l.btn_centers, action: () => handleNavigate("/centers", "Navigating to centers...") },
        { label: l.btn_queue, action: () => handleNavigate("/queue", "Navigating to queue...") },
        { label: l.btn_msp, action: () => showMspRates() },
      ],
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    speakText(l.fallback_out_of_scope.replace(/[*_#•]/g, ""));
  };

  return (
    <>
      {/* Floating Launcher Button with Attractive Bounce Animation */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-90 flex flex-col items-end">
        <button
          onClick={() => toggleOpenState(!isOpen)}
          className={`relative group p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isOpen
              ? "bg-slate-900 text-white border border-slate-700 hover:scale-105"
              : "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-slate-950 hover:scale-110 shadow-emerald-500/40 animate-bounce-gentle ring-4 ring-emerald-500/20"
          }`}
          aria-label="Open AI Assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="KisanMitra" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
              <span className="font-black text-xs sm:text-sm text-slate-950 tracking-tight">{loc.title}</span>
              <span className="text-base sm:text-lg">🎙️</span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Window with macOS Opening/Closing animation */}
      {isOpen && (
        <div
          className={`fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-100 w-[calc(100vw-1.5rem)] sm:w-[375px] max-h-[520px] h-[72vh] bg-slate-950/95 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 flex flex-col overflow-hidden backdrop-blur-xl origin-bottom-right transition-all ${
            isClosing ? "animate-macos-close" : "animate-macos-open"
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900/90 px-4 sm:px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <img src="/icon.svg" alt="KisanMitra" className="w-8 h-8 rounded-xl shadow-md shadow-emerald-500/20" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm leading-tight flex items-center gap-1.5">
                  {loc.title} <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">{loc.subtitle}</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">{loc.tagline}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Reset / New Chat */}
              <button
                onClick={() => {
                  bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
                  setBookingDraft(bookingDraftRef.current);
                  setMessages([getWelcomeMessage(lang)]);
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }}
                className="p-2 rounded-full bg-transparent hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-90"
                title="Restart / Clear Chat"
                aria-label="Restart chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>

              {/* Voice Readout Toggle */}
              <button
                onClick={() => {
                  const next = !voiceReply;
                  setVoiceReply(next);
                  voiceReplyRef.current = next;
                  try {
                    localStorage.setItem("kisansetu_voice_reply", String(next));
                  } catch {}
                  if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }}
                className={`p-2 rounded-full bg-transparent hover:bg-white/10 transition-all cursor-pointer active:scale-90 ${
                  voiceReply ? "text-emerald-400 hover:text-emerald-300" : "text-slate-500 hover:text-slate-300"
                }`}
                title={voiceReply ? "Voice Speech Enabled (Click to Mute)" : "Voice Speech Muted (Click to Unmute)"}
                aria-label="Toggle voice speech"
              >
                {voiceReply ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-500 text-slate-950 font-semibold rounded-br-none shadow-md shadow-emerald-500/10"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  {renderFormattedText(msg.text, msg.sender === "user")}

                  {/* Digital Ticket Preview Card inside Chat */}
                  {msg.ticket && (
                    <div className="mt-2.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl p-2.5 text-white relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                        CONFIRMED
                      </div>
                      <div className="border-b border-dashed border-slate-700 pb-1.5 mb-1.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Official Token</span>
                        <p className="text-xl font-black text-emerald-400 font-mono">#{msg.ticket.tokenNumber}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[8px]">CENTER</span>
                          <span className="text-white font-bold truncate block">{msg.ticket.center}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px]">CROP & QTY</span>
                          <span className="text-white font-bold">{msg.ticket.crop} ({msg.ticket.weight} Qtl)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px]">DATE</span>
                          <span className="text-white font-bold">{msg.ticket.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px]">TIME SLOT</span>
                          <span className="text-white font-bold">{msg.ticket.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Redirection Link Action */}
                  {msg.redirectUrl && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => {
                          router.push(msg.redirectUrl!);
                        }}
                        className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {msg.redirectLabel || "Open Page Now 🚀"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Action Options / Quick Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[95%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={opt.action}
                        className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
                          opt.primary
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black hover:scale-105"
                            : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isProcessingBooking && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-900/80 p-2.5 rounded-2xl border border-emerald-500/20 animate-pulse">
                <span className="animate-spin text-sm">⚡</span>
                Generating official token in database...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Live Wave Banner */}
          {isListening && (
            <div className="bg-emerald-500/10 border-t border-emerald-500/30 px-3.5 py-1.5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                {loc.listening_banner}
              </div>
              <div className="flex gap-1 items-center h-3">
                <span className="w-1 bg-emerald-400 h-2 animate-bounce"></span>
                <span className="w-1 bg-emerald-400 h-3 animate-bounce delay-75"></span>
                <span className="w-1 bg-emerald-400 h-2 animate-bounce delay-150"></span>
                <span className="w-1 bg-emerald-400 h-3 animate-bounce"></span>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            {/* Microphone Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                  : "bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40"
              }`}
              title={isListening ? "Stop listening" : "Click to speak"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v7.5a3 3 0 0 1-3 3Z" />
              </svg>
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              placeholder={isListening ? loc.listening_banner : loc.input_placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner placeholder:text-slate-500"
            />

            {/* Send Button with tilted dynamic paper plane arrow */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
              title="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 transform -rotate-45 translate-x-0.5 -translate-y-0.5 transition-transform group-hover:translate-x-1"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
