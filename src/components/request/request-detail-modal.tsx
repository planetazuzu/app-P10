
'use client';

import type { AmbulanceRequest, RequestStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, AlertTriangle, Info, CalendarDays, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RequestDetailModalProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

// Updated badge styles
const STATUS_BADGE_CLASSES_MODAL: Record<RequestStatus, string> = {
  pending: 'bg-gray-300 text-gray-800',
  dispatched: 'bg-blue-100 text-blue-700',
  'on-scene': 'bg-yellow-100 text-yellow-800',
  transporting: 'bg-green-100 text-green-700',
  completed: 'bg-green-700 text-white',
  cancelled: 'bg-red-100 text-red-800',
  batched: 'bg-cyan-100 text-cyan-700', // Or another color
};

const PRIORITY_STYLES: Record<AmbulanceRequest['priority'], string> = {
    high: "text-destructive font-semibold", // Rojo suave
    medium: "text-accent font-medium",    // Amarillo alerta
    low: "text-secondary",               // Verde claro/acción
};

const translateRequestStatus = (status: AmbulanceRequest['status']): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'dispatched': return 'En Ruta';
    case 'on-scene': return 'Paciente Recogido';
    case 'transporting': return 'En Destino';
    case 'completed': return 'Completada';
    case 'cancelled': return 'Cancelada';
    case 'batched': return 'En Lote Programado';
    default: return status;
  }
};

const translatePriority = (priority: AmbulanceRequest['priority']): string => {
    switch (priority) {
        case 'high': return 'Alta';
        case 'medium': return 'Media';
        case 'low': return 'Baja';
        default: return priority;
    }
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string | React.ReactNode; highlight?: boolean, className?: string }> = ({ icon: Icon, label, value, highlight, className }) => (
  <div className={cn("flex items-start py-1.5", className)}>
    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
    <div className="flex-1">
      <p className={`text-xs font-medium ${highlight ? 'text-secondary' : 'text-muted-foreground'}`}>{label}</p>
      <p className={`text-sm ${highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value || 'N/A'}</p>
    </div>
  </div>
);


export function RequestDetailModal({ request, isOpen, onClose }: RequestDetailModalProps) {
  if (!request) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            <Info className="mr-2 h-6 w-6"/>
            Detalles de la Solicitud
          </DialogTitle>
          <DialogDescription>
            ID Solicitud: {request.id}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-3" />

        <div className="space-y-4 overflow-y-auto px-1 py-2 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem icon={User} label="Detalles del Paciente" value={request.patientDetails} highlight className="md:col-span-2"/>
                <DetailItem icon={MapPin} label="Dirección" value={request.location.address} className="md:col-span-2"/>
                <DetailItem icon={AlertTriangle} label="Prioridad" value={
                    <span className={PRIORITY_STYLES[request.priority]}>
                        {translatePriority(request.priority)}
                    </span>
                }/>
                <DetailItem icon={Edit} label="Estado" value={
                     <Badge className={`${STATUS_BADGE_CLASSES_MODAL[request.status]} text-xs font-semibold border px-2.5 py-0.5`}>
                        {translateRequestStatus(request.status)}
                    </Badge>
                }/>
            </div>

            {request.notes && (
                <>
                    <Separator className="my-2" />
                    <DetailItem icon={Info} label="Notas Adicionales" value={request.notes} className="md:col-span-2"/>
                </>
            )}
            
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                 <DetailItem icon={CalendarDays} label="Fecha de Creación" value={format(parseISO(request.createdAt), "PPPp", { locale: es })}/>
                 <DetailItem icon={CalendarDays} label="Última Actualización" value={format(parseISO(request.updatedAt), "PPPp", { locale: es })}/>
            </div>

            {request.assignedAmbulanceId && (
                 <>
                    <Separator className="my-2" />
                    <DetailItem icon={User} label="Ambulancia Asignada" value={request.assignedAmbulanceId} highlight />
                </>
            )}
        </div>
        
        <Separator className="my-3" />

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
