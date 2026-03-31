export type StaffRole = 'Doctor' | 'Nurse' | 'Midwife' | 'BHW';
export type AccountStatus = 'Active' | 'Inactive';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  licenseNumber: string;
  contact: string;
  email: string;
  station: string;
  stationId?: string;
  accountStatus: AccountStatus;
}

export type StaffFormData = Omit<Staff, 'id'>;

export function getStaffFullName(staff: Staff): string {
  return `${staff.firstName} ${staff.lastName}`;
}
