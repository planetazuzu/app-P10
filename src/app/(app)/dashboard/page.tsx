'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, FileText, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This component is created for the `card-stats` styling.
const StatsCard = ({ title, value, icon, description, link, linkText }: { title: string, value: string | number, icon: React.ReactNode, description?: string, link?: string, linkText?: string }) => (
  <Card className="card-stats">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      {link && linkText && (
        <Link href={link} passHref>
          <Button variant="link" className="px-0 pt-2 text-sm text-primary hover:text-primary/80">
            {linkText}
          </Button>
        </Link>
      )}
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user data...</p>;
  }

  // Mock data for dashboard cards
  const stats = {
    activeAmbulances: 15,
    pendingRequests: 8,
    activeUsers: 120,
    averageResponseTime: '12 min',
  };

  const canViewAmbulanceTracking = user.role === 'admin' || user.role === 'hospital';
  const canViewSmartDispatch = user.role === 'admin' || user.role === 'hospital';
  const canViewRequestManagement = ['admin', 'hospital', 'individual', 'ambulance'].includes(user.role);

  return (
    <div>
      <h1 className="page-title mb-8">Welcome, {user.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
          title="Active Ambulances" 
          value={stats.activeAmbulances}
          icon={<Ambulance className="h-5 w-5 text-muted-foreground" />}
          description="+2 since last hour"
          {...(canViewAmbulanceTracking && { link: "/ambulance-tracking", linkText: "View Map"})}
        />
        <StatsCard 
          title="Pending Requests" 
          value={stats.pendingRequests}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          description="High priority: 3"
          {...(canViewRequestManagement && { link: "/request-management", linkText: "Manage Requests"})}
        />
        {user.role === 'admin' && (
           <StatsCard 
            title="Active Users" 
            value={stats.activeUsers}
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            description="Across all roles"
          />
        )}
        <StatsCard 
          title="Avg. Response Time" 
          value={stats.averageResponseTime}
          icon={<Zap className="h-5 w-5 text-muted-foreground" />}
          description="Last 24 hours"
          {...(canViewSmartDispatch && { link: "/smart-dispatch", linkText: "Optimize Dispatch"})}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-title">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          { (user.role === 'individual' || user.role === 'hospital' || user.role === 'admin') && (
            <Link href="/request-management/new" passHref>
              <Button className="w-full" variant="default">Create New Request</Button>
            </Link>
          )}
          { canViewAmbulanceTracking && (
             <Link href="/ambulance-tracking" passHref>
                <Button className="w-full" variant="secondary">Track Ambulances</Button>
            </Link>
          )}
          { canViewSmartDispatch && (
             <Link href="/smart-dispatch" passHref>
                <Button className="w-full" variant="outline">Smart Dispatch AI</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for recent activity or notifications */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="section-title">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  );
}
