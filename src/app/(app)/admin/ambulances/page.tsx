
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { getAmbulances, deleteAmbulanceAPI } from '@/lib/ambulance-data';
// Input and Select are no longer directly used here, they are in AmbulanceListFilters
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

const getAmbulanceTypeLabel = (type: AmbulanceType): string => {
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

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
    switch (status) {
      case "available": return "Disponible";
      case "busy": return "Ocupada";
      case "maintenance": return "Mantenim.";
      case "unavailable": return "No Disp.";
      default: return status;
    }
};

// Updated status badge classes according to new visual guidelines
const getStatusBadgeVariantClass = (status: AmbulanceStatus) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700'; // Verde claro
        case 'busy': return 'bg-blue-100 text-blue-700'; // Azul (En ruta)
        case 'maintenance': return 'bg-yellow-100 text-yellow-800'; // Amarillo alerta
        case 'unavailable': return 'bg-red-100 text-red-800'; // Rojo suave
        default: return 'bg-gray-300 text-gray-800'; // Gris (Pendiente)
    }
}

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

  if (isLoading) {
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
                             <TableRow key={i} className="flex items-center space-x-4 p-2">
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/12 p-0 text-right"><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
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
            getAmbulanceTypeLabel={getAmbulanceTypeLabel}
            getAmbulanceStatusLabel={getAmbulanceStatusLabel}
          />
        </CardHeader>
        <CardContent className="p-0">
          {filteredAmbulances.length === 0 && !isLoading ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron ambulancias con los filtros actuales.</p>
          ) : (
            <div className="rioja-table-responsive-wrapper">
              <Table className="rioja-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Ubicación (Lat, Lon)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAmbulances.map((ambulance) => (
                    <TableRow key={ambulance.id}>
                      <TableCell className="font-medium">{ambulance.name}</TableCell>
                      <TableCell>{ambulance.licensePlate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap bg-opacity-80">{getAmbulanceTypeLabel(ambulance.type)}</Badge>
                      </TableCell>
                      <TableCell>{ambulance.model || 'N/A'}</TableCell>
                      <TableCell>{ambulance.baseLocation}</TableCell>
                       <TableCell className="text-xs">
                        {ambulance.latitude && ambulance.longitude ? (
                          <div className="flex items-center gap-1">
                            <Icons.MapPin className="h-3 w-3 text-muted-foreground"/> 
                            {`${ambulance.latitude.toFixed(3)}, ${ambulance.longitude.toFixed(3)}`}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeVariantClass(ambulance.status)} text-xs border`}>
                          {getAmbulanceStatusLabel(ambulance.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/ambulances/${ambulance.id}/edit`} passHref>
                          <Button variant="ghost" size="icon" className="hover:text-primary">
                            <Icons.Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmDialog(ambulance.id, ambulance.name)} className="hover:text-destructive">
                          <Icons.Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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

