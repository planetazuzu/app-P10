'use client';

import type { SuggestOptimalDispatchOutput } from '@/ai/flows/suggest-optimal-dispatch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ambulance, Lightbulb } from 'lucide-react';

interface DispatchSuggestionProps {
  suggestion: SuggestOptimalDispatchOutput | null;
  isLoading: boolean;
}

export function DispatchSuggestion({ suggestion, isLoading }: DispatchSuggestionProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 animate-pulse">
        <CardHeader>
          <CardTitle className="section-title">Sugerencia de IA</CardTitle>
          <CardDescription>Analizando datos para encontrar el despacho óptimo...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestion) {
    return null; // O un mensaje de marcador de posición si se prefiere
  }

  return (
    <Card className="mt-6 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            Sugerencia de Despacho IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-primary/10 border-primary/30">
          <Ambulance className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary text-lg">Despachar: {suggestion.optimalAmbulance}</AlertTitle>
          <AlertDescription className="text-foreground/80">
            {suggestion.reasoning}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
