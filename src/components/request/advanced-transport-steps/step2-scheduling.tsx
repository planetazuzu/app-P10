
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
  errors?: Record<string, string | undefined>;
}

export default function Step2Scheduling({ formData, updateFormData, errors }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Programación</h2>
      <CardDescription className="mb-6">Configure la recurrencia, fechas y horarios para los traslados. Los campos con * son obligatorios.</CardDescription>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recurrenceType">Tipo de Recurrencia *</Label>
            <Select
              value={formData.recurrenceType || 'specificDates'}
              onValueChange={(value) => updateFormData({ recurrenceType: value as 'specificDates' | 'daily' | 'weekly' | 'monthly' })}
            >
              <SelectTrigger id="recurrenceType" className={errors?.recurrenceType ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar tipo de recurrencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specificDates">Fechas Específicas</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
            {errors?.recurrenceType && <p className="text-sm text-red-500 mt-1">{errors.recurrenceType}</p>}
          </div>
           <div>
            <Label htmlFor="startDate">Fecha de Inicio *</Label>
            <Input 
              id="startDate" 
              type="date"
              value={formData.startDate || ''} 
              onChange={(e) => updateFormData({ startDate: e.target.value })}
              className={errors?.startDate ? "border-red-500" : ""}
            />
            {errors?.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="specificDatesNotes">Detalles de Recurrencia / Fechas Específicas</Label>
          <Textarea 
            id="specificDatesNotes" 
            value={formData.specificDatesNotes || ''} 
            onChange={(e) => updateFormData({ specificDatesNotes: e.target.value })}
            placeholder="Si es 'Fechas Específicas', liste las fechas aquí (ej: 01/08/2024, 05/08/2024). Para otros patrones (ej: L, X, V durante 3 semanas), detalle aquí."
            rows={3}
            className={errors?.specificDatesNotes ? "border-red-500" : ""}
          />
           {errors?.specificDatesNotes && <p className="text-sm text-red-500 mt-1">{errors.specificDatesNotes}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupTime">Hora de Recogida (Ida) *</Label>
            <Input 
              id="pickupTime" 
              type="time"
              value={formData.pickupTime || ''} 
              onChange={(e) => updateFormData({ pickupTime: e.target.value })}
              className={errors?.pickupTime ? "border-red-500" : ""}
            />
            {errors?.pickupTime && <p className="text-sm text-red-500 mt-1">{errors.pickupTime}</p>}
          </div>
          <div>
            <Label htmlFor="returnTime">Hora de Retorno (Vuelta, si aplica)</Label>
            <Input 
              id="returnTime" 
              type="time"
              value={formData.returnTime || ''} 
              onChange={(e) => updateFormData({ returnTime: e.target.value })}
              className={errors?.returnTime ? "border-red-500" : ""}
            />
            {errors?.returnTime && <p className="text-sm text-red-500 mt-1">{errors.returnTime}</p>}
          </div>
        </div>
         <div>
          <Label htmlFor="durationEstimate">Duración Estimada de la Cita/Servicio (si es relevante para la vuelta)</Label>
          <Input 
            id="durationEstimate"
            value={formData.durationEstimate || ''} 
            onChange={(e) => updateFormData({ durationEstimate: e.target.value })}
            placeholder="Ej: 2 horas, 45 minutos"
            className={errors?.durationEstimate ? "border-red-500" : ""}
          />
          {errors?.durationEstimate && <p className="text-sm text-red-500 mt-1">{errors.durationEstimate}</p>}
        </div>
      </div>
    </div>
  );
}
