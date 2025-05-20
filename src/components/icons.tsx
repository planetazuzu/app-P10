import { Globe, Ambulance, ShieldCheck, UserCircle, Hospital, Users, Settings, LayoutDashboard, Map, Zap, FileText, MessageSquare, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => <Globe {...props} />,
  Ambulance: (props: LucideProps) => <Ambulance {...props} />,
  ShieldCheck: (props: LucideProps) => <ShieldCheck {...props} />,
  UserCircle: (props: LucideProps) => <UserCircle {...props} />,
  Hospital: (props: LucideProps) => <Hospital {...props} />,
  Users: (props: LucideProps) => <Users {...props} />,
  Settings: (props: LucideProps) => <Settings {...props} />,
  Dashboard: (props: LucideProps) => <LayoutDashboard {...props} />,
  Map: (props: LucideProps) => <Map {...props} />,
  SmartDispatch: (props: LucideProps) => <Zap {...props} />, // Zap or Brain for Smart Dispatch
  RequestManagement: (props: LucideProps) => <FileText {...props} />,
  Messages: (props: LucideProps) => <MessageSquare {...props} />,
  Logout: (props: LucideProps) => <LogOut {...props} />,
  ChevronDown: (props: LucideProps) => <ChevronDown {...props} />,
  ChevronRight: (props: LucideProps) => <ChevronRight {...props} />,
};

export type IconName = keyof typeof Icons;
