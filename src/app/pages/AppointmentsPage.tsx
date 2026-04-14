import { useState, useEffect, type FormEvent } from "react";
import { Search, Plus, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { appointmentService, type AppointmentCreationOptions } from "../services/appointmentService";
import { AppointmentsSkeleton, AppointmentsCalendarSkeleton } from "../components/skeletons/AppointmentsSkeleton";
import { FormLoadingOverlay } from "../components/feedback/FormLoadingOverlay";
import { StatusModal } from "../components/feedback/StatusModal";
import type { AppointmentStatus } from "../models";
import { formatEntityId } from "../utils";

const statusColor: Record<AppointmentStatus, string> = {
  Confirmed: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-600 bg-orange-50 border-orange-200",
  Completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Cancelled: "text-gray-600 bg-gray-50 border-gray-200",
};

const calendarChipColor: Record<AppointmentStatus, string> = {
  Confirmed: "bg-blue-500",
  Pending: "bg-amber-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-gray-500",
};

const defaultCreationOptions: AppointmentCreationOptions = {
  patients: [],
  staff: [],
};

type StatusFilter = "All Status" | AppointmentStatus;

type AppointmentRecord = {
  id: string;
  patient: string;
  patientId: string;
  staff: string;
  staffId: string;
  scheduledDate: string;
  purpose: string;
  status: AppointmentStatus;
  notes?: string;
};

type AppointmentModalMode = "view" | "add" | "edit";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const APPOINTMENT_QUERY_LIMIT = 100;
const APPOINTMENT_MAX_PAGES = 20;

function toDateTimeInputValue(value?: string): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneAdjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return timezoneAdjusted.toISOString().slice(0, 16);
}

function formatDateForDisplay(value?: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAppointments(data: any[]): AppointmentRecord[] {
  return data.map((a: any) => ({
    id: a.id,
    patient: typeof a.patient === "object"
      ? `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.trim()
      : a.patient || "Unknown",
    patientId: a.patientId || a.patient?.id || "N/A",
    staff: typeof a.staff === "object"
      ? `${a.staff?.firstName || ""} ${a.staff?.lastName || ""}`.trim()
      : a.staff || "Unknown",
    staffId: a.staffId || a.staff?.id || "",
    scheduledDate: a.scheduledDate,
    purpose: a.purpose || "",
    status: (a.status || "Pending") as AppointmentStatus,
    notes: a.notes,
  }));
}

function getCalendarGridDates(baseMonth: Date): Date[] {
  const firstOfMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
  const startDay = firstOfMonth.getDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function AppointmentModal({
  appt,
  onClose,
  onSaved,
  options,
  optionsLoading,
  mode,
}: {
  appt?: AppointmentRecord;
  onClose: () => void;
  onSaved: (mode: Exclude<AppointmentModalMode, "view">) => Promise<void>;
  options: AppointmentCreationOptions;
  optionsLoading: boolean;
  mode: AppointmentModalMode;
}) {
  const [form, setForm] = useState({
    patientId: "",
    staffId: "",
    scheduledDate: "",
    purpose: "",
    status: "Pending" as AppointmentStatus,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      patientId: appt?.patientId || "",
      staffId: appt?.staffId || options.defaultStaffId || "",
      scheduledDate: toDateTimeInputValue(appt?.scheduledDate),
      purpose: appt?.purpose || "",
      status: (appt?.status || "Pending") as AppointmentStatus,
      notes: appt?.notes || "",
    });
    setError(null);
  }, [appt, options.defaultStaffId, mode]);

  const selectedPatientName =
    options.patients.find((patient) => patient.id === (appt?.patientId || form.patientId))?.fullName ||
    appt?.patient ||
    "-";
  const selectedStaffName =
    options.staff.find((staff) => staff.id === (appt?.staffId || form.staffId))?.fullName ||
    appt?.staff ||
    "-";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "view") {
      return;
    }

    if (!form.patientId || !form.staffId || !form.scheduledDate || !form.purpose.trim()) {
      setError("Patient, staff, date/time, and purpose are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      patientId: form.patientId,
      staffId: form.staffId,
      scheduledDate: form.scheduledDate,
      purpose: form.purpose.trim(),
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    console.log("[Appointments] Save requested", {
      mode,
      payload,
      appointmentId: appt?.id,
    });

    try {
      if (mode === "add") {
        const created = await appointmentService.create(payload);
        console.log("[Appointments] Create response", created);
        if (!created) {
          setError("Unable to schedule appointment. Please check your inputs and try again.");
          return;
        }
        await onSaved("add");
      } else if (appt?.id) {
        const updated = await appointmentService.update(appt.id, payload);
        console.log("[Appointments] Update response", updated);
        if (!updated) {
          setError("Unable to update appointment. Please check your inputs and try again.");
          return;
        }
        await onSaved("edit");
      }
      onClose();
    } catch (error) {
      console.error("[Appointments] Save failed", error);
      setError("Failed to save appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
            {mode === "add" ? "Schedule Appointment" : mode === "edit" ? "Edit Appointment" : "Appointment Details"}
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="w-5 h-5" />
          </button>
        </div>

        <FormLoadingOverlay open={isSubmitting} title={mode === "add" ? "Scheduling appointment..." : "Updating appointment..."} message="Syncing with backend" />

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Patient</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{selectedPatientName}</p>
              ) : (
                <select
                  value={form.patientId}
                  onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={optionsLoading || isSubmitting}
                >
                  <option value="">Select patient</option>
                  {options.patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Staff / Doctor</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{selectedStaffName}</p>
              ) : (
                <select
                  value={form.staffId}
                  onChange={(event) => setForm((prev) => ({ ...prev, staffId: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={optionsLoading || isSubmitting}
                >
                  <option value="">Select staff</option>
                  {options.staff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Scheduled Date & Time</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{formatDateForDisplay(appt?.scheduledDate)}</p>
              ) : (
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledDate: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Purpose</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{appt?.purpose || "-"}</p>
              ) : (
                <input
                  type="text"
                  value={form.purpose}
                  onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Status</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{appt?.status || "-"}</p>
              ) : (
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as AppointmentStatus }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={isSubmitting}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Notes</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{appt?.notes || "-"}</p>
              ) : (
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                  disabled={isSubmitting}
                />
              )}
            </div>

            {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
          </div>

          {mode !== "view" && (
            <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-gray-50/50">
              <button type="button" onClick={onClose} className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm">Cancel</button>
              <button
                type="submit"
                disabled={isSubmitting || optionsLoading}
                className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : mode === "add" ? "Schedule" : "Update"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [modal, setModal] = useState<{ mode: AppointmentModalMode; appt?: AppointmentRecord } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<AppointmentRecord[]>([]);
  const [creationOptions, setCreationOptions] = useState<AppointmentCreationOptions>(defaultCreationOptions);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const fetchPagedAppointments = async (params: {
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const all: any[] = [];

    console.log("[Appointments] Fetching paged data", params);

    for (let page = 1; page <= APPOINTMENT_MAX_PAGES; page++) {
      const chunk = await appointmentService.getAll({
        ...params,
        page,
        limit: APPOINTMENT_QUERY_LIMIT,
      });

      console.log("[Appointments] Page fetched", {
        page,
        count: chunk.length,
      });

      all.push(...chunk);

      if (chunk.length < APPOINTMENT_QUERY_LIMIT) {
        break;
      }
    }

    return all;
  };

  const loadAppointments = async () => {
    const params: {
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
    } = {};

    if (statusFilter !== "All Status") {
      params.status = statusFilter;
    }

    if (dateFilter) {
      params.startDate = dateFilter;
      params.endDate = dateFilter;
    }

    const data = await fetchPagedAppointments(params);
    setAppointments(normalizeAppointments(data));
    console.log("[Appointments] List loaded", { count: data.length });
  };

  const loadCalendarAppointments = async (month: Date) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const params: {
      startDate: string;
      endDate: string;
      status?: AppointmentStatus;
    } = {
      startDate: formatDateForApi(start),
      endDate: formatDateForApi(end),
    };

    if (statusFilter !== "All Status") {
      params.status = statusFilter;
    }

    const data = await fetchPagedAppointments(params);
    setCalendarAppointments(normalizeAppointments(data));
    console.log("[Appointments] Calendar month loaded", {
      month: formatDateForApi(start),
      count: data.length,
    });
  };

  const loadCreationOptions = async () => {
    setIsOptionsLoading(true);
    try {
      const options = await appointmentService.getCreationOptions();
      setCreationOptions(options);
      console.log("[Appointments] Creation options loaded", {
        patients: options.patients.length,
        staff: options.staff.length,
      });
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const handleSavedAppointment = async (mode: Exclude<AppointmentModalMode, "view">) => {
    await Promise.all([loadAppointments(), loadCalendarAppointments(calendarMonth)]);
    setSuccessModal({
      title: mode === "add" ? "Appointment Scheduled" : "Appointment Updated",
      message:
        mode === "add"
          ? "The new appointment was saved successfully."
          : "The appointment changes were saved successfully.",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([loadAppointments(), loadCreationOptions(), loadCalendarAppointments(calendarMonth)]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void loadAppointments();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void loadCalendarAppointments(calendarMonth);
  }, [calendarMonth, statusFilter]);

  const filtered = appointments.filter((a) =>
    `${a.patient} ${a.id} ${a.purpose}`.toLowerCase().includes(search.toLowerCase())
  );

  const calendarDays = getCalendarGridDates(calendarMonth);
  const appointmentsByDate = calendarAppointments.reduce<Record<string, AppointmentRecord[]>>((acc, appointment) => {
    const key = formatDateForApi(new Date(appointment.scheduledDate));
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(appointment);
    return acc;
  }, {});

  Object.values(appointmentsByDate).forEach((items) => {
    items.sort((left, right) => new Date(left.scheduledDate).getTime() - new Date(right.scheduledDate).getTime());
  });

  const monthLabel = calendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return view === "list" ? <AppointmentsSkeleton /> : <AppointmentsCalendarSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage patient appointments and schedules</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm ${view === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm ${view === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => {
              setSuccessModal(null);
              setModal({ mode: "add" });
            }}
            className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Schedule</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm"
          >
            <option value="All Status">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              const value = event.target.value;
              setDateFilter(value);
              if (value) {
                const selectedDate = new Date(`${value}T00:00:00`);
                if (!Number.isNaN(selectedDate.getTime())) {
                  setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
                }
              }
            }}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm"
          />
        </div>
      </div>

      {view === "list" ? (
        <>
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Appt ID", "Patient", "Staff / Doctor", "Scheduled Date", "Purpose", "Status", "Notes", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                        No appointments found. {appointments.length === 0 ? "Click 'Schedule Appointment' to add one." : "Try adjusting your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a, i) => (
                      <tr key={a.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 text-sm font-semibold" title={a.id}>{formatEntityId(a.id, "APT")}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-800 text-sm font-semibold">{a.patient}</p>
                          <p className="text-gray-400 text-xs" title={a.patientId}>{formatEntityId(a.patientId, "PAT")}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{a.staff}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {formatDateForDisplay(a.scheduledDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{a.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 max-w-[100px] xl:max-w-[180px] text-xs">
                          <span className="truncate block overflow-hidden">{a.notes || "-"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setModal({ mode: "view", appt: a })} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors">View</button>
                            <button onClick={() => {
                              setSuccessModal(null);
                              setModal({ mode: "edit", appt: a });
                            }} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded text-xs transition-colors">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No appointments found. {appointments.length === 0 ? "Click 'Schedule Appointment' to add one." : "Try adjusting your search."}
              </div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-blue-600 text-xs font-semibold" title={a.id}>{formatEntityId(a.id, "APT")}</span>
                      <p className="text-gray-800 text-sm font-semibold mt-0.5">{a.patient}</p>
                      <p className="text-gray-400 text-xs" title={a.patientId}>{formatEntityId(a.patientId, "PAT")}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[0.65rem] font-medium ${statusColor[a.status]}`}>{a.status}</span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Staff</span>
                      <span className="text-gray-600 text-xs">{a.staff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Date</span>
                      <span className="text-gray-600 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {formatDateForDisplay(a.scheduledDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Purpose</span>
                      <span className="text-gray-600 text-xs">{a.purpose}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-50 pt-3">
                    <button onClick={() => setModal({ mode: "view", appt: a })} className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors border border-gray-200">View</button>
                    <button onClick={() => {
                      setSuccessModal(null);
                      setModal({ mode: "edit", appt: a });
                    }} className="flex-1 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200">Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-gray-800 text-sm sm:text-base font-bold">{monthLabel}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 mb-2">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-gray-400 py-1 sm:py-2 text-[0.65rem] sm:text-xs font-semibold">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
            {calendarDays.map((day, index) => {
              const dateKey = formatDateForApi(day);
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

              return (
                <div
                  key={`${dateKey}-${index}`}
                  className={`min-h-[50px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border transition-colors ${isCurrentMonth ? "border-gray-100 hover:bg-gray-50" : "border-gray-50 bg-gray-50/30"} ${dayAppointments.length ? "border-blue-200 bg-blue-50/30" : ""}`}
                >
                  <p className={`mb-0.5 sm:mb-1 text-[0.65rem] sm:text-sm ${isCurrentMonth ? "text-gray-600" : "text-gray-400"} ${dayAppointments.length ? "font-bold text-blue-700" : "font-normal"}`}>
                    {day.getDate()}
                  </p>

                  {dayAppointments.length > 0 && (
                    <div className="space-y-0.5 hidden sm:block">
                      {dayAppointments.slice(0, 2).map((appt) => {
                        const timeLabel = new Date(appt.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <button
                            key={appt.id}
                            onClick={() => setModal({ mode: "view", appt })}
                            className={`w-full text-left text-white px-1 py-0.5 rounded truncate text-[0.5rem] sm:text-[0.6rem] ${calendarChipColor[appt.status]}`}
                            title={`${timeLabel} - ${appt.patient}`}
                          >
                            {timeLabel} {appt.patient}
                          </button>
                        );
                      })}
                      {dayAppointments.length > 2 && (
                        <p className="text-[0.55rem] text-gray-500">+{dayAppointments.length - 2} more</p>
                      )}
                    </div>
                  )}

                  {dayAppointments.length > 0 && (
                    <div className="sm:hidden flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[0.55rem] text-gray-500">{dayAppointments.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <AppointmentModal
          mode={modal.mode}
          appt={modal.appt}
          options={creationOptions}
          optionsLoading={isOptionsLoading}
          onSaved={handleSavedAppointment}
          onClose={() => setModal(null)}
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
