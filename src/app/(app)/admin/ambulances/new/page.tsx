
'use client';

import React, { useState, useCallback } from 'react';
import { AmbulanceForm } from '@/components/ambulance/ambulance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Ambulance } from '@/types';
import { emptyAmbulance } from '@/components/ambulance/constants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// En un futuro, esto vendría de una API/DB
const MOCK_SAVE_AMBULANCE_DELAY = 500;

export default function NewAmbulancePage() {
  const [ambulance, setAmbulance] = useState<Partial<Ambulance>>({ ...emptyAmbulance });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFieldChange = useCallback((field: keyof Ambulance, value: any) => {
    setAmbulance(prev => ({ ...prev, [field]: value }));

    // Si se cambia hasMedicalBed y se desmarca, poner stretcherSeats a 0
    if (field === 'hasMedicalBed' && !value) {
      setAmbulance(prev => ({ ...prev, stretcherSeats: 0 }));
    }
    // Si se cambia hasWheelchair y se desmarca, poner wheelchairSeats a 0
    if (field === 'hasWheelchair' && !value) {
      setAmbulance(prev => ({ ...prev, wheelchairSeats: 0 }));
    }
    // Si se cambia allowsWalking y se desmarca, poner walkingSeats a 0
    if (field === 'allowsWalking' && !value) {
      setAmbulance(prev => ({ ...prev, walkingSeats: 0 }));
    }
  }, []);

  const handleSpecialEquipmentToggle = useCallback((equipmentId: string) => {
    setAmbulance(prev => {
      const currentEquipment = prev.specialEquipment || [];
      const newEquipment = currentEquipment.includes(equipmentId)
        ? currentEquipment.filter(id => id !== equipmentId)
        : [...currentEquipment, equipmentId];
      return { ...prev, specialEquipment: newEquipment };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validaciones básicas (se podrían expandir o usar Zod)
    if (!ambulance.name || !ambulance.licensePlate || !ambulance.model || !ambulance.type || !ambulance.baseLocation || !ambulance.status) {
      toast({
        title: "Campos Requeridos Faltantes",
        description: "Por favor, complete todos los campos marcados con *.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }
    
    console.log("Guardando ambulancia:", ambulance);

    // Simular guardado en DB
    await new Promise(resolve => setTimeout(resolve, MOCK_SAVE_AMBULANCE_DELAY));
    
    // En una app real, aquí se haría la llamada a la API para crear la ambulancia
    // y se generaría el ID en el backend.
    const newAmbulanceWithId: Ambulance = {
        ...emptyAmbulance, // Asegura que todos los campos por defecto estén
        ...ambulance, // Sobrescribe con los datos del formulario
        id: `amb-${Date.now().toString().slice(-6)}`, // Mock ID generation
    } as Ambulance;


    toast({
      title: "Ambulancia Creada",
      description: `La ambulancia "${newAmbulanceWithId.name}" ha sido registrada con ID: ${newAmbulanceWithId.id}.`,
    });
    
    // Idealmente, se redirigiría a la página de la ambulancia recién creada o a la lista
    // router.push(`/admin/ambulances/${newAmbulanceWithId.id}`); 
    router.push('/admin/ambulances'); // Por ahora, a una lista genérica que no existe.
    // setAmbulance({ ...emptyAmbulance }); // Reset form
    setIsSaving(false);
  };

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" passHref>
             <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
             </Button>
          </Link>
          <h1 className="page-title">Añadir Nueva Ambulancia</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Detalles de la Ambulancia</CardTitle>
          <CardDescription>
            Complete la información para registrar una nueva unidad en el sistema.
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <AmbulanceForm
              ambulance={ambulance}
              isEditing={false}
              onFieldChange={handleFieldChange}
              onSpecialEquipmentToggle={handleSpecialEquipmentToggle}
            />
            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? 'Guardando...' : 'Guardar Ambulancia'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
