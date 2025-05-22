
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="page-title mb-8">Configuración del Sistema</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Configurar Parámetros del Sistema</CardTitle>
          <CardDescription>
            Esta área proporcionará opciones para configurar diversos ajustes a nivel de sistema, integraciones y parámetros operativos. Esta funcionalidad está actualmente en desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
           <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Configuración del Sistema en Desarrollo" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="control panel"
                />
            </div>
          <Settings className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            ¡Configuración del Sistema Próximamente!
          </p>
          <p className="text-muted-foreground">
            Las opciones de configuración avanzada estarán disponibles aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    