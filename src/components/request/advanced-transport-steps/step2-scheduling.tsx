
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
}

export default function Step2Scheduling({ formData, updateFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Programación</h2>
      <CardDescription className="mb-6">Configure la recurrencia, fechas y horarios para los traslados.</CardDescription>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recurrenceType">Tipo de Recurrencia</Label>
            <Select
              value={formData.recurrenceType || 'specificDates'}
              onValueChange={(value) => updateFormData({ recurrenceType: value as 'specificDates' | 'daily' | 'weekly' | 'monthly' })}
            >
              <SelectTrigger id="recurrenceType">
                <SelectValue placeholder="Seleccionar tipo de recurrencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specificDates">Fechas Específicas</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input 
              id="startDate" 
              type="date"
              value={formData.startDate || ''} 
              onChange={(e) => updateFormData({ startDate: e.target.value })}
            />
          </div>
        </div>

        {/* Campos condicionales basados en recurrenceType podrían ir aquí */}
        {/* Por ejemplo, para 'weekly', mostrar checkboxes para días de la semana */}

        <div>
          <Label htmlFor="specificDates">Fechas Específicas (si aplica)</Label>
          <Textarea 
            id="specificDates" 
            value={formData.specificDatesNotes || ''} 
            onChange={(e) => updateFormData({ specificDatesNotes: e.target.value })}
            placeholder="Si ha seleccionado 'Fechas Específicas', liste las fechas aquí (ej: 01/08/2024, 05/08/2024, 10/08/2024). Para otros tipos de recurrencia, puede detallar aquí el patrón (ej: Lunes, Miércoles y Viernes durante 3 semanas)."
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupTime">Hora de Recogida (Ida)</Label>
            <Input 
              id="pickupTime" 
              type="time"
              value={formData.pickupTime || ''} 
              onChange={(e) => updateFormData({ pickupTime: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="returnTime">Hora de Retorno (Vuelta, si aplica)</Label>
            <Input 
              id="returnTime" 
              type="time"
              value={formData.returnTime || ''} 
              onChange={(e) => updateFormData({ returnTime: e.target.value })}
            />
          </div>
        </div>
         <div>
          <Label htmlFor="durationEstimate">Duración Estimada de la Cita/Servicio (si es relevante para la vuelta)</Label>
          <Input 
            id="durationEstimate"
            value={formData.durationEstimate || ''} 
            onChange={(e) => updateFormData({ durationEstimate: e.target.value })}
            placeholder="Ej: 2 horas, 45 minutos"
          />
        </div>
      </div>
    </div>
  );
}
