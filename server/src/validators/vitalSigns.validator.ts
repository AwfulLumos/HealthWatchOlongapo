import { z } from 'zod';

// ==================== VITAL SIGNS VALIDATORS ====================

export const createVitalSignsSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    consultId: z.string().optional(),
    date: z.string().datetime().optional(),
    bpSystolic: z.number().int().min(50).max(300),
    bpDiastolic: z.number().int().min(30).max(200),
    pulseRate: z.number().int().min(30).max(250),
    respRate: z.number().int().min(5).max(60),
    temperature: z.number().min(30).max(45),
    bloodSugar: z.number().min(0).max(1000).optional(),
    weight: z.number().min(0.5).max(500),
    height: z.number().min(20).max(300),
  }),
});

export const updateVitalSignsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vital signs ID is required'),
  }),
  body: z.object({
    bpSystolic: z.number().int().min(50).max(300).optional(),
    bpDiastolic: z.number().int().min(30).max(200).optional(),
    pulseRate: z.number().int().min(30).max(250).optional(),
    respRate: z.number().int().min(5).max(60).optional(),
    temperature: z.number().min(30).max(45).optional(),
    bloodSugar: z.number().min(0).max(1000).optional(),
    weight: z.number().min(0.5).max(500).optional(),
    height: z.number().min(20).max(300).optional(),
  }),
});

export const vitalSignsIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vital signs ID is required'),
  }),
});

export type CreateVitalSignsInput = z.infer<typeof createVitalSignsSchema>['body'];
export type UpdateVitalSignsInput = z.infer<typeof updateVitalSignsSchema>['body'];
