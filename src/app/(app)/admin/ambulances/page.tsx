
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { getAmbulances, deleteAmbulanceAPI } from '@/lib/ambulance-data';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AmbulanceListFilters } from '@/components/admin/ambulances/AmbulanceListFilters';
import { AmbulanceTable } from '@/components/admin/ambulances/AmbulanceTable'; // Import the new table component

// Helper functions getAmbulanceTypeLabel & getAmbulanceStatusLabel are now in AmbulanceTable.tsx
// but kept here as they are also used by AmbulanceListFilters if not passed down.
// For this example, assume AmbulanceListFilters uses them internally or they are passed.
const getAmbulanceTypeLabelForFilters = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "SVB";
    case "SVA": return "SVA";
    case "Convencional": return "Conv.";
    case "UVI_Movil": return "UVI";
    case "A1": return "A1";
    case "Programado": return "Prog.";
    case "Otros": return "Otros";
    default: return type;
  }
};

const getAmbulanceStatusLabelForFilters = (status: AmbulanceStatus): string => {
    switch (status) {
      case "available": return "Disponible";
      case "busy": return "Ocupada";
      case "maintenance": return "Mantenim.";
      case "unavailable": return "No Disp.";
      default: return status;
    }
};


export default function ManageAmbulancesPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AmbulanceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AmbulanceStatus | 'all'>('all');
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [ambulanceToDeleteId, setAmbulanceToDeleteId] = useState<string | null>(null);
  const [ambulanceToDeleteName, setAmbulanceToDeleteName] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);
  
  const fetchAmbulances = useCallback(async () => {
    if (user && ['admin', 'centroCoordinador'].includes(user.role)) {
      setIsLoading(true);
      try {
        const data = await getAmbulances(); 
        setAmbulances(data);
      } catch (error) {
        console.error("Error al cargar ambulancias:", error);
        toast({ title: "Error de Carga", description: "No se pudieron cargar las ambulancias. Verifique la consola o la configuración de la API.", variant: "destructive" });
        setAmbulances([]); 
      }
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  const filteredAmbulances = ambulances
    .filter(amb => 
      (filterType === 'all' || amb.type === filterType) &&
      (filterStatus === 'all' || amb.status === filterStatus) &&
      (searchTerm === '' || 
       amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       amb.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (amb.model && amb.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
       amb.baseLocation.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const openDeleteConfirmDialog = (id: string, name: string) => {
    setAmbulanceToDeleteId(id);
    setAmbulanceToDeleteName(name);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!ambulanceToDeleteId || !ambulanceToDeleteName) return;

    const success = await deleteAmbulanceAPI(ambulanceToDeleteId);
    if (success) {
        toast({ title: "Ambulancia Eliminada", description: `La ambulancia "${ambulanceToDeleteName}" ha sido eliminada.`});
        fetchAmbulances(); 
    } else {
        toast({ title: "Error al Eliminar", description: `No se pudo eliminar la ambulancia "${ambulanceToDeleteName}".`, variant: "destructive"});
    }
    setAmbulanceToDeleteId(null);
    setAmbulanceToDeleteName(null);
    setIsConfirmDeleteDialogOpen(false);
  };
  
  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Icons.Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Skeleton loader structure remains similar, but we simplify the table skeleton
  if (isLoading && ambulances.length === 0) {
    return (
        <div className="rioja-container">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" /> 
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" /> 
            </div>
            <Card className="rioja-card">
                <CardHeader className="p-0 mb-4">
                    <Skeleton className="h-8 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                     <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Skeleton className="h-10 flex-grow rounded-lg" /> 
                        <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg" /> 
                        <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg" /> 
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex items-center space-x-4 p-2 border-b">
                                <div className="w-1/6"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/6"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/12"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/6"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/6"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/6"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/12"><Skeleton className="h-8 w-full" /></div>
                                <div className="w-1/12 text-right"><Skeleton className="h-8 w-full" /></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="rioja-container">
       <div className="flex items-center justify-between mb-6">
        <Breadcrumbs items={[
            { label: 'Administración', href: '/admin' },
            { label: 'Ambulancias' }
        ]} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <Link href="/admin" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <Icons.ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="page-title">Gestionar Ambulancias</h1>
        </div>
        <Link href="/admin/ambulances/new" passHref>
          <Button className="btn-primary">
            <Icons.PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva
          </Button>
        </Link>
      </div>

      <Card className="rioja-card">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="section-title">Listado de Unidades</CardTitle>
          <CardDescription>Ver, editar o eliminar ambulancias del sistema.</CardDescription>
          <AmbulanceListFilters
            searchTerm={searchTerm}
            filterType={filterType}
            filterStatus={filterStatus}
            onSearchTermChange={setSearchTerm}
            onFilterTypeChange={setFilterType}
            onFilterStatusChange={setFilterStatus}
            allAmbulanceTypes={ALL_AMBULANCE_TYPES}
            allAmbulanceStatuses={ALL_AMBULANCE_STATUSES}
            getAmbulanceTypeLabel={getAmbulanceTypeLabelForFilters}
            getAmbulanceStatusLabel={getAmbulanceStatusLabelForFilters}
          />
        </CardHeader>
        <CardContent className="p-0">
          <AmbulanceTable
            ambulances={filteredAmbulances}
            isLoading={isLoading}
            onDeleteAmbulance={openDeleteConfirmDialog}
          />
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar la ambulancia "{ambulanceToDeleteName || ''}" (ID: {ambulanceToDeleteId || ''})? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setAmbulanceToDeleteId(null); setAmbulanceToDeleteName(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Eliminar Ambulancia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
