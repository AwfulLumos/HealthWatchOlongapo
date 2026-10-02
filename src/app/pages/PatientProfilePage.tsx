import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, User, Phone, MapPin, Heart, Activity, Stethoscope, Pill,
  Calendar, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock,
  Edit2, TrendingUp, TrendingDown, Minus, ShieldCheck, Plus, Sparkles,
  ExternalLink, FileSpreadsheet, AlertTriangle
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { patientService } from "../services/patientService";
import { consultationService } from "../services/consultationService";
import { vitalSignsService } from "../services/vitalSignsService";
import { prescriptionService } from "../services/prescriptionService";
import type { Patient } from "../models";
import { formatEntityId } from "../utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(raw: string | undefined): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return raw;
  }
}

function calcAge(dob: string): string {
  if (!dob) return "—";
  try {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    const age = m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? years - 1 : years;
    return age >= 0 ? `${age} years old` : "—";
  } catch {
    return "—";
  }
}

function bpCategory(sys: number, dia: number): { label: string; badge: string; dot: string } {
  if (sys >= 180 || dia >= 120) return { label: "Hypertensive Crisis", badge: "bg-rose-100 text-rose-800 border-rose-200 animate-pulse", dot: "bg-rose-600" };
  if (sys >= 140 || dia >= 90) return { label: "High (Stage 2)", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
  if (sys >= 130 || dia >= 80) return { label: "Elevated", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
  if (sys < 90 || dia < 60) return { label: "Low", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" };
  return { label: "Normal Range", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
}

function bmiCategory(bmi: number): { label: string; badge: string } {
  if (bmi < 18.5) return { label: "Underweight", badge: "bg-sky-50 text-sky-700" };
  if (bmi < 25) return { label: "Normal Weight", badge: "bg-emerald-50 text-emerald-700" };
  if (bmi < 30) return { label: "Overweight", badge: "bg-amber-50 text-amber-700" };
  return { label: "Obese", badge: "bg-rose-50 text-rose-700" };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children, defaultOpen = true, count }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h2>
            {count !== undefined && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {count}
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 text-xs sm:text-sm">
      <span className="text-slate-400 flex items-center gap-2 font-medium">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
      </span>
      <span className="text-slate-800 font-semibold text-right max-w-[65%] truncate">{value || "—"}</span>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse max-w-7xl mx-auto">
      <div className="h-6 bg-slate-200 rounded-lg w-40" />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-52" />
            <div className="h-4 bg-slate-100 rounded w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [p, c, v, rx] = await Promise.all([
          patientService.getById(id),
          consultationService.getByPatientId(id),
          vitalSignsService.getByPatient(id),
          prescriptionService.getByPatient(id),
        ]);
        if (!p) { setNotFound(true); return; }

        const normalized: Patient = {
          ...p,
          barangay: typeof (p as any).barangay === "object" ? (p as any).barangay?.name ?? "N/A" : p.barangay,
        };
        setPatient(normalized);
        setConsultations(Array.isArray(c) ? c : []);
        setVitals(
          (Array.isArray(v) ? v : [])
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
        setPrescriptions(Array.isArray(rx) ? rx : []);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) return <ProfileSkeleton />;

  if (notFound || !patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Patient Record Not Found</h2>
        <p className="text-slate-500 text-xs">
          The requested electronic health record does not exist or may have been unlinked.
        </p>
        <Link
          to="/patients"
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors shadow-xs"
        >
          Return to Patient Registry
        </Link>
      </div>
    );
  }

  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const bpTrend = vitals.slice(-7).map((v: any) => ({
    date: new Date(v.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
    sys: v.bpSystolic,
    dia: v.bpDiastolic,
  }));
  const weightTrend = vitals.slice(-7).map((v: any) => ({
    date: new Date(v.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
    weight: Number(v.weight),
    bmi: Number(v.bmi),
  }));
  const bpStatus = latestVitals ? bpCategory(latestVitals.bpSystolic, latestVitals.bpDiastolic) : null;
  const bmiStatus = latestVitals ? bmiCategory(Number(latestVitals.bmi)) : null;

  return (
    <div className="p-3.5 sm:p-5 lg:p-7 space-y-5 max-w-7xl mx-auto">
      {/* Back Link + Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors text-xs sm:text-sm font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Patient Registry
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            EHR ID: {formatEntityId(patient.id, "PAT")}
          </span>
        </div>
      </div>

      {/* Patient Hero EHR Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-sky-800/40 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 text-slate-900 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/20 flex-shrink-0">
              {patient.firstName?.[0]}{patient.lastName?.[0]}
            </div>

            {/* Patient Header Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${patient.status === "Active"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                  }`}>
                  {patient.status}
                </span>
                {patient.bloodType && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Blood {patient.bloodType}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sky-200/80 font-medium pt-1">
                <span>{calcAge(patient.dob)}</span>
                <span>&bull;</span>
                <span>{patient.gender || "Gender not specified"}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {patient.barangay || "Olongapo City"}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  {patient.contact || "No phone recorded"}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Quick Action Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0">
            <button
              onClick={() => navigate(`/consultations?patientId=${patient.id}`)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Stethoscope className="w-4 h-4" />
              New Consultation
            </button>
            <button
              onClick={() => navigate(`/appointments?patientId=${patient.id}`)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-sky-300" />
              Schedule Visit
            </button>
          </div>
        </div>
      </div>

      {/* Latest Vitals Summary Grid */}
      {latestVitals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* BP */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {latestVitals.bpSystolic}/{latestVitals.bpDiastolic}
              <span className="text-[10px] text-slate-400 ml-1 font-normal">mmHg</span>
            </p>
            {bpStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 ${bpStatus.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${bpStatus.dot}`} />
                {bpStatus.label}
              </span>
            )}
          </div>

          {/* Pulse */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pulse Rate</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {latestVitals.pulseRate}
              <span className="text-[10px] text-slate-400 ml-1 font-normal">bpm</span>
            </p>
            <span className="inline-block text-[10px] font-semibold text-slate-500 mt-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
              Heart Rate
            </span>
          </div>

          {/* Temp */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Body Temp</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {latestVitals.temperature ?? latestVitals.temp}
              <span className="text-[10px] text-slate-400 ml-1 font-normal">°C</span>
            </p>
            <span className="inline-block text-[10px] font-semibold text-slate-500 mt-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
              Axillary
            </span>
          </div>

          {/* Weight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weight</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {latestVitals.weight}
              <span className="text-[10px] text-slate-400 ml-1 font-normal">kg</span>
            </p>
            <span className="inline-block text-[10px] font-semibold text-slate-500 mt-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
              Biometrics
            </span>
          </div>

          {/* BMI */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BMI Index</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {Number(latestVitals.bmi).toFixed(1)}
            </p>
            {bmiStatus && (
              <span className={`inline-block text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${bmiStatus.badge}`}>
                {bmiStatus.label}
              </span>
            )}
          </div>

          {/* Blood Sugar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Sugar</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {latestVitals.bloodSugar || "—"}
              {latestVitals.bloodSugar && <span className="text-[10px] text-slate-400 ml-1 font-normal">mg/dL</span>}
            </p>
            <span className="inline-block text-[10px] font-semibold text-slate-500 mt-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
              Random Glucose
            </span>
          </div>
        </div>
      )}

      {/* Main Two-Column EHR Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Personal Info & Emergency */}
        <div className="lg:col-span-1 space-y-5">
          {/* Demographic Information */}
          <SectionCard title="Demographic Registry" icon={User}>
            <div className="p-4 sm:p-5 space-y-0.5">
              <InfoRow label="Full Legal Name" value={`${patient.firstName} ${patient.lastName}`} />
              <InfoRow label="Date of Birth" value={formatDate(patient.dob)} />
              <InfoRow label="Calculated Age" value={calcAge(patient.dob)} />
              <InfoRow label="Gender" value={patient.gender} />
              <InfoRow label="Civil Status" value={patient.civilStatus} />
              <InfoRow label="Blood Group" value={patient.bloodType} />
              <InfoRow label="PhilHealth PIN" value={patient.philhealth} />
              <InfoRow label="Registration Date" value={formatDate(patient.registered)} />
            </div>
          </SectionCard>

          {/* Residential & Emergency Contacts */}
          <SectionCard title="Contact & Address" icon={MapPin}>
            <div className="p-4 sm:p-5 space-y-0.5">
              <InfoRow label="Contact Phone" value={patient.contact} icon={Phone} />
              <InfoRow label="Barangay" value={patient.barangay} icon={MapPin} />
              <InfoRow label="Street Address" value={patient.address} />
              <InfoRow label="Emergency Contact" value={patient.emergencyContact} />
              <InfoRow label="Emergency Phone" value={patient.emergencyContactNumber} icon={Phone} />
            </div>
          </SectionCard>

          {/* Medical History */}
          <SectionCard title="Medical Background" icon={Heart} count={patient.medicalHistory?.length || 0}>
            <div className="p-4 sm:p-5">
              {!patient.medicalHistory || patient.medicalHistory.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Heart className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">No recorded chronic conditions or allergies</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patient.medicalHistory.map((mh: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-800 text-xs font-semibold">{mh.condition}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mh.status === "Active" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-200 text-slate-600"
                        }`}>
                        {mh.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Consultations, Charts & Prescriptions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Consultation History */}
          <SectionCard title="Consultation History" icon={Stethoscope} count={consultations.length}>
            <div className="p-4 sm:p-5 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
              {consultations.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Consultations Logged</p>
                  <p className="text-xs text-slate-400 mt-0.5">Start a consultation session for this patient</p>
                  <button
                    onClick={() => navigate(`/consultations?patientId=${patient.id}`)}
                    className="mt-3 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition-colors"
                  >
                    Start Consultation
                  </button>
                </div>
              ) : (
                [...consultations]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-sky-200 bg-slate-50/50 hover:bg-sky-50/30 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 uppercase">
                              {c.type || "General Visit"}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {c.chiefComplaint || "Routine Checkup"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Diagnosis: </span>
                            {c.diagnosis || "Under Observation"}
                            {c.icdCode && <span className="text-slate-400 font-mono text-[11px] ml-1">({c.icdCode})</span>}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            Attending Clinician: {typeof c.staff === "string" ? c.staff : `${c.staff?.firstName ?? ""} ${c.staff?.lastName ?? ""}`.trim() || "City Health Staff"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-600 block">
                            {formatDate(c.date)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 mt-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {c.status || "Completed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </SectionCard>

          {/* Biometrics & Vitals Trends Chart */}
          {vitals.length >= 2 && (
            <SectionCard title="Longitudinal Vital Signs Trend" icon={Activity}>
              <div className="p-4 sm:p-5 space-y-6">
                {/* BP Area Chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Blood Pressure Profile (mmHg)
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Systolic
                      </span>
                      <span className="flex items-center gap-1 text-sky-600">
                        <span className="w-2 h-2 rounded-full bg-sky-500" /> Diastolic
                      </span>
                    </div>
                  </div>

                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bpTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.01} />
                          </linearGradient>
                          <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "none",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "11px",
                          }}
                        />
                        <Area type="monotone" dataKey="sys" name="Systolic" stroke="#f43f5e" strokeWidth={2} fill="url(#sysGradient)" />
                        <Area type="monotone" dataKey="dia" name="Diastolic" stroke="#0ea5e9" strokeWidth={2} fill="url(#diaGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Weight & BMI Trend */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Weight (kg) &amp; Body Mass Index
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-teal-600">
                        <span className="w-2 h-2 rounded-full bg-teal-500" /> Weight
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> BMI
                      </span>
                    </div>
                  </div>

                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "none",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "11px",
                          }}
                        />
                        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="bmi" name="BMI" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Active Prescriptions & Medications */}
          <SectionCard title="Active Prescriptions & Regimens" icon={Pill} count={prescriptions.length}>
            <div className="p-4 sm:p-5 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
              {prescriptions.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Pill className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">No medication prescriptions on record</p>
                </div>
              ) : (
                [...prescriptions]
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((rx: any) => (
                    <div
                      key={rx.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{rx.medicine}</p>
                          <p className="text-slate-600 text-xs mt-0.5">
                            {rx.dosage} &bull; {rx.frequency} &bull; {rx.duration}
                          </p>
                          {rx.instructions && (
                            <p className="text-slate-400 text-[11px] italic mt-0.5">{rx.instructions}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium block">
                          Prescribed on {formatDate(rx.date)}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
