
'use client';

import { ProgrammedTransportForm } from '@/components/request/programmed-transport-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NewProgrammedTransportRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Define which roles can create programmed transport requests
      // For now, assuming similar roles to simple requests or adjust as needed
      const canCreate = user.role === 'admin' || user.role === 'hospital' || user.role === 'individual';
      if (!canCreate) {
        router.replace('/dashboard'); // Or an unauthorized page
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p className="rioja-container text-center">Cargando permisos de acceso...</p>;
  }
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital' || user.role === 'individual')) {
    // Adjust roles here as needed
    return <p className="rioja-container text-center text-red-500">No tiene permiso para crear este tipo de solicitud.</p>;
  }

  return (
    <div className="rioja-container">
      <h1 className="page-title mb-8">Nueva Solicitud de Transporte</h1>
      <ProgrammedTransportForm />
    </div>
  );
}
