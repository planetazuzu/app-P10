
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LoteForm } from '@/components/lote/lote-form';
import type { LoteCreateFormValues } from '@/types';
import { createLoteMock } from '@/lib/driver-data'; // Simulación

export default function NewLotePage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para crear lotes.',
        variant: 'destructive',
      });
      router.replace('/admin/lotes');
    }
  }, [user, authIsLoading, router, toast]);

  const handleCreateLote = async (data: LoteCreateFormValues) => {
    setIsSaving(true);
    try {
      // Aquí llamarías a la función que interactúa con tu backend o NocoDB
      // Por ahora, usaremos una simulación.
      const newLote = await createLoteMock({
        ...data,
        // Campos adicionales que LoteProgramado necesita pero el formulario no provee directamente
        // serviciosIds se añadirían en un paso posterior.
        // estadoLote también se gestionaría.
        destinoPrincipal: {
            id: `dest-${Date.now()}`, // ID de destino simulado
            nombre: data.destinoPrincipalNombre,
            direccion: data.destinoPrincipalDireccion,
        },
      });
      
      toast({
        title: 'Lote Creado (Simulado)',
        description: `El lote para el destino "${newLote.destinoPrincipal.nombre}" ha sido creado con ID: ${newLote.id}.`,
      });
      router.push('/admin/lotes'); 
    } catch (error) {
      console.error("Error al crear el lote:", error);
      toast({
        title: 'Error al Crear Lote',
        description: 'No se pudo crear el lote. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/lotes" passHref>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="page-title">Crear Nuevo Lote de Servicios</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Detalles del Lote</CardTitle>
          <UiCardDescription>
            Complete la información básica para crear un nuevo lote. Los servicios se asignarán posteriormente.
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </UiCardDescription>
        </CardHeader>
        <CardContent>
          <LoteForm onSubmit={handleCreateLote} isSaving={isSaving} />
        </CardContent>
      </Card>
    </div>
  );
}
