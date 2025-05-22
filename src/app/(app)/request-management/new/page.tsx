
'use client';

import { RequestForm } from '@/components/request/request-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function NewRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const canCreate = user.role === 'admin' || user.role === 'hospital' || user.role === 'individual' || user.role === 'centroCoordinador';
      if (!canCreate) {
        router.replace('/dashboard'); // O una página de no autorizado
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
        <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Cargando permisos de acceso...</p>
        </div>
    );
  }
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital' || user.role === 'individual' || user.role === 'centroCoordinador')) {
    return (
        <div className="rioja-container text-center py-10">
            <p className="text-red-500 text-lg">No tiene permiso para crear solicitudes.</p>
        </div>
    );
  }


  return (
    <div>
      <h1 className="page-title mb-8">Crear Nueva Solicitud de Ambulancia</h1>
      <RequestForm mode="create" />
    </div>
  );
}
