
'use client';

import type { PlanDispatchForBatchOutput } from '@/ai/flows/plan-dispatch-for-batch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ambulance, Lightbulb, ListChecks } from 'lucide-react';

interface DispatchSuggestionProps {
  suggestion: PlanDispatchForBatchOutput | null;
  isLoading: boolean;
}

export function DispatchSuggestion({ suggestion, isLoading }: DispatchSuggestionProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 animate-pulse">
        <CardHeader>
          <CardTitle className="section-title">Plan de Despacho IA</CardTitle>
          <CardDescription>Analizando datos para generar el plan para el lote de servicios...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-full mt-2"></div>
          <div className="h-4 bg-muted rounded w-4/6"></div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestion) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="section-title flex items-center gap-2">
                    <Lightbulb className="h-7 w-7 text-primary" />
                    Plan de Despacho IA
                </CardTitle>
                <CardDescription>Esperando información del lote para generar un plan.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Introduzca la descripción del lote de servicios y los factores contextuales en el formulario para obtener una sugerencia de planificación.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mt-6 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            Plan de Despacho IA Propuesto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <ListChecks className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary text-lg">Plan General de Despacho:</AlertTitle>
          <AlertDescription className="text-foreground/90 whitespace-pre-line">
            {suggestion.dispatchPlan}
          </AlertDescription>
        </Alert>

        {suggestion.suggestedAmbulances && suggestion.suggestedAmbulances.length > 0 && (
          <div>
            <h4 className="font-semibold text-md text-secondary mb-2">Ambulancias Sugeridas Específicamente:</h4>
            <ul className="space-y-2">
              {suggestion.suggestedAmbulances.map((amb, index) => (
                <li key={index} className="p-3 border rounded-md bg-muted/50">
                  <p className="font-medium text-secondary-foreground flex items-center gap-1.5">
                    <Ambulance className="h-4 w-4 text-primary"/>
                    Vehículo: {amb.id}
                  </p>
                  <p className="text-sm text-muted-foreground pl-6">{amb.assignedServicesSummary}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
