import type { VitalSigns, VitalSignsFormData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface VitalSignsRecordCreateInput {
  patientId: string;
  consultId?: string;
  date?: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  respRate: number;
  temperature: number;
  bloodSugar?: number;
  weight: number;
  height: number;
}

export interface VitalSignsRecordUpdateInput {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  respRate?: number;
  temperature?: number;
  bloodSugar?: number;
  weight?: number;
  height?: number;
}

export const vitalSignsService = {
  async getAll(params?: { patientId?: string; consultId?: string }): Promise<VitalSigns[]> {
    try {
      const response = await apiClient.get<ApiResponse<VitalSigns[]>>('/api/v1/vital-signs', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch vital signs:', error);
      return [];
    }
  },

  async getById(id: string): Promise<VitalSigns | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<VitalSigns>>(`/api/v1/vital-signs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch vital signs ${id}:`, error);
      return undefined;
    }
  },

  async getByConsultationId(consultId: string): Promise<VitalSigns | undefined> {
    const vitals = await this.getAll({ consultId });
    return vitals[0];
  },

  async getByPatient(patientId: string): Promise<VitalSigns[]> {
    return this.getAll({ patientId });
  },

  async getLatestByPatient(patientId: string): Promise<VitalSigns | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<VitalSigns>>(`/api/v1/vital-signs/patient/${patientId}/latest`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch latest vital signs for patient ${patientId}:`, error);
      return undefined;
    }
  },

  async create(data: VitalSignsFormData): Promise<VitalSigns | null> {
    try {
      const response = await apiClient.post<ApiResponse<VitalSigns>>('/api/v1/vital-signs', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create vital signs:', error);
      return null;
    }
  },

  async createRecord(data: VitalSignsRecordCreateInput): Promise<VitalSigns> {
    const response = await apiClient.post<ApiResponse<VitalSigns>>('/api/v1/vital-signs', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<VitalSignsFormData>): Promise<VitalSigns | undefined> {
    try {
      const response = await apiClient.patch<ApiResponse<VitalSigns>>(`/api/v1/vital-signs/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update vital signs ${id}:`, error);
      return undefined;
    }
  },

  async updateRecord(id: string, data: VitalSignsRecordUpdateInput): Promise<VitalSigns> {
    const response = await apiClient.patch<ApiResponse<VitalSigns>>(`/api/v1/vital-signs/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/vital-signs/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete vital signs ${id}:`, error);
      return false;
    }
  },

  async getBPTrend(patientId: string): Promise<{ date: string; systolic: number; diastolic: number }[]> {
    const vitals = await this.getByPatient(patientId);
    return vitals
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(v => ({
        date: new Date(v.date).toISOString().split('T')[0],
        systolic: v.bpSystolic,
        diastolic: v.bpDiastolic,
      }));
  },
};
