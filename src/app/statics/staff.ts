export const mockStaff = [
  { id: "S-0001", firstName: "Ana", lastName: "Flores", role: "Doctor", station: "Sta. Rita Health Center", licenseNumber: "PRC-MD-12345", contact: "09171112222", email: "ana.flores@healthwatch.ph", accountStatus: "Active" },
  { id: "S-0002", firstName: "Rico", lastName: "Santos", role: "Doctor", station: "Gordon Heights Health Center", licenseNumber: "PRC-MD-23456", contact: "09281112222", email: "rico.santos@healthwatch.ph", accountStatus: "Active" },
  { id: "S-0003", firstName: "Carmen", lastName: "Gomez", role: "Nurse", station: "Sta. Rita Health Center", licenseNumber: "PRC-RN-34567", contact: "09391112222", email: "carmen.gomez@healthwatch.ph", accountStatus: "Active" },
  { id: "S-0004", firstName: "Marco", lastName: "Bautista", role: "Nurse", station: "New Ilalim Health Center", licenseNumber: "PRC-RN-45678", contact: "09451112222", email: "marco.bautista@healthwatch.ph", accountStatus: "Active" },
  { id: "S-0005", firstName: "Linda", lastName: "Cruz", role: "Midwife", station: "Kalaklan Health Center", licenseNumber: "PRC-MW-56789", contact: "09561112222", email: "linda.cruz@healthwatch.ph", accountStatus: "Active" },
  { id: "S-0006", firstName: "Jose", lastName: "Reyes", role: "BHW", station: "East Tapinac Health Center", licenseNumber: "BHW-67890", contact: "09671112222", email: "jose.reyes@healthwatch.ph", accountStatus: "Inactive" },
];

export type Staff = (typeof mockStaff)[0];

export const roleColors: Record<string, string> = {
  Doctor: "bg-blue-100 text-blue-700",
  Nurse: "bg-teal-100 text-teal-700",
  Midwife: "bg-violet-100 text-violet-700",
  BHW: "bg-orange-100 text-orange-700",
};
