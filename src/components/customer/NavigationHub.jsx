import React, { useState } from "react";
import { Bell, User, Menu, X } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import CustomerSidebar from "./CustomerSidebar";
import MobilityRecovery from "./MobilityRecovery";
import LiveProgress from "./LiveProgress";
import InvoiceLedger from "./InvoiceLedger";
import ExperienceAudit from "./ExperienceAudit";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function NavigationHub({ onNavigate, selectedGarage }) {
  const [activeTab, setActiveTab] = useState("navigation");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!selectedGarage) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#070814] text-white font-mono flex-col gap-5">
        <div className="text-center p-8 bg-[#0c0d19] border border-slate-800 rounded-lg shadow-xl">
          <h2 className="text-3xl font-black text-slate-300">
            NO MISSION ACTIVE
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            Please select a service hub from the map.
          </p>

          <button
            onClick={() => onNavigate("garage-map")}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase text-xs"
          >
            Return to Fleet Map
          </button>
        </div>
      </div>
    );
  }

  const customerLocation = [6.9271, 79.8612];

  const garageLocation =
    selectedGarage?.lat && selectedGarage?.lng
      ? [selectedGarage.lat, selectedGarage.lng]
      : customerLocation;

  const routeLine = [customerLocation, garageLocation];

  const formatValue = (value) => (value ? value.split(" ")[0] : "--");

  return (
    <div className="w-screen h-screen bg-[#070814] text-slate-200 font-mono flex overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* MOBILE OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-700 rounded z-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <CustomerSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
          />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur px-4 flex items-center shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 border border-slate-700 rounded"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <div className="ml-auto flex items-center gap-5">
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">
                  AMILA PERERA
                </p>
                <p className="text-[10px] text-purple-400 uppercase tracking-widest">
                  User
                </p>
              </div>

              <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === "navigation" && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
                {selectedGarage.name} - LOGISTICS SYNC
              </h1>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* LEAFLET MAP */}
                <div className="lg:col-span-2 h-[450px] bg-black border border-slate-800 rounded overflow-hidden relative">
                  <MapContainer
                    center={garageLocation}
                    zoom={12}
                    scrollWheelZoom={true}
                    className="w-full h-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={customerLocation}>
                      <Popup>Customer Location</Popup>
                    </Marker>

                    <Marker position={garageLocation}>
                      <Popup>{selectedGarage.name}</Popup>
                    </Marker>

                    <Polyline
                      positions={routeLine}
                      pathOptions={{
                        color: "#7c83ff",
                        weight: 5,
                        dashArray: "10 8",
                      }}
                    />
                  </MapContainer>

                  <div className="absolute top-4 left-4 z-[999] bg-black/70 border border-slate-700 text-white px-4 py-2 rounded text-xs font-bold">
                    GPS Navigation Active
                  </div>
                </div>

                {/* INFO */}
                <div className="bg-[#0c0d19] border border-slate-800 p-6 rounded">
                  <h2 className="text-white font-bold mb-4">
                    MISSION METRICS
                  </h2>

                  <p className="text-purple-400 text-sm mb-6">
                    Active Node: {selectedGarage.id}
                  </p>

                  <div className="space-y-6 text-white">
                    <div>
                      <p className="text-xs text-slate-400">ETA</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage.time)} MINS
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">DISTANCE</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage.distance)} KM
                      </p>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 cursor-pointer py-3 rounded font-bold">
                    START AUTO PILOT
                  </button>

                  <button
                    onClick={() => onNavigate("garage-map")}
                    className="w-full mt-3 border border-slate-600 cursor-pointer text-slate-300 py-3 rounded font-bold hover:bg-slate-800"
                  >
                    REROUTE TO SECONDARY
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mobility" && <MobilityRecovery />}
          {activeTab === "progress" && <LiveProgress />}
          {activeTab === "invoice" && <InvoiceLedger />}
          {activeTab === "audit" && <ExperienceAudit />}
        </div>
      </div>
    </div>
  );
}