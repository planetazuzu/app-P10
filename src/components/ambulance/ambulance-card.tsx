'use client';

import type { Ambulance, AmbulanceType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, Users, Package } from 'lucide-react';
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


export function AmbulanceCard({ ambulance, onClose }: AmbulanceCardProps) {
  if (!ambulance) {
    return null;
  }

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
      <CardContent className="space-y-3">
        <div className="w-full h-40 bg-muted rounded-md overflow-hidden relative">
            <Image 
                src={`https://placehold.co/600x400.png?text=${ambulance.type}`} 
                alt={`Ambulancia tipo ${ambulance.type}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="ambulance emergency"
             />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
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
            <p className="font-medium text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" />Capacidad</p>
            <p>{ambulance.currentPatients} / {ambulance.capacity} Pacientes</p>
          </div>
        </div>
        <div>
          <p className="font-medium text-muted-foreground text-sm flex items-center gap-1"><Package className="h-4 w-4" />Equipamiento Principal</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ambulance.equipment.slice(0, 3).map((item) => ( // Mostrar solo los primeros 3 para brevedad
              <Badge key={item} variant="outline" className="text-xs capitalize border-primary/30 text-primary/70 bg-primary/5">{item}</Badge>
            ))}
            {ambulance.equipment.length > 3 && <Badge variant="outline" className="text-xs border-primary/30 text-primary/70 bg-primary/5">...</Badge>}
          </div>
        </div>
        <Button className="w-full mt-4" variant="outline">
          Despachar esta unidad (simulado)
        </Button>
      </CardContent>
    </Card>
  );
}
