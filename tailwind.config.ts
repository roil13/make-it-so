import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:     '#1A2E1C',
        surface:        '#243B2A',
        'surface-2':    '#1E3523',
        border:         '#2D5A35',
        accent:         '#48CAE4',
        'accent-hover': '#00B4D8',
        foreground:     '#E8F5E1',
        'on-accent':    '#1A2E1C',
        muted:          '#8FB89A',
        success:        '#52B788',
        danger:         '#D96250',
        water:          '#48CAE4',
        'water-hover':  '#00B4D8',
      },
      fontFamily: {
        display: ['Heebo', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
