import { api } from './client';
import type { Location, DeviceItem, DeviceItemListItem, DeviceCategory } from '../types';

// Location API
export const locationsApi = {
  list: async (): Promise<Location[]> => {
    return api.get('/locations');
  },

  get: async (id: number): Promise<Location> => {
    return api.get(`/locations/${id}`);
  },

  create: async (data: Partial<Location>): Promise<Location> => {
    return api.post('/locations', data);
  },

  update: async (id: number, data: Partial<Location>): Promise<Location> => {
    return api.put(`/locations/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete(`/locations/${id}`);
  },
};

// Device Items API
export const deviceItemsApi = {
  list: async (params?: {
    category?: DeviceCategory;
    location_id?: number;
    status?: string;
  }): Promise<DeviceItemListItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location_id) searchParams.append('location_id', params.location_id.toString());
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    return api.get(`/device-items${queryString ? `?${queryString}` : ''}`);
  },

  get: async (id: number): Promise<DeviceItem> => {
    return api.get(`/device-items/${id}`);
  },

  getCategories: async (): Promise<{ category: string; count: number }[]> => {
    return api.get('/device-items/categories');
  },

  create: async (data: Partial<DeviceItem>): Promise<DeviceItem> => {
    return api.post('/device-items', data);
  },

  createBulk: async (items: Partial<DeviceItem>[]): Promise<DeviceItem[]> => {
    return api.post('/device-items/bulk', items);
  },

  update: async (id: number, data: Partial<DeviceItem>): Promise<DeviceItem> => {
    return api.put(`/device-items/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete(`/device-items/${id}`);
  },
};
