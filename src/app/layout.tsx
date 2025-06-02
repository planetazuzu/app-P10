
    import type { Metadata, Viewport } from 'next';
    import './globals.css';
    import { AuthProvider } from '@/context/auth-context';
    import { Toaster } from "@/components/ui/toaster";
    import { ThemeProvider } from "next-themes";

    export const metadata: Metadata = {
      title: 'P10 - Gestión de usuarios y flota',
      description: 'P10 - Plataforma para la Gestión de Usuarios y Flotas de Transporte',
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
      console.log('Renderizando RootLayout'); // Mensaje de depuración añadido
      return (
        <html lang="es" suppressHydrationWarning>
          <body className="antialiased">
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </body>
        </html>
      );
    }
    
        
