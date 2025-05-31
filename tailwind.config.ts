
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
        emphasis: {
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
  			lg: 'var(--radius-lg)', 
  			md: 'var(--radius-md)', 
  			sm: 'var(--radius-sm)'  
  		},
      fontFamily: {
        base: ['var(--font-base)'], // Referencia a la variable CSS para Riojana Regular
        condensed: ['var(--font-condensed)'], // Referencia a la variable CSS para Riojana Condensed
        slab: ['var(--font-slab)'], // Referencia a la variable CSS para Riojana Slab
      },
      fontSize: { 
        'xs': ['0.75rem', { lineHeight: '1rem' }],     
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   
        'base': ['1rem', { lineHeight: '1.5rem' }],     
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   
        '5xl': ['3rem', { lineHeight: '1' }],       
      },
      boxShadow: {
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
