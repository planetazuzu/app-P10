'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Image from 'next/image';

export default function UserManagementPage() {
  return (
    <div>
      <h1 className="page-title mb-8">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Manage Platform Users</CardTitle>
          <CardDescription>
            This section will allow administrators to add, edit, and remove users, as well as manage their roles and permissions. This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="User Management Under Development" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="team collaboration"
                />
            </div>
          <Users className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            User Management Coming Soon!
          </p>
          <p className="text-muted-foreground">
            Stay tuned for powerful user administration tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
