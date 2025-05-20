
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { AmbulanceRequest, RequestStatus } from '@/types'; // Actualizado a AmbulanceRequest
import { getRequests, updateRequestStatus as apiUpdateRequestStatus } from '@/lib/request-data';
import { RequestList } from '@/components/request/request-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
// Modal for viewing request details (optional - could be a new page)
// import { RequestDetailModal } from '@/components/request/request-detail-modal'; 

export default function RequestManagementPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]); // Actualizado a AmbulanceRequest
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
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

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    // Implement modal display logic or navigate to a detail page:
    // router.push(`/request-management/${requestId}`);
    toast({ title: "Ver Detalles", description: `(Simulado) Viendo detalles para la solicitud ${requestId.substring(0,8)}...` });
  };

  const canCreateRequest = user?.role === 'admin' || user?.role === 'hospital' || user?.role === 'individual';

  if (isLoading && !user) {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="page-title">Gestión de Solicitudes de Ambulancia</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUserRequests} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
            </Button>
            {canCreateRequest && (
            <Link href="/request-management/new" passHref>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Solicitud
                </Button>
            </Link>
            )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <RequestList
            requests={requests}
            userRole={user!.role}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onViewDetails={handleViewDetails}
        />
      )}

      {/* 
        Optional: Modal for request details 
        {selectedRequestId && (
            <RequestDetailModal 
                requestId={selectedRequestId} 
                isOpen={!!selectedRequestId} 
                onClose={() => setSelectedRequestId(null)} 
            />
        )} 
      */}
    </div>
  );
}
