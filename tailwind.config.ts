import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: { 
      center: true,
      padding: {
        DEFAULT: 'var(--space-md)', 
        sm: 'var(--space-md)',      
        md: 'var(--space-lg)',    
        lg: 'var(--space-xl)',      
        xl: 'var(--space-xl)',      
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
  			primary: { // New Primary: Bright Green
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))' // Dark text on green
  			},
  			secondary: { // New Secondary: Dark Blue/Grey (for headings, etc.)
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))' // Light text on dark blue
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
        emphasis: { // Kept for other uses, not prominent in new design
  				DEFAULT: 'hsl(var(--emphasis))',
  				foreground: 'hsl(var(--emphasis-foreground))'
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
  			ring: 'hsl(var(--ring))', // Will use the new primary green for focus
  			chart: {
  				'1': 'hsl(var(--primary))',
  				'2': 'hsl(var(--secondary))',
  				'3': 'hsl(var(--accent))',
  				'4': 'hsl(var(--emphasis))',
  				'5': 'hsl(var(--destructive))'
  			},
  			sidebar: { // New sidebar specific colors
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				background: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))', // Active item background (green)
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // Active item text (dark)
  				accent: 'hsl(var(--sidebar-accent))', // Hover background
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))', // Hover text
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: { // Adjusted to match 'rounded-md' as default
  			lg: 'var(--radius-lg)',  /* 0.5rem */
  			md: 'var(--radius-md)',  /* 0.375rem (6px) */
  			sm: 'var(--radius-sm)'   /* 0.25rem (4px) */
  		},
      fontFamily: {
        base: ['var(--font-base)'],
        condensed: ['var(--font-condensed)'],
        slab: ['var(--font-slab)'],
      },
      fontSize: { 
        'xs': ['0.75rem', { lineHeight: '1rem' }],     
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   
        'base': ['1rem', { lineHeight: '1.5rem' }],     
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   /* 18px - section titles */
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     /* 24px - page titles (less bold) */
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  /* For very large titles if needed */
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   
        '5xl': ['3rem', { lineHeight: '1' }],       
      },
      boxShadow: { // Using softer shadows from new theme
        sm: 'var(--shadow-sm)', 
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        'rioja-sm': 'var(--shadow-sm)', 
        'rioja-md': 'var(--shadow-md)',
        'rioja-lg': 'var(--shadow-lg)',
      },
      screens: { 
        'sm': '576px',
        'md': '768px',
        'lg': '992px', 
        'xl': '1200px',
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
