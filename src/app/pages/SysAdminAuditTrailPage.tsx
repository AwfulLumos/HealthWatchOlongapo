import { useMemo, useState } from "react";
import { FileClock, Search, Filter } from "lucide-react";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "EXPORT";

interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: AuditAction;
  resource: string;
  status: "Success" | "Blocked";
  ipAddress: string;
}

const auditRecords: AuditRecord[] = [
  {
    id: "AUD-5001",
    timestamp: "2026-04-26 08:14",
    actor: "admin",
    role: "System Administrator",
    action: "UPDATE",
    resource: "Role Permission Policy",
    status: "Success",
    ipAddress: "10.0.2.12",
  },
  {
    id: "AUD-5002",
    timestamp: "2026-04-26 08:48",
    actor: "nurse.cruz",
    role: "Health Worker",
    action: "VIEW",
    resource: "Patient Record: P-10014",
    status: "Success",
    ipAddress: "10.0.3.44",
  },
  {
    id: "AUD-5003",
    timestamp: "2026-04-26 09:02",
    actor: "city.health.admin",
    role: "Public Health Admin",
    action: "EXPORT",
    resource: "Monthly Morbidity Report",
    status: "Blocked",
    ipAddress: "10.0.4.21",
  },
  {
    id: "AUD-5004",
    timestamp: "2026-04-26 09:16",
    actor: "admin",
    role: "System Administrator",
    action: "CREATE",
    resource: "Staff Account: bhw.perez",
    status: "Success",
    ipAddress: "10.0.2.12",
  },
  {
    id: "AUD-5005",
    timestamp: "2026-04-26 09:44",
    actor: "admin",
    role: "System Administrator",
    action: "DELETE",
    resource: "Expired API Token",
    status: "Success",
    ipAddress: "10.0.2.12",
  },
];

const actionColor: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  VIEW: "bg-violet-100 text-violet-700",
  EXPORT: "bg-amber-100 text-amber-700",
};

export function SysAdminAuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "ALL">("ALL");

  const filteredRecords = useMemo(() => {
    return auditRecords.filter((record) => {
      const matchesSearch =
        record.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === "ALL" ? true : record.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [searchTerm, actionFilter]);

  const blockedEvents = filteredRecords.filter((record) => record.status === "Blocked").length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">System Admin - Audit Trail</h1>
        <p className="text-xs sm:text-sm text-gray-500">Track access, data updates, and policy-related activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Log Entries", value: filteredRecords.length },
          { label: "Blocked Events", value: blockedEvents },
          { label: "Monitored Resources", value: "18" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-500 text-xs sm:text-sm">{card.label}</p>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by actor, resource, or log ID"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AuditAction | "ALL")}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="VIEW">VIEW</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-2 text-xs font-semibold text-gray-500">Log ID</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Timestamp</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Actor</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Role</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Action</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Resource</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Status</th>
                <th className="py-2 text-xs font-semibold text-gray-500">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-sm text-gray-700">{record.id}</td>
                  <td className="py-2 text-sm text-gray-600">{record.timestamp}</td>
                  <td className="py-2 text-sm text-gray-800 font-medium">{record.actor}</td>
                  <td className="py-2 text-sm text-gray-600">{record.role}</td>
                  <td className="py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${actionColor[record.action]}`}>
                      {record.action}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-700">{record.resource}</td>
                  <td className="py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        record.status === "Success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-600">{record.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FileClock className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">No audit records found for your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
