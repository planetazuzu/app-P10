
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
}

export default function Step1PatientInfo({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Información del paciente</h2>
      <CardDescription className="mb-6">Proporcione los datos del paciente y el tipo de servicio requerido.</CardDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="patientName">Nombre del Paciente</Label>
          <Input 
            id="patientName" 
            value={formData.patientName || ''} 
            onChange={(e) => updateFormData({ patientName: e.target.value })}
            placeholder="Nombre completo del paciente"
          />
        </div>
        <div>
          <Label htmlFor="patientId">Identificador del Paciente (DNI, SS, etc.)</Label>
          <Input 
            id="patientId" 
            value={formData.patientId || ''} 
            onChange={(e) => updateFormData({ patientId: e.target.value })}
            placeholder="DNI, Nº Seguridad Social, etc."
          />
        </div>
        <div>
          <Label htmlFor="serviceType">Tipo de Servicio</Label>
          <Input 
            id="serviceType" 
            value={formData.serviceType || ''} 
            onChange={(e) => updateFormData({ serviceType: e.target.value })}
            placeholder="Ej: Consulta médica, rehabilitación, diálisis"
          />
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Este es un marcador de posición para el Paso 1. Se añadirán más campos y validación.</p>
    </div>
  );
}
