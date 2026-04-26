import { useState } from "react";
import { ShieldCheck, UserCog, CheckCircle2, XCircle, Save } from "lucide-react";

type SystemRole = "System Administrator" | "Public Health Admin" | "Health Worker";
type PermissionKey = "viewPatients" | "editPatients" | "manageStaff" | "viewReports" | "exportData" | "manageSystem";

interface PermissionRow {
  key: PermissionKey;
  label: string;
}

const roleLabels: SystemRole[] = ["System Administrator", "Public Health Admin", "Health Worker"];

const permissionRows: PermissionRow[] = [
  { key: "viewPatients", label: "View Patient Records" },
  { key: "editPatients", label: "Edit Patient Records" },
  { key: "manageStaff", label: "Manage Staff Accounts" },
  { key: "viewReports", label: "Access Reports" },
  { key: "exportData", label: "Export Sensitive Data" },
  { key: "manageSystem", label: "Manage System Settings" },
];

const initialPermissions: Record<SystemRole, Record<PermissionKey, boolean>> = {
  "System Administrator": {
    viewPatients: true,
    editPatients: true,
    manageStaff: true,
    viewReports: true,
    exportData: true,
    manageSystem: true,
  },
  "Public Health Admin": {
    viewPatients: true,
    editPatients: true,
    manageStaff: true,
    viewReports: true,
    exportData: false,
    manageSystem: false,
  },
  "Health Worker": {
    viewPatients: true,
    editPatients: false,
    manageStaff: false,
    viewReports: false,
    exportData: false,
    manageSystem: false,
  },
};

const assignedUsers = [
  { name: "admin", role: "System Administrator", status: "Active" },
  { name: "city.health.admin", role: "Public Health Admin", status: "Active" },
  { name: "bhw.ramos", role: "Health Worker", status: "Active" },
  { name: "nurse.cruz", role: "Health Worker", status: "Active" },
];

export function SysAdminRbacPage() {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const togglePermission = (role: SystemRole, key: PermissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key],
      },
    }));
  };

  const handleSave = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">System Admin - RBAC</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage role-based access control for users and modules</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
        >
          <Save className="w-4 h-4" /> Save Permission Policy
        </button>
      </div>

      {savedAt && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
          Permission updates saved at {savedAt}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "System Roles", value: 3, icon: UserCog, color: "text-blue-600 bg-blue-100" },
          { label: "Protected Modules", value: 6, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-100" },
          { label: "Active Accounts", value: assignedUsers.length, icon: CheckCircle2, color: "text-indigo-600 bg-indigo-100" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs sm:text-sm">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">Permission Matrix</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Enable or disable access per role</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Module Permission</th>
                {roleLabels.map((role) => (
                  <th key={role} className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionRows.map((permission) => (
                <tr key={permission.key} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{permission.label}</td>
                  {roleLabels.map((role) => {
                    const enabled = permissions[role][permission.key];
                    return (
                      <td key={`${permission.key}-${role}`} className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePermission(role, permission.key)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            enabled
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          aria-label={`${enabled ? "Disable" : "Enable"} ${permission.label} for ${role}`}
                        >
                          {enabled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Role Assignments</h2>
        <div className="space-y-2">
          {assignedUsers.map((entry) => (
            <div key={entry.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-800 font-medium">{entry.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{entry.role}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{entry.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
