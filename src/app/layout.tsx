
    import type { Metadata } from 'next';
    import './globals.css';
    import { AuthProvider } from '@/context/auth-context';
    import { Toaster } from "@/components/ui/toaster";

    export const metadata: Metadata = {
      title: 'Gestión de Usuarios y Flota',
      description: 'Plataforma para la Gestión de Usuarios y Flotas de Transporte',
      manifest: '/manifest.json',
      themeColor: '#78BE20', // Verde Corporativo Pantone 368 C
      icons: {
        icon: '/images/favicon.png', // Actualizado para usar favicon.png
      },
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="es" suppressHydrationWarning>
          {/* No intentar cargar 'Riojana' desde Google Fonts, ya que es una fuente específica */}
          <body className="antialiased">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </body>
        </html>
      );
    }
    
        