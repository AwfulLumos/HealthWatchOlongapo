export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';

export interface Appointment {
  id: string;
  patient: string;
  patientId: string;
  staff: string;
  staffId?: string;
  scheduledDate: string;
  purpose: string;
  status: AppointmentStatus;
  notes?: string;
}

export type AppointmentFormData = Omit<Appointment, 'id'>;
