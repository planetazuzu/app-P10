
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AmbulanceForm } from '@/components/ambulance/ambulance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Ambulance } from '@/types';
import { emptyAmbulance } from '@/components/ambulance/constants'; // Ensure this provides a complete Omit<Ambulance, 'id'>
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { createAmbulanceAPI } from '@/lib/ambulance-data'; // API function
import { defaultEquipmentByType } from '@/types';


export default function NewAmbulancePage() {
  const [ambulance, setAmbulance] = useState<Partial<Ambulance>>({ ...emptyAmbulance });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para crear ambulancias.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);


  const handleFieldChange = useCallback((field: keyof Ambulance, value: any) => {
    setAmbulance(prev => ({ ...prev, [field]: value }));

    if (field === 'hasMedicalBed' && !value) {
      setAmbulance(prev => ({ ...prev, stretcherSeats: 0 }));
    }
    if (field === 'hasWheelchair' && !value) {
      setAmbulance(prev => ({ ...prev, wheelchairSeats: 0 }));
    }
    if (field === 'allowsWalking' && !value) {
      setAmbulance(prev => ({ ...prev, walkingSeats: 0 }));
    }
    // Si el tipo cambia, actualizamos el equipamiento por defecto según la lógica de types.ts
    // Esto es principalmente para el objeto `equipment` si lo usamos,
    // o para pre-seleccionar `specialEquipment` si tuviéramos esa lógica.
    // Por ahora, `emptyAmbulance` ya inicializa `specialEquipment` como `[]`.
    // El `equipment` detallado se podría setear aquí si fuera necesario.
     if (field === 'type' && value) {
        // `defaultEquipmentByType` es para la estructura `AmbulanceEquipment`
        // Para `specialEquipment` (array de strings), la lógica es diferente.
        // Lo dejamos así por ahora, ya que el formulario gestiona `specialEquipment` directamente.
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

    if (!ambulance.name || !ambulance.licensePlate || !ambulance.model || !ambulance.type || !ambulance.baseLocation || !ambulance.status) {
      toast({
        title: "Campos Requeridos Faltantes",
        description: "Por favor, complete todos los campos marcados con *.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }
    
    // Construir el objeto Omit<Ambulance, 'id'> para la API
    // Asegúrate de que todos los campos requeridos por la interfaz Ambulance (excepto id) estén presentes
    const ambulanceDataForAPI: Omit<Ambulance, 'id'> = {
      name: ambulance.name!,
      licensePlate: ambulance.licensePlate!,
      model: ambulance.model!,
      type: ambulance.type!,
      baseLocation: ambulance.baseLocation!,
      status: ambulance.status!,
      zone: ambulance.zone || '', // Opcional, enviar string vacío si no se proporciona
      hasMedicalBed: ambulance.hasMedicalBed || false,
      stretcherSeats: ambulance.stretcherSeats || 0,
      hasWheelchair: ambulance.hasWheelchair || false,
      wheelchairSeats: ambulance.wheelchairSeats || 0,
      allowsWalking: ambulance.allowsWalking === undefined ? true : ambulance.allowsWalking,
      walkingSeats: ambulance.walkingSeats || 0,
      specialEquipment: ambulance.specialEquipment || [],
      personnel: ambulance.personnel || [], // Incluir nuevo campo personnel
      latitude: ambulance.latitude, // Puede ser undefined
      longitude: ambulance.longitude, // Puede ser undefined
      currentPatients: ambulance.currentPatients || 0,
      notes: ambulance.notes || '', // Opcional
      // `equipment` se deriva en NocoDB o al mapear si es necesario.
      // `equipoMovilUserId` es opcional.
    };


    const newAmbulance = await createAmbulanceAPI(ambulanceDataForAPI);

    if (newAmbulance) {
        toast({
        title: "Ambulancia Creada",
        description: `La ambulancia "${newAmbulance.name}" ha sido registrada con ID: ${newAmbulance.id}.`,
        });
        router.push('/admin/ambulances');
    } else {
        toast({
        title: "Error al Crear",
        description: "No se pudo crear la ambulancia. Verifique la consola para más detalles.",
        variant: "destructive",
        });
    }
    
    setIsSaving(false);
  };

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/ambulances" passHref> 
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
