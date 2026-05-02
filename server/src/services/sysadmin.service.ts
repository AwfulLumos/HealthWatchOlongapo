import { prisma } from '../config/database.js';

export interface RbacPermission {
  key: string;
  label: string;
}

export interface RbacPolicy {
  roleLabels: string[];
  permissionRows: RbacPermission[];
  permissions: Record<string, Record<string, boolean>>;
}

export interface SecurityControl {
  id: string;
  title: string;
  description: string;
  category: 'Encryption' | 'Access' | 'Session' | 'Policy';
  enabled: boolean;
}

export interface SecurityEvent {
  id: string;
  event: string;
  severity: 'Low' | 'Medium' | 'High';
  at: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  resource: string;
  status: 'Success' | 'Blocked';
  ipAddress: string;
}

const roleLabelMap: Record<string, string> = {
  Admin: 'System Administrator',
  Employee: 'Public Health Administrator',
};

function formatAuditLogId(rawId: string): string {
  if (rawId.startsWith('AUD-')) return rawId;
  return `AUD-${rawId.slice(-8).toUpperCase()}`;
}

function normalizeIpAddress(ip?: string | null): string {
  if (!ip) return '-';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
}

class SysAdminService {
  private rbacPolicy: RbacPolicy = {
    roleLabels: ['System Administrator', 'Public Health Admin', 'Health Worker'],
    permissionRows: [
      { key: 'viewPatients', label: 'View Patient Records' },
      { key: 'editPatients', label: 'Edit Patient Records' },
      { key: 'manageStaff', label: 'Manage Staff Accounts' },
      { key: 'viewReports', label: 'Access Reports' },
      { key: 'exportData', label: 'Export Sensitive Data' },
      { key: 'manageSystem', label: 'Manage System Settings' },
    ],
    permissions: {
      'System Administrator': {
        viewPatients: true,
        editPatients: true,
        manageStaff: true,
        viewReports: true,
        exportData: true,
        manageSystem: true,
      },
      'Public Health Admin': {
        viewPatients: true,
        editPatients: true,
        manageStaff: false,
        viewReports: true,
        exportData: false,
        manageSystem: false,
      },
      'Health Worker': {
        viewPatients: true,
        editPatients: false,
        manageStaff: false,
        viewReports: false,
        exportData: false,
        manageSystem: false,
      },
    },
  };

  private securityControls: SecurityControl[] = [
    {
      id: 'enc-at-rest',
      title: 'Encrypt Data At Rest',
      description: 'Protect health records in storage with strong encryption.',
      category: 'Encryption',
      enabled: true,
    },
    {
      id: 'enc-in-transit',
      title: 'TLS For API Traffic',
      description: 'Require secure transport for all client-server communication.',
      category: 'Encryption',
      enabled: true,
    },
    {
      id: 'mfa-admin',
      title: 'MFA For Admin Accounts',
      description: 'Require multi-factor authentication for privileged users.',
      category: 'Access',
      enabled: true,
    },
    {
      id: 'session-timeout',
      title: 'Session Auto Timeout',
      description: 'Terminate idle sessions to reduce unauthorized access risk.',
      category: 'Session',
      enabled: true,
    },
    {
      id: 'password-policy',
      title: 'Strong Password Policy',
      description: 'Enforce minimum length and complexity requirements.',
      category: 'Policy',
      enabled: true,
    },
    {
      id: 'download-safeguard',
      title: 'Sensitive Export Confirmation',
      description: 'Require an extra confirmation before data export.',
      category: 'Access',
      enabled: false,
    },
  ];

  private securityEvents: SecurityEvent[] = [
    { id: 'SEC-1108', event: 'Failed admin login attempts', severity: 'Medium', at: '2026-04-26 08:15' },
    { id: 'SEC-1109', event: 'Role policy updated', severity: 'Low', at: '2026-04-26 09:02' },
    { id: 'SEC-1110', event: 'Sensitive report export', severity: 'High', at: '2026-04-26 09:34' },
    { id: 'SEC-1111', event: 'Password reset for staff account', severity: 'Medium', at: '2026-04-26 10:18' },
  ];

  getRbacPolicy(): RbacPolicy {
    return this.rbacPolicy;
  }

  updateRbacPolicy(nextPolicy: RbacPolicy): RbacPolicy {
    this.rbacPolicy = nextPolicy;
    return this.rbacPolicy;
  }

  getSecurityConfiguration(): { controls: SecurityControl[]; events: SecurityEvent[] } {
    return {
      controls: this.securityControls,
      events: this.securityEvents,
    };
  }

  updateSecurityControls(nextControls: SecurityControl[]): { controls: SecurityControl[]; events: SecurityEvent[] } {
    this.securityControls = nextControls;
    return this.getSecurityConfiguration();
  }

  async getAuditTrail(params?: { search?: string; action?: AuditRecord['action'] | 'ALL' }): Promise<AuditRecord[]> {
    const search = params?.search?.trim().toLowerCase();
    const action = params?.action;

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { entityType: { contains: search } },
        { entityId: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const userIds = [...new Set(logs.map((log) => log.userId).filter(Boolean) as string[])];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true, role: true },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    const mapped = logs.map((log): AuditRecord => {
      const actorUser = log.userId ? userMap.get(log.userId) : undefined;
      const newData = (log.newData as Record<string, unknown> | null) || null;
      const createdAt = log.createdAt ?? new Date();

      const resourceFromPayload = typeof newData?.resource === 'string' ? newData.resource : undefined;
      const statusFromPayload = typeof newData?.status === 'string' ? newData.status : undefined;

      const actor = actorUser?.username || 'system';
      const role = actorUser ? roleLabelMap[actorUser.role] || actorUser.role : 'System';
      const resource = resourceFromPayload || `${log.entityType}: ${log.entityId}`;
      const status = statusFromPayload === 'Blocked' ? 'Blocked' : 'Success';

      return {
        id: formatAuditLogId(log.id),
        timestamp: createdAt.toISOString().slice(0, 16).replace('T', ' '),
        actor,
        role,
        action: log.action as AuditRecord['action'],
        resource,
        status,
        ipAddress: normalizeIpAddress(log.ipAddress),
      };
    });

    return mapped.filter((record) => {
      const matchesSearch = !search
        || record.actor.toLowerCase().includes(search)
        || record.resource.toLowerCase().includes(search)
        || record.id.toLowerCase().includes(search);
      const matchesAction = !action || action === 'ALL' || record.action === action;
      return matchesSearch && matchesAction;
    });
  }
}

export const sysAdminService = new SysAdminService();
