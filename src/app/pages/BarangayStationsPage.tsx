import { useState } from "react";
import { Plus, MapPin, Phone, Users, Stethoscope, X, Edit2 } from "lucide-react";
import { mockStations } from "../statics/stations";

function StationModal({ station, onClose, mode }: { station?: any; onClose: () => void; mode: "view" | "add" | "edit" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {mode === "add" ? "Add Barangay Station" : mode === "edit" ? "Edit Station" : "Station Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "view" && station && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontSize: "1rem", fontWeight: 700 }}>{station.name}</p>
                  <p className="text-blue-600" style={{ fontSize: "0.8rem" }}>{station.barangay}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-2.5 text-center">
                  <p className="text-blue-700" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{station.staff}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Staff</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center">
                  <p className="text-teal-700" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{station.patients}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Patients</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center">
                  <p className="text-violet-700" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{station.consultations}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Consults</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Station ID", value: station.id },
                { label: "Address", value: station.address },
                { label: "Contact Number", value: station.contact },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400" style={{ fontSize: "0.8rem" }}>{label}</span>
                  <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "view" && (
          <div className="p-6 space-y-4">
            {[
              { label: "Station Name", key: "name", value: station?.name },
              { label: "Barangay Name", key: "barangay", value: station?.barangay },
              { label: "Address", key: "address", value: station?.address },
              { label: "Contact Number", key: "contact", value: station?.contact },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
                <input
                  type="text"
                  defaultValue={value || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            ))}
          </div>
        )}

        {mode !== "view" && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors" style={{ fontSize: "0.875rem" }}>Cancel</button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {mode === "add" ? "Add Station" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function BarangayStationsPage() {
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; station?: any } | null>(null);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Barangay Stations</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Manage health center stations across barangays</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Station
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Stations", value: mockStations.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Patients Served", value: mockStations.reduce((a, s) => a + s.patients, 0).toLocaleString(), icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Total Consultations", value: mockStations.reduce((a, s) => a + s.consultations, 0).toLocaleString(), icon: Stethoscope, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((card, index) => (
          <div 
            key={card.label} 
            className={`${card.bg} rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <card.icon className={`w-8 h-8 ${card.color}`} />
            <div>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{card.label}</p>
              <p className={`${card.color}`} style={{ fontSize: "1.5rem", fontWeight: 700 }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockStations.map((station, index) => (
          <div 
            key={station.id} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>{station.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-200" />
                    <p className="text-blue-200" style={{ fontSize: "0.75rem" }}>{station.barangay}</p>
                  </div>
                </div>
                <span className="bg-blue-500 text-blue-100 px-2 py-0.5 rounded" style={{ fontSize: "0.7rem" }}>{station.id}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: "Staff", value: station.staff, color: "text-blue-600" },
                { label: "Patients", value: station.patients, color: "text-teal-600" },
                { label: "Consults", value: station.consultations, color: "text-violet-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="py-3 text-center">
                  <p className={`${color}`} style={{ fontSize: "1.1rem", fontWeight: 700 }}>{value}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{station.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{station.contact}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setModal({ mode: "view", station })}
                className="flex-1 py-1.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors"
                style={{ fontSize: "0.75rem" }}
              >
                View Details
              </button>
              <button
                onClick={() => setModal({ mode: "edit", station })}
                className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-400 hover:text-teal-600 hover:border-teal-300 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <StationModal mode={modal.mode} station={modal.station} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
