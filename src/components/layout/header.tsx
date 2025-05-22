
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; // Import useSidebar
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

// Helper para traducir el rol del usuario
const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'hospital':
      return 'Personal Hospitalario';
    case 'individual':
      return 'Usuario Individual';
    case 'equipoTraslado':
      return 'Equipo de Traslado';
    default:
      return role;
  }
};

export function Header() {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar(); // Get isMobile from useSidebar context

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger />} 
          <div className="flex items-center gap-2">
            <Icons.Logo className="h-7 w-7 text-primary" />
            <span className="hidden font-bold text-secondary sm:inline-block text-lg">
              Respuesta Médica Global
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-sm text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{translateUserRole(user.role)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile avatar" />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <Icons.Logout className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
