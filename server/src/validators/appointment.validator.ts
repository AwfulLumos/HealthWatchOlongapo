import { z } from 'zod';

// ==================== APPOINTMENT VALIDATORS ====================

const appointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    staffId: z.string().min(1, 'Staff ID is required'),
    scheduledDate: z.string().datetime('Invalid date format'),
    purpose: z.string().min(1, 'Purpose is required'),
    status: z.enum(appointmentStatuses).optional(),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required'),
  }),
  body: z.object({
    patientId: z.string().min(1).optional(),
    staffId: z.string().min(1).optional(),
    scheduledDate: z.string().datetime().optional(),
    purpose: z.string().min(1).optional(),
    status: z.enum(appointmentStatuses).optional(),
    notes: z.string().optional(),
  }),
});

export const appointmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required'),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
