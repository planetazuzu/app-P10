
'use client';

import { RequestForm } from '@/components/request/request-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NewRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const canCreate = user.role === 'admin' || user.role === 'hospital' || user.role === 'individual';
      if (!canCreate) {
        router.replace('/dashboard'); // O una página de no autorizado
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p className="rioja-container text-center">Cargando permisos de acceso...</p>;
  }
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital' || user.role === 'individual')) {
    return <p className="rioja-container text-center text-red-500">No tiene permiso para crear solicitudes.</p>;
  }


  return (
    <div>
      <h1 className="page-title mb-8">Crear Nueva Solicitud de Ambulancia</h1>
      <RequestForm mode="create" />
    </div>
  );
}
