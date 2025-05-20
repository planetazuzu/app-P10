
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
  { title: 'Panel', href: '/dashboard', icon: 'Dashboard', roles: ['admin', 'hospital', 'individual', 'ambulance'] },
  { title: 'Seguimiento Ambulancias', href: '/ambulance-tracking', icon: 'Map', roles: ['admin', 'hospital'] },
  { title: 'Despacho Inteligente', href: '/smart-dispatch', icon: 'SmartDispatch', roles: ['admin', 'hospital'] },
  { 
    title: 'Gestión Solicitudes', 
    href: '/request-management', 
    icon: 'RequestManagement', 
    roles: ['admin', 'hospital', 'individual', 'ambulance'],
    submenu: [
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'ambulance'], exactMatch: true },
        { title: 'Nueva Solicitud', href: '/request-management/new', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual'] },
    ]
  },
  { title: 'Mensajes', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'ambulance'], disabled: true },
  { 
    title: 'Admin', 
    href: '/admin', 
    icon: 'ShieldCheck', 
    roles: ['admin'],
    submenu: [
        { title: 'Panel Admin', href: '/admin', icon: 'ShieldCheck', roles: ['admin'], exactMatch: true },
        { title: 'Gestión Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin'], disabled: true },
        { 
          title: 'Gestión Ambulancias', 
          href: '/admin/ambulances', 
          icon: 'Ambulance', 
          roles: ['admin'],
          submenu: [ // Sub-submenu para ambulancias
            { title: 'Listar Ambulancias', href: '/admin/ambulances', icon: 'Ambulance', roles: ['admin'], exactMatch: true, disabled: true }, // Página de listado (futuro)
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
    const isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
    
    const hasSubmenu = item.submenu && item.submenu.length > 0 && item.submenu.some(sub => userHasRole(sub.roles));
    const isMenuOpen = openMenus[item.href] || false;
    
    const ButtonComponent = isSubmenuItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const buttonContent = (
        <>
            <Icon className={cn("h-5 w-5", isActive && !hasSubmenu ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")} />
            <span className={cn({"pl-1" : level > 0 && isSubmenuItem})}>{item.title}</span>
            {item.label && <span className="ml-auto text-xs">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4" /> : <Icons.ChevronRight className="ml-auto h-4 w-4" />
            )}
        </>
    );
    
    const effectiveIsActive = hasSubmenu && isMenuOpen ? item.submenu?.some(subItem => subItem.exactMatch ? pathname === subItem.href : pathname.startsWith(subItem.href)) || isActive : isActive;


    return (
      <SidebarMenuItem key={item.href} className={cn({"bg-sidebar-accent": effectiveIsActive && hasSubmenu && isMenuOpen })}>
        {hasSubmenu ? (
          <ButtonComponent
            onClick={() => toggleMenu(item.href)}
            isActive={effectiveIsActive}
            aria-expanded={isMenuOpen}
            className={cn(
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActive },
                {"hover:bg-sidebar-accent/80": effectiveIsActive}
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
                {"bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90": isActive && !hasSubmenu },
                {"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground": !isActive || hasSubmenu }
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
