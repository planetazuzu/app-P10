
'use client';

import React, { useState } from 'react';
import { DispatchForm } from '@/components/dispatch/dispatch-form';
import { DispatchSuggestion } from '@/components/dispatch/dispatch-suggestion';
import type { PlanDispatchForBatchOutput } from '@/ai/flows/plan-dispatch-for-batch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function SmartDispatchPage() {
  const [suggestion, setSuggestion] = useState<PlanDispatchForBatchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <h1 className="page-title mb-8">Despacho Inteligente IA</h1>
      <Card className="mb-6">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-secondary">Motor de Planificación para Lotes de Servicios</CardTitle>
            </div>
          <CardDescription>
            Proporcione una descripción del lote de servicios y los datos contextuales para recibir una sugerencia de planificación impulsada por IA.
            Esta herramienta considera las necesidades de los pacientes, el tráfico, el clima y la disponibilidad de vehículos para proponer un plan de despacho.
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
