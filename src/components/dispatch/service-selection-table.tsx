
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ProgrammedTransportRequest } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceSelectionTableProps {
  services: ProgrammedTransportRequest[];
  onSelectionChange: (selectedServices: ProgrammedTransportRequest[]) => void;
}

const translateMedioRequerido = (medio?: ProgrammedTransportRequest['medioRequerido']): string => {
    if (!medio) return 'N/A';
    switch (medio) {
        case 'camilla': return 'Camilla';
        case 'sillaDeRuedas': return 'S. Ruedas';
        case 'andando': return 'Andando';
        default: return medio;
    }
};

export function ServiceSelectionTable({ services, onSelectionChange }: ServiceSelectionTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Record<string, boolean>>({});

  const handleSelectAll = (checked: boolean) => {
    const newSelectedRowKeys: Record<string, boolean> = {};
    if (checked) {
      services.forEach(service => newSelectedRowKeys[service.id] = true);
    }
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleRowSelect = (serviceId: string, checked: boolean) => {
    setSelectedRowKeys(prev => ({
      ...prev,
      [serviceId]: checked,
    }));
  };

  useEffect(() => {
    const currentlySelectedServices = services.filter(service => selectedRowKeys[service.id]);
    onSelectionChange(currentlySelectedServices);
  }, [selectedRowKeys, services, onSelectionChange]);

  const allSelected = useMemo(() => services.length > 0 && services.every(service => selectedRowKeys[service.id]), [services, selectedRowKeys]);
  const someSelected = useMemo(() => services.length > 0 && Object.values(selectedRowKeys).some(Boolean) && !allSelected, [selectedRowKeys, allSelected, services]);


  if (!services || services.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No hay servicios disponibles para seleccionar.</p>;
  }

  return (
    <div className="space-y-3">
      <ScrollArea className="h-[300px] w-full rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[50px] p-2">
                <Checkbox
                  checked={allSelected}
                  // indeterminate prop for Radix Checkbox doesn't work with boolean directly,
                  // but we can achieve visual indication if needed through other means or custom styling.
                  // For simplicity, we'll rely on the visual state of individual checkboxes.
                  // If you have a custom Checkbox component that supports boolean indeterminate, use that.
                  onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  aria-label="Seleccionar todo"
                  className="ml-2"
                />
              </TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Fecha/Hora Cita</TableHead>
              <TableHead>Medio</TableHead>
              <TableHead>ID Solicitud</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow 
                key={service.id} 
                data-state={selectedRowKeys[service.id] ? "selected" : ""}
                onClick={() => handleRowSelect(service.id, !selectedRowKeys[service.id])}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell onClick={(e) => e.stopPropagation()} className="p-2"> {/* Prevent row click from toggling checkbox if checkbox itself is clicked */}
                  <Checkbox
                    checked={selectedRowKeys[service.id] || false}
                    onCheckedChange={(checked) => handleRowSelect(service.id, Boolean(checked))}
                    aria-label={`Seleccionar servicio ${service.id}`}
                    className="ml-2"
                  />
                </TableCell>
                <TableCell className="font-medium text-sm py-2">{service.nombrePaciente}</TableCell>
                <TableCell className="text-xs py-2">{service.centroOrigen}</TableCell>
                <TableCell className="text-xs py-2">{service.destino}</TableCell>
                <TableCell className="text-xs py-2">
                    {format(parseISO(service.fechaIda), "dd/MM/yy", { locale: es })} {service.horaConsultaMedica || service.horaIda}
                </TableCell>
                <TableCell className="text-xs py-2">{translateMedioRequerido(service.medioRequerido)}</TableCell>
                <TableCell className="text-xs text-muted-foreground py-2">{service.id.slice(0,13)}...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
       <p className="text-sm text-muted-foreground">
        Seleccionados: {Object.values(selectedRowKeys).filter(Boolean).length} de {services.length} servicio(s).
      </p>
    </div>
  );
}
