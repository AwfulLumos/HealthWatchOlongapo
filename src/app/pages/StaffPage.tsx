import { useState, useEffect, useMemo, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, Eye, Edit2, X, UserPlus } from "lucide-react";
import { useAuth } from "../hooks";
import { staffService } from "../services/staffService";
import { StaffSkeleton } from "../components/skeletons/StaffSkeleton";
import { StatusModal } from "../components/feedback/StatusModal";
import { formatEntityId } from "../utils";

const STAFF_ROLES = ["Doctor", "Nurse", "Midwife", "BHW"] as const;
const ACCOUNT_STATUSES = ["Active", "Inactive"] as const;

type StaffRole = (typeof STAFF_ROLES)[number];
type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
type StaffModalMode = "view" | "add" | "edit";

type StationOption = {
  id: string;
  name: string;
};

type StaffListItem = {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  licenseNumber: string;
  contact: string;
  email: string;
  station: string;
  stationId?: string;
  accountStatus: AccountStatus;
};

type StaffFormState = {
  firstName: string;
  lastName: string;
  role: StaffRole;
  licenseNumber: string;
  contact: string;
  email: string;
  stationId: string;
  accountStatus: AccountStatus;
};

const roleColor: Record<StaffRole, string> = {
  Doctor: "text-blue-600 bg-blue-50 border-blue-200",
  Nurse: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Midwife: "text-amber-600 bg-amber-50 border-amber-200",
  BHW: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

function formatApiError(err: unknown): string {
  const anyErr = err as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    message?: string;
  };

  const message = anyErr.response?.data?.message;
  const errors = anyErr.response?.data?.errors;

  if (typeof message === "string") {
    if (errors && typeof errors === "object") {
      const parts = Object.entries(errors)
        .flatMap(([key, value]) => {
          const msgs = Array.isArray(value) ? value : [];
          if (!msgs.length) return [];
          const cleanedKey = String(key).replace(/^body\./, "");
          return [`${cleanedKey}: ${msgs.join(", ")}`];
        });

      return parts.length ? `${message} (${parts.join(" | ")})` : message;
    }
    return message;
  }

  if (err instanceof Error && err.message) return err.message;
  return "Failed to save staff. Please try again.";
}

function buildStaffForm(staff?: StaffListItem): StaffFormState {
  return {
    firstName: staff?.firstName ?? "",
    lastName: staff?.lastName ?? "",
    role: (staff?.role ?? "Doctor") as StaffRole,
    licenseNumber: staff?.licenseNumber ?? "",
    contact: staff?.contact ?? "",
    email: staff?.email ?? "",
    stationId: staff?.stationId ?? "",
    accountStatus: (staff?.accountStatus ?? "Active") as AccountStatus,
  };
}

function StaffModal({
  staff,
  onClose,
  mode,
  onSave,
  isSaving,
  stations,
}: {
  staff?: StaffListItem;
  onClose: () => void;
  mode: StaffModalMode;
  onSave: (mode: Exclude<StaffModalMode, "view">, staffId: string | undefined, form: StaffFormState) => Promise<boolean>;
  isSaving: boolean;
  stations: StationOption[];
}) {
  const isView = mode === "view";
  const title = mode === "add" ? "Add Staff Member" : mode === "edit" ? "Edit Staff" : "Staff Details";
  const [form, setForm] = useState<StaffFormState>(() => buildStaffForm(staff));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildStaffForm(staff));
    setError(null);
  }, [staff, mode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "view") return;

    const missing: string[] = [];
    if (!form.firstName.trim()) missing.push("First Name");
    if (!form.lastName.trim()) missing.push("Last Name");
    if (!form.role) missing.push("Role");
    if (!form.contact.trim()) missing.push("Contact Number");
    if (!form.email.trim()) missing.push("Email");

    if (missing.length) {
      setError(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setError(null);
    await onSave(mode, staff?.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "view" && staff && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 text-base sm:text-xl font-bold">
                {staff.firstName[0]}{staff.lastName[0]}
              </div>
              <div>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</p>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium ${roleColor[staff.role as keyof typeof roleColor] || "bg-gray-100 text-gray-600"}`}>
                  {staff.role}
                </span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: "Staff ID", value: formatEntityId(staff.id, "STF") },
                { label: "Barangay Station", value: staff.station },
                { label: "License Number", value: staff.licenseNumber },
                { label: "Contact Number", value: staff.contact },
                { label: "Email", value: staff.email },
                { label: "Account Status", value: staff.accountStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 sm:py-2 border-b border-gray-50">
                  <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isView && (
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Role</label>
                  <select
                    value={form.role}
                    onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as StaffRole }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  >
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">License Number</label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(event) => setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Contact Number</label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Barangay Station</label>
                  {stations.length ? (
                    <select
                      value={form.stationId}
                      onChange={(event) => setForm((prev) => ({ ...prev, stationId: event.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                    >
                      <option value="">Unassigned</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.stationId}
                      onChange={(event) => setForm((prev) => ({ ...prev, stationId: event.target.value }))}
                      disabled={isSaving}
                      placeholder="Station ID (optional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Account Status</label>
                  <select
                    value={form.accountStatus}
                    onChange={(event) => setForm((prev) => ({ ...prev, accountStatus: event.target.value as AccountStatus }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                  >
                    {ACCOUNT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : mode === "add" ? "Add Staff" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function StaffPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: StaffModalMode; staff?: StaffListItem } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [savingModal, setSavingModal] = useState<{ title: string; message?: string } | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  const isSaving = Boolean(savingModal);

  const stations = useMemo<StationOption[]>(() => {
    const map = new Map<string, string>();
    staff.forEach((member) => {
      if (member.stationId && member.station && member.station !== "N/A") {
        map.set(member.stationId, member.station);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [staff]);

  const fetchStaff = async () => {
    setIsLoading(true);
    console.log("[Staff] Fetching list");
    const data = await staffService.getAll();
    const transformed = data.map((s: any): StaffListItem => {
      const stationName = typeof s.station === "object" ? s.station?.name : s.station;
      const stationId = typeof s.station === "object" ? s.station?.id : s.stationId;

      return {
        id: s?.id ?? "",
        firstName: s?.firstName ?? "",
        lastName: s?.lastName ?? "",
        role: (s?.role ?? "Doctor") as StaffRole,
        licenseNumber: s?.licenseNumber ?? "",
        contact: s?.contact ?? "",
        email: s?.email ?? "",
        station: stationName || "N/A",
        stationId: stationId ?? "",
        accountStatus: (s?.accountStatus ?? "Active") as AccountStatus,
      };
    });
    setStaff(transformed);
    console.log("[Staff] List loaded", { count: transformed.length });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSaveStaff = async (
    mode: Exclude<StaffModalMode, "view">,
    staffId: string | undefined,
    form: StaffFormState
  ) => {
    setErrorModal(null);
    setSuccessModal(null);
    setSavingModal({
      title: mode === "add" ? "Adding staff..." : "Saving changes...",
      message: "Syncing staff data",
    });

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: form.role,
      licenseNumber: form.licenseNumber.trim() || undefined,
      contact: form.contact.trim(),
      email: form.email.trim(),
      stationId: form.stationId || undefined,
      accountStatus: form.accountStatus,
    };

    try {
      if (mode === "add") {
        const created = await staffService.create(payload);
        if (!created) {
          setErrorModal({
            title: "Unable to add staff",
            message: "Failed to create staff. Please check required fields and try again.",
          });
          return false;
        }
      } else {
        if (!staffId) {
          setErrorModal({
            title: "Unable to update staff",
            message: "Missing staff ID. Please refresh the page and try again.",
          });
          return false;
        }

        const updated = await staffService.update(staffId, payload);
        if (!updated) {
          setErrorModal({
            title: "Unable to update staff",
            message: "Failed to update staff. Please check required fields and try again.",
          });
          return false;
        }
      }

      await fetchStaff();
      setModal(null);
      setSuccessModal({
        title: mode === "add" ? "Staff added" : "Staff updated",
        message:
          mode === "add"
            ? "Staff member has been added successfully."
            : "Staff member information has been updated successfully.",
      });
      return true;
    } catch (error) {
      setErrorModal({
        title: mode === "add" ? "Unable to add staff" : "Unable to update staff",
        message: formatApiError(error),
      });
      return false;
    } finally {
      setSavingModal(null);
    }
  };

  const filtered = staff.filter(s =>
    `${s.firstName} ${s.lastName} ${s.id} ${s.role} ${s.station}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <StaffSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isAdmin ? "Manage health center staff and accounts" : "View staff directory across health stations"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" /> Register User
            </button>
            <button
              onClick={() => {
                setSuccessModal(null);
                setErrorModal(null);
                setModal({ mode: "add" });
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-blue-700">
          Read-only access: only System Administrators can create, update, or register staff accounts.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, role, station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm">
          <option>All Roles</option>
          <option>Doctor</option>
          <option>Nurse</option>
          <option>Midwife</option>
          <option>BHW</option>
        </select>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((s, index) => (
          <div 
            key={s.id} 
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-sm sm:text-base font-bold">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div>
                  <p className="text-gray-900 text-sm sm:text-base font-bold">{s.firstName} {s.lastName}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full mt-0.5 text-[0.6rem] sm:text-[0.7rem] font-medium ${roleColor[s.role as keyof typeof roleColor] || "bg-gray-100 text-gray-600"}`}>
                    {s.role}
                  </span>
                </div>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[0.6rem] sm:text-[0.7rem] font-medium ${s.accountStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {s.accountStatus}
              </span>
            </div>
            <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Station: </span>{s.station}
              </p>
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">License: </span>{s.licenseNumber}
              </p>
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Contact: </span>{s.contact}
              </p>
              <p className="text-gray-500 truncate text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Email: </span>{s.email}
              </p>
            </div>
            <div className="flex gap-2 border-t border-gray-50 pt-2 sm:pt-3">
              <button
                onClick={() => setModal({ mode: "view", staff: s })}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors text-[0.65rem] sm:text-xs ${isAdmin ? "flex-1" : "w-full"}`}
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> View
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setSuccessModal(null);
                    setErrorModal(null);
                    setModal({ mode: "edit", staff: s });
                  }}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-teal-600 hover:border-teal-300 rounded-lg transition-colors text-[0.65rem] sm:text-xs"
                >
                  <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <StaffModal
          mode={modal.mode}
          staff={modal.staff}
          onClose={() => setModal(null)}
          onSave={handleSaveStaff}
          isSaving={isSaving}
          stations={stations}
        />
      )}

      {savingModal && (
        <StatusModal
          open={Boolean(savingModal)}
          variant="loading"
          title={savingModal.title}
          message={savingModal.message}
        />
      )}

      {successModal && (
        <StatusModal
          open={Boolean(successModal)}
          variant="success"
          title={successModal.title}
          message={successModal.message}
          onClose={() => setSuccessModal(null)}
        />
      )}

      {errorModal && (
        <StatusModal
          open={Boolean(errorModal)}
          variant="error"
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
          closeLabel="Close"
        />
      )}
    </div>
  );
}
