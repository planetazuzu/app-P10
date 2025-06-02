
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { ProgrammedTransportRequest, RequestStatus } from '@/types';
import { getAllProgrammedTransportRequests, getProgrammedRequestById, updateRequestStatus as apiUpdateProgrammedRequestStatus } from '@/lib/request-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit3, PlusCircle, RefreshCw, Loader2, ArrowLeft, FileText, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgrammedRequestDetailModal } from '@/components/request/programmed-request-detail-modal';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

const PROGRAMMED_STATUS_OPTIONS: RequestStatus[] = ['pending', 'batched', 'transporting', 'completed', 'cancelled'];

// Updated status badge classes
const STATUS_BADGE_CLASSES: Record<RequestStatus, string> = {
  pending: 'bg-gray-300 text-gray-800',
  dispatched: 'bg-blue-100 text-blue-700',
  'on-scene': 'bg-yellow-100 text-yellow-800',
  transporting: 'bg-green-100 text-green-700',
  completed: 'bg-green-700 text-white',
  cancelled: 'bg-red-100 text-red-800',
  batched: 'bg-cyan-100 text-cyan-700', // Or another color for 'batched' if needed
};

const translateProgrammedRequestStatus = (status: RequestStatus): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'batched': return 'En Lote';
    case 'transporting': return 'Transportando';
    case 'completed': return 'Completado';
    case 'cancelled': return 'Cancelado';
    default: return status; 
  }
};

const translateMedioRequerido = (medio?: ProgrammedTransportRequest['medioRequerido']): string => {
    if (!medio) return 'N/A';
    switch (medio) {
        case 'camilla': return 'Camilla';
        case 'sillaDeRuedas': return 'S. Ruedas';
        case 'andando': return 'Andando';
        default: return medio;
    }
};

export default function ServicesPlanningPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [services, setServices] = useState<ProgrammedTransportRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<ProgrammedTransportRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const fetchServices = useCallback(async () => {
    if (user && ['admin', 'centroCoordinador'].includes(user.role)) {
      setIsLoadingData(true);
      try {
        const data = await getAllProgrammedTransportRequests();
        setServices(data);
      } catch (error) {
        console.error("Error al cargar servicios programados:", error);
        toast({ title: "Error de Carga", description: "No se pudieron cargar los servicios programados.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleUpdateStatus = async (serviceId: string, newStatus: RequestStatus) => {
    setIsLoadingData(true);
    try {
      const updated = await apiUpdateProgrammedRequestStatus(serviceId, newStatus);
      if (updated) {
        await fetchServices(); 
         if (selectedService && selectedService.id === serviceId) {
          const freshModalData = await getProgrammedRequestById(serviceId);
          setSelectedService(freshModalData || null);
        }
        toast({ title: "Estado Actualizado", description: `Servicio ${serviceId.substring(0,8)} marcado como ${translateProgrammedRequestStatus(newStatus)}.` });
      } else {
         toast({ title: "Error", description: "No se pudo actualizar el estado del servicio.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Fallo al actualizar el estado.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const handleViewDetails = async (serviceId: string) => {
    setIsLoadingData(true);
    const serviceData = await getProgrammedRequestById(serviceId);
    if (serviceData) {
      setSelectedService(serviceData);
      setIsModalOpen(true);
    } else {
      toast({ title: "Error", description: "No se pudieron cargar los detalles del servicio.", variant: "destructive"});
    }
    setIsLoadingData(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const filteredServices = useMemo(() => {
    return services
      .filter(service => 
        (filterStatus === 'all' || service.status === filterStatus) &&
        (searchTerm === '' ||
         service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         service.nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
         service.dniNieSsPaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
         service.centroOrigen.toLowerCase().includes(searchTerm.toLowerCase()) ||
         service.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (service.loteId && service.loteId.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => new Date(b.fechaIda + 'T' + (b.horaConsultaMedica || b.horaIda)).getTime() - new Date(a.fechaIda + 'T' + (a.horaConsultaMedica || a.horaIda)).getTime());
  }, [services, filterStatus, searchTerm]);

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const isLoadingPage = isLoadingData && services.length === 0;


  return (
    <div className="rioja-container">
      <div className="mb-6">
        <Breadcrumbs items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Gestión de Lotes', href: '/admin/lotes' },
            { label: 'Planificación de Servicios' }
        ]} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/lotes" passHref>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="page-title">Planificación de Servicios Programados</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchServices} disabled={isLoadingData}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                Actualizar
            </Button>
            <Link href="/request-management/new-programmed" passHref>
                <Button className="btn-primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Servicio Programado
                </Button>
            </Link>
        </div>
      </div>

      <Card className="rioja-card">
        <CardHeader>
          <CardTitle className="section-title">Listado de Servicios Programados</CardTitle>
          <CardDescription>Ver, filtrar y gestionar todos los servicios de transporte programado.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Buscar por paciente, ID, origen, destino, lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {PROGRAMMED_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>{translateProgrammedRequestStatus(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPage ? (
             <div className="space-y-3 mt-4">
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="flex items-center space-x-4 p-2">
                        <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-2/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-2/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-2/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell className="w-1/12 p-0 text-right"><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron servicios programados con los filtros actuales.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="text-center"><CalendarDays className="inline-block h-4 w-4 mr-1"/>Fecha/Hora Cita</TableHead>
                    <TableHead>Medio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Lote ID</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium text-xs text-primary">{service.id.substring(0,10)}...</TableCell>
                      <TableCell className="text-sm">
                          {service.nombrePaciente}
                          <div className="text-xs text-muted-foreground">{service.dniNieSsPaciente}</div>
                      </TableCell>
                      <TableCell className="text-xs">{service.centroOrigen}</TableCell>
                      <TableCell className="text-xs">{service.destino}</TableCell>
                      <TableCell className="text-xs text-center">
                        {format(parseISO(service.fechaIda), "dd/MM/yy", { locale: es })} {service.horaConsultaMedica || service.horaIda}
                      </TableCell>
                      <TableCell className="text-xs">{translateMedioRequerido(service.medioRequerido)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_BADGE_CLASSES[service.status]} text-xs font-semibold border px-2.5 py-0.5`}>
                          {translateProgrammedRequestStatus(service.status)}
                        </Badge>
                      </TableCell>
                       <TableCell className="text-xs">
                        {service.loteId ? (
                          <Link href={`/admin/lotes/${service.loteId}`} className="text-emphasis hover:underline">
                            {service.loteId.substring(0,8)}...
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(service.id)} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </DropdownMenuItem>
                            { (service.status === 'pending' || service.status === 'batched') && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={`/request-management/programmed/${service.id}/edit`}>
                                        <Edit3 className="mr-2 h-4 w-4" /> Editar
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {service.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(service.id, 'cancelled')} className="text-destructive focus:text-destructive cursor-pointer">
                                Cancelar Servicio
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

       {selectedService && (
        <ProgrammedRequestDetailModal
          request={selectedService}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
