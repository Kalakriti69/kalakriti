"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import ScheduleBooking from "@/components/ScheduleBooking";

function SchedulerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCenter = searchParams.get("center") || "";

  const handleBookingSuccess = (bookingDetails: any) => {
    // Extract short token from full tokenId
    const numericToken = bookingDetails.tokenId.replace(/\D/g, "");
    
    // Redirect to queue page with token and center details
    router.push(
      `/queue?token=${numericToken}&center=${encodeURIComponent(bookingDetails.center)}`
    );
  };

  return (
    <ScheduleBooking
      preselectedCenter={preselectedCenter}
      onBookingSuccess={handleBookingSuccess}
    />
  );
}

export default function SchedulerPage() {
  return (
    <PageWrapper>
      <div className="pt-20">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold">
            Loading booking options...
          </div>
        }>
          <SchedulerContent />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
