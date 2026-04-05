import { z } from 'zod';

// ==================== PATIENT VALIDATORS ====================

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const genders = ['Male', 'Female'] as const;
const civilStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'] as const;
const patientStatuses = ['Active', 'Inactive'] as const;

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.enum(genders),
    bloodType: z.enum(bloodTypes).optional(),
    civilStatus: z.enum(civilStatuses).optional(),
    contact: z.string().min(1, 'Contact number is required'),
    address: z.string().min(1, 'Address is required'),
    emergencyContact: z.string().min(1, 'Emergency contact is required'),
    emergencyContactNumber: z.string().min(1, 'Emergency contact number is required'),
    philhealth: z.string().optional(),
    barangayId: z.string().optional(),
    status: z.enum(patientStatuses).optional(),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dob: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    gender: z.enum(genders).optional(),
    bloodType: z.enum(bloodTypes).optional(),
    civilStatus: z.enum(civilStatuses).optional(),
    contact: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    emergencyContact: z.string().min(1).optional(),
    emergencyContactNumber: z.string().min(1).optional(),
    philhealth: z.string().optional(),
    barangayId: z.string().optional(),
    status: z.enum(patientStatuses).optional(),
  }),
});

export const patientIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>['body'];
