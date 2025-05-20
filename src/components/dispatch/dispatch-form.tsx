'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestOptimalDispatch, SuggestOptimalDispatchInput, SuggestOptimalDispatchOutput } from '@/ai/flows/suggest-optimal-dispatch';
import { getAmbulanceLocationsForAI, getVehicleAvailabilityForAI } from '@/lib/ambulance-data';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  patientNeeds: z.string().min(10, { message: 'Patient needs must be at least 10 characters.' }),
  trafficConditions: z.string().min(5, { message: 'Traffic conditions must be at least 5 characters.' }),
  weatherConditions: z.string().min(5, { message: 'Weather conditions must be at least 5 characters.' }),
});

type DispatchFormValues = z.infer<typeof formSchema>;

interface DispatchFormProps {
  onSuggestion: (suggestion: SuggestOptimalDispatchOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function DispatchForm({ onSuggestion, setIsLoading }: DispatchFormProps) {
  const { toast } = useToast();
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientNeeds: '',
      trafficConditions: 'Normal',
      weatherConditions: 'Clear',
    },
  });

  async function onSubmit(values: DispatchFormValues) {
    setIsLoading(true);
    onSuggestion(null); 
    try {
      const aiInput: SuggestOptimalDispatchInput = {
        ...values,
        ambulanceLocations: getAmbulanceLocationsForAI(),
        vehicleAvailability: getVehicleAvailabilityForAI(),
      };
      const result = await suggestOptimalDispatch(aiInput);
      onSuggestion(result);
      toast({ title: "Dispatch Suggestion Ready", description: "AI has provided an optimal dispatch." });
    } catch (error) {
      console.error('Error getting dispatch suggestion:', error);
      onSuggestion(null);
      toast({ title: "Error", description: "Failed to get dispatch suggestion.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">Dispatch Input</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Needs & Condition</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Elderly male, suspected cardiac arrest, unconscious..." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Describe the patient's situation and requirements.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trafficConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traffic Conditions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Heavy congestion on Main St." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weatherConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Conditions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Clear, light rain, heavy snow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Analyzing...' : 'Get Dispatch Suggestion'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
