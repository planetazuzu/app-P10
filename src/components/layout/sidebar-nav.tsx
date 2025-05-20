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
        { title: 'Nueva Solicitud', href: '/request-management/new', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual'] },
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'RequestManagement', roles: ['admin', 'hospital', 'individual', 'ambulance'] },
    ]
  },
  { title: 'Mensajes', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'ambulance'], disabled: true },
  { 
    title: 'Admin', 
    href: '/admin', 
    icon: 'ShieldCheck', 
    roles: ['admin'],
    submenu: [
        { title: 'Gestión Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin'], disabled: true },
        { title: 'Config. Sistema', href: '/admin/system-settings', icon: 'Settings', roles: ['admin'], disabled: true },
    ]
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const userHasRole = (roles: UserRole[]) => roles.includes(user.role);

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const renderNavItem = (item: NavItem, isSubmenuItem = false) => {
    if (!userHasRole(item.roles)) return null;

    const Icon = Icons[item.icon];
    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/');
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isMenuOpen = openMenus[item.href] || false;

    const ButtonComponent = isSubmenuItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const buttonContent = (
        <>
            <Icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")} />
            <span>{item.title}</span>
            {item.label && <span className="ml-auto text-xs">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4" /> : <Icons.ChevronRight className="ml-auto h-4 w-4" />
            )}
        </>
    );

    return (
      <SidebarMenuItem key={item.href}>
        {hasSubmenu ? (
          <ButtonComponent
            onClick={() => toggleMenu(item.href)}
            isActive={isActive || (isMenuOpen && item.submenu?.some(subItem => pathname.startsWith(subItem.href)))}
            aria-expanded={isMenuOpen}
            className={cn({"bg-sidebar-accent text-sidebar-accent-foreground": isActive || (isMenuOpen && item.submenu?.some(subItem => pathname.startsWith(subItem.href)))})}
          >
            {buttonContent}
          </ButtonComponent>
        ) : (
          <Link href={item.href} passHref legacyBehavior>
            <ButtonComponent
              asChild={!isSubmenuItem}
              // @ts-ignore // Property 'href' does not exist on type for asChild true
              href={isSubmenuItem ? item.href : undefined} 
              isActive={isActive}
              disabled={item.disabled}
              className={cn({"bg-sidebar-accent text-sidebar-accent-foreground": isActive})}
              tooltip={item.title}
            >
              {isSubmenuItem ? <>{buttonContent}</> : <a className="flex w-full items-center gap-2">{buttonContent}</a>}
            </ButtonComponent>
          </Link>
        )}
        {hasSubmenu && isMenuOpen && (
          <SidebarMenuSub>
            {item.submenu?.map(subItem => renderNavItem(subItem, true))}
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
