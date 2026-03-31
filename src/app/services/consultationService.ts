import type { Consultation, ConsultationFormData } from '../models';
import { mockConsultations } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'consultations';

function getConsultations(): Consultation[] {
  const stored = storage.get<Consultation[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    const initialConsultations = mockConsultations as unknown as Consultation[];
    storage.set(STORAGE_KEY, initialConsultations);
    return initialConsultations;
  }
  return stored;
}

export const consultationService = {
  getAll(): Consultation[] {
    return getConsultations();
  },

  getById(id: string): Consultation | undefined {
    return getConsultations().find(c => c.id === id);
  },

  getByPatientId(patientId: string): Consultation[] {
    return getConsultations().filter(c => c.patientId === patientId);
  },

  getByDate(date: string): Consultation[] {
    return getConsultations().filter(c => c.date === date);
  },

  getTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today).length;
  },

  getByType(type: Consultation['type']): Consultation[] {
    return getConsultations().filter(c => c.type === type);
  },

  create(data: ConsultationFormData): Consultation {
    const consultations = getConsultations();
    const newConsultation: Consultation = {
      ...data,
      id: generateId('C', consultations.map(c => c.id)),
    };
    storage.set(STORAGE_KEY, [...consultations, newConsultation]);
    return newConsultation;
  },

  update(id: string, data: Partial<Consultation>): Consultation | undefined {
    const consultations = getConsultations();
    const index = consultations.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updated = { ...consultations[index], ...data };
    consultations[index] = updated;
    storage.set(STORAGE_KEY, consultations);
    return updated;
  },

  delete(id: string): boolean {
    const consultations = getConsultations();
    const filtered = consultations.filter(c => c.id !== id);
    if (filtered.length === consultations.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  complete(id: string): Consultation | undefined {
    return this.update(id, { status: 'Completed' });
  },

  getDiagnosisStats(): { name: string; count: number }[] {
    const consultations = getConsultations();
    const diagnosisCounts = consultations.reduce((acc, c) => {
      acc[c.diagnosis] = (acc[c.diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
};
