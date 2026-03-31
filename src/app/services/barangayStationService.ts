import type { BarangayStation, BarangayStationFormData } from '../models';
import { mockStations as initialStations } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'stations';

function getStations(): BarangayStation[] {
  const stored = storage.get<BarangayStation[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    // Map from static data format to model format
    const mapped: BarangayStation[] = initialStations.map(s => ({
      id: s.id,
      name: s.name,
      barangay: s.barangay,
      address: s.address,
      contact: s.contact,
      staffCount: s.staff,
      patientCount: s.patients,
      consultationCount: s.consultations,
    }));
    storage.set(STORAGE_KEY, mapped);
    return mapped;
  }
  return stored;
}

export const barangayStationService = {
  getAll(): BarangayStation[] {
    return getStations();
  },

  getById(id: string): BarangayStation | undefined {
    return getStations().find(s => s.id === id);
  },

  getByBarangay(barangay: string): BarangayStation | undefined {
    return getStations().find(s => s.barangay === barangay);
  },

  search(query: string): BarangayStation[] {
    const q = query.toLowerCase();
    return getStations().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.barangay.toLowerCase().includes(q)
    );
  },

  create(data: BarangayStationFormData): BarangayStation {
    const stations = getStations();
    const newStation: BarangayStation = {
      ...data,
      id: generateId('BS', stations.map(s => s.id)),
      staffCount: 0,
      patientCount: 0,
      consultationCount: 0,
    };
    storage.set(STORAGE_KEY, [...stations, newStation]);
    return newStation;
  },

  update(id: string, data: Partial<BarangayStation>): BarangayStation | undefined {
    const stations = getStations();
    const index = stations.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const updated = { ...stations[index], ...data };
    stations[index] = updated;
    storage.set(STORAGE_KEY, stations);
    return updated;
  },

  delete(id: string): boolean {
    const stations = getStations();
    const filtered = stations.filter(s => s.id !== id);
    if (filtered.length === stations.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  incrementStats(id: string, field: 'staffCount' | 'patientCount' | 'consultationCount'): BarangayStation | undefined {
    const station = this.getById(id);
    if (!station) return undefined;
    return this.update(id, { [field]: station[field] + 1 });
  },
};
