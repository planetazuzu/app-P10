
'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ambulance, AmbulanceType, AmbulanceStatus } from "@/types";
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES } from "@/types";
import { equipmentOptions } from "./constants";

interface AmbulanceFormProps {
  ambulance: Partial<Ambulance>;
  isEditing: boolean;
  onFieldChange: (field: keyof Ambulance, value: any) => void;
  onSpecialEquipmentToggle: (equipmentId: string) => void;
}

// Helper to translate types for display
const getAmbulanceTypeLabel = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "SVB (Soporte Vital Básico)";
    case "SVA": return "SVA (Soporte Vital Avanzado)";
    case "Convencional": return "Convencional";
    case "UVI_Movil": return "UVI Móvil (Soporte Vital Avanzado con enfermería)";
    case "A1": return "A1 (Transporte programado individual)";
    case "Programado": return "Programado (Transporte colectivo)";
    case "Otros": return "Otros tipos";
    default: return type;
  }
};

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
  switch (status) {
    case "available": return "Disponible";
    case "busy": return "Ocupada / En Misión";
    case "maintenance": return "En Mantenimiento";
    case "unavailable": return "No Disponible";
    default: return status;
  }
}

export const AmbulanceForm = ({
  ambulance,
  isEditing,
  onFieldChange,
  onSpecialEquipmentToggle,
}: AmbulanceFormProps) => {
  
  const handlePersonnelChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const personnelArray = event.target.value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== '');
    onFieldChange("personnel", personnelArray);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="id">Identificador</Label>
        <Input
          id="id"
          value={ambulance.id || (isEditing ? "" : "Se generará automáticamente al guardar")}
          disabled={true}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="font-semibold">Nombre / Indicativo <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          placeholder="Ej: Móvil Alfa 1, SVB Logroño 2"
          value={ambulance.name || ""}
          onChange={(e) => onFieldChange("name", e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="licensePlate" className="font-semibold">Matrícula <span className="text-red-500">*</span></Label>
        <Input
          id="licensePlate"
          placeholder="Ej: 1234ABC"
          value={ambulance.licensePlate || ""}
          onChange={(e) => onFieldChange("licensePlate", e.target.value.toUpperCase())}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model" className="font-semibold">Modelo <span className="text-red-500">*</span></Label>
        <Input
          id="model"
          placeholder="Ej: Mercedes Sprinter, Ford Transit"
          value={ambulance.model || ""}
          onChange={(e) => onFieldChange("model", e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type" className="font-semibold">Tipo <span className="text-red-500">*</span></Label>
        <Select
          value={ambulance.type || ""}
          onValueChange={(value) => onFieldChange("type", value as AmbulanceType)}
          required
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Seleccionar tipo de ambulancia" />
          </SelectTrigger>
          <SelectContent>
            {ALL_AMBULANCE_TYPES.map(type => (
              <SelectItem key={type} value={type}>{getAmbulanceTypeLabel(type)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status" className="font-semibold">Estado <span className="text-red-500">*</span></Label>
        <Select
          value={ambulance.status || ""}
          onValueChange={(value) => 
            onFieldChange("status", value as AmbulanceStatus)
          }
          required
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {ALL_AMBULANCE_STATUSES.map(status => (
               <SelectItem key={status} value={status}>{getAmbulanceStatusLabel(status)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseLocation" className="font-semibold">Ubicación Base <span className="text-red-500">*</span></Label>
        <Input
          id="baseLocation"
          placeholder="Ej: Hospital San Pedro, Logroño"
          value={ambulance.baseLocation || ""}
          onChange={(e) => onFieldChange("baseLocation", e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="zone" className="font-semibold">Zona de operación</Label>
        <Input
          id="zone"
          placeholder="Ej: Rioja Alta, Logroño Ciudad"
          value={ambulance.zone || ""}
          onChange={(e) => onFieldChange("zone", e.target.value)}
        />
      </div>
      
      {/* Equipamiento y Capacidad */}
      <div className="col-span-1 md:col-span-2 border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-3 text-secondary">Capacidad y Dotación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna 1: Dotación básica */}
            <div className="space-y-3">
                <Label className="block font-medium text-muted-foreground">Dotación Principal</Label>
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="hasMedicalBed" 
                    checked={ambulance.hasMedicalBed || false} 
                    onCheckedChange={(checked) => 
                        onFieldChange("hasMedicalBed", Boolean(checked))
                    }
                    />
                    <label htmlFor="hasMedicalBed" className="text-sm">Tiene camilla</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="hasWheelchair" 
                    checked={ambulance.hasWheelchair || false} 
                    onCheckedChange={(checked) => 
                        onFieldChange("hasWheelchair", Boolean(checked))
                    }
                    />
                    <label htmlFor="hasWheelchair" className="text-sm">Permite silla de ruedas (dedicado)</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="allowsWalking" 
                    checked={ambulance.allowsWalking === undefined ? true : ambulance.allowsWalking} // Default to true if undefined
                    onCheckedChange={(checked) => 
                        onFieldChange("allowsWalking", Boolean(checked))
                    }
                    />
                    <label htmlFor="allowsWalking" className="text-sm">Permite pacientes sentados/andando</label>
                </div>
            </div>

            {/* Columna 2: Capacidad Pacientes */}
            <div className="space-y-3">
                 <Label className="block font-medium text-muted-foreground">Capacidad Máxima Pacientes</Label>
                <div className="flex items-center justify-between space-x-2">
                <label htmlFor="stretcherSeats" className="text-sm w-full">En camilla:</label>
                <Input
                    id="stretcherSeats" type="number" min="0" max="2"
                    value={ambulance.stretcherSeats === undefined ? (ambulance.hasMedicalBed ? 1 : 0) : ambulance.stretcherSeats}
                    onChange={(e) => onFieldChange("stretcherSeats", parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    disabled={!ambulance.hasMedicalBed}
                />
                </div>
                <div className="flex items-center justify-between space-x-2">
                <label htmlFor="wheelchairSeats" className="text-sm w-full">En silla de ruedas:</label>
                <Input
                    id="wheelchairSeats" type="number" min="0" max="4"
                    value={ambulance.wheelchairSeats === undefined ? 0 : ambulance.wheelchairSeats}
                    onChange={(e) => onFieldChange("wheelchairSeats", parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    disabled={!ambulance.hasWheelchair}
                />
                </div>
                <div className="flex items-center justify-between space-x-2">
                <label htmlFor="walkingSeats" className="text-sm w-full">Sentados/andando:</label>
                <Input
                    id="walkingSeats" type="number" min="0" max="8"
                    value={ambulance.walkingSeats === undefined ? 0 : ambulance.walkingSeats}
                    onChange={(e) => onFieldChange("walkingSeats", parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    disabled={!ambulance.allowsWalking}
                />
                </div>
            </div>

            {/* Columna 3: Equipamiento Especial */}
            <div className="space-y-3">
                <Label className="block font-medium text-muted-foreground">Equipamiento Especial Adicional</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {equipmentOptions.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                        id={`specialEquipment-${item.id}`}
                        checked={ambulance.specialEquipment?.includes(item.id) || false}
                        onCheckedChange={() => onSpecialEquipmentToggle(item.id)}
                        />
                        <label htmlFor={`specialEquipment-${item.id}`} className="text-sm">{item.label}</label>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-4 mt-4">
        <Label htmlFor="personnel" className="font-semibold">Personal Asignado</Label>
        <Textarea
          id="personnel"
          placeholder="Listar personal, un miembro por línea (Ej: Conductor TES, Enfermero/a DUE)."
          value={ambulance.personnel?.join('\n') || ""}
          onChange={handlePersonnelChange}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Indique los roles o nombres del personal asignado a esta unidad, uno por línea.</p>
      </div>
      
      <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-4 mt-4">
        <Label htmlFor="notes" className="font-semibold">Notas internas</Label>
        <Textarea
          id="notes"
          placeholder="Observaciones administrativas, historial de mantenimiento breve, etc. (opcional)"
          value={ambulance.notes || ""}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};
