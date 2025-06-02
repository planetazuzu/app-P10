
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Ambulance, AmbulanceType, AmbulanceStatus } from '@/types';
import { getAmbulances } from '@/lib/ambulance-data';
import { AmbulanceFilters } from '@/components/ambulance/ambulance-filters';
import { AmbulanceCard as AmbulanceDetailCard } from '@/components/ambulance/ambulance-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';

const AMBULANCE_TYPES: AmbulanceType[] = ["SVB", "SVA", "Convencional", "UVI_Movil", "A1", "Programado", "Otros"];
const AMBULANCE_STATUSES_FILTER: AmbulanceStatus[] = ['available', 'busy', 'maintenance', 'unavailable'];

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
  const [selectedStatus, setSelectedStatus] = useState<AmbulanceStatus | 'all'>('available');
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async (isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const data = await getAmbulances();
      setAllAmbulances(data);
    } catch (error) {
      console.error("Error al cargar ambulancias para seguimiento:", error);
      toast({ title: "Error de Carga", description: "No se pudieron cargar las ambulancias desde la API.", variant: "destructive" });
      setAllAmbulances([]);
    }
    if (isInitialLoad) {
      setIsLoading(false);
    }
  }, [toast, setIsLoading, setAllAmbulances]);

  useEffect(() => {
    setIsMounted(true);
    fetchData(true); // Indicate initial load
    
    const intervalId = setInterval(() => fetchData(false), 30000); // Subsequent loads are not "initial"
    return () => clearInterval(intervalId);
  }, [fetchData, setIsMounted]);

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
        <div className="md:col-span-2 lg:col-span-3 h-[50vh] md:h-[calc(100vh-12rem)] rounded-lg overflow-hidden shadow-md">
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
           {!selectedAmbulance && filteredAmbulances.length === 0 && !isLoading && (
             <Card className="hidden md:block">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Sin Ambulancias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No hay ambulancias para mostrar con los filtros actuales o la API no devolvió datos.</p>
              </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}
