import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahayatri — Safe multi-modal journey planner for Chennai",
  description:
    "Plan Metro, suburban rail, MTC bus, walk and auto in one Chennai journey. Compare time, cost and an explainable Safe-Route Score.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
