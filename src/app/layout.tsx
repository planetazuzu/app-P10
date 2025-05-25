
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Gestión de Usuarios y Flota',
  description: 'Plataforma para la Gestión de Usuarios y Flotas de Transporte',
  manifest: '/manifest.json', // Añadido para PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Añadido para PWA, tema de la barra de estado en móviles */}
        <meta name="theme-color" content="#0066A1" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
