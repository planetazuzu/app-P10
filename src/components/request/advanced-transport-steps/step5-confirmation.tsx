
'use client';

import React, { useState, useEffect } from 'react';
import type { AdvancedTransportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';

interface StepProps {
  formData: AdvancedTransportData;
}

// This is a MOCK function. In a real app, this would involve complex date logic.
const generateMockTransfers = (data: AdvancedTransportData): any[] => {
  if (Object.keys(data).length === 0) return [];

  const baseTransfer = {
    patientName: data.patientName || "N/A",
    serviceType: data.serviceType || "N/A",
    originAddress: data.originAddress || "N/A",
    destinationAddress: data.destinationAddress || "N/A",
    pickupTime: data.pickupTime || "N/A",
    returnTime: data.returnTime || "N/A",
    transportType: data.transportTypeOther || data.transportType || "N/A",
    mobilityNeeds: data.mobilityNeeds || "N/A",
  };

  // Simplistic recurrence mock
  if (data.recurrenceType === 'daily' && data.startDate) {
    return Array.from({ length: 3 }).map((_, i) => {
      const date = new Date(data.startDate!);
      date.setDate(date.getDate() + i);
      return { ...baseTransfer, date: date.toLocaleDateString('es-ES') };
    });
  } else if (data.recurrenceType === 'weekly' && data.startDate) {
     return Array.from({ length: 2 }).map((_, i) => {
      const date = new Date(data.startDate!);
      date.setDate(date.getDate() + (i * 7));
      return { ...baseTransfer, date: date.toLocaleDateString('es-ES') };
    });
  } else if (data.specificDatesNotes && data.specificDatesNotes.trim() !== '') {
    return data.specificDatesNotes.split(',').map(dateStr => ({
        ...baseTransfer,
        date: dateStr.trim(),
    }));
  }
  
  return [{ ...baseTransfer, date: data.startDate || "Fecha única (ver programación)" }];
};


export default function Step5Confirmation({ formData }: StepProps) {
  const [previewGenerated, setPreviewGenerated] = React.useState(false);
  const [generatedTransfers, setGeneratedTransfers] = React.useState<any[]>([]);

  const handleUpdatePreview = () => {
    console.log("Updating preview with data:", formData);
    const transfers = generateMockTransfers(formData);
    setGeneratedTransfers(transfers);
    setPreviewGenerated(true); 
  };

  // Automatically update preview if formData changes and preview was already generated
  useEffect(() => {
    if (previewGenerated) {
      handleUpdatePreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, previewGenerated]);


  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary">Confirmación</h2>
      <CardDescription className="mb-1">Revise los traslados que se generarán a partir de la información proporcionada. Pulse "Actualizar vista previa" si ha realizado cambios en pasos anteriores.</CardDescription>
      
      <Card className="mt-6 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg text-secondary">Vista previa de traslados</CardTitle>
          <Button variant="outline" onClick={handleUpdatePreview} disabled={Object.keys(formData).length === 0}>Actualizar vista previa</Button>
        </CardHeader>
        <CardContent>
          {!previewGenerated && Object.keys(formData).length === 0 && (
             <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-3 text-orange-400" />
                <p className="font-semibold">No hay datos en el formulario.</p>
                <p>Complete los pasos anteriores para generar una vista previa.</p>
             </div>
          )}
          {!previewGenerated && Object.keys(formData).length > 0 && (
             <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-3 text-blue-400" />
                <p className="font-semibold">Vista previa no generada.</p>
                <p>Pulse "Actualizar vista previa" para ver los traslados.</p>
            </div>
          )}
          {previewGenerated && generatedTransfers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-3 text-yellow-400" />
                <p className="font-semibold">No se pudieron generar traslados.</p>
                <p>Verifique la información en los pasos de programación. Asegúrese de que las fechas o el patrón de recurrencia son válidos.</p>
            </div>
          )}
          {previewGenerated && generatedTransfers.length > 0 && (
            <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/30">
              <ul className="space-y-3">
                {generatedTransfers.map((transfer, index) => (
                  <li key={index} className="p-3 border-b border-dashed last:border-b-0 text-sm bg-background rounded shadow-sm">
                    <p><strong className="text-primary">Traslado #{index + 1}</strong> - Fecha: <strong>{transfer.date}</strong></p>
                    <p>Paciente: <strong>{transfer.patientName}</strong></p>
                    <p>Servicio: {transfer.serviceType}</p>
                    <p>Origen: {transfer.originAddress}</p>
                    <p>Destino: {transfer.destinationAddress}</p>
                    <p>Hora Recogida: {transfer.pickupTime} {transfer.returnTime && `- Hora Retorno: ${transfer.returnTime}`}</p>
                    <p>Tipo Ambulancia: {transfer.transportType} ({transfer.mobilityNeeds})</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-4">
        Nota: La generación de traslados múltiples a partir de patrones de recurrencia complejos (ej. "cada lunes y miércoles durante 3 semanas") es una simulación. 
        En un sistema real, se requeriría una lógica de calendario más robusta.
      </p>
    </div>
  );
}

