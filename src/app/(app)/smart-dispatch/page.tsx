
'use client';

import React, { useState, useEffect } from 'react';
import { DispatchForm } from '@/components/dispatch/dispatch-form';
import { DispatchSuggestion } from '@/components/dispatch/dispatch-suggestion';
import type { PlanDispatchForBatchOutput } from '@/ai/flows/plan-dispatch-for-batch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ListFilter, Loader2, ClipboardList } from 'lucide-react';
import type { ProgrammedTransportRequest } from '@/types';
import { getProgrammedTransportRequestsForPlanning } from '@/lib/request-data';
import { ServiceSelectionTable } from '@/components/dispatch/service-selection-table';
import { useToast } from '@/hooks/use-toast';

export default function SmartDispatchPage() {
  const [suggestion, setSuggestion] = useState<PlanDispatchForBatchOutput | null>(null);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  const [plannableServices, setPlannableServices] = useState<ProgrammedTransportRequest[]>([]);
  const [selectedServices, setSelectedServices] = useState<ProgrammedTransportRequest[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchServices() {
      setIsLoadingServices(true);
      try {
        const services = await getProgrammedTransportRequestsForPlanning();
        setPlannableServices(services);
      } catch (error) {
        console.error("Error fetching plannable services:", error);
        toast({ title: "Error", description: "No se pudieron cargar los servicios para planificar.", variant: "destructive"});
      } finally {
        setIsLoadingServices(false);
      }
    }
    fetchServices();
  }, [toast]);

  const handleSelectedServicesChange = (newSelectedServices: ProgrammedTransportRequest[]) => {
    setSelectedServices(newSelectedServices);
  };

  return (
    <div>
      <h1 className="page-title mb-8">Despacho Inteligente IA para Lotes</h1>
      
      <Card className="mb-6">
        <CardHeader>
            <div className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-secondary">Selección de Servicios para Planificar</CardTitle>
            </div>
          <CardDescription>
            Seleccione los servicios programados que desea incluir en el lote para la planificación asistida por IA.
            La IA considerará estos servicios, junto con el contexto operacional, para proponer un plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingServices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span>Cargando servicios programados...</span>
            </div>
          ) : plannableServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No hay servicios programados pendientes de planificación en este momento.</p>
          ) : (
            <ServiceSelectionTable 
              services={plannableServices}
              onSelectionChange={handleSelectedServicesChange}
            />
          )}
        </CardContent>
      </Card>

      {selectedServices.length > 0 && (
        <Card className="mb-6">
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <ListFilter className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-secondary">Contexto Operacional y Obtener Plan</CardTitle>
                </div>
                <CardDescription>
                    Proporcione el contexto operacional actual. La IA utilizará esta información junto con los ({selectedServices.length}) servicios seleccionados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DispatchForm 
                    onSuggestion={setSuggestion} 
                    setIsLoading={setIsAISuggestionLoading} 
                    selectedServicesToPlan={selectedServices}
                />
            </CardContent>
        </Card>
      )}
      
      {!isAISuggestionLoading && selectedServices.length === 0 && !isLoadingServices && (
         <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-secondary">Plan de Despacho IA</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-6">Por favor, seleccione al menos un servicio de la lista de arriba para generar un plan de despacho.</p>
            </CardContent>
        </Card>
      )}

      <DispatchSuggestion suggestion={suggestion} isLoading={isAISuggestionLoading} />
    </div>
  );
}
