import { api } from './client';
import type { Equipment, EquipmentListItem, ManualContent, Attachment, DocumentCategory } from '../types';

export interface EquipmentCreateInput {
  name: string;
  area: string;
  type: string;
  vendor: string;
  model: string;
  serial_number?: string;
  license_details?: string;
  quantity?: string;
  sop_status?: string;
  email?: string;
  phone?: string;
  license_applicable?: string;
  web_support?: string;
  username?: string;
  credentials?: string;
  otp_required?: string;
  contact_person_otp?: string;
  validity?: string;
  contact_info?: string;
  contact_number?: string;
}

export interface ManualContentInput {
  summary: string;
  monitoring: string[];
  maintenance: string[];
  troubleshooting: string[];
  links?: { title: string; uri: string }[];
  illustration_prompt?: string;
  image_url?: string;
}

export const equipmentApi = {
  getAll: () => api.get<EquipmentListItem[]>('/equipment/'),

  getById: (id: number) => api.get<Equipment>(`/equipment/${id}`),

  create: (data: EquipmentCreateInput) =>
    api.post<Equipment>('/equipment', data),

  update: (id: number, data: Partial<EquipmentCreateInput>) =>
    api.put<Equipment>(`/equipment/${id}`, data),

  delete: (id: number) => api.delete(`/equipment/${id}`),

  saveManual: (equipmentId: number, manual: ManualContentInput) =>
    api.put<Equipment>(`/equipment/${equipmentId}/manual`, manual),

  generateManual: (equipmentId: number) =>
    api.post<ManualContent>(`/manuals/generate/${equipmentId}`),
};

export interface UploadAttachmentInput {
  equipmentId: number;
  file: File;
  fileType: string;
  documentCategory: DocumentCategory;
}

export interface AddUrlAttachmentInput {
  equipmentId: number;
  name: string;
  url: string;
  fileType: 'youtube' | 'web';
  documentCategory: DocumentCategory;
  metadata?: Record<string, string>;
}

export const attachmentsApi = {
  upload: async (input: UploadAttachmentInput): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('file_type', input.fileType);
    formData.append('document_category', input.documentCategory);

    const response = await fetch(`/api/attachments/${input.equipmentId}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  addUrl: async (input: AddUrlAttachmentInput): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('name', input.name);
    formData.append('url', input.url);
    formData.append('file_type', input.fileType);
    formData.append('document_category', input.documentCategory);
    if (input.metadata) {
      formData.append('metadata', JSON.stringify(input.metadata));
    }

    const response = await fetch(`/api/attachments/${input.equipmentId}/url`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Add URL failed');
    }

    return response.json();
  },

  togglePublish: (attachmentId: number) =>
    api.patch<{ id: number; is_published: boolean }>(`/attachments/${attachmentId}/publish`),

  delete: (attachmentId: number) =>
    api.delete(`/attachments/${attachmentId}`),
};
