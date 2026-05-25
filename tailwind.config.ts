import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F0',
        blush: {
          DEFAULT: '#F9C5C5',
          light: '#FDE8E8',
          dark: '#F0A0A0',
        },
        lavender: {
          DEFAULT: '#DDD6F3',
          light: '#F0EEF9',
          dark: '#BDB3E8',
        },
        sage: {
          DEFAULT: '#C5D8C0',
          light: '#E2EEE0',
          dark: '#9DC097',
        },
        peach: {
          DEFAULT: '#FFD6B0',
          light: '#FFF0E0',
          dark: '#FFBE88',
        },
        border: '#EDE8DF',
        muted: '#8A8078',
        'warm-text': '#2D2520',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(45, 37, 32, 0.06)',
        card: '0 1px 4px rgba(45, 37, 32, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
