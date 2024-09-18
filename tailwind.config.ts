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
        babyblue: {
          50: '#E6F7FF',   // Lightest baby blue
          100: '#BAE3FF',  // Lighter baby blue
          200: '#7CC1FF',  // Mid-tone baby blue
          600: '#3399FF',  // Primary baby blue (for buttons, etc.)
          700: '#1F77CC',  // Darker baby blue
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;