/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.jsx',
    './resources/**/*.js',
    './resources/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          700: '#1f2937',  // Made darker (was #374151)
          800: '#111827',  // Made much darker (was #1f2937)
          900: '#030712',  // Made extremely dark (was #111827)
          950: '#000000',  // Added pure black option
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-in-out both',
        'slide-in':      'slideIn 0.3s ease-out both',
        'fade-up':       'fadeUp 0.4s ease-out both',
        'draw-in':       'drawIn 0.8s ease-out both',
        // Dashboard entrance — compositor-only (transform + opacity), no layout thrash
        'enter':         'enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        drawIn: {
          '0%':   { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        // Spring-like entrance (overshoot easing in cubic-bezier)
        enter: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
