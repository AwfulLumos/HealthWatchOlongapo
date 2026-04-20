import type { Prescription, PrescriptionFormData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PrescriptionRecordCreateInput {
  consultId: string;
  patientId: string;
  doctorId: string;
  date?: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionRecordUpdateInput {
  medicine?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export const prescriptionService = {
  async getAll(params?: { patientId?: string; consultId?: string }): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<ApiResponse<Prescription[]>>('/api/v1/prescriptions', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Prescription | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<Prescription>>(`/api/v1/prescriptions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch prescription ${id}:`, error);
      return undefined;
    }
  },

  async getByConsultationId(consultId: string): Promise<Prescription[]> {
    return this.getAll({ consultId });
  },

  async getByPatient(patientId: string): Promise<Prescription[]> {
    return this.getAll({ patientId });
  },

  async create(data: PrescriptionFormData): Promise<Prescription | null> {
    try {
      const response = await apiClient.post<ApiResponse<Prescription>>('/api/v1/prescriptions', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create prescription:', error);
      return null;
    }
  },

  async createRecord(data: PrescriptionRecordCreateInput): Promise<Prescription> {
    const response = await apiClient.post<ApiResponse<Prescription>>('/api/v1/prescriptions', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<PrescriptionFormData>): Promise<Prescription | undefined> {
    try {
      const response = await apiClient.patch<ApiResponse<Prescription>>(`/api/v1/prescriptions/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update prescription ${id}:`, error);
      return undefined;
    }
  },

  async updateRecord(id: string, data: PrescriptionRecordUpdateInput): Promise<Prescription> {
    const response = await apiClient.patch<ApiResponse<Prescription>>(`/api/v1/prescriptions/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/prescriptions/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete prescription ${id}:`, error);
      return false;
    }
  },

  async getMedicineStats(): Promise<{ medicine: string; count: number }[]> {
    const prescriptions = await this.getAll();
    const medicineCounts = prescriptions.reduce((acc, p) => {
      acc[p.medicine] = (acc[p.medicine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(medicineCounts)
      .map(([medicine, count]) => ({ medicine, count }))
      .sort((a, b) => b.count - a.count);
  },
};
