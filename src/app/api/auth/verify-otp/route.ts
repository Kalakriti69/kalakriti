import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createFarmerSession, FARMER_SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/farmer-session";

const requestSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter the 6-digit OTP sent by SMS." }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json({ success: false, error: "SMS verification is not configured." }, { status: 503 });
  }

  const body = new URLSearchParams({ To: parsed.data.phone, Code: parsed.data.otp });
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const result = await response.json();

  if (!response.ok || result.status !== "approved") {
    return NextResponse.json({ success: false, error: "That OTP is invalid or expired." }, { status: 401 });
  }

  const nextResponse = NextResponse.json({ success: true });
  nextResponse.cookies.set(FARMER_SESSION_COOKIE, createFarmerSession(parsed.data.phone), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  return nextResponse;
}
