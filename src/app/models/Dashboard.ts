import type { LucideIcon } from 'lucide-react';

export interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  light: string;
  text: string;
}

export interface ConsultationChartData {
  day: string;
  consultations: number;
}

export interface MonthlyPatientData {
  month: string;
  patients: number;
}

export interface DiagnosisData {
  name: string;
  value: number;
  color: string;
}

export interface RecentPatientActivity {
  id: string;
  name: string;
  barangay: string;
  date: string;
  status: string;
}

export interface UpcomingAppointment {
  time: string;
  patient: string;
  purpose: string;
  staff: string;
}

export interface DashboardData {
  stats: StatCard[];
  consultationChart: ConsultationChartData[];
  monthlyPatients: MonthlyPatientData[];
  diagnosisBreakdown: DiagnosisData[];
  recentActivity: RecentPatientActivity[];
  upcomingAppointments: UpcomingAppointment[];
}
