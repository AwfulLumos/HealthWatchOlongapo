import type { Staff, StaffFormData } from '../models';
import { mockStaff } from '../statics';
import { storage, generateId } from './storage';

const STORAGE_KEY = 'staff';

function getStaff(): Staff[] {
  const stored = storage.get<Staff[] | null>(STORAGE_KEY, null);
  if (stored === null) {
    const initialStaff = mockStaff as unknown as Staff[];
    storage.set(STORAGE_KEY, initialStaff);
    return initialStaff;
  }
  return stored;
}

export const staffService = {
  getAll(): Staff[] {
    return getStaff();
  },

  getById(id: string): Staff | undefined {
    return getStaff().find(s => s.id === id);
  },

  getByRole(role: Staff['role']): Staff[] {
    return getStaff().filter(s => s.role === role);
  },

  getByStation(station: string): Staff[] {
    return getStaff().filter(s => s.station === station);
  },

  getActive(): Staff[] {
    return getStaff().filter(s => s.accountStatus === 'Active');
  },

  getActiveCount(): number {
    return this.getActive().length;
  },

  search(query: string): Staff[] {
    const q = query.toLowerCase();
    return getStaff().filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  },

  create(data: StaffFormData): Staff {
    const staffList = getStaff();
    const newStaff: Staff = {
      ...data,
      id: generateId('S', staffList.map(s => s.id)),
    };
    storage.set(STORAGE_KEY, [...staffList, newStaff]);
    return newStaff;
  },

  update(id: string, data: Partial<Staff>): Staff | undefined {
    const staffList = getStaff();
    const index = staffList.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const updated = { ...staffList[index], ...data };
    staffList[index] = updated;
    storage.set(STORAGE_KEY, staffList);
    return updated;
  },

  delete(id: string): boolean {
    const staffList = getStaff();
    const filtered = staffList.filter(s => s.id !== id);
    if (filtered.length === staffList.length) return false;
    storage.set(STORAGE_KEY, filtered);
    return true;
  },

  deactivate(id: string): Staff | undefined {
    return this.update(id, { accountStatus: 'Inactive' });
  },

  activate(id: string): Staff | undefined {
    return this.update(id, { accountStatus: 'Active' });
  },
};
