
'use client';

import type { AmbulanceRequest, RequestStatus, UserRole } from '@/types'; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpDown, MessageSquare, MoreHorizontal, Eye, FileText, Edit3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

// Updated badge styles according to new visual guidelines
const STATUS_BADGE_CLASSES: Record<RequestStatus, string> = {
  pending: 'bg-gray-300 text-gray-800',
  dispatched: 'bg-blue-100 text-blue-700', // En ruta (azul)
  'on-scene': 'bg-yellow-100 text-yellow-800', // Paciente recogido (amarillo) - Mapped 'on-scene' for example
  transporting: 'bg-green-100 text-green-700', // En destino (verde claro) - Mapped 'transporting' for example
  completed: 'bg-green-700 text-white', // Finalizado (verde oscuro)
  cancelled: 'bg-red-100 text-red-800', // Cancelado (rojo)
  batched: 'bg-cyan-100 text-cyan-700', // Example for 'batched', can be adjusted
};


const PRIORITY_STYLES: Record<'high' | 'medium' | 'low', string> = {
    high: "text-destructive font-semibold", // Rojo suave
    medium: "text-accent font-medium", // Amarillo alerta
    low: "text-secondary", // Verde claro/acción
};

const translateRequestStatus = (status: RequestStatus): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'dispatched': return 'En Ruta'; // Matching "En ruta: azul"
    case 'on-scene': return 'Paciente Recogido'; // Matching "Paciente recogido: amarillo"
    case 'transporting': return 'En Destino'; // Matching "En destino: verde claro"
    case 'completed': return 'Finalizado';
    case 'cancelled': return 'Cancelado'; // Could also be "No Presentado"
    case 'batched': return 'En Lote';
    default: return status;
  }
};

const translatePriority = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
        case 'high': return 'Alta';
        case 'medium': return 'Media';
        case 'low': return 'Baja';
        default: return priority;
    }
}

interface RequestListProps {
  requests: AmbulanceRequest[]; 
  userRole: UserRole;
  currentUserId?: string; 
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => void;
  onViewDetails: (requestId: string) => void; 
}

export function RequestList({ requests, userRole, currentUserId, onUpdateRequestStatus, onViewDetails }: RequestListProps) {
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedRequests = useMemo(() => {
    let processedRequests = [...requests];

    if (filterStatus !== 'all') {
      processedRequests = processedRequests.filter(req => req.status === filterStatus);
    }

    if (searchTerm) {
      processedRequests = processedRequests.filter(req => 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.patientDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    processedRequests.sort((a, b) => {
        let comparison = 0;
        if (sortColumn === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortColumn === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortColumn === 'status') {
            comparison = a.status.localeCompare(b.status);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return processedRequests;
  }, [requests, filterStatus, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: 'createdAt' | 'priority' | 'status') => {
    if (sortColumn === column) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortColumn(column);
        setSortDirection('desc');
    }
  };

  const canManageStatus = userRole === 'admin' || userRole === 'hospital' || userRole === 'centroCoordinador';
  
  const canEditRequest = (request: AmbulanceRequest): boolean => {
    if (userRole === 'admin' || userRole === 'centroCoordinador') return true;
    if ((userRole === 'hospital' || userRole === 'individual') && request.requesterId === currentUserId) return true;
    return false;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">Solicitudes de Ambulancia</CardTitle>
        <CardDescription>Ver y gestionar todas las solicitudes de ambulancia enviadas.</CardDescription>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input 
                placeholder="Buscar por ID, paciente, dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequestStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    {Object.keys(STATUS_BADGE_CLASSES).map(s => <SelectItem key={s} value={s}>{translateRequestStatus(s as RequestStatus)}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-semibold">No se encontraron solicitudes.</p>
                <p>Intente ajustar sus filtros o revise más tarde.</p>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Detalles del Paciente</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('priority')}>
                    Prioridad <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                    Estado <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                    Creado en <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium text-primary">{request.id.substring(0,8)}...</TableCell>
                <TableCell>{request.patientDetails.substring(0, 30)}...</TableCell>
                <TableCell>
                    <span className={PRIORITY_STYLES[request.priority]}>
                        {translatePriority(request.priority)}
                    </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_BADGE_CLASSES[request.status]} text-xs font-semibold`}>
                    {translateRequestStatus(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(request.createdAt), 'MMM d, yyyy HH:mm', { locale: es })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetails(request.id)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                      </DropdownMenuItem>
                      {canEditRequest(request) && request.status !== 'completed' && request.status !== 'cancelled' && ( 
                        <DropdownMenuItem asChild className="cursor-pointer">
                           <Link href={`/request-management/${request.id}/edit`}>
                              <Edit3 className="mr-2 h-4 w-4" /> Editar
                           </Link>
                        </DropdownMenuItem>
                      )}
                      {canManageStatus && request.status !== 'completed' && request.status !== 'cancelled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Actualizar Estado</DropdownMenuLabel>
                          {Object.keys(STATUS_BADGE_CLASSES).filter(s => s !== request.status && s !== 'batched').map(newStatus => ( 
                            <DropdownMenuItem key={newStatus} onClick={() => onUpdateRequestStatus(request.id, newStatus as RequestStatus)} className="cursor-pointer">
                              Marcar como {translateRequestStatus(newStatus as RequestStatus)}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                       <DropdownMenuSeparator />
                       <DropdownMenuItem disabled>
                        <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensaje (Pronto)
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
