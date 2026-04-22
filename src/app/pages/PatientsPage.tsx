import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { patientService } from "../services/patientService";
import { barangayService } from "../services";
import type { Patient } from "../models";
import { PatientsSkeleton } from "../components/skeletons/PatientsSkeleton";
import { FormLoadingOverlay } from "../components/feedback/FormLoadingOverlay";
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

function PatientModal(
  {
    patient,
    onClose,
    mode,
    onSave,
  }: {
    patient?: Patient | null;
    onClose: () => void;
    mode: PatientModalMode;
    onSave: (mode: PatientModalMode, form: Patient) => Promise<boolean>;
  }
) {
  const isView = mode === "view";
  const title =
    mode === "add" ? "Register New Patient" : mode === "edit" ? "Edit Patient" : "Patient Details";

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [barangays, setBarangays] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(mode !== 'view');

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

    if (mode === 'view') {
      setIsLoadingBarangays(false);
    } else if (!barangays.length) {
      setIsLoadingBarangays(true);
    }
  }, [patient, mode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Only fetch when modal is open in add/edit modes.
      if (isView) return;
      if (barangays.length) return;
      setIsLoadingBarangays(true);
      try {
        const list = await barangayService.getAll();
        if (!cancelled) {
          setBarangays(list.map((b) => ({ id: b.id, name: b.name })));
        }
      } catch {
        // Keep barangay as free text if fetching fails.
      } finally {
        if (!cancelled) setIsLoadingBarangays(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isView, barangays.length]);

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
        // Field is required by backend/DB but removed from UI.
        emergencyContact: form.emergencyContact?.trim() ? form.emergencyContact : "N/A",
      });
      setIsSaving(false);
      if (ok) onClose();
      else setSaveError("Failed to save patient. Check required fields and your login session.");
    } catch (e) {
      setIsSaving(false);
      setSaveError(formatApiError(e));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-gray-900 font-bold text-base sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FormLoadingOverlay open={isSaving} title="Saving patient..." />

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Patient Info */}
          <div>
            <h3 className="text-gray-600 mb-2.5 sm:mb-3 flex items-center gap-2 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-wide">
              <span className="w-4 sm:w-5 h-0.5 bg-blue-500 inline-block" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Date of Birth", key: "dob", type: "date" },
                { label: "Gender", key: "gender" },
                { label: "Blood Type", key: "bloodType" },
                { label: "Civil Status", key: "civilStatus" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">{label}</label>
                  {isView ? (
                    <p className="text-gray-800 py-2 border-b border-gray-100 text-sm font-medium">
                      {(form as any)[key] || "—"}
                    </p>
                  ) : key === "gender" ? (
                    <select
                      value={form.gender || ""}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g || "Select gender"}
                        </option>
                      ))}
                    </select>
                  ) : key === "bloodType" ? (
                    <select
                      value={form.bloodType || ""}
                      onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving}
                    >
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt || "Select blood type"}
                        </option>
                      ))}
                    </select>
                  ) : key === "civilStatus" ? (
                    <select
                      value={(form.civilStatus as any) || ""}
                      onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving}
                    >
                      {CIVIL_STATUSES.map((cs) => (
                        <option key={cs} value={cs}>
                          {cs || "Select civil status"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type || "text"}
                      value={type === "date" ? toDateInputValue((form as any)[key]) : (form as any)[key] || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-gray-600 mb-2.5 sm:mb-3 flex items-center gap-2 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-wide">
              <span className="w-4 sm:w-5 h-0.5 bg-teal-500 inline-block" /> Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Contact Number", key: "contact" },
                { label: "Barangay", key: "barangay" },
                { label: "Address", key: "address" },
                { label: "Emergency Contact No.", key: "emergencyContactNumber" },
                { label: "PhilHealth No.", key: "philhealth" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">{label}</label>
                  {isView ? (
                    <p className="text-gray-800 py-2 border-b border-gray-100 text-sm font-medium">
                      {(form as any)[key] || "—"}
                    </p>
                  ) : key === 'barangay' && (isLoadingBarangays || barangays.length) ? (
                    <select
                      value={form.barangay || ""}
                      onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving || isLoadingBarangays}
                    >
                      <option value="">
                        {isLoadingBarangays ? 'Loading barangays…' : 'Select barangay (optional)'}
                      </option>
                      {barangays.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      disabled={isSaving}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medical History (view only) */}
          {isView && (
            <div>
              <h3 className="text-gray-600 mb-2.5 sm:mb-3 flex items-center gap-2 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-wide">
                <span className="w-4 sm:w-5 h-0.5 bg-violet-500 inline-block" /> Medical History
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm">Hypertension</span>
                  <span className="text-green-600 text-xs sm:text-sm font-medium">Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 text-xs sm:text-sm">Type 2 Diabetes</span>
                  <span className="text-gray-400 text-xs sm:text-sm font-medium">Resolved</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isView && saveError && (
          <div className="px-4 sm:px-6 pb-0">
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm">
              {saveError}
            </div>
          </div>
        )}

        {!isView && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <button
              onClick={onClose}
              className="px-4 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : mode === "add" ? "Register Patient" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

}


export function PatientsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; patient?: Patient } | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const pageSize = 10;

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      const all: any[] = [];

      for (let page = 1; page <= PATIENT_MAX_PAGES; page++) {
        const chunk = await patientService.getAll({ page, limit: PATIENT_QUERY_LIMIT });
        all.push(...chunk);

        if (chunk.length < PATIENT_QUERY_LIMIT) {
          break;
        }
      }

      setPatients(all.map((p: any) => normalizePatientApi(p)));
      setIsLoading(false);
    };
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
        message: `${createdLabel} has been added successfully.`,
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
        title: "Patient Updated",
        message: `${updatedLabel} has been updated successfully.`,
      });
      return true;
    }

    return false;
  };

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.id} ${p.barangay}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginated = filtered.slice(pageStart, pageEnd);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (isLoading) {
    return <PatientsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-gray-900 text-lg sm:text-xl lg:text-2xl font-bold">Patients</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage and view patient records</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 press-effect text-xs sm:text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center shadow-card animate-fade-in-up animation-delay-100">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search by name, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all duration-200 cursor-pointer text-xs sm:text-sm">
            <option>All Barangays</option>
            <option>Sta. Rita</option>
            <option>Gordon Heights</option>
            <option>New Ilalim</option>
            <option>Kalaklan</option>
          </select>
          <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all duration-200 cursor-pointer text-xs sm:text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-xs sm:text-sm">
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Table - Mobile Card View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card animate-fade-in-up animation-delay-200">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                {["Patient ID", "Name", "Date of Birth", "Gender", "Blood Type", "Barangay", "Contact", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                    No patients found. {patients.length === 0 ? "Click 'Register Patient' to add a new patient." : "Try adjusting your search."}
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => (
                  <tr 
                    key={p.id} 
                    className={`border-b border-gray-50 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    onClick={() => setModal({ mode: "view", patient: p })}
                  >
                    <td className="px-4 py-3">
                      <span className="text-blue-600 group-hover:text-blue-700 transition-colors text-xs sm:text-sm font-semibold" title={p.id}>{formatEntityId(p.id, "PAT")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 flex-shrink-0 group-hover:scale-110 transition-transform text-[0.55rem] sm:text-xs font-bold">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <span className="text-gray-800 group-hover:text-blue-700 transition-colors text-xs sm:text-sm font-medium">{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.dob}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.gender}</td>
                    <td className="px-4 py-3">
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded transition-transform group-hover:scale-105 inline-block text-[0.65rem] sm:text-xs font-medium">{p.bloodType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.barangay}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.contact}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full transition-all group-hover:shadow-sm text-[0.6rem] sm:text-xs font-medium ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setModal({ mode: "view", patient: p }); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setModal({ mode: "edit", patient: p }); }} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 hover:scale-110">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No patients found. {patients.length === 0 ? "Click 'Register Patient' to add a new patient." : "Try adjusting your search."}
            </div>
          ) : (
            paginated.map((p) => (
            <div key={p.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 flex-shrink-0 text-xs font-bold">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-blue-600 text-xs font-medium" title={p.id}>{formatEntityId(p.id, "PAT")}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Barangay:</span>
                  <span className="text-gray-600 ml-1">{p.barangay}</span>
                </div>
                <div>
                  <span className="text-gray-400">Blood:</span>
                  <span className="text-violet-600 ml-1 font-medium">{p.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Gender:</span>
                  <span className="text-gray-600 ml-1">{p.gender}</span>
                </div>
                <div>
                  <span className="text-gray-400">Contact:</span>
                  <span className="text-gray-600 ml-1">{p.contact}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setModal({ mode: "view", patient: p })} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => setModal({ mode: "edit", patient: p })} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-teal-600 bg-teal-50 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-gray-400 text-xs sm:text-sm">Showing {paginated.length} of {filtered.length} patients</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 text-xs sm:text-sm ${n === safeCurrentPage ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
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
    </div>
  );
}
