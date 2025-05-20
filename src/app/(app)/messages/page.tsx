'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function MessagesPage() {
  return (
    <div>
      <h1 className="page-title mb-8">Mensajes</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Centro de Comunicación</CardTitle>
          <CardDescription>
            Mensajería segura entre despacho, equipos de ambulancia y hospitales. Esta funcionalidad está actualmente en desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Funcionalidad en Desarrollo" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="communication chat"
                />
            </div>
          <MessageSquare className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            ¡Próximamente!
          </p>
          <p className="text-muted-foreground">
            Estamos trabajando arduamente para brindarle una experiencia de mensajería fluida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
