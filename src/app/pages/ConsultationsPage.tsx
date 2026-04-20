import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit2, X, Activity, Thermometer, Heart } from "lucide-react";
import {
  consultationService,
  type ConsultationCreateInput,
  type ConsultationUpdateInput,
  type ConsultationCreationOptions,
} from "../services/consultationService";
import { vitalSignsService } from "../services/vitalSignsService";
import { prescriptionService } from "../services/prescriptionService";
import { authService } from "../services/authService";
import { FormLoadingOverlay } from "../components/feedback/FormLoadingOverlay";
import { StatusModal } from "../components/feedback/StatusModal";
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

type MedicationDraft = {
  id?: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type VitalsDraft = {
  bpSystolic: string;
  bpDiastolic: string;
  pulseRate: string;
  respRate: string;
  temperature: string;
  bloodSugar: string;
  weight: string;
  height: string;
};

type ConsultationSaveExtras = {
  vitals?: {
    bpSystolic: number;
    bpDiastolic: number;
    pulseRate: number;
    respRate: number;
    temperature: number;
    bloodSugar?: number;
    weight: number;
    height: number;
  };
  vitalSignsId?: string;
  initialPrescriptionIds: string[];
  prescriptions: MedicationDraft[];
};

type ConsultationModalMode = "view" | "add" | "edit";

const createMedicationDraft = (partial?: Partial<MedicationDraft>): MedicationDraft => ({
  id: partial?.id,
  medicine: partial?.medicine || "",
  dosage: partial?.dosage || "",
  frequency: partial?.frequency || "",
  duration: partial?.duration || "",
  instructions: partial?.instructions || "",
});

const createVitalsDraft = (): VitalsDraft => ({
  bpSystolic: "",
  bpDiastolic: "",
  pulseRate: "",
  respRate: "",
  temperature: "",
  bloodSugar: "",
  weight: "",
  height: "",
});

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

      return parts.length ? `${message} (${parts.join(" • ")})` : message;
    }
    return message;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Failed to save consultation.";
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function hasAnyVitalsInput(vitals: VitalsDraft): boolean {
  return Object.values(vitals).some((v) => v.trim().length > 0);
}

function calculateDraftBmi(weight: string, height: string): string {
  const w = toNumber(weight);
  const h = toNumber(height);
  if (!w || !h || h <= 0) return "--";
  const meters = h / 100;
  return (w / (meters * meters)).toFixed(1);
}

function toVitalsDraftFromRecord(vital: any): VitalsDraft {
  if (!vital) return createVitalsDraft();
  return {
    bpSystolic: vital.bpSystolic != null ? String(vital.bpSystolic) : "",
    bpDiastolic: vital.bpDiastolic != null ? String(vital.bpDiastolic) : "",
    pulseRate: vital.pulseRate != null ? String(vital.pulseRate) : "",
    respRate: vital.respRate != null ? String(vital.respRate) : "",
    temperature: vital.temperature != null ? String(vital.temperature) : "",
    bloodSugar: vital.bloodSugar != null ? String(vital.bloodSugar) : "",
    weight: vital.weight != null ? String(vital.weight) : "",
    height: vital.height != null ? String(vital.height) : "",
  };
}

function normalizeConsultationRecord(c: any) {
  if (!c) return c;
  return {
    ...c,
    patient:
      typeof c.patient === "object"
        ? `${c.patient?.firstName || ""} ${c.patient?.lastName || ""}`.trim()
        : c.patient || "Unknown",
    patientId: c.patientId || c.patient?.id || "N/A",
    staff:
      typeof c.staff === "object"
        ? `${c.staff?.firstName || ""} ${c.staff?.lastName || ""}`.trim()
        : c.staff || "Unknown",
    type: c.type === "FollowUp" ? "Follow-up" : c.type,
    status: c.status === "InProgress" ? "In Progress" : c.status,
    rawDate: c.date || "",
    date: c.date ? new Date(c.date).toLocaleDateString() : "",
  };
}

function normalizeApiType(type: string | undefined): "Regular" | "FollowUp" | "Emergency" {
  if (type === "FollowUp") return "FollowUp";
  if (type === "Follow-up") return "FollowUp";
  if (type === "Emergency") return "Emergency";
  return "Regular";
}

function normalizeApiStatus(status: string | undefined): "InProgress" | "Completed" | "Referred" {
  if (status === "InProgress") return "InProgress";
  if (status === "In Progress") return "InProgress";
  if (status === "Completed") return "Completed";
  if (status === "Referred") return "Referred";
  return "InProgress";
}

function toDateInputValue(value: string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value.includes("T")) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

interface ConsultationModalProps {
  consultation?: any;
  onClose: () => void;
  mode: ConsultationModalMode;
  patients: ConsultationCreationOptions["patients"];
  staff: ConsultationCreationOptions["staff"];
  defaultStaffId?: string;
  optionsLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  onSave: (
    mode: ConsultationModalMode,
    consultationId: string | undefined,
    payload: ConsultationCreateInput,
    updatePayload: ConsultationUpdateInput,
    extras: ConsultationSaveExtras
  ) => Promise<void>;
}

function ConsultationModal({
  consultation,
  onClose,
  mode,
  patients,
  staff,
  defaultStaffId,
  optionsLoading,
  isSaving,
  saveError,
  onSave,
}: ConsultationModalProps) {
  const [tab, setTab] = useState<"info" | "vitals" | "prescription">("info");
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<MedicationDraft[]>([createMedicationDraft()]);
  const [vitals, setVitals] = useState<VitalsDraft>(createVitalsDraft());
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpPurpose, setFollowUpPurpose] = useState("");
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

  const currentView = mode !== "add" ? normalizeConsultationRecord(viewDetails || consultation) : undefined;
  const viewVitals = Array.isArray(currentView?.vitalSigns) ? [...currentView.vitalSigns] : [];
  const latestVital = viewVitals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const viewPrescriptions = Array.isArray(currentView?.prescriptions) ? currentView.prescriptions : [];
  const draftBmi = calculateDraftBmi(vitals.weight, vitals.height);

  useEffect(() => {
    if (mode !== "add") {
      return;
    }

    setForm((prev) => ({
      ...prev,
      patientId: prev.patientId || patients[0]?.id || "",
      staffId: prev.staffId || defaultStaffId || staff[0]?.id,
    }));

    setPrescriptions([createMedicationDraft()]);
    setVitals(createVitalsDraft());
    setFollowUpDate("");
    setFollowUpPurpose("");
  }, [mode, patients, defaultStaffId, staff]);

  useEffect(() => {
    if (mode !== "edit" || (!consultation && !viewDetails)) {
      return;
    }

    const source = normalizeConsultationRecord(viewDetails || consultation);
    if (!source) return;

    setForm((prev) => ({
      ...prev,
      patientId: source.patientId || prev.patientId || "",
      staffId: source.staffId || prev.staffId || defaultStaffId || staff[0]?.id,
      date: toDateInputValue(source.rawDate || source.date),
      type: normalizeApiType(source.type),
      status: normalizeApiStatus(source.status),
      chiefComplaint: source.chiefComplaint || "",
      symptoms: source.symptoms || "",
      diagnosis: source.diagnosis || "",
      icdCode: source.icdCode || "",
      notes: source.notes || "",
    }));

    const prescriptionRows = Array.isArray(source.prescriptions)
      ? source.prescriptions.map((rx: any) =>
          createMedicationDraft({
            id: rx.id,
            medicine: rx.medicine,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration: rx.duration,
            instructions: rx.instructions || "",
          })
        )
      : [];
    setPrescriptions(prescriptionRows.length ? prescriptionRows : [createMedicationDraft()]);

    const latestSourceVital = Array.isArray(source.vitalSigns)
      ? [...source.vitalSigns].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : undefined;
    setVitals(toVitalsDraftFromRecord(latestSourceVital));
  }, [mode, consultation, viewDetails, defaultStaffId, staff]);

  useEffect(() => {
    if ((mode !== "view" && mode !== "edit") || !consultation?.id) {
      setViewDetails(null);
      setIsDetailsLoading(false);
      return;
    }

    let cancelled = false;
    setIsDetailsLoading(true);
    setViewDetails(null);

    (async () => {
      try {
        const details = await consultationService.getById(consultation.id);
        if (!cancelled && details) {
          setViewDetails(details);
        }
      } finally {
        if (!cancelled) {
          setIsDetailsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, consultation?.id]);

  const updatePrescription = (
    index: number,
    key: keyof MedicationDraft,
    value: string
  ) => {
    setPrescriptions((prev) => prev.map((rx, i) => (i === index ? { ...rx, [key]: value } : rx)));
  };

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [...prev, createMedicationDraft()]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions((prev) => {
      if (prev.length === 1) {
        return [createMedicationDraft()];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (mode === "view") {
      return;
    }

    if (!form.chiefComplaint.trim() || !form.symptoms.trim() || !form.diagnosis.trim()) {
      setLocalError("Chief complaint, symptoms, and diagnosis are required.");
      return;
    }

    if (mode === "add" && (!form.patientId || !form.staffId)) {
      setLocalError("Patient and staff are required for a new consultation.");
      return;
    }

    const hasVitals = hasAnyVitalsInput(vitals);
    let parsedVitals: ConsultationSaveExtras["vitals"];

    if (hasVitals) {
      const bpSystolic = toNumber(vitals.bpSystolic);
      const bpDiastolic = toNumber(vitals.bpDiastolic);
      const pulseRate = toNumber(vitals.pulseRate);
      const respRate = toNumber(vitals.respRate);
      const temperature = toNumber(vitals.temperature);
      const weight = toNumber(vitals.weight);
      const height = toNumber(vitals.height);
      const bloodSugar = toNumber(vitals.bloodSugar);

      if (
        bpSystolic === undefined ||
        bpDiastolic === undefined ||
        pulseRate === undefined ||
        respRate === undefined ||
        temperature === undefined ||
        weight === undefined ||
        height === undefined
      ) {
        setLocalError("If you enter vital signs, complete all required vital fields.");
        return;
      }

      parsedVitals = {
        bpSystolic,
        bpDiastolic,
        pulseRate,
        respRate,
        temperature,
        weight,
        height,
        bloodSugar,
      };
    }

    const prescriptionsToSave = prescriptions
      .map((rx) => ({
        id: rx.id,
        medicine: rx.medicine.trim(),
        dosage: rx.dosage.trim(),
        frequency: rx.frequency.trim(),
        duration: rx.duration.trim(),
        instructions: rx.instructions.trim(),
      }))
      .filter((rx) =>
        Object.values(rx).some((v) => typeof v === "string" && v.length > 0)
      );

    const hasPartialPrescription = prescriptionsToSave.some(
      (rx) => !rx.medicine || !rx.dosage || !rx.frequency || !rx.duration
    );

    if (hasPartialPrescription) {
      setLocalError("Complete medicine, dosage, frequency, and duration for each prescription row.");
      return;
    }

    const followUpNote =
      followUpDate || followUpPurpose
        ? `Follow-up: ${followUpDate || "No date"}${followUpPurpose ? ` - ${followUpPurpose.trim()}` : ""}`
        : "";

    const mergedNotes = [form.notes.trim(), followUpNote].filter(Boolean).join("\n");

    setLocalError(null);

    const createPayload: ConsultationCreateInput = {
      patientId: form.patientId,
      staffId: form.staffId,
      date: form.date ? new Date(`${form.date}T00:00:00`).toISOString() : undefined,
      type: form.type,
      status: form.status,
      chiefComplaint: form.chiefComplaint.trim(),
      symptoms: form.symptoms.trim(),
      diagnosis: form.diagnosis.trim(),
      icdCode: form.icdCode.trim() || undefined,
      notes: mergedNotes || undefined,
    };

    const updatePayload: ConsultationUpdateInput = {
      chiefComplaint: createPayload.chiefComplaint,
      symptoms: createPayload.symptoms,
      diagnosis: createPayload.diagnosis,
      icdCode: createPayload.icdCode,
      type: createPayload.type,
      status: createPayload.status,
      notes: createPayload.notes,
    };

    await onSave(mode, consultation?.id, createPayload, updatePayload, {
      vitals: parsedVitals,
      vitalSignsId: latestVital?.id,
      initialPrescriptionIds: viewPrescriptions.map((rx: any) => rx.id).filter(Boolean),
      prescriptions: prescriptionsToSave,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
              {mode === "add"
                ? "New Consultation"
                : mode === "edit"
                  ? `Edit Consultation - ${formatEntityId(currentView?.id || consultation?.id, "CON")}`
                  : `Consultation - ${formatEntityId(currentView?.id || consultation?.id, "CON")}`}
            </h2>
            {(currentView || consultation) && (
              <p className="text-xs sm:text-sm text-gray-400">
                {currentView?.patient || consultation?.patient} &bull; {currentView?.date || consultation?.date}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2 sm:px-4 md:px-6 bg-gray-50/50 flex-shrink-0 overflow-x-auto gap-1 sm:gap-2">
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
          {mode === "view" && isDetailsLoading && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs sm:text-sm text-gray-600 animate-pulse">
              Loading consultation details...
            </div>
          )}

          {tab === "info" && (
            <div className="space-y-4">
              {mode === "view" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: "Patient", value: currentView?.patient || "" },
                    { label: "Staff / Doctor", value: currentView?.staff || "" },
                    { label: "Consultation Date", value: currentView?.date || "" },
                    { label: "Consultation Type", value: currentView?.type || "" },
                    { label: "Chief Complaint", value: currentView?.chiefComplaint || "", fullWidth: true },
                    { label: "Symptoms", value: currentView?.symptoms || "", fullWidth: true },
                    { label: "Diagnosis", value: currentView?.diagnosis || "", fullWidth: true },
                    { label: "ICD Code", value: currentView?.icdCode || "" },
                    { label: "Notes", value: currentView?.notes || "", fullWidth: true },
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
                    <p className="text-xs sm:text-sm text-gray-500 animate-pulse">Loading patients and staff...</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Patient</label>
                      <select
                        value={form.patientId}
                        onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
                        disabled={optionsLoading || isSaving || mode === "edit"}
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
                      <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Staff / Doctor</label>
                      <select
                        value={form.staffId || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, staffId: e.target.value || undefined }))}
                        disabled={optionsLoading || isSaving || mode === "edit"}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-60"
                      >
                        {!staff.length && <option value="">No active staff available</option>}
                        {staff.map((staffMember) => (
                          <option key={staffMember.id} value={staffMember.id}>
                            {staffMember.fullName} ({staffMember.role})
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
                        disabled={isSaving || mode === "edit"}
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

                </div>
              )}
            </div>
          )}

          {tab === "vitals" && (
            <div className="space-y-4">
              {mode === "view" ? (
                latestVital ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { label: "BP Systolic (mmHg)", icon: Heart, value: latestVital.bpSystolic, color: "text-red-500" },
                      { label: "BP Diastolic (mmHg)", icon: Heart, value: latestVital.bpDiastolic, color: "text-red-400" },
                      { label: "Pulse Rate (bpm)", icon: Activity, value: latestVital.pulseRate, color: "text-orange-500" },
                      { label: "Respiratory Rate", icon: Activity, value: latestVital.respRate, color: "text-blue-500" },
                      { label: "Temperature (°C)", icon: Thermometer, value: latestVital.temperature, color: "text-yellow-500" },
                      { label: "Blood Sugar (mg/dL)", icon: Activity, value: latestVital.bloodSugar ?? "--", color: "text-violet-500" },
                      { label: "Weight (kg)", icon: Activity, value: latestVital.weight, color: "text-teal-500" },
                      { label: "Height (cm)", icon: Activity, value: latestVital.height, color: "text-teal-400" },
                      { label: "BMI", icon: Activity, value: latestVital.bmi ?? "--", color: "text-green-500" },
                    ].map(({ label, icon: Icon, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color}`} />
                          <p className="text-gray-500 text-[0.6rem] sm:text-[0.72rem]">{label}</p>
                        </div>
                        <p className={`${color} text-base sm:text-xl font-bold`}>{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs sm:text-sm text-gray-500">
                    No vital signs recorded for this consultation yet.
                  </div>
                )
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Optional: fill all required fields below if you also want to record vital signs with this consultation.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { label: "BP Systolic (mmHg)", key: "bpSystolic", icon: Heart, color: "text-red-500" },
                      { label: "BP Diastolic (mmHg)", key: "bpDiastolic", icon: Heart, color: "text-red-400" },
                      { label: "Pulse Rate (bpm)", key: "pulseRate", icon: Activity, color: "text-orange-500" },
                      { label: "Respiratory Rate", key: "respRate", icon: Activity, color: "text-blue-500" },
                      { label: "Temperature (°C)", key: "temperature", icon: Thermometer, color: "text-yellow-500", step: "0.1" },
                      { label: "Blood Sugar (mg/dL)", key: "bloodSugar", icon: Activity, color: "text-violet-500", step: "0.1" },
                      { label: "Weight (kg)", key: "weight", icon: Activity, color: "text-teal-500", step: "0.1" },
                      { label: "Height (cm)", key: "height", icon: Activity, color: "text-teal-400", step: "0.1" },
                    ].map(({ label, key, icon: Icon, color, step }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color}`} />
                          <p className="text-gray-500 text-[0.6rem] sm:text-[0.72rem]">{label}</p>
                        </div>
                        <input
                          type="number"
                          step={step || "1"}
                          value={vitals[key as keyof VitalsDraft]}
                          onChange={(e) => setVitals((prev) => ({ ...prev, [key]: e.target.value }))}
                          disabled={isSaving}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                      </div>
                    ))}
                    <div className="bg-gray-50 rounded-xl p-2 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <p className="text-gray-500 text-[0.6rem] sm:text-[0.72rem]">BMI (auto)</p>
                      </div>
                      <p className="text-green-500 text-base sm:text-xl font-bold">{draftBmi}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "prescription" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-gray-600 text-xs sm:text-sm">Prescribed Medications</p>
                {mode !== "view" && (
                  <button
                    onClick={addPrescriptionRow}
                    type="button"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                )}
              </div>

              {mode === "view" ? (
                viewPrescriptions.length ? (
                  viewPrescriptions.map((rx: any) => (
                    <div key={rx.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {[
                          { label: "Medicine Name", value: rx.medicine },
                          { label: "Dosage", value: rx.dosage },
                          { label: "Frequency", value: rx.frequency },
                          { label: "Duration", value: rx.duration },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">{label}</p>
                            <p className="text-gray-800 text-xs sm:text-sm font-medium">{value || "--"}</p>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">Instructions</p>
                          <p className="text-gray-800 text-xs sm:text-sm font-medium">{rx.instructions || "--"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs sm:text-sm text-gray-500">
                    No prescriptions recorded for this consultation yet.
                  </div>
                )
              ) : (
                prescriptions.map((rx, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 text-xs sm:text-sm font-semibold">Medicine #{i + 1}</p>
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(i)}
                        className="text-xs text-red-600 hover:text-red-700"
                        disabled={isSaving}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { label: "Medicine Name", key: "medicine" },
                        { label: "Dosage", key: "dosage" },
                        { label: "Frequency", key: "frequency" },
                        { label: "Duration", key: "duration" },
                      ].map(({ label, key }) => (
                        <div key={label}>
                          <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">{label}</p>
                          <input
                            type="text"
                            value={rx[key as keyof MedicationDraft]}
                            onChange={(e) => updatePrescription(i, key as keyof MedicationDraft, e.target.value)}
                            disabled={isSaving}
                            className="w-full px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <p className="text-gray-400 mb-0.5 text-[0.65rem] sm:text-[0.72rem]">Instructions</p>
                        <input
                          type="text"
                          value={rx.instructions}
                          onChange={(e) => updatePrescription(i, "instructions", e.target.value)}
                          disabled={isSaving}
                          className="w-full px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Follow-up section */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-600 mb-3 text-xs sm:text-sm font-semibold">Schedule Follow-up Appointment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      disabled={mode === "view" || isSaving}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Purpose</label>
                    <input
                      type="text"
                      value={followUpPurpose}
                      onChange={(e) => setFollowUpPurpose(e.target.value)}
                      disabled={mode === "view" || isSaving}
                      placeholder="Purpose of follow-up"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                {mode !== "view" && (
                  <p className="text-[0.7rem] sm:text-xs text-gray-500 mt-2">
                    Follow-up details will be appended to consultation notes.
                  </p>
                )}
              </div>
            </div>
          )}

          {localError && (
            <p className="text-xs sm:text-sm text-red-600 mt-3">{localError}</p>
          )}
          {saveError && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{saveError}</p>
          )}
        </div>

        {mode !== "view" && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-gray-50/50 flex-shrink-0">
            <button onClick={onClose} className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                optionsLoading ||
                (mode === "add" && (!patients.length || !staff.length))
              }
              className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Consultation"}
            </button>
          </div>
        )}

        <FormLoadingOverlay open={isSaving} title="Saving consultation..." />
      </div>
    </div>
  );
}

export function ConsultationsPage() {
  const user = authService.getCurrentUser();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: ConsultationModalMode; consultation?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [creationOptions, setCreationOptions] = useState<ConsultationCreationOptions>({ patients: [], staff: [] });
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const transformConsultation = (c: any) => normalizeConsultationRecord(c);

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
    setSuccessModal(null);
    setModal({ mode: "add" });
    setIsOptionsLoading(true);
    try {
      const options = await consultationService.getCreationOptions();
      setCreationOptions(options);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const handleOpenEditConsultation = async (consultation: any) => {
    setSaveError(null);
    setSuccessModal(null);
    setModal({ mode: "edit", consultation });
    setIsOptionsLoading(true);
    try {
      const options = await consultationService.getCreationOptions();
      setCreationOptions(options);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const handleSaveConsultation = async (
    mode: ConsultationModalMode,
    consultationId: string | undefined,
    payload: ConsultationCreateInput,
    updatePayload: ConsultationUpdateInput,
    extras: ConsultationSaveExtras
  ) => {
    setSaveError(null);
    setIsSaving(true);

    try {
      console.log("[Consultations] Save requested", {
        mode,
        consultationId,
        payload,
        updatePayload,
        extras,
      });

      const persistClinicalData = async (
        targetConsultationId: string,
        targetPatientId: string,
        doctorId: string | undefined
      ): Promise<string[]> => {
        const notices: string[] = [];

        if (extras.vitals) {
          try {
            if (extras.vitalSignsId) {
              console.log("[Consultations] Updating vital signs", {
                vitalSignsId: extras.vitalSignsId,
                payload: extras.vitals,
              });
              await vitalSignsService.updateRecord(extras.vitalSignsId, extras.vitals);
            } else {
              const createVitalPayload = {
                patientId: targetPatientId,
                consultId: targetConsultationId,
                date: payload.date,
                ...extras.vitals,
              };
              console.log("[Consultations] Creating vital signs", createVitalPayload);
              await vitalSignsService.createRecord(createVitalPayload);
            }
          } catch (error) {
            console.error("[Consultations] Failed to save vital signs", error);
            notices.push(`Vital signs were not saved: ${formatApiError(error)}`);
          }
        }

        if (extras.prescriptions.length) {
          if (!doctorId) {
            notices.push("Prescriptions were not saved because no doctor/staff ID is available for this session.");
          } else {
            const draftIds = new Set(extras.prescriptions.map((rx) => rx.id).filter(Boolean) as string[]);
            const staleIds = extras.initialPrescriptionIds.filter((id) => !draftIds.has(id));

            let created = 0;
            let updated = 0;
            let removed = 0;
            let failed = 0;

            for (const rx of extras.prescriptions) {
              try {
                if (rx.id) {
                  const updateRxPayload = {
                    medicine: rx.medicine,
                    dosage: rx.dosage,
                    frequency: rx.frequency,
                    duration: rx.duration,
                    instructions: rx.instructions || undefined,
                  };
                  console.log("[Consultations] Updating prescription", {
                    prescriptionId: rx.id,
                    payload: updateRxPayload,
                  });
                  await prescriptionService.updateRecord(rx.id, updateRxPayload);
                  updated += 1;
                } else {
                  const createRxPayload = {
                    consultId: targetConsultationId,
                    patientId: targetPatientId,
                    doctorId,
                    date: payload.date,
                    medicine: rx.medicine,
                    dosage: rx.dosage,
                    frequency: rx.frequency,
                    duration: rx.duration,
                    instructions: rx.instructions || undefined,
                  };
                  console.log("[Consultations] Creating prescription", createRxPayload);
                  await prescriptionService.createRecord(createRxPayload);
                  created += 1;
                }
              } catch (error) {
                failed += 1;
                console.error("[Consultations] Failed to save prescription row", {
                  row: rx,
                  error,
                });
              }
            }

            for (const prescriptionId of staleIds) {
              try {
                console.log("[Consultations] Deleting removed prescription", { prescriptionId });
                const ok = await prescriptionService.delete(prescriptionId);
                if (ok) {
                  removed += 1;
                } else {
                  failed += 1;
                }
              } catch (error) {
                failed += 1;
                console.error("[Consultations] Failed to delete removed prescription", {
                  prescriptionId,
                  error,
                });
              }
            }

            console.log("[Consultations] Prescription sync summary", {
              created,
              updated,
              removed,
              failed,
            });

            if (failed > 0) {
              notices.push(`${failed} prescription change(s) failed. Please check console and permissions.`);
            }
          }
        }

        return notices;
      };

      if (mode === "add") {
        const created = await consultationService.createRecord({
          ...payload,
          staffId: payload.staffId || creationOptions.defaultStaffId,
        });

        console.log("[Consultations] Consultation created", created);

        const notices = await persistClinicalData(
          created.id,
          payload.patientId,
          payload.staffId || creationOptions.defaultStaffId || user?.staffId
        );

        setConsultations((prev) => [transformConsultation(created), ...prev]);
        setSuccessModal({
          title: "Consultation Created",
          message: notices.length
            ? `Consultation saved. ${notices.join(" ")}`
            : "Consultation has been created successfully.",
        });
        setModal(null);
        return;
      }

      if (mode === "edit" && consultationId) {
        const updated = await consultationService.updateRecord(consultationId, updatePayload);
        console.log("[Consultations] Consultation updated", updated);

        const notices = await persistClinicalData(
          consultationId,
          payload.patientId,
          payload.staffId || creationOptions.defaultStaffId || user?.staffId
        );

        setConsultations((prev) => prev.map((c) => (c.id === updated.id ? transformConsultation(updated) : c)));
        setSuccessModal({
          title: "Consultation Updated",
          message: notices.length
            ? `Consultation information updated. ${notices.join(" ")}`
            : "Consultation information has been updated successfully.",
        });
        setModal(null);
        return;
      }

      setSaveError("Unable to save consultation. Please reload and try again.");
    } catch (error) {
      setSaveError(formatApiError(error));
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
                      <button onClick={() => handleOpenEditConsultation(c)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
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
                <button onClick={() => handleOpenEditConsultation(c)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
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
          staff={creationOptions.staff}
          defaultStaffId={creationOptions.defaultStaffId}
          optionsLoading={isOptionsLoading}
          isSaving={isSaving}
          saveError={saveError}
          onSave={handleSaveConsultation}
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
