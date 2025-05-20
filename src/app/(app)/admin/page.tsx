'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div>
      <h1 className="page-title mb-8">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle className="section-title">System Administration</CardTitle>
          </div>
          <CardDescription>Manage users, system settings, and monitor application health.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="text-secondary"/>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View, add, or modify user accounts and roles. (Feature under development)
              </p>
              <Button variant="secondary" disabled>Manage Users</Button>
            </CardContent>
          </Card>
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="text-secondary"/>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure application parameters and integrations. (Feature under development)
              </p>
              <Button variant="outline" disabled>Configure Settings</Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
