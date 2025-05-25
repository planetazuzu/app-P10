
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ProgrammedTransportRequest, LoteProgramado } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ManageLotServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote: LoteProgramado | null;
  allAvailableServices: ProgrammedTransportRequest[]; // Unassigned services
  currentAssignedServices: ProgrammedTransportRequest[]; // Services already in this lot
  onConfirmChanges: (servicesToAdd: string[], servicesToRemove: string[]) => Promise<boolean>;
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


export function ManageLotServicesModal({
  isOpen,
  onClose,
  lote,
  allAvailableServices,
  currentAssignedServices,
  onConfirmChanges,
}: ManageLotServicesModalProps) {
  const { toast } = useToast();
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Record<string, boolean>>({});
  const [selectedAssignedIdsToRemove, setSelectedAssignedIdsToRemove] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset selections when modal opens or lote changes
    if (isOpen) {
      setSelectedAvailableIds({});
      // Pre-select services already assigned to this lot for removal
      const initialToRemove: Record<string, boolean> = {};
      // currentAssignedServices.forEach(s => initialToRemove[s.id] = false); // No, this should be empty initially.
      // User explicitly checks to remove.
      setSelectedAssignedIdsToRemove({});
    }
  }, [isOpen, lote, currentAssignedServices]); // Added currentAssignedServices dependency

  const handleSave = async () => {
    setIsSaving(true);
    const servicesToAdd = Object.keys(selectedAvailableIds).filter(id => selectedAvailableIds[id]);
    const servicesToRemove = Object.keys(selectedAssignedIdsToRemove).filter(id => selectedAssignedIdsToRemove[id]);
    
    const success = await onConfirmChanges(servicesToAdd, servicesToRemove);
    if (success) {
      toast({
        title: "Servicios del Lote Actualizados",
        description: "Los cambios se han guardado. Puede que necesite re-optimizar la ruta.",
      });
      onClose();
    } else {
      toast({
        title: "Error al Actualizar",
        description: "No se pudieron guardar los cambios en los servicios del lote.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const hasChanges = useMemo(() => 
    Object.values(selectedAvailableIds).some(Boolean) || Object.values(selectedAssignedIdsToRemove).some(Boolean),
    [selectedAvailableIds, selectedAssignedIdsToRemove]
  );

  if (!lote) return null;

  // Filter out services already assigned to *any* lot from allAvailableServices, except those assigned to the *current* lot (they appear in the other list)
  const trulyAvailableServices = allAvailableServices.filter(s => !s.loteId || s.loteId === lote.id);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Gestionar Servicios para Lote: {lote.id.substring(0,8)}...</DialogTitle>
          <DialogDescription>
            Añada o quite servicios programados de este lote. Fecha del Lote: {format(parseISO(lote.fechaServicio + 'T00:00:00'), "PPP", { locale: es })}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 py-4 flex-grow overflow-hidden">
          {/* Columna para Servicios Asignados */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 text-secondary">Servicios Actualmente en este Lote ({currentAssignedServices.length})</h3>
            {currentAssignedServices.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-muted-foreground border rounded-md p-4">
                <p>Este lote no tiene servicios asignados.</p>
              </div>
            ) : (
            <ScrollArea className="h-[calc(100vh-25rem)] md:h-full border rounded-md p-2 bg-muted/20">
              <Table size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Quitar</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAssignedServices.map(service => (
                    <TableRow key={service.id} data-state={selectedAssignedIdsToRemove[service.id] ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          id={`remove-${service.id}`}
                          checked={selectedAssignedIdsToRemove[service.id] || false}
                          onCheckedChange={checked =>
                            setSelectedAssignedIdsToRemove(prev => ({ ...prev, [service.id]: Boolean(checked) }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        {service.nombrePaciente}
                        <div className="text-muted-foreground text-[10px]">{service.centroOrigen} &rarr; {service.destino}</div>
                      </TableCell>
                      <TableCell className="text-xs">{service.horaConsultaMedica || service.horaIda}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            )}
          </div>

          {/* Columna para Servicios Disponibles */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 text-primary">Servicios Disponibles para Añadir ({trulyAvailableServices.filter(s => s.fechaIda === lote.fechaServicio).length})</h3>
            {trulyAvailableServices.filter(s => s.fechaIda === lote.fechaServicio).length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-muted-foreground border rounded-md p-4">
                <p>No hay servicios disponibles para la fecha de este lote.</p>
              </div>
            ) : (
            <ScrollArea className="h-[calc(100vh-25rem)] md:h-full border rounded-md p-2 bg-muted/20">
              <Table size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Añadir</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Medio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trulyAvailableServices
                    .filter(service => service.fechaIda === lote.fechaServicio && !currentAssignedServices.find(cs => cs.id === service.id)) // Only show services for the lot's date and not already assigned to this lot
                    .map(service => (
                    <TableRow key={service.id} data-state={selectedAvailableIds[service.id] ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          id={`add-${service.id}`}
                          checked={selectedAvailableIds[service.id] || false}
                          onCheckedChange={checked =>
                            setSelectedAvailableIds(prev => ({ ...prev, [service.id]: Boolean(checked) }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                         {service.nombrePaciente}
                         <div className="text-muted-foreground text-[10px]">{service.centroOrigen} &rarr; {service.destino}</div>
                      </TableCell>
                      <TableCell className="text-xs">{service.horaConsultaMedica || service.horaIda}</TableCell>
                      <TableCell className="text-xs">{translateMedioRequerido(service.medioRequerido)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="btn-primary">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Guardando...' : 'Guardar Cambios en Servicios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
