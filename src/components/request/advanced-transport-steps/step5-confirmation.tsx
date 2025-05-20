
'use client';

import React from 'react';
import type { AdvancedTransportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StepProps {
  formData: AdvancedTransportData;
  updateFormData: (data: Partial<AdvancedTransportData>) => void; // May not be used in confirmation directly
}

export default function Step5Confirmation({ formData }: StepProps) {
  // In a real scenario, this would derive the preview from formData
  const [previewGenerated, setPreviewGenerated] = React.useState(false);

  const handleUpdatePreview = () => {
    console.log("Updating preview with data:", formData);
    // Simulate preview generation
    setPreviewGenerated(true); 
    // Here you would typically call a function to process formData 
    // and generate a list of transfers, then store it in state for display.
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary">Confirmación</h2>
      <CardDescription className="mb-1">Revise los traslados que se generarán.</CardDescription>
      
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Vista previa de traslados</CardTitle>
          <Button variant="outline" onClick={handleUpdatePreview}>Actualizar vista previa</Button>
        </CardHeader>
        <CardContent>
          {previewGenerated ? (
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Aquí se mostraría la lista de traslados generados a partir de la información
                proporcionada en los pasos anteriores. Por ejemplo:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Traslado: Paciente {formData.patientName || "N/A"} - Origen: {formData.originAddress || "N/A"} - Destino: {formData.destinationAddress || "N/A"} - Fecha: (Fecha calculada)</li>
                {/* Add more items based on recurrence logic if implemented */}
              </ul>
              {Object.keys(formData).length === 0 && <p className="text-sm text-orange-600 mt-2">No hay datos en el formulario para generar una vista previa.</p>}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay traslados generados. Pulse "Actualizar vista previa" para ver los traslados que se crearán.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
