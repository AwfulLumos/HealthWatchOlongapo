import type { DashboardData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Build last N months in "YYYY-MM" format for the month selector
export function buildMonthOptions(count = 12): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ label, value });
  }
  return options;
}

export const dashboardService = {
  async getStats() {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/api/v1/dashboard/stats');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return [];
    }
  },

  /**
   * Fetch monthly stats scoped to a specific month (YYYY-MM).
   * Falls back to getStats() for current-period data when no month is given.
   */
  async getMonthlyStats(yearMonth?: string) {
    try {
      const params = yearMonth ? { yearMonth } : {};
      const response = await apiClient.get<ApiResponse<any>>('/api/v1/dashboard/stats', { params });
      return response.data.data || {};
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
      return {};
    }
  },

  async getConsultationsChart(yearMonth?: string) {
    try {
      const params = yearMonth ? { yearMonth } : {};
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/consultations-by-month', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch consultations chart:', error);
      return [];
    }
  },

  async getMonthlyPatients(yearMonth?: string) {
    try {
      const params = yearMonth ? { yearMonth } : {};
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/patients-by-month', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch monthly patient trend:', error);
      return [];
    }
  },

  async getDiagnosisBreakdown(yearMonth?: string) {
    try {
      const params = yearMonth ? { yearMonth } : {};
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/top-diagnoses', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch diagnosis breakdown:', error);
      return [];
    }
  },

  async getDiseaseTrendAnalysis(months = 6, topDiseases = 5, growthAlertThreshold = 0.3) {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/api/v1/dashboard/disease-trend-analysis', {
        params: { months, topDiseases, growthAlertThreshold },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch disease trend analysis:', error);
      return null;
    }
  },

  async getPatientDemographics() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/patient-demographics');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch patient demographics:', error);
      return [];
    }
  },

  async getRecentActivity() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/recent-patients');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  },

  async getUpcomingAppointments() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/upcoming-appointments');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch upcoming appointments:', error);
      return [];
    }
  },

  async getDashboardData(): Promise<DashboardData> {
    const [
      stats,
      consultationChart,
      monthlyPatients,
      diagnosisBreakdown,
      recentActivity,
      upcomingAppointments
    ] = await Promise.all([
      this.getStats(),
      this.getConsultationsChart(),
      this.getMonthlyPatients(),
      this.getDiagnosisBreakdown(),
      this.getRecentActivity(),
      this.getUpcomingAppointments(),
    ]);

    return {
      stats,
      consultationChart,
      monthlyPatients,
      diagnosisBreakdown,
      recentActivity,
      upcomingAppointments,
    };
  },
};
