export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';

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

export interface SecurityConfiguration {
  controls: SecurityControl[];
  events: SecurityEvent[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: AuditAction;
  resource: string;
  status: 'Success' | 'Blocked';
  ipAddress: string;
}
