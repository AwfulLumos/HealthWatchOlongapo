import type { Consultation, ConsultationFormData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ConsultationCreateInput {
  patientId: string;
  staffId?: string;
  date?: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  icdCode?: string;
  type?: 'Regular' | 'FollowUp' | 'Emergency';
  status?: 'InProgress' | 'Completed' | 'Referred';
  notes?: string;
}

export interface ConsultationUpdateInput {
  chiefComplaint?: string;
  symptoms?: string;
  diagnosis?: string;
  icdCode?: string;
  type?: 'Regular' | 'FollowUp' | 'Emergency';
  status?: 'InProgress' | 'Completed' | 'Referred';
  notes?: string;
}

export interface ConsultationCreationOptions {
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    status: string;
  }>;
  staff: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    accountStatus: string;
  }>;
  defaultStaffId?: string;
}

export const consultationService = {
  async getAll(params?: { page?: number; limit?: number; patientId?: string; staffId?: string; status?: string; type?: string; startDate?: string; endDate?: string }): Promise<Consultation[]> {
    try {
      const response = await apiClient.get<ApiResponse<Consultation[]>>('/api/v1/consultations', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Consultation | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<Consultation>>(`/api/v1/consultations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch consultation ${id}:`, error);
      return undefined;
    }
  },

  async getByPatientId(patientId: string): Promise<Consultation[]> {
    return this.getAll({ patientId });
  },

  async getByDate(date: string): Promise<Consultation[]> {
    return this.getAll({ startDate: date, endDate: date });
  },

  async getTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const consultations = await this.getByDate(today);
    return consultations.length;
  },

  async getByType(type: Consultation['type']): Promise<Consultation[]> {
    return this.getAll({ type });
  },

  async create(data: ConsultationFormData): Promise<Consultation | null> {
    try {
      const response = await apiClient.post<ApiResponse<Consultation>>('/api/v1/consultations', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create consultation:', error);
      return null;
    }
  },

  async createRecord(data: ConsultationCreateInput): Promise<Consultation> {
    const response = await apiClient.post<ApiResponse<Consultation>>('/api/v1/consultations', data);
    return response.data.data;
  },

  async getCreationOptions(): Promise<ConsultationCreationOptions> {
    try {
      const response = await apiClient.get<ApiResponse<ConsultationCreationOptions>>('/api/v1/consultations/creation-options');
      return response.data.data || { patients: [], staff: [] };
    } catch (error) {
      console.error('Failed to fetch consultation creation options:', error);
      return { patients: [], staff: [] };
    }
  },

  async update(id: string, data: Partial<ConsultationFormData>): Promise<Consultation | undefined> {
    try {
      const response = await apiClient.patch<ApiResponse<Consultation>>(`/api/v1/consultations/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update consultation ${id}:`, error);
      return undefined;
    }
  },

  async updateRecord(id: string, data: ConsultationUpdateInput): Promise<Consultation> {
    const response = await apiClient.patch<ApiResponse<Consultation>>(`/api/v1/consultations/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/consultations/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete consultation ${id}:`, error);
      return false;
    }
  },

  async complete(id: string): Promise<Consultation | undefined> {
    return this.update(id, { status: 'Completed' });
  },

  async getDiagnosisStats(): Promise<{ name: string; count: number }[]> {
    const consultations = await this.getAll();
    const diagnosisCounts = consultations.reduce((acc, c) => {
      acc[c.diagnosis] = (acc[c.diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
};
