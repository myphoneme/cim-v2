
export type DeviceArea = 'Network' | 'Security' | 'Comput' | 'Software' | 'Application' | 'ILL / MPLS Service' | 'DR';

export interface Attachment {
  name: string;
  type: 'pdf' | 'video' | 'youtube';
  url: string;
  thumbnail?: string;
  metadata?: {
    duration?: string;
    views?: string;
    postedAt?: string;
    author?: string;
  };
  uploadDate: Date;
}

export interface Equipment {
  id: string;
  name: string;
  area: DeviceArea;
  type: string;
  vendor: string;
  model: string;
  serialNumber?: string;
  licenseDetails?: string;
  qty: number | string;
  sopStatus: 'Available' | 'Pending' | 'Update Required';
  email?: string;
  phone?: string;
  licenseApplicable?: 'Yes' | 'No';
  webSupport?: string;
  userName?: string;
  credentials?: string;
  otpRequired?: string;
  contactPersonOTP?: string;
  validity?: string;
  contactInfo?: string;
  contactNumber?: string;
  generatedManual?: ManualContent;
  attachments: Attachment[];
}

export type InfrastructureCategory = 'Router' | 'Firewall' | 'Switch' | 'PoE Switch';

export interface InfrastructureItem {
  id: string;
  location: string;
  category: InfrastructureCategory;
  hostname: string;
  ipAddress: string;
  description: string;
}

export interface ManualContent {
  summary: string;
  monitoring: string[];
  maintenance: string[];
  troubleshooting: string[];
  links: { title: string; uri: string }[];
  illustrationPrompt: string;
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum NavigationTab {
  Dashboard = 'dashboard',
  Inventory = 'inventory',
  Library = 'library',
  Assistant = 'assistant',
  Admin = 'admin'
}
