
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Globe } from 'lucide-react'; // Revertido a Globe

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-2">
        <Globe className="h-16 w-16 text-primary animate-pulse" data-ai-hint="globe world" /> {/* Revertido a Globe */}
        <p className="text-xl font-semibold text-foreground">Iniciando p10 - Gestión de usuarios y flota...</p>
      </div>
    </div>
  );
}
