import { Users, Stethoscope, Calendar, Activity, type LucideIcon } from "lucide-react";

export interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  light: string;
  text: string;
}

export const statsCards: StatCard[] = [
  { label: "Total Patients", value: "1,284", change: "+12 this week", icon: Users, color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
  { label: "Consultations Today", value: "47", change: "+5 from yesterday", icon: Stethoscope, color: "bg-teal-500", light: "bg-teal-50", text: "text-teal-600" },
  { label: "Appointments Today", value: "23", change: "8 pending", icon: Calendar, color: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600" },
  { label: "Active Staff", value: "18", change: "Across 6 stations", icon: Activity, color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" },
];

export const consultationsChartData = [
  { day: "Mon", consultations: 32 },
  { day: "Tue", consultations: 45 },
  { day: "Wed", consultations: 38 },
  { day: "Thu", consultations: 52 },
  { day: "Fri", consultations: 47 },
  { day: "Sat", consultations: 28 },
  { day: "Sun", consultations: 15 },
];

export const monthlyPatientData = [
  { month: "Oct", patients: 210 },
  { month: "Nov", patients: 245 },
  { month: "Dec", patients: 198 },
  { month: "Jan", patients: 280 },
  { month: "Feb", patients: 265 },
  { month: "Mar", patients: 312 },
];

export const diagnosisData = [
  { name: "Hypertension", value: 28, color: "#3B82F6" },
  { name: "Diabetes", value: 22, color: "#14B8A6" },
  { name: "URTI", value: 18, color: "#8B5CF6" },
  { name: "Fever", value: 15, color: "#F97316" },
  { name: "Others", value: 17, color: "#6B7280" },
];

export const recentPatients = [
  { id: "P-001", name: "Maria Santos", barangay: "Sta. Rita", date: "Mar 28, 2026", status: "Consulted" },
  { id: "P-002", name: "Juan Dela Cruz", barangay: "Gordon Heights", date: "Mar 28, 2026", status: "Scheduled" },
  { id: "P-003", name: "Ana Reyes", barangay: "New Ilalim", date: "Mar 28, 2026", status: "Pending" },
  { id: "P-004", name: "Pedro Lim", barangay: "Kalaklan", date: "Mar 27, 2026", status: "Consulted" },
  { id: "P-005", name: "Rosa Garcia", barangay: "East Tapinac", date: "Mar 27, 2026", status: "Consulted" },
];

export const upcomingAppointments = [
  { time: "09:00 AM", patient: "Carmen Villanueva", purpose: "Follow-up Check", staff: "Dr. Flores" },
  { time: "10:30 AM", patient: "Roberto Tan", purpose: "Blood Pressure Monitoring", staff: "Nurse Gomez" },
  { time: "01:00 PM", patient: "Elena Pascual", purpose: "Prenatal Check", staff: "Dr. Flores" },
  { time: "02:30 PM", patient: "Marco Ramos", purpose: "Wound Dressing", staff: "Nurse Bautista" },
];

export const patientStatusColors: Record<string, string> = {
  Consulted: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
};
