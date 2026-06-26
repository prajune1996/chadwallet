import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07100c",
        moss: "#10261d",
        acid: "#b8ff42",
        mint: "#44f59d",
        violet: "#9b6bff",
        ember: "#ff7d45"
      },
      boxShadow: {
        glow: "0 0 60px rgba(68, 245, 157, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
