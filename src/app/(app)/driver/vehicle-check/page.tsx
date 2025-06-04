
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Ambulance } from '@/types';
import { getAmbulances } from '@/lib/ambulance-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Wrench, ShieldCheck, Droplets, LucideLightbulb, CarFront, Thermometer, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistSection {
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

const initialChecklistState: ChecklistSection[] = [
  {
    title: 'Niveles',
    icon: Droplets,
    items: [
      { id: 'oil', label: 'Aceite Motor', checked: false },
      { id: 'coolant', label: 'Refrigerante', checked: false },
      { id: 'brake_fluid', label: 'Líquido de Frenos', checked: false },
      { id: 'windshield_washer', label: 'Líquido Limpiaparabrisas', checked: false },
    ],
  },
  {
    title: 'Luces y Señales',
    icon: LucideLightbulb,
    items: [
      { id: 'headlights', label: 'Faros Delanteros (cortas/largas)', checked: false },
      { id: 'taillights', label: 'Luces Traseras y de Freno', checked: false },
      { id: 'turn_signals', label: 'Intermitentes y Emergencia', checked: false },
      { id: 'siren_beacon', label: 'Sirena y Rotativos Prioritarios', checked: false },
    ],
  },
  {
    title: 'Neumáticos y Exterior',
    icon: CarFront,
    items: [
      { id: 'tire_pressure', label: 'Presión Neumáticos (Visual)', checked: false },
      { id: 'tire_wear', label: 'Desgaste Neumáticos (Visual)', checked: false },
      { id: 'bodywork_damage', label: 'Daños Carrocería (Visual)', checked: false },
      { id: 'cleanliness_ext', label: 'Limpieza Exterior', checked: false },
    ],
  },
  {
    title: 'Cabina y Conducción',
    icon: ShieldCheck,
    items: [
      { id: 'brakes_pedal', label: 'Frenos (Respuesta pedal)', checked: false },
      { id: 'steering_wheel', label: 'Dirección (Holgura)', checked: false },
      { id: 'mirrors', label: 'Retrovisores (Ajuste y estado)', checked: false },
      { id: 'documentation', label: 'Documentación Vehículo a Bordo', checked: false },
    ],
  },
  {
    title: 'Habitáculo Asistencial',
    icon: Thermometer,
    items: [
      { id: 'cleanliness_int', label: 'Limpieza e Higiene Interior', checked: false },
      { id: 'temperature_control', label: 'Climatización / Calefacción', checked: false },
      { id: 'interior_lights', label: 'Iluminación Interior Asistencial', checked: false },
      { id: 'stretcher_anchors', label: 'Anclajes Camilla y Soportes', checked: false },
    ],
  },
  {
    title: 'Equipamiento Sanitario Básico',
    icon: Stethoscope,
    items: [
      { id: 'oxygen_supply', label: 'Botella/Suministro Oxígeno (Presión/Stock)', checked: false },
      { id: 'first_aid_kit', label: 'Maletín Primeros Auxilios/Vía Aérea', checked: false },
      { id: 'monitor_defib', label: 'Monitor Desfibrilador (Batería, Electrodos)', checked: false },
      { id: 'consumables', label: 'Material Fungible Básico (Guantes, Gasas)', checked: false },
    ],
  },
];


export default function VehicleCheckPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [ambulanceDetails, setAmbulanceDetails] = useState<Ambulance | null>(null);
  const [checklistSections, setChecklistSections] = useState<ChecklistSection[]>(JSON.parse(JSON.stringify(initialChecklistState))); // Deep copy
  const [kilometraje, setKilometraje] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authIsLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'equipoMovil') {
      toast({ title: 'Acceso Denegado', description: 'Esta sección es solo para equipos móviles.', variant: 'destructive' });
      router.replace('/dashboard');
      return;
    }

    async function fetchAmbulanceData() {
      setIsLoadingPage(true);
      try {
        const allAmbulances = await getAmbulances();
        const assignedAmbulance = allAmbulances.find(amb => amb.equipoMovilUserId === user?.id);
        if (assignedAmbulance) {
          setAmbulanceDetails(assignedAmbulance);
        } else {
          toast({ title: 'Vehículo no Asignado', description: 'No se encontró una ambulancia asignada a su usuario.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los datos de la ambulancia.', variant: 'destructive' });
      } finally {
        setIsLoadingPage(false);
      }
    }
    fetchAmbulanceData();
  }, [user, authIsLoading, router, toast]);

  const handleChecklistItemChange = (sectionIndex: number, itemIndex: number, checked: boolean) => {
    const newSections = [...checklistSections];
    newSections[sectionIndex].items[itemIndex].checked = checked;
    setChecklistSections(newSections);
  };

  const handleRegisterCheck = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!ambulanceDetails) {
        toast({ title: 'Error', description: 'No hay detalles de la ambulancia para registrar la revisión.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }
    if (!kilometraje) {
        toast({ title: 'Campo Requerido', description: 'Por favor, ingrese el kilometraje actual.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    // Simulate API call
    console.log('Simulando envío de revisión de vehículo:', {
      ambulanceId: ambulanceDetails.id,
      ambulanceName: ambulanceDetails.name,
      kilometraje,
      checklist: checklistSections,
      observaciones,
      timestamp: new Date().toISOString(),
      userId: user?.id,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Revisión Registrada (Simulado)',
      description: `Revisión para ${ambulanceDetails.name} con ${kilometraje} km enviada.`,
    });
    
    // Reset form (optional)
    setChecklistSections(JSON.parse(JSON.stringify(initialChecklistState)));
    setKilometraje('');
    setObservaciones('');
    setIsSubmitting(false);
  };

  if (authIsLoading || isLoadingPage) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Cargando datos de revisión...</p>
      </div>
    );
  }

  if (!ambulanceDetails) {
    return (
      <div className="rioja-container">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Vehículo No Encontrado</AlertTitle>
          <AlertDescription>No se ha podido identificar una ambulancia asignada a su usuario. Por favor, contacte con el centro coordinador.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <h1 className="page-title mb-8">Revisión Pre-Operativa del Vehículo</h1>
      <form onSubmit={handleRegisterCheck}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="section-title flex items-center gap-2"><Wrench className="text-primary"/> Checklist Vehículo: {ambulanceDetails.name} ({ambulanceDetails.licensePlate})</CardTitle>
            <CardDescription>Realice todas las comprobaciones y registre el estado actual del vehículo antes de iniciar el servicio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {checklistSections.map((section, sectionIndex) => (
              <div key={section.title} className="space-y-3 border p-4 rounded-md bg-muted/20">
                <h3 className="text-md font-semibold text-secondary flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${section.title}-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleChecklistItemChange(sectionIndex, itemIndex, Boolean(checked))}
                      />
                      <Label htmlFor={`${section.title}-${item.id}`} className="text-sm font-normal">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="kilometraje" className="font-medium">Kilometraje Actual <span className="text-red-500">*</span></Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={kilometraje}
                  onChange={(e) => setKilometraje(e.target.value)}
                  placeholder="Ej: 125300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observaciones" className="font-medium">Observaciones Adicionales / Incidencias Detectadas</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Describa cualquier anomalía, daño, o necesidad de mantenimiento que no esté cubierta en el checklist."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="btn-primary w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Registrando...' : 'Registrar Revisión y Kilometraje'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
