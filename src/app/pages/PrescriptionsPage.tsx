import { useState } from "react";
import { Search, Pill, Eye, X } from "lucide-react";
import { mockPrescriptions } from "../statics/prescriptions";

function ViewModal({ rx, onClose }: { rx: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Prescription Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Rx Header */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-blue-800" style={{ fontSize: "1rem", fontWeight: 700 }}>{rx.medicine}</p>
              <p className="text-blue-500" style={{ fontSize: "0.8rem" }}>{rx.dosage} &bull; {rx.frequency}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Prescription ID", value: rx.id },
              { label: "Consultation ID", value: rx.consultId },
              { label: "Patient", value: rx.patient },
              { label: "Prescribed by", value: rx.doctor },
              { label: "Date", value: rx.date },
              { label: "Duration", value: rx.duration },
              { label: "Instructions", value: rx.instructions },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400" style={{ fontSize: "0.8rem" }}>{label}</span>
                <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
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

  const filtered = mockPrescriptions.filter(rx =>
    `${rx.patient} ${rx.medicine} ${rx.id} ${rx.consultId}`.toLowerCase().includes(search.toLowerCase())
  );

  // Group by consultation
  const grouped: Record<string, typeof mockPrescriptions> = {};
  filtered.forEach(rx => {
    if (!grouped[rx.consultId]) grouped[rx.consultId] = [];
    grouped[rx.consultId].push(rx);
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Prescriptions</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>View all prescribed medications per consultation</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient, medicine, or consultation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }} />
      </div>

      {/* Grouped by consultation */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([consultId, rxList]) => (
          <div key={consultId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-blue-600" style={{ fontSize: "0.85rem", fontWeight: 700 }}>{consultId}</span>
                <span className="text-gray-500 mx-2">&mdash;</span>
                <span className="text-gray-700" style={{ fontSize: "0.85rem", fontWeight: 500 }}>{rxList[0].patient}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>Prescribed by {rxList[0].doctor} on {rxList[0].date}</span>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rxList.map(rx => (
                <div key={rx.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-gray-800" style={{ fontSize: "0.875rem", fontWeight: 700 }}>{rx.medicine}</p>
                        <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{rx.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(rx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>Dosage</span>
                      <span className="text-gray-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{rx.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>Frequency</span>
                      <span className="text-gray-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{rx.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>Duration</span>
                      <span className="text-gray-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{rx.duration}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-50 mt-1">
                      <p className="text-gray-500 italic" style={{ fontSize: "0.72rem" }}>{rx.instructions}</p>
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
