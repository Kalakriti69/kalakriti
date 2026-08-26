import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const callNextSchema = z.object({
  centreId: z.string(),
  date: z.string(),
  counterId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = callNextSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { centreId, date, counterId } = result.data;
    const supabase = await createClient();

    // 1. Find the current PROCESSING entry and complete it
    const { data: currentProcessing, error: currentError } = await supabase
      .from("bookings")
      .select("id, processing_started_at")
      .eq("centre_id", centreId)
      .eq("booking_date", date)
      .eq("status", "processing")
      .maybeSingle();

    if (currentError) {
      throw currentError;
    }

    const now = new Date().toISOString();

    if (currentProcessing) {
      // Calculate actual processing duration for dynamic ETA
      if (currentProcessing.processing_started_at) {
        const startedAt = new Date(currentProcessing.processing_started_at).getTime();
        const completedAt = new Date(now).getTime();
        const actualDurationMinutes = Math.max(1, Math.round((completedAt - startedAt) / 60000));

        // Fetch centre to update average processing time
        const { data: centre } = await supabase
          .from("procurement_centres")
          .select("average_processing_minutes")
          .eq("id", centreId)
          .single();

        if (centre) {
          // Rolling average: give 80% weight to history, 20% to new duration
          const newAvg = Math.round((centre.average_processing_minutes * 4 + actualDurationMinutes) / 5);

          await supabase
            .from("procurement_centres")
            .update({ average_processing_minutes: newAvg })
            .eq("id", centreId);
        }
      }

      // Mark current as completed
      const { error: completeError } = await supabase
        .from("bookings")
        .update({
          status: "completed",
          completed_at: now,
        })
        .eq("id", currentProcessing.id)
        .eq("status", "processing"); // Concurrency safety

      if (completeError) {
        throw completeError;
      }
    }

    // 2. Find next eligible queue entry and atomically set to processing
    let nextBooking = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const { data: eligibleBookings, error: eligibleError } = await supabase
        .from("bookings")
        .select("id, status, token_number")
        .eq("centre_id", centreId)
        .eq("booking_date", date)
        .in("status", ["booked", "arrived", "waiting"])
        .order("token_number", { ascending: true })
        .limit(1);

      if (eligibleError) {
        throw eligibleError;
      }

      if (!eligibleBookings || eligibleBookings.length === 0) {
        // Queue is empty
        break;
      }

      const candidate = eligibleBookings[0];

      // Optimistic concurrency: try to set this specific booking to processing
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "processing",
          processing_started_at: now,
          assigned_counter: counterId || null,
        })
        .eq("id", candidate.id)
        .eq("status", candidate.status) // Fails if someone else updated it
        .select()
        .single();

      if (updateError) {
        // PGRST116 means zero rows returned (i.e. status changed before we updated)
        if (updateError.code === "PGRST116") {
          attempts++;
          continue;
        }
        throw updateError;
      }

      nextBooking = updatedBooking;
      break; // Successfully updated
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: "Queue is currently busy. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      completed: currentProcessing ? currentProcessing.id : null,
      next: nextBooking,
      message: nextBooking ? "Called next farmer" : "Queue is empty",
    });

  } catch (error) {
    console.error("Call next error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
