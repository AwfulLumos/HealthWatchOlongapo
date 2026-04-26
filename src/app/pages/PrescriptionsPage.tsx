import { useState, useEffect } from "react";
import { Search, Pill, Eye, X, CalendarDays } from "lucide-react";
import { prescriptionService } from "../services/prescriptionService";
import { PrescriptionsSkeleton } from "../components/skeletons/PrescriptionsSkeleton";
import { formatDate, formatEntityId } from "../utils";

function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toDisplayDate(value: unknown): string {
  if (!value) return "No date";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return formatDate(parsed, "long");
}

function ViewModal({ rx, onClose }: { rx: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Prescription Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-blue-800 truncate">{rx.medicine}</p>
              <p className="text-xs sm:text-sm text-blue-500 break-words">{rx.dosage} • {rx.frequency}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Prescription ID", value: formatEntityId(rx.id, "RX") },
              { label: "Consultation ID", value: formatEntityId(rx.consultId, "CON") },
              { label: "Patient", value: rx.patient || "Unknown" },
              { label: "Prescribed by", value: rx.doctor || "Unknown" },
              { label: "Date", value: rx.date || "No date" },
              { label: "Duration", value: rx.duration || "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-gray-100 pb-2">
                <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
                <span className="text-gray-800 text-xs sm:text-sm font-medium break-words">{value}</span>
              </div>
            ))}
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Instructions</p>
              <p className="text-sm text-gray-700 italic break-words leading-relaxed">
                {rx.instructions || "No instructions provided."}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      console.log("[Prescriptions] Fetching list");
      const data = await prescriptionService.getAll();

      const transformed = data.map((rx: any) => ({
        ...rx,
        patient:
          typeof rx.patient === "object"
            ? `${rx.patient?.firstName || ""} ${rx.patient?.lastName || ""}`.trim()
            : rx.patient || "Unknown",
        doctor:
          typeof rx.doctor === "object"
            ? `${rx.doctor?.firstName || ""} ${rx.doctor?.lastName || ""}`.trim()
            : rx.doctor || "Unknown",
        consultId: rx.consultId || rx.consultation?.id || "N/A",
        rawDate: rx.date,
        date: toDisplayDate(rx.date),
      }));

      setPrescriptions(transformed);
      console.log("[Prescriptions] List loaded", {
        count: transformed.length,
        consultations: new Set(transformed.map((rx) => rx.consultId)).size,
      });
      setIsLoading(false);
    };

    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${rx.patient} ${rx.medicine} ${rx.id} ${rx.consultId}`
        .toLowerCase()
        .includes(query);

    const matchesDate = !dateFilter || toDateInputValue(rx.rawDate || rx.date) === dateFilter;

    return matchesSearch && matchesDate;
  });

  const grouped: Record<string, any[]> = {};
  filtered.forEach((rx) => {
    if (!grouped[rx.consultId]) grouped[rx.consultId] = [];
    grouped[rx.consultId].push(rx);
  });

  const groupedEntries = Object.entries(grouped).map(([consultId, rxList]) => {
    const sorted = [...rxList].sort(
      (a, b) =>
        new Date(String(b.rawDate || b.date)).getTime() -
        new Date(String(a.rawDate || a.date)).getTime()
    );
    return [consultId, sorted] as const;
  });

  const showClearFilters = Boolean(search.trim() || dateFilter);

  if (isLoading) {
    return <PrescriptionsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-1">View all prescribed medications per consultation</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
            {filtered.length} medication{filtered.length === 1 ? "" : "s"}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
            {groupedEntries.length} consultation{groupedEntries.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, medicine, or consultation ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
            />
          </div>
          <div className="relative lg:w-56">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
            />
          </div>
          {showClearFilters && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {groupedEntries.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-10 text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">No prescriptions found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or date filter.</p>
          </div>
        )}

        {groupedEntries.map(([consultId, rxList]) => (
          <div key={consultId} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 text-xs font-semibold tracking-wide"
                    title={consultId}
                  >
                    {formatEntityId(consultId, "CON")}
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base font-semibold truncate">{rxList[0].patient}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  {rxList.length} prescription{rxList.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 lg:text-right">
                <p>
                  Prescribed by <span className="text-gray-700 font-medium">{rxList[0].doctor}</span>
                </p>
                <p>{rxList[0].date}</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
              {rxList.map((rx) => (
                <div
                  key={rx.id}
                  className="h-full border border-gray-200 rounded-2xl p-4 bg-gradient-to-b from-white to-slate-50/40 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm sm:text-base font-semibold truncate">{rx.medicine}</p>
                        <p className="text-gray-500 text-xs" title={rx.id}>{formatEntityId(rx.id, "RX")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(rx)}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      aria-label="View prescription details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2 items-start">
                      <div className="rounded-lg border border-gray-200 bg-white p-2 min-h-[70px]">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Dosage</p>
                        <p
                          className="text-gray-700 font-medium mt-0.5 break-words leading-snug overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                          title={rx.dosage || "N/A"}
                        >
                          {rx.dosage || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-2 min-h-[70px]">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Frequency</p>
                        <p
                          className="text-gray-700 font-medium mt-0.5 break-words leading-snug overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                          title={rx.frequency || "N/A"}
                        >
                          {rx.frequency || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-2 min-h-[60px]">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">Duration</p>
                      <p
                        className="text-gray-700 font-medium mt-0.5 break-words leading-snug overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]"
                        title={rx.duration || "N/A"}
                      >
                        {rx.duration || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
                      <p className="text-[11px] uppercase tracking-wide text-blue-400">Instructions</p>
                      <p
                        className="text-gray-700 text-sm italic mt-1 break-words leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                        title={rx.instructions || "No instructions provided."}
                      >
                        {rx.instructions || "No instructions provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && <ViewModal rx={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
