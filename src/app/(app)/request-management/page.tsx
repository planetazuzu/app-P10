
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { AmbulanceRequest, RequestStatus } from '@/types';
import { getRequests, updateRequestStatus as apiUpdateRequestStatus, getRequestById } from '@/lib/request-data';
import { RequestList } from '@/components/request/request-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { RequestDetailModal } from '@/components/request/request-detail-modal';

export default function RequestManagementPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate state for data loading
  const [selectedRequest, setSelectedRequest] = useState<AmbulanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchUserRequests = useCallback(async () => {
    if (!user) { // If no user, clear requests and stop loading
      setRequests([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const userRequests = await getRequests(user.id, user.role);
      setRequests(userRequests);
    } catch (error) {
      console.error("Error al cargar las solicitudes:", error);
      toast({ title: "Error de Carga", description: "No se pudieron cargar las solicitudes.", variant: "destructive" });
      setRequests([]); // Clear requests on error
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]); // Dependencies: user and toast

  useEffect(() => {
    // Only fetch requests when auth state is settled and user object is available.
    // fetchUserRequests will be called if authIsLoading changes to false,
    // or if fetchUserRequests itself changes (which happens if 'user' or 'toast' changes).
    if (!authIsLoading && user) {
      fetchUserRequests();
    } else if (!authIsLoading && !user) {
      // If auth is done but there's no user, ensure requests are cleared and not loading.
      setRequests([]);
      setIsLoadingData(false);
    }
  }, [authIsLoading, user, fetchUserRequests]); // Added user as a direct dependency here too


  const handleUpdateRequestStatus = async (requestId: string, status: RequestStatus) => {
    setIsLoadingData(true); // Indicate activity
    try {
      const updatedRequest = await apiUpdateRequestStatus(requestId, status);
      if (updatedRequest) {
        // Instead of manually updating, re-fetch for consistency if data could change server-side
        // For mock data, direct update is fine, but re-fetching is a good pattern
        await fetchUserRequests();
        if(selectedRequest && selectedRequest.id === requestId) {
            // If the updated request was the one in the modal, refresh modal data too
            const freshModalData = await getRequestById(requestId);
            setSelectedRequest(freshModalData || null);
        }
        toast({ title: "Estado Actualizado", description: `Solicitud ${requestId.substring(0,8)} marcada como ${translateRequestStatus(status)}.` });
      } else {
        toast({ title: "Actualización Fallida", description: "No se pudo actualizar el estado de la solicitud.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la solicitud", error);
      toast({ title: "Actualización Fallida", description: "No se pudo actualizar el estado de la solicitud.", variant: "destructive" });
    }
    setIsLoadingData(false);
  };

  // Helper function to translate status (could be moved to a utils file)
  const translateRequestStatus = (status: RequestStatus): string => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'dispatched': return 'Despachada';
      case 'on-scene': return 'En el Lugar';
      case 'transporting': return 'Transportando';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'batched': return 'En Lote';
      default: return status;
    }
  };


  const handleViewDetails = async (requestId: string) => {
    setIsLoadingData(true); // Show loading for modal content as well
    const requestData = await getRequestById(requestId);
    if (requestData) {
      setSelectedRequest(requestData);
      setIsModalOpen(true);
    } else {
      toast({ title: "Error", description: "No se pudieron cargar los detalles de la solicitud.", variant: "destructive"});
    }
    setIsLoadingData(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const canCreateRequest = user?.role === 'admin' || user?.role === 'hospital' || user?.role === 'individual' || user?.role === 'centroCoordinador';

  // Combined loading state for UI rendering
  const isLoadingPage = authIsLoading || (!user && !authIsLoading) || (user && isLoadingData && requests.length === 0) ;


  if (isLoadingPage) { // Show skeleton/loader if overall loading AND no requests are yet shown
    return (
        <div className="rioja-container">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
  }
  
  // If auth is done, user is null, then it means they shouldn't be here or are logged out.
  // AppLayout should handle redirection if !isAuthenticated. This is a fallback.
  if (!user) {
    return (
      <div className="rioja-container text-center py-10">
        <p>Usuario no autenticado o error al cargar datos del usuario.</p>
        <Link href="/login">
          <Button variant="link">Ir a inicio de sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="page-title">Gestión de Solicitudes de Ambulancia</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUserRequests} disabled={isLoadingData}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                Actualizar
            </Button>
            {canCreateRequest && (
            <Link href="/request-management/new" passHref>
                <Button className="btn-primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Solicitud
                </Button>
            </Link>
            )}
        </div>
      </div>

      <RequestList
          requests={requests}
          userRole={user.role} 
          currentUserId={user.id}
          onUpdateRequestStatus={handleUpdateRequestStatus}
          onViewDetails={handleViewDetails}
      />

      {selectedRequest && (
          <RequestDetailModal
              request={selectedRequest}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
          />
      )}
    </div>
  );
}
