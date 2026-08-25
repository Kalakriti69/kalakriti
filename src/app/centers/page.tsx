"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import ProcurementCenters from "@/components/ProcurementCenters";

export default function CentersPage() {
  const router = useRouter();

  const handleSelectCenter = (centerName: string) => {
    router.push(`/scheduler?center=${encodeURIComponent(centerName)}`);
  };

  return (
    <PageWrapper>
      <div className="pt-20">
        <ProcurementCenters onSelectCenter={handleSelectCenter} />
      </div>
    </PageWrapper>
  );
}
