
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { LoteProgramado, RutaCalculada, ParadaRuta, Ambulance, MedioRequeridoProgramado } from '@/types';
import { getLoteByIdMock, getRutaCalculadaByLoteIdMock, updateParadaEstadoMock } from '@/lib/driver-data';
import { getAmbulanceById } from '@/lib/ambulance-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MapPin, Clock, User, ChevronsRight, CheckCircle, PlayCircle, PauseCircle, SkipForward, Ban, HelpCircle, UserX, Info, BriefcaseMedical, ArrowLeft, ListOrdered, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

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

// Updated badge styles for ParadaRuta status
const getStatusBadgeClasses = (status: ParadaRuta['estado']) => {
  switch (status) {
    case 'pendiente': return 'bg-gray-300 text-gray-800';
    case 'enRutaRecogida': return 'bg-blue-100 text-blue-700';
    case 'pacienteRecogido': return 'bg-yellow-100 text-yellow-800';
    case 'enDestino': return 'bg-green-100 text-green-700';
    case 'finalizado': return 'bg-green-700 text-white';
    case 'cancelado': return 'bg-red-100 text-red-800';
    case 'noPresentado': return 'bg-red-100 text-red-800'; // Using same as cancelled for example
    default: return 'bg-gray-400 text-white'; // Fallback
  }
};


const translateMedioRequerido = (medio: MedioRequeridoProgramado): string => {
    switch (medio) {
        case 'camilla': return 'Camilla';
        case 'sillaDeRuedas': return 'Silla de Ruedas';
        case 'andando': return 'Andando/Autónomo';
        default: return medio;
    }
};

const ParadaCard: React.FC<{ parada: ParadaRuta; loteId: string; onUpdateStatus: (servicioId: string, newStatus: ParadaRuta['estado']) => void; isCurrent: boolean, isLoteCompleted: boolean }> = ({ parada, loteId, onUpdateStatus, isCurrent, isLoteCompleted }) => {
  const { toast } = useToast();
  
  const handleStatusChange = (newStatus: ParadaRuta['estado']) => {
    onUpdateStatus(parada.servicioId, newStatus);
    toast({ title: "Estado Actualizado", description: `Servicio ${parada.servicioId.slice(0,8)} marcado como ${translateParadaStatus(newStatus)}.` });
  };

  const canStart = parada.estado === 'pendiente';
  const canPickup = parada.estado === 'enRutaRecogida';
  const canCompleteLeg = parada.estado === 'pacienteRecogido';
  const canFinalize = parada.estado === 'enDestino';
  const isActionable = ['pendiente', 'enRutaRecogida', 'pacienteRecogido', 'enDestino'].includes(parada.estado) && !isLoteCompleted;

  return (
    <Card className={`mb-4 rioja-card ${isCurrent && !isLoteCompleted ? 'border-primary ring-2 ring-primary shadow-lg' : (isLoteCompleted ? 'opacity-60' : 'opacity-80 hover:opacity-100')}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-secondary">Parada {parada.orden}: {parada.paciente.nombre}</CardTitle>
            <CardDescription>Servicio ID: {parada.servicioId} | Cita: {parada.horaConsultaMedica}</CardDescription>
          </div>
          <Badge className={`${getStatusBadgeClasses(parada.estado)} text-xs font-semibold border`}>{translateParadaStatus(parada.estado)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Origen:</strong> {parada.paciente.direccionOrigen}</div>
        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Recogida Estimada:</strong> {parada.horaRecogidaEstimada} | <strong>Llegada Destino Estimada:</strong> {parada.horaLlegadaDestinoEstimada}</div>
        {parada.paciente.contacto && <div className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Contacto:</strong> {parada.paciente.contacto}</div>}
        <div className="flex items-center"><BriefcaseMedical className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Medio Requerido:</strong> {translateMedioRequerido(parada.paciente.medioRequerido)}</div>
        {parada.paciente.observaciones && <p className="text-xs text-muted-foreground pl-6"><Info className="inline h-3 w-3 mr-1"/>Observaciones Paciente: {parada.paciente.observaciones}</p>}
        {parada.notasParada && <p className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded-lg pl-6"><Info className="inline h-3 w-3 mr-1"/>Notas Parada: {parada.notasParada}</p>}

        {isActionable && isCurrent && (
          <div className="pt-3 border-t mt-3 flex flex-wrap gap-2">
            {canStart && <Button size="sm" onClick={() => handleStatusChange('enRutaRecogida')} className="btn-primary"><PlayCircle className="mr-1"/> Iniciar Ruta a Recogida</Button>}
            {canPickup && <Button size="sm" onClick={() => handleStatusChange('pacienteRecogido')} className="bg-accent text-accent-foreground hover:bg-accent/90"><User className="mr-1"/> Paciente Recogido</Button>}
            {canCompleteLeg && <Button size="sm" onClick={() => handleStatusChange('enDestino')} className="bg-emphasis text-emphasis-foreground hover:bg-emphasis/90"><ChevronsRight className="mr-1"/> En Destino</Button>}
            {canFinalize && <Button size="sm" onClick={() => handleStatusChange('finalizado')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><CheckCircle className="mr-1"/> Finalizar Servicio</Button>}
            <DropdownMenuStatus parada={parada} onStatusChange={handleStatusChange} isLoteCompleted={isLoteCompleted}/>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DropdownMenuStatus: React.FC<{ parada: ParadaRuta; onStatusChange: (newStatus: ParadaRuta['estado']) => void; isLoteCompleted: boolean }> = ({ parada, onStatusChange, isLoteCompleted }) => {
  const nonSequentialStates: ParadaRuta['estado'][] = ['noPresentado', 'cancelado'];
  const isFinalState = ['finalizado', 'cancelado', 'noPresentado'].includes(parada.estado) || isLoteCompleted;

  if (isFinalState) return null; 

  return (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
                Otras Acciones <HelpCircle className="ml-1 w-4 h-4"/>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {nonSequentialStates.map(status => (
                <DropdownMenuItem
                    key={status}
                    className="text-xs cursor-pointer"
                    onSelect={() => onStatusChange(status)}
                >
                    {status === 'noPresentado' ? <UserX className="mr-2 h-3.5 w-3.5"/> : <Ban className="mr-2 h-3.5 w-3.5"/>}
                    Marcar como {translateParadaStatus(status)}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function RouteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const loteId = params.loteId as string;
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [lote, setLote] = useState<LoteProgramado | null>(null);
  const [ruta, setRuta] = useState<RutaCalculada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && user && user.role !== 'ambulancia') {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
      return;
    }

    if (user && user.role === 'ambulancia' && loteId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedLote = await getLoteByIdMock(loteId, user.id);
          if (!fetchedLote) {
            setError("No se encontró el lote asignado o no tiene permisos para verlo.");
            toast({ title: 'Error', description: 'Lote no encontrado o no asignado a este vehículo.', variant: 'destructive' });
            setLote(null); setRuta(null);
            setIsLoading(false);
            return;
          }
          setLote(fetchedLote);

          if (fetchedLote.rutaCalculadaId) {
            const fetchedRuta = await getRutaCalculadaByLoteIdMock(fetchedLote.id, fetchedLote.rutaCalculadaId);
            setRuta(fetchedRuta || null);
             if(!fetchedRuta) {
                console.warn("No se encontró la ruta calculada para el lote:", fetchedLote.id);
                toast({ title: 'Advertencia', description: 'No se pudo cargar la ruta detallada para este lote.', variant: 'default' });
            }
          } else {
            setRuta(null);
            console.warn("El lote no tiene una ruta calculada ID asignada:", fetchedLote.id);
            toast({ title: 'Advertencia', description: 'Este lote no tiene una ruta calculada asignada.', variant: 'default' });
          }
        } catch (e: any) {
          console.error("Error fetching route details data:", e);
          setError(`Error al cargar los datos de la ruta: ${e.message || 'Error desconocido'}`);
          toast({ title: 'Error de Carga', description: 'No se pudieron cargar los datos de la ruta.', variant: 'destructive' });
          setLote(null); setRuta(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loteId, user, authIsLoading, router, toast]);

  const handleUpdateParadaStatus = async (servicioId: string, newStatus: ParadaRuta['estado']) => {
      if (!ruta || !lote) return;
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
              const updatedLote = await getLoteByIdMock(lote.id, user?.id);
              if (updatedLote) {
                  const previousLoteState = lote.estadoLote;
                  setLote(updatedLote);
                  if (updatedLote.estadoLote === 'completado' && previousLoteState !== 'completado') {
                      toast({
                          title: "¡Lote Completado!",
                          description: "Todos los servicios de este lote han finalizado.",
                          className: "bg-green-100 border-green-500 text-green-700",
                          duration: 5000,
                      });
                  }
              }
          } else {
              toast({ title: "Error", description: "No se pudo actualizar el estado de la parada.", variant: "destructive" });
          }
      } catch (e) {
          console.error("Error updating parada status:", e);
          toast({ title: "Error de Red", description: "Fallo al comunicar la actualización.", variant: "destructive" });
      }
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando detalles de la ruta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rioja-container">
        <Alert variant="destructive" className="max-w-xl mx-auto rioja-card">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Detalles de Ruta</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           <div className="mt-4">
            <Link href={`/driver/batch-view/${loteId}`} passHref>
              <Button variant="outline">Volver al Resumen del Lote</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (!lote || !ruta) {
    return (
      <div className="rioja-container">
        <Alert className="max-w-xl mx-auto rioja-card">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Hay Datos de Ruta</AlertTitle>
          <AlertDescription>No se encontró información para la ruta de este lote. Contacte con el administrador.</AlertDescription>
           <div className="mt-4">
            <Link href={`/driver/batch-view/${loteId}`} passHref>
              <Button variant="outline">Volver al Resumen del Lote</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }
  
  const serviciosProgramados = ruta.paradas.sort((a, b) => a.orden - b.orden);
  const currentStopIndex = serviciosProgramados.findIndex(p => p.estado !== 'finalizado' && p.estado !== 'cancelado' && p.estado !== 'noPresentado');
  const totalServicios = serviciosProgramados.length;
  const serviciosFinalizados = serviciosProgramados.filter(p => p.estado === 'finalizado').length;
  const progreso = totalServicios > 0 ? (serviciosFinalizados / totalServicios) * 100 : 0;
  const isLoteCompleted = lote.estadoLote === 'completado';

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/driver/batch-view/${loteId}`} passHref>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-2"><ListOrdered className="h-7 w-7 text-primary"/>Mis Paradas de Hoy</h1>
            <p className="text-sm text-muted-foreground">Lote ID: {lote.id.substring(0,12)}... | Fecha: {format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPP", { locale: es })}</p>
          </div>
        </div>
      </div>
      
      <Card className="mb-6 rioja-card">
        <CardHeader>
            <CardTitle className="text-lg text-secondary">Progreso de la Ruta</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Progress value={progreso} className="h-3"/>
            <span className="text-sm font-semibold text-primary">{Math.round(progreso)}% Completado</span>
            <span className="text-sm text-muted-foreground">({serviciosFinalizados} de {totalServicios} paradas)</span>
        </CardContent>
      </Card>

      {isLoteCompleted && (
         <Alert variant="default" className="mb-6 bg-green-100 border-green-700 text-green-700 rioja-card">
            <PartyPopper className="h-5 w-5 text-green-700" />
            <AlertTitle className="font-semibold">¡Lote Completado!</AlertTitle>
            <AlertDescription>
                Todos los servicios de este lote han sido finalizados. Buen trabajo.
            </AlertDescription>
        </Alert>
      )}

      {serviciosProgramados.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-26rem)] pr-3"> 
          {serviciosProgramados.map((parada, index) => (
            <ParadaCard 
                key={parada.servicioId} 
                parada={parada} 
                loteId={lote.id} 
                onUpdateStatus={handleUpdateParadaStatus} 
                isCurrent={index === currentStopIndex}
                isLoteCompleted={isLoteCompleted}
            />
          ))}
        </ScrollArea>
      ) : (
        <Card className="py-12 rioja-card">
            <CardContent className="text-center text-muted-foreground">
                <ListOrdered className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p className="text-lg font-medium">No hay servicios programados en esta ruta.</p>
                <p>Contacte con el centro coordinador si cree que esto es un error.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
