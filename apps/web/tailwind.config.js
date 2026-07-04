export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        sidebar: ['Inter', 'Open Sans', 'sans-serif'],
      },
      colors: {
        canvas: 'var(--color-canvas)',
        elevated: 'var(--color-elevated)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-fg': 'var(--color-accent-fg)',
        'accent-soft': 'var(--color-accent-soft)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        'status-ok': 'var(--color-status-ok)',
        'status-warn': 'var(--color-status-warn)',
        'status-idle': 'var(--color-status-idle)',
        'status-off': 'var(--color-status-off)',
        'status-error': 'var(--color-status-error)',
        sidebar: 'var(--color-sidebar)',
      },
      borderRadius: {
        apple: '0',
      },
    },
  },

  plugins: [],
};
