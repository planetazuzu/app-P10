
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger, // Importado para usarlo en el header de la sidebar
} from '@/components/ui/sidebar'; 
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/types';
import Link from 'next/link'; 
import { useIsMobile } from '@/hooks/use-mobile'; // Importar para lógica de escritorio/móvil

export function AppSidebar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile(); // Determinar si es vista móvil

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
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" passHref>
          {/* El div del logo y texto se oculta cuando la barra está colapsada en modo icono */}
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden cursor-pointer">
            {/* Icons.Logo component removed from here */}
            <div className="flex flex-col text-center"> {/* Added text-center */}
              <h1 className="font-bold text-md text-sidebar-foreground leading-tight">P10</h1>
              <h1 className="font-bold text-md text-sidebar-foreground leading-tight">Gestión Flota</h1>
            </div>
          </div>
        </Link>
        {/* SidebarTrigger para escritorio: se oculta en móvil para evitar duplicado con el del Header principal */}
        {!isMobile && (
            <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent" />
        )}
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <div className="text-xs font-semibold uppercase text-sidebar-foreground/70 px-2 mb-1 group-data-[collapsible=icon]:hidden">
          Navegación Principal
        </div>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
           <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile avatar"/>
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-semibold">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
            {/* Ya no se muestra el rol aquí, según petición anterior */}
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
