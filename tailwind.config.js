/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          muted: 'var(--color-primary-muted)',
        },
        dark: 'var(--color-dark)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        alert: {
          DEFAULT: 'var(--color-alert)',
          light: 'var(--color-alert-light)',
          muted: 'var(--color-alert-muted)',
          dark: 'var(--color-alert-dark)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          hover: 'var(--color-error-hover)',
          light: 'var(--color-error-light)',
          muted: 'var(--color-error-muted)',
          dark: 'var(--color-error-dark)',
        },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'sidebar-inactive': 'var(--color-sidebar-inactive)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        heading: 'var(--font-heading)',
        mono: 'var(--font-mono)',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
      },
    },
  },
  plugins: [],
};
