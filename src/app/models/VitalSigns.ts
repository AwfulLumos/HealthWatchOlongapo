export interface VitalSigns {
  id: string;
  consultId?: string;
  patient: string;
  patientId?: string;
  date: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  respRate: number;
  temp: number;
  bloodSugar: number;
  weight: number;
  height: number;
  bmi: number;
}

export type VitalSignsFormData = Omit<VitalSigns, 'id' | 'bmi'>;

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
}
