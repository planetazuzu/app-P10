
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
  errors?: Record<string, string | undefined>;
}

export default function Step3Locations({ formData, updateFormData, errors }: StepProps) {
  return (
    <div>
      <h2 className="section-title mb-4">Ubicaciones</h2>
      <CardDescription className="mb-6">Especifique el origen y el destino del transporte. Los campos con * son obligatorios.</CardDescription>
      
      <div className="space-y-6">
        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-sm font-medium text-muted-foreground px-1">Origen del Traslado</legend>
            <div>
              <Label htmlFor="originAddress">Dirección de Origen *</Label>
              <Input 
                id="originAddress" 
                value={formData.originAddress || ''} 
                onChange={(e) => updateFormData({ originAddress: e.target.value })}
                placeholder="Calle, número, piso, puerta, localidad, código postal"
                className={errors?.originAddress ? "border-red-500" : ""}
              />
              {errors?.originAddress && <p className="text-sm text-red-500 mt-1">{errors.originAddress}</p>}
            </div>
            <div>
              <Label htmlFor="originDetails">Detalles Adicionales del Origen</Label>
              <Textarea 
                id="originDetails" 
                value={formData.originDetails || ''} 
                onChange={(e) => updateFormData({ originDetails: e.target.value })}
                placeholder="Ej: Nombre del centro, contacto en origen, indicaciones especiales para la recogida."
                rows={2}
                className={errors?.originDetails ? "border-red-500" : ""}
              />
              {errors?.originDetails && <p className="text-sm text-red-500 mt-1">{errors.originDetails}</p>}
            </div>
        </fieldset>

        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-sm font-medium text-muted-foreground px-1">Destino del Traslado</legend>
            <div>
              <Label htmlFor="destinationAddress">Dirección de Destino *</Label>
              <Input 
                id="destinationAddress" 
                value={formData.destinationAddress || ''} 
                onChange={(e) => updateFormData({ destinationAddress: e.target.value })}
                placeholder="Calle, número, piso, puerta, localidad, código postal"
                className={errors?.destinationAddress ? "border-red-500" : ""}
              />
              {errors?.destinationAddress && <p className="text-sm text-red-500 mt-1">{errors.destinationAddress}</p>}
            </div>
            <div>
              <Label htmlFor="destinationDetails">Detalles Adicionales del Destino</Label>
              <Textarea 
                id="destinationDetails" 
                value={formData.destinationDetails || ''} 
                onChange={(e) => updateFormData({ destinationDetails: e.target.value })}
                placeholder="Ej: Nombre del hospital/clínica, departamento, contacto en destino."
                rows={2}
                className={errors?.destinationDetails ? "border-red-500" : ""}
              />
              {errors?.destinationDetails && <p className="text-sm text-red-500 mt-1">{errors.destinationDetails}</p>}
            </div>
        </fieldset>
      </div>
    </div>
  );
}
