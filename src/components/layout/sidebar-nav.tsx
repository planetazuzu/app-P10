
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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import React, { useState } from 'react';


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
  { title: 'Despacho Inteligente', href: '/smart-dispatch', icon: 'SmartDispatch', roles: ['admin', 'hospital', 'centroCoordinador'] },
  {
    title: 'Gestión Solicitudes',
    href: '/request-management',
    icon: 'RequestManagement',
    roles: ['admin', 'hospital', 'individual', 'centroCoordinador'],
    submenu: [
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'], exactMatch: true },
        { title: 'Nueva Solicitud (Urgente)', href: '/request-management/new', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Solicitud (Programada)', href: '/request-management/new-programmed', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Solicitud (Avanzada)', href: '/request-management/new-advanced', icon: 'RequestManagement', roles: ['admin', 'hospital', 'centroCoordinador'] },
    ]
  },
  { title: 'Mensajes', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'], disabled: true },
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
        { title: 'Gestión Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin', 'centroCoordinador'] },
        {
          title: 'Gestión Ambulancias',
          href: '/admin/ambulances',
          icon: 'Ambulance',
          roles: ['admin', 'centroCoordinador'],
          submenu: [
            { title: 'Listar Ambulancias', href: '/admin/ambulances', icon: 'Ambulance', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Añadir Ambulancia', href: '/admin/ambulances/new', icon: 'Ambulance', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        { 
          title: 'Gestión Lotes y Rutas', 
          href: '/admin/lotes', 
          icon: 'Waypoints', 
          roles: ['admin', 'centroCoordinador'] 
        },
        { title: 'Config. Sistema', href: '/admin/system-settings', icon: 'Settings', roles: ['admin', 'centroCoordinador'], disabled: true },
    ]
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialOpen: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.submenu && item.submenu.some(subItem => pathname.startsWith(subItem.href) || (subItem.submenu && subItem.submenu.some(s => pathname.startsWith(s.href))))) {
        initialOpen[item.href] = true;
        if (item.submenu.find(subItem => subItem.submenu && subItem.submenu.some(s => pathname.startsWith(s.href)))) {
            const parentSubMenu = item.submenu.find(subItem => subItem.submenu && subItem.submenu.some(s => pathname.startsWith(s.href)));
            if(parentSubMenu) initialOpen[parentSubMenu.href] = true;
        }
      }
    });
     navItems.forEach(item => {
        if (item.submenu) {
            item.submenu.forEach(subItem => {
                if ((subItem.exactMatch ? subItem.href === pathname : pathname.startsWith(subItem.href)) || 
                    (subItem.submenu && subItem.submenu.some(s => s.exactMatch ? s.href === pathname : pathname.startsWith(s.href)))) {
                    initialOpen[item.href] = true; 
                    if (subItem.submenu && subItem.submenu.some(s => s.exactMatch ? s.href === pathname : pathname.startsWith(s.href))) {
                         initialOpen[subItem.href] = true; 
                    }
                }
            });
        } else if (item.exactMatch ? item.href === pathname : pathname.startsWith(item.href)) {
           // For top-level items that are active, no need to explicitly open, but handled for consistency if needed
        }
    });
    return initialOpen;
  });

  if (!user) return null;

  const userHasRole = (roles: UserRole[]) => roles.includes(user.role);

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const renderNavItem = (item: NavItem, isSubmenuItem = false, level = 0) => {
    if (!userHasRole(item.roles)) return null;

    const Icon = Icons[item.icon];
    
    let isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
    if (item.submenu && !isActive) { 
        isActive = item.submenu.some(sub => (sub.exactMatch ? pathname === sub.href : pathname.startsWith(sub.href))) ||
                   item.submenu.some(sub => sub.submenu && sub.submenu.some(s => (s.exactMatch ? pathname === s.href : pathname.startsWith(s.href))));
    }
    
    const hasSubmenu = item.submenu && item.submenu.length > 0 && item.submenu.some(sub => userHasRole(sub.roles));
    const isMenuOpen = openMenus[item.href] || false;
    
    const ButtonComponent = isSubmenuItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const buttonContent = (
        <>
            <Icon className={cn("h-5 w-5", isActive && !hasSubmenu && !isSubmenuItem ? "text-sidebar-primary-foreground" : (isActive && (isSubmenuItem || (hasSubmenu && isMenuOpen)) ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"))} />
            <span className={cn({"pl-1" : level > 0 && isSubmenuItem})}>{item.title}</span>
            {item.label && <span className="ml-auto text-xs">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4" /> : <Icons.ChevronRight className="ml-auto h-4 w-4" />
            )}
        </>
    );
    
    const effectiveIsActiveForButton = isActive;
    
    return (
      <SidebarMenuItem key={item.href} className={cn({"bg-sidebar-accent/50": effectiveIsActiveForButton && hasSubmenu && isMenuOpen && !isSubmenuItem })}>
        {hasSubmenu ? (
          <ButtonComponent
            onClick={() => toggleMenu(item.href)}
            isActive={effectiveIsActiveForButton && isMenuOpen}
            aria-expanded={isMenuOpen}
            className={cn(
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActiveForButton && isMenuOpen && !isSubmenuItem },
                {"hover:bg-sidebar-accent/80": effectiveIsActiveForButton && isMenuOpen && !isSubmenuItem}
            )}
          >
            {buttonContent}
          </ButtonComponent>
        ) : (
          <Link href={item.href} passHref legacyBehavior>
            <ButtonComponent
              asChild={!isSubmenuItem}
              // @ts-ignore
              href={isSubmenuItem ? item.href : undefined}
              isActive={isActive}
              disabled={item.disabled}
              className={cn(
                {"bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90": isActive && !hasSubmenu && !isSubmenuItem },
                {"bg-sidebar-accent text-sidebar-accent-foreground": isActive && isSubmenuItem},
                {"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground": !isActive }
                )}
              tooltip={item.title}
            >
              {isSubmenuItem ? <>{buttonContent}</> : <a className="flex w-full items-center gap-2">{buttonContent}</a>}
            </ButtonComponent>
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

    