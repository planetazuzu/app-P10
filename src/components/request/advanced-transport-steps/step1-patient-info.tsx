
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

export default function Step1PatientInfo({ formData, updateFormData, errors }: StepProps) {
  return (
    <div>
      <h2 className="section-title mb-4">Información del paciente</h2>
      <CardDescription className="mb-6">Proporcione los datos del paciente y el tipo de servicio requerido. Los campos con * son obligatorios.</CardDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="patientName">Nombre del Paciente *</Label>
          <Input 
            id="patientName" 
            value={formData.patientName || ''} 
            onChange={(e) => updateFormData({ patientName: e.target.value })}
            placeholder="Nombre completo del paciente"
            className={errors?.patientName ? "border-red-500" : ""}
          />
          {errors?.patientName && <p className="text-sm text-red-500 mt-1">{errors.patientName}</p>}
        </div>
        <div>
          <Label htmlFor="patientId">Identificador del Paciente (DNI, SS, etc.) *</Label>
          <Input 
            id="patientId" 
            value={formData.patientId || ''} 
            onChange={(e) => updateFormData({ patientId: e.target.value })}
            placeholder="DNI, Nº Seguridad Social, etc."
            className={errors?.patientId ? "border-red-500" : ""}
          />
          {errors?.patientId && <p className="text-sm text-red-500 mt-1">{errors.patientId}</p>}
        </div>
        <div>
          <Label htmlFor="serviceType">Tipo de Servicio/Motivo del Traslado *</Label>
          <Input 
            id="serviceType" 
            value={formData.serviceType || ''} 
            onChange={(e) => updateFormData({ serviceType: e.target.value })}
            placeholder="Ej: Consulta médica, rehabilitación, diálisis"
            className={errors?.serviceType ? "border-red-500" : ""}
          />
          {errors?.serviceType && <p className="text-sm text-red-500 mt-1">{errors.serviceType}</p>}
        </div>
         <div>
          <Label htmlFor="patientContact">Teléfono de Contacto (Paciente o Responsable)</Label>
          <Input 
            id="patientContact" 
            type="tel"
            value={formData.patientContact || ''} 
            onChange={(e) => updateFormData({ patientContact: e.target.value })}
            placeholder="Número de teléfono"
            className={errors?.patientContact ? "border-red-500" : ""}
          />
          {errors?.patientContact && <p className="text-sm text-red-500 mt-1">{errors.patientContact}</p>}
        </div>
        <div>
          <Label htmlFor="patientObservations">Observaciones sobre el Paciente</Label>
          <Textarea
            id="patientObservations"
            value={formData.patientObservations || ''}
            onChange={(e) => updateFormData({ patientObservations: e.target.value })}
            placeholder="Alergias conocidas, movilidad reducida, condiciones preexistentes relevantes, etc."
            rows={3}
            className={errors?.patientObservations ? "border-red-500" : ""}
          />
          {errors?.patientObservations && <p className="text-sm text-red-500 mt-1">{errors.patientObservations}</p>}
        </div>
      </div>
    </div>
  );
}
