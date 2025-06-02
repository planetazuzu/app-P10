
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
import { getLotesMock } from '@/lib/driver-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';


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

// Updated Lote Status Badge Styles
const getLoteStatusBadgeClasses = (status: LoteProgramado['estadoLote']) => {
  switch (status) {
    case 'asignado': return 'bg-blue-100 text-blue-700'; // Azul (En ruta)
    case 'enCurso': return 'bg-yellow-100 text-yellow-800'; // Amarillo (Paciente recogido)
    case 'completado': return 'bg-green-700 text-white'; // Verde oscuro (Finalizado)
    case 'cancelado': return 'bg-red-100 text-red-800'; // Rojo suave (Cancelado)
    case 'pendienteCalculo':
    case 'calculado':
    case 'modificado':
    default:
      return 'bg-gray-300 text-gray-800'; // Gris (Pendiente)
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
            const data = await getLotesMock(); 
            setLotes(data);
          } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar los lotes.", variant: "destructive" });
            setLotes([]);
          }
          setIsLoading(false);
        }
        loadLotes();
    }
  }, [user, toast]);

  const getAmbulanceName = (lote: LoteProgramado) => {
    return lote.ambulanciaIdAsignada || 'N/A';
  };
  
  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
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
                <Skeleton className="h-6 w-1/2 mb-2" />
            </div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
            <Card className="rioja-card">
                <CardHeader>
                    <Skeleton className="h-8 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                             <TableRow key={i} className="flex items-center space-x-4 p-2">
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/12 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                                <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
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
            { label: 'Lotes y Rutas' }
        ]} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <Link href="/admin" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="page-title">Gestión de Lotes y Rutas</h1>
        </div>
        <Link href="/admin/lotes/new" passHref>
            <Button className="btn-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Lote
            </Button>
        </Link>
      </div>

      <Card className="rioja-card">
        <CardHeader>
          <CardTitle className="section-title">Listado de Lotes Programados</CardTitle>
          <CardDescription>Ver, gestionar y optimizar lotes de servicios de transporte programado.</CardDescription>
        </CardHeader>
        <CardContent>
          {lotes.length === 0 ? (
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
                    <TableHead>Ambulancia Asignada (ID)</TableHead>
                    <TableHead>Estado Lote</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell className="font-medium text-primary">{lote.id}</TableCell>
                      <TableCell>{format(parseISO(lote.fechaServicio + 'T00:00:00Z'), "PPP", { locale: es })}</TableCell>
                      <TableCell>{lote.destinoPrincipal.nombre}</TableCell>
                      <TableCell className="text-center">{lote.serviciosIds.length}</TableCell>
                      <TableCell>{getAmbulanceName(lote)}</TableCell>
                      <TableCell>
                        <Badge className={`${getLoteStatusBadgeClasses(lote.estadoLote)} text-xs font-semibold border`}>
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
