import { z } from 'zod';

// ==================== STAFF VALIDATORS ====================

const staffRoles = ['Doctor', 'Nurse', 'Midwife', 'BHW'] as const;
const accountStatuses = ['Active', 'Inactive'] as const;

export const createStaffSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(staffRoles),
    licenseNumber: z.string().optional(),
    contact: z.string().min(1, 'Contact is required'),
    email: z.string().email('Invalid email address'),
    stationId: z.string().optional(),
    accountStatus: z.enum(accountStatuses).optional(),
  }),
});

export const updateStaffSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Staff ID is required'),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: z.enum(staffRoles).optional(),
    licenseNumber: z.string().optional(),
    contact: z.string().min(1).optional(),
    email: z.string().email().optional(),
    stationId: z.string().optional(),
    accountStatus: z.enum(accountStatuses).optional(),
  }),
});

export const staffIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Staff ID is required'),
  }),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>['body'];
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>['body'];
