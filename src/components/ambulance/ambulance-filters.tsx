'use client';

import type { AmbulanceType, AmbulanceStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AmbulanceFiltersProps {
  types: AmbulanceType[];
  statuses: AmbulanceStatus[];
  selectedType: AmbulanceType | 'all';
  selectedStatus: AmbulanceStatus | 'all';
  onTypeChange: (type: AmbulanceType | 'all') => void;
  onStatusChange: (status: AmbulanceStatus | 'all') => void;
}

// Helper para traducir el estado de la ambulancia para los filtros
const translateFilterStatus = (status: AmbulanceStatus): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'unavailable':
      return 'No disponible';
    case 'on-mission':
      return 'En misión';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Helper para obtener una descripción del tipo de ambulancia para filtros
const getAmbulanceTypeFilterLabel = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "SVB (Soporte Vital Básico)";
    case "SVA": return "SVA (Soporte Vital Avanzado)";
    case "Convencional": return "Convencional";
    case "UVI_Movil": return "UVI Móvil";
    case "A1": return "A1 (Programado Ind.)";
    case "Programado": return "Programado Col.";
    case "Otros": return "Otros Tipos";
    default: return type;
  }
}


export function AmbulanceFilters({
  types,
  statuses,
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
}: AmbulanceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-secondary">Filtrar Ambulancias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ambulance-type" className="text-sm font-medium">Tipo</Label>
          <Select value={selectedType} onValueChange={(value) => onTypeChange(value as AmbulanceType | 'all')}>
            <SelectTrigger id="ambulance-type" className="w-full mt-1">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Tipos</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {getAmbulanceTypeFilterLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ambulance-status" className="text-sm font-medium">Estado</Label>
           <Select value={selectedStatus} onValueChange={(value) => onStatusChange(value as AmbulanceStatus | 'all')}>
            <SelectTrigger id="ambulance-status" className="w-full mt-1">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {translateFilterStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
