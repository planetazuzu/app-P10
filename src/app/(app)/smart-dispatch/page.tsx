'use client';

import React, { useState } from 'react';
import { DispatchForm } from '@/components/dispatch/dispatch-form';
import { DispatchSuggestion } from '@/components/dispatch/dispatch-suggestion';
import type { SuggestOptimalDispatchOutput } from '@/ai/flows/suggest-optimal-dispatch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function SmartDispatchPage() {
  const [suggestion, setSuggestion] = useState<SuggestOptimalDispatchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <h1 className="page-title mb-8">Despacho Inteligente IA</h1>
      <Card className="mb-6">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-secondary">Motor de Despacho Óptimo</CardTitle>
            </div>
          <CardDescription>
            Proporcione datos en tiempo real para recibir una sugerencia impulsada por IA para el mejor despacho de ambulancia.
            Esta herramienta considera las necesidades del paciente, el tráfico, el clima y la disponibilidad de vehículos.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <DispatchForm onSuggestion={setSuggestion} setIsLoading={setIsLoading} />
        <DispatchSuggestion suggestion={suggestion} isLoading={isLoading} />
      </div>
    </div>
  );
}
