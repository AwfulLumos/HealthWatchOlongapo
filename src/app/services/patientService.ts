import type { Patient, PatientFormData } from '../models';
import { mockPatients } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'patients';

function getPatients(): Patient[] {
  const stored = storage.get<Patient[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    // Cast mock data to match our model types
    const initialPatients = mockPatients as unknown as Patient[];
    storage.set(STORAGE_KEY, initialPatients);
    return initialPatients;
  }
  return stored;
}

export const patientService = {
  getAll(): Patient[] {
    return getPatients();
  },

  getById(id: string): Patient | undefined {
    return getPatients().find(p => p.id === id);
  },

  getByBarangay(barangay: string): Patient[] {
    return getPatients().filter(p => p.barangay === barangay);
  },

  search(query: string): Patient[] {
    const q = query.toLowerCase();
    return getPatients().filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  },

  create(data: PatientFormData): Patient {
    const patients = getPatients();
    const newPatient: Patient = {
      ...data,
      id: generateId('P', patients.map(p => p.id)),
      registered: new Date().toISOString().split('T')[0],
    };
    storage.set(STORAGE_KEY, [...patients, newPatient]);
    return newPatient;
  },

  update(id: string, data: Partial<Patient>): Patient | undefined {
    const patients = getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updated = { ...patients[index], ...data };
    patients[index] = updated;
    storage.set(STORAGE_KEY, patients);
    return updated;
  },

  delete(id: string): boolean {
    const patients = getPatients();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length === patients.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  getCount(): number {
    return getPatients().length;
  },

  getActiveCount(): number {
    return getPatients().filter(p => p.status === 'Active').length;
  },
};
