
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
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import type { UserRole } from '@/types';
import Link from 'next/link';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "./ThemeToggle"; 
import { useRouter } from 'next/navigation'; 

const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'hospital':
      return 'Personal Hospitalario';
    case 'individual':
      return 'Usuario Individual';
    case 'centroCoordinador':
      return 'Centro Coordinador';
    case 'ambulancia': 
      return 'Ambulancia';
    default:
      return role;
  }
};

interface MockNotification {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

const mockNotificationsData: MockNotification[] = [
  { id: 'notif1', icon: <Icons.Ambulance className="text-blue-500" />, title: 'Nueva Ambulancia Asignada', description: 'La unidad AMB-003 ha sido asignada a su solicitud #REQ123.', time: 'hace 5 min', read: false, link: '/request-management' },
  { id: 'notif2', icon: <Icons.MessageSquare className="text-green-500" />, title: 'Nuevo Mensaje', description: 'Tiene un nuevo mensaje de Soporte Técnico.', time: 'hace 12 min', read: false, link: '/messages'},
  { id: 'notif3', icon: <Icons.Settings className="text-orange-500" />, title: 'Mantenimiento Programado', description: 'El sistema estará en mantenimiento el día 30 a las 02:00 AM.', time: 'hace 1 hora', read: true },
  { id: 'notif4', icon: <Icons.FileText className="text-purple-500" />, title: 'Solicitud Actualizada', description: 'Su solicitud #REQ100 ha sido completada.', time: 'hace 3 horas', read: true},
];


export function Header() {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar(); 
  const [notifications, setNotifications] = useState<MockNotification[]>(mockNotificationsData);
  const router = useRouter(); 

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'; 
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card text-card-foreground shadow-sm"> 
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger className="text-secondary hover:bg-muted/50" />} 
          <div className="flex items-center gap-2">
            
            <span className="font-bold text-secondary sm:inline-block text-lg"> 
              P10 - Gestión de usuarios y flota
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-secondary hover:bg-muted/50"> 
                  <Icons.Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                   <span className="sr-only">Notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notificaciones</span>
                  {unreadCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleMarkAllAsRead}>Marcar todas como leídas</Button>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {notifications.length === 0 && <DropdownMenuItem disabled>No tiene notificaciones.</DropdownMenuItem>}
                  {notifications.slice(0, 5).map(notif => ( 
                    <DropdownMenuItem key={notif.id} 
                      className={cn("flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-accent focus:bg-accent", !notif.read && "bg-primary/5")}
                      onSelect={(e) => {
                        e.preventDefault(); 
                        handleMarkAsRead(notif.id);
                        if (notif.link && router) router.push(notif.link); 
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">{React.cloneElement(notif.icon as React.ReactElement, { className: "h-5 w-5"})}</div>
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", !notif.read && "font-semibold text-primary")}>{notif.title}</p> 
                        <p className="text-xs text-muted-foreground">{notif.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{notif.time}</p>
                      </div>
                      {!notif.read && <div className="ml-auto self-center h-2 w-2 rounded-full bg-primary"></div>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                 {notifications.length > 5 && (
                    <>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem className="justify-center text-sm text-primary hover:underline cursor-pointer">
                            Ver todas las notificaciones (Próx.)
                        </DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle /> 

            <div className="text-right hidden md:block">
              <p className="font-semibold text-sm text-secondary">{user.name}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9 bg-secondary"> 
                    <AvatarFallback> 
                        <Icons.UserCircle className="h-5 w-5 text-secondary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto min-w-[10rem]" align="end" forceMount>
                 <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {translateUserRole(user.role)}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive hover:!bg-destructive/10 focus:bg-destructive/10">
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
