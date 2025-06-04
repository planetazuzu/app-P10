
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import type { AmbulanceType, AmbulanceStatus } from '@/types';

interface AmbulanceListFiltersProps {
  searchTerm: string;
  filterType: AmbulanceType | 'all';
  filterStatus: AmbulanceStatus | 'all';
  onSearchTermChange: (term: string) => void;
  onFilterTypeChange: (type: AmbulanceType | 'all') => void;
  onFilterStatusChange: (status: AmbulanceStatus | 'all') => void;
  allAmbulanceTypes: readonly AmbulanceType[];
  allAmbulanceStatuses: readonly AmbulanceStatus[];
  getAmbulanceTypeLabel: (type: AmbulanceType) => string;
  getAmbulanceStatusLabel: (status: AmbulanceStatus) => string;
}

export function AmbulanceListFilters({
  searchTerm,
  filterType,
  filterStatus,
  onSearchTermChange,
  onFilterTypeChange,
  onFilterStatusChange,
  allAmbulanceTypes,
  allAmbulanceStatuses,
  getAmbulanceTypeLabel,
  getAmbulanceStatusLabel,
}: AmbulanceListFiltersProps) {
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-2">
      <div className="relative flex-grow">
        <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre, matrícula, modelo..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <Select value={filterType} onValueChange={(value) => onFilterTypeChange(value as AmbulanceType | 'all')}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Tipos</SelectItem>
          {allAmbulanceTypes.map(type => <SelectItem key={type} value={type}>{getAmbulanceTypeLabel(type)}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={(value) => onFilterStatusChange(value as AmbulanceStatus | 'all')}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Estados</SelectItem>
          {allAmbulanceStatuses.map(status => <SelectItem key={status} value={status}>{getAmbulanceStatusLabel(status)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
