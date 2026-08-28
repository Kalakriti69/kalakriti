import PageWrapper from "@/components/PageWrapper";
import OperatorDesk from "@/components/OperatorDesk";

export default function OperatorPage() {
  return (
    <PageWrapper>
      <div className="pt-20">
        <OperatorDesk />
      </div>
    </PageWrapper>
"use client";

import React from "react";
import StaffPortal from "@/components/StaffPortal";

export default function OperatorPage() {
  return (
    <StaffPortal
      isOpen={true}
      onClose={() => {}}
      role="operator"
      isFullScreen={true}
    />
  );
}
