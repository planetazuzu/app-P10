
import type { UserRole } from '@/types';
import type { IconName } from '@/components/icons';

export interface NavItemConfig {
  title: string;
  href: string;
  icon: IconName;
  roles: UserRole[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
  submenu?: NavItemConfig[];
  exactMatch?: boolean;
}

export const navItems: NavItemConfig[] = [
  { title: 'Panel Principal', href: '/dashboard', icon: 'Dashboard', roles: ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'] },
  { 
    title: 'Seguimiento Flota', 
    href: '/ambulance-tracking', 
    icon: 'Map', 
    roles: ['admin', 'centroCoordinador'] 
  },
  { 
    title: 'Despacho IA', 
    href: '/smart-dispatch', 
    icon: 'SmartDispatch', 
    roles: ['admin', 'centroCoordinador'] 
  },
  {
    title: 'Solicitudes',
    href: '/request-management',
    icon: 'ListChecks',
    roles: ['admin', 'hospital', 'individual', 'centroCoordinador'],
    exactMatch: true, 
    submenu: [
        { title: 'Ver Solicitudes', href: '/request-management', icon: 'ListChecks', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'], exactMatch: true },
        { title: 'Nueva Urgente', href: '/request-management/new', icon: 'AlertTriangle', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Programada', href: '/request-management/new-programmed', icon: 'CalendarDays', roles: ['admin', 'hospital', 'individual', 'centroCoordinador'] },
        { title: 'Nueva Avanzada', href: '/request-management/new-advanced', icon: 'Settings', roles: ['admin', 'hospital', 'centroCoordinador'] },
    ]
  },
  { title: 'Mensajería', href: '/messages', icon: 'Messages', roles: ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'] },
  {
    title: 'Mi Ruta Asignada',
    href: '/driver/batch-view/lote-demo-123', 
    icon: 'Waypoints',
    roles: ['equipoMovil'],
  },
  {
    title: 'Revisión Vehículo',
    href: '/driver/vehicle-check',
    icon: 'Wrench',
    roles: ['equipoMovil'],
  },
  {
    title: 'Administración',
    href: '/admin',
    icon: 'ShieldCheck',
    roles: ['admin', 'centroCoordinador'],
    exactMatch: true, 
    submenu: [
        { title: 'Panel Admin', href: '/admin', icon: 'ShieldCheck', roles: ['admin', 'centroCoordinador'], exactMatch: true },
        {
          title: 'Usuarios',
          href: '/admin/user-management',
          icon: 'Users',
          roles: ['admin', 'centroCoordinador'],
          exactMatch: true,
          submenu: [
            { title: 'Ver Usuarios', href: '/admin/user-management', icon: 'Users', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Añadir Usuario', href: '/admin/user-management/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        {
          title: 'Ambulancias',
          href: '/admin/ambulances',
          icon: 'Ambulance',
          roles: ['admin', 'centroCoordinador'],
          exactMatch: true,
          submenu: [
            { title: 'Ver Ambulancias', href: '/admin/ambulances', icon: 'Ambulance', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Añadir Ambulancia', href: '/admin/ambulances/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        {
          title: 'Lotes y Rutas',
          href: '/admin/lotes',
          icon: 'Waypoints',
          roles: ['admin', 'centroCoordinador'],
          exactMatch: true,
          submenu: [
            { title: 'Ver Lotes', href: '/admin/lotes', icon: 'Waypoints', roles: ['admin', 'centroCoordinador'], exactMatch: true },
            { title: 'Crear Lote', href: '/admin/lotes/new', icon: 'PlusCircle', roles: ['admin', 'centroCoordinador'] },
            { title: 'Planificar Servicios Prog.', href: '/admin/services-planning', icon: 'CalendarDays', roles: ['admin', 'centroCoordinador'] },
          ]
        },
        { title: 'Configuración', href: '/admin/system-settings', icon: 'Settings', roles: ['admin', 'centroCoordinador'] },
    ]
  },
];
