# HealthWatch Olongapo - API Reference

## Service Layer APIs

The HealthWatch Olongapo system uses a service layer pattern where each domain entity has a corresponding service that handles all data operations. All services follow a consistent API pattern for CRUD operations.

## Common Service Interface

All services implement a common interface pattern:

```typescript
interface BaseService<T, TFormData> {
  // Read operations
  getAll(): T[];
  getById(id: string): T | undefined;
  search(query: string): T[];
  getCount(): number;
  
  // Write operations
  create(data: TFormData): string;
  update(id: string, data: Partial<T>): boolean;
  delete(id: string): boolean;
}
```

## Authentication Service

### `authService`

Handles user authentication and session management.

#### Methods

**`login(credentials: LoginCredentials): Promise<User>`**
- Authenticates user with username and password
- Returns user object on success
- Throws error on invalid credentials or inactive account

```typescript
const user = await authService.login({
  username: 'admin',
  password: 'admin123'
});
```

**`logout(): void`**
- Clears authentication state
- Removes user session from localStorage

**`getCurrentUser(): User | null`**
- Returns currently authenticated user
- Returns null if not authenticated

**`isAuthenticated(): boolean`**
- Returns authentication status
- Checks for valid session and active user

**`changePassword(currentPassword: string, newPassword: string): Promise<void>`**
- Changes password for current user
- Validates current password before updating
- Updates user record in storage

#### Types

```typescript
interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  staffId?: string;
  accountStatus: 'Active' | 'Inactive';
  lastLogin?: string;
}

// User roles control system access (login accounts)
type UserRole = 'Admin' | 'Employee';

// Staff roles represent healthcare provider types (personnel records)
type StaffRole = 'Doctor' | 'Nurse' | 'Midwife' | 'BHW';
```

## Patient Service

### `patientService`

Manages patient records and related operations.

#### Methods

**`getAll(): Patient[]`**
- Returns all registered patients
- Includes active and inactive patients

**`getById(id: string): Patient | undefined`**
- Returns patient by ID (e.g., "P-0001")
- Returns undefined if patient not found

**`create(data: PatientFormData): string`**
- Creates new patient record
- Generates unique patient ID
- Returns generated patient ID

```typescript
const patientId = patientService.create({
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  dob: '1980-05-15',
  gender: 'Male',
  bloodType: 'O+',
  barangay: 'Sta. Rita',
  contact: '09171234567',
  address: '123 Main St, Olongapo',
  emergencyContact: 'Maria Dela Cruz',
  emergencyContactNumber: '09189876543',
  philhealth: 'PH-123456789'
});
```

**`update(id: string, data: Partial<Patient>): boolean`**
- Updates existing patient record
- Returns true on success, false if patient not found

**`delete(id: string): boolean`**
- Soft delete (sets status to 'Inactive')
- Returns true on success, false if patient not found

**`search(query: string): Patient[]`**
- Searches patients by name, ID, or contact
- Case-insensitive search
- Returns matching patients

**`getByBarangay(barangay: string): Patient[]`**
- Returns patients from specific barangay
- Useful for location-based filtering

**`getCount(): number`**
- Returns total number of patients

**`getActiveCount(): number`**
- Returns number of active patients

#### Types

```typescript
interface Patient {
  id: string;                    // P-0001, P-0002, etc.
  firstName: string;
  lastName: string;
  dob: string;                   // YYYY-MM-DD format
  gender: 'Male' | 'Female';
  bloodType: string;
  civilStatus?: string;
  barangay: string;
  contact: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  philhealth: string;
  status: 'Active' | 'Inactive';
  registered: string;            // YYYY-MM-DD format
  medicalHistory?: MedicalCondition[];
}

type PatientFormData = Omit<Patient, 'id' | 'registered' | 'status'>;
```

## Appointment Service

### `appointmentService`

Manages appointment scheduling and tracking.

#### Methods

**`getAll(): Appointment[]`**
- Returns all appointments across all statuses

**`getById(id: string): Appointment | undefined`**
- Returns appointment by ID (e.g., "A-0001")

**`create(data: AppointmentFormData): string`**
- Creates new appointment
- Generates unique appointment ID
- Returns generated appointment ID

```typescript
const appointmentId = appointmentService.create({
  patient: 'Juan Dela Cruz',
  patientId: 'P-0001',
  staff: 'Dr. Maria Santos',
  staffId: 'S-0001',
  scheduledDate: '2026-04-15T09:00:00.000Z',
  purpose: 'Regular checkup',
  status: 'Confirmed',
  notes: 'Annual physical examination'
});
```

**`update(id: string, data: Partial<Appointment>): boolean`**
- Updates appointment details
- Common use case: status updates

**`getByStatus(status: AppointmentStatus): Appointment[]`**
- Returns appointments filtered by status
- Statuses: 'Confirmed', 'Pending', 'Cancelled', 'Completed'

**`getByDate(date: string): Appointment[]`**
- Returns appointments for specific date
- Date format: YYYY-MM-DD

**`getUpcoming(limit?: number): Appointment[]`**
- Returns upcoming appointments
- Sorted by scheduled date
- Optional limit parameter

**`getTodaysAppointments(): Appointment[]`**
- Returns today's appointments
- Useful for daily scheduling view

#### Types

```typescript
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';

interface Appointment {
  id: string;                    // A-0001, A-0002, etc.
  patient: string;               // Patient name
  patientId: string;             // Patient ID
  staff: string;                 // Staff/doctor name
  staffId?: string;              // Staff ID
  scheduledDate: string;         // ISO datetime
  purpose: string;               // Reason for appointment
  status: AppointmentStatus;
  notes?: string;
}

type AppointmentFormData = Omit<Appointment, 'id'>;
```

## Consultation Service

### `consultationService`

Manages medical consultation records and clinical documentation.

#### Methods

**`getAll(): Consultation[]`**
- Returns all consultation records

**`create(data: ConsultationFormData): string`**
- Creates new consultation record
- Generates consultation ID with ICD code integration

```typescript
const consultationId = consultationService.create({
  patient: 'Juan Dela Cruz',
  patientId: 'P-0001',
  staff: 'Dr. Maria Santos',
  staffId: 'S-0001',
  date: '2026-04-01',
  chiefComplaint: 'Fever and headache',
  symptoms: 'High fever (39°C), severe headache, body aches for 3 days',
  diagnosis: 'Viral syndrome',
  icdCode: 'B34.9',
  type: 'Regular',
  status: 'Completed',
  notes: 'Prescribed symptomatic treatment, follow-up in 5 days'
});
```

**`getByPatient(patientId: string): Consultation[]`**
- Returns patient's consultation history
- Sorted by date (newest first)

**`getByType(type: ConsultationType): Consultation[]`**
- Filters consultations by type
- Types: 'Regular', 'Follow-up', 'Emergency'

**`getByDateRange(startDate: string, endDate: string): Consultation[]`**
- Returns consultations within date range
- Useful for reporting and analytics

**`getTodaysConsultations(): Consultation[]`**
- Returns today's completed consultations

#### Types

```typescript
type ConsultationType = 'Regular' | 'Follow-up' | 'Emergency';
type ConsultationStatus = 'Completed' | 'In Progress' | 'Referred';

interface Consultation {
  id: string;                    // C-0001, C-0002, etc.
  patient: string;
  patientId: string;
  staff: string;
  staffId?: string;
  date: string;                  // YYYY-MM-DD
  chiefComplaint: string;        // Main complaint
  symptoms: string;              // Detailed symptoms
  diagnosis: string;             // Medical diagnosis
  icdCode: string;               // ICD-10 code
  type: ConsultationType;
  status: ConsultationStatus;
  notes?: string;
}

type ConsultationFormData = Omit<Consultation, 'id'>;
```

## Prescription Service

### `prescriptionService`

Manages prescription records linked to consultations.

#### Methods

**`create(data: PrescriptionFormData): string`**
- Creates new prescription
- Can be linked to consultation via consultId

```typescript
const prescriptionId = prescriptionService.create({
  consultId: 'C-0001',
  patient: 'Juan Dela Cruz',
  patientId: 'P-0001',
  doctor: 'Dr. Maria Santos',
  date: '2026-04-01',
  medicine: 'Paracetamol 500mg',
  dosage: '1 tablet',
  frequency: '3 times daily',
  duration: '7 days',
  instructions: 'Take after meals. Drink plenty of water.'
});
```

**`getByPatient(patientId: string): Prescription[]`**
- Returns patient's prescription history

**`getByConsultation(consultId: string): Prescription[]`**
- Returns prescriptions for specific consultation

**`getByDoctor(doctorName: string): Prescription[]`**
- Returns prescriptions by prescribing doctor

#### Types

```typescript
interface Prescription {
  id: string;                    // RX-0001, RX-0002, etc.
  consultId?: string;            // Linked consultation
  patient: string;
  patientId?: string;
  doctor: string;
  date: string;                  // YYYY-MM-DD
  medicine: string;
  dosage: string;                // e.g., "500mg", "1 tablet"
  frequency: string;             // e.g., "3 times daily"
  duration: string;              // e.g., "7 days"
  instructions: string;          // Special instructions
}

type PrescriptionFormData = Omit<Prescription, 'id'>;
```

## Vital Signs Service

### `vitalSignsService`

Manages patient vital signs measurements and BMI calculations.

#### Methods

**`create(data: VitalSignsFormData): string`**
- Records new vital signs measurement
- Automatically calculates BMI from height and weight

```typescript
const vitalSignsId = vitalSignsService.create({
  consultId: 'C-0001',
  patient: 'Juan Dela Cruz',
  patientId: 'P-0001',
  date: '2026-04-01',
  bpSystolic: 120,
  bpDiastolic: 80,
  pulseRate: 72,
  respRate: 16,
  temp: 36.5,
  bloodSugar: 95,
  weight: 70,
  height: 170
  // BMI automatically calculated (24.2)
});
```

**`getByPatient(patientId: string): VitalSigns[]`**
- Returns patient's vital signs history
- Useful for tracking trends over time

**`getByConsultation(consultId: string): VitalSigns[]`**
- Returns vital signs for specific consultation

#### Utility Functions

**`calculateBMI(weight: number, height: number): number`**
- Calculates BMI from weight (kg) and height (cm)
- Returns rounded BMI value

```typescript
import { calculateBMI } from '../models/VitalSigns';
const bmi = calculateBMI(70, 170); // Returns 24.2
```

#### Types

```typescript
interface VitalSigns {
  id: string;                    // V-0001, V-0002, etc.
  consultId?: string;
  patient: string;
  patientId?: string;
  date: string;                  // YYYY-MM-DD
  bpSystolic: number;            // mmHg
  bpDiastolic: number;           // mmHg
  pulseRate: number;             // beats per minute
  respRate: number;              // breaths per minute
  temp: number;                  // °C
  bloodSugar: number;            // mg/dL
  weight: number;                // kg
  height: number;                // cm
  bmi: number;                   // calculated automatically
}

type VitalSignsFormData = Omit<VitalSigns, 'id' | 'bmi'>;
```

## Staff Service

### `staffService`

Manages healthcare staff members and their roles.

#### Methods

**`create(data: StaffFormData): string`**
- Creates new staff member
- Generates staff ID and user account

```typescript
const staffId = staffService.create({
  firstName: 'Maria',
  lastName: 'Santos',
  role: 'Doctor',
  licenseNumber: 'MD-123456',
  specialization: 'Family Medicine',
  contact: '09171234567',
  email: 'maria.santos@healthwatch.com',
  station: 'Sta. Rita Health Center',
  schedule: 'Monday-Friday 8AM-5PM',
  status: 'Active'
});
```

**`getByRole(role: StaffRole): Staff[]`**
- Returns staff members by role
- Roles: 'Doctor', 'Nurse', 'Midwife', 'BHW'

**`getActiveStaff(): Staff[]`**
- Returns only active staff members

**`getByStation(station: string): Staff[]`**
- Returns staff assigned to specific station

#### Types

```typescript
type StaffRole = 'Doctor' | 'Nurse' | 'Midwife' | 'BHW';
type AccountStatus = 'Active' | 'Inactive';

interface Staff {
  id: string;                    // S-0001, S-0002, etc.
  firstName: string;
  lastName: string;
  role: StaffRole;
  licenseNumber?: string;
  specialization?: string;
  contact: string;
  email?: string;
  station?: string;              // Assigned health center
  schedule?: string;
  status: AccountStatus;
  dateHired: string;             // YYYY-MM-DD
}

type StaffFormData = Omit<Staff, 'id' | 'dateHired'>;

// Utility function
export function getStaffFullName(staff: Staff): string {
  return `${staff.firstName} ${staff.lastName}`;
}
```

## Dashboard Service

### `dashboardService`

Provides aggregated data for dashboard analytics and reporting.

#### Methods

**`getDashboardData(): DashboardData`**
- Returns comprehensive dashboard data
- Includes statistics, charts data, and recent activities

```typescript
const dashboardData = dashboardService.getDashboardData();
// Returns stats cards, chart data, recent patients, upcoming appointments
```

**`getStatisticsCards(): StatCard[]`**
- Returns current statistics for dashboard cards
- Live counts from all services

**`getConsultationChartData(): ConsultationChartData[]`**
- Returns weekly consultation data for bar chart
- Aggregated by day of week

**`getMonthlyPatientData(): MonthlyPatientData[]`**
- Returns patient registration trends by month
- For line chart visualization

#### Types

```typescript
interface StatCard {
  title: string;
  value: number;
  change: string;               // e.g., "+12%", "-5%"
  icon: string;
  color: string;
}

interface ConsultationChartData {
  day: string;                  // Mon, Tue, Wed, etc.
  consultations: number;
}

interface MonthlyPatientData {
  month: string;                // Jan, Feb, Mar, etc.
  patients: number;
}

interface RecentPatientActivity {
  id: string;
  name: string;
  barangay: string;
  date: string;
  status: string;
}

interface UpcomingAppointment {
  time: string;
  patient: string;
  purpose: string;
  staff: string;
}
```

## Storage Service

### `storage`

Low-level localStorage wrapper used by all services.

#### Methods

**`get<T>(key: string): T[]`**
- Retrieves data array from localStorage
- Returns empty array if key doesn't exist

**`set<T>(key: string, data: T[]): void`**
- Stores data array to localStorage
- Automatically serializes to JSON

**`clear(key: string): void`**
- Removes specific key from localStorage

**`generateId(prefix: string): string`**
- Generates sequential ID with prefix
- Format: PREFIX-0001, PREFIX-0002, etc.
- Examples: P-0001, A-0001, C-0001

```typescript
import { storage } from '../services/storage';

// Get patients
const patients = storage.get<Patient>('patients');

// Save updated patients
storage.set('patients', updatedPatients);

// Generate new patient ID
const newId = storage.generateId('P'); // Returns "P-0001", "P-0002", etc.
```

## Error Handling

All service methods may throw errors that should be handled by the calling code:

```typescript
try {
  const patientId = patientService.create(patientData);
  console.log('Patient created with ID:', patientId);
} catch (error) {
  console.error('Failed to create patient:', error.message);
  // Handle error appropriately
}
```

Common error scenarios:
- **Validation errors**: Missing required fields, invalid data formats
- **Business rule violations**: Duplicate data, invalid references
- **Storage errors**: localStorage quota exceeded, permission denied

## Data Validation

Services perform basic validation but clients should also validate data:

```typescript
// Example client-side validation
function validatePatientData(data: PatientFormData): string[] {
  const errors: string[] = [];
  
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.dob) errors.push('Date of birth is required');
  if (!data.contact?.trim()) errors.push('Contact number is required');
  
  return errors;
}
```

## Usage Examples

### Complete Patient Registration Flow

```typescript
import { patientService } from '../services';

async function registerNewPatient(formData: PatientFormData) {
  try {
    // Validate data
    if (!formData.firstName || !formData.lastName) {
      throw new Error('Name is required');
    }
    
    // Create patient
    const patientId = patientService.create(formData);
    
    // Get created patient
    const patient = patientService.getById(patientId);
    
    console.log('Patient registered:', patient);
    return patientId;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

### Appointment Scheduling with Validation

```typescript
async function scheduleAppointment(appointmentData: AppointmentFormData) {
  try {
    // Validate patient exists
    const patient = patientService.getById(appointmentData.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Check for conflicts (same patient, same day)
    const existingAppointments = appointmentService.getByDate(
      appointmentData.scheduledDate.split('T')[0]
    );
    
    const hasConflict = existingAppointments.some(
      apt => apt.patientId === appointmentData.patientId
    );
    
    if (hasConflict) {
      throw new Error('Patient already has an appointment on this date');
    }
    
    // Create appointment
    const appointmentId = appointmentService.create(appointmentData);
    return appointmentId;
  } catch (error) {
    console.error('Scheduling failed:', error);
    throw error;
  }
}
```

### Complete Consultation Workflow

```typescript
async function completeConsultation(
  consultationData: ConsultationFormData,
  prescriptionData?: PrescriptionFormData,
  vitalSignsData?: VitalSignsFormData
) {
  try {
    // Create consultation
    const consultationId = consultationService.create(consultationData);
    
    // Add vital signs if provided
    if (vitalSignsData) {
      vitalSignsService.create({
        ...vitalSignsData,
        consultId: consultationId
      });
    }
    
    // Add prescription if provided
    if (prescriptionData) {
      prescriptionService.create({
        ...prescriptionData,
        consultId: consultationId
      });
    }
    
    return consultationId;
  } catch (error) {
    console.error('Consultation failed:', error);
    throw error;
  }
}
```