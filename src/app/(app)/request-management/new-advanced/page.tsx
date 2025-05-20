
'use client';

import { AdvancedTransportForm } from '@/components/request/advanced-transport-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NewAdvancedTransportRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Define which roles can create advanced transport requests
      // For now, assuming admin and hospital roles
      const canCreate = user.role === 'admin' || user.role === 'hospital';
      if (!canCreate) {
        router.replace('/dashboard'); // Or an unauthorized page
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p className="rioja-container text-center">Cargando permisos de acceso...</p>;
  }
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital')) {
    return <p className="rioja-container text-center text-red-500">No tiene permiso para crear este tipo de solicitud.</p>;
  }

  return (
    <div className="rioja-container">
      <h1 className="page-title mb-8">Nueva Solicitud de Transporte Avanzada</h1>
      <AdvancedTransportForm />
    </div>
  );
}
