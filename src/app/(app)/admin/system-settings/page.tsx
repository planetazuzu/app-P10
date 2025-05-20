'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import Image from 'next/image';

export default function SystemSettingsPage() {
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
