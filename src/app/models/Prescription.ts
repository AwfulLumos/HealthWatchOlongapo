export interface Prescription {
  id: string;
  consultId: string;
  patient: string;
  patientId?: string;
  doctor: string;
  date: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export type PrescriptionFormData = Omit<Prescription, 'id'>;
