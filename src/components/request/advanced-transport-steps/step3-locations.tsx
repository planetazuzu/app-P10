
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
}

export default function Step3Locations({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Ubicaciones</h2>
      <CardDescription className="mb-6">Especifique el origen y el destino del transporte, así como cualquier detalle relevante.</CardDescription>
      
      <div className="space-y-6">
        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-sm font-medium text-muted-foreground px-1">Origen del Traslado</legend>
            <div>
              <Label htmlFor="originAddress">Dirección de Origen</Label>
              <Input 
                id="originAddress" 
                value={formData.originAddress || ''} 
                onChange={(e) => updateFormData({ originAddress: e.target.value })}
                placeholder="Calle, número, piso, puerta, localidad, código postal"
              />
            </div>
            <div>
              <Label htmlFor="originDetails">Detalles Adicionales del Origen</Label>
              <Textarea 
                id="originDetails" 
                value={formData.originDetails || ''} 
                onChange={(e) => updateFormData({ originDetails: e.target.value })}
                placeholder="Ej: Nombre del centro, contacto en origen, indicaciones especiales para la recogida."
                rows={2}
              />
            </div>
        </fieldset>

        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-sm font-medium text-muted-foreground px-1">Destino del Traslado</legend>
            <div>
              <Label htmlFor="destinationAddress">Dirección de Destino</Label>
              <Input 
                id="destinationAddress" 
                value={formData.destinationAddress || ''} 
                onChange={(e) => updateFormData({ destinationAddress: e.target.value })}
                placeholder="Calle, número, piso, puerta, localidad, código postal"
              />
            </div>
            <div>
              <Label htmlFor="destinationDetails">Detalles Adicionales del Destino</Label>
              <Textarea 
                id="destinationDetails" 
                value={formData.destinationDetails || ''} 
                onChange={(e) => updateFormData({ destinationDetails: e.target.value })}
                placeholder="Ej: Nombre del hospital/clínica, departamento, contacto en destino."
                rows={2}
              />
            </div>
        </fieldset>
      </div>
    </div>
  );
}
