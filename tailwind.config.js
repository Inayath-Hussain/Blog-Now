/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'search-url': 'url(/search.svg)'
      },
      borderRadius: {
        'half': '50%'
      },
      boxShadow: {
        'logout': '0 5px 20px -6px rgba(0, 0, 0, 0.7)',
        'info-card': '0px 2px 5px gray',
        'info-card-all-sides': '0px 0px 5px gray'
      },
      colors: {
        'navbar-bg': '#76cad4',
        'search': '#cfe7e7',
        'primary-btn': '#4ba5cd',
        'secondary-btn': '#ffefc2',
        'accent': '#f0cb5c'
      },
      gridTemplateColumns: {
        '0': '1fr 3.5fr',
        'single': '1fr'
      },
      gridTemplateRows: {
        'drafts': '1fr 0.1fr'
      },
      height: {
        'navbar': 'var(--navbar-height)'
      },
      inset: {
        'navbar': 'var(--navbar-height)'
      },
      margin: {
        'drafts-contn': '337.6px'
      },
      padding: {
        'navbar': 'var(--navbar-height)'
      },
      transitionDuration: {
        '5s': '.5s'
      },
      width: {
        'drafts-contn': '337.6px'
      }
    },
  },
  plugins: [],
}
