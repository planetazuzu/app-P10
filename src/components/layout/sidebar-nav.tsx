
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
  exactMatch?: boolean; // Para que solo se active si la ruta es exacta
}

const navItems: NavItem[] = [
  { title: 'Panel', href: '/dashboard', icon: 'Dashboard', roles: ['admin', 'hospital', 'individual', 'equipoTraslado'] },
  { title: 'Seguimiento Ambulancias', href: '/ambulance-tracking', icon: 'Map', roles: ['admin', 'hospital'] },
  { title: 'Despacho Inteligente', href: '/smart-dispatch', icon: 'SmartDispatch', roles: ['admin', 'hospital'] },
  {
    title: 'Gestión Solicitudes',
    href: '/request-management',
    icon: 'RequestManagement',
    roles: ['admin', 'hospital', 'individual', 'equipoTraslado'],
    submenu: [
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'equipoTraslado'], exactMatch: true },
        { title: 'Nueva Solicitud (Urgente)', href: '/request-management/new', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual'] },
        { title: 'Nueva Solicitud (Programada)', href: '/request-management/new-programmed', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual'] },
        { title: 'Nueva Solicitud (Avanzada)', href: '/request-management/new-advanced', icon: 'RequestManagement', roles: ['admin', 'hospital'] },
    ]
  },
  { title: 'Mensajes', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'equipoTraslado'], disabled: true },
  {
    title: 'Ruta del Día (Conductor)',
    href: '/driver/batch-view/lote-demo-123', // Ruta de ejemplo
    icon: 'Map', // O 'Route' si tuvieras ese icono
    roles: ['equipoTraslado'],
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: 'ShieldCheck',
    roles: ['admin'],
    submenu: [
        { title: 'Panel Admin', href: '/admin', icon: 'ShieldCheck', roles: ['admin'], exactMatch: true },
        { title: 'Gestión Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin'] },
        {
          title: 'Gestión Ambulancias',
          href: '/admin/ambulances',
          icon: 'Ambulance',
          roles: ['admin'],
          submenu: [
            { title: 'Listar Ambulancias', href: '/admin/ambulances', icon: 'Ambulance', roles: ['admin'] },
            { title: 'Añadir Ambulancia', href: '/admin/ambulances/new', icon: 'Ambulance', roles: ['admin'] },
          ]
        },
        { title: 'Config. Sistema', href: '/admin/system-settings', icon: 'Settings', roles: ['admin'], disabled: true },
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
    // Ensure parent of active item is open
     navItems.forEach(item => {
        if (item.submenu) {
            item.submenu.forEach(subItem => {
                if (subItem.href === pathname || (subItem.submenu && subItem.submenu.some(s => s.href === pathname))) {
                    initialOpen[item.href] = true; // Open parent
                    if (subItem.submenu && subItem.submenu.some(s => s.href === pathname)) {
                         initialOpen[subItem.href] = true; // Open sub-parent
                    }
                }
            });
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
    // For parent menu items with submenus, isActive should also consider if a child is active
    let isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
    if (item.submenu && !isActive) { // if current item is not active, check children
        isActive = item.submenu.some(sub => sub.exactMatch ? pathname === sub.href : pathname.startsWith(sub.href)) ||
                   item.submenu.some(sub => sub.submenu && sub.submenu.some(s => s.exactMatch ? pathname === s.href : pathname.startsWith(s.href)));
    }
    
    const hasSubmenu = item.submenu && item.submenu.length > 0 && item.submenu.some(sub => userHasRole(sub.roles));
    const isMenuOpen = openMenus[item.href] || false;
    
    const ButtonComponent = isSubmenuItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const buttonContent = (
        <>
            <Icon className={cn("h-5 w-5", isActive && !hasSubmenu && !isSubmenuItem ? "text-sidebar-primary-foreground" : (isActive && isSubmenuItem ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"))} />
            <span className={cn({"pl-1" : level > 0 && isSubmenuItem})}>{item.title}</span>
            {item.label && <span className="ml-auto text-xs">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4" /> : <Icons.ChevronRight className="ml-auto h-4 w-4" />
            )}
        </>
    );
    
    // An open menu with an active child should also highlight the parent button.
    const effectiveIsActiveForButton = (isActive && !hasSubmenu) || (hasSubmenu && isMenuOpen && isActive);
    
    return (
      <SidebarMenuItem key={item.href} className={cn({"bg-sidebar-accent/50": effectiveIsActiveForButton && hasSubmenu && isMenuOpen })}>
        {hasSubmenu ? (
          <ButtonComponent
            onClick={() => toggleMenu(item.href)}
            isActive={effectiveIsActiveForButton}
            aria-expanded={isMenuOpen}
            className={cn(
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActiveForButton && isMenuOpen },
                {"hover:bg-sidebar-accent/80": effectiveIsActiveForButton && isMenuOpen}
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
                // For non-submenu items OR final submenu items
                {"bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90": isActive && !hasSubmenu },
                // For submenu items themselves that are active
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
          <SidebarMenuSub className={cn({"pl-2": level > 0})}>
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
