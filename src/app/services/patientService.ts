import type { Patient, PatientFormData } from '../models';
import { apiClient } from './api';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const patientService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; status?: string; barangayId?: string }): Promise<Patient[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Patient>>('/api/v1/patients', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Patient | undefined> {
    try {
      const response = await apiClient.get<SingleResponse<Patient>>(`/api/v1/patients/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch patient ${id}:`, error);
      return undefined;
    }
  },

  async getByBarangay(barangayId: string): Promise<Patient[]> {
    return this.getAll({ barangayId });
  },

  async search(query: string): Promise<Patient[]> {
    return this.getAll({ search: query });
  },

  async create(data: PatientFormData): Promise<Patient> {
    try {
      const response = await apiClient.post<SingleResponse<Patient>>('/api/v1/patients', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    try {
      const response = await apiClient.patch<SingleResponse<Patient>>(`/api/v1/patients/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update patient ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/patients/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete patient ${id}:`, error);
      return false;
    }
  },

  async getCount(): Promise<number> {
    const patients = await this.getAll();
    return patients.length;
  },

  async getActiveCount(): Promise<number> {
    const patients = await this.getAll({ status: 'Active' });
    return patients.length;
  },
};
