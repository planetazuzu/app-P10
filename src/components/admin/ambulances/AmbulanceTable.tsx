
'use client';

import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';

// Helper functions moved here
const getAmbulanceTypeLabel = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "SVB";
    case "SVA": return "SVA";
    case "Convencional": return "Conv.";
    case "UVI_Movil": return "UVI";
    case "A1": return "A1";
    case "Programado": return "Prog.";
    case "Otros": return "Otros";
    default: return type;
  }
};

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
    switch (status) {
      case "available": return "Disponible";
      case "busy": return "Ocupada";
      case "maintenance": return "Mantenim.";
      case "unavailable": return "No Disp.";
      default: return status;
    }
};

const getStatusBadgeVariantClass = (status: AmbulanceStatus) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700';
        case 'busy': return 'bg-blue-100 text-blue-700';
        case 'maintenance': return 'bg-yellow-100 text-yellow-800';
        case 'unavailable': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-300 text-gray-800';
    }
}

interface AmbulanceTableProps {
  ambulances: Ambulance[];
  isLoading: boolean;
  onDeleteAmbulance: (id: string, name: string) => void;
}

export function AmbulanceTable({ ambulances, isLoading, onDeleteAmbulance }: AmbulanceTableProps) {
  if (isLoading && ambulances.length === 0) { // Show this only if truly loading and no data yet
    return <p className="text-center text-muted-foreground py-8">Cargando ambulancias...</p>;
  }

  if (ambulances.length === 0 && !isLoading) {
    return <p className="text-center text-muted-foreground py-8">No se encontraron ambulancias con los filtros actuales.</p>;
  }

  return (
    <div className="rioja-table-responsive-wrapper">
      <Table className="rioja-table">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Base</TableHead>
            <TableHead>Ubicación (Lat, Lon)</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ambulances.map((ambulance) => (
            <TableRow key={ambulance.id}>
              <TableCell className="font-medium">{ambulance.name}</TableCell>
              <TableCell>{ambulance.licensePlate}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="whitespace-nowrap bg-opacity-80">{getAmbulanceTypeLabel(ambulance.type)}</Badge>
              </TableCell>
              <TableCell>{ambulance.model || 'N/A'}</TableCell>
              <TableCell>{ambulance.baseLocation}</TableCell>
              <TableCell className="text-xs">
                {ambulance.latitude && ambulance.longitude ? (
                  <div className="flex items-center gap-1">
                    <Icons.MapPin className="h-3 w-3 text-muted-foreground"/> 
                    {`${ambulance.latitude.toFixed(3)}, ${ambulance.longitude.toFixed(3)}`}
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusBadgeVariantClass(ambulance.status)} text-xs border`}>
                  {getAmbulanceStatusLabel(ambulance.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/ambulances/${ambulance.id}/edit`} passHref>
                  <Button variant="ghost" size="icon" className="hover:text-primary">
                    <Icons.Edit3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => onDeleteAmbulance(ambulance.id, ambulance.name)} className="hover:text-destructive">
                  <Icons.Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
