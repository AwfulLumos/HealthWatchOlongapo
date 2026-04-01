# HealthWatch Olongapo - Technical Architecture

## System Architecture Overview

HealthWatch Olongapo follows a **Single-Page Application (SPA)** architecture built with React and TypeScript, featuring a component-based design pattern with centralized state management through custom hooks.

## Project Structure

```
HealthWatchOlongapo/
├── src/
│   ├── app/
│   │   ├── models/              # TypeScript interfaces & types
│   │   │   ├── User.ts          # User authentication types
│   │   │   ├── Patient.ts       # Patient data structure
│   │   │   ├── Appointment.ts   # Appointment types
│   │   │   ├── Consultation.ts  # Consultation types
│   │   │   ├── Prescription.ts  # Prescription types
│   │   │   ├── VitalSigns.ts    # Vital signs & BMI calculation
│   │   │   ├── Staff.ts         # Staff member types
│   │   │   ├── Dashboard.ts     # Dashboard data structure
│   │   │   └── index.ts         # Type exports
│   │   │
│   │   ├── services/            # Business logic & data operations
│   │   │   ├── authService.ts   # Authentication & user management
│   │   │   ├── storage.ts       # localStorage wrapper with ID generation
│   │   │   ├── patientService.ts   # Patient CRUD operations
│   │   │   ├── appointmentService.ts  # Appointment management
│   │   │   ├── consultationService.ts # Consultation handling
│   │   │   ├── prescriptionService.ts # Prescription management
│   │   │   ├── vitalSignsService.ts   # Vital signs management
│   │   │   ├── staffService.ts      # Staff management
│   │   │   ├── dashboardService.ts  # Dashboard data aggregation
│   │   │   └── index.ts         # Service exports
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts       # Authentication hook
│   │   │   ├── usePatients.ts   # Patient operations hook
│   │   │   ├── useAppointments.ts # Appointment operations hook
│   │   │   ├── useConsultations.ts # Consultation operations hook
│   │   │   ├── usePrescriptions.ts # Prescription operations hook
│   │   │   ├── useVitalSigns.ts    # Vital signs operations hook
│   │   │   ├── useStaff.ts      # Staff operations hook
│   │   │   ├── useDashboard.ts  # Dashboard data hook
│   │   │   └── index.ts         # Hook exports
│   │   │
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.tsx    # Authentication page
│   │   │   ├── DashboardPage.tsx # Main dashboard
│   │   │   ├── PatientsPage.tsx # Patient management
│   │   │   ├── ConsultationsPage.tsx # Consultation management
│   │   │   ├── AppointmentsPage.tsx  # Appointment scheduling
│   │   │   ├── PrescriptionsPage.tsx # Prescription management
│   │   │   ├── VitalSignsPage.tsx    # Vital signs recording
│   │   │   ├── StaffPage.tsx        # Staff management
│   │   │   └── ReportsPage.tsx      # Reports page
│   │   │
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout.tsx       # Main app layout with sidebar & header
│   │   │   ├── LoadingScreen.tsx # Loading animation on login
│   │   │   ├── LogoutScreen.tsx # Logout animation
│   │   │   └── ui/              # Shadcn/ui component library
│   │   │
│   │   ├── statics/             # Mock/static data
│   │   │   ├── patients.ts      # Mock patient data
│   │   │   ├── appointments.ts  # Mock appointment data
│   │   │   ├── consultations.ts # Mock consultation data
│   │   │   ├── prescriptions.ts # Mock prescription data
│   │   │   ├── vitals.ts        # Mock vital signs data
│   │   │   ├── staff.ts         # Mock staff data
│   │   │   ├── dashboard.ts     # Mock dashboard data & colors
│   │   │   ├── reports.ts       # Mock reports data
│   │   │   └── index.ts         # Static data exports
│   │   │
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.tsx  # Authentication context provider
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   └── index.ts         # Date formatting, validation, helpers
│   │   │
│   │   ├── routes.ts            # Route definitions
│   │   └── App.tsx              # Root app component
│   │
│   ├── styles/                  # CSS & theming
│   │   ├── index.css           # Global styles
│   │   ├── tailwind.css        # Tailwind directives
│   │   ├── theme.css           # Theme variables
│   │   ├── animations.css      # Custom animations
│   │   ├── fonts.css           # Font definitions
│   │   └── Images/             # Logo & images
│   │
│   └── main.tsx                # React entry point
│
├── index.html                  # HTML entry point
├── package.json               # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── tailwind.config.js        # Tailwind configuration
```

## Core Architecture Patterns

### 1. Service-Hook Pattern

**Services** (`/services`) handle all business logic and data operations:
- Pure TypeScript functions
- CRUD operations for each entity
- localStorage integration
- Data validation and transformation

**Hooks** (`/hooks`) provide React integration for services:
- Custom hooks wrap service functions
- Manage component state and side effects
- Provide reactive data updates
- Handle loading states and error handling

### 2. Component Architecture

**Page Components** (`/pages`):
- Top-level route components
- Compose multiple smaller components
- Manage page-specific state
- Handle user interactions and form submissions

**Reusable Components** (`/components`):
- Shared UI components
- Layout components (Header, Sidebar, etc.)
- UI library components (Shadcn/ui)

### 3. Data Flow Architecture

```
User Interaction → Page Component → Custom Hook → Service → localStorage
                                ↓
                          State Update → Component Re-render
```

## Data Models & Type System

### Core Entity Models

**User & Authentication:**
```typescript
type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Midwife' | 'BHW'

interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  staffId?: string;
  accountStatus: 'Active' | 'Inactive';
  lastLogin?: string;
}
```

**Patient:**
```typescript
interface Patient {
  id: string;                        // P-0001, P-0002, etc.
  firstName: string;
  lastName: string;
  dob: string;                       // Date of birth
  gender: 'Male' | 'Female';
  bloodType: string;                 // O+, A-, B+, etc.
  barangay: string;                  // Neighborhood/area
  contact: string;                   // Phone number
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  philhealth: string;                // Insurance ID
  status: 'Active' | 'Inactive';
  registered: string;                // Registration date
  medicalHistory?: MedicalCondition[];
}
```

**Appointment:**
```typescript
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'

interface Appointment {
  id: string;                        // A-0001, A-0002, etc.
  patient: string;                   // Patient name
  patientId: string;
  staff: string;                     // Staff/doctor name
  staffId?: string;
  scheduledDate: string;             // ISO datetime
  purpose: string;                   // Reason for appointment
  status: AppointmentStatus;
  notes?: string;
}
```

**Consultation:**
```typescript
type ConsultationType = 'Regular' | 'Follow-up' | 'Emergency'
type ConsultationStatus = 'Completed' | 'In Progress' | 'Referred'

interface Consultation {
  id: string;                        // C-0001, C-0002, etc.
  patient: string;
  patientId: string;
  staff: string;
  staffId?: string;
  date: string;                      // ISO date
  chiefComplaint: string;            // Main complaint
  symptoms: string;                  // Detailed symptoms
  diagnosis: string;                 // Medical diagnosis
  icdCode: string;                   // ICD-10 code
  type: ConsultationType;
  status: ConsultationStatus;
  notes?: string;
}
```

## Data Storage Architecture

### localStorage Management

**Storage Service** (`storage.ts`):
```typescript
class StorageService {
  private prefix = 'healthwatch_';
  
  // Generic storage operations
  get<T>(key: string): T[]
  set<T>(key: string, data: T[]): void
  clear(key: string): void
  
  // ID generation for entities
  generateId(prefix: string): string  // Returns P-0001, A-0001, etc.
}
```

**Storage Keys:**
- `healthwatch_patients` - Patient records
- `healthwatch_appointments` - Appointment data
- `healthwatch_consultations` - Consultation records
- `healthwatch_prescriptions` - Prescription data
- `healthwatch_vitals` - Vital signs measurements
- `healthwatch_staff` - Staff member data
- `healthwatch_auth` - Authentication state
- `healthwatch_users` - User accounts

### CRUD Pattern Implementation

All services follow a consistent CRUD pattern:

```typescript
interface CRUDService<T> {
  // Read operations
  getAll(): T[]
  getById(id: string): T | undefined
  search(query: string): T[]
  
  // Create
  create(data: Omit<T, 'id'>): string  // Returns generated ID
  
  // Update
  update(id: string, data: Partial<T>): boolean
  
  // Delete
  delete(id: string): boolean
  
  // Utility
  getCount(): number
}
```

## Routing Architecture

**Route Configuration** (`routes.ts`):
```typescript
export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,  // Public route
  },
  {
    path: "/",
    Component: Layout,     // Protected routes wrapper
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "patients", Component: PatientsPage },
      { path: "consultations", Component: ConsultationsPage },
      { path: "appointments", Component: AppointmentsPage },
      { path: "prescriptions", Component: PrescriptionsPage },
      { path: "vital-signs", Component: VitalSignsPage },
      { path: "staff", Component: StaffPage },
      { path: "reports", Component: ReportsPage },
    ],
  },
]);
```

## State Management Strategy

### Authentication Context

**AuthContext** provides global authentication state:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
```

### Custom Hooks Pattern

Each entity has a corresponding hook that provides:
- **State Management** - Loading, error, and data states
- **CRUD Operations** - Create, read, update, delete functions
- **Search & Filter** - Query and filter operations
- **Reactive Updates** - Automatic re-rendering on data changes

Example hook structure:
```typescript
export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations
  const refresh = useCallback(() => { /* ... */ }, []);
  const create = useCallback((data: PatientFormData) => { /* ... */ }, []);
  const update = useCallback((id: string, data: Partial<Patient>) => { /* ... */ }, []);
  const remove = useCallback((id: string) => { /* ... */ }, []);
  
  // Query operations
  const getById = useCallback((id: string) => { /* ... */ }, []);
  const search = useCallback((query: string) => { /* ... */ }, []);
  const getByBarangay = useCallback((barangay: string) => { /* ... */ }, []);

  return {
    patients,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    getById,
    search,
    getByBarangay,
    getCount: () => patientService.getCount()
  };
}
```

## Build System & Development

### Vite Configuration

**Development Features:**
- Hot Module Replacement (HMR)
- TypeScript compilation
- CSS preprocessing
- Asset optimization
- Development server with proxy support

**Production Build:**
- Tree shaking for smaller bundles
- Code splitting for lazy loading
- Asset optimization and compression
- TypeScript type checking

### TypeScript Configuration

**Strict Mode Enabled:**
- Type checking for all files
- No implicit any types
- Strict null checks
- Path aliases for cleaner imports

## Performance Considerations

### Data Management
- **Lazy Loading** - Data loaded only when needed
- **Memoization** - Expensive calculations cached with useMemo
- **Debounced Search** - Search operations throttled to prevent excessive calls

### Component Optimization
- **React.memo** - Prevent unnecessary re-renders
- **useCallback** - Stable function references
- **Virtual Scrolling** - For large data lists (future enhancement)

### Bundle Optimization
- **Code Splitting** - Route-based lazy loading
- **Tree Shaking** - Remove unused dependencies
- **Asset Optimization** - Image and CSS optimization