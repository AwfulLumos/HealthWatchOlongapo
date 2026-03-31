import type { DashboardData } from '../models';
import { patientService } from './patientService';
import { consultationService } from './consultationService';
import { appointmentService } from './appointmentService';
import { staffService } from './staffService';
import {
  statsCards,
  consultationsChartData,
  monthlyPatientData,
  diagnosisData,
  recentPatients,
  upcomingAppointments,
} from '../statics';

export const dashboardService = {
  getStats() {
    // Combine static data with live counts
    return statsCards.map(card => {
      switch (card.label) {
        case 'Total Patients':
          return { ...card, value: patientService.getCount().toLocaleString() };
        case 'Consultations Today':
          return { ...card, value: String(consultationService.getTodayCount()) };
        case 'Appointments Today':
          return { ...card, value: String(appointmentService.getTodayCount()) };
        case 'Active Staff':
          return { ...card, value: String(staffService.getActiveCount()) };
        default:
          return card;
      }
    });
  },

  getConsultationsChart() {
    return consultationsChartData;
  },

  getMonthlyPatients() {
    return monthlyPatientData;
  },

  getDiagnosisBreakdown() {
    return diagnosisData;
  },

  getRecentActivity() {
    return recentPatients;
  },

  getUpcomingAppointments() {
    return upcomingAppointments;
  },

  getDashboardData(): DashboardData {
    return {
      stats: this.getStats(),
      consultationChart: this.getConsultationsChart(),
      monthlyPatients: this.getMonthlyPatients(),
      diagnosisBreakdown: this.getDiagnosisBreakdown(),
      recentActivity: this.getRecentActivity(),
      upcomingAppointments: this.getUpcomingAppointments(),
    };
  },
};
