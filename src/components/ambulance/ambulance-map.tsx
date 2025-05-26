
'use client';

import type { Ambulance, AmbulanceStatus } from '@/types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect } from 'react';

// Fix for default Leaflet icon path issue with Next.js/Webpack
if (typeof window !== 'undefined' && L.Icon.Default.prototype.options) {
  // Check if _getIconUrl exists before trying to delete it to prevent errors if already fixed
  if ((L.Icon.Default.prototype as any)._getIconUrl) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
  switch (status) {
    case "available": return "Disponible";
    case "busy": return "Ocupada";
    case "maintenance": return "Mantenimiento";
    case "unavailable": return "No Disponible";
    default: return status;
  }
};

const FlyToSelectedAmbulance: React.FC<{ ambulance: Ambulance | null }> = ({ ambulance }) => {
  const map = useMap();
  useEffect(() => {
    if (ambulance && ambulance.latitude && ambulance.longitude) {
      map.flyTo([ambulance.latitude, ambulance.longitude], 15); // Zoom level 15
    }
  }, [ambulance, map]);
  return null;
};

interface AmbulanceMapProps {
  ambulances: Ambulance[];
  selectedAmbulance: Ambulance | null;
  onAmbulanceSelect: (ambulance: Ambulance | null) => void;
}

export function AmbulanceMap({ ambulances, selectedAmbulance, onAmbulanceSelect }: AmbulanceMapProps) {
  const defaultPosition: L.LatLngExpression = [42.4659, -2.4487]; // Logroño, La Rioja

  // Removed mapRef, whenCreated, and useEffect for manual cleanup.
  // Relying on MapContainer's internal lifecycle management.

  return (
    <MapContainer
      center={defaultPosition}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-inner"
      // placeholder can be used if needed, e.g., for a loading state within MapContainer
      // placeholder={<div className="flex items-center justify-center h-full">Cargando mapa...</div>}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {ambulances.map((ambulance) => {
        if (ambulance.latitude && ambulance.longitude) {
          return (
            <Marker
              key={ambulance.id}
              position={[ambulance.latitude, ambulance.longitude]}
              eventHandlers={{
                click: () => {
                  onAmbulanceSelect(ambulance);
                },
              }}
            >
              <Popup>
                <strong>{ambulance.name}</strong><br />
                Tipo: {ambulance.type}<br />
                Estado: {getAmbulanceStatusLabel(ambulance.status)}<br />
                <button
                  onClick={() => onAmbulanceSelect(ambulance)}
                  className="text-primary hover:underline text-sm mt-1"
                >
                  Ver Detalles
                </button>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
      <FlyToSelectedAmbulance ambulance={selectedAmbulance} />
    </MapContainer>
  );
}
