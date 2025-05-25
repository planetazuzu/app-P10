
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { LoteProgramado, RutaCalculada, ParadaRuta, Ambulance } from '@/types';
import { getLoteByIdMock, getRutaCalculadaByLoteIdMock } from '@/lib/driver-data';
import { getAmbulanceById, getAmbulances } from '@/lib/ambulance-data'; // Usar getAmbulances para el selector
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Waypoints, AlertTriangle, Ambulance as AmbulanceIcon, User, Clock, MapPin, Edit, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const translateParadaStatus = (status: ParadaRuta['estado']): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'enRutaRecogida': return 'En ruta (Recogida)';
    case 'pacienteRecogido': return 'Paciente Recogido';
    case 'enDestino': return 'En Destino';
    case 'finalizado': return 'Finalizado';
    case 'cancelado': return 'Cancelado';
    case 'noPresentado': return 'No Presentado';
    default: return status;
  }
};

const getStatusBadgeVariant = (status: ParadaRuta['estado']) => {
  switch (status) {
    case 'pendiente': return 'bg-gray-400 hover:bg-gray-500';
    case 'finalizado': return 'bg-green-500 hover:bg-green-600';
    case 'cancelado': return 'bg-red-500 hover:bg-red-600';
    default: return 'bg-blue-500 hover:bg-blue-600';
  }
};

const getLoteStatusLabel = (status: LoteProgramado['estadoLote']): string => {
  switch (status) {
    case 'pendienteCalculo': return 'Pendiente Cálculo';
    case 'calculado': return 'Calculado';
    case 'asignado': return 'Asignado';
    case 'enCurso': return 'En Curso';
    case 'completado': return 'Completado';
    case 'modificado': return 'Modificado';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

export default function LoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loteId = params.loteId as string;
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [lote, setLote] = useState<LoteProgramado | null>(null);
  const [ruta, setRuta] = useState<RutaCalculada | null>(null);
  const [assignedAmbulance, setAssignedAmbulance] = useState<Ambulance | null>(null);
  const [allAmbulances, setAllAmbulances] = useState<Ambulance[]>([]); // Para el selector
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAmbulance, setIsSubmittingAmbulance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmbulanceToAssign, setSelectedAmbulanceToAssign] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para ver detalles de lotes.',
        variant: 'destructive',
      });
      router.replace('/admin/lotes');
      return;
    }

    async function loadAllAmbulances() {
        try {
            const ambData = await getAmbulances(); // Carga todas para el selector
            setAllAmbulances(ambData);
        } catch (e) {
            console.error("Error loading all ambulances for select:", e);
            toast({ title: "Error", description: "No se pudieron cargar las ambulancias disponibles para asignación.", variant: "destructive"});
        }
    }

    if (user && ['admin', 'centroCoordinador'].includes(user.role)) {
        loadAllAmbulances();
    }

    if (user && ['admin', 'centroCoordinador'].includes(user.role) && loteId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedLote = await getLoteByIdMock(loteId); 
          if (!fetchedLote) {
            setError("No se encontró el lote o no tiene permisos para verlo.");
            setLote(null); setRuta(null); setAssignedAmbulance(null);
            setIsLoading(false);
            return;
          }
          setLote(fetchedLote);
          setSelectedAmbulanceToAssign(fetchedLote.ambulanciaIdAsignada);

          if (fetchedLote.rutaCalculadaId) {
            const fetchedRuta = await getRutaCalculadaByLoteIdMock(fetchedLote.id, fetchedLote.rutaCalculadaId);
            setRuta(fetchedRuta || null);
          } else {
            setRuta(null);
          }
          
          if (fetchedLote.ambulanciaIdAsignada) {
            const ambData = await getAmbulanceById(fetchedLote.ambulanciaIdAsignada);
            setAssignedAmbulance(ambData || null);
          } else {
            setAssignedAmbulance(null);
          }

        } catch (e) {
          console.error("Error fetching lote details:", e);
          setError("Error al cargar los datos del lote.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loteId, user, authIsLoading, router, toast]);

  const handleOptimizarRuta = () => {
    toast({ title: "Optimizar Ruta (Simulado)", description: "En un sistema real, esto llamaría a un flujo de IA/Genkit para calcular la ruta óptima y se guardaría en la BBDD."});
    if (ruta) {
        setRuta(prev => prev ? {...prev, optimizadaEn: new Date().toISOString(), duracionTotalEstimadaMin: prev.duracionTotalEstimadaMin - 10 } : null);
        setLote(prev => prev ? {...prev, estadoLote: 'calculado'} : null);
    }
  };

  const handleGestionAmbulancia = async () => {
    if (!lote) return;
    setIsSubmittingAmbulance(true);

    // Simulación: En una app real, aquí harías una llamada a la API para actualizar el lote.
    // Por ejemplo: await updateLoteAmbulance(lote.id, selectedAmbulanceToAssign === "unassign" ? null : selectedAmbulanceToAssign);

    if (selectedAmbulanceToAssign === "unassign") {
      setLote(prev => prev ? { ...prev, ambulanciaIdAsignada: undefined, estadoLote: 'calculado' } : null);
      setAssignedAmbulance(null);
      setSelectedAmbulanceToAssign(undefined);
      toast({ title: "Ambulancia Desasignada (Simulado)", description: `La ambulancia ha sido desasignada del lote ${lote.id}.` });
    } else if (selectedAmbulanceToAssign) {
      try {
        const ambData = await getAmbulanceById(selectedAmbulanceToAssign);
        if (ambData) {
          setLote(prev => prev ? { ...prev, ambulanciaIdAsignada: selectedAmbulanceToAssign, estadoLote: 'asignado' } : null);
          setAssignedAmbulance(ambData);
          toast({ title: "Ambulancia Asignada (Simulado)", description: `Ambulancia ${ambData.name} asignada al lote ${lote.id}.` });
        } else {
           toast({ title: "Error", description: "Ambulancia seleccionada no encontrada.", variant: "destructive"});
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar la información de la ambulancia.", variant: "destructive"});
      }
    } else {
      toast({ title: "Selección Requerida", description: "Por favor, seleccione una ambulancia para asignar o elija desasignar.", variant: "destructive"});
    }
    setIsSubmittingAmbulance(false);
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando detalles del lote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rioja-container">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-destructive">Error al Cargar Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant="outline" onClick={() => router.push('/admin/lotes')} className="mt-6">Volver al Listado</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lote) {
     return (
      <div className="rioja-container">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-destructive">Lote no Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudo encontrar la información para el lote especificado.</p>
            <Button variant="outline" onClick={() => router.push('/admin/lotes')} className="mt-6">Volver al Listado</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const availableAmbulancesForAssignment = allAmbulances.filter(a => a.status === 'available' || a.id === lote.ambulanciaIdAsignada);

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/lotes" passHref>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="page-title">Detalle Lote: {lote.id}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="section-title">Información del Lote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>ID Lote:</strong> {lote.id}</p>
              <p><strong>Fecha Servicio:</strong> {format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPP", { locale: es })}</p>
              <p><strong>Destino Principal:</strong> {lote.destinoPrincipal.nombre}</p>
              <p><strong>Estado:</strong> <Badge variant="secondary" className="capitalize">{getLoteStatusLabel(lote.estadoLote)}</Badge></p>
              <p><strong>Servicios en Lote:</strong> {lote.serviciosIds.length}</p>
              {lote.notasLote && <p><strong>Notas:</strong> {lote.notasLote}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">Gestión de Ambulancia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedAmbulance ? (
                <div className="p-3 bg-primary/10 rounded-md border border-primary/30">
                  <p className="font-semibold text-primary flex items-center gap-2"><AmbulanceIcon className="h-5 w-5"/>{assignedAmbulance.name} ({assignedAmbulance.licensePlate})</p>
                  <p className="text-xs text-muted-foreground ml-7">Tipo: {assignedAmbulance.type} | Estado: {assignedAmbulance.status}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md text-center">Ninguna ambulancia asignada.</p>
              )}
              <Select 
                value={selectedAmbulanceToAssign || (lote.ambulanciaIdAsignada ? lote.ambulanciaIdAsignada : '')} 
                onValueChange={setSelectedAmbulanceToAssign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ambulancia..." />
                </SelectTrigger>
                <SelectContent>
                  {assignedAmbulance && <SelectItem value="unassign"><Unlink className="inline-block mr-2 h-4 w-4 text-destructive"/>Desasignar Ambulancia Actual</SelectItem>}
                  {!assignedAmbulance && <SelectItem value="" disabled>Seleccionar ambulancia...</SelectItem>}
                  {availableAmbulancesForAssignment.map(amb => (
                    <SelectItem key={amb.id} value={amb.id} disabled={amb.status !== 'available' && amb.id !== lote.ambulanciaIdAsignada}>
                      {amb.name} ({amb.licensePlate}) - {amb.type} {amb.status !== 'available' && amb.id !== lote.ambulanciaIdAsignada ? `(${getLoteStatusLabel(amb.status as any)})` : ''}
                    </SelectItem>
                  ))}
                   {availableAmbulancesForAssignment.length === 0 && !assignedAmbulance && <SelectItem value="" disabled>No hay ambulancias disponibles</SelectItem>}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGestionAmbulancia} 
                className="w-full btn-secondary" 
                disabled={isSubmittingAmbulance || !selectedAmbulanceToAssign || (selectedAmbulanceToAssign === lote.ambulanciaIdAsignada && selectedAmbulanceToAssign !== "unassign")}
              >
                {isSubmittingAmbulance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (selectedAmbulanceToAssign === "unassign" ? <Unlink className="mr-2 h-4 w-4" /> : <AmbulanceIcon className="mr-2 h-4 w-4" />)}
                {isSubmittingAmbulance ? "Procesando..." : (selectedAmbulanceToAssign === "unassign" ? "Confirmar Desasignación" : "Confirmar Asignación / Cambio")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="section-title">Ruta Calculada</CardTitle>
                <Button onClick={handleOptimizarRuta} variant="outline" className="btn-outline">
                  <Waypoints className="mr-2 h-4 w-4" /> Optimizar Ruta (Simulado)
                </Button>
              </div>
               {ruta && ruta.optimizadaEn && (
                 <CardDescription className="text-xs mt-1">
                    Optimizada el: {format(parseISO(ruta.optimizadaEn), "Pp", { locale: es })}
                 </CardDescription>
                )}
            </CardHeader>
            <CardContent>
              {ruta ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-muted rounded-md">
                      <p><strong>Salida Base:</strong> {ruta.horaSalidaBaseEstimada}</p>
                      <p><strong>Duración Total:</strong> {ruta.duracionTotalEstimadaMin} min</p>
                      <p><strong>Distancia:</strong> {ruta.distanciaTotalEstimadaKm || 'N/A'} km</p>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-secondary mt-4 mb-2">Paradas de la Ruta ({ruta.paradas.length})</h3>
                  <div className="max-h-[500px] overflow-y-auto pr-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Recogida</TableHead>
                          <TableHead>Cita</TableHead>
                          <TableHead>Llegada</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ruta.paradas.sort((a,b) => a.orden - b.orden).map(parada => (
                          <TableRow key={parada.servicioId}>
                            <TableCell>{parada.orden}</TableCell>
                            <TableCell>
                                <div className="font-medium">{parada.paciente.nombre}</div>
                                <div className="text-xs text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1"/>{parada.paciente.direccionOrigen}</div>
                            </TableCell>
                            <TableCell><Clock className="w-3 h-3 mr-1 inline-block"/>{parada.horaRecogidaEstimada}</TableCell>
                            <TableCell>{parada.horaConsultaMedica}</TableCell>
                            <TableCell><Clock className="w-3 h-3 mr-1 inline-block"/>{parada.horaLlegadaDestinoEstimada}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeVariant(parada.estado)} text-white text-xs`}>
                                {translateParadaStatus(parada.estado)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/request-management/programmed/${parada.servicioId}/edit`} passHref>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" title="Editar Servicio">
                                      <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No hay una ruta calculada para este lote aún. Pulse "Optimizar Ruta".</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
