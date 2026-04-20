import { z } from 'zod';

// ==================== APPOINTMENT VALIDATORS ====================

const appointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const localDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const numberFromQuery = (fieldName: string, min: number, max?: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          return undefined;
        }
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? value : parsed;
      }
      return value;
    },
    max !== undefined
      ? z
          .number({ invalid_type_error: `${fieldName} must be a number` })
          .int(`${fieldName} must be an integer`)
          .min(min, `${fieldName} must be at least ${min}`)
          .max(max, `${fieldName} must be at most ${max}`)
          .optional()
      : z
          .number({ invalid_type_error: `${fieldName} must be a number` })
          .int(`${fieldName} must be an integer`)
          .min(min, `${fieldName} must be at least ${min}`)
          .optional()
  );

const dateStringSchema = z.string().datetime().or(z.string().regex(isoDateRegex, 'Invalid date format'));
const dateTimeStringSchema = z
  .string()
  .datetime('Invalid date format')
  .or(z.string().regex(localDateTimeRegex, 'Invalid date format'));

const statusQuerySchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      const joined = value.join(',');
      const statuses = joined
        .split(',')
        .map((status) => status.trim())
        .filter(Boolean);
      return statuses.length ? statuses : undefined;
    }

    if (typeof value === 'string') {
      const statuses = value
        .split(',')
        .map((status) => status.trim())
        .filter(Boolean);
      return statuses.length ? statuses : undefined;
    }

    return value;
  },
  z.array(z.enum(appointmentStatuses)).optional()
);

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    staffId: z.string().min(1, 'Staff ID is required'),
    scheduledDate: dateTimeStringSchema,
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
    scheduledDate: dateTimeStringSchema.optional(),
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

export const appointmentListQuerySchema = z.object({
  query: z
    .object({
      page: numberFromQuery('Page', 1),
      limit: numberFromQuery('Limit', 1, 100),
      patientId: z.preprocess(emptyStringToUndefined, z.string().optional()),
      staffId: z.preprocess(emptyStringToUndefined, z.string().optional()),
      status: statusQuerySchema,
      startDate: z.preprocess(emptyStringToUndefined, dateStringSchema.optional()),
      endDate: z.preprocess(emptyStringToUndefined, dateStringSchema.optional()),
    })
    .superRefine((value, ctx) => {
      if (!value.startDate || !value.endDate) {
        return;
      }

      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'],
          message: 'startDate cannot be later than endDate',
        });
      }
    }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type AppointmentListQueryInput = z.infer<typeof appointmentListQuerySchema>['query'];
