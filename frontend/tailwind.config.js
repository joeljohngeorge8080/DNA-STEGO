/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:       '#030712',
          surface:  '#0d1117',
          panel:    '#111827',
          border:   '#1f2937',
          accent:   '#00ffc3',
          accentDim:'#00ffc322',
          blue:     '#3b82f6',
          blueDim:  '#3b82f622',
          red:      '#ef4444',
          text:     '#e2e8f0',
          muted:    '#6b7280',
          glow:     '#00ffc3',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0,255,195,0.15), 0 0 60px rgba(0,255,195,0.05)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.15), 0 0 60px rgba(59,130,246,0.05)',
        'glow-subtle': '0 4px 30px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':        'fadeIn 0.4s ease-out',
        'slide-in-left':  'slideInLeft 0.4s ease-out',
        'slide-in-up':    'slideInUp 0.3s ease-out',
        'scan-line':      'scanLine 2s linear infinite',
        'blink-caret':    'blinkCaret 1s step-end infinite',
        'matrix-rain':    'matrixRain 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blinkCaret: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%':      { borderColor: '#00ffc3' },
        },
        matrixRain: {
          '0%':   { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)',  opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
