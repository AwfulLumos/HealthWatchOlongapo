export const mockAppointments = [
  { id: "A-0001", patient: "Carmen Villanueva", patientId: "P-0010", staff: "Dr. Ana Flores", scheduledDate: "2026-03-28 09:00", purpose: "Follow-up Check", status: "Confirmed", notes: "Monitor BP levels" },
  { id: "A-0002", patient: "Roberto Tan", patientId: "P-0011", staff: "Nurse Carmen Gomez", scheduledDate: "2026-03-28 10:30", purpose: "Blood Pressure Monitoring", status: "Confirmed", notes: "" },
  { id: "A-0003", patient: "Elena Pascual", patientId: "P-0007", staff: "Dr. Ana Flores", scheduledDate: "2026-03-28 13:00", purpose: "Prenatal Check", status: "Pending", notes: "Bring previous records" },
  { id: "A-0004", patient: "Marco Ramos", patientId: "P-0008", staff: "Nurse Bautista", scheduledDate: "2026-03-28 14:30", purpose: "Wound Dressing", status: "Confirmed", notes: "" },
  { id: "A-0005", patient: "Maria Santos", patientId: "P-0001", staff: "Dr. Rico Santos", scheduledDate: "2026-03-30 09:00", purpose: "Diabetes Management", status: "Pending", notes: "Bring blood sugar log" },
  { id: "A-0006", patient: "Juan Dela Cruz", patientId: "P-0002", staff: "Dr. Ana Flores", scheduledDate: "2026-03-31 10:00", purpose: "Hypertension Follow-up", status: "Cancelled", notes: "" },
  { id: "A-0007", patient: "Ana Reyes", patientId: "P-0003", staff: "Nurse Bautista", scheduledDate: "2026-04-02 08:00", purpose: "Post-medication Check", status: "Pending", notes: "" },
];

export type Appointment = (typeof mockAppointments)[0];

export const appointmentStatusColors: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
};
