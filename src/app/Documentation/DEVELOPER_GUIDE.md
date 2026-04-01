# HealthWatch Olongapo - Developer Guide

## Development Environment Setup

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (included with Node.js)
- **Git** (for version control)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Code Editor** (VS Code recommended)

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd HealthWatchOlongapo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

### Development Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Development | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Create production build in `dist/` |
| Preview | `npm run preview` | Preview production build locally |
| Type Check | `npx tsc --noEmit` | Check TypeScript types without building |

## Project Architecture

### Folder Structure Conventions

```
src/app/
├── models/          # TypeScript interfaces and types
├── services/        # Business logic and data operations  
├── hooks/           # Custom React hooks
├── pages/           # Page components (routes)
├── components/      # Reusable UI components
├── statics/         # Mock data and constants
├── context/         # React Context providers
├── utils/           # Utility functions
└── routes.ts        # Route configuration
```

### Naming Conventions

**Files and Folders:**
- **Components**: PascalCase (e.g., `PatientList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePatients.ts`)
- **Services**: camelCase with Service suffix (e.g., `patientService.ts`)
- **Types/Models**: PascalCase (e.g., `Patient.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)

**Code Conventions:**
- **Interfaces**: PascalCase (e.g., `interface Patient`)
- **Types**: PascalCase (e.g., `type UserRole`)
- **Functions**: camelCase (e.g., `function getPatients()`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `const API_BASE_URL`)

## Core Development Patterns

### 1. Service Layer Pattern

Services handle all business logic and data operations:

```typescript
// Example: patientService.ts
import { storage } from './storage';
import { Patient, PatientFormData } from '../models';

class PatientService {
  private storageKey = 'patients';

  getAll(): Patient[] {
    return storage.get<Patient>(this.storageKey);
  }

  getById(id: string): Patient | undefined {
    return this.getAll().find(p => p.id === id);
  }

  create(data: PatientFormData): string {
    const patients = this.getAll();
    const id = storage.generateId('P');
    const patient: Patient = {
      ...data,
      id,
      registered: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    patients.push(patient);
    storage.set(this.storageKey, patients);
    return id;
  }

  update(id: string, data: Partial<Patient>): boolean {
    const patients = this.getAll();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    patients[index] = { ...patients[index], ...data };
    storage.set(this.storageKey, patients);
    return true;
  }

  delete(id: string): boolean {
    const patients = this.getAll();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length === patients.length) return false;
    
    storage.set(this.storageKey, filtered);
    return true;
  }

  // Domain-specific methods
  search(query: string): Patient[] {
    const patients = this.getAll();
    const q = query.toLowerCase();
    return patients.filter(p =>
      `${p.firstName} ${p.lastName} ${p.id}`.toLowerCase().includes(q)
    );
  }

  getByBarangay(barangay: string): Patient[] {
    return this.getAll().filter(p => p.barangay === barangay);
  }
}

export const patientService = new PatientService();
```

### 2. Custom Hooks Pattern

Hooks provide React integration for services:

```typescript
// Example: usePatients.ts
import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services';
import { Patient, PatientFormData } from '../models';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setLoading(true);
      const data = patientService.getAll();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data: PatientFormData) => {
    try {
      setLoading(true);
      const id = patientService.create(data);
      refresh();
      return id;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create patient';
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Patient>) => {
    try {
      setLoading(true);
      const success = patientService.update(id, data);
      if (success) {
        refresh();
      } else {
        throw new Error('Patient not found');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update patient';
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const success = patientService.delete(id);
      if (success) {
        refresh();
      } else {
        throw new Error('Patient not found');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete patient';
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  // Computed values and additional methods
  const getById = useCallback((id: string) => {
    return patientService.getById(id);
  }, []);

  const search = useCallback((query: string) => {
    return patientService.search(query);
  }, []);

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
    getCount: () => patientService.getCount(),
    getActiveCount: () => patientService.getActiveCount()
  };
}
```

### 3. Component Development Pattern

Page components should be organized and follow consistent patterns:

```typescript
// Example: PatientsPage.tsx
import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { usePatients } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Patient, PatientFormData } from '../models';

export function PatientsPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Hooks
  const {
    patients,
    loading,
    error,
    create,
    update,
    remove
  } = usePatients();

  // Computed values
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = `${patient.firstName} ${patient.lastName} ${patient.id}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesBarangay = !selectedBarangay || patient.barangay === selectedBarangay;
      return matchesSearch && matchesBarangay;
    });
  }, [patients, searchQuery, selectedBarangay]);

  const uniqueBarangays = useMemo(() => {
    return Array.from(new Set(patients.map(p => p.barangay))).sort();
  }, [patients]);

  // Event handlers
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await remove(id);
      } catch (error) {
        alert('Failed to delete patient');
      }
    }
  };

  const handleSubmit = async (data: PatientFormData) => {
    try {
      if (modalMode === 'add') {
        await create(data);
      } else if (modalMode === 'edit' && selectedPatient) {
        await update(selectedPatient.id, data);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(`Failed to ${modalMode} patient`);
    }
  };

  // Render methods
  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <select
        value={selectedBarangay}
        onChange={(e) => setSelectedBarangay(e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Barangays</option>
        {uniqueBarangays.map(barangay => (
          <option key={barangay} value={barangay}>{barangay}</option>
        ))}
      </select>
      <Button onClick={handleAddPatient} className="whitespace-nowrap">
        <Plus className="h-4 w-4 mr-2" />
        Add Patient
      </Button>
    </div>
  );

  const renderPatientTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Patient ID', 'Name', 'Date of Birth', 'Gender', 'Blood Type', 'Barangay', 'Contact', 'Status', 'Actions'].map(header => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {patient.firstName} {patient.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.dob}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.gender}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.bloodType}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.barangay}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.contact}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePatient(patient.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Loading and error states
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  // Main render
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredPatients.length} patients
        </div>
      </div>

      {renderFilters()}
      {renderPatientTable()}

      {/* Modal Component */}
      {isModalOpen && (
        <PatientModal
          mode={modalMode}
          patient={selectedPatient}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
```

## TypeScript Development

### Model Definition

Create strongly typed interfaces for all data entities:

```typescript
// models/Patient.ts
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female';
  bloodType: string;
  barangay: string;
  contact: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  philhealth: string;
  status: 'Active' | 'Inactive';
  registered: string;
  medicalHistory?: MedicalCondition[];
}

export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export type PatientFormData = Omit<Patient, 'id' | 'registered' | 'status'>;

// Utility types
export type PatientStatus = Patient['status'];
export type PatientGender = Patient['gender'];
```

### Service Type Safety

Ensure all services are properly typed:

```typescript
// services/patientService.ts
import { Patient, PatientFormData, MedicalCondition } from '../models';

interface PatientServiceInterface {
  getAll(): Patient[];
  getById(id: string): Patient | undefined;
  create(data: PatientFormData): string;
  update(id: string, data: Partial<Patient>): boolean;
  delete(id: string): boolean;
  search(query: string): Patient[];
  getByBarangay(barangay: string): Patient[];
  getCount(): number;
  getActiveCount(): number;
  addMedicalCondition(patientId: string, condition: MedicalCondition): boolean;
}

class PatientService implements PatientServiceInterface {
  // Implementation...
}
```

## Testing Guidelines

### Component Testing

```typescript
// __tests__/PatientList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientList } from '../components/PatientList';
import { mockPatients } from '../__mocks__/patients';

describe('PatientList', () => {
  it('renders patient list correctly', () => {
    render(<PatientList patients={mockPatients} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('P-0001')).toBeInTheDocument();
  });

  it('filters patients by search query', () => {
    render(<PatientList patients={mockPatients} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});
```

### Service Testing

```typescript
// __tests__/patientService.test.ts
import { patientService } from '../services/patientService';
import { mockPatients } from '../__mocks__/patients';

describe('PatientService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('creates a new patient', () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1990-01-01',
      gender: 'Male' as const,
      // ... other required fields
    };

    const id = patientService.create(patientData);
    expect(id).toMatch(/^P-\d{4}$/);
    
    const patient = patientService.getById(id);
    expect(patient).toBeDefined();
    expect(patient!.firstName).toBe('John');
  });
});
```

## State Management Best Practices

### Hook Dependencies

Use proper dependency arrays in hooks:

```typescript
// Good: Stable dependencies
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Good: Callback with dependencies
const handleSubmit = useCallback((formData: FormData) => {
  submitData(formData);
}, [submitData]);

// Bad: Missing dependencies (eslint-disable is rarely correct)
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency
```

### State Organization

Organize component state logically:

```typescript
function MyComponent() {
  // Group related state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data state (prefer custom hooks)
  const { patients, createPatient, updatePatient } = usePatients();
}
```

## Performance Optimization

### Memoization

Use React.memo for components that render frequently:

```typescript
interface PatientRowProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export const PatientRow = React.memo<PatientRowProps>(({ patient, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{patient.id}</td>
      <td>{patient.firstName} {patient.lastName}</td>
      {/* ... */}
    </tr>
  );
});
```

### Virtual Scrolling for Large Lists

For tables with many rows, consider virtual scrolling:

```typescript
import { FixedSizeList as List } from 'react-window';

function VirtualizedPatientList({ patients }: { patients: Patient[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PatientRow patient={patients[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={patients.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
}
```

## Error Handling

### Service Error Handling

Implement consistent error handling in services:

```typescript
class PatientService {
  create(data: PatientFormData): string {
    try {
      // Validate input
      if (!data.firstName || !data.lastName) {
        throw new Error('First name and last name are required');
      }

      // Business logic
      const patients = this.getAll();
      const id = storage.generateId('P');
      
      // Validate business rules
      if (patients.some(p => p.contact === data.contact)) {
        throw new Error('A patient with this contact number already exists');
      }

      // Create patient
      const patient: Patient = {
        ...data,
        id,
        registered: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      
      patients.push(patient);
      storage.set(this.storageKey, patients);
      
      return id;
    } catch (error) {
      console.error('PatientService.create error:', error);
      throw error;
    }
  }
}
```

### Component Error Boundaries

Create error boundaries for robust error handling:

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Build and Deployment

### Environment Configuration

Create environment-specific configurations:

```typescript
// config/environment.ts
interface Config {
  isDevelopment: boolean;
  isProduction: boolean;
  storagePrefix: string;
  enableDebugLogs: boolean;
}

const config: Config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  storagePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'healthwatch_',
  enableDebugLogs: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV,
};

export default config;
```

### Production Build Optimization

Configure Vite for optimal production builds:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

## Code Style and Linting

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Contributing Guidelines

### Git Workflow

1. **Feature Branches**: Create feature branches from `main`
2. **Commit Messages**: Use conventional commit format
3. **Pull Requests**: All changes must go through PR review
4. **Testing**: Ensure all tests pass before merging

### Commit Message Format

```
feat: add patient search functionality
fix: resolve appointment scheduling bug
docs: update API documentation
refactor: simplify patient service logic
```

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] All functions are properly typed
- [ ] Components are properly memoized if needed
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Accessibility guidelines are followed