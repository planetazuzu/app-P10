
'use client';

import type { Ambulance, AmbulanceType, AmbulanceStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Users, Package, MapPin, Layers, ShieldAlert, Thermometer, CheckCircle, XCircle, Tool, Clock, Info } from 'lucide-react';
import Image from 'next/image';
import { equipmentOptions } from './constants'; // For mapping special equipment IDs to labels

interface AmbulanceCardProps {
  ambulance: Ambulance | null;
  onClose: () => void;
}

const getAmbulanceTypeLabel = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "Soporte Vital Básico";
    case "SVA": return "Soporte Vital Avanzado";
    case "Convencional": return "Transporte convencional";
    case "UVI_Movil": return "UVI Móvil";
    case "A1": return "Transporte programado individual";
    case "Programado": return "Transporte programado colectivo";
    case "Otros": return "Otro tipo";
    default: return type;
  }
}

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
    switch (status) {
      case "available": return "Disponible";
      case "busy": return "Ocupada / En Misión";
      case "maintenance": return "En Mantenimiento";
      case "unavailable": return "No Disponible";
      default: return status;
    }
};

const getStatusBadgeVariant = (status: AmbulanceStatus) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700 border-green-300';
        case 'busy': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-300';
        case 'unavailable': return 'bg-red-100 text-red-700 border-red-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
}

const DetailItem = ({ icon: Icon, label, value, highlight = false }: { icon: React.ElementType, label: string, value: string | number | React.ReactNode, highlight?: boolean }) => (
  <div className="flex items-start text-sm py-1">
    <Icon className={`h-4 w-4 mr-2 mt-0.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
    <span className={`font-medium ${highlight ? 'text-secondary' : 'text-muted-foreground'}`}>{label}:</span>
    <span className={`ml-1 ${highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value}</span>
  </div>
);

const BooleanDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: boolean }) => (
    <div className="flex items-center text-sm py-0.5">
      {value ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-1 font-semibold">{value ? 'Sí' : 'No'}</span>
    </div>
  );


export function AmbulanceCard({ ambulance, onClose }: AmbulanceCardProps) {
  if (!ambulance) {
    return null;
  }

  const specialEquipmentLabels = ambulance.specialEquipment
    .map(id => equipmentOptions.find(opt => opt.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="shadow-lg max-h-[calc(100vh-10rem)] overflow-y-auto">
      <CardHeader className="relative bg-muted/30">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
        <CardTitle className="text-xl text-secondary">{ambulance.name}</CardTitle>
        <CardDescription>ID: {ambulance.id} - Matrícula: {ambulance.licensePlate}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="w-full h-32 md:h-40 bg-muted rounded-md overflow-hidden relative mb-3">
            <Image
                src={`https://placehold.co/600x400.png?text=${ambulance.model}`}
                alt={`${ambulance.model} - ${getAmbulanceTypeLabel(ambulance.type)}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="ambulance vehicle"
             />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <DetailItem icon={Info} label="Modelo" value={ambulance.model} highlight />
            <DetailItem icon={Layers} label="Tipo" value={getAmbulanceTypeLabel(ambulance.type)} highlight />
            <div className="col-span-1 sm:col-span-2">
                <p className="font-medium text-muted-foreground flex items-center text-sm mt-1">
                    <ShieldAlert className="h-4 w-4 mr-2 text-primary" />Estado:
                    <Badge
                    variant={'outline'}
                    className={`ml-2 text-xs ${getStatusBadgeVariant(ambulance.status)}`}
                    >
                    {getAmbulanceStatusLabel(ambulance.status)}
                    </Badge>
                </p>
            </div>
        </div>

        <div className="border-t my-3"></div>

        <h4 className="font-semibold text-md text-secondary mb-1">Ubicación y Operativa</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <DetailItem icon={MapPin} label="Base" value={ambulance.baseLocation} />
            {ambulance.zone && <DetailItem icon={MapPin} label="Zona" value={ambulance.zone} />}
            {(ambulance.latitude && ambulance.longitude) && (
                <DetailItem icon={Thermometer} label="Coord." value={`${ambulance.latitude.toFixed(4)}, ${ambulance.longitude.toFixed(4)}`} />
            )}
            {ambulance.currentPatients !== undefined && <DetailItem icon={Users} label="Pacientes Actuales" value={ambulance.currentPatients} />}
        </div>

        <div className="border-t my-3"></div>
        
        <h4 className="font-semibold text-md text-secondary mb-1">Capacidad y Dotación</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
            <BooleanDetailItem icon={CheckCircle} label="Camilla" value={ambulance.hasMedicalBed} />
            <DetailItem icon={Users} label="Plazas Camilla" value={ambulance.stretcherSeats} />
            <BooleanDetailItem icon={CheckCircle} label="Silla Ruedas" value={ambulance.hasWheelchair} />
            <DetailItem icon={Users} label="Plazas Silla R." value={ambulance.wheelchairSeats} />
            <BooleanDetailItem icon={CheckCircle} label="Sentados/Andando" value={ambulance.allowsWalking} />
            <DetailItem icon={Users} label="Plazas Sentados" value={ambulance.walkingSeats} />
        </div>

        {ambulance.specialEquipment && ambulance.specialEquipment.length > 0 && (
            <>
                <div className="border-t my-3"></div>
                <h4 className="font-semibold text-md text-secondary mb-1">Equipamiento Especial</h4>
                <DetailItem icon={Package} label="Dotación" value={specialEquipmentLabels || 'Ninguno especificado'} />
            </>
        )}

        {ambulance.notes && (
             <>
                <div className="border-t my-3"></div>
                <h4 className="font-semibold text-md text-secondary mb-1">Notas Internas</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{ambulance.notes}</p>
            </>
        )}
        
        <Button className="w-full mt-4 btn-outline" variant="outline" disabled={ambulance.status !== 'available'}>
          {ambulance.status === 'available' ? 'Despachar esta unidad (simulado)' : `Unidad ${getAmbulanceStatusLabel(ambulance.status).toLowerCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}
