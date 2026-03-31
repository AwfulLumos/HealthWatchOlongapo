import type { Prescription, PrescriptionFormData } from '../models';
import { mockPrescriptions as initialPrescriptions } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'prescriptions';

function getPrescriptions(): Prescription[] {
  const stored = storage.get<Prescription[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    storage.set(STORAGE_KEY, initialPrescriptions);
    return initialPrescriptions;
  }
  return stored;
}

export const prescriptionService = {
  getAll(): Prescription[] {
    return getPrescriptions();
  },

  getById(id: string): Prescription | undefined {
    return getPrescriptions().find(p => p.id === id);
  },

  getByConsultationId(consultId: string): Prescription[] {
    return getPrescriptions().filter(p => p.consultId === consultId);
  },

  getByPatient(patientName: string): Prescription[] {
    return getPrescriptions().filter(p => 
      p.patient.toLowerCase().includes(patientName.toLowerCase())
    );
  },

  create(data: PrescriptionFormData): Prescription {
    const prescriptions = getPrescriptions();
    const newPrescription: Prescription = {
      ...data,
      id: generateId('RX', prescriptions.map(p => p.id)),
    };
    storage.set(STORAGE_KEY, [...prescriptions, newPrescription]);
    return newPrescription;
  },

  update(id: string, data: Partial<Prescription>): Prescription | undefined {
    const prescriptions = getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updated = { ...prescriptions[index], ...data };
    prescriptions[index] = updated;
    storage.set(STORAGE_KEY, prescriptions);
    return updated;
  },

  delete(id: string): boolean {
    const prescriptions = getPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== id);
    if (filtered.length === prescriptions.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  getMedicineStats(): { medicine: string; count: number }[] {
    const prescriptions = getPrescriptions();
    const medicineCounts = prescriptions.reduce((acc, p) => {
      acc[p.medicine] = (acc[p.medicine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(medicineCounts)
      .map(([medicine, count]) => ({ medicine, count }))
      .sort((a, b) => b.count - a.count);
  },
};
