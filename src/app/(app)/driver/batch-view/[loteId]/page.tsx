
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { LoteProgramado, RutaCalculada, ParadaRuta, Ambulance } from '@/types';
import { getLoteByIdMock, getRutaCalculadaByLoteIdMock, updateParadaEstadoMock } from '@/lib/driver-data'; // To be created
import { getAmbulanceById } from '@/lib/ambulance-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MapPin, Clock, User, ChevronsRight, CheckCircle, PlayCircle, PauseCircle, SkipForward, Ban, HelpCircle, UserX } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Helper to translate parada status
const translateParadaStatus = (status: ParadaRuta['estado']): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'enRutaRecogida': return 'En ruta a recogida';
    case 'pacienteRecogido': return 'Paciente recogido';
    case 'enDestino': return 'En destino';
    case 'finalizado': return 'Finalizado';
    case 'cancelado': return 'Cancelado';
    case 'noPresentado': return 'No Presentado';
    default: return status;
  }
};

const getStatusBadgeVariant = (status: ParadaRuta['estado']) => {
  switch (status) {
    case 'pendiente': return 'bg-gray-400 hover:bg-gray-500';
    case 'enRutaRecogida': return 'bg-blue-500 hover:bg-blue-600';
    case 'pacienteRecogido': return 'bg-purple-500 hover:bg-purple-600';
    case 'enDestino': return 'bg-teal-500 hover:bg-teal-600';
    case 'finalizado': return 'bg-green-500 hover:bg-green-600';
    case 'cancelado': return 'bg-red-500 hover:bg-red-600';
    case 'noPresentado': return 'bg-orange-500 hover:bg-orange-600';
    default: return 'bg-slate-500 hover:bg-slate-600';
  }
};

const ParadaCard: React.FC<{ parada: ParadaRuta; loteId: string; onUpdateStatus: (servicioId: string, newStatus: ParadaRuta['estado']) => void; isCurrent: boolean }> = ({ parada, loteId, onUpdateStatus, isCurrent }) => {
  const { toast } = useToast();
  
  const handleStatusChange = (newStatus: ParadaRuta['estado']) => {
    onUpdateStatus(parada.servicioId, newStatus);
    toast({ title: "Estado Actualizado", description: `Servicio ${parada.servicioId.slice(0,8)} marcado como ${translateParadaStatus(newStatus)}.` });
  };

  const canStart = parada.estado === 'pendiente';
  const canPickup = parada.estado === 'enRutaRecogida';
  const canCompleteLeg = parada.estado === 'pacienteRecogido';
  const canFinalize = parada.estado === 'enDestino';
  const isActionable = ['pendiente', 'enRutaRecogida', 'pacienteRecogido', 'enDestino'].includes(parada.estado);

  return (
    <Card className={`mb-4 ${isCurrent ? 'border-primary ring-2 ring-primary shadow-lg' : 'opacity-80 hover:opacity-100'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-secondary">Parada {parada.orden}: {parada.paciente.nombre}</CardTitle>
            <CardDescription>Servicio ID: {parada.servicioId.slice(0,8)}... | Cita: {parada.horaConsultaMedica}</CardDescription>
          </div>
          <Badge className={`${getStatusBadgeVariant(parada.estado)} text-white text-xs`}>{translateParadaStatus(parada.estado)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Origen:</strong> {parada.paciente.direccionOrigen}</div>
        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Recogida Estimada:</strong> {parada.horaRecogidaEstimada} | <strong>Llegada Destino Estimada:</strong> {parada.horaLlegadaDestinoEstimada}</div>
        {parada.paciente.contacto && <div className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Contacto:</strong> {parada.paciente.contacto}</div>}
        {parada.paciente.observaciones && <p className="text-xs text-muted-foreground pl-6">Observaciones Paciente: {parada.paciente.observaciones}</p>}
         {parada.notasParada && <p className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded pl-6">Notas Parada: {parada.notasParada}</p>}

        {isActionable && isCurrent && (
          <div className="pt-3 border-t mt-3 flex flex-wrap gap-2">
            {canStart && <Button size="sm" onClick={() => handleStatusChange('enRutaRecogida')} className="btn-primary"><PlayCircle className="mr-1"/> Iniciar Ruta a Recogida</Button>}
            {canPickup && <Button size="sm" onClick={() => handleStatusChange('pacienteRecogido')} className="bg-purple-600 hover:bg-purple-700 text-white"><User className="mr-1"/> Paciente Recogido</Button>}
            {canCompleteLeg && <Button size="sm" onClick={() => handleStatusChange('enDestino')} className="bg-teal-600 hover:bg-teal-700 text-white"><ChevronsRight className="mr-1"/> En Destino</Button>}
            {canFinalize && <Button size="sm" onClick={() => handleStatusChange('finalizado')} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="mr-1"/> Finalizar Servicio</Button>}
            <DropdownMenuStatus parada={parada} onStatusChange={handleStatusChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DropdownMenuStatus: React.FC<{ parada: ParadaRuta; onStatusChange: (newStatus: ParadaRuta['estado']) => void }> = ({ parada, onStatusChange }) => {
  const nonSequentialStates: ParadaRuta['estado'][] = ['noPresentado', 'cancelado'];
  return (
    <details className="relative group">
        <summary className="list-none">
            <Button variant="outline" size="sm">Otras Acciones <HelpCircle className="ml-1 w-4 h-4"/></Button>
        </summary>
        <div className="absolute z-10 mt-1 right-0 bg-card border rounded shadow-lg p-2 space-y-1 hidden group-open:block w-48">
            {nonSequentialStates.map(status => (
                <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => onStatusChange(status)}
                >
                    {status === 'noPresentado' ? <UserX className="mr-2 h-3.5 w-3.5"/> : <Ban className="mr-2 h-3.5 w-3.5"/>}
                    Marcar como {translateParadaStatus(status)}
                </Button>
            ))}
        </div>
    </details>
  );
};


export default function DriverBatchViewPage() {
  const router = useRouter();
  const params = useParams();
  const loteId = params.loteId as string;
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [lote, setLote] = useState<LoteProgramado | null>(null);
  const [ruta, setRuta] = useState<RutaCalculada | null>(null);
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && user && user.role !== 'equipoMovil') {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
      return;
    }

    if (user && user.role === 'equipoMovil' && loteId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedLote = await getLoteByIdMock(loteId, user.id);
          if (!fetchedLote) {
            setError("No se encontró el lote asignado o no tiene permisos para verlo.");
            setLote(null);
            setRuta(null);
            setAmbulance(null);
            setIsLoading(false);
            return;
          }
          setLote(fetchedLote);

          if (fetchedLote.rutaCalculadaId) {
            const fetchedRuta = await getRutaCalculadaByLoteIdMock(fetchedLote.id, fetchedLote.rutaCalculadaId);
            setRuta(fetchedRuta || null);
            if(!fetchedRuta) console.warn("No se encontró la ruta calculada para el lote:", fetchedLote.id);
          } else {
            setRuta(null);
            console.warn("El lote no tiene una ruta calculada ID asignada:", fetchedLote.id);
          }
          
          if (fetchedLote.ambulanciaIdAsignada) {
            const ambData = await getAmbulanceById(fetchedLote.ambulanciaIdAsignada);
            setAmbulance(ambData || null);
          }


        } catch (e) {
          console.error("Error fetching batch data:", e);
          setError("Error al cargar los datos del lote.");
          setLote(null);
          setRuta(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loteId, user, authIsLoading, router, toast]);

  const handleUpdateParadaStatus = async (servicioId: string, newStatus: ParadaRuta['estado']) => {
      if (!ruta || !lote) return;
      setIsLoading(true); // Indicate loading for this specific action
      try {
          const updatedParada = await updateParadaEstadoMock(lote.id, servicioId, newStatus);
          if (updatedParada) {
              setRuta(prevRuta => {
                  if (!prevRuta) return null;
                  return {
                      ...prevRuta,
                      paradas: prevRuta.paradas.map(p => p.servicioId === servicioId ? updatedParada : p)
                  };
              });
          } else {
              toast({ title: "Error", description: "No se pudo actualizar el estado de la parada.", variant: "destructive" });
          }
      } catch (e) {
          console.error("Error updating parada status:", e);
          toast({ title: "Error de Red", description: "Fallo al comunicar la actualización.", variant: "destructive" });
      } finally {
          setIsLoading(false);
      }
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando datos de la ruta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rioja-container">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Lote</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           <div className="mt-4">
            <Link href="/dashboard" passHref>
              <Button variant="outline">Volver al Panel</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (!lote || !ruta) {
    return (
      <div className="rioja-container">
        <Alert className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Hay Datos de Ruta</AlertTitle>
          <AlertDescription>No se encontró información para el lote o la ruta especificada. Contacte con el administrador.</AlertDescription>
           <div className="mt-4">
            <Link href="/dashboard" passHref>
              <Button variant="outline">Volver al Panel</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }
  
  const serviciosProgramados = ruta.paradas.sort((a, b) => a.orden - b.orden);
  // Placeholder for urgencias
  const serviciosUrgentes: ParadaRuta[] = []; 

  const totalServicios = serviciosProgramados.length + serviciosUrgentes.length;
  const serviciosFinalizados = ruta.paradas.filter(p => p.estado === 'finalizado').length;
  const serviciosPendientes = totalServicios - serviciosFinalizados;

  const currentStopIndex = serviciosProgramados.findIndex(p => p.estado !== 'finalizado' && p.estado !== 'cancelado' && p.estado !== 'noPresentado');


  return (
    <div className="rioja-container">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <CardTitle className="page-title">Ruta del Día: {new Date(lote.fechaServicio + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                <CardDescription>Lote ID: {lote.id} | Destino Principal: {lote.destinoPrincipal.nombre}</CardDescription>
            </div>
            {ambulance && (
                 <div className="text-sm text-right mt-2 sm:mt-0">
                    <p>Vehículo: <strong>{ambulance.name} ({ambulance.licensePlate})</strong></p>
                    <p>Tipo: {ambulance.type} | Estado: <Badge variant={ambulance.status === 'available' ? 'default' : 'secondary'}>{ambulance.status}</Badge></p>
                 </div>
            )}
          </div>
           <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Total Servicios</p>
                    <p className="text-xl font-bold text-primary">{totalServicios}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                    <p className="text-xl font-bold text-orange-500">{serviciosPendientes}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Finalizados</p>
                    <p className="text-xl font-bold text-green-600">{serviciosFinalizados}</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Salida Base Estimada</p>
                    <p className="text-xl font-bold text-secondary">{ruta.horaSalidaBaseEstimada}</p>
                </div>
           </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="programados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="programados">Servicios Programados ({serviciosProgramados.length})</TabsTrigger>
          <TabsTrigger value="urgencias" disabled>Urgencias Asignadas ({serviciosUrgentes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="programados">
          {serviciosProgramados.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-26rem)] pr-3"> {/* Adjust height as needed */}
              {serviciosProgramados.map((parada, index) => (
                <ParadaCard key={parada.servicioId} parada={parada} loteId={lote.id} onUpdateStatus={handleUpdateParadaStatus} isCurrent={index === currentStopIndex}/>
              ))}
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay servicios programados en esta ruta.</p>
          )}
        </TabsContent>
        <TabsContent value="urgencias">
          <p className="text-muted-foreground text-center py-8">No hay urgencias asignadas a este vehículo por el momento.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}


    