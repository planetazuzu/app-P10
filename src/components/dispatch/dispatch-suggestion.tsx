'use client';

import type { SuggestOptimalDispatchOutput } from '@/ai/flows/suggest-optimal-dispatch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ambulance, Lightbulb } from 'lucide-react';

interface DispatchSuggestionProps {
  suggestion: SuggestOptimalDispatchOutput | null;
  isLoading: boolean;
}

export function DispatchSuggestion({ suggestion, isLoading }: DispatchSuggestionProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 animate-pulse">
        <CardHeader>
          <CardTitle className="section-title">AI Suggestion</CardTitle>
          <CardDescription>Analyzing data to find the optimal dispatch...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestion) {
    return null; // Or a placeholder message if preferred
  }

  return (
    <Card className="mt-6 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            AI Dispatch Suggestion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-primary/10 border-primary/30">
          <Ambulance className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary text-lg">Dispatch: {suggestion.optimalAmbulance}</AlertTitle>
          <AlertDescription className="text-foreground/80">
            {suggestion.reasoning}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
