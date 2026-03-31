export type ConsultationType = 'Regular' | 'Follow-up' | 'Emergency';
export type ConsultationStatus = 'Completed' | 'In Progress' | 'Referred';

export interface Consultation {
  id: string;
  patient: string;
  patientId: string;
  staff: string;
  staffId?: string;
  date: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  icdCode: string;
  type: ConsultationType;
  status: ConsultationStatus;
  notes?: string;
}

export type ConsultationFormData = Omit<Consultation, 'id'>;
