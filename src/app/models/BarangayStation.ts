export interface BarangayStation {
  id: string;
  name: string;
  barangay: string;
  address: string;
  contact: string;
  staffCount: number;
  patientCount: number;
  consultationCount: number;
}

export type BarangayStationFormData = Omit<BarangayStation, 'id' | 'staffCount' | 'patientCount' | 'consultationCount'>;
