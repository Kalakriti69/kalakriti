import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json({ success: false, error: "SMS verification is not configured." }, { status: 503 });
  }

  const body = new URLSearchParams({ To: parsed.data.phone, Channel: "sms" });
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const providerError = await response.json().catch(() => null) as { code?: number; message?: string } | null;
    console.error("Twilio send OTP failed:", response.status, providerError?.code);
    const error = providerError?.code === 20003
      ? "Twilio is not allowing SMS on this Trial account. Upgrade the Twilio account, then try again."
      : providerError?.code === 21608
        ? "This phone number is not verified on the Twilio Trial account. Verify it in Twilio Console, then try again."
        : "Could not send OTP. Please try again.";
    return NextResponse.json({ success: false, error }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
