
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Gestión de Usuarios y Flota',
  description: 'Plataforma para la Gestión de Usuarios y Flotas de Transporte',
  manifest: '/manifest.json',
  themeColor: '#0066A1',
  icons: {
    icon: '/images/favicon.png', // Actualizado para usar favicon.png desde metadata
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* El <head> manual ha sido eliminado. Next.js lo generará a partir de metadata. */}
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
