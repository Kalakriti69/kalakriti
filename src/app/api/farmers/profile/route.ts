import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { FARMER_SESSION_COOKIE, getPhoneFromFarmerSession } from "@/lib/auth/farmer-session";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(200),
  area: z.number().positive().max(100000),
});

function getPhone(request: NextRequest) {
  try {
    return getPhoneFromFarmerSession(request.cookies.get(FARMER_SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const phone = getPhone(request);
  if (!phone) return NextResponse.json({ success: false, error: "Your session has expired." }, { status: 401 });

  const { data, error } = await createAdminClient()
    .from("farmer_profiles")
    .select("name, location, area")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("Farmer profile lookup failed:", error.message);
    const errorMessage = error.code === "PGRST205"
      ? "Farmer profiles are not set up yet. Run supabase/farmer_profiles.sql in the Supabase SQL Editor."
      : "Could not load farmer profile.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
  return NextResponse.json({ success: true, profile: data });
}

export async function POST(request: NextRequest) {
  const phone = getPhone(request);
  if (!phone) return NextResponse.json({ success: false, error: "Verify your mobile number first." }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter a valid name, location, and farm area." }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("farmer_profiles")
    .upsert({ phone, ...parsed.data }, { onConflict: "phone" })
    .select("name, location, area")
    .single();

  if (error) {
    console.error("Farmer profile save failed:", error.message);
    const errorMessage = error.code === "PGRST205"
      ? "Farmer profiles are not set up yet. Run supabase/farmer_profiles.sql in the Supabase SQL Editor."
      : "Could not save farmer profile.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
  return NextResponse.json({ success: true, profile: data });
}
