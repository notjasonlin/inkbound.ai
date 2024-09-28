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
          100: '#CAF0F8',  // Light baby blue
          200: '#ADE8F4',  // Slightly darker
          300: '#90E0EF',  // Mid baby blue
          400: '#48CAE4',  // Darker baby blue
          500: '#00B4D8',  // Baby blue (main shade)
          600: '#0096C7',  // Darker shade of baby blue
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