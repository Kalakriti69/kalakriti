import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KisanSetu - Operator Console",
  description: "Operator command portal for KisanSetu procurement and gate management.",
};

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
