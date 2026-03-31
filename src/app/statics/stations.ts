export const mockStations = [
  { id: "BS-001", name: "Sta. Rita Health Center", barangay: "Sta. Rita", address: "123 Rizal Ave, Sta. Rita, Olongapo City", contact: "047-222-1111", staff: 5, patients: 312, consultations: 145 },
  { id: "BS-002", name: "Gordon Heights Health Center", barangay: "Gordon Heights", address: "456 Magsaysay Dr, Gordon Heights, Olongapo City", contact: "047-222-2222", staff: 4, patients: 248, consultations: 112 },
  { id: "BS-003", name: "New Ilalim Health Center", barangay: "New Ilalim", address: "789 Perimeter Rd, New Ilalim, Olongapo City", contact: "047-222-3333", staff: 3, patients: 187, consultations: 89 },
  { id: "BS-004", name: "Kalaklan Health Center", barangay: "Kalaklan", address: "101 Kalaklan Ridge, Olongapo City", contact: "047-222-4444", staff: 3, patients: 156, consultations: 74 },
  { id: "BS-005", name: "East Tapinac Health Center", barangay: "East Tapinac", address: "202 East Tapinac Blvd, Olongapo City", contact: "047-222-5555", staff: 2, patients: 134, consultations: 61 },
  { id: "BS-006", name: "Banicain Health Center", barangay: "Banicain", address: "303 Banicain St, Olongapo City", contact: "047-222-6666", staff: 4, patients: 247, consultations: 107 },
];

export type Station = (typeof mockStations)[0];
