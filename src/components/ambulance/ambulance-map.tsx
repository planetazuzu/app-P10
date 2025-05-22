
'use client';

import type { Ambulance, AmbulanceStatus } from '@/types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect, useRef } from 'react';

// Fix for default Leaflet icon path issue with Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface AmbulanceMapProps {
  ambulances: Ambulance[];
  selectedAmbulance: Ambulance | null;
  onAmbulanceSelect: (ambulance: Ambulance | null) => void;
}

// Helper to translate status for display in popup
const translateStatusForPopup = (status: AmbulanceStatus): string => {
  switch (status) {
    case 'available': return 'Disponible';
    case 'busy': return 'Ocupada';
    case 'maintenance': return 'Mantenimiento';
    case 'unavailable': return 'No Disponible';
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

export function AmbulanceMap({ ambulances, selectedAmbulance, onAmbulanceSelect }: AmbulanceMapProps) {
  const defaultPosition: L.LatLngExpression = [42.4659, -2.4487]; // Logroño, La Rioja
  const mapRef = useRef<L.Map | null>(null); // Use a ref to hold the map instance

  useEffect(() => {
    // This effect hook is primarily for cleanup.
    // The cleanup function will be called when the AmbulanceMap component unmounts.
    return () => {
      if (mapRef.current) {
        // console.log("Cleaning up map instance in AmbulanceMap:", mapRef.current);
        mapRef.current.remove();
        mapRef.current = null; // Clear the ref after removing
      }
    };
  }, []); // Empty dependency array: effect runs once on mount, cleanup runs once on unmount.

  return (
    <MapContainer
      // The `whenCreated` prop sets the map instance to our ref.
      // This ensures mapRef.current is populated when the map is ready.
      whenCreated={map => { mapRef.current = map; }}
      center={defaultPosition}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-inner"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                Estado: {translateStatusForPopup(ambulance.status)}<br />
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
