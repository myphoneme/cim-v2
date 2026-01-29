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

// Device Categories for Infrastructure
export type DeviceCategory = 'Network' | 'Compute' | 'Storage' | 'Security' | 'Backup' | 'Virtual';

// Location types
export interface Location {
  id: number;
  name: string;
  code: string;
  type: 'DC' | 'BR' | 'DR';
  address?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Device Item (Asset Inventory)
export interface DeviceItem {
  id: number;
  device_name: string;
  hostname?: string;
  ip_address?: string;
  serial_number?: string;
  category: DeviceCategory;
  equipment_id?: number;
  model?: string;
  version?: string;
  location_id?: number;
  username?: string;
  password?: string;
  description?: string;
  rack_position?: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Decommissioned';
  created_at: string;
  updated_at: string;
  equipment?: {
    id: number;
    name: string;
    vendor: string;
    model: string;
  };
  location?: Location;
}

export interface DeviceItemListItem {
  id: number;
  device_name: string;
  hostname?: string;
  ip_address?: string;
  serial_number?: string;
  category: DeviceCategory;
  model?: string;
  version?: string;
  status: string;
  location_name?: string;
  equipment_name?: string;
}

export interface VirtualMachine {
  id: string | number;
  name: string;
  vendor: string;
  project: string;
  tier: string;
  ip_address: string;
  hostname: string;
  role: string;
  os: string;
  disk_primary: string;
  disk_secondary?: string;
  memory_gb: number | string;
  host_ip: string;
  vcpu: number | string;
  location?: string;
}
