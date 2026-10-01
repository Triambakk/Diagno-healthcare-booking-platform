import { apiClient } from './client';
import { DiagnosticCenter } from '../types';

export interface CenterPayload {
  name: string;
  address: string;
  city: string;
  contact_number: string;
}

export const centersApi = {
  getAll: async (): Promise<DiagnosticCenter[]> => {
    const res = await apiClient.get('/centers/');
    return res.data;
  },

  getById: async (id: number): Promise<DiagnosticCenter> => {
    const res = await apiClient.get(`/centers/${id}/`);
    return res.data;
  },

  create: async (payload: CenterPayload): Promise<DiagnosticCenter> => {
    const res = await apiClient.post('/centers/', payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<CenterPayload>): Promise<DiagnosticCenter> => {
    const res = await apiClient.patch(`/centers/${id}/`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/centers/${id}/`);
  },
};
