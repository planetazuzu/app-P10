'use client';

import type { Ambulance } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface AmbulanceMapProps {
  ambulances: Ambulance[];
  selectedAmbulance: Ambulance | null;
  onAmbulanceSelect: (ambulance: Ambulance | null) => void;
}

// Helper para traducir el estado de la ambulancia
const translateStatus = (status: 'available' | 'unavailable' | 'on-mission'): string => {
  switch (status) {
    case 'available':
      return 'disponible';
    case 'unavailable':
      return 'no disponible';
    case 'on-mission':
      return 'en misión';
    default:
      return status;
  }
};


export function AmbulanceMap({ ambulances, selectedAmbulance, onAmbulanceSelect }: AmbulanceMapProps) {
  // In a real application, this would use a map library like Vis.gl, Leaflet, or Google Maps API.
  // For this mock, we'll display a placeholder image and a list of ambulances.

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="section-title">Ubicaciones en Vivo de Ambulancias</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3 h-64 md:h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
          <Image 
            src="https://placehold.co/800x600.png" 
            alt="Marcador de posición del mapa" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="city map"
          />
          <p className="z-10 p-4 bg-black/50 text-white rounded">La integración del mapa (ej. Vis.gl) estaría aquí.</p>
          {/* Example of how ambulance markers might be (conceptually) */}
          {ambulances.map(amb => (
            <div key={amb.id} 
                 title={`${amb.name} (${translateStatus(amb.status)})`}
                 className="absolute w-3 h-3 bg-primary rounded-full opacity-0" // Hidden, just for concept
                 // style={{ left: `${(amb.longitude - minLng) / (maxLng - minLng) * 100}%`, top: `${(maxLat - amb.latitude) / (maxLat - minLat) * 100}%` }}
            />
          ))}
        </div>
        <div className="md:w-1/3 h-64 md:h-full overflow-y-auto border rounded-lg p-2 bg-background">
          <h3 className="font-semibold mb-2 text-secondary">Unidades Disponibles:</h3>
          {ambulances.length > 0 ? (
            <ul className="space-y-1">
              {ambulances.map((ambulance) => (
                <li key={ambulance.id}>
                  <button
                    onClick={() => onAmbulanceSelect(ambulance)}
                    className={`w-full text-left p-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors
                                ${selectedAmbulance?.id === ambulance.id ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                  >
                    <p className="font-medium">{ambulance.name}</p>
                    <p className={`text-xs ${selectedAmbulance?.id === ambulance.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      Tipo: {ambulance.type} - Estado: <span className={`font-semibold ${ambulance.status === 'available' ? 'text-green-600' : ambulance.status === 'on-mission' ? 'text-yellow-600' : 'text-red-600'}`}>{translateStatus(ambulance.status)}</span>
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ninguna ambulancia coincide con los filtros.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
