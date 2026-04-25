import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#00143D',
          50: '#F2F6FC',
          100: '#E1E8F5',
          200: '#B3C4E6',
          600: '#0048D7',
          700: '#003399',
          800: '#001F5C',
          900: '#00143D',
        },
        accent: '#FC6058',
        seazone: {
          bg: '#0A0E1A',
          card: '#111827',
          border: '#1F2937',
          text: '#E5E7EB',
          muted: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};

export default config;
