
'use client';

import React, { useState } from 'react';
import type { AdvancedTransportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
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
  { id: 1, title: 'Paciente', description: 'Datos y tipo de servicio' },
  { id: 2, title: 'Programación', description: 'Recurrencia y fechas' },
  { id: 3, title: 'Ubicaciones', description: 'Origen y destino' },
  { id: 4, title: 'Configuración', description: 'Transporte y opciones' },
  { id: 5, title: 'Confirmación', description: 'Revisar y crear' },
];

export function AdvancedTransportForm() {
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1
  const [formData, setFormData] = useState<AdvancedTransportData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleNext = () => {
    // Add validation logic here before proceeding to the next step
    // For now, just navigate
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFormData = (data: Partial<AdvancedTransportData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('Submitting Advanced Transport Request:', formData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Solicitudes Creadas (Simulado)",
      description: "Las solicitudes de transporte avanzado han sido programadas en el sistema.",
      variant: "default" // Explicitly set to default or success if available
    });
    setIsSubmitting(false);
    router.push('/request-management'); // Or a success page
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PatientInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2Scheduling formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Locations formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Configuration formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Confirmation formData={formData} />; // updateFormData not needed here usually, but can be passed
      default:
        return <p>Paso desconocido.</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        {/* Stepper UI */}
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
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shrink-0",
                    currentStep > step.id ? "bg-primary border-primary text-primary-foreground" :
                    currentStep === step.id ? "bg-primary/20 border-primary text-primary animate-pulse" :
                    "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <span className="text-sm sm:text-base font-semibold">{step.id}</span>}
                </div>
                {index < steps.length -1 && (
                   <div className={cn(
                    "flex-1 h-1",
                     currentStep > step.id + 1 || (currentStep === step.id +1 && currentStep > step.id) ? "bg-primary" : "bg-border"
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
        <div className="min-h-[300px]"> {/* Ensure content area has some min height */}
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
