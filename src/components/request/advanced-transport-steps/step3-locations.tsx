
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

export default function Step3Locations({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Ubicaciones</h2>
      <CardDescription className="mb-6">Especifique el origen y el destino del transporte.</CardDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="originAddress">Dirección de Origen</Label>
          <Input 
            id="originAddress" 
            value={formData.originAddress || ''} 
            onChange={(e) => updateFormData({ originAddress: e.target.value })}
            placeholder="Dirección completa de origen"
          />
        </div>
        <div>
          <Label htmlFor="destinationAddress">Dirección de Destino</Label>
          <Input 
            id="destinationAddress" 
            value={formData.destinationAddress || ''} 
            onChange={(e) => updateFormData({ destinationAddress: e.target.value })}
            placeholder="Dirección completa de destino"
          />
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Este es un marcador de posición para el Paso 3.</p>
    </div>
  );
}
