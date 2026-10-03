/**
 * Official Barangays of Olongapo City, Zambales, Philippines (17 Barangays)
 * Reference: Philippine Statistics Authority (PSA) / City Government of Olongapo
 */
export const OLONGAPO_BARANGAYS = [
  "Asinan",
  "Banicain",
  "Barretto",
  "East Bajac-Bajac",
  "East Tapinac",
  "Gordon Heights",
  "Kalaklan",
  "Mabayuan",
  "New Cabalan",
  "New Ilalim",
  "New Kababae",
  "New Kalalake",
  "Old Cabalan",
  "Pag-asa",
  "Santa Rita",
  "West Bajac-Bajac",
  "West Tapinac",
] as const;

export type OlongapoBarangay = (typeof OLONGAPO_BARANGAYS)[number];

export const OLONGAPO_CITY_ZIP = "2200";

export interface BarangayInfo {
  name: OlongapoBarangay;
  zipCode: string;
}

export const OLONGAPO_BARANGAYS_INFO: BarangayInfo[] = OLONGAPO_BARANGAYS.map((name) => ({
  name,
  zipCode: OLONGAPO_CITY_ZIP,
}));

/**
 * Check if a given string matches any of Olongapo City's official barangays (case-insensitive)
 */
export function isValidOlongapoBarangay(name: string): boolean {
  if (!name) return false;
  const normalized = name.trim().toLowerCase();
  return OLONGAPO_BARANGAYS.some((b) => b.toLowerCase() === normalized);
}

/**
 * Returns the properly capitalized official name for a given barangay string, or the input if not found.
 */
export function formatOlongapoBarangay(name: string): string {
  if (!name) return "";
  const normalized = name.trim().toLowerCase();
  const found = OLONGAPO_BARANGAYS.find((b) => b.toLowerCase() === normalized);
  return found || name.trim();
}
