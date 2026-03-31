export interface MedicalCondition {
  condition: string;
  status: 'Active' | 'Resolved';
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female';
  bloodType: string;
  civilStatus?: string;
  barangay: string;
  contact: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  philhealth: string;
  status: 'Active' | 'Inactive';
  registered: string;
  medicalHistory?: MedicalCondition[];
}

export type PatientFormData = Omit<Patient, 'id' | 'registered'>;
