
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RequestForm } from '@/components/request/request-form';
import { useAuth } from '@/hooks/use-auth';
import type { AmbulanceRequest, UserRole } from '@/types';
import { getRequestById } from '@/lib/request-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;

  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [requestData, setRequestData] = useState<AmbulanceRequest | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authIsLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    async function fetchRequest() {
      if (!requestId) {
        toast({ title: 'Error', description: 'ID de solicitud no proporcionado.', variant: 'destructive' });
        router.push('/request-management');
        setIsLoadingData(false);
        return;
      }

      try {
        const data = await getRequestById(requestId);
        if (data) {
          // Authorization check
          const canEdit = user.role === 'admin' || 
                          user.role === 'centroCoordinador' || 
                          (user.role === 'hospital' && data.requesterId === user.id) ||
                          (user.role === 'individual' && data.requesterId === user.id);

          if (canEdit) {
            setRequestData(data);
            setIsAuthorized(true);
          } else {
            toast({ title: 'Acceso Denegado', description: 'No tiene permisos para editar esta solicitud.', variant: 'destructive' });
            router.push('/request-management');
          }
        } else {
          toast({ title: 'Error', description: 'Solicitud no encontrada.', variant: 'destructive' });
          router.push('/request-management');
        }
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo cargar la solicitud.', variant: 'destructive' });
        router.push('/request-management');
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchRequest();
  }, [requestId, user, authIsLoading, router, toast]);

  if (authIsLoading || isLoadingData) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Cargando datos de la solicitud...</p>
      </div>
    );
  }

  if (!isAuthorized || !requestData) {
    // This case should be covered by redirects in useEffect, but it's a fallback.
    return (
      <div className="rioja-container text-center py-10">
        <p className="text-red-500 text-lg">No se pudo cargar la solicitud o no tiene permisos.</p>
         <Link href="/request-management" passHref>
            <Button variant="outline" className="mt-4">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <div className="flex items-center gap-3 mb-6">
          <Link href="/request-management" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
          </Link>
          <h1 className="page-title">Editar Solicitud de Ambulancia</h1>
      </div>
      <RequestForm mode="edit" initialData={requestData} requestId={requestId} />
    </div>
  );
}
