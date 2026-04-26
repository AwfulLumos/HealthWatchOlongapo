import { useState } from "react";
import { LockKeyhole, Shield, KeyRound, AlertTriangle, RefreshCw } from "lucide-react";

interface SecurityControl {
  id: string;
  title: string;
  description: string;
  category: "Encryption" | "Access" | "Session" | "Policy";
  enabled: boolean;
}

const initialControls: SecurityControl[] = [
  {
    id: "enc-at-rest",
    title: "Encrypt Data At Rest",
    description: "Protect health records in storage with strong encryption.",
    category: "Encryption",
    enabled: true,
  },
  {
    id: "enc-in-transit",
    title: "TLS For API Traffic",
    description: "Require secure transport for all client-server communication.",
    category: "Encryption",
    enabled: true,
  },
  {
    id: "mfa-admin",
    title: "MFA For Admin Accounts",
    description: "Require multi-factor authentication for privileged users.",
    category: "Access",
    enabled: true,
  },
  {
    id: "session-timeout",
    title: "Session Auto Timeout",
    description: "Terminate idle sessions to reduce unauthorized access risk.",
    category: "Session",
    enabled: true,
  },
  {
    id: "password-policy",
    title: "Strong Password Policy",
    description: "Enforce minimum length and complexity requirements.",
    category: "Policy",
    enabled: true,
  },
  {
    id: "download-safeguard",
    title: "Sensitive Export Confirmation",
    description: "Require an extra confirmation before data export.",
    category: "Access",
    enabled: false,
  },
];

const securityEvents = [
  { id: "SEC-1108", event: "Failed admin login attempts", severity: "Medium", at: "2026-04-26 08:15" },
  { id: "SEC-1109", event: "Role policy updated", severity: "Low", at: "2026-04-26 09:02" },
  { id: "SEC-1110", event: "Sensitive report export", severity: "High", at: "2026-04-26 09:34" },
  { id: "SEC-1111", event: "Password reset for staff account", severity: "Medium", at: "2026-04-26 10:18" },
];

const severityColor: Record<string, string> = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

export function SysAdminSecurityPage() {
  const [controls, setControls] = useState(initialControls);
  const [lastAppliedAt, setLastAppliedAt] = useState<string | null>(null);

  const toggleControl = (id: string) => {
    setControls((prev) => prev.map((control) => (control.id === id ? { ...control, enabled: !control.enabled } : control)));
  };

  const applyConfiguration = () => {
    setLastAppliedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const enabledCount = controls.filter((control) => control.enabled).length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">System Admin - Privacy & Security</h1>
          <p className="text-xs sm:text-sm text-gray-500">Configure safeguards to protect sensitive health data</p>
        </div>
        <button
          onClick={applyConfiguration}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Apply Security Configuration
        </button>
      </div>

      {lastAppliedAt && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
          Security controls applied at {lastAppliedAt}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Controls Enabled", value: `${enabledCount}/${controls.length}`, icon: Shield, color: "bg-emerald-100 text-emerald-700" },
          { label: "Critical Alerts", value: "1", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
          { label: "MFA Coverage", value: "100%", icon: KeyRound, color: "bg-indigo-100 text-indigo-700" },
          { label: "Encryption Status", value: "Active", icon: LockKeyhole, color: "bg-blue-100 text-blue-700" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs sm:text-sm">{item.label}</p>
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Security Controls</h2>
        <div className="space-y-3">
          {controls.map((control) => (
            <div key={control.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{control.title}</p>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{control.category}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{control.description}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={control.enabled}
                  onChange={() => toggleControl(control.id)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {control.enabled ? "Enabled" : "Disabled"}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Recent Security Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="py-2 text-xs font-semibold text-gray-500">Event ID</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Event</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Severity</th>
                <th className="py-2 text-xs font-semibold text-gray-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((event) => (
                <tr key={event.id} className="border-b border-gray-50">
                  <td className="py-2 text-sm text-gray-700">{event.id}</td>
                  <td className="py-2 text-sm text-gray-800 font-medium">{event.event}</td>
                  <td className="py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${severityColor[event.severity] || "bg-gray-100 text-gray-700"}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-600">{event.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
