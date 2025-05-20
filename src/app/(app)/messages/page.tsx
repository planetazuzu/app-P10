'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function MessagesPage() {
  return (
    <div>
      <h1 className="page-title mb-8">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Communication Hub</CardTitle>
          <CardDescription>
            Secure messaging between dispatch, ambulance crews, and hospitals. This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Feature Under Development" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="communication chat"
                />
            </div>
          <MessageSquare className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            Coming Soon!
          </p>
          <p className="text-muted-foreground">
            We are working hard to bring you a seamless messaging experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
