
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Ambulance } from '@/types';
import { getAmbulanceById, mockAmbulances } from '@/lib/ambulance-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AmbulanceForm } from '@/components/ambulance/ambulance-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Loader2 } from 'lucide-react';

const MOCK_UPDATE_AMBULANCE_DELAY = 500;

export default function EditAmbulancePage() {
  const router = useRouter();
  const params = useParams();
  const ambulanceId = params.id as string;

  const [ambulance, setAmbulance] = useState<Partial<Ambulance> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && user && user.role !== 'admin') {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para editar ambulancias.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
      return; // Important: stop further execution if not admin
    }

    if (user && user.role === 'admin' && ambulanceId) {
      setIsLoading(true);
      getAmbulanceById(ambulanceId)
        .then((data) => {
          if (data) {
            setAmbulance(data);
          } else {
            toast({ title: 'Error', description: 'Ambulancia no encontrada.', variant: 'destructive' });
            router.push('/admin/ambulances');
          }
        })
        .catch(() => {
          toast({ title: 'Error', description: 'No se pudo cargar la ambulancia.', variant: 'destructive' });
          router.push('/admin/ambulances');
        })
        .finally(() => setIsLoading(false));
    } else if (user && user.role === 'admin' && !ambulanceId) {
        // Handle case where ID might be missing, though route should provide it
        toast({ title: 'Error', description: 'ID de ambulancia no especificado.', variant: 'destructive' });
        router.push('/admin/ambulances');
        setIsLoading(false);
    }
  }, [ambulanceId, router, toast, user, authIsLoading]);

  const handleFieldChange = useCallback((field: keyof Ambulance, value: any) => {
    setAmbulance(prev => {
      if (!prev) return null;
      const updatedAmbulance = { ...prev, [field]: value };

      if (field === 'hasMedicalBed' && !value) {
        updatedAmbulance.stretcherSeats = 0;
      }
      if (field === 'hasWheelchair' && !value) {
        updatedAmbulance.wheelchairSeats = 0;
      }
      if (field === 'allowsWalking' && !value) {
        updatedAmbulance.walkingSeats = 0;
      }
      return updatedAmbulance;
    });
  }, []);

  const handleSpecialEquipmentToggle = useCallback((equipmentId: string) => {
    setAmbulance(prev => {
      if (!prev) return null;
      const currentEquipment = prev.specialEquipment || [];
      const newEquipment = currentEquipment.includes(equipmentId)
        ? currentEquipment.filter(id => id !== equipmentId)
        : [...currentEquipment, equipmentId];
      return { ...prev, specialEquipment: newEquipment };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambulance) return;
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
    
    console.log("Actualizando ambulancia:", ambulance);

    await new Promise(resolve => setTimeout(resolve, MOCK_UPDATE_AMBULANCE_DELAY));
    
    const index = mockAmbulances.findIndex(a => a.id === ambulance.id);
    if (index !== -1) {
      mockAmbulances[index] = ambulance as Ambulance; 
    }

    toast({
      title: "Ambulancia Actualizada",
      description: `La ambulancia "${ambulance.name}" ha sido actualizada.`,
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


  if (isLoading) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Cargando datos de la ambulancia...</p>
        </div>
      </div>
    );
  }

  if (!ambulance) {
    return (
        <div className="rioja-container">
            <p className="text-center text-red-500 text-lg mt-10">Ambulancia no encontrada o error al cargar.</p>
            <div className="text-center mt-4">
                <Link href="/admin/ambulances" passHref>
                    <Button variant="outline">Volver al listado</Button>
                </Link>
            </div>
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
          <h1 className="page-title">Editar Ambulancia: {ambulance.name || ambulance.id}</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Detalles de la Ambulancia</CardTitle>
          <CardDescription>
            Modifique la información de la unidad.
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <AmbulanceForm
              ambulance={ambulance}
              isEditing={true}
              onFieldChange={handleFieldChange}
              onSpecialEquipmentToggle={handleSpecialEquipmentToggle}
            />
            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? 'Guardando Cambios...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
