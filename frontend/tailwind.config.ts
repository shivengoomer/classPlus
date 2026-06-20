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
        'classplus-bg': 'var(--classplus-bg)',
        'classplus-sidebar': 'var(--classplus-sidebar)',
        'classplus-card': 'var(--classplus-card)',
        'classplus-card-border': 'var(--classplus-card-border)',
        'classplus-text-primary': 'var(--classplus-text-primary)',
        'classplus-text-secondary': 'var(--classplus-text-secondary)',
        'classplus-text-hint': 'var(--classplus-text-hint)',
        'classplus-btn-primary': 'var(--classplus-btn-primary)',
        'classplus-orange': 'var(--classplus-orange)',
        'classplus-orange-red': 'var(--classplus-orange-red)',
        'classplus-nav-active-bg': 'var(--classplus-nav-active-bg)',
        'classplus-progress': 'var(--classplus-progress)',
        'classplus-dark-banner': 'var(--classplus-dark-banner)',
      },
    },
  },
  plugins: [],
};
export default config;
