
import { Globe, Ambulance, ShieldCheck, UserCircle, Hospital, Users, Settings, LayoutDashboard, Map, Zap, FileText, MessageSquare, LogOut, ChevronDown, ChevronRight, MapIcon, UserX, Waypoints, ListChecks, Unlink, SendHorizonal, Hash, ClipboardList, ListFilter } from 'lucide-react';
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
  MapIcon: (props: LucideProps) => <MapIcon {...props} />, 
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
};

export type IconName = keyof typeof Icons;

    
