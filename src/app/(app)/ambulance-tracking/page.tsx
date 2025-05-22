
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Ambulance, AmbulanceType, AmbulanceStatus } from '@/types';
import { getAmbulances } from '@/lib/ambulance-data';
// import { AmbulanceMap } from '@/components/ambulance/ambulance-map'; // Original import
import { AmbulanceFilters } from '@/components/ambulance/ambulance-filters';
import { AmbulanceCard as AmbulanceDetailCard } from '@/components/ambulance/ambulance-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const AMBULANCE_TYPES: AmbulanceType[] = ["SVB", "SVA", "Convencional", "UVI_Movil", "A1", "Programado", "Otros"];
const AMBULANCE_STATUSES_FILTER: AmbulanceStatus[] = ['available', 'busy', 'maintenance', 'unavailable']; // Renamed to avoid conflict with type

// Dynamically import AmbulanceMap component
const AmbulanceMap = dynamic(() => 
  import('@/components/ambulance/ambulance-map').then(mod => mod.AmbulanceMap), 
  { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" /> 
  }
);


export default function AmbulanceTrackingPage() {
  const [allAmbulances, setAllAmbulances] = useState<Ambulance[]>([]);
  const [filteredAmbulances, setFilteredAmbulances] = useState<Ambulance[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [selectedType, setSelectedType] = useState<AmbulanceType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AmbulanceStatus | 'all'>('available'); // Default to available
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // To ensure map renders only client-side initially

  useEffect(() => {
    setIsMounted(true); // Component has mounted
    async function fetchData() {
      setIsLoading(true);
      const data = await getAmbulances();
      setAllAmbulances(data);
      setIsLoading(false);
    }
    fetchData();
    
    const intervalId = setInterval(fetchData, 30000); 
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let ambulances = allAmbulances;
    if (selectedType !== 'all') {
      ambulances = ambulances.filter(amb => amb.type === selectedType);
    }
    if (selectedStatus !== 'all') {
      ambulances = ambulances.filter(amb => amb.status === selectedStatus);
    }
    setFilteredAmbulances(ambulances);
    if (selectedAmbulance && !ambulances.find(amb => amb.id === selectedAmbulance.id)) {
        setSelectedAmbulance(null);
    }
  }, [allAmbulances, selectedType, selectedStatus, selectedAmbulance]);

  const handleAmbulanceSelect = (ambulance: Ambulance | null) => {
    setSelectedAmbulance(ambulance);
  };

  const handleCloseDetailCard = () => {
    setSelectedAmbulance(null);
  }

  if (!isMounted || (isLoading && allAmbulances.length === 0)) {
    return (
      <div>
        <h1 className="page-title mb-8">Seguimiento de Ambulancias</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[380px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-8">Seguimiento de Ambulancias</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-2 lg:col-span-3 h-[calc(100vh-12rem)] min-h-[500px] rounded-lg overflow-hidden shadow-md">
          <AmbulanceMap 
            ambulances={filteredAmbulances} 
            selectedAmbulance={selectedAmbulance}
            onAmbulanceSelect={handleAmbulanceSelect}
          />
        </div>
        <div className="space-y-6 md:sticky md:top-20">
          <AmbulanceFilters
            types={AMBULANCE_TYPES}
            statuses={AMBULANCE_STATUSES_FILTER}
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onTypeChange={setSelectedType}
            onStatusChange={(value) => setSelectedStatus(value as AmbulanceStatus | 'all')}
          />
          {selectedAmbulance && (
            <AmbulanceDetailCard ambulance={selectedAmbulance} onClose={handleCloseDetailCard} />
          )}
           {!selectedAmbulance && filteredAmbulances.length > 0 && (
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Seleccione una ambulancia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Haga clic en una ambulancia en el mapa para ver sus detalles.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
