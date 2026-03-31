// Patient
export type { Patient, MedicalCondition, PatientFormData } from './Patient';

// Appointment
export type { Appointment, AppointmentStatus, AppointmentFormData } from './Appointment';

// Consultation
export type { Consultation, ConsultationType, ConsultationStatus, ConsultationFormData } from './Consultation';

// Prescription
export type { Prescription, PrescriptionFormData } from './Prescription';

// Vital Signs
export type { VitalSigns, VitalSignsFormData } from './VitalSigns';
export { calculateBMI } from './VitalSigns';

// Staff
export type { Staff, StaffRole, AccountStatus, StaffFormData } from './Staff';
export { getStaffFullName } from './Staff';

// Barangay Station
export type { BarangayStation, BarangayStationFormData } from './BarangayStation';

// User & Auth
export type { User, UserRole, LoginCredentials, AuthState } from './User';

// Dashboard
export type {
  StatCard,
  ConsultationChartData,
  MonthlyPatientData,
  DiagnosisData,
  RecentPatientActivity,
  UpcomingAppointment,
  DashboardData,
} from './Dashboard';
