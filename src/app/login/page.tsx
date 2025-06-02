
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { MOCK_USERS } from '@/lib/auth';
import { ArrowRight } from 'lucide-react'; 
import { Icons } from '@/components/icons'; 
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !authIsLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email);
    if (success) {
      toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
      // Redirection is handled by useEffect
    } else {
      toast({ title: "Inicio de Sesión Fallido", description: "Email inválido o usuario no encontrado.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    setEmail(demoEmail); // Pre-fill email for clarity, though login uses passed email
    // Simulate password entry for demo purposes, not actually used by mockLogin
    setPassword('123456'); 
    const success = await login(demoEmail);
    if (success) {
      toast({ title: `Iniciando como ${MOCK_USERS[demoEmail]?.name || demoEmail}...`, description: "¡Bienvenido!" });
    } else {
      // Should not happen with mock users, but good to have
      toast({ title: "Error de Cuenta Demo", description: "No se pudo iniciar sesión con la cuenta demo.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  const demoAccounts = [
    { label: 'Administrador', email: 'admin@gmr.com' },
    { label: 'Centro sanitario', email: 'hospital@gmr.com' },
    { label: 'Usuario particular', email: 'individual@gmr.com' },
    { label: 'Empresa de ambulancias', email: 'coordinador@gmr.com' },
    { label: 'Ambulancia', email: 'vehiculo.AMB101@gmr.com' },
  ];


  if (authIsLoading || (!authIsLoading && isAuthenticated)) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-2">
          <Icons.Logo className="h-12 w-12 text-primary animate-pulse" data-ai-hint="logo company"/>
          <p className="text-xl font-semibold text-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Main Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-secondary">P10 - Gestión de usuarios y flota</h1>
      </div>
      
      {/* Main Content - Centered */}
      <main className="flex flex-col items-center w-full">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-secondary">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <Button type="submit" className="w-full text-base" variant="default" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm">
                ¿No tienes una cuenta?{' '}
                <Link href="#" className="font-medium text-primary hover:underline">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start pt-6 mt-6 border-t">
            <p className="text-xs text-muted-foreground mb-3">Cuentas de prueba (usar contraseña: 123456)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {demoAccounts.map(acc => (
                <Button 
                  key={acc.email} 
                  variant="outline" 
                  className="w-full justify-between text-xs sm:text-sm"
                  onClick={() => handleDemoLogin(acc.email)}
                  disabled={isSubmitting}
                >
                  {acc.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
