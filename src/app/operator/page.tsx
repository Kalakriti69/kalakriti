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
