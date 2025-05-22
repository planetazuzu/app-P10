
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/types';

// Helper para traducir el rol del usuario
const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'hospital':
      return 'Hospital';
    case 'individual':
      return 'Individual';
    case 'equipoTraslado':
      return 'Equipo Traslado';
    default:
      return role;
  }
};


export function AppSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center justify-between p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <h1 className="font-bold text-lg text-secondary">RMG</h1> {/* RMG por Respuesta Médica Global */}
        </div>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden md:flex" />
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
           <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile avatar" />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{translateUserRole(user.role)}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:text-destructive" 
            onClick={logout}
            aria-label="Cerrar Sesión"
          >
            <Icons.Logout className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
