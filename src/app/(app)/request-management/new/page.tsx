'use client';

import { RequestForm } from '@/components/request/request-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function NewRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const canCreate = user.role === 'admin' || user.role === 'hospital' || user.role === 'individual';
      if (!canCreate) {
        router.replace('/dashboard'); // Or an unauthorized page
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p className="rioja-container text-center">Loading access permissions...</p>;
  }
  
  if (!user || !(user.role === 'admin' || user.role === 'hospital' || user.role === 'individual')) {
    return <p className="rioja-container text-center text-red-500">You do not have permission to create requests.</p>;
  }


  return (
    <div>
      <h1 className="page-title mb-8">Create New Emergency Request</h1>
      <RequestForm mode="create" />
    </div>
  );
}
