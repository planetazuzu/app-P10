
    import type { Metadata } from 'next';
    import './globals.css';
    import { AuthProvider } from '@/context/auth-context';
    import { Toaster } from "@/components/ui/toaster";

    // Asumiendo que 'Riojana Regular', 'Riojana Condensed', 'Riojana Slab' están en Google Fonts
    // ¡ESTO ES UN EJEMPLO! Reemplaza con los enlaces reales si están disponibles.
    // Si no están en Google Fonts, necesitarás usar la Opción 1 (archivos locales).

    export const metadata: Metadata = {
      title: 'Gestión de Usuarios y Flota',
      description: 'Plataforma para la Gestión de Usuarios y Flotas de Transporte',
      manifest: '/manifest.json',
      // themeColor: '#0066A1', // Definido vía CSS var --color-primary-rioja-val
      icons: {
        icon: '/images/favicon.png',
        // apple: '/apple-icon.png', // Ejemplo si tienes apple touch icon
      },
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="es" suppressHydrationWarning>
          {/*
            Si usas Google Fonts, los enlaces irían aquí:
            <head>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=NombreDeFuenteRiojanaRegular&family=NombreDeFuenteRiojanaCondensed&family=NombreDeFuenteRiojanaSlab&display=swap" rel="stylesheet" />
            </head>
          */}
          <body className="antialiased">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </body>
        </html>
      );
    }
    
        