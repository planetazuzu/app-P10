
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
import { navItems, type NavItemConfig } from '@/config/navigation'; // Importar desde el nuevo archivo


export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    const checkAndSetOpen = (items: NavItemConfig[], parentPath = '') => {
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

  const renderNavItem = (item: NavItemConfig, isSubmenuItem = false, level = 0): JSX.Element | null => {
    if (!userHasRole(item.roles)) return null;

    const Icon = Icons[item.icon];
    
    let isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
    
    if (item.submenu && item.submenu.length > 0 && !isActive) {
      const isChildActive = (childItems: NavItemConfig[]): boolean => {
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
            <Icon className={cn(
                "h-5 w-5",
                 isActive && !hasSubmenu && !isSubmenuItem && !item.disabled ? "text-sidebar-primary-foreground" : 
                 (isActive && (isSubmenuItem || (hasSubmenu && isMenuOpen)) && !item.disabled ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")
            )} />
            <span className={cn(
                "inline-block truncate", 
                {"pl-1" : level > 0 && isSubmenuItem},
                "group-data-[collapsible=icon]:hidden" 
            )}>{item.title}</span>
            {item.label && <span className="ml-auto text-xs group-data-[collapsible=icon]:hidden inline-block truncate">{item.label}</span>}
            {hasSubmenu && (
              isMenuOpen ? <Icons.ChevronDown className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" /> : <Icons.ChevronRight className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
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
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActiveForButton && isSubmenuItem && hasSubmenu && isMenuOpen}, 
                {"bg-sidebar-accent text-sidebar-accent-foreground": effectiveIsActiveForButton && isSubmenuItem && !hasSubmenu}, 
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
