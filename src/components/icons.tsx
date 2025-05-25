
import { Globe, Ambulance, ShieldCheck, UserCircle, Hospital, Users, Settings, LayoutDashboard, Map, Zap, FileText, MessageSquare, LogOut, ChevronDown, ChevronRight, MapPin as MapPinIcon, UserX, Waypoints, ListChecks, Unlink, SendHorizonal, Hash, ClipboardList, ListFilter, Edit3, PlusCircle, RefreshCw, Loader2, Eye, AlertTriangle, Info, CalendarDays, ArrowLeft, ListPlus, Edit2 } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import Image from 'next/image';

export const Icons = {
  Logo: (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'> & { width?: number, height?: number }) => (
    <Image
      src="/images/logo.png" 
      alt="Gestión de Usuarios y Flota Logo"
      width={props.width || 28}
      height={props.height || 28}
      className={props.className}
      style={props.style}
      priority
      data-ai-hint="logo company"
    />
  ),
  Ambulance: (props: LucideProps) => <Ambulance {...props} />,
  ShieldCheck: (props: LucideProps) => <ShieldCheck {...props} />,
  UserCircle: (props: LucideProps) => <UserCircle {...props} />,
  Hospital: (props: LucideProps) => <Hospital {...props} />,
  Users: (props: LucideProps) => <Users {...props} />,
  Settings: (props: LucideProps) => <Settings {...props} />,
  LayoutDashboard: (props: LucideProps) => <LayoutDashboard {...props} />,
  Dashboard: (props: LucideProps) => <LayoutDashboard {...props} />,
  Map: (props: LucideProps) => <Map {...props} />,
  MapPin: (props: LucideProps) => <MapPinIcon {...props} />,
  MapIcon: (props: LucideProps) => <MapPinIcon {...props} />, 
  SmartDispatch: (props: LucideProps) => <Zap {...props} />,
  RequestManagement: (props: LucideProps) => <FileText {...props} />,
  Messages: (props: LucideProps) => <MessageSquare {...props} />,
  Logout: (props: LucideProps) => <LogOut {...props} />,
  ChevronDown: (props: LucideProps) => <ChevronDown {...props} />,
  ChevronRight: (props: LucideProps) => <ChevronRight {...props} />,
  UserX: (props: LucideProps) => <UserX {...props} />,
  Waypoints: (props: LucideProps) => <Waypoints {...props} />,
  ListChecks: (props: LucideProps) => <ListChecks {...props} />,
  Unlink: (props: LucideProps) => <Unlink {...props} />,
  SendHorizonal: (props: LucideProps) => <SendHorizonal {...props} />,
  Hash: (props: LucideProps) => <Hash {...props} />,
  ClipboardList: (props: LucideProps) => <ClipboardList {...props} />,
  ListFilter: (props: LucideProps) => <ListFilter {...props} />,
  Edit3: (props: LucideProps) => <Edit3 {...props} />,
  Edit: (props: LucideProps) => <Edit3 {...props} />, // Original alias
  Edit2: (props: LucideProps) => <Edit2 {...props} />, // Nuevo icono para diferenciar
  PlusCircle: (props: LucideProps) => <PlusCircle {...props} />,
  RefreshCw: (props: LucideProps) => <RefreshCw {...props} />,
  Loader2: (props: LucideProps) => <Loader2 {...props} />,
  Eye: (props: LucideProps) => <Eye {...props} />,
  AlertTriangle: (props: LucideProps) => <AlertTriangle {...props} />,
  Info: (props: LucideProps) => <Info {...props} />,
  CalendarDays: (props: LucideProps) => <CalendarDays {...props} />,
  ArrowLeft: (props: LucideProps) => <ArrowLeft {...props} />,
  ListPlus: (props: LucideProps) => <ListPlus {...props} />,
};

export type IconName = keyof typeof Icons;
