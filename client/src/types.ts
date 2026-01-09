export type DeviceArea =
  | 'Network'
  | 'Security'
  | 'Comput'
  | 'Software'
  | 'Application'
  | 'ILL / MPLS Service'
  | 'DR';

export type SopStatus = 'Available' | 'Pending' | 'Update Required';

export type DocumentCategory = 'implementation' | 'tutorial' | 'troubleshooting' | 'maintenance';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  profile_photo?: string;
  last_login_at?: string;
  created_at: string;
}

export interface ManualContent {
  id: number;
  equipment_id: number;
  summary: string;
  monitoring: string[];
  maintenance: string[];
  troubleshooting: string[];
  links?: { title: string; uri: string }[];
  illustration_prompt?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  name: string;
  type: 'pdf' | 'docx' | 'video' | 'youtube' | 'web';
  url: string;
  thumbnail?: string;
  metadata?: {
    duration?: string;
    views?: string;
    postedAt?: string;
    author?: string;
  };
  upload_date: string;
  document_category: DocumentCategory;
  is_published: boolean;
}

export interface Equipment {
  id: number;
  name: string;
  area: DeviceArea;
  type: string;
  vendor: string;
  model: string;
  serial_number?: string;
  license_details?: string;
  quantity: string;
  sop_status: SopStatus;
  email?: string;
  phone?: string;
  license_applicable: string;
  account_type: string;
  security_level: string;
  web_support?: string;
  username?: string;
  credentials?: string;
  otp_required?: string;
  contact_person_otp?: string;
  validity?: string;
  contact_info?: string;
  contact_number?: string;
  created_at: string;
  updated_at: string;
  manual?: ManualContent;
  attachments: Attachment[];
}

export interface EquipmentListItem {
  id: number;
  name: string;
  area: DeviceArea;
  type: string;
  vendor: string;
  model: string;
  quantity: string;
  sop_status: SopStatus;
  email?: string;
  phone?: string;
  account_type: string;
  security_level: string;
  doc_count: number;
  video_count: number;
  last_updated: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
}

export enum NavigationTab {
  Dashboard = 'dashboard',
  Inventory = 'inventory',
  Library = 'library',
  Assistant = 'assistant',
  Admin = 'admin',
}
