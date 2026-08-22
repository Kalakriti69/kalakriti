import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("test_connection")
      .select("*")
      .limit(1);

    // The table doesn't exist yet, which is expected.
    // We're checking that Supabase itself is reachable.
    if (error && !error.message.includes("test_connection")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Next.js can reach Supabase.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not connect to Supabase.",
      },
      { status: 500 }
    );
  }
}