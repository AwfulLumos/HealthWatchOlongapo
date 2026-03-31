export const mockPatients = [
  { id: "P-0001", firstName: "Maria", lastName: "Santos", dob: "1985-03-12", gender: "Female", bloodType: "O+", barangay: "Sta. Rita", contact: "09171234567", status: "Active", registered: "2024-01-15", philhealth: "PH-123456" },
  { id: "P-0002", firstName: "Juan", lastName: "Dela Cruz", dob: "1970-07-22", gender: "Male", bloodType: "A+", barangay: "Gordon Heights", contact: "09281234567", status: "Active", registered: "2024-02-10", philhealth: "PH-234567" },
  { id: "P-0003", firstName: "Ana", lastName: "Reyes", dob: "1995-11-05", gender: "Female", bloodType: "B-", barangay: "New Ilalim", contact: "09391234567", status: "Active", registered: "2024-03-01", philhealth: "PH-345678" },
  { id: "P-0004", firstName: "Pedro", lastName: "Lim", dob: "1960-05-18", gender: "Male", bloodType: "AB+", barangay: "Kalaklan", contact: "09451234567", status: "Active", registered: "2023-11-20", philhealth: "PH-456789" },
  { id: "P-0005", firstName: "Rosa", lastName: "Garcia", dob: "1988-09-30", gender: "Female", bloodType: "O-", barangay: "East Tapinac", contact: "09561234567", status: "Inactive", registered: "2023-08-14", philhealth: "PH-567890" },
  { id: "P-0006", firstName: "Carlos", lastName: "Mendoza", dob: "1975-12-01", gender: "Male", bloodType: "A-", barangay: "Banicain", contact: "09671234567", status: "Active", registered: "2024-04-05", philhealth: "PH-678901" },
  { id: "P-0007", firstName: "Elena", lastName: "Pascual", dob: "2000-02-14", gender: "Female", bloodType: "B+", barangay: "Mabayuan", contact: "09781234567", status: "Active", registered: "2024-05-22", philhealth: "PH-789012" },
  { id: "P-0008", firstName: "Marco", lastName: "Ramos", dob: "1992-08-08", gender: "Male", bloodType: "O+", barangay: "Old Cabalan", contact: "09891234567", status: "Active", registered: "2024-06-11", philhealth: "PH-890123" },
];

export type Patient = (typeof mockPatients)[0];
