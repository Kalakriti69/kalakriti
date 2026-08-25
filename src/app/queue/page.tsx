"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import LiveQueue from "@/components/LiveQueue";

function QueueContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const center = searchParams.get("center") || "";

  const mockBooking = token && center ? {
    center,
    tokenId: `KS-${token}`,
    crop: "Paddy",
    weight: 30,
    date: "",
    timeSlot: "",
  } : null;

  return <LiveQueue activeBooking={mockBooking} />;
}

export default function QueuePage() {
  return (
    <PageWrapper>
      <div className="pt-20">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold">
            Connecting to live queue servers...
          </div>
        }>
          <QueueContent />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
