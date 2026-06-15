import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahayatri - Safe Multi-Modal Journey Planner for Chennai",
  description:
    "Compare Metro, MTC bus and last-mile options across Chennai, then pick the safest route with an AI Safe-Route Score.",
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
