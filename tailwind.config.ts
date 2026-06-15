import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        brand: "#1A56DB",
        teal: "#12B786",
        ink: "#1F2937",
        muted: "#5B6B7F",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(11, 31, 58, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
