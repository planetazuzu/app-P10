
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, Search, Filter, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { getAmbulances, mockAmbulances } from '@/lib/ambulance-data'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to translate types for display
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
        case 'available': return 'bg-green-500 hover:bg-green-600';
        case 'busy': return 'bg-yellow-500 hover:bg-yellow-600';
        case 'maintenance': return 'bg-orange-500 hover:bg-orange-600';
        case 'unavailable': return 'bg-red-500 hover:bg-red-600';
        default: return 'bg-gray-400 hover:bg-gray-500';
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

  useEffect(() => {
    if (!authIsLoading && user && user.role !== 'admin') {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);
  
  useEffect(() => {
    if (user && user.role === 'admin') {
        async function loadAmbulances() {
          setIsLoading(true);
          try {
            // Replace with your actual data fetching logic if not using mockAmbulances directly
            const data = await getAmbulances(); 
            setAmbulances(data);
          } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar las ambulancias.", variant: "destructive" });
          }
          setIsLoading(false);
        }
        loadAmbulances();
    }
  }, [user, toast]);

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

  const handleDelete = (id: string, name: string) => {
    // Mock deletion
    const index = mockAmbulances.findIndex(a => a.id === id);
    if (index !== -1) {
        mockAmbulances.splice(index, 1); // Remove from global mock array
        setAmbulances(prev => prev.filter(amb => amb.id !== id)); // Update local state
        toast({ title: "Ambulancia Eliminada", description: `La ambulancia "${name}" (ID: ${id}) ha sido eliminada.`});
    } else {
        toast({ title: "Error al Eliminar", description: `No se encontró la ambulancia "${name}".`, variant: "destructive"});
    }
    // In a real app, call API to delete.
  };
  
  if (authIsLoading || (!user || user.role !== 'admin')) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="rioja-container">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Skeleton className="h-10 flex-grow" />
                        <Skeleton className="h-10 w-full sm:w-[180px]" />
                        <Skeleton className="h-10 w-full sm:w-[180px]" />
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-8 w-1/6" />
                                <Skeleton className="h-8 w-1/6" />
                                <Skeleton className="h-8 w-1/6" />
                                <Skeleton className="h-8 w-1/6" />
                                <Skeleton className="h-8 w-1/6" />
                                <Skeleton className="h-8 w-1/6" />
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
        <div className="flex items-center gap-3">
            <Link href="/admin" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="page-title">Gestionar Ambulancias</h1>
        </div>
        <Link href="/admin/ambulances/new" passHref>
          <Button className="btn-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-title">Listado de Unidades</CardTitle>
          <CardDescription>Ver, editar o eliminar ambulancias del sistema.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                {ALL_AMBULANCE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
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
        <CardContent>
          {filteredAmbulances.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron ambulancias con los filtros actuales.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
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
                        <Badge variant="secondary" className="whitespace-nowrap">{getAmbulanceTypeLabel(ambulance.type)}</Badge>
                      </TableCell>
                      <TableCell>{ambulance.model || 'N/A'}</TableCell>
                      <TableCell>{ambulance.baseLocation}</TableCell>
                       <TableCell className="text-xs">
                        {ambulance.latitude && ambulance.longitude ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground"/> 
                            {`${ambulance.latitude.toFixed(3)}, ${ambulance.longitude.toFixed(3)}`}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeVariantClass(ambulance.status)} text-white text-xs`}>
                          {getAmbulanceStatusLabel(ambulance.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/ambulances/${ambulance.id}/edit`} passHref>
                          <Button variant="ghost" size="icon" className="hover:text-primary">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ambulance.id, ambulance.name)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
