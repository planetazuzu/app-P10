
'use client';

import React from 'react';
import type { AdvancedTransportData, AmbulanceType, MedioRequeridoProgramado } from '@/types';
import { ALL_AMBULANCE_TYPES, ALL_MEDIOS_REQUERIDOS_PROGRAMADO } from '@/types';
import { CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const ADVANCED_EQUIPMENT_OPTIONS = [
  { id: 'oxigeno', label: 'Oxígeno' },
  { id: 'sillaOruga', label: 'Silla oruga para escaleras' },
  { id: 'monitorConstantes', label: 'Monitor de constantes vitales' },
  { id: 'desfibrilador', label: 'Desfibrilador (DEA o manual)' },
  { id: 'ventilador', label: 'Ventilador mecánico' },
  { id: 'bombaPerfusion', label: 'Bomba de perfusión' },
  { id: 'aspiradorSecreciones', label: 'Aspirador de secreciones' },
  { id: 'materialInmovilizacion', label: 'Material de inmovilización completo (colchón vacío, férulas)' },
  { id: 'acompanante', label: 'Permitir acompañante' },
  { id: 'bariatrico', label: 'Material bariátrico (camilla, silla especial)' },
];

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void;
  errors?: Record<string, string | undefined>;
}

export default function Step4Configuration({ formData, updateFormData, errors }: StepProps) {
  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    const currentEquipment = formData.advancedEquipment || [];
    const newEquipment = checked
      ? [...currentEquipment, equipmentId]
      : currentEquipment.filter(id => id !== equipmentId);
    updateFormData({ advancedEquipment: newEquipment });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-secondary">Configuración del Traslado</h2>
      <CardDescription className="mb-6">Seleccione el tipo de transporte, necesidades de movilidad y equipamiento adicional. Los campos con * son obligatorios.</CardDescription>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="transportType">Tipo de Ambulancia Solicitada *</Label>
           <Select
            value={formData.transportType || ''}
            onValueChange={(value) => updateFormData({ transportType: value as AmbulanceType | 'Otros' })}
          >
            <SelectTrigger id="transportType" className={errors?.transportType ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar tipo de ambulancia" />
            </SelectTrigger>
            <SelectContent>
              {ALL_AMBULANCE_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
              <SelectItem value="Otros">Otro (especificar)</SelectItem>
            </SelectContent>
          </Select>
          {errors?.transportType && <p className="text-sm text-red-500 mt-1">{errors.transportType}</p>}
          
          {formData.transportType === 'Otros' && (
            <div className="mt-2">
              <Label htmlFor="transportTypeOther">Especificar otro tipo *</Label>
              <Input 
                id="transportTypeOther"
                placeholder="Especificar otro tipo de ambulancia"
                value={formData.transportTypeOther || ''}
                onChange={(e) => updateFormData({ transportTypeOther: e.target.value })}
                className={errors?.transportTypeOther ? "border-red-500" : ""}
              />
              {errors?.transportTypeOther && <p className="text-sm text-red-500 mt-1">{errors.transportTypeOther}</p>}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="mobilityNeeds">Necesidades de Movilidad del Paciente *</Label>
            <Select
              value={formData.mobilityNeeds || ''}
              onValueChange={(value) => updateFormData({ mobilityNeeds: value as MedioRequeridoProgramado })}
            >
            <SelectTrigger id="mobilityNeeds" className={errors?.mobilityNeeds ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar medio requerido" />
            </SelectTrigger>
            <SelectContent>
              {ALL_MEDIOS_REQUERIDOS_PROGRAMADO.map(medio => (
                 <SelectItem key={medio} value={medio}>
                    {medio === 'camilla' ? 'Camilla' : medio === 'sillaDeRuedas' ? 'Silla de Ruedas' : 'Andando/Autónomo'}
                 </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.mobilityNeeds && <p className="text-sm text-red-500 mt-1">{errors.mobilityNeeds}</p>}
        </div>
        
        <div>
          <Label className="block mb-2">Equipamiento Especial y Otras Necesidades</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-md bg-muted/30">
            {ADVANCED_EQUIPMENT_OPTIONS.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`advancedEquip-${item.id}`}
                  checked={formData.advancedEquipment?.includes(item.id) || false}
                  onCheckedChange={(checked) => handleEquipmentChange(item.id, Boolean(checked))}
                />
                <Label htmlFor={`advancedEquip-${item.id}`} className="font-normal text-sm">{item.label}</Label>
              </div>
            ))}
          </div>
           {errors?.advancedEquipment && <p className="text-sm text-red-500 mt-1">{errors.advancedEquipment}</p>}
        </div>

        <div>
          <Label htmlFor="additionalNotes">Notas Adicionales para el Traslado</Label>
          <Textarea 
            id="additionalNotes" 
            value={formData.additionalNotes || ''} 
            onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
            placeholder="Cualquier otra información importante para el equipo de transporte: barreras arquitectónicas, necesidad de más de un técnico, etc."
            rows={3}
            className={errors?.additionalNotes ? "border-red-500" : ""}
          />
          {errors?.additionalNotes && <p className="text-sm text-red-500 mt-1">{errors.additionalNotes}</p>}
        </div>
      </div>
    </div>
  );
}
