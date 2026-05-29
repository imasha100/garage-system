import React, { useState } from 'react';
import { 
  Compass, Plus, Minus, Bell, Wrench, Shield, CheckCircle2, X, 
  Navigation, Layers, Settings, AlertCircle, Clock, FileText, Eye,
  MapPin, User, Flame, Menu
} from 'lucide-react';

export default function GarageMap({ onNavigate }) {
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [isRequested, setIsRequested] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact data synchronized with the reference image
  const garagesData = {
    malabe: {
      id: "MALABE",
      name: "MALABE PREMIUM HUB",
      distance: "8.4 KM", 
      time: "14 MINS",   
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
  // 🗺️ INTERFACE 2: REAL-TIME GPS WAYFINDING HUB (Post-Request State)
  // =========================================================================
  if (isRequested && selectedGarage) {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#070814] text-slate-200 font-mono flex relative selection:bg-indigo-500">
        
        {/* ENTERPRISE SIDEBAR PANEL (Desktop) */}
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

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#070814]/95 z-50 flex flex-col p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-black tracking-widest text-white">GEAR_OS</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex flex-col gap-2 text-sm font-bold tracking-wider text-slate-400">
              <button onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded bg-indigo-950/40 text-indigo-400 text-left">
                <Navigation className="w-4 h-4" /> Navigation Hub
              </button>
              <button onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 hover:bg-slate-900/40 text-left">
                <Wrench className="w-4 h-4" /> Mobility Recovery
              </button>
              <button onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 hover:bg-slate-900/40 text-left">
                <Clock className="w-4 h-4" /> Live Progress
              </button>
            </nav>
          </div>
        )}

        {/* MAIN HUD CONTENT AREA */}
        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#070814]">
          
          {/* TOP UTILITY BAR */}
          <div className="w-full h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
              <button className="text-slate-400 hover:text-white cursor-pointer"><Bell className="w-4 h-4" /></button>
              <button className="text-slate-400 hover:text-white cursor-pointer"><Settings className="w-4 h-4" /></button>
            </div>
            <div className="w-9 h-9 rounded border border-slate-800 bg-slate-900 flex items-center justify-center shadow-md text-slate-400">
              <User className="w-5 h-5" />
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 md:gap-5">
            <div>
              <h2 className="text-lg md:text-2xl font-black tracking-wider text-white">REAL-TIME GPS WAYFINDING HUB</h2>
              <p className="text-[11px] md:text-xs text-slate-400 font-sans tracking-wide mt-1">Turn-by-turn routing optimization and automated geofence sync with targeted branch.</p>
            </div>

            <div className="w-full bg-emerald-950/10 border border-emerald-900/40 rounded px-4 py-3 flex items-center gap-3 text-xs text-emerald-400/90 shadow-[inset_0_0_15px_rgba(16,185,129,0.02)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-sans tracking-wide">Your service slot has been reserved for immediate entry upon vehicle arrival.</span>
            </div>

            {/* LOWER SECTION */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6">
              
              {/* GPS MAP GRAPHIC */}
              <div className="flex-1 bg-[#090b16] border border-slate-900 rounded relative overflow-hidden min-h-[300px] md:min-h-[350px]">
                <div 
                  className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat pointer-events-none"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
                    filter: 'brightness(0.15) contrast(1.6) saturate(0.5) hue-rotate(200deg)'
                  }} 
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 z-0" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M 50 250 Q 180 200, 240 120 T 440 90" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="3" 
                    strokeDasharray="8,5"
                    className="animate-[dash_12s_linear_infinite]"
                  />
                </svg>

                <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-900 px-3 py-1.5 rounded text-[8px] md:text-[9px] tracking-wider text-emerald-400 font-bold z-10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" /> ROUTE: LIVE TRAFFIC OPTIMIZED
                </div>

                <div className="absolute bottom-[30%] left-[15%] z-10 flex flex-col items-center">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute" />
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full border border-white relative" />
                </div>

                <div className="absolute top-[35%] right-[25%] z-10 text-center flex flex-col items-center">
                  <div className="w-4 h-4 bg-emerald-400 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.8)] mb-1" />
                  <span className="text-[8px] md:text-[9px] font-black text-emerald-400 tracking-widest uppercase bg-slate-950/90 px-1.5 py-0.5 border border-emerald-900/60 rounded">
                    {selectedGarage.id}_NODE
                  </span>
                </div>
              </div>

              {/* LOGISTICS PANEL */}
              <div className="w-full lg:w-[350px] bg-[#090b16] border border-slate-900 rounded p-4 md:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-black tracking-widest text-white leading-tight">LOGISTICS<br />SYNC</h3>
                    </div>
                    <div className="p-2 border border-indigo-500/30 bg-indigo-950/10 text-indigo-400 rounded">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Target ETA</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedGarage.time.split(' ')[0]}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider">MINS</span>
                      </div>
                    </div>

                    <div className="lg:border-t lg:border-slate-900/60 lg:pt-4">
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Remaining Distance</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedGarage.distance.split(' ')[0]}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider">KM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 mt-6">
                  <button 
                    onClick={() => alert("Auto-Pilot sequence initialized successfully.")}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold tracking-widest text-xs uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" /> Start Auto-Pilot
                  </button>
                  <button 
                    onClick={() => { setIsRequested(false); setSelectedGarage(null); }}
                    className="w-full py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-white font-bold tracking-widest text-xs uppercase rounded cursor-pointer text-center"
                  >
                    Reroute
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
  // 🗺️ INTERFACE 1: SELECT GARAGE MAP (Initial Discovery State)
  // =========================================================================
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#02050b] text-[#cbd5e1] font-mono flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOP STATUS BAR */}
      <div className="w-full h-14 border-b border-slate-900 bg-[#02050b]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-400 tracking-widest font-bold text-[9px] md:text-xs">
            SYS_STAT: <span className="text-cyan-400">ACTIVE // INTEL_MAP_V3</span>
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-white font-bold tracking-wide">AMILA PERERA</span>
              <span className="block text-[9px] text-purple-400 tracking-widest uppercase">Premium Hub Access</span>
            </div>
            <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* MAP WORKSPACE */}
      <div className="flex-1 w-full relative overflow-hidden">
        
        {/* BACKGROUND MATRIX GRID IMAGE */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.22] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=90')`,
            filter: 'brightness(0.3) contrast(1.8) saturate(0.4) hue-rotate(185deg)'
          }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,5,11,0.05)_0%,#02050b_95%)] pointer-events-none z-0" />
        
        {/* Subtle Cyberpunk Circular/Grid Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#081022_1px,transparent_1px),linear-gradient(to_bottom,#081022_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 z-0 pointer-events-none" />

        {/* 🔴 1. KADAWATHA HUB (Pink/Red Theme) */}
        <div 
          onClick={() => setSelectedGarage(garagesData.kadawatha)} 
          className="absolute top-[8%] left-[4%] md:top-[12%] md:left-[12%] cursor-pointer group z-10 transition-all"
        >
          <div className="flex flex-col items-start">
            {/* Diamond Node Pin */}
            <div className="w-3.5 h-3.5 bg-[#ff9eaf] rotate-45 mb-2 ml-10 shadow-[0_0_12px_rgba(255,158,175,0.8)] group-hover:scale-110 transition-transform" />
            {/* Box Container */}
            <div className="bg-[#101424]/90 border border-[#ff9eaf]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono">
                Kadawatha Hub [15.8 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 35 Mins</span>]
              </div>
              <div className="text-[#ff9eaf] text-[9px] md:text-[10px] mt-1.5 tracking-wide font-medium flex items-center gap-1">
                <span>→</span> Workload: 95% (0 Techs Free)
              </div>
            </div>
          </div>
        </div>

        {/* 🟪 2. YOUR CURRENT LOCATION (Purple Theme - Center Point) */}
        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="flex flex-col items-center">
            {/* Diamond Center Pin */}
            <div className="w-5 h-5 bg-[#b49eff] rotate-45 mb-2.5 shadow-[0_0_15px_rgba(180,158,255,0.8)]" />
            {/* Info Terminal Window */}
            <div className="bg-[#101424]/95 border border-[#b49eff]/50 px-3 py-2 rounded-sm shadow-2xl backdrop-blur-md min-w-[200px] md:min-w-[230px]">
              <div className="font-black tracking-widest text-[#b49eff] text-[9px] md:text-[10px] flex items-center justify-center gap-1">
                <span>📍</span> YOUR CURRENT LOCATION
              </div>
              <div className="text-slate-400 text-[9px] md:text-[10px] mt-0.5 tracking-wide font-sans font-medium">
                (Kaduwela Highway Exit)
              </div>
            </div>
          </div>
        </div>

        {/* 🟢 3. MALABE PREMIUM HUB (Mint Green Theme) */}
        <div 
          onClick={() => setSelectedGarage(garagesData.malabe)} 
          className="absolute top-[10%] right-[4%] md:top-[16%] md:right-[22%] cursor-pointer group z-10 transition-all"
        >
          <div className="flex flex-col items-start">
            {/* Diamond Node Pin */}
            <div className="w-3.5 h-3.5 bg-[#00ffaa] rotate-45 mb-2 ml-10 shadow-[0_0_12px_rgba(0,255,170,0.8)] group-hover:scale-110 transition-transform" />
            {/* Box Container */}
            <div className="bg-[#101424]/90 border border-[#00ffaa]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono flex items-center justify-between">
                <span>Malabe Hub [8.4 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 14 Mins</span>]</span>
              </div>
              <div className="text-[#00ffaa] text-[9px] md:text-[10px] mt-1.5 tracking-wide font-medium flex items-center gap-1">
                <span>→</span> Workload: 28% (3 Techs Free)
              </div>
            </div>
          </div>
        </div>

        {/* 🟠 4. KADUWELA CENTRAL HUB (Amber/Orange Theme) */}
        <div 
          onClick={() => setSelectedGarage(garagesData.kaduwela)} 
          className="absolute bottom-[22%] left-[4%] md:bottom-[18%] md:left-[16%] cursor-pointer group z-10 transition-all"
        >
          <div className="flex flex-col items-start">
            {/* Diamond Node Pin */}
            <div className="w-3.5 h-3.5 bg-[#ff9d00] rotate-45 mb-2 ml-14 shadow-[0_0_12px_rgba(255,157,0,0.8)] group-hover:scale-110 transition-transform" />
            {/* Box Container */}
            <div className="bg-[#101424]/90 border border-[#ff9d00]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono">
                Kaduwela Hub [12.1 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 22 Mins</span>]
              </div>
              <div className="text-[#ff9d00] text-[9px] md:text-[10px] mt-1.5 tracking-wide font-medium flex items-center gap-1">
                <span>→</span> Workload: 60% (1 Tech Free)
              </div>
            </div>
          </div>
        </div>

        {/* MAP ZOOM CONTROLS */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Plus className="w-3.5 h-3.5" /></button>
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Minus className="w-3.5 h-3.5" /></button>
        </div>

        {/* ➡️ BOTTOM OVERLAY DRAWER / SIDE PANEL FOR DETAILS */}
        <div className={`fixed bottom-0 left-0 w-full h-[78vh] md:h-full md:absolute md:top-0 md:right-0 md:left-auto md:w-[400px] bg-[#040713] border-t md:border-t-0 md:border-l border-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto z-30 shadow-2xl ${
          selectedGarage ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-x-full md:translate-y-0 opacity-0 pointer-events-none'
        }`}>
          {selectedGarage && (
            <div className="p-5 md:p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm md:text-base font-black text-white uppercase tracking-widest">{selectedGarage.name}</h2>
                  <button onClick={() => setSelectedGarage(null)} className="text-slate-500 hover:text-white p-1 border border-slate-800 rounded cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-sm text-xs mb-4">
                  <span className="block font-bold text-cyan-400 tracking-wider text-[9px] uppercase mb-1">Node Specialization</span>
                  <span className="block text-slate-200 font-bold">{selectedGarage.specialization}</span>
                  <span className="block text-slate-400 font-sans mt-0.5">{selectedGarage.specDesc}</span>
                </div>

                <div className="border-t border-b border-slate-900/60 my-4 py-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Response Window
                    </span>
                    <span className="font-bold text-white">{selectedGarage.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Displacements
                    </span>
                    <span className="font-bold text-slate-300">{selectedGarage.distance}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 font-bold tracking-widest mb-2 uppercase">On-Site Technicians</span>
                  <div className="flex flex-col gap-1.5">
                    {selectedGarage.freeTechs.length > 0 ? (
                      selectedGarage.freeTechs.map((tech, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/20 border border-slate-950 rounded-sm text-xs">
                          <span className="block font-bold text-slate-300">{tech.name}</span>
                          <span className="text-cyan-400/90 text-[10px] flex items-center gap-1 mt-0.5">
                            <Flame className="w-3 h-3 text-cyan-500" /> {tech.expert}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-red-950/10 border border-red-950/20 rounded-sm text-[11px] text-red-400/90">
                        Zero available field engineers on this sector node.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 bg-[#040713]">
                <button 
                  onClick={() => setIsRequested(true)} 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-xs uppercase rounded-sm cursor-pointer transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                >
                  Initiate Lock-In Request
                </button>
                <button 
                  onClick={() => setSelectedGarage(null)} 
                  className="w-full py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-red-400 hover:border-red-900/50 font-bold tracking-widest text-xs uppercase rounded-sm cursor-pointer text-center transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}