
    import type { Metadata, Viewport } from 'next';
    import './globals.css';
    import { AuthProvider } from '@/context/auth-context';
    import { Toaster } from "@/components/ui/toaster";

    export const metadata: Metadata = {
      title: 'Gestión de Usuarios y Flota',
      description: 'Plataforma para la Gestión de Usuarios y Flotas de Transporte',
      manifest: '/manifest.json',
      // themeColor has been moved to generateViewport
      icons: {
        icon: '/images/favicon.png',
      },
    };

    export const viewport: Viewport = {
      themeColor: '#78BE20', // Verde Corporativo Pantone 368 C
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="es" suppressHydrationWarning>
          <body className="antialiased">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </body>
        </html>
      );
    }
    
        