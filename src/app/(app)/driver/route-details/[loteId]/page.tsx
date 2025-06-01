
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
import { Loader2, AlertTriangle, MapPin, Clock, User, ChevronsRight, CheckCircle, PlayCircle, PauseCircle, SkipForward, Ban, HelpCircle, UserX, Info, BriefcaseMedical, ArrowLeft, ListOrdered } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Helper Functions (Duplicated from original DriverBatchViewPage for now, consider moving to utils) ---
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

const translateMedioRequerido = (medio: MedioRequeridoProgramado): string => {
    switch (medio) {
        case 'camilla': return 'Camilla';
        case 'sillaDeRuedas': return 'Silla de Ruedas';
        case 'andando': return 'Andando/Autónomo';
        default: return medio;
    }
};

// --- ParadaCard Component (Duplicated for now, consider moving to a shared component) ---
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
            <CardDescription>Servicio ID: {parada.servicioId} | Cita: {parada.horaConsultaMedica}</CardDescription>
          </div>
          <Badge className={`${getStatusBadgeVariant(parada.estado)} text-white text-xs`}>{translateParadaStatus(parada.estado)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Origen:</strong> {parada.paciente.direccionOrigen}</div>
        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Recogida Estimada:</strong> {parada.horaRecogidaEstimada} | <strong>Llegada Destino Estimada:</strong> {parada.horaLlegadaDestinoEstimada}</div>
        {parada.paciente.contacto && <div className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Contacto:</strong> {parada.paciente.contacto}</div>}
        <div className="flex items-center"><BriefcaseMedical className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Medio Requerido:</strong> {translateMedioRequerido(parada.paciente.medioRequerido)}</div>
        {parada.paciente.observaciones && <p className="text-xs text-muted-foreground pl-6"><Info className="inline h-3 w-3 mr-1"/>Observaciones Paciente: {parada.paciente.observaciones}</p>}
        {parada.notasParada && <p className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded pl-6"><Info className="inline h-3 w-3 mr-1"/>Notas Parada: {parada.notasParada}</p>}

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
  const isFinalState = ['finalizado', 'cancelado', 'noPresentado'].includes(parada.estado);

  return (
    <details className="relative group" {...(isFinalState ? { open: false } : {})}>
        <summary className="list-none">
            <Button variant="outline" size="sm" disabled={isFinalState} aria-expanded={!isFinalState && undefined}>
                Otras Acciones <HelpCircle className="ml-1 w-4 h-4"/>
            </Button>
        </summary>
        {!isFinalState && (
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
        )}
    </details>
  );
};
// --- End of Duplicated Components/Helpers ---

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
      setIsLoading(true); 
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
        <p className="ml-4 text-lg text-muted-foreground">Cargando detalles de la ruta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rioja-container">
        <Alert variant="destructive" className="max-w-xl mx-auto">
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
        <Alert className="max-w-xl mx-auto">
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
            <h1 className="page-title flex items-center gap-2"><ListOrdered className="h-8 w-8 text-primary"/>Paradas de la Ruta</h1>
            <p className="text-sm text-muted-foreground">Lote ID: {lote.id.substring(0,12)}... | Fecha: {format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPP", { locale: es })}</p>
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
            <CardTitle className="text-lg text-secondary">Progreso de la Ruta</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${progreso}%`}}
                />
            </div>
            <span className="text-sm font-semibold text-primary">{Math.round(progreso)}% Completado</span>
            <span className="text-sm text-muted-foreground">({serviciosFinalizados} de {totalServicios} paradas)</span>
        </CardContent>
      </Card>

      {serviciosProgramados.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-22rem)] pr-3"> {/* Ajustar altura según sea necesario */}
          {serviciosProgramados.map((parada, index) => (
            <ParadaCard 
                key={parada.servicioId} 
                parada={parada} 
                loteId={lote.id} 
                onUpdateStatus={handleUpdateParadaStatus} 
                isCurrent={index === currentStopIndex}
            />
          ))}
        </ScrollArea>
      ) : (
        <Card className="py-12">
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

