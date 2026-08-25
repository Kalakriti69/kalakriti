import LandingPage from "@/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KisanSetu - Farmers Portal | Live Queue & Delivery Booking",
  description: "Check nearby procurement centers, book delivery slots, and track queue positions in real-time.",
};

export default function Home() {
  return <LandingPage />;
}
