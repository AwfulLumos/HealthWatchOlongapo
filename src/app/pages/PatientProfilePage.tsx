import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, User, Phone, MapPin, Heart, Activity, Stethoscope, Pill,
  Calendar, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock,
  Edit2, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  const age = m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? years - 1 : years;
  return `${age} yrs`;
}

function bpCategory(sys: number, dia: number): { label: string; color: string } {
  if (sys >= 180 || dia >= 120) return { label: "Hypertensive Crisis", color: "text-red-700" };
  if (sys >= 140 || dia >= 90) return { label: "High", color: "text-red-500" };
  if (sys >= 130 || dia >= 80) return { label: "Elevated", color: "text-orange-500" };
  if (sys < 90 || dia < 60) return { label: "Low", color: "text-blue-500" };
  return { label: "Normal", color: "text-green-600" };
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-red-500" };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
      <span className="text-gray-800 text-xs sm:text-sm font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-32" />
      ))}
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
        // Normalize patient barangay field
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
      <div className="p-6 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600 font-medium">Patient not found.</p>
        <button onClick={() => navigate("/patients")} className="text-blue-600 hover:underline text-sm">
          Back to Patients
        </button>
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

  const consultTypeColor: Record<string, string> = {
    Regular: "bg-blue-100 text-blue-700",
    FollowUp: "bg-teal-100 text-teal-700",
    "Follow-up": "bg-teal-100 text-teal-700",
    Emergency: "bg-red-100 text-red-700",
  };
  const consultStatusIcon: Record<string, React.ReactNode> = {
    Completed: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
    InProgress: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    "In Progress": <Clock className="w-3.5 h-3.5 text-amber-500" />,
    Referred: <TrendingUp className="w-3.5 h-3.5 text-violet-600" />,
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 animate-fade-in">

      {/* Back + Actions */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>
        <button
          onClick={() => navigate("/patients")}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit Patient
        </button>
      </div>

      {/* Patient Hero Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-card animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-blue-700 text-lg sm:text-2xl font-bold flex-shrink-0 shadow-sm">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
              <h1 className="text-gray-900 text-lg sm:text-2xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold ${patient.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {patient.status}
              </span>
            </div>
            <p className="text-blue-600 text-xs sm:text-sm font-mono mt-0.5">{formatEntityId(patient.id, "PAT")}</p>

            {/* Quick Stats */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { icon: User, label: "Age", value: calcAge(patient.dob) },
                { icon: Heart, label: "Blood Type", value: patient.bloodType || "Unknown" },
                { icon: MapPin, label: "Barangay", value: patient.barangay },
                { icon: Phone, label: "Contact", value: patient.contact },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem]">{label}</p>
                    <p className="text-gray-800 text-[0.7rem] sm:text-xs font-semibold truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Vitals Summary */}
      {latestVitals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 animate-fade-in-up animation-delay-100">
          {[
            { label: "Blood Pressure", value: `${latestVitals.bpSystolic}/${latestVitals.bpDiastolic}`, sub: bpStatus?.label, subColor: bpStatus?.color, unit: "mmHg" },
            { label: "Pulse Rate", value: latestVitals.pulseRate, unit: "bpm" },
            { label: "Temperature", value: latestVitals.temperature ?? latestVitals.temp, unit: "°C" },
            { label: "Weight", value: latestVitals.weight, unit: "kg" },
            { label: "BMI", value: Number(latestVitals.bmi).toFixed(1), sub: bmiStatus?.label, subColor: bmiStatus?.color },
            { label: "Blood Sugar", value: latestVitals.bloodSugar ?? "N/A", unit: latestVitals.bloodSugar ? "mg/dL" : "" },
          ].map(({ label, value, unit, sub, subColor }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-card hover:shadow-card-hover transition-all">
              <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem]">{label}</p>
              <p className="text-gray-900 text-base sm:text-lg font-bold mt-0.5">
                {value} <span className="text-gray-400 text-[0.6rem] font-normal">{unit}</span>
              </p>
              {sub && <p className={`text-[0.6rem] font-medium mt-0.5 ${subColor}`}>{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Left column: Personal Info + Medical History */}
        <div className="lg:col-span-1 space-y-4">

          {/* Personal Information */}
          <SectionCard title="Personal Information" icon={User}>
            <div className="p-4 space-y-0">
              <InfoRow label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
              <InfoRow label="Date of Birth" value={formatDate(patient.dob)} />
              <InfoRow label="Age" value={calcAge(patient.dob)} />
              <InfoRow label="Gender" value={patient.gender} />
              <InfoRow label="Civil Status" value={patient.civilStatus} />
              <InfoRow label="Blood Type" value={patient.bloodType} />
              <InfoRow label="PhilHealth No." value={patient.philhealth} />
              <InfoRow label="Registered" value={formatDate(patient.registered)} />
            </div>
          </SectionCard>

          {/* Contact & Location */}
          <SectionCard title="Contact & Location" icon={MapPin}>
            <div className="p-4 space-y-0">
              <InfoRow label="Contact" value={patient.contact} />
              <InfoRow label="Address" value={patient.address} />
              <InfoRow label="Barangay" value={patient.barangay} />
              <InfoRow label="Emergency Contact" value={patient.emergencyContact} />
              <InfoRow label="Emergency No." value={patient.emergencyContactNumber} />
            </div>
          </SectionCard>

          {/* Medical History */}
          <SectionCard title="Medical History" icon={Heart}>
            <div className="p-4">
              {(!patient.medicalHistory || patient.medicalHistory.length === 0) ? (
                <p className="text-gray-400 text-xs sm:text-sm py-2 text-center">No medical history recorded.</p>
              ) : (
                <div className="space-y-2">
                  {patient.medicalHistory.map((mh: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 text-xs sm:text-sm">{mh.condition}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] sm:text-xs font-medium ${mh.status === "Active" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                        {mh.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right column: Consultations + Vitals Chart + Prescriptions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Consultation History */}
          <SectionCard title={`Consultation History (${consultations.length})`} icon={Stethoscope}>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {consultations.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm py-2 text-center">No consultations recorded.</p>
              ) : (
                [...consultations]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((c: any) => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium ${consultTypeColor[c.type] ?? "bg-gray-100 text-gray-600"}`}>
                            {c.type}
                          </span>
                          <p className="text-gray-800 text-xs sm:text-sm font-semibold truncate">{c.chiefComplaint}</p>
                        </div>
                        <p className="text-gray-500 text-[0.65rem] sm:text-xs mt-0.5">
                          Dx: <span className="font-medium">{c.diagnosis}</span>
                          {c.icdCode && <span className="text-gray-400 ml-1">({c.icdCode})</span>}
                        </p>
                        <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem] mt-0.5">
                          {typeof c.staff === "string" ? c.staff : `${c.staff?.firstName ?? ""} ${c.staff?.lastName ?? ""}`.trim() || "—"}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {consultStatusIcon[c.status] ?? <Minus className="w-3.5 h-3.5 text-gray-400" />}
                          <span className="text-[0.6rem] sm:text-xs text-gray-500">{c.status}</span>
                        </div>
                        <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem]">{formatDate(c.date)}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </SectionCard>

          {/* Vital Signs Charts */}
          {vitals.length >= 2 && (
            <SectionCard title="Vital Signs Trends" icon={Activity}>
              <div className="p-4 space-y-5">
                {/* Blood Pressure trend */}
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-2">Blood Pressure (mmHg)</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={bpTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9CA3AF" }} width={28} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      <Line type="monotone" dataKey="sys" name="Systolic" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Weight & BMI trend */}
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-2">Weight (kg) &amp; BMI</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={weightTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} width={28} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      <Line type="monotone" dataKey="weight" name="Weight" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="bmi" name="BMI" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Prescriptions */}
          <SectionCard title={`Prescriptions (${prescriptions.length})`} icon={Pill} defaultOpen={false}>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {prescriptions.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm py-2 text-center">No prescriptions recorded.</p>
              ) : (
                [...prescriptions]
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((rx: any) => (
                    <div key={rx.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs sm:text-sm font-semibold">{rx.medicine}</p>
                        <p className="text-gray-500 text-[0.65rem] sm:text-xs mt-0.5">
                          {rx.dosage} · {rx.frequency} · {rx.duration}
                        </p>
                        {rx.instructions && (
                          <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem] mt-0.5 italic">{rx.instructions}</p>
                        )}
                      </div>
                      <p className="text-gray-400 text-[0.6rem] sm:text-[0.65rem] flex-shrink-0">{formatDate(rx.date)}</p>
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
