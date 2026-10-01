export interface User {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface DiagnosticCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  contact_number: string;
  created_at: string;
}

export interface ScanType {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
  created_at: string;
}

export type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patient_username: string;
  diagnostic_center: DiagnosticCenter;
  scan_type: ScanType;
  appointment_date: string;
  start_time: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreatePayload {
  diagnostic_center: number;
  scan_type: number;
  appointment_date: string;
  start_time: string;
}
