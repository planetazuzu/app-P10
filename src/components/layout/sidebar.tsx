
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  // SidebarTrigger is now part of Header for mobile
  // useSidebar, // Not directly needed here anymore if trigger is in header
} from '@/components/ui/sidebar'; // Ensure useSidebar can be removed if not used
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/types';
import Link from 'next/link'; // Added for logo link

// Helper para traducir el rol del usuario
const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'hospital':
      return 'Hospital';
    case 'individual':
      return 'Individual';
    case 'centroCoordinador':
      return 'Centro Coord.';
    case 'ambulancia':
      return 'Ambulancia'; // Updated
    default:
      return role;
  }
};


export function AppSidebar() {
  // const { state, isMobile, toggleSidebar } = useSidebar(); // May not be needed if trigger is always in header
  const { user, logout } = useAuth();

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      <SidebarHeader className="items-center justify-between p-4">
        <Link href="/dashboard" passHref>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden cursor-pointer">
            <Icons.Logo className="h-8 w-8 text-sidebar-foreground" data-ai-hint="logo company" />
            <div className="flex flex-col">
              <h1 className="font-bold text-md text-sidebar-foreground leading-tight">Gestión</h1>
              <h1 className="font-bold text-md text-sidebar-foreground leading-tight">Ambulancias</h1>
            </div>
          </div>
        </Link>
        {/* SidebarTrigger is now in the main Header for mobile, so it's removed from here for desktop */}
        {/* <SidebarTrigger className="group-data-[collapsible=icon]:hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent" /> */}
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <div className="text-xs font-semibold uppercase text-sidebar-foreground/70 px-2 mb-1 group-data-[collapsible=icon]:hidden">
          Navegación Principal
        </div>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
           <Avatar className="h-8 w-8 border-2 border-primary"> {/* Active green border for avatar */}
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile avatar"/>
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-semibold">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
            {/* Rol del usuario eliminado de aquí */}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto group-data-[collapsible=icon]:hidden text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10" 
            onClick={logout}
            aria-label="Cerrar Sesión"
            title="Cerrar Sesión"
          >
            <Icons.Logout className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

