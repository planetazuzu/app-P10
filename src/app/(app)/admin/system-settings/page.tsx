'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import Image from 'next/image';

export default function SystemSettingsPage() {
  return (
    <div>
      <h1 className="page-title mb-8">System Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Configure System Parameters</CardTitle>
          <CardDescription>
            This area will provide options to configure various system-wide settings, integrations, and operational parameters. This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
           <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="System Settings Under Development" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="control panel"
                />
            </div>
          <Settings className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            System Settings Coming Soon!
          </p>
          <p className="text-muted-foreground">
            Advanced configuration options will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
