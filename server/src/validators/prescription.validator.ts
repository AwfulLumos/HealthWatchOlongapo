import { z } from 'zod';

// ==================== PRESCRIPTION VALIDATORS ====================

export const createPrescriptionSchema = z.object({
  body: z.object({
    consultId: z.string().min(1, 'Consultation ID is required'),
    patientId: z.string().min(1, 'Patient ID is required'),
    doctorId: z.string().min(1, 'Doctor ID is required'),
    date: z.string().datetime().optional(),
    medicine: z.string().min(1, 'Medicine name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional(),
  }),
});

export const updatePrescriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
  }),
  body: z.object({
    medicine: z.string().min(1).optional(),
    dosage: z.string().min(1).optional(),
    frequency: z.string().min(1).optional(),
    duration: z.string().min(1).optional(),
    instructions: z.string().optional(),
  }),
});

export const prescriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
  }),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>['body'];
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>['body'];
