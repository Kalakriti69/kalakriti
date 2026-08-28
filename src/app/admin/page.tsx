"use client";

import React from "react";
import StaffPortal from "@/components/StaffPortal";

export default function AdminPage() {
  return (
    <StaffPortal
      isOpen={true}
      onClose={() => {}}
      role="admin"
      isFullScreen={true}
    />
  );
}
