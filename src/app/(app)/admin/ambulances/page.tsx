
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const getStatusBadgeVariantClass = (status: AmbulanceStatus) => {
    switch (status) {
        case 'available': return 'bg-primary text-primary-foreground'; // Verde corporativo
        case 'busy': return 'bg-accent text-accent-foreground'; // Amarillo de acento
        case 'maintenance': return 'bg-orange-500 text-white'; // Naranja para mantenimiento
        case 'unavailable': return 'bg-destructive text-destructive-foreground'; // Rojo corporativo
        default: return 'bg-secondary text-secondary-foreground'; // Gris corporativo
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
                    <Skeleton className="h-9 w-9 rounded-sm" /> {/* Radio 4px */}
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-36 rounded-sm" /> {/* Radio 4px */}
            </div>
            <Card className="rioja-card">
                <CardHeader className="p-0 mb-4">
                    <Skeleton className="h-8 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                     <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Skeleton className="h-10 flex-grow rounded-sm" /> {/* Radio 4px */}
                        <Skeleton className="h-10 w-full sm:w-[180px] rounded-sm" /> {/* Radio 4px */}
                        <Skeleton className="h-10 w-full sm:w-[180px] rounded-sm" /> {/* Radio 4px */}
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
        <div className="flex items-center gap-3">
            <Link href="/admin" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9 rioja-button-outline">
                    <Icons.ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="page-title">Gestionar Ambulancias</h1>
        </div>
        <Link href="/admin/ambulances/new" passHref>
          <Button className="rioja-button-primary">
            <Icons.PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva
          </Button>
        </Link>
      </div>

      <Card className="rioja-card">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="section-title">Listado de Unidades</CardTitle>
          <CardDescription>Ver, editar o eliminar ambulancias del sistema.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar por nombre, matrícula, modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as AmbulanceType | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                {ALL_AMBULANCE_TYPES.map(type => <SelectItem key={type} value={type}>{getAmbulanceTypeLabel(type)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as AmbulanceStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {ALL_AMBULANCE_STATUSES.map(status => <SelectItem key={status} value={status}>{getAmbulanceStatusLabel(status)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
                        <Badge className={`${getStatusBadgeVariantClass(ambulance.status)} text-xs`}>
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rioja-button">
              Eliminar Ambulancia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
