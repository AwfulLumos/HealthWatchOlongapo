import { FileText, Users, Stethoscope, TrendingUp, BarChart3, type LucideIcon } from "lucide-react";

export const monthlyConsultations = [
  { month: "Oct", regular: 89, followUp: 34, emergency: 5 },
  { month: "Nov", regular: 102, followUp: 41, emergency: 7 },
  { month: "Dec", regular: 78, followUp: 29, emergency: 4 },
  { month: "Jan", regular: 115, followUp: 48, emergency: 9 },
  { month: "Feb", regular: 108, followUp: 44, emergency: 6 },
  { month: "Mar", regular: 127, followUp: 52, emergency: 11 },
];

export const diagnosisBreakdown = [
  { name: "Hypertension", value: 28, color: "#3B82F6" },
  { name: "Type 2 Diabetes", value: 22, color: "#14B8A6" },
  { name: "URTI", value: 18, color: "#8B5CF6" },
  { name: "Fever/Flu", value: 15, color: "#F97316" },
  { name: "Wound Care", value: 9, color: "#EF4444" },
  { name: "Others", value: 8, color: "#6B7280" },
];

export const stationPerformanceData = [
  { station: "Sta. Rita", patients: 312, consultations: 145 },
  { station: "Gordon Heights", patients: 248, consultations: 112 },
  { station: "New Ilalim", patients: 187, consultations: 89 },
  { station: "Kalaklan", patients: 156, consultations: 74 },
  { station: "E. Tapinac", patients: 134, consultations: 61 },
  { station: "Banicain", patients: 247, consultations: 107 },
];

export const genderDistribution = [
  { name: "Female", value: 62, color: "#EC4899" },
  { name: "Male", value: 38, color: "#3B82F6" },
];

export interface ReportCard {
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

export const reportCards: ReportCard[] = [
  { title: "Monthly Summary Report", desc: "All consultations and patient data for the selected month", icon: FileText, color: "bg-blue-50 text-blue-600" },
  { title: "Patient Registration Report", desc: "New patients registered within the date range", icon: Users, color: "bg-teal-50 text-teal-600" },
  { title: "Consultation Statistics", desc: "Breakdown of consultations by type and diagnosis", icon: Stethoscope, color: "bg-violet-50 text-violet-600" },
  { title: "Vital Signs Summary", desc: "Aggregated vital signs data across all patients", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
  { title: "Station Performance", desc: "Comparison of consultations and patients per station", icon: BarChart3, color: "bg-red-50 text-red-600" },
  { title: "Prescription Report", desc: "Most commonly prescribed medications and frequency", icon: FileText, color: "bg-green-50 text-green-600" },
];
