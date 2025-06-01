
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { LoteProgramado, RutaCalculada, Ambulance } from '@/types';
import { getLoteByIdMock, getRutaCalculadaByLoteIdMock } from '@/lib/driver-data';
import { getAmbulanceById } from '@/lib/ambulance-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MapPin, Users, CalendarDays, Car, ListOrdered, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
            toast({ title: 'Error', description: 'Lote no encontrado o no asignado a este vehículo.', variant: 'destructive' });
            setLote(null); setRuta(null); setAmbulance(null);
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
          
          if (fetchedLote.ambulanciaIdAsignada) {
            const ambData = await getAmbulanceById(fetchedLote.ambulanciaIdAsignada);
            setAmbulance(ambData || null);
          }
        } catch (e: any) {
          console.error("Error fetching batch data:", e);
          setError(`Error al cargar los datos del lote: ${e.message || 'Error desconocido'}`);
          toast({ title: 'Error de Carga', description: 'No se pudieron cargar los datos del lote.', variant: 'destructive' });
          setLote(null); setRuta(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loteId, user, authIsLoading, router, toast]);

  if (authIsLoading || isLoading) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando resumen del lote...</p>
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

  if (!lote) {
    return (
      <div className="rioja-container">
        <Alert className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Hay Datos del Lote</AlertTitle>
          <AlertDescription>No se encontró información para el lote especificado o no está asignado a su vehículo. Contacte con el centro coordinador.</AlertDescription>
           <div className="mt-4">
            <Link href="/dashboard" passHref>
              <Button variant="outline">Volver al Panel</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }
  
  const totalServicios = ruta?.paradas?.length || lote.serviciosIds.length || 0;
  const serviciosFinalizados = ruta?.paradas?.filter(p => p.estado === 'finalizado').length || 0;
  const serviciosPendientes = totalServicios - serviciosFinalizados;

  return (
    <div className="rioja-container">
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-primary/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <CardTitle className="page-title text-primary">Ruta del Día</CardTitle>
                <CardDescription className="text-lg">
                  {format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPPP", { locale: es })}
                </CardDescription>
            </div>
            {ambulance && (
                 <div className="text-sm text-right mt-2 sm:mt-0 bg-primary/10 p-2 rounded-md">
                    <p className="font-semibold text-secondary-foreground flex items-center gap-1"><Car className="h-4 w-4 text-primary"/>Vehículo: <strong>{ambulance.name} ({ambulance.licensePlate})</strong></p>
                    <p className="text-xs text-muted-foreground ml-5">Tipo: {ambulance.type} | Estado: <Badge variant={ambulance.status === 'available' ? 'default' : 'secondary'} className="text-xs">{ambulance.status}</Badge></p>
                 </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="flex items-center gap-2"><Info className="h-5 w-5 text-muted-foreground"/><strong>ID Lote:</strong> {lote.id}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground"/><strong>Destino Principal:</strong> {lote.destinoPrincipal.nombre}</p>
                </div>
                <div className="space-y-1">
                     <p className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground"/><strong>Total Servicios:</strong> {totalServicios}</p>
                    <p className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-muted-foreground"/><strong>Hora Salida Base (Estimada):</strong> {ruta?.horaSalidaBaseEstimada || 'N/A'}</p>
                </div>
            </div>

           {lote.notasLote && (
             <div className="bg-accent/30 p-3 rounded-md">
                <p className="text-sm font-medium text-accent-foreground/80 mb-1">Notas del Lote:</p>
                <p className="text-sm text-accent-foreground/70">{lote.notasLote}</p>
             </div>
           )}
           
           {ruta?.optimizadaEn && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                    Ruta optimizada el: {format(parseISO(ruta.optimizadaEn), "PPPp", { locale: es })}
                </p>
           )}

            <div className="mt-6 text-center">
              <Link href={`/driver/route-details/${lote.id}`} passHref>
                <Button size="lg" className="btn-primary w-full sm:w-auto shadow-md">
                  <ListOrdered className="mr-2 h-5 w-5" />
                  Ver / Gestionar Paradas de la Ruta ({serviciosPendientes} Pendiente(s))
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

