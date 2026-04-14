import { apiClient } from './api';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

export type BarangayDto = {
  id: string;
  name: string;
  zipCode?: string | null;
};

export const barangayService = {
  async getAll(): Promise<BarangayDto[]> {
    const response = await apiClient.get<ApiListResponse<BarangayDto>>('/api/v1/barangays');
    return response.data.data || [];
  },
};
