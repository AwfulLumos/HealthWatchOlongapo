import type { Appointment, AppointmentFormData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const appointmentService = {
  async getAll(params?: { patientId?: string; staffId?: string; status?: string; startDate?: string; endDate?: string }): Promise<Appointment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Appointment[]>>('/api/v1/appointments', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Appointment | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<Appointment>>(`/api/v1/appointments/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch appointment ${id}:`, error);
      return undefined;
    }
  },

  async getByPatientId(patientId: string): Promise<Appointment[]> {
    return this.getAll({ patientId });
  },

  async getByDate(date: string): Promise<Appointment[]> {
    return this.getAll({ startDate: date, endDate: date });
  },

  async getUpcoming(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await this.getAll({ startDate: today, status: 'Pending,Confirmed' });
    return appointments.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  async getTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await this.getByDate(today);
    return appointments.filter(a => a.status !== 'Cancelled').length;
  },

  async create(data: AppointmentFormData): Promise<Appointment | null> {
    try {
      const response = await apiClient.post<ApiResponse<Appointment>>('/api/v1/appointments', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment | undefined> {
    try {
      const response = await apiClient.patch<ApiResponse<Appointment>>(`/api/v1/appointments/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update appointment ${id}:`, error);
      return undefined;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/appointments/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete appointment ${id}:`, error);
      return false;
    }
  },

  async cancel(id: string): Promise<Appointment | undefined> {
    return this.update(id, { status: 'Cancelled' });
  },

  async complete(id: string): Promise<Appointment | undefined> {
    return this.update(id, { status: 'Completed' });
  },
};
