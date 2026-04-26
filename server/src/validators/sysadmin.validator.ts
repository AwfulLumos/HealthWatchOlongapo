import { z } from 'zod';

const permissionValueSchema = z.record(z.boolean());

export const updateRbacPolicySchema = z.object({
  body: z.object({
    roleLabels: z.array(z.string().min(1)).min(1),
    permissionRows: z.array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
      })
    ),
    permissions: z.record(permissionValueSchema),
  }),
});

export const updateSecurityControlsSchema = z.object({
  body: z.object({
    controls: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.enum(['Encryption', 'Access', 'Session', 'Policy']),
        enabled: z.boolean(),
      })
    ),
  }),
});

export const auditTrailQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'ALL']).optional(),
  }),
});
