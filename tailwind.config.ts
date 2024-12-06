import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        'base': '14px',
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "sans-serif"], // Font mặc định cho toàn bộ trang
      },
    },
  },
  plugins: [],
};
export default config;
