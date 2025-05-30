
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: { // Para .rioja-container si se usa @apply container
      center: true,
      padding: {
        DEFAULT: '1rem', // Corresponde a --space-md (16px)
        sm: '1rem',      // 576px+
        md: '1.5rem',    // 768px+ (corresponde a --space-lg)
        lg: '2rem',      // 992px+ (corresponde a --space-xl)
        xl: '2rem',      // 1200px+
      },
    },
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: {
          DEFAULT: 'hsl(var(--input))',
          border: 'hsl(var(--input-border))'
        },
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius-lg)', // 0.5rem o 8px
  			md: 'var(--radius-md)', // 0.375rem o 6px
  			sm: 'var(--radius-sm)'  // 0.25rem o 4px
  		},
      fontFamily: {
        base: ['var(--font-base)', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
        slab: ['var(--font-slab)', 'serif'],
      },
      fontSize: { // Escala de fuentes (ejemplo, Tailwind ya tiene una buena escala)
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',    // 14px (tu sm)
        'base': '1rem',      // 16px (tu base)
        'lg': '1.125rem',    // 18px
        'xl': '1.25rem',     // 20px (tu lg)
        '2xl': '1.5rem',     // 24px (tu xl)
        '3xl': '1.875rem',   // 30px
        '4xl': '2.25rem',    // 36px (tu 2xl)
        '5xl': '3rem',       // 48px (tu 3xl)
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // --shadow-sm
        md: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)', // Sombra suave por defecto de Tailwind, ajustable
        lg: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)', // Sombra más grande, ajustable
        'rioja-sm': 'var(--shadow-sm)', // Para usar tus sombras exactas si es necesario
        'rioja-md': 'var(--shadow-md)',
        'rioja-lg': 'var(--shadow-lg)',
      },
      screens: { // Breakpoints
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        // '2xl': '1536px', // Tailwind default, puedes mantenerlo o quitarlo
      },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
