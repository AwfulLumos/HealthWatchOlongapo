import { apiClient } from './api';
import type { AuditAction, AuditRecord, RbacPolicy, SecurityConfiguration, SecurityControl } from '../models/SysAdmin';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || fallback;
}

export const sysAdminService = {
  async getRbacPolicy(): Promise<RbacPolicy> {
    try {
      const response = await apiClient.get<ApiResponse<RbacPolicy>>('/api/v1/sysadmin/rbac');
      return response.data.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to fetch RBAC policy'));
    }
  },

  async updateRbacPolicy(policy: RbacPolicy): Promise<RbacPolicy> {
    try {
      const response = await apiClient.put<ApiResponse<RbacPolicy>>('/api/v1/sysadmin/rbac', policy);
      return response.data.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to update RBAC policy'));
    }
  },

  async getSecurityConfiguration(): Promise<SecurityConfiguration> {
    try {
      const response = await apiClient.get<ApiResponse<SecurityConfiguration>>('/api/v1/sysadmin/security');
      return response.data.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to fetch security configuration'));
    }
  },

  async updateSecurityControls(controls: SecurityControl[]): Promise<SecurityConfiguration> {
    try {
      const response = await apiClient.put<ApiResponse<SecurityConfiguration>>('/api/v1/sysadmin/security/controls', { controls });
      return response.data.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to update security controls'));
    }
  },

  async getAuditTrail(params?: { search?: string; action?: AuditAction | 'ALL' }): Promise<AuditRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<AuditRecord[]>>('/api/v1/sysadmin/audit-trail', { params });
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to fetch audit trail'));
    }
  },
};
