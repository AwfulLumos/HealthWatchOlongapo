import { Request } from 'express';
import { prisma } from '../config/database.js';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';

interface LogAuditEventInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export function getRequestIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0].trim();
    if (first === '::1') return '127.0.0.1';
    if (first.startsWith('::ffff:')) return first.replace('::ffff:', '');
    return first;
  }

  const directIp = req.ip || req.socket?.remoteAddress || undefined;
  if (!directIp) return undefined;
  if (directIp === '::1') return '127.0.0.1';
  if (directIp.startsWith('::ffff:')) return directIp.replace('::ffff:', '');
  return directIp;
}

export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        oldData: input.oldData as any,
        newData: input.newData as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
