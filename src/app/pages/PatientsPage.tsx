import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Heart,
  MapPin,
  Phone,
  UserCheck,
  AlertCircle,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { patientService } from "../services/patientService";
import { barangayService } from "../services";
import { OLONGAPO_BARANGAYS } from "../constants";
import type { Patient } from "../models";
import { PatientsSkeleton } from "../components/skeletons/PatientsSkeleton";
import { StatusModal } from "../components/feedback/StatusModal";
import { formatEntityId } from "../utils";

type PatientModalMode = "view" | "add" | "edit";

const BLOOD_TYPES = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const GENDERS = ["", "Male", "Female"] as const;
const CIVIL_STATUSES = ["", "Single", "Married", "Widowed", "Divorced", "Separated"] as const;
const PATIENT_QUERY_LIMIT = 100;
const PATIENT_MAX_PAGES = 20;

function formatApiError(err: unknown): string {
  const anyErr = err as any;
  const message = anyErr?.response?.data?.message;
  const errors = anyErr?.response?.data?.errors;

  if (typeof message === 'string') {
    if (errors && typeof errors === 'object') {
      const parts = Object.entries(errors)
        .flatMap(([key, value]) => {
          const msgs = Array.isArray(value) ? value : [];
          if (!msgs.length) return [];
          const cleanedKey = String(key).replace(/^body\./, '');
          return [`${cleanedKey}: ${msgs.join(', ')}`];
        });

      return parts.length ? `${message} (${parts.join(' • ')})` : message;
    }
    return message;
  }

  if (err instanceof Error && err.message) return err.message;
  return 'Failed to save patient. Please try again.';
}

function normalizePatientApi(p: any): Patient {
  const barangayName = typeof p?.barangay === 'object' ? p?.barangay?.name : p?.barangay;
  return {
    id: p?.id ?? "",
    firstName: p?.firstName ?? "",
    lastName: p?.lastName ?? "",
    dob: (p?.dob ?? "") as string,
    gender: (p?.gender ?? "") as any,
    bloodType: p?.bloodType ?? "",
    civilStatus: p?.civilStatus ?? "",
    barangay: barangayName ?? "N/A",
    contact: p?.contact ?? "",
    address: p?.address ?? "",
    emergencyContact: p?.emergencyContact ?? "N/A",
    emergencyContactNumber: p?.emergencyContactNumber ?? "",
    philhealth: p?.philhealth ?? "",
    status: (p?.status ?? "Active") as any,
    registered: p?.registered ?? p?.createdAt ?? "",
    medicalHistory: p?.medicalHistory,
  };
}

function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

function calcAge(dob: string | undefined): string {
  if (!dob) return "—";
  try {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    const age = m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? years - 1 : years;
    return age >= 0 ? `${age}y` : "—";
  } catch {
    return "—";
  }
}

function PatientModal(
  {
    patient,
    onClose,
    mode,
    onSave,
    onDelete,
  }: {
    patient?: Patient | null;
    onClose: () => void;
    mode: PatientModalMode;
    onSave: (mode: PatientModalMode, form: Patient) => Promise<boolean>;
    onDelete?: (patient: Patient) => void;
  }
) {
  const navigate = useNavigate();
  const isView = mode === "view";
  const title =
    mode === "add" ? "Register New Patient" : mode === "edit" ? "Edit Patient Record" : "Patient Clinical Overview";

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [barangays, setBarangays] = useState<Array<{ id: string; name: string }>>(() =>
    OLONGAPO_BARANGAYS.map((name, i) => ({ id: String(i), name }))
  );

  const buildForm = (): Patient => ({
    id: patient?.id ?? "",
    firstName: patient?.firstName ?? "",
    lastName: patient?.lastName ?? "",
    dob: toDateInputValue(patient?.dob),
    gender: ((patient?.gender ?? "") as any),
    bloodType: patient?.bloodType ?? "",
    civilStatus: patient?.civilStatus ?? "",
    barangay: patient?.barangay ?? "",
    contact: patient?.contact ?? "",
    address: patient?.address ?? "",
    emergencyContact: patient?.emergencyContact ?? "N/A",
    emergencyContactNumber: patient?.emergencyContactNumber ?? "",
    philhealth: patient?.philhealth ?? "",
    status: patient?.status ?? "Active",
    registered: patient?.registered ?? "",
    medicalHistory: patient?.medicalHistory,
  });

  const [form, setForm] = useState<Patient>(() => buildForm());

  useEffect(() => {
    setForm(buildForm());
    setIsSaving(false);
    setSaveError(null);
  }, [patient, mode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isView) return;
      try {
        const list = await barangayService.getAll();
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          const apiMap = new Map(list.map((b) => [b.name.trim().toLowerCase(), b.id]));
          // Merge API barangays while guaranteeing all 17 official Olongapo barangays
          const mergedNames = new Set<string>(OLONGAPO_BARANGAYS);
          list.forEach((b) => {
            if (b.name) mergedNames.add(b.name.trim());
          });
          const merged = Array.from(mergedNames)
            .sort((a, b) => a.localeCompare(b))
            .map((name, i) => ({
              id: apiMap.get(name.toLowerCase()) || String(i),
              name,
            }));
          setBarangays(merged);
        }
      } catch {
        // Defaults to all 17 official barangays
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isView]);

  const barangayOptions = useMemo(() => {
    const set = new Set<string>(OLONGAPO_BARANGAYS);
    barangays.forEach((b) => {
      if (b.name) set.add(b.name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [barangays]);

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!form.firstName?.trim()) missing.push('First Name');
    if (!form.lastName?.trim()) missing.push('Last Name');
    if (!form.dob?.trim()) missing.push('Date of Birth');
    if (!form.gender) missing.push('Gender');
    if (!form.contact?.trim()) missing.push('Contact Number');
    if (!form.address?.trim()) missing.push('Address');
    if (!form.emergencyContactNumber?.trim()) missing.push('Emergency Contact No.');

    if (missing.length) {
      setSaveError(`Please fill required fields: ${missing.join(', ')}`);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const ok = await onSave(mode, {
        ...form,
        emergencyContact: form.emergencyContact?.trim() ? form.emergencyContact : "N/A",
      });
      setIsSaving(false);
      if (ok) onClose();
      else setSaveError("Failed to save patient. Check required fields and session.");
    } catch (e) {
      setIsSaving(false);
      setSaveError(formatApiError(e));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scale-in border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-slate-900 font-bold text-base sm:text-lg">{title}</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {isView ? "Viewing registered clinical record" : "Ensure all statutory demographic fields are accurate"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Section: Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Personal Information
              </h3>
              {!isView && <span className="text-[11px] text-slate-400">* Required fields</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  First Name {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.firstName || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Maria"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Last Name {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.lastName || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Santos"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Date of Birth {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.dob || "—"} {form.dob && `(${calcAge(form.dob)})`}
                  </p>
                ) : (
                  <input
                    type="date"
                    value={toDateInputValue(form.dob)}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Gender {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.gender || "—"}
                  </p>
                ) : (
                  <select
                    value={form.gender || ""}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g || "Select gender"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Blood Type</label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.bloodType || "—"}
                  </p>
                ) : (
                  <select
                    value={form.bloodType || ""}
                    onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt || "Select blood type (optional)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Civil Status</label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.civilStatus || "—"}
                  </p>
                ) : (
                  <select
                    value={(form.civilStatus as any) || ""}
                    onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  >
                    {CIVIL_STATUSES.map((cs) => (
                      <option key={cs} value={cs}>
                        {cs || "Select civil status"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section: Contact & Location */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Contact & Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Contact Number {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.contact || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="0917-123-4567"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Barangay (Olongapo City) {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.barangay || "—"}
                  </p>
                ) : (
                  <select
                    value={form.barangay || ""}
                    onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  >
                    <option value="">
                      Select Barangay ({OLONGAPO_BARANGAYS.length} Barangays)
                    </option>
                    {barangayOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Street Address {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.address || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="House / Unit No., Street, Purok"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section: Health & Emergency Contact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Emergency Contact & PhilHealth
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Emergency Contact Number {!isView && <span className="text-rose-500">*</span>}
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.emergencyContactNumber || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="0918-765-4321"
                    value={form.emergencyContactNumber}
                    onChange={(e) => setForm({ ...form, emergencyContactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  PhilHealth Identification No. (PIN)
                </label>
                {isView ? (
                  <p className="text-slate-900 font-semibold py-2 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                    {form.philhealth || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    placeholder="XX-XXXXXXXXX-X"
                    value={form.philhealth}
                    onChange={(e) => setForm({ ...form, philhealth: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
                    disabled={isSaving}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {!isView && saveError && (
          <div className="px-5 sm:px-6 pb-2">
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-wrap gap-2.5 justify-between items-center bg-slate-50/60 rounded-b-2xl">
          {isView && patient?.id ? (
            <button
              onClick={() => {
                onClose();
                navigate(`/patients/${patient.id}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs sm:text-sm font-semibold border border-sky-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Clinical Profile
            </button>
          ) : mode === "edit" && patient?.id && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(patient);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Record
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-xs sm:text-sm font-medium"
              disabled={isSaving}
            >
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView && (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm font-bold flex items-center gap-2 active:scale-95 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : mode === "add" ? "Register Patient" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isSaving && (
        <StatusModal
          open={isSaving}
          variant="loading"
          title="Syncing Patient Record..."
          message="Validating demographic data"
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({
  patient,
  isOpen,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: {
  patient: Patient | null;
  isOpen: boolean;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen || !patient) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-7 max-w-md w-full animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-rose-500/20">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 text-center mb-1.5">
          Delete Patient Record?
        </h3>

        <p className="text-slate-500 text-xs sm:text-sm text-center mb-4 leading-relaxed">
          Are you sure you want to permanently delete the clinical record for{" "}
          <span className="font-bold text-slate-800">
            {patient.firstName} {patient.lastName}
          </span>{" "}
          (<span className="font-mono text-sky-600 font-semibold">{formatEntityId(patient.id, "PAT")}</span>)?
          This action cannot be undone.
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2.5 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All Barangays");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; patient?: Patient } | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; message?: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const pageSize = 10;

  const fetchPatients = async () => {
    setIsLoading(true);
    const all: any[] = [];

    for (let page = 1; page <= PATIENT_MAX_PAGES; page++) {
      const chunk = await patientService.getAll({ page, limit: PATIENT_QUERY_LIMIT });
      all.push(...chunk);
      if (chunk.length < PATIENT_QUERY_LIMIT) break;
    }

    const normalized = all.map((p: any) => normalizePatientApi(p));
    setPatients(normalized);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSavePatient = async (mode: PatientModalMode, form: Patient): Promise<boolean> => {
    if (mode === 'add') {
      const created = await patientService.create({
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender,
        bloodType: form.bloodType,
        civilStatus: form.civilStatus,
        barangay: form.barangay,
        contact: form.contact,
        address: form.address,
        emergencyContact: form.emergencyContact,
        emergencyContactNumber: form.emergencyContactNumber,
        philhealth: form.philhealth,
        status: form.status,
      } as any);

      const normalized = normalizePatientApi(created as any);
      setPatients((prev) => [normalized, ...prev]);
      const createdLabel = `${normalized.firstName} ${normalized.lastName}`.trim() || normalized.id || "Patient";
      setSuccessModal({
        title: "Patient Registered",
        message: `${createdLabel} has been successfully added to the city registry.`,
      });
      return true;
    }

    if (mode === 'edit' && form.id) {
      const updated = await patientService.update(form.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender,
        bloodType: form.bloodType,
        civilStatus: form.civilStatus,
        barangay: form.barangay,
        contact: form.contact,
        address: form.address,
        emergencyContact: form.emergencyContact,
        emergencyContactNumber: form.emergencyContactNumber,
        philhealth: form.philhealth,
        status: form.status,
      } as any);

      const normalized = normalizePatientApi(updated as any);
      setPatients((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
      const updatedLabel = `${normalized.firstName} ${normalized.lastName}`.trim() || normalized.id || "Patient";
      setSuccessModal({
        title: "Patient Record Updated",
        message: `${updatedLabel}'s records have been updated successfully.`,
      });
      return true;
    }

    return false;
  };

  const handleDeletePatient = async (patient: Patient) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const success = await patientService.delete(patient.id);
      if (success) {
        setPatients((prev) => prev.filter((p) => p.id !== patient.id));
        setDeleteConfirm(null);
        setSuccessModal({
          title: "Patient Record Deleted",
          message: `${patient.firstName} ${patient.lastName}'s clinical record has been removed.`,
        });
      } else {
        setDeleteError("Failed to delete patient record. Please check your network and session.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete patient record.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter pipeline
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = `${p.firstName} ${p.lastName} ${p.id} ${p.barangay} ${p.philhealth} ${p.contact}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesBarangay =
        barangayFilter === "All Barangays" ||
        p.barangay?.toLowerCase() === barangayFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All Status" ||
        p.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesBarangay && matchesStatus;
    });
  }, [patients, search, barangayFilter, statusFilter]);

  // Statistical summary metrics
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.status === "Active").length;
    const female = patients.filter((p) => p.gender === "Female").length;
    const male = patients.filter((p) => p.gender === "Male").length;
    return { total, active, female, male };
  }, [patients]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginated = filtered.slice(pageStart, pageEnd);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, barangayFilter, statusFilter]);

  if (isLoading) {
    return <PatientsSkeleton />;
  }

  return (
    <div className="p-3.5 sm:p-5 lg:p-7 space-y-5 max-w-7xl mx-auto">
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Patient Registry
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Master demographic directory and electronic health index for Olongapo City
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Patient
          </button>
        </div>
      </div>

      {/* Demographic Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active in Care</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.active.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Female Patients</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.female.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Male Patients</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.male.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, ID, contact, PhilHealth..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          {/* Barangay filter */}
          <select
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="All Barangays">All Barangays (17)</option>
            {OLONGAPO_BARANGAYS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="All Status">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(search || barangayFilter !== "All Barangays" || statusFilter !== "All Status") && (
            <button
              onClick={() => {
                setSearch("");
                setBarangayFilter("All Barangays");
                setStatusFilter("All Status");
              }}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold px-2 py-1 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Patients Data Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Record ID</th>
                <th className="px-4 py-3.5">Patient Details</th>
                <th className="px-4 py-3.5">Age / Gender</th>
                <th className="px-4 py-3.5">Blood Type</th>
                <th className="px-4 py-3.5">Barangay</th>
                <th className="px-4 py-3.5">Contact Number</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No matching patient records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try refining your search or add a new patient</p>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="hover:bg-sky-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-sky-600">
                      {formatEntityId(p.id, "PAT")}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p.philhealth ? `PhilHealth: ${p.philhealth}` : "No PhilHealth recorded"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      <span>{calcAge(p.dob)}</span>
                      <span className="text-slate-300 mx-1.5">&bull;</span>
                      <span className="text-slate-500 text-xs">{p.gender || "—"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      {p.bloodType ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                          {p.bloodType}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[130px]">{p.barangay || "—"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{p.contact || "—"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${p.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                        />
                        {p.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/patients/${p.id}`)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                          title="Open Full Clinical Record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModal({ mode: "edit", patient: p })}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                          title="Edit Demographic Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/consultations?patientId=${p.id}`)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="New Consultation"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching patient records found
            </div>
          ) : (
            paginated.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs font-mono font-semibold text-sky-600">
                        {formatEntityId(p.id, "PAT")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{p.barangay || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{p.contact || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Age: </span>
                    <span className="font-semibold">{calcAge(p.dob)} ({p.gender || "—"})</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Blood: </span>
                    <span className="font-bold text-rose-600">{p.bloodType || "N/A"}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="flex-1 py-1.5 text-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    View Record
                  </button>
                  <button
                    onClick={() => setModal({ mode: "edit", patient: p })}
                    className="flex-1 py-1.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/consultations?patientId=${p.id}`)}
                    className="p-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    title="New Consultation"
                  >
                    <Stethoscope className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p)}
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs transition-colors"
                    title="Delete Patient Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{paginated.length}</span> of{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span> patient records
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all ${n === safeCurrentPage
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <PatientModal
          mode={modal.mode}
          patient={modal.patient}
          onClose={() => setModal(null)}
          onSave={handleSavePatient}
          onDelete={(p) => setDeleteConfirm(p)}
        />
      )}

      <DeleteConfirmModal
        patient={deleteConfirm}
        isOpen={Boolean(deleteConfirm)}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={() => deleteConfirm && handleDeletePatient(deleteConfirm)}
        onCancel={() => {
          setDeleteConfirm(null);
          setDeleteError(null);
        }}
      />

      {successModal && (
        <StatusModal
          open={Boolean(successModal)}
          variant="success"
          title={successModal.title}
          message={successModal.message}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </div>
  );
}

