import { useState, useEffect } from "react";
import { Search, Pill, Eye, X } from "lucide-react";
import { prescriptionService } from "../services/prescriptionService";
import { PrescriptionsSkeleton } from "../components/skeletons/PrescriptionsSkeleton";
import { formatEntityId } from "../utils";

function ViewModal({ rx, onClose }: { rx: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Prescription Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Rx Header */}
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-blue-800">{rx.medicine}</p>
              <p className="text-xs sm:text-sm text-blue-500">{rx.dosage} &bull; {rx.frequency}</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[
              { label: "Prescription ID", value: formatEntityId(rx.id, "RX") },
              { label: "Consultation ID", value: formatEntityId(rx.consultId, "CON") },
              { label: "Patient", value: rx.patient },
              { label: "Prescribed by", value: rx.doctor },
              { label: "Date", value: rx.date },
              { label: "Duration", value: rx.duration },
              { label: "Instructions", value: rx.instructions },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 sm:py-1.5 border-b border-gray-50">
                <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
                <span className="text-gray-800 text-xs sm:text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      const data = await prescriptionService.getAll();
      // Transform nested patient/doctor objects to flat strings
      const transformed = data.map((rx: any) => ({
        ...rx,
        patient: typeof rx.patient === 'object' 
          ? `${rx.patient?.firstName || ''} ${rx.patient?.lastName || ''}`.trim() 
          : rx.patient || "Unknown",
        doctor: typeof rx.doctor === 'object' 
          ? `${rx.doctor?.firstName || ''} ${rx.doctor?.lastName || ''}`.trim() 
          : rx.doctor || "Unknown",
        consultId: rx.consultId || rx.consultation?.id || "N/A",
      }));
      setPrescriptions(transformed);
      setIsLoading(false);
    };
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter(rx =>
    `${rx.patient} ${rx.medicine} ${rx.id} ${rx.consultId}`.toLowerCase().includes(search.toLowerCase())
  );

  // Group by consultation
  const grouped: Record<string, any[]> = {};
  filtered.forEach(rx => {
    if (!grouped[rx.consultId]) grouped[rx.consultId] = [];
    grouped[rx.consultId].push(rx);
  });

  if (isLoading) {
    return <PrescriptionsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-xs sm:text-sm text-gray-500">View all prescribed medications per consultation</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient, medicine, or consultation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm" />
      </div>

      {/* Grouped by consultation */}
      <div className="space-y-3 sm:space-y-4">
        {Object.entries(grouped).map(([consultId, rxList]) => (
          <div key={consultId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-5 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-blue-600 text-xs sm:text-sm font-bold" title={consultId}>{formatEntityId(consultId, "CON")}</span>
                <span className="text-gray-500 hidden sm:inline">&mdash;</span>
                <span className="text-gray-700 text-xs sm:text-sm font-medium">{rxList[0].patient}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-[0.65rem] sm:text-xs">Prescribed by {rxList[0].doctor} on {rxList[0].date}</span>
              </div>
            </div>
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {rxList.map(rx => (
                <div key={rx.id} className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 text-xs sm:text-sm font-bold">{rx.medicine}</p>
                        <p className="text-gray-400 text-[0.65rem] sm:text-xs" title={rx.id}>{formatEntityId(rx.id, "RX")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(rx)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[0.65rem] sm:text-xs">Dosage</span>
                      <span className="text-gray-700 text-[0.65rem] sm:text-xs font-medium">{rx.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[0.65rem] sm:text-xs">Frequency</span>
                      <span className="text-gray-700 text-[0.65rem] sm:text-xs font-medium">{rx.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[0.65rem] sm:text-xs">Duration</span>
                      <span className="text-gray-700 text-[0.65rem] sm:text-xs font-medium">{rx.duration}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-50 mt-1">
                      <p className="text-gray-500 italic text-[0.65rem] sm:text-xs">{rx.instructions}</p>
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
