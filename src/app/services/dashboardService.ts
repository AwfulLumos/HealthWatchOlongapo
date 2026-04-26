import type { DashboardData } from '../models';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
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

  async getConsultationsChart() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/consultations-by-month');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch consultations chart:', error);
      return [];
    }
  },

  async getMonthlyPatients() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/patients-by-month');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch monthly patient trend:', error);
      return [];
    }
  },

  async getDiagnosisBreakdown() {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/dashboard/top-diagnoses');
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
