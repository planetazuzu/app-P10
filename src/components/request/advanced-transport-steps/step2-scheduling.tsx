
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
}

export default function Step2Scheduling({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Programación</h2>
      <CardDescription className="mb-6">Configure la recurrencia y las fechas para los traslados.</CardDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="recurrence">Recurrencia</Label>
          <Input 
            id="recurrence" 
            value={formData.recurrence || ''} 
            onChange={(e) => updateFormData({ recurrence: e.target.value })}
            placeholder="Ej: Diario, Semanal (L, M, X), Fechas específicas"
          />
        </div>
        {/* Aquí iría un selector de fechas más complejo o un calendario múltiple */}
         <div>
          <Label htmlFor="dates">Fechas (Ejemplo)</Label>
          <Input 
            id="dates" 
            type="text"
            value={formData.dates ? formData.dates.map(d => d.toLocaleDateString()).join(', ') : ''} 
            onChange={(e) => { /* Lógica para parsear fechas */}}
            placeholder="DD/MM/AAAA, DD/MM/AAAA"
          />
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Este es un marcador de posición para el Paso 2. Se implementarán selectores de recurrencia y fechas.</p>
    </div>
  );
}
