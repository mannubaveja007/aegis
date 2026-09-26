import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aegis — Refund Fraud Defense Agent",
  description: "An AI Business Operator Agent that defends itself while it works",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
