import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vantar Bio — Precision Drug Discovery",
  description:
    "We turn molecular structure into validated drug targets, resolving the pathways behind disease so every candidate is built on evidence, not probability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
