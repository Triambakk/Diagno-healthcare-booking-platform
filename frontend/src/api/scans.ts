import { apiClient } from './client';
import { ScanType } from '../types';

export interface ScanPayload {
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
}

export const scansApi = {
  getAll: async (): Promise<ScanType[]> => {
    const res = await apiClient.get('/scans/');
    return res.data;
  },

  getById: async (id: number): Promise<ScanType> => {
    const res = await apiClient.get(`/scans/${id}/`);
    return res.data;
  },

  create: async (payload: ScanPayload): Promise<ScanType> => {
    const res = await apiClient.post('/scans/', payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<ScanPayload>): Promise<ScanType> => {
    const res = await apiClient.patch(`/scans/${id}/`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/scans/${id}/`);
  },
};
