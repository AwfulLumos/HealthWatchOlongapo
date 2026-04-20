import type { Staff, StaffFormData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const staffService = {
  async getAll(params?: { role?: string; stationId?: string; status?: string }): Promise<Staff[]> {
    try {
      const response = await apiClient.get<ApiResponse<Staff[]>>('/api/v1/staff', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Staff | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<Staff>>(`/api/v1/staff/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch staff ${id}:`, error);
      return undefined;
    }
  },

  async getByRole(role: Staff['role']): Promise<Staff[]> {
    return this.getAll({ role });
  },

  async getByStation(stationId: string): Promise<Staff[]> {
    return this.getAll({ stationId });
  },

  async getActive(): Promise<Staff[]> {
    return this.getAll({ status: 'Active' });
  },

  async getActiveCount(): Promise<number> {
    const activeStaff = await this.getActive();
    return activeStaff.length;
  },

  async search(query: string): Promise<Staff[]> {
    const allStaff = await this.getAll();
    const q = query.toLowerCase();
    return allStaff.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  },

  async create(data: StaffFormData): Promise<Staff | null> {
    try {
      const response = await apiClient.post<ApiResponse<Staff>>('/api/v1/staff', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create staff:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<StaffFormData>): Promise<Staff | undefined> {
    try {
      const response = await apiClient.patch<ApiResponse<Staff>>(`/api/v1/staff/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update staff ${id}:`, error);
      return undefined;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/staff/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete staff ${id}:`, error);
      return false;
    }
  },

  async deactivate(id: string): Promise<Staff | undefined> {
    return this.update(id, { accountStatus: 'Inactive' });
  },

  async activate(id: string): Promise<Staff | undefined> {
    return this.update(id, { accountStatus: 'Active' });
  },
};
