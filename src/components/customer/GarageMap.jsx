import React, { useState } from 'react';
import { 
  Compass, Plus, Minus, Bell, Wrench, Shield, CheckCircle2, X, 
  Navigation, Layers, Settings, AlertCircle, Clock, FileText, Eye
} from 'lucide-react';

export default function GarageMap({ onNavigate }) {
  // 💡 තෝරාගත් ගරාජ් එක සහ රික්වෙස්ට් එක යවා ඇත්දැයි බැලීමට ස්ටේට්ස්
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [isRequested, setIsRequested] = useState(false);

  // 📊 ගරාජ් වල දත්ත එකතුව
  const garagesData = {
    malabe: {
      id: "MALABE",
      name: "MALABE PREMIUM HUB",
      distance: "3.8 KM", // image_c7839b.png එකට ගැලපෙන පරිදි යාවත්කාලීන කර ඇත
      time: "12 MINS",   // image_c7839b.png එකට ගැලපෙන පරිදි යාවත්කාලීන කර ඇත
      workload: "28%",
      status: "NEAREST & RECOMMENDED",
      specialization: "Hybrid Powertrain Experts Available",
      specDesc: "Node specialized in Toyota/Lexus/Honda high-voltage systems.",
      freeTechs: [
        { name: "Kamal Silva", expert: "Hybrid & EV Battery Diagnosis" },
        { name: "Nuwan Perera", expert: "Auto Electrical & ECU Tuning" },
        { name: "Sahan Fernando", expert: "Suspension & Brake Systems" }
      ]
    },
    kadawatha: {
      id: "KADAWATHA",
      name: "KADAWATHA HIGHWAY HUB",
      distance: "15.8 KM",
      time: "35 MINS",
      workload: "95%",
      status: "HIGH WORKLOAD",
      specialization: "Heavy Mechanical Specialists",
      specDesc: "Expertise in diesel turbo engines, transmission rebuilds, and highway recovery.",
      freeTechs: []
    },
    kaduwela: {
      id: "KADUWELA",
      name: "KADUWELA CENTRAL HUB",
      distance: "12.1 KM",
      time: "22 MINS",
      workload: "60%",
      status: "MODERATE AVAILABLE",
      specialization: "General Mechanical & Scanning",
      specDesc: "Multi-brand vehicle scanners and quick routine recovery support.",
      freeTechs: [
        { name: "Roshan Alwis", expert: "Engine Overhauling & Scanning" }
      ]
    }
  };

  // =========================================================================
  // 🗺️ INTERFACE 2: REAL-TIME GPS WAYFINDING HUB (`image_c7839b.png` විලාසිතාව)
  // =========================================================================
  if (isRequested && selectedGarage) {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#070814] text-slate-200 font-mono flex relative selection:bg-indigo-500">
        
        {/* වම්පස ENTERPRISE SIDEBAR */}
        <div className="w-72 h-full border-r border-slate-900 bg-[#0c0d19] hidden md:flex flex-col justify-between p-6 z-20">
          <div>
            <div className="mb-10 pl-2">
              <h1 className="text-2xl font-black tracking-widest text-white">GEAR_OS</h1>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase block mt-1">Enterprise Terminal</span>
            </div>
            
            <nav className="flex flex-col gap-1 text-xs font-bold tracking-wider text-slate-400">
              <button className="flex items-center gap-3 px-4 py-3.5 rounded bg-indigo-950/30 text-indigo-400 border-l-2 border-indigo-500 text-left cursor-pointer">
                <Navigation className="w-4 h-4" /> Navigation Hub
              </button>
              <button className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/40 hover:text-white transition-colors text-left cursor-pointer">
                <Wrench className="w-4 h-4" /> Mobility Recovery
              </button>
              <button className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/40 hover:text-white transition-colors text-left cursor-pointer">
                <Clock className="w-4 h-4" /> Live Progress
              </button>
              <button className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/40 hover:text-white transition-colors text-left cursor-pointer">
                <FileText className="w-4 h-4" /> Invoice Ledger
              </button>
              <button className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/40 hover:text-white transition-colors text-left cursor-pointer">
                <Eye className="w-4 h-4" /> Experience Audit
              </button>
            </nav>
          </div>
          
          <div className="text-[10px] text-slate-600 border-t border-slate-950 pt-4 pl-2 tracking-widest">
            SECURE_CONN // TERMINAL_V2.0
          </div>
        </div>

        {/* දකුණුපස ප්‍රධාන HUD ප්‍රදේශය */}
        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#070814]">
          
          {/* TOP UTILITY BAR */}
          <div className="w-full h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur-md px-6 flex items-center justify-between z-20 text-xs">
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-white cursor-pointer"><Bell className="w-4 h-4" /></button>
              <button className="text-slate-400 hover:text-white cursor-pointer"><Settings className="w-4 h-4" /></button>
              <div className="h-4 w-[1px] bg-slate-900 mx-1" />
            </div>
            <div className="w-9 h-9 rounded border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            
            {/* MAIN HEADER */}
            <div>
              <h2 className="text-2xl font-black tracking-wider text-white">REAL-TIME GPS WAYFINDING HUB</h2>
              <p className="text-xs text-slate-400 font-sans tracking-wide mt-1">Turn-by-turn routing optimization and automated geofence sync with targeted branch.</p>
            </div>

            {/* 🟢 GREEN NOTIFICATION BANNER */}
            <div className="w-full bg-emerald-950/10 border border-emerald-900/40 rounded px-4 py-3.5 flex items-center gap-3 text-xs md:text-sm text-emerald-400/90 shadow-[inset_0_0_15px_rgba(16,185,129,0.02)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-sans tracking-wide">Your service slot has been reserved for immediate entry upon vehicle arrival.</span>
            </div>

            {/* LOWER SECTION: MAP & LOGISTICS MODULAR GRID */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[400px]">
              
              {/* GPS WAYFINDING MAP GRAPHIC */}
              <div className="flex-1 bg-[#090b16] border border-slate-900 rounded relative overflow-hidden min-h-[350px]">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-[0.07] mix-blend-luminosity scale-105 pointer-events-none"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1920&auto=format&fit=crop')` }}
                />
                
                {/* Simulated Grid overlay lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

                {/* SVG Route Dynamic Vector */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M 150 350 Q 280 300, 340 220 T 540 160" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="2.5" 
                    strokeDasharray="6,4"
                    className="animate-[dash_15s_linear_infinite]"
                  />
                  <style>{`
                    @keyframes dash { to { stroke-dashoffset: -100; } }
                  `}</style>
                </svg>

                {/* Map Navigation Info Overlay */}
                <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-900 px-3 py-1.5 rounded text-[9px] tracking-wider text-emerald-400 font-bold z-10">
                  ● ROUTE CRITERIA: FASTEST ARRIVAL // NO TRAFFIC DELAYS
                </div>

                {/* User Beacon Pointer */}
                <div className="absolute bottom-[22%] left-[24%] z-10 flex flex-col items-center">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute" />
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full border border-white relative" />
                </div>

                {/* Targeted Garage Node Marker */}
                <div className="absolute top-[28%] right-[32%] z-10 text-center flex flex-col items-center">
                  <div className="w-4 h-4 bg-emerald-400 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.8)] mb-1" />
                  <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase bg-slate-950/90 px-1.5 py-0.5 border border-emerald-900/60 rounded">
                    {selectedGarage.id}_NODE
                  </span>
                </div>

                {/* Map Control Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
                  <button className="w-7 h-7 bg-slate-950/90 border border-slate-900 flex items-center justify-center text-slate-400 hover:text-white rounded cursor-pointer"><Plus className="w-4 h-4" /></button>
                  <button className="w-7 h-7 bg-slate-950/90 border border-slate-900 flex items-center justify-center text-slate-400 hover:text-white rounded cursor-pointer"><Minus className="w-4 h-4" /></button>
                  <button className="w-7 h-7 bg-slate-950/90 border border-slate-900 flex items-center justify-center text-slate-400 hover:text-white rounded cursor-pointer"><Layers className="w-4 h-4" /></button>
                </div>
              </div>

              {/* LOGISTICS SYNC SIDE PANEL */}
              <div className="w-full lg:w-[350px] bg-[#090b16] border border-slate-900 rounded p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-black tracking-widest text-white leading-tight">LOGISTICS<br />SYNC</h3>
                      <span className="text-[9px] text-slate-500 tracking-widest block mt-1 uppercase">Active Mission: Sector-04</span>
                    </div>
                    <div className="p-2 border border-indigo-500/30 bg-indigo-950/10 text-indigo-400 rounded">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Core Statistics Output */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Target ETA</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-white tracking-tight">{selectedGarage.time.split(' ')[0]}</span>
                        <span className="text-xs font-bold text-slate-400 tracking-wider">MINS</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-900/60 pt-5">
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Remaining Distance</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-white tracking-tight">{selectedGarage.distance.split(' ')[0]}</span>
                        <span className="text-xs font-bold text-slate-400 tracking-wider">KM</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-900/60 pt-5">
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold mb-2">Geofence Status</span>
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-900/50 bg-emerald-950/10 text-[9px] text-emerald-400 font-bold tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CONNECTED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Controllers */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 mt-6">
                  <button 
                    onClick={() => alert("Auto-Pilot sequence initialized successfully.")}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold tracking-widest text-xs uppercase rounded transition-all shadow-[0_0_20px_rgba(99,102,241,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" /> Start Auto-Pilot
                  </button>
                  <button 
                    onClick={() => { setIsRequested(false); setSelectedGarage(null); }}
                    className="w-full py-2.5 bg-transparent border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white font-bold tracking-widest text-xs uppercase rounded transition-colors cursor-pointer text-center"
                  >
                    Reroute To Secondary
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🗺️ INTERFACE 1: SELECT GARAGE MAP (පැරණි Map විස්තර සහිතව)
  // =========================================================================
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-200 font-mono relative selection:bg-cyan-500 selection:text-slate-950">
      
      {/* MAP BACKGROUND */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen pointer-events-none scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1920&auto=format&fit=crop')` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,0.8)_80%)] pointer-events-none z-0" />

      {/* TOP STATUS BAR */}
      <div className="w-full h-14 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 relative text-xs">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 tracking-widest font-bold text-[10px] md:text-xs">
            SYS_STAT: <span className="text-emerald-400">ACTIVE</span>
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 md:gap-3 border-l border-slate-900 pl-3 md:pl-6">
            <div className="text-right hidden sm:block">
              <span className="block text-white font-bold tracking-wide">AMILA PERERA</span>
              <span className="block text-[9px] text-cyan-400 tracking-widest uppercase">Premium Account</span>
            </div>
            <div className="w-7 h-7 md:w-8 h-8 rounded border border-slate-800 bg-slate-900 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* SCREEN MAIN LAYOUT */}
      <div className="w-full h-[calc(100vh-56px)] flex flex-col md:flex-row relative z-10">
        
        {/* THE MAP AREA */}
        <div className="flex-1 h-full relative p-4 md:p-6">
          
          <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-4">
            <h1 className="text-sm md:text-lg font-light tracking-[0.2em] md:tracking-[0.3em] text-slate-400 uppercase">Select Your Garage Node</h1>
            <p className="text-[8px] md:text-[9px] text-cyan-500/70 tracking-widest uppercase mt-0.5">Click a node to view active technicians</p>
          </div>

          {/* 📍 PIN 1: KADAWATHA */}
          <div onClick={() => setSelectedGarage(garagesData.kadawatha)} className="absolute top-[22%] left-[12%] md:left-[20%] cursor-pointer group z-10">
            <div className="w-2.5 h-2.5 md:w-3 h-3 bg-red-500 rotate-45 mx-auto mb-1 shadow-[0_0_15px_rgba(239,68,68,0.7)] group-hover:scale-125 transition-transform" />
            <div className="bg-slate-950/90 border border-slate-800 p-1.5 rounded text-[9px] md:text-[10px] tracking-wide transition-colors backdrop-blur-sm">
              <span className="font-bold text-slate-300 block">Kadawatha</span>
              <span className="block text-red-400 text-[8px] md:text-[9px]">95% Load</span>
            </div>
          </div>

          {/* 📍 PIN 2: MALABE (Nearest) */}
          <div onClick={() => setSelectedGarage(garagesData.malabe)} className="absolute top-[35%] right-[10%] md:right-[25%] cursor-pointer group z-10">
            <div className="w-2.5 h-2.5 md:w-3 h-3 bg-emerald-400 rotate-45 mx-auto mb-1 shadow-[0_0_15px_rgba(52,211,153,0.7)] group-hover:scale-125 transition-transform" />
            <div className="bg-slate-950/90 border border-emerald-900/60 p-1.5 rounded text-[9px] md:text-[10px] tracking-wide transition-colors backdrop-blur-sm">
              <span className="font-bold text-white flex items-center gap-1">Malabe</span>
              <span className="block text-emerald-400 text-[8px] md:text-[9px]">12 Mins | 3.8K</span>
            </div>
          </div>

          {/* 📍 PIN 3: CURRENT LOCATION */}
          <div className="absolute top-[55%] left-[45%] text-center z-10">
            <div className="w-3 h-3 bg-purple-400 rotate-45 mx-auto mb-1 shadow-[0_0_15px_rgba(192,132,252,1)] border border-white" />
            <div className="bg-purple-950/90 border border-purple-500/40 p-1.5 rounded text-[8px] md:text-[9px] text-white whitespace-nowrap">
              📍 Kaduwela Exit (You)
            </div>
          </div>

          {/* 📍 PIN 4: KADUWELA HUB */}
          <div onClick={() => setSelectedGarage(garagesData.kaduwela)} className="absolute bottom-[30%] left-[20%] md:left-[30%] cursor-pointer group z-10">
            <div className="w-2.5 h-2.5 md:w-3 h-3 bg-amber-400 rotate-45 mx-auto mb-1 shadow-[0_0_15px_rgba(251,191,36,0.7)] group-hover:scale-125 transition-transform" />
            <div className="bg-slate-950/90 border border-slate-800 p-1.5 rounded text-[9px] md:text-[10px] tracking-wide transition-colors backdrop-blur-sm">
              <span className="font-bold text-slate-300 block">Kaduwela</span>
              <span className="block text-amber-400 text-[8px] md:text-[9px]">60% Load</span>
            </div>
          </div>

          {/* ZOOM CONTROLS */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-20">
            <button className="w-7 h-7 md:w-8 h-8 bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 md:w-8 h-8 bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
          </div>

        </div>

        {/* SIDE DRAWER: GARAGE DETAILS */}
        {selectedGarage ? (
          <div className="w-full md:w-[420px] max-h-[60vh] md:max-h-full bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-900 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between overflow-y-auto z-30 fixed bottom-0 left-0 right-0 md:relative rounded-t-xl md:rounded-t-none">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-black text-white uppercase">{selectedGarage.name}</h2>
                <button onClick={() => setSelectedGarage(null)} className="text-slate-500 hover:text-white p-1 border border-slate-900 rounded cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="border-t border-b border-slate-900 my-4 py-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">⏱️ EST. RESPONSE TIME</span>
                  <span className="font-bold text-emerald-400">{selectedGarage.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">📍 DISTANCE</span>
                  <span className="font-bold text-slate-200">{selectedGarage.distance}</span>
                </div>
              </div>

              {/* TECHNICIANS CONTAINER */}
              <div className="mb-4">
                <span className="block text-[10px] text-slate-500 font-bold tracking-widest mb-2">Available Technicians ({selectedGarage.freeTechs.length})</span>
                <div className="flex flex-col gap-2">
                  {selectedGarage.freeTechs.map((tech, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/20 border border-slate-900 rounded text-xs flex justify-between">
                      <div>
                        <span className="block font-bold text-slate-200">{tech.name}</span>
                        <span className="block text-cyan-400 text-[11px]">🔥 {tech.expert}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-slate-900">
              <button 
                onClick={() => setIsRequested(true)} // ← මෙතනින් නව UI එකට මාරු වේ
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-xs uppercase rounded cursor-pointer shadow-lg"
              >
                ⚡ Request Immediate Support
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex w-[420px] h-full bg-slate-950/60 border-l border-slate-900 p-6 flex flex-col justify-center items-center text-center">
            <Shield className="w-8 h-8 text-slate-700 mb-4 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">No Node Selected</h3>
          </div>
        )}

      </div>
    </div>
  );
}