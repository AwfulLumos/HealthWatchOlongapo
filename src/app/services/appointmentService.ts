import type { Appointment, AppointmentFormData } from '../models';
import { mockAppointments } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'appointments';

function getAppointments(): Appointment[] {
  const stored = storage.get<Appointment[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    const initialAppointments = mockAppointments as unknown as Appointment[];
    storage.set(STORAGE_KEY, initialAppointments);
    return initialAppointments;
  }
  return stored;
}

export const appointmentService = {
  getAll(): Appointment[] {
    return getAppointments();
  },

  getById(id: string): Appointment | undefined {
    return getAppointments().find(a => a.id === id);
  },

  getByPatientId(patientId: string): Appointment[] {
    return getAppointments().filter(a => a.patientId === patientId);
  },

  getByDate(date: string): Appointment[] {
    return getAppointments().filter(a => a.scheduledDate.startsWith(date));
  },

  getUpcoming(): Appointment[] {
    const now = new Date().toISOString();
    return getAppointments()
      .filter(a => a.scheduledDate > now && a.status !== 'Cancelled')
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  },

  getTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today).filter(a => a.status !== 'Cancelled').length;
  },

  create(data: AppointmentFormData): Appointment {
    const appointments = getAppointments();
    const newAppointment: Appointment = {
      ...data,
      id: generateId('A', appointments.map(a => a.id)),
    };
    storage.set(STORAGE_KEY, [...appointments, newAppointment]);
    return newAppointment;
  },

  update(id: string, data: Partial<Appointment>): Appointment | undefined {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    const updated = { ...appointments[index], ...data };
    appointments[index] = updated;
    storage.set(STORAGE_KEY, appointments);
    return updated;
  },

  delete(id: string): boolean {
    const appointments = getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    if (filtered.length === appointments.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  cancel(id: string): Appointment | undefined {
    return this.update(id, { status: 'Cancelled' });
  },

  complete(id: string): Appointment | undefined {
    return this.update(id, { status: 'Completed' });
  },
};
