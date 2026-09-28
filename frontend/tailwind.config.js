/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FAF8F5',
          alt: '#F3EFEA',
          subtle: '#EDE8E0',
          dark: '#121210',
          darkAlt: '#1A1916',
        },
        ink: {
          DEFAULT: '#111110',
          muted: '#66635D',
          subtle: '#99958D',
          faint: '#D4CFC7',
        },
        border: {
          DEFAULT: '#E5E0D8',
          dark: '#2A2925',
          strong: '#111110',
        },
        accent: {
          DEFAULT: '#BE4B26', // editorial terracotta / rust
          dark: '#9A3A1C',
          light: '#F8ECE7',
        },
        olive: {
          DEFAULT: '#2D382E',
          light: '#EAF0EB',
        }
      },
      fontFamily: {
        display: ['Syne', 'Playfair Display', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'tighter': '-0.04em',
        'tight': '-0.02em',
        'wide-editorial': '0.15em',
        'widest-editorial': '0.25em',
      },
      fontSize: {
        '2xs': '0.65rem',
        '10xl': '9rem',
        '11xl': '11rem',
      }
    },
  },
  plugins: [],
}
