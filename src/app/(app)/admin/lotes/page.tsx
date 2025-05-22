
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, ArrowLeft, Loader2, Waypoints } from 'lucide-react';
import type { LoteProgramado } from '@/types';
import { mockLotes } from '@/lib/driver-data'; 
import { mockAmbulances } from '@/lib/ambulance-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

const getLoteStatusBadgeVariant = (status: LoteProgramado['estadoLote']) => {
  switch (status) {
    case 'asignado':
    case 'enCurso':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'completado':
      return 'bg-green-500 hover:bg-green-600';
    case 'cancelado':
      return 'bg-red-500 hover:bg-red-600';
    case 'pendienteCalculo':
    case 'calculado':
    case 'modificado':
    default:
      return 'bg-yellow-500 hover:bg-yellow-600';
  }
};

export default function ManageLotesPage() {
  const [lotes, setLotes] = useState<LoteProgramado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

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
  
  useEffect(() => {
    if (user && ['admin', 'centroCoordinador'].includes(user.role)) {
        async function loadLotes() {
          setIsLoading(true);
          try {
            // Simulación de carga de datos
            await new Promise(resolve => setTimeout(resolve, 500));
            setLotes(mockLotes);
          } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar los lotes.", variant: "destructive" });
          }
          setIsLoading(false);
        }
        loadLotes();
    }
  }, [user, toast]);

  const getAmbulanceName = (ambulanceId?: string) => {
    if (!ambulanceId) return 'N/A';
    const ambulance = mockAmbulances.find(a => a.id === ambulanceId);
    return ambulance ? `${ambulance.name} (${ambulance.licensePlate})` : 'Desconocida';
  };
  
  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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
            <h1 className="page-title">Gestión de Lotes y Rutas</h1>
        </div>
        <Button className="btn-primary" disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Lote (Próx.)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-title">Listado de Lotes Programados</CardTitle>
          <CardDescription>Ver, gestionar y optimizar lotes de servicios de transporte programado.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span>Cargando lotes...</span>
            </div>
          ) : lotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron lotes programados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Lote</TableHead>
                    <TableHead>Fecha Servicio</TableHead>
                    <TableHead>Destino Principal</TableHead>
                    <TableHead>Nº Servicios</TableHead>
                    <TableHead>Ambulancia Asignada</TableHead>
                    <TableHead>Estado Lote</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell className="font-medium text-primary">{lote.id}</TableCell>
                      <TableCell>{format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPP", { locale: es })}</TableCell>
                      <TableCell>{lote.destinoPrincipal.nombre}</TableCell>
                      <TableCell className="text-center">{lote.serviciosIds.length}</TableCell>
                      <TableCell>{getAmbulanceName(lote.ambulanciaIdAsignada)}</TableCell>
                      <TableCell>
                        <Badge className={`${getLoteStatusBadgeVariant(lote.estadoLote)} text-white text-xs`}>
                          {getLoteStatusLabel(lote.estadoLote)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/lotes/${lote.id}`} passHref>
                          <Button variant="ghost" size="sm" className="hover:text-primary">
                            <Eye className="mr-1 h-4 w-4" /> Ver / Gestionar
                          </Button>
                        </Link>
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

    