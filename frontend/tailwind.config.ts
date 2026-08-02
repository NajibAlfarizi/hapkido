import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hapkido: {
          red: "#E63946",
          redDark: "#C1121F",
          navy: "#1D3557",
          blue: "#457B9D",
          lightBlue: "#A8DADC",
          gold: "#F4A261",
          goldDark: "#E76F51",
          brightBg: "#F8FAFC",
          cardBg: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0, 0, 0, 0.04)",
        cardHover: "0 12px 35px rgba(29, 53, 87, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
