
'use client';

import React, { useState } from 'react';
import type { AdvancedTransportData } from '@/types';
import { AdvancedTransportPatientInfoSchema, AdvancedTransportSchedulingSchema, AdvancedTransportLocationsSchema, AdvancedTransportConfigurationSchema } from '@/types';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Import step components
import Step1PatientInfo from './advanced-transport-steps/step1-patient-info';
import Step2Scheduling from './advanced-transport-steps/step2-scheduling';
import Step3Locations from './advanced-transport-steps/step3-locations';
import Step4Configuration from './advanced-transport-steps/step4-configuration';
import Step5Confirmation from './advanced-transport-steps/step5-confirmation';

const steps = [
  { id: 1, title: 'Paciente', description: 'Datos y tipo de servicio', schema: AdvancedTransportPatientInfoSchema },
  { id: 2, title: 'Programación', description: 'Recurrencia y fechas', schema: AdvancedTransportSchedulingSchema },
  { id: 3, title: 'Ubicaciones', description: 'Origen y destino', schema: AdvancedTransportLocationsSchema },
  { id: 4, title: 'Configuración', description: 'Transporte y opciones', schema: AdvancedTransportConfigurationSchema },
  { id: 5, title: 'Confirmación', description: 'Revisar y crear', schema: null }, // No schema for confirmation step itself
];

export function AdvancedTransportForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdvancedTransportData>({
    recurrenceType: 'specificDates', // Default for Step 2
    transportType: undefined, // Default for Step 4
    mobilityNeeds: undefined, // Default for Step 4
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleNext = async () => {
    setErrors({}); // Clear previous errors
    const currentStepConfig = steps.find(s => s.id === currentStep);

    if (currentStepConfig && currentStepConfig.schema) {
      try {
        currentStepConfig.schema.parse(formData);
      } catch (e) {
        if (e instanceof z.ZodError) {
          const fieldErrors: Record<string, string | undefined> = {};
          e.errors.forEach(err => {
            if (err.path.length > 0) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          toast({
            title: "Errores de Validación",
            description: "Por favor, corrija los campos marcados.",
            variant: "destructive",
          });
          return; // Prevent moving to next step
        }
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setErrors({}); // Clear errors when moving back
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFormData = (data: Partial<AdvancedTransportData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Optionally clear errors for the fields being updated
    const updatedFields = Object.keys(data);
    const newErrors = { ...errors };
    updatedFields.forEach(field => delete newErrors[field]);
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Final validation (optional, if there's an overall schema)
    // For now, assume individual step validation is sufficient

    console.log('Submitting Advanced Transport Request:', formData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast({
      title: "Solicitudes Creadas (Simulado)",
      description: "Las solicitudes de transporte avanzado han sido programadas en el sistema.",
    });
    setIsSubmitting(false);
    router.push('/request-management');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PatientInfo formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <Step2Scheduling formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <Step3Locations formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <Step4Configuration formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5:
        return <Step5Confirmation formData={formData} />;
      default:
        return <p>Paso desconocido.</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between space-x-2 sm:space-x-4 p-2 overflow-x-auto mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center min-w-[100px] sm:min-w-[150px] flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div className={cn(
                    "flex-1 h-1",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )} style={{minWidth: '10px'}}></div>
                )}
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer",
                    currentStep > step.id ? "bg-primary border-primary text-primary-foreground" :
                    currentStep === step.id ? "bg-primary/20 border-primary text-primary animate-pulse" :
                    "bg-muted border-border text-muted-foreground hover:border-primary/50",
                  )}
                  onClick={() => {
                    // Allow navigation to already visited/valid steps (optional)
                    // For now, only allow sequential or backward navigation via buttons
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <span className="text-sm sm:text-base font-semibold">{step.id}</span>}
                </div>
                {index < steps.length -1 && (
                   <div className={cn(
                    "flex-1 h-1",
                     currentStep >= step.id + 1 ? "bg-primary" : "bg-border"
                   )} style={{minWidth: '10px'}}></div>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                    "text-xs sm:text-sm font-semibold",
                     currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                )}>{step.title}</p>
                <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>
        <div className="mt-8 flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            Anterior
          </Button>
          {currentStep < steps.length && (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Siguiente
            </Button>
          )}
          {currentStep === steps.length && (
            <Button onClick={handleSubmit} disabled={isSubmitting || Object.keys(formData).length === 0} className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? 'Creando Solicitudes...' : 'Crear Solicitudes'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
