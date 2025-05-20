
'use client';

import type { Ambulance, AmbulanceType, AmbulanceEquipment } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, Users, Package, Armchair, Bed, Droplets, Wheelchair } from 'lucide-react';
import Image from 'next/image';

interface AmbulanceCardProps {
  ambulance: Ambulance | null;
  onClose: () => void;
}

// Helper para traducir el estado de la ambulancia
const translateStatus = (status: 'available' | 'unavailable' | 'on-mission'): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'unavailable':
      return 'No disponible';
    case 'on-mission':
      return 'En misión';
    default:
      return status;
  }
};

// Helper para obtener una descripción del tipo de ambulancia
const getAmbulanceTypeDescription = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "Soporte Vital Básico";
    case "SVA": return "Soporte Vital Avanzado";
    case "Convencional": return "Transporte convencional";
    case "UVI_Movil": return "Unidad de Vigilancia Intensiva móvil";
    case "A1": return "Transporte sanitario programado individual";
    case "Programado": return "Transporte sanitario programado colectivo";
    case "Otros": return "Otro tipo de vehículo";
    default: return type;
  }
}

const EquipmentDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | boolean }) => (
  <div className="flex items-center text-sm">
    <Icon className="h-4 w-4 mr-2 text-primary/80" />
    <span className="font-medium text-muted-foreground">{label}:</span>
    <span className="ml-1 font-semibold">
      {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
    </span>
  </div>
);


export function AmbulanceCard({ ambulance, onClose }: AmbulanceCardProps) {
  if (!ambulance) {
    return null;
  }

  const { equipment } = ambulance;

  return (
    <Card className="shadow-lg">
      <CardHeader className="relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
        <CardTitle className="text-xl text-secondary">{ambulance.name}</CardTitle>
        <CardDescription>ID: {ambulance.id.substring(0,8)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4"> {/* Increased spacing */}
        <div className="w-full h-40 bg-muted rounded-md overflow-hidden relative">
            <Image
                src={`https://placehold.co/600x400.png?text=${ambulance.type}`}
                alt={`Ambulancia tipo ${ambulance.type}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="ambulance emergency"
             />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"> {/* Adjusted gap */}
          <div>
            <p className="font-medium text-muted-foreground flex items-center gap-1"><HelpCircle className="h-4 w-4" />Tipo</p>
            <p className="font-semibold text-primary">{ambulance.type}</p>
            <p className="text-xs text-muted-foreground">{getAmbulanceTypeDescription(ambulance.type)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Estado</p>
            <Badge
              variant={ambulance.status === 'available' ? 'default' : ambulance.status === 'on-mission' ? 'secondary' : 'destructive'}
              className={`text-xs ${ambulance.status === 'available' ? 'bg-green-100 text-green-700 border-green-300' :
                         ambulance.status === 'on-mission' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                         'bg-red-100 text-red-700 border-red-300'}`}
            >
              {translateStatus(ambulance.status)}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-muted-foreground">Ubicación (Lat, Lng)</p>
            <p>{ambulance.latitude.toFixed(4)}, {ambulance.longitude.toFixed(4)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" />Capacidad Total</p>
            <p>{ambulance.capacity} Paciente(s)</p>
          </div>
           <div>
            <p className="font-medium text-muted-foreground">Pacientes Actuales</p>
            <p>{ambulance.currentPatients}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-md text-secondary mb-2 flex items-center gap-1">
            <Package className="h-5 w-5 text-primary" />
            Equipamiento Principal
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-2 border-l-2 border-primary/20">
            <EquipmentDetailItem icon={Users} label="Asientos" value={equipment.seats} />
            <EquipmentDetailItem icon={Wheelchair} label="Sillas Ruedas" value={equipment.wheelchairSlots} />
            <EquipmentDetailItem icon={Bed} label="Camilla" value={equipment.stretcher} />
            <EquipmentDetailItem icon={Armchair} label="Sillas Port." value={equipment.chairs} />
            <EquipmentDetailItem icon={Droplets} label="Unid. Oxígeno" value={equipment.oxygenUnits} />
          </div>
        </div>

        <Button className="w-full mt-4" variant="outline">
          Despachar esta unidad (simulado)
        </Button>
      </CardContent>
    </Card>
  );
}
