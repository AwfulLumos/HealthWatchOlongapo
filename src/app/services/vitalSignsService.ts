import type { VitalSigns, VitalSignsFormData } from '../models';
import { calculateBMI } from '../models';
import { mockVitals as initialVitals } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'vitals';

function getVitals(): VitalSigns[] {
  const stored = storage.get<VitalSigns[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    storage.set(STORAGE_KEY, initialVitals);
    return initialVitals;
  }
  return stored;
}

export const vitalSignsService = {
  getAll(): VitalSigns[] {
    return getVitals();
  },

  getById(id: string): VitalSigns | undefined {
    return getVitals().find(v => v.id === id);
  },

  getByConsultationId(consultId: string): VitalSigns | undefined {
    return getVitals().find(v => v.consultId === consultId);
  },

  getByPatient(patientName: string): VitalSigns[] {
    return getVitals().filter(v => 
      v.patient.toLowerCase().includes(patientName.toLowerCase())
    );
  },

  getLatestByPatient(patientName: string): VitalSigns | undefined {
    const patientVitals = this.getByPatient(patientName);
    return patientVitals.sort((a, b) => b.date.localeCompare(a.date))[0];
  },

  create(data: VitalSignsFormData): VitalSigns {
    const vitals = getVitals();
    const bmi = calculateBMI(data.weight, data.height);
    const newVital: VitalSigns = {
      ...data,
      id: generateId('V', vitals.map(v => v.id)),
      bmi,
    };
    storage.set(STORAGE_KEY, [...vitals, newVital]);
    return newVital;
  },

  update(id: string, data: Partial<VitalSignsFormData>): VitalSigns | undefined {
    const vitals = getVitals();
    const index = vitals.findIndex(v => v.id === id);
    if (index === -1) return undefined;

    const current = vitals[index];
    const weight = data.weight ?? current.weight;
    const height = data.height ?? current.height;
    const bmi = calculateBMI(weight, height);

    const updated = { ...current, ...data, bmi };
    vitals[index] = updated;
    storage.set(STORAGE_KEY, vitals);
    return updated;
  },

  delete(id: string): boolean {
    const vitals = getVitals();
    const filtered = vitals.filter(v => v.id !== id);
    if (filtered.length === vitals.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  getBPTrend(patientName: string): { date: string; systolic: number; diastolic: number }[] {
    return this.getByPatient(patientName)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(v => ({
        date: v.date,
        systolic: v.bpSystolic,
        diastolic: v.bpDiastolic,
      }));
  },
};
