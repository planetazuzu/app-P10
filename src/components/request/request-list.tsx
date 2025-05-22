
'use client';

import type { AmbulanceRequest, RequestStatus, UserRole } from '@/types'; // Actualizado a AmbulanceRequest
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpDown, MessageSquare, MoreHorizontal, Eye, FileText } from 'lucide-react';
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


interface RequestListProps {
  requests: AmbulanceRequest[]; // Actualizado a AmbulanceRequest
  userRole: UserRole;
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => void;
  onViewDetails: (requestId: string) => void; // For modal or separate page
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-500 hover:bg-yellow-600',
  dispatched: 'bg-blue-500 hover:bg-blue-600',
  'on-scene': 'bg-indigo-500 hover:bg-indigo-600',
  transporting: 'bg-purple-500 hover:bg-purple-600',
  completed: 'bg-green-500 hover:bg-green-600',
  cancelled: 'bg-gray-500 hover:bg-gray-600',
  batched: 'bg-cyan-500 hover:bg-cyan-600',
};

const PRIORITY_STYLES: Record<'high' | 'medium' | 'low', string> = {
    high: "text-red-600 font-semibold",
    medium: "text-orange-500 font-medium",
    low: "text-green-600",
};

// Helper para traducir el estado de la solicitud
const translateRequestStatus = (status: RequestStatus): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'dispatched': return 'Despachada';
    case 'on-scene': return 'En el Lugar';
    case 'transporting': return 'Transportando';
    case 'completed': return 'Completada';
    case 'cancelled': return 'Cancelada';
    case 'batched': return 'En Lote';
    default: return status;
  }
};

// Helper para traducir la prioridad
const translatePriority = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
        case 'high': return 'Alta (Urgente)';
        case 'medium': return 'Media';
        case 'low': return 'Baja (Programado)';
        default: return priority;
    }
}

export function RequestList({ requests, userRole, onUpdateRequestStatus, onViewDetails }: RequestListProps) {
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

  const canManageStatus = userRole === 'admin' || userRole === 'hospital' || userRole === 'equipoTraslado';

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
                    {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{translateRequestStatus(s as RequestStatus)}</SelectItem>)}
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
                  <Badge className={`${STATUS_COLORS[request.status]} text-white`}>
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
                      <DropdownMenuItem onClick={() => onViewDetails(request.id)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                      </DropdownMenuItem>
                      {canManageStatus && request.status !== 'completed' && request.status !== 'cancelled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Actualizar Estado</DropdownMenuLabel>
                          {Object.keys(STATUS_COLORS).filter(s => s !== request.status && s !== 'batched').map(newStatus => ( // Exclude 'batched' from manual updates here
                            <DropdownMenuItem key={newStatus} onClick={() => onUpdateRequestStatus(request.id, newStatus as RequestStatus)}>
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
