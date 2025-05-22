
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserForm } from '@/components/admin/user-form';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/types';
import { mockGetUserById } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditUserPage() {
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { toast } = useToast();

  const [userData, setUserData] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authIsLoading && currentUser && !['admin', 'centroCoordinador'].includes(currentUser.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para editar usuarios.',
        variant: 'destructive',
      });
      router.replace('/admin/user-management');
      return;
    }

    if (userId && currentUser && ['admin', 'centroCoordinador'].includes(currentUser.role)) {
      setIsLoadingData(true);
      const fetchedUser = mockGetUserById(userId);
      if (fetchedUser) {
        setUserData(fetchedUser);
      } else {
        toast({
          title: 'Usuario no Encontrado',
          description: `No se pudo encontrar el usuario con ID: ${userId}.`,
          variant: 'destructive',
        });
        router.replace('/admin/user-management');
      }
      setIsLoadingData(false);
    } else if (!userId && currentUser && ['admin', 'centroCoordinador'].includes(currentUser.role)) {
        toast({ title: 'Error', description: 'ID de usuario no especificado.', variant: 'destructive' });
        router.push('/admin/user-management');
        setIsLoadingData(false);
    }

  }, [currentUser, authIsLoading, router, toast, userId]);

  if (authIsLoading || isLoadingData) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    // This case should ideally be handled by the redirect in useEffect, but as a fallback:
    return (
      <div className="rioja-container text-center">
        <p className="text-red-500">No se pudieron cargar los datos del usuario para editar.</p>
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <UserForm mode="edit" initialData={userData} userId={userId} />
    </div>
  );
}
