import { NextResponse } from "next/server";
import { FARMER_SESSION_COOKIE } from "@/lib/auth/farmer-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(FARMER_SESSION_COOKIE);
  return response;
}
