
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Placeholder, could be Select, Checkboxes etc.

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
}

export default function Step4Configuration({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Configuración</h2>
      <CardDescription className="mb-6">Seleccione el tipo de transporte y otras opciones adicionales.</CardDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="transportType">Tipo de Transporte</Label>
          <Input 
            id="transportType" 
            value={formData.transportType || ''} 
            onChange={(e) => updateFormData({ transportType: e.target.value as any })} // Cast as any for now
            placeholder="Ej: A1, Programado, SVB (si aplica)"
          />
        </div>
        <div>
          <Label htmlFor="additionalOptions">Opciones Adicionales</Label>
          <Input 
            id="additionalOptions" 
            value={(formData.additionalOptions || []).join(', ')} 
            onChange={(e) => updateFormData({ additionalOptions: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="Ej: Requiere oxígeno, Acompañante"
          />
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Este es un marcador de posición para el Paso 4.</p>
    </div>
  );
}
