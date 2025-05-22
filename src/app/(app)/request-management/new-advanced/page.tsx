
'use client';

import { AdvancedTransportForm } from '@/components/request/advanced-transport-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function NewAdvancedTransportRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const canCreate = user.role === 'admin' || user.role === 'hospital' || user.role === 'centroCoordinador';
      if (!canCreate) {
        router.replace('/dashboard'); // Or an unauthorized page
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
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital' || user.role === 'centroCoordinador')) {
    return (
         <div className="rioja-container text-center py-10">
            <p className="text-red-500 text-lg">No tiene permiso para crear este tipo de solicitud.</p>
        </div>
    );
  }

  return (
    <div className="rioja-container">
      <h1 className="page-title mb-8">Nueva Solicitud de Transporte Avanzada</h1>
      <AdvancedTransportForm />
    </div>
  );
}
