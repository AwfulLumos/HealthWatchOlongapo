export const mockConsultations = [
  { id: "C-0001", patient: "Maria Santos", patientId: "P-0001", staff: "Dr. Ana Flores", date: "2026-03-28", chiefComplaint: "Headache and dizziness", symptoms: "Headache, dizziness, blurred vision", diagnosis: "Hypertension Stage 2", icdCode: "I10", type: "Regular", status: "Completed" },
  { id: "C-0002", patient: "Juan Dela Cruz", patientId: "P-0002", staff: "Nurse Carmen Gomez", date: "2026-03-28", chiefComplaint: "High blood sugar", symptoms: "Fatigue, frequent urination, increased thirst", diagnosis: "Type 2 Diabetes", icdCode: "E11", type: "Follow-up", status: "Completed" },
  { id: "C-0003", patient: "Ana Reyes", patientId: "P-0003", staff: "Dr. Ana Flores", date: "2026-03-27", chiefComplaint: "Cough and colds", symptoms: "Productive cough, runny nose, mild fever", diagnosis: "Upper Respiratory Tract Infection", icdCode: "J06.9", type: "Regular", status: "Completed" },
  { id: "C-0004", patient: "Pedro Lim", patientId: "P-0004", staff: "Dr. Rico Santos", date: "2026-03-27", chiefComplaint: "Chest discomfort", symptoms: "Chest pain, shortness of breath", diagnosis: "Angina Pectoris", icdCode: "I20", type: "Emergency", status: "Referred" },
  { id: "C-0005", patient: "Rosa Garcia", patientId: "P-0005", staff: "Nurse Bautista", date: "2026-03-26", chiefComplaint: "Wound care", symptoms: "Infected wound on left foot", diagnosis: "Diabetic Foot Ulcer", icdCode: "E11.6", type: "Regular", status: "Completed" },
];

export type Consultation = (typeof mockConsultations)[0];

export const consultationTypeColors: Record<string, string> = {
  Regular: "bg-blue-100 text-blue-700",
  "Follow-up": "bg-teal-100 text-teal-700",
  Emergency: "bg-red-100 text-red-700",
};

export const consultationStatusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Referred: "bg-orange-100 text-orange-700",
};
