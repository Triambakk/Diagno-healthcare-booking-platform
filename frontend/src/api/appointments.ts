import { apiClient } from './client';
import { Appointment, AppointmentCreatePayload } from '../types';

export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const res = await apiClient.get('/appointments/');
    return res.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const res = await apiClient.get(`/appointments/${id}/`);
    return res.data;
  },

  create: async (payload: AppointmentCreatePayload): Promise<Appointment> => {
    const res = await apiClient.post('/appointments/', payload);
    return res.data;
  },

  cancel: async (id: number): Promise<Appointment> => {
    const res = await apiClient.patch(`/appointments/${id}/cancel/`);
    return res.data;
  },
};
