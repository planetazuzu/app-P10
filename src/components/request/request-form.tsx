'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { createRequest } from '@/lib/request-data';
import type { EmergencyRequest } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const requestFormSchema = z.object({
  patientDetails: z.string().min(10, { message: 'Patient details must be at least 10 characters.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  // For simplicity, latitude and longitude will be auto-generated or fixed in mock
  priority: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  onFormSubmit?: () => void; // Callback after successful submission
  mode?: 'create' | 'edit';
  initialData?: Partial<EmergencyRequest>;
}

export function RequestForm({ onFormSubmit, mode = 'create', initialData }: RequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientDetails: initialData?.patientDetails || '',
      address: initialData?.location?.address || '',
      priority: initialData?.priority || 'medium',
      notes: initialData?.notes || '',
    },
  });

  async function onSubmit(values: RequestFormValues) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a request.", variant: "destructive"});
      return;
    }

    // Mock latitude and longitude
    const mockLocation = {
      latitude: 34.0522 + (Math.random() - 0.5) * 0.1,
      longitude: -118.2437 + (Math.random() - 0.5) * 0.1,
      address: values.address,
    };

    const requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'> = {
      requesterId: user.id,
      patientDetails: values.patientDetails,
      location: mockLocation,
      status: 'pending',
      priority: values.priority,
      notes: values.notes,
    };
    
    try {
      await createRequest(requestData);
      toast({ title: "Request Submitted", description: "Your emergency request has been successfully submitted."});
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      } else {
        router.push('/request-management'); // Default redirect
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ title: "Submission Failed", description: "Could not submit your request. Please try again.", variant: "destructive"});
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="section-title">{mode === 'create' ? 'Submit New Emergency Request' : 'Edit Emergency Request'}</CardTitle>
        <CardDescription>Fill in the details below. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Details *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the patient's condition, age, gender, etc." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormDescription>Provide the full address of the emergency.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any other relevant information (e.g., access codes, hazards)." {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (mode === 'create' ? 'Submitting...' : 'Updating...') : (mode === 'create' ? 'Submit Request' : 'Save Changes')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
