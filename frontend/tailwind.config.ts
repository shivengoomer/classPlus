import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'veda-bg': 'var(--veda-bg)',
        'veda-sidebar': 'var(--veda-sidebar)',
        'veda-card': 'var(--veda-card)',
        'veda-card-border': 'var(--veda-card-border)',
        'veda-text-primary': 'var(--veda-text-primary)',
        'veda-text-secondary': 'var(--veda-text-secondary)',
        'veda-text-hint': 'var(--veda-text-hint)',
        'veda-btn-primary': 'var(--veda-btn-primary)',
        'veda-orange': 'var(--veda-orange)',
        'veda-orange-red': 'var(--veda-orange-red)',
        'veda-nav-active-bg': 'var(--veda-nav-active-bg)',
        'veda-progress': 'var(--veda-progress)',
        'veda-dark-banner': 'var(--veda-dark-banner)',
      },
    },
  },
  plugins: [],
};
export default config;
