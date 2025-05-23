
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { MOCK_USERS } from '@/lib/auth';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Contraseña simulada, no usada para lógica de inicio de sesión
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Si el usuario ya está autenticado y la carga inicial del contexto ha terminado, redirige al dashboard.
    // Esto maneja el caso de que el usuario navegue a /login estando ya logueado.
    if (isAuthenticated && !authIsLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authIsLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email);
    if (success) {
      toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
      // La redirección ahora es manejada por el useEffect de arriba,
      // que se activará cuando isAuthenticated y authIsLoading se actualicen.
    } else {
      toast({ title: "Inicio de Sesión Fallido", description: "Email inválido o usuario no encontrado.", variant: "destructive" });
    }
    setIsSubmitting(false); // Asegurar que se actualiza después de la operación asíncrona
  };

  // Muestra la pantalla de carga si el contexto de autenticación está cargando,
  // o si ya está autenticado (para dar tiempo al useEffect de redirigir).
  if (authIsLoading || (!authIsLoading && isAuthenticated)) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-2">
          <Globe className="h-12 w-12 text-primary" />
          <p className="text-xl font-semibold text-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-secondary">Gestión de Usuarios y Flota</CardTitle>
          <CardDescription>Inicia sesión para acceder a la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
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
            <Button type="submit" className="w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start text-sm text-muted-foreground">
          <p className="font-semibold">Usuarios de demostración disponibles (email):</p>
          <ul className="list-disc list-inside">
            {Object.keys(MOCK_USERS).map(mockEmail => <li key={mockEmail}>{mockEmail} (cualquier contraseña)</li>)}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
}
