
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AmbulanceForm } from '@/components/ambulance/ambulance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Ambulance } from '@/types';
import { emptyAmbulance } from '@/components/ambulance/constants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { mockAmbulances } from '@/lib/ambulance-data';

const MOCK_SAVE_AMBULANCE_DELAY = 500;

export default function NewAmbulancePage() {
  const [ambulance, setAmbulance] = useState<Partial<Ambulance>>({ ...emptyAmbulance });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && user && user.role !== 'admin') {
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
    
    console.log("Guardando ambulancia:", ambulance);

    await new Promise(resolve => setTimeout(resolve, MOCK_SAVE_AMBULANCE_DELAY));
    
    const newAmbulanceWithId: Ambulance = {
        ...emptyAmbulance,
        ...ambulance,
        id: `amb-${Date.now().toString().slice(-6)}`, 
    } as Ambulance;

    mockAmbulances.push(newAmbulanceWithId); // Add to global mock array

    toast({
      title: "Ambulancia Creada",
      description: `La ambulancia "${newAmbulanceWithId.name}" ha sido registrada con ID: ${newAmbulanceWithId.id}.`,
    });
    
    router.push('/admin/ambulances');
    setIsSaving(false);
  };

  if (authIsLoading || (!user || user.role !== 'admin')) {
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
          <Link href="/admin/ambulances" passHref> {/* Updated link to go back to the list */}
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
