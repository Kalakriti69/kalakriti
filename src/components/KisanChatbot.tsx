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

const TIME_SLOTS = [
  { time: "08:00 AM - 10:00 AM", id: "11111111-aaa1-1111-1111-111111111111" },
  { time: "10:00 AM - 12:00 PM", id: "11111111-aaa2-1111-1111-111111111111" },
  { time: "12:00 PM - 02:00 PM", id: "11111111-aaa3-1111-1111-111111111111" },
  { time: "02:00 PM - 04:00 PM", id: "11111111-aaa4-1111-1111-111111111111" },
  { time: "04:00 PM - 06:00 PM", id: "11111111-aaa5-1111-1111-111111111111" },
];

export default function KisanChatbot() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

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
    setIsOpen(open);
    try {
      sessionStorage.setItem("kisansetu_chat_open", open.toString());
    } catch {}
  };

  // Persistent reference to booking state to prevent React closure staleness
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

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = getWelcomeMessage(lang);
      setMessages([welcomeMsg]);
    }
  }, [lang]);

  // Web Speech Synthesis (Text to Speech)
  const speakText = (text: string) => {
    if (!voiceReply || typeof window === "undefined" || !("speechSynthesis" in window)) return;
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
          const micMsg: Message = {
            id: "mic-err-" + Date.now(),
            sender: "bot",
            text: "🎙️ Microphone access is not allowed in browser permissions. Please allow microphone in your address bar or type your message below!",
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
    const welcomeTexts: Record<string, string> = {
      en: "Namaste! 🙏 I am **KisanMitra**, your AI Assistant. I can help you **book delivery slots**, check **live queues**, or navigate the site. Everything we do here syncs with the website in real-time!",
      hi: "नमस्ते किसान भाई! 🙏 मैं **किसान मित्र** हूँ। मैं फसल डिलीवरी स्लॉट बुक करने, लाइव कतार देखने या केंद्र ढूंढने में आपकी मदद करूँगा। जो भी आप कहेंगे, वेबसाइट तुरंत वहीं ले जाएगी!",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! 🙏 ਮੈਂ **ਕਿਸਾਨ ਮਿੱਤਰ** ਹਾਂ। ਮੈਂ ਸਲਾਟ ਬੁੱਕ ਕਰਨ ਅਤੇ ਟੋਕਨ ਲੈਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
      bn: "নমস্কার! 🙏 আমি **কিষাণমিত্র**। আপনার শস্য বুকিং এবং লাইভ টোকেন ট্র্যাক করতে সাহায্য করতে পারি।",
      or: "ନମସ୍କାର! 🙏 ମୁଁ **କିଷାନ ମିତ୍ର**। ଆପଣଙ୍କୁ ଟୋକନ ବୁକିଂ ଓ ଲାଇଭ କ୍ୟୁ ସ୍ଥିତି ଜାଣିବାରେ ସାହାଯ୍ୟ କରିବି।",
    };

    return {
      id: "welcome-1",
      sender: "bot",
      text: welcomeTexts[currentLang] || welcomeTexts.en,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: "🌾 Book a Delivery Slot", action: () => startBookingFlow({}) },
        { label: "📍 View Nearby Centers", action: () => handleNavigate("/centers", "Navigating to Procurement Centers...") },
        { label: "⚡ Check Live Queue", action: () => handleNavigate("/queue", "Opening Live Queue Tracker...") },
        { label: "💰 Today's Mandi MSP Rates", action: () => showMspRates() },
      ],
    };
  }

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
    const text = `🌾 **Current MSP Procurement Rates (2026 Season)**:\n• **Paddy (Common)**: ₹2,300 / Quintal\n• **Wheat**: ₹2,275 / Quintal\n• **Maize**: ₹2,090 / Quintal\n• **Mustard**: ₹5,650 / Quintal\n• **Barley**: ₹1,850 / Quintal\n\nAll payments are transferred directly via **DBT** within 48-72 hours!`;
    const botMsg: Message = {
      id: "msp-" + Date.now(),
      sender: "bot",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: "🌾 Book a Delivery Slot Now", action: () => startBookingFlow({}) },
        { label: "📍 Check Nearby Centers", action: () => handleNavigate("/centers", "Opening centers list...") },
      ],
    };
    setMessages((prev) => [...prev, botMsg]);
    speakText("Current MSP rate for Paddy is 2300 rupees, Wheat is 2275 rupees, Mustard is 5650 rupees per quintal.");
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
    // Update reference synchronously
    const current = { ...bookingDraftRef.current, ...updates };
    bookingDraftRef.current = current;
    setBookingDraft(current);

    // Step 1: Center
    if (!current.center) {
      syncSchedulerUrl(current, 1);
      const msg: Message = {
        id: "step-center-" + Date.now(),
        sender: "bot",
        text: "Step 1 of 4: Please choose your nearest **Procurement Center** for crop delivery (or tell me):",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: MOCK_CENTERS.map((c) => ({
          label: `📍 ${c.name} (${c.distance})`,
          action: () => selectCenter(c.name, c.id),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText("Step 1: Please select your preferred procurement center.");
      return;
    }

    // Step 2: Crop
    if (!current.crop) {
      syncSchedulerUrl(current, 2);
      const msg: Message = {
        id: "step-crop-" + Date.now(),
        sender: "bot",
        text: `📍 Center: **${current.center}** ✅\n\nStep 2 of 4: Which **crop variety** are you delivering?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: CROPS.map((crop) => ({
          label: `🌾 ${crop}`,
          action: () => selectCrop(crop),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText(`Center selected. Which crop are you bringing?`);
      return;
    }

    // Step 3: Weight
    if (!current.weight || current.weight <= 0) {
      syncSchedulerUrl(current, 2);
      const msg: Message = {
        id: "step-weight-" + Date.now(),
        sender: "bot",
        text: `🌾 Crop: **${current.crop}** ✅\n\nStep 3 of 4: What is your estimated **weight in Quintals**? (1 Qtl = 100 kg). Speak, type, or pick below:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: "10 Quintals (1,000 kg)", action: () => selectWeight(10) },
          { label: "25 Quintals (2,500 kg)", action: () => selectWeight(25) },
          { label: "35 Quintals (3,500 kg)", action: () => selectWeight(35) },
          { label: "50 Quintals (5,000 kg)", action: () => selectWeight(50) },
        ],
      };
      setMessages((prev) => [...prev, msg]);
      speakText("What is the estimated crop weight in quintals?");
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

      const msg: Message = {
        id: "step-date-" + Date.now(),
        sender: "bot",
        text: `⚖️ Weight: **${current.weight} Quintals** ✅\n\nStep 4 of 4: Select your **delivery date**:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: `📅 Today (${today})`, action: () => selectDate(today) },
          { label: `📅 Tomorrow (${tomorrow})`, action: () => selectDate(tomorrow) },
          { label: `📅 In 2 Days (${dayAfter})`, action: () => selectDate(dayAfter) },
        ],
      };
      setMessages((prev) => [...prev, msg]);
      speakText("Select your preferred delivery date.");
      return;
    }

    // Step 5: Time Slot
    if (!current.timeSlot) {
      syncSchedulerUrl(current, 3);
      const msg: Message = {
        id: "step-slot-" + Date.now(),
        sender: "bot",
        text: `📅 Date: **${current.date}** ✅\n\nFinal Step: Choose an available **arrival time window**:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: TIME_SLOTS.map((s) => ({
          label: `⏰ ${s.time}`,
          action: () => selectSlot(s.time, s.id),
        })),
      };
      setMessages((prev) => [...prev, msg]);
      speakText("Choose your arrival time slot.");
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

    const summaryText = `📋 **Booking Summary Ready!**\n\n• **Center**: ${draft.center}\n• **Crop**: ${draft.crop}\n• **Weight**: ${draft.weight} Quintals (${draft.weight * 100} kg)\n• **Date**: ${draft.date}\n• **Time Slot**: ${draft.timeSlot}\n\nReady to generate your live digital queue token?`;

    const confirmMsg: Message = {
      id: "confirm-" + Date.now(),
      sender: "bot",
      text: summaryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        {
          label: "⚡ Yes, Generate Digital Token",
          primary: true,
          action: () => executeBooking(draft),
        },
        {
          label: "🔄 Modify Details",
          action: () => {
            bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
            setBookingDraft(bookingDraftRef.current);
            startBookingFlow({});
          },
        },
      ],
    };
    setMessages((prev) => [...prev, confirmMsg]);
    speakText("Please review your booking details and click confirm to generate your official token.");
  };

  const executeBooking = async (draft: BookingDraft) => {
    if (isProcessingBooking) return;
    setIsProcessingBooking(true);

    const centreId = draft.centreId || MOCK_CENTERS[0].id;
    const slotId = draft.slotId || TIME_SLOTS[0].id;
    const farmerId = "99999999-9999-9999-9999-999999999999";

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
          crop: draft.crop || "Paddy",
          weight: draft.weight || 30,
          date: draft.date || new Date().toISOString().split("T")[0],
          timeSlot: draft.timeSlot || TIME_SLOTS[0].time,
        };

        const targetUrl = `/queue?token=${tokenNum}&center=${encodeURIComponent(ticketData.center)}`;

        const successMsg: Message = {
          id: "success-" + Date.now(),
          sender: "bot",
          text: `🎉 **Booking Confirmed! Token #${tokenNum} Generated!**\n\nYour digital token has been registered. Redirecting you to the Live Queue tracker right now...`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ticket: ticketData,
          redirectUrl: targetUrl,
          redirectLabel: `🚀 Track Token #${tokenNum} in Live Queue`,
          options: [
            {
              label: "⚡ View in Live Queue Tracker",
              primary: true,
              action: () => {
                router.push(targetUrl);
              },
            },
            {
              label: "🔄 Book Another Slot",
              action: () => {
                bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
                setBookingDraft(bookingDraftRef.current);
                startBookingFlow({});
              },
            },
          ],
        };

        setMessages((prev) => [...prev, successMsg]);
        speakText(`Booking confirmed! Token number ${tokenNum} generated. Opening live queue tracker now.`);

        // Auto-redirect webpage in sync with chat!
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
        text: `⚠️ Could not complete booking: ${err.message || "Please check server status"}.\n\nYou can also try using the manual booking scheduler.`,
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

  // Natural Language Understanding for typed & voiced commands
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

    // Process user input
    setTimeout(() => {
      processUserInput(userText.toLowerCase());
    }, 200);
  };

  const processUserInput = (text: string) => {
    // 1. Navigation Commands
    if (text.includes("center") || text.includes("kendra") || text.includes("मंडी") || text.includes("केंद्र") || text.includes("location") || text.includes("place")) {
      handleNavigate("/centers", "Taking you to the Procurement Centers list.");
      return;
    }
    if (text.includes("queue") || text.includes("line") || text.includes("wait") || text.includes("कतार") || text.includes("लाइन") || text.includes("status") || text.includes("position")) {
      handleNavigate("/queue", "Taking you to the Live Queue Status tracker.");
      return;
    }
    if (text.includes("home") || text.includes("main page") || text.includes("होम")) {
      handleNavigate("/", "Returning to the home page.");
      return;
    }
    if (text.includes("msp") || text.includes("rate") || text.includes("price") || text.includes("कीमत") || text.includes("दाम") || text.includes("भाव")) {
      showMspRates();
      return;
    }

    // 2. Direct Confirmation trigger
    if ((text.includes("yes") || text.includes("confirm") || text.includes("हाँ") || text.includes("बुक करो") || text.includes("generate")) && bookingDraftRef.current.center && bookingDraftRef.current.crop && bookingDraftRef.current.weight && bookingDraftRef.current.date && bookingDraftRef.current.timeSlot) {
      executeBooking(bookingDraftRef.current);
      return;
    }

    // 3. Direct Booking Request / Slot Parsing
    // Parse crop
    let detectedCrop: string | undefined;
    for (const crop of CROPS) {
      if (
        text.includes(crop.toLowerCase()) ||
        (crop === "Paddy" && (text.includes("धान") || text.includes("rice") || text.includes("dhan"))) ||
        (crop === "Wheat" && (text.includes("गेहूं") || text.includes("gehu") || text.includes("atta"))) ||
        (crop === "Mustard" && (text.includes("सरसों") || text.includes("sarson") || text.includes("rai"))) ||
        (crop === "Maize" && (text.includes("मक्का") || text.includes("makka") || text.includes("corn"))) ||
        (crop === "Barley" && (text.includes("जौ") || text.includes("jau")))
      ) {
        detectedCrop = crop;
        break;
      }
    }

    // Parse weight
    let detectedWeight: number | undefined;
    const weightMatch = text.match(/(\d+)\s*(quintal|qtl|kg|क्विंटल|टन|kilo)?/i);
    if (weightMatch && weightMatch[1]) {
      const parsed = parseInt(weightMatch[1], 10);
      if (parsed > 0 && parsed <= 500) {
        detectedWeight = parsed;
      }
    }

    // Parse center
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

    // Parse date
    let detectedDate: string | undefined;
    if (text.includes("today") || text.includes("आज")) {
      detectedDate = new Date().toISOString().split("T")[0];
    } else if (text.includes("tomorrow") || text.includes("कल")) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      detectedDate = tom.toISOString().split("T")[0];
    }

    // Parse slot
    let detectedSlot: string | undefined;
    let detectedSlotId: string | undefined;
    if (text.includes("8 am") || text.includes("8:00") || text.includes("morning") || text.includes("सुबह")) {
      detectedSlot = TIME_SLOTS[0].time;
      detectedSlotId = TIME_SLOTS[0].id;
    } else if (text.includes("10 am") || text.includes("10:00")) {
      detectedSlot = TIME_SLOTS[1].time;
      detectedSlotId = TIME_SLOTS[1].id;
    } else if (text.includes("12 pm") || text.includes("12:00") || text.includes("noon") || text.includes("दोपहर")) {
      detectedSlot = TIME_SLOTS[2].time;
      detectedSlotId = TIME_SLOTS[2].id;
    } else if (text.includes("2 pm") || text.includes("2:00") || text.includes("14:00")) {
      detectedSlot = TIME_SLOTS[3].time;
      detectedSlotId = TIME_SLOTS[3].id;
    } else if (text.includes("4 pm") || text.includes("4:00") || text.includes("evening") || text.includes("शाम")) {
      detectedSlot = TIME_SLOTS[4].time;
      detectedSlotId = TIME_SLOTS[4].id;
    }

    if (
      text.includes("book") ||
      text.includes("slot") ||
      text.includes("token") ||
      text.includes("टोकन") ||
      text.includes("स्लॉट") ||
      text.includes("पंजीकरण") ||
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

    // Conversational greetings
    if (text.includes("hello") || text.includes("hi") || text.includes("namaste") || text.includes("नमस्ते") || text.includes("help") || text.includes("मदद")) {
      const response: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: "Namaste! I'm here to help you. What would you like to do today? I can book slots, show centers, or track live queues.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { label: "🌾 Book a Slot & Token", action: () => startBookingFlow({}) },
          { label: "📍 View Centers", action: () => handleNavigate("/centers", "Opening centers...") },
          { label: "⚡ Track Live Queue", action: () => handleNavigate("/queue", "Opening queue...") },
          { label: "💰 View MSP Rates", action: () => showMspRates() },
        ],
      };
      setMessages((prev) => [...prev, response]);
      speakText("How can I assist you today? You can book a slot, check centers, or track live queue.");
      return;
    }

    // Fallback response with helpful actions
    const fallbackMsg: Message = {
      id: "bot-" + Date.now(),
      sender: "bot",
      text: `I understood: "${text}". Here are the quickest actions I can perform for you:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      options: [
        { label: "🌾 Book Delivery Slot", action: () => startBookingFlow({}) },
        { label: "📍 Find Nearby Centers", action: () => handleNavigate("/centers", "Navigating to centers...") },
        { label: "⚡ Live Queue Status", action: () => handleNavigate("/queue", "Navigating to queue...") },
        { label: "💰 MSP Rate Table", action: () => showMspRates() },
      ],
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    speakText("Here are quick actions you can choose from.");
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-90 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-500/30 backdrop-blur-md animate-bounce flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            🎙️ Voice & Chat Assistant
          </div>
        )}

        <button
          onClick={() => toggleOpenState(!isOpen)}
          className={`relative group p-4 rounded-full shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isOpen
              ? "bg-slate-900 text-white border border-slate-700 hover:scale-105"
              : "bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 hover:scale-110 shadow-emerald-500/30"
          }`}
          aria-label="Open AI Assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="KisanMitra" className="w-7 h-7 rounded-lg" />
              <span className="hidden sm:inline font-extrabold text-sm text-slate-950">KisanMitra</span>
              <span className="text-xl">🎙️</span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-100 w-[calc(100vw-2rem)] sm:w-[430px] max-h-[620px] h-[85vh] bg-slate-950/95 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-900/90 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/icon.svg" alt="KisanMitra" className="w-9 h-9 rounded-xl shadow-md shadow-emerald-500/20" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight flex items-center gap-1.5">
                  KisanMitra <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">Live AI Assistant</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Voice & Auto-Booking Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Reset / New Chat */}
              <button
                onClick={() => {
                  bookingDraftRef.current = { center: "", centreId: "", crop: "", weight: 0, date: "", timeSlot: "", slotId: "" };
                  setBookingDraft(bookingDraftRef.current);
                  setMessages([getWelcomeMessage(lang)]);
                }}
                className="p-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Restart / Clear Chat"
              >
                🔄
              </button>

              {/* Voice Readout Toggle */}
              <button
                onClick={() => setVoiceReply(!voiceReply)}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  voiceReply ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                }`}
                title={voiceReply ? "Voice Speech Enabled" : "Voice Speech Muted"}
              >
                {voiceReply ? "🔊" : "🔇"}
              </button>

              {/* Close Button */}
              <button
                onClick={() => toggleOpenState(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-500 text-slate-950 font-semibold rounded-br-none shadow-md shadow-emerald-500/10"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Digital Ticket Preview Card inside Chat */}
                  {msg.ticket && (
                    <div className="mt-3 bg-slate-950/90 border border-emerald-500/40 rounded-xl p-3 text-white relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">
                        CONFIRMED
                      </div>
                      <div className="border-b border-dashed border-slate-700 pb-2 mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Official Token Number</span>
                        <p className="text-2xl font-black text-emerald-400 font-mono">#{msg.ticket.tokenNumber}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[9px]">CENTER</span>
                          <span className="text-white font-bold truncate block">{msg.ticket.center}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">CROP & QTY</span>
                          <span className="text-white font-bold">{msg.ticket.crop} ({msg.ticket.weight} Qtl)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">DATE</span>
                          <span className="text-white font-bold">{msg.ticket.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">TIME SLOT</span>
                          <span className="text-white font-bold">{msg.ticket.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Redirection Link Action */}
                  {msg.redirectUrl && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          router.push(msg.redirectUrl!);
                        }}
                        className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {msg.redirectLabel || "Open Page Now 🚀"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Action Options / Quick Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={opt.action}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
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

                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isProcessingBooking && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/20 animate-pulse">
                <span className="animate-spin text-sm">⚡</span>
                Registering official slot and generating token in live database...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Live Wave Banner */}
          {isListening && (
            <div className="bg-emerald-500/10 border-t border-emerald-500/30 px-4 py-2 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                Listening to your voice... Speak now!
              </div>
              <div className="flex gap-1 items-center h-4">
                <span className="w-1 bg-emerald-400 h-2 animate-bounce"></span>
                <span className="w-1 bg-emerald-400 h-4 animate-bounce delay-75"></span>
                <span className="w-1 bg-emerald-400 h-3 animate-bounce delay-150"></span>
                <span className="w-1 bg-emerald-400 h-4 animate-bounce"></span>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            {/* Microphone Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                  : "bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40"
              }`}
              title={isListening ? "Stop listening" : "Click to speak"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v7.5a3 3 0 0 1-3 3Z" />
              </svg>
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Type or speak: 'Book Paddy slot', 'Centers'..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner placeholder:text-slate-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center"
              title="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
