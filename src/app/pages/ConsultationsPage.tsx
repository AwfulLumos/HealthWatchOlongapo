import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit2, X, Activity, Thermometer, Heart } from "lucide-react";
import {
  consultationService,
  type ConsultationCreateInput,
  type ConsultationCreationOptions,
} from "../services/consultationService";
import { ConsultationsSkeleton } from "../components/skeletons/ConsultationsSkeleton";
import { formatEntityId } from "../utils";

const typeColor = {
  Regular: "text-blue-600 bg-blue-50 border-blue-200",
  FollowUp: "text-purple-600 bg-purple-50 border-purple-200",
  "Follow-up": "text-purple-600 bg-purple-50 border-purple-200",
  Emergency: "text-red-600 bg-red-50 border-red-200"
};
const statusColor = {
  Completed: "text-green-600 bg-green-50 border-green-200",
  InProgress: "text-orange-600 bg-orange-50 border-orange-200",
  "In Progress": "text-orange-600 bg-orange-50 border-orange-200",
  Pending: "text-orange-600 bg-orange-50 border-orange-200"
};

interface ConsultationModalProps {
  consultation?: any;
  onClose: () => void;
  mode: "view" | "add";
  patients: ConsultationCreationOptions["patients"];
  defaultStaffId?: string;
  optionsLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  onSave: (payload: ConsultationCreateInput) => Promise<void>;
}

function ConsultationModal({
  consultation,
  onClose,
  mode,
  patients,
  defaultStaffId,
  optionsLoading,
  isSaving,
  saveError,
  onSave,
}: ConsultationModalProps) {
  const [tab, setTab] = useState<"info" | "vitals" | "prescription">("info");
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    patientId: string;
    staffId?: string;
    date: string;
    type: "Regular" | "FollowUp" | "Emergency";
    status: "InProgress" | "Completed" | "Referred";
    chiefComplaint: string;
    symptoms: string;
    diagnosis: string;
    icdCode: string;
    notes: string;
  }>({
    patientId: "",
    staffId: defaultStaffId,
    date: new Date().toISOString().split("T")[0],
    type: "Regular",
    status: "InProgress",
    chiefComplaint: "",
    symptoms: "",
    diagnosis: "",
    icdCode: "",
    notes: "",
  });

  useEffect(() => {
    if (mode !== "add") {
      return;
    }

    setForm((prev) => ({
      ...prev,
      patientId: prev.patientId || patients[0]?.id || "",
      staffId: prev.staffId || defaultStaffId,
    }));
  }, [mode, patients, defaultStaffId]);

  const handleSave = async () => {
    if (mode !== "add") {
      return;
    }

    if (!form.patientId || !form.chiefComplaint.trim() || !form.symptoms.trim() || !form.diagnosis.trim()) {
      setLocalError("Patient, chief complaint, symptoms, and diagnosis are required.");
      return;
    }

    setLocalError(null);

    await onSave({
      patientId: form.patientId,
      staffId: form.staffId || defaultStaffId,
      date: form.date ? new Date(`${form.date}T00:00:00`).toISOString() : undefined,
      type: form.type,
      status: form.status,
      chiefComplaint: form.chiefComplaint.trim(),
      symptoms: form.symptoms.trim(),
      diagnosis: form.diagnosis.trim(),
      icdCode: form.icdCode.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
              {mode === "add" ? "New Consultation" : `Consultation - ${formatEntityId(consultation?.id, "CON")}`}
            </h2>
            {consultation && <p className="text-xs sm:text-sm text-gray-400">{consultation.patient} &bull; {consultation.date}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-3 sm:px-6 bg-gray-50/50 flex-shrink-0 overflow-x-auto">
          {[
            { key: "info", label: "Info" },
            { key: "vitals", label: "Vitals" },
            { key: "prescription", label: "Prescription" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-2 sm:px-4 py-2 sm:py-3 border-b-2 transition-all duration-200 relative whitespace-nowrap text-xs sm:text-sm ${tab === t.key ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-normal"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === "info" && (
            <div className="space-y-4">
              {mode === "view" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: "Patient", value: consultation?.patient || "" },
                    { label: "Staff / Doctor", value: consultation?.staff || "" },
                    { label: "Consultation Date", value: consultation?.date || "" },
                    { label: "Consultation Type", value: consultation?.type || "" },
                    { label: "Chief Complaint", value: consultation?.chiefComplaint || "", fullWidth: true },
                    { label: "Symptoms", value: consultation?.symptoms || "", fullWidth: true },
                    { label: "Diagnosis", value: consultation?.diagnosis || "", fullWidth: true },
                    { label: "ICD Code", value: consultation?.icdCode || "" },
                    { label: "Notes", value: consultation?.notes || "", fullWidth: true },
                  ].map(({ label, value, fullWidth }) => (
                    <div key={label} className={fullWidth ? "sm:col-span-2" : ""}>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">{label}</label>
                      <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {optionsLoading && (
                    <p className="text-xs sm:text-sm text-gray-500">Loading patients...</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Patient</label>
                      <select
                        value={form.patientId}
                        onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
                        disabled={optionsLoading || isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                      >
                        {!patients.length && <option value="">No patients available</option>}
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.fullName} ({formatEntityId(patient.id, "PAT")})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Consultation Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Consultation Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as "Regular" | "FollowUp" | "Emergency" }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      >
                        <option value="Regular">Regular</option>
                        <option value="FollowUp">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "InProgress" | "Completed" | "Referred" }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      >
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Referred">Referred</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Chief Complaint</label>
                      <input
                        type="text"
                        value={form.chiefComplaint}
                        onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Symptoms</label>
                      <textarea
                        rows={3}
                        value={form.symptoms}
                        onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Diagnosis</label>
                      <input
                        type="text"
                        value={form.diagnosis}
                        onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">ICD Code</label>
                      <input
                        type="text"
                        value={form.icdCode}
                        onChange={(e) => setForm((prev) => ({ ...prev, icdCode: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Notes</label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {localError && (
                    <p className="text-xs sm:text-sm text-red-600">{localError}</p>
                  )}
                  {saveError && (
                    <p className="text-xs sm:text-sm text-red-600">{saveError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "vitals" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {[
                  { label: "BP Systolic (mmHg)", icon: Heart, value: "140", color: "text-red-500" },
                  { label: "BP Diastolic (mmHg)", icon: Heart, value: "90", color: "text-red-400" },
                  { label: "Pulse Rate (bpm)", icon: Activity, value: "82", color: "text-orange-500" },
                  { label: "Respiratory Rate", icon: Activity, value: "18", color: "text-blue-500" },
                  { label: "Temperature (°C)", icon: Thermometer, value: "36.8", color: "text-yellow-500" },
                  { label: "Blood Sugar (mg/dL)", icon: Activity, value: "110", color: "text-violet-500" },
                  { label: "Weight (kg)", icon: Activity, value: "65", color: "text-teal-500" },
                  { label: "Height (cm)", icon: Activity, value: "162", color: "text-teal-400" },
                  { label: "BMI", icon: Activity, value: "24.8", color: "text-green-500" },
                ].map(({ label, icon: Icon, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color}`} />
                      <p className="text-gray-500 text-[0.6rem] sm:text-[0.72rem]">{label}</p>
                    </div>
                    {mode === "view" ? (
                      <p className={`${color} text-base sm:text-xl font-bold`}>{value}</p>
                    ) : (
                      <input
                        type="number"
                        defaultValue={value}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "prescription" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-gray-600 text-xs sm:text-sm">Prescribed Medications</p>
                {mode !== "view" && (
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                )}
              </div>
              {[
                { medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
                { medicine: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
              ].map((rx, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { label: "Medicine Name", value: rx.medicine },
                      { label: "Dosage", value: rx.dosage },
                      { label: "Frequency", value: rx.frequency },
                      { label: "Duration", value: rx.duration },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">{label}</p>
                        {mode === "view" ? (
                          <p className="text-gray-800 text-xs sm:text-sm font-medium">{value}</p>
                        ) : (
                          <input
                            type="text"
                            defaultValue={value}
                            className="w-full px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">Instructions</p>
                      {mode === "view" ? (
                        <p className="text-gray-800 text-xs sm:text-sm font-medium">{rx.instructions}</p>
                      ) : (
                        <input
                          type="text"
                          defaultValue={rx.instructions}
                          className="w-full px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Follow-up section */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-600 mb-3 text-xs sm:text-sm font-semibold">Schedule Follow-up Appointment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Follow-up Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Purpose</label>
                    <input type="text" placeholder="Purpose of follow-up" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {mode !== "view" && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-gray-50/50 flex-shrink-0">
            <button onClick={onClose} className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || optionsLoading || !patients.length}
              className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Consultation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsultationsPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add"; consultation?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [creationOptions, setCreationOptions] = useState<ConsultationCreationOptions>({ patients: [] });
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const transformConsultation = (c: any) => ({
    ...c,
    patient: typeof c.patient === "object"
      ? `${c.patient?.firstName || ""} ${c.patient?.lastName || ""}`.trim()
      : c.patient || "Unknown",
    patientId: c.patientId || c.patient?.id || "N/A",
    staff: typeof c.staff === "object"
      ? `${c.staff?.firstName || ""} ${c.staff?.lastName || ""}`.trim()
      : c.staff || "Unknown",
    type: c.type === "FollowUp" ? "Follow-up" : c.type,
    status: c.status === "InProgress" ? "In Progress" : c.status,
    date: c.date ? new Date(c.date).toLocaleDateString() : "",
  });

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const data = await consultationService.getAll();
      setConsultations(data.map(transformConsultation));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleOpenNewConsultation = async () => {
    setSaveError(null);
    setModal({ mode: "add" });
    setIsOptionsLoading(true);
    const options = await consultationService.getCreationOptions();
    setCreationOptions(options);
    setIsOptionsLoading(false);
  };

  const handleSaveConsultation = async (payload: ConsultationCreateInput) => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const created = await consultationService.createRecord({
        ...payload,
        staffId: payload.staffId || creationOptions.defaultStaffId,
      });

      setConsultations((prev) => [transformConsultation(created), ...prev]);
      setModal(null);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setSaveError(err.response?.data?.message || err.message || "Failed to save consultation.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = consultations.filter(c =>
    `${c.patient} ${c.id} ${c.diagnosis}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <ConsultationsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-xs sm:text-sm text-gray-500">Log and manage patient consultations</p>
        </div>
        <button
          onClick={handleOpenNewConsultation}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New Consultation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm">
            <option>All Types</option>
            <option>Regular</option>
            <option>Follow-up</option>
            <option>Emergency</option>
          </select>
          <input type="date" className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Consult ID", "Patient", "Staff / Doctor", "Date", "Chief Complaint", "Diagnosis", "Type", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3">
                    <span className="text-blue-600 text-sm font-semibold" title={c.id}>{formatEntityId(c.id, "CON")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-800 text-sm font-semibold">{c.patient}</p>
                      <p className="text-gray-400 text-xs" title={c.patientId}>{formatEntityId(c.patientId, "PAT")}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{c.staff}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{c.date}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] text-sm">
                    <span className="truncate block">{c.chiefComplaint}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] text-sm">
                    <span className="truncate block">{c.diagnosis}</span>
                    <span className="text-gray-400 text-xs">{c.icdCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor[c.type as keyof typeof typeColor] || 'bg-gray-100 text-gray-600'}`}>{c.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status as keyof typeof statusColor] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ mode: "view", consultation: c })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-blue-600 text-xs font-semibold" title={c.id}>{formatEntityId(c.id, "CON")}</span>
                <p className="text-gray-800 text-sm font-semibold mt-0.5">{c.patient}</p>
                <p className="text-gray-400 text-xs" title={c.patientId}>{formatEntityId(c.patientId, "PAT")}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal({ mode: "view", consultation: c })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Staff</span>
                <span className="text-gray-600 text-xs">{c.staff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Date</span>
                <span className="text-gray-600 text-xs">{c.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Complaint</span>
                <span className="text-gray-600 text-xs truncate max-w-[150px]">{c.chiefComplaint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Diagnosis</span>
                <span className="text-gray-600 text-xs truncate max-w-[150px]">{c.diagnosis}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-[0.65rem] font-medium ${typeColor[c.type as keyof typeof typeColor] || 'bg-gray-100 text-gray-600'}`}>{c.type}</span>
              <span className={`px-2 py-1 rounded-full text-[0.65rem] font-medium ${statusColor[c.status as keyof typeof statusColor] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ConsultationModal
          mode={modal.mode}
          consultation={modal.consultation}
          onClose={() => setModal(null)}
          patients={creationOptions.patients}
          defaultStaffId={creationOptions.defaultStaffId}
          optionsLoading={isOptionsLoading}
          isSaving={isSaving}
          saveError={saveError}
          onSave={handleSaveConsultation}
        />
      )}
    </div>
  );
}
