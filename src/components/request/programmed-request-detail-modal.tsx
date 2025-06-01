
'use client';

import type { ProgrammedTransportRequest } from '@/types';
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
import { MapPin, User, AlertTriangle, Info, CalendarDays, Edit, ListChecks, BriefcaseMedical, FileText, Clock, Link2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProgrammedRequestDetailModalProps {
  request: ProgrammedTransportRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_COLORS_PROG: Record<ProgrammedTransportRequest['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  dispatched: 'bg-blue-100 text-blue-700 border-blue-300', // Not typical for programmed
  'on-scene': 'bg-indigo-100 text-indigo-700 border-indigo-300', // Not typical for programmed
  transporting: 'bg-purple-100 text-purple-700 border-purple-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
  batched: 'bg-cyan-100 text-cyan-700 border-cyan-300',
};

const PRIORITY_STYLES_PROG: Record<ProgrammedTransportRequest['priority'], string> = {
    high: "text-red-600 font-semibold", // Should not happen for programmed
    medium: "text-orange-500 font-medium",
    low: "text-green-600",
};

const translateProgrammedRequestStatusModal = (status: ProgrammedTransportRequest['status']): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'batched': return 'En Lote';
    case 'transporting': return 'Transportando';
    case 'completed': return 'Completado';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

const translatePriorityModal = (priority: ProgrammedTransportRequest['priority']): string => {
    switch (priority) {
        case 'high': return 'Alta';
        case 'medium': return 'Media';
        case 'low': return 'Baja';
        default: return priority;
    }
};

const translateTipoServicio = (tipo: ProgrammedTransportRequest['tipoServicio']): string => {
    const map: Record<ProgrammedTransportRequest['tipoServicio'], string> = {
        consulta: "Consulta",
        alta: "Alta Hospitalaria",
        ingreso: "Ingreso Hospitalario",
        trasladoEntreCentros: "Traslado Interhospitalario",
        tratamientoContinuado: "Tratamiento Continuado",
        rehabilitacion: "Rehabilitación"
    };
    return map[tipo] || tipo;
}

const translateTipoTraslado = (tipo: ProgrammedTransportRequest['tipoTraslado']): string => {
    return tipo === 'soloIda' ? 'Solo Ida' : 'Ida y Vuelta';
}

const translateMedioRequeridoModal = (medio?: ProgrammedTransportRequest['medioRequerido']): string => {
    if (!medio) return 'N/A';
    const map: Record<ProgrammedTransportRequest['medioRequerido'], string> = {
        camilla: "Camilla",
        sillaDeRuedas: "Silla de Ruedas",
        andando: "Andando / Autónomo"
    };
    return map[medio] || medio;
};

const DetailItemModal: React.FC<{ icon: React.ElementType; label: string; value?: string | React.ReactNode; highlight?: boolean, className?: string }> = ({ icon: Icon, label, value, highlight, className }) => (
  <div className={cn("flex items-start py-1.5", className)}>
    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
    <div className="flex-1">
      <p className={`text-xs font-medium ${highlight ? 'text-secondary' : 'text-muted-foreground'}`}>{label}</p>
      <p className={`text-sm ${highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value || 'N/A'}</p>
    </div>
  </div>
);


export function ProgrammedRequestDetailModal({ request, isOpen, onClose }: ProgrammedRequestDetailModalProps) {
  if (!request) {
    return null;
  }

  const equipamientoSolicitado = request.equipamientoEspecialRequerido && request.equipamientoEspecialRequerido.length > 0
    ? request.equipamientoEspecialRequerido.join(', ')
    : 'Ninguno específico';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            <ListChecks className="mr-2 h-6 w-6"/>
            Detalles del Servicio Programado
          </DialogTitle>
          <DialogDescription>
            ID Servicio: {request.id}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-3" />

        <div className="space-y-3 overflow-y-auto px-1 py-2 flex-grow text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <DetailItemModal icon={User} label="Paciente" value={request.nombrePaciente} highlight/>
                <DetailItemModal icon={FileText} label="DNI/NIE/SS" value={request.dniNieSsPaciente} />
                <DetailItemModal icon={Info} label="Tipo de Servicio" value={translateTipoServicio(request.tipoServicio)} />
                <DetailItemModal icon={Edit} label="Tipo de Traslado" value={translateTipoTraslado(request.tipoTraslado)} />
                <DetailItemModal icon={MapPin} label="Origen" value={request.centroOrigen} />
                <DetailItemModal icon={MapPin} label="Destino" value={request.destino} />
                <DetailItemModal icon={CalendarDays} label="Fecha Ida" value={format(parseISO(request.fechaIda), "PPP", { locale: es })} />
                <DetailItemModal icon={Clock} label="Hora Ida / Cita" value={`${request.horaIda}${request.horaConsultaMedica ? ` (Cita: ${request.horaConsultaMedica})` : ''}`} />
                <DetailItemModal icon={BriefcaseMedical} label="Medio Requerido" value={translateMedioRequeridoModal(request.medioRequerido)} />
                <DetailItemModal icon={AlertTriangle} label="Prioridad" value={
                    <span className={PRIORITY_STYLES_PROG[request.priority]}>
                        {translatePriorityModal(request.priority)}
                    </span>
                }/>
                <DetailItemModal icon={Edit} label="Estado" value={
                     <Badge variant="outline" className={`${STATUS_COLORS_PROG[request.status]} text-xs px-2.5 py-1`}>
                        {translateProgrammedRequestStatusModal(request.status)}
                    </Badge>
                }/>
                 {request.loteId && (
                     <DetailItemModal icon={Link2} label="Lote Asignado" value={
                        <Link href={`/admin/lotes/${request.loteId}`} className="text-blue-600 hover:underline" onClick={onClose}>
                            {request.loteId}
                        </Link>
                     } />
                 )}
            </div>
            
            <Separator className="my-2" />
            <h4 className="font-semibold text-sm text-secondary mt-2">Detalles Adicionales</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <DetailItemModal icon={Info} label="Equipamiento Especial" value={equipamientoSolicitado} className="md:col-span-2"/>
                <DetailItemModal icon={Info} label="Barreras Arquitectónicas" value={request.barrerasArquitectonicas} className="md:col-span-2"/>
                <DetailItemModal icon={Info} label="Necesidades Especiales" value={request.necesidadesEspeciales} className="md:col-span-2"/>
                <DetailItemModal icon={Info} label="Observaciones Médicas" value={request.observacionesMedicasAdicionales} className="md:col-span-2"/>
                {request.servicioPersonaResponsable && <DetailItemModal icon={User} label="Servicio/Persona Responsable" value={request.servicioPersonaResponsable} />}
                {request.autorizacionMedicaPdf && <DetailItemModal icon={FileText} label="Autorización Médica" value={request.autorizacionMedicaPdf} />}
            </div>
            
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                 <DetailItemModal icon={CalendarDays} label="Fecha de Creación" value={format(parseISO(request.createdAt), "PPPp", { locale: es })}/>
                 <DetailItemModal icon={CalendarDays} label="Última Actualización" value={format(parseISO(request.updatedAt), "PPPp", { locale: es })}/>
            </div>

            {request.assignedAmbulanceId && (
                 <>
                    <Separator className="my-2" />
                    <DetailItemModal icon={BriefcaseMedical} label="Ambulancia Asignada (Directa)" value={request.assignedAmbulanceId} highlight />
                </>
            )}
        </div>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

