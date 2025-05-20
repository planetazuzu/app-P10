'use client';

import type { Ambulance } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
        <CardDescription>ID: {ambulance.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full h-40 bg-muted rounded-md overflow-hidden relative">
            <Image 
                src={`https://placehold.co/600x400.png?text=${ambulance.type}`} 
                alt={`Ambulancia tipo ${ambulance.type}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="ambulance vehicle"
             />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Tipo</p>
            <p className="font-semibold text-primary">{ambulance.type}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Estado</p>
            <Badge 
              variant={ambulance.status === 'available' ? 'default' : ambulance.status === 'on-mission' ? 'secondary' : 'destructive'}
              className={ambulance.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                         ambulance.status === 'on-mission' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                         'bg-red-500 hover:bg-red-600 text-white'}
            >
              {translateStatus(ambulance.status)}
            </Badge>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Ubicación</p>
            <p>{ambulance.latitude.toFixed(4)}, {ambulance.longitude.toFixed(4)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Capacidad</p>
            <p>{ambulance.currentPatients} / {ambulance.capacity} Pacientes</p>
          </div>
        </div>
        <div>
          <p className="font-medium text-muted-foreground text-sm">Equipamiento</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ambulance.equipment.map((item) => (
              <Badge key={item} variant="outline" className="text-xs border-primary/50 text-primary/80">{item}</Badge>
            ))}
          </div>
        </div>
        <Button className="w-full mt-4" variant="outline">
          Despachar esta unidad (simulado)
        </Button>
      </CardContent>
    </Card>
  );
}
