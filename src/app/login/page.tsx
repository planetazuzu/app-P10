'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { MOCK_USERS } from '@/lib/auth';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock password, not used for login logic
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !authIsLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authIsLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email);
    if (success) {
      router.push('/dashboard');
      toast({ title: "Login Successful", description: "Welcome back!" });
    } else {
      toast({ title: "Login Failed", description: "Invalid email or user not found.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  if (authIsLoading || (!authIsLoading && isAuthenticated)) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-2">
          <Globe className="h-12 w-12 text-primary" />
          <p className="text-xl font-semibold text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const availableEmails = Object.keys(MOCK_USERS).join(', ');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-secondary">Global Medic Response</CardTitle>
          <CardDescription>Sign in to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start text-sm text-muted-foreground">
          <p className="font-semibold">Available mock users (email):</p>
          <ul className="list-disc list-inside">
            {Object.keys(MOCK_USERS).map(mockEmail => <li key={mockEmail}>{mockEmail} (any password)</li>)}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
}
