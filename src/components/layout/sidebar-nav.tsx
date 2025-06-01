
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Icons, IconName } from '@/components/icons';
import type { UserRole } from '@/types';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';


interface NavItem {
  title: string;
  href: string;
  icon: IconName;
  roles: UserRole[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
  submenu?: NavItem[];
  exactMatch?: boolean;
}

const navItems: NavItem[] = [
  { title: 'Panel', href: '/dashboard', icon: 'Dashboard', roles: ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'] },
  { title: 'Seguimiento Ambulancias', href: '/ambulance-tracking', icon: 'Map', roles: ['admin', 'hospital', 'centroCoordinador'] },
  { title: 'Despacho Inteligente IA', href: '/smart-dispatch', icon: 'SmartDispatch', roles: ['admin', 'hospital', 'centroCoordinador'] },
  {
    title: 'Gestión Solicitudes',
    href: '/request-management',
    icon: 'RequestManagement',
    roles: ['admin', 'hospital', 'individual', 'centroCoordinador'],
    submenu: [
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'ListChecks', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'], exactMatch: true },
        { title: 'Nueva Solicitud (Urgente)', href: '/request-management/new', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Solicitud (Programada)', href: '/request-management/new-programmed', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Solicitud (Avanzada)', href: '/request-management/new-advanced', icon: 'RequestManagement', roles: ['admin', 'hospital', 'centroCoordinador'] },
    ]
  },
  { title: 'Mensajes', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'] },
  {
    title: 'Mi Ruta de Hoy', 
    href: '/driver/batch-view/lote-demo-123', 
    icon: 'MapIcon', 
    roles: ['equipoMovil'],
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: 'ShieldCheck',
    roles: ['admin', 'centroCoordinador'],
    submenu: [
        { title: 'Panel Admin', href: '/admin', icon: 'ShieldCheck', roles: ['admin', 'centroCoordinador'], exactMatch: true },
        { 
          title: 'Gestión Usuarios', 
          href: '/admin/user-management', 
          icon: 'Users', 
          roles: ['admin', 'centroCoordinador'],
          submenu: [
            { title: 'Listar Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Añadir Usuario', href: '/admin/user-management/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        {
          title: 'Gestión Ambulancias',
          href: '/admin/ambulances',
          icon: 'Ambulance',
          roles: ['admin', 'centroCoordinador'],
          submenu: [
            { title: 'Listar Ambulancias', href: '/admin/ambulances', icon: 'Ambulance', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Añadir Ambulancia', href: '/admin/ambulances/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        { 
          title: 'Gestión Lotes y Rutas', 
          href: '/admin/lotes', 
          icon: 'Waypoints', 
          roles: ['admin', 'centroCoordinador'],
          submenu: [
            { title: 'Listar Lotes', href: '/admin/lotes', icon: 'Waypoints', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Crear Lote', href: '/admin/lotes/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
            { title: 'Planificar Servicios', href: '/admin/services-planning', icon: 'CalendarDays', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        { title: 'Config. Sistema', href: '/admin/system-settings', icon: 'Settings', roles: ['admin', 'centroCoordinador'] },
    ]
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    const checkAndSetOpen = (items: NavItem[], parentPath = '') => {
      items.forEach(item => {
        const currentItemPath = item.href;
        if (item.submenu) {
          const isChildActiveOrPathStartsWith = item.submenu.some(subItem => 
            (subItem.exactMatch ? pathname === subItem.href : pathname.startsWith(subItem.href)) ||
            (subItem.submenu && subItem.submenu.some(s => pathname.startsWith(s.href)))
          );
          
          if (pathname.startsWith(currentItemPath) || isChildActiveOrPathStartsWith) {
            initialOpen[currentItemPath] = true;
            checkAndSetOpen(item.submenu, currentItemPath); 
          }
        }
      });
    };
    checkAndSetOpen(navItems);
    setOpenMenus(initialOpen);
  }, [pathname]);


  if (!user) return null;

  const userHasRole = (roles: UserRole[]) => roles.includes(user.role);

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const renderNavItem = (item: NavItem, isSubmenuItem = false, level = 0): JSX.Element | null => {
    if (!userHasRole(item.roles)) return null;

    const Icon = Icons[item.icon];
    
    let isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
    
    if (item.submenu && item.submenu.length > 0 && !isActive) {
      const isChildActive = (childItems: NavItem[]): boolean => {
        return childItems.some(child => {
          const childIsActiveCurrentLevel = child.exactMatch ? pathname === child.href : pathname.startsWith(child.href);
          if (childIsActiveCurrentLevel) return true;
          if (child.submenu && child.submenu.length > 0) return isChildActive(child.submenu);
          return false;
        });
      };
      isActive = isChildActive(item.submenu);
    }
    
    const hasSubmenu = item.submenu && item.submenu.length > 0 && item.submenu.some(sub => userHasRole(sub.roles));
    const isMenuOpen = openMenus[item.href] || false;
    
    const ButtonComponent = isSubmenuItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const buttonContent = (
        <>
            <Icon className={cn("h-5 w-5", isActive && !hasSubmenu && !isSubmenuItem && !item.disabled ? "text-sidebar-primary-foreground" : (isActive && (isSubmenuItem || (hasSubmenu && isMenuOpen)) && !item.disabled ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"))} />
            <span className={cn({"pl-1" : level > 0 && isSubmenuItem})}>{item.title}</span>
            {item.label && <span className="ml-auto text-xs">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4" /> : <Icons.ChevronRight className="ml-auto h-4 w-4" />
            )}
        </>
    );
    
    const effectiveIsActiveForButton = isActive && !item.disabled; 
    
    const buttonElement = (
        <ButtonComponent
            asChild={!hasSubmenu && !item.disabled && !isSubmenuItem}
            href={ (hasSubmenu || item.disabled || isSubmenuItem) ? undefined : item.href }
            isActive={effectiveIsActiveForButton}
            disabled={item.disabled}
            className={cn(
                {"bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90": effectiveIsActiveForButton && !hasSubmenu && !isSubmenuItem },
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActiveForButton && isSubmenuItem},
                {"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground": !effectiveIsActiveForButton && !item.disabled },
                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-sidebar-foreground" 
            )}
            tooltip={item.title}
            onClick={item.disabled ? (e) => e.preventDefault() : undefined}
        >
            {(!hasSubmenu && !item.disabled && !isSubmenuItem) ? ( 
                <a className="flex w-full items-center gap-2">{buttonContent}</a>
            ) : (
                buttonContent
            )}
        </ButtonComponent>
    );

    return (
      <SidebarMenuItem key={item.href} className={cn({"bg-sidebar-accent/50": effectiveIsActiveForButton && hasSubmenu && isMenuOpen && !isSubmenuItem })}>
        {hasSubmenu ? (
          <div onClick={item.disabled ? (e) => e.preventDefault() : () => toggleMenu(item.href)} className="cursor-pointer">
             {buttonElement}
          </div>
        ) : item.disabled ? (
             buttonElement 
        ) : isSubmenuItem ? ( 
            <Link href={item.href} passHref legacyBehavior>
                 {buttonElement}
            </Link>
        ) : ( 
          <Link href={item.href} passHref legacyBehavior>
            {buttonElement}
          </Link>
        )}
        {hasSubmenu && isMenuOpen && (
          <SidebarMenuSub className={cn({"pl-2": level > 0 && isSubmenuItem, "pl-0": level===0 && isSubmenuItem })}>
            {item.submenu?.map(subItem => renderNavItem(subItem, true, level + 1))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarMenu>
      {navItems.map(item => renderNavItem(item))}
    </SidebarMenu>
  );
}

