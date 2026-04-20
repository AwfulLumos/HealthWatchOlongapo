import { z } from 'zod';

// ==================== CONSULTATION VALIDATORS ====================

const consultationTypes = ['Regular', 'FollowUp', 'Emergency'] as const;
const consultationStatuses = ['InProgress', 'Completed', 'Referred'] as const;

export const createConsultationSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    staffId: z.string().min(1, 'Staff ID is required').optional(),
    date: z.string().datetime().optional(),
    chiefComplaint: z.string().min(1, 'Chief complaint is required'),
    symptoms: z.string().min(1, 'Symptoms are required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    icdCode: z.string().optional(),
    type: z.enum(consultationTypes).optional(),
    status: z.enum(consultationStatuses).optional(),
    notes: z.string().optional(),
  }),
});

export const updateConsultationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Consultation ID is required'),
  }),
  body: z.object({
    chiefComplaint: z.string().min(1).optional(),
    symptoms: z.string().min(1).optional(),
    diagnosis: z.string().min(1).optional(),
    icdCode: z.string().optional(),
    type: z.enum(consultationTypes).optional(),
    status: z.enum(consultationStatuses).optional(),
    notes: z.string().optional(),
  }),
});

export const consultationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Consultation ID is required'),
  }),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>['body'];
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>['body'];
