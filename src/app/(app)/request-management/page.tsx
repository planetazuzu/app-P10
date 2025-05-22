
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
  const { user } = useAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AmbulanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchUserRequests = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const userRequests = await getRequests(user.id, user.role);
      setRequests(userRequests);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserRequests();
  }, [fetchUserRequests]);

  const handleUpdateRequestStatus = async (requestId: string, status: RequestStatus) => {
    try {
      const updatedRequest = await apiUpdateRequestStatus(requestId, status);
      if (updatedRequest) {
        setRequests(prevRequests => 
          prevRequests.map(req => req.id === requestId ? updatedRequest : req)
        );
        toast({ title: "Estado Actualizado", description: `Solicitud ${requestId.substring(0,8)} marcada como ${status}.` });
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la solicitud", error);
      toast({ title: "Actualización Fallida", description: "No se pudo actualizar el estado de la solicitud.", variant: "destructive" });
    }
  };

  const handleViewDetails = async (requestId: string) => {
    const requestData = await getRequestById(requestId); // Fetch full request details
    if (requestData) {
      setSelectedRequest(requestData);
      setIsModalOpen(true);
    } else {
      toast({ title: "Error", description: "No se pudieron cargar los detalles de la solicitud.", variant: "destructive"});
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const canCreateRequest = user?.role === 'admin' || user?.role === 'hospital' || user?.role === 'individual' || user?.role === 'centroCoordinador';

  if (isLoading && !user) {
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
  
  return (
    <div className="rioja-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="page-title">Gestión de Solicitudes de Ambulancia</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUserRequests} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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

      {isLoading ? (
         <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Cargando solicitudes...</p>
        </div>
      ) : (
        <RequestList
            requests={requests}
            userRole={user!.role}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onViewDetails={handleViewDetails}
        />
      )}

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
