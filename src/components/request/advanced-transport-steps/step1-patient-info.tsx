
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
          <Label htmlFor="serviceType">Tipo de Servicio/Motivo del Traslado</Label>
          <Input 
            id="serviceType" 
            value={formData.serviceType || ''} 
            onChange={(e) => updateFormData({ serviceType: e.target.value })}
            placeholder="Ej: Consulta médica, rehabilitación, diálisis"
          />
        </div>
         <div>
          <Label htmlFor="patientContact">Teléfono de Contacto (Paciente o Responsable)</Label>
          <Input 
            id="patientContact" 
            type="tel"
            value={formData.patientContact || ''} 
            onChange={(e) => updateFormData({ patientContact: e.target.value })}
            placeholder="Número de teléfono"
          />
        </div>
        <div>
          <Label htmlFor="patientObservations">Observaciones sobre el Paciente</Label>
          <Textarea
            id="patientObservations"
            value={formData.patientObservations || ''}
            onChange={(e) => updateFormData({ patientObservations: e.target.value })}
            placeholder="Alergias conocidas, movilidad reducida, condiciones preexistentes relevantes, etc."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
