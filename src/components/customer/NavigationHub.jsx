import React, { useState } from "react";
import {
  Bell,
  User,
  Menu,
  X,
} from "lucide-react";

import CustomerSidebar from "./CustomerSidebar";
import MobilityRecovery from "./MobilityRecovery";
import LiveProgress from "./LiveProgress";
import InvoiceLedger from "./InvoiceLedger";
import ExperienceAudit from "./ExperienceAudit";


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

  const getRoute = () => {
    switch (selectedGarage?.id) {
      case "MALABE":
        return (
          <>
            <path
              d="M 50 520 Q 180 430 280 300 T 620 160"
              stroke="#7c83ff"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10 8"
            />
            <circle cx="50" cy="520" r="7" fill="#8b5cf6" />
            <rect x="620" y="150" width="12" height="12" fill="#22c55e" />
          </>
        );

      case "KADAWATHA":
        return (
          <>
            <path
              d="M 80 520 Q 150 380 120 250 T 90 80"
              stroke="#ff8fa3"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10 8"
            />
            <circle cx="80" cy="520" r="7" fill="#8b5cf6" />
            <rect x="90" y="70" width="12" height="12" fill="#ff8fa3" />
          </>
        );

      default:
        return null;
    }
  };

  const formatValue = (value) =>
    value ? value.split(" ")[0] : "--";

  return (
    <div className="w-screen h-screen bg-[#070814] text-slate-200 font-mono flex overflow-hidden">

      {/* SIDEBAR (DESKTOP) */}
      <div className="hidden md:block">
        <CustomerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
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
            className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-700 rounded"
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

        {/* HEADER (FIXED RIGHT ALIGN) */}
        <div className="h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur px-4 flex items-center">

          {/* MOBILE MENU */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 border border-slate-700 rounded"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* PUSH RIGHT */}
          <div className="ml-auto flex items-center gap-5">

            {/* Bell */}
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" />

            {/* USER */}
            <div className="flex items-center gap-3">

              {/* Name */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">
                  AMILA PERERA
                </p>
                <p className="text-[10px] text-purple-400 uppercase tracking-widest">
                  User
                </p>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>

            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8">

          {activeTab === "navigation" && (
            <div className="max-w-6xl mx-auto">

              <h1 className="text-2xl font-bold text-white mb-6">
                {selectedGarage.name} - LOGISTICS SYNC
              </h1>

              <div className="grid lg:grid-cols-3 gap-8">

                {/* MAP */}
                <div className="lg:col-span-2 h-[450px] bg-black border rounded relative flex items-center justify-center">
                  <svg className="absolute w-full h-full" viewBox="0 0 800 600">
                    {getRoute()}
                  </svg>
                  GPS Navigation Active
                </div>

                {/* INFO */}
                <div className="bg-[#0c0d19] border p-6 rounded">

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

                  <button className="w-full mt-6 bg-indigo-600 cursor-pointer py-3 rounded font-bold">
                    START AUTO PILOT
                  </button>

                  <button
                    onClick={() => onNavigate("garage-map")}
                    className="w-full mt-3 border border-slate-600 cursor-pointer  text-slate-300 py-3 rounded font-bold hover:bg-slate-800"
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