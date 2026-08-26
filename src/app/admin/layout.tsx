import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KisanSetu - Admin Console",
  description: "Admin control panel for KisanSetu rates, hubs, and staff directory.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
