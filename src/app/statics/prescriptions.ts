export const mockPrescriptions = [
  { id: "RX-0001", consultId: "C-0001", patient: "Maria Santos", doctor: "Dr. Ana Flores", date: "2026-03-28", medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
  { id: "RX-0002", consultId: "C-0001", patient: "Maria Santos", doctor: "Dr. Ana Flores", date: "2026-03-28", medicine: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
  { id: "RX-0003", consultId: "C-0002", patient: "Juan Dela Cruz", doctor: "Nurse Gomez", date: "2026-03-28", medicine: "Losartan", dosage: "50mg", frequency: "Once daily", duration: "30 days", instructions: "Take at bedtime" },
  { id: "RX-0004", consultId: "C-0003", patient: "Ana Reyes", doctor: "Dr. Ana Flores", date: "2026-03-27", medicine: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete full course" },
  { id: "RX-0005", consultId: "C-0003", patient: "Ana Reyes", doctor: "Dr. Ana Flores", date: "2026-03-27", medicine: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "5 days", instructions: "Take at bedtime" },
  { id: "RX-0006", consultId: "C-0005", patient: "Rosa Garcia", doctor: "Nurse Bautista", date: "2026-03-26", medicine: "Clindamycin", dosage: "300mg", frequency: "Four times daily", duration: "14 days", instructions: "Take with food" },
];

export type Prescription = (typeof mockPrescriptions)[0];
