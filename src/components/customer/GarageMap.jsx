import React, { useState } from 'react';
import { 
  Plus, Minus, X, Clock, MapPin, User, Users
} from 'lucide-react';

export default function GarageMap({ onNavigate, setSelectedGarage, selectedGarage }) {
  const [isRequested, setIsRequested] = useState(false);

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
      freeTechs: [] // No free technicians at the moment
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

  // Reset request state whenever a different garage is picked or panel is closed
  const handleSelectGarage = (garage) => {
    setIsRequested(false);
    setSelectedGarage(garage);
  };

  const handleCloseDetails = () => {
    setIsRequested(false);
    setSelectedGarage(null);
  };

  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#02050b] text-[#cbd5e1] font-mono flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOP STATUS BAR */}
      <div className="w-full h-14 border-b border-slate-900 bg-[#02050b]/90 backdrop-blur-md px-3 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="block text-white font-bold tracking-wide">AMILA PERERA</span>
            <span className="block text-[9px] text-purple-400 tracking-widest uppercase">Premium Hub Access</span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* MAP WORKSPACE */}
      <div className="flex-1 w-full relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-[0.22] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=90')`,
            WebkitFilter: 'brightness(0.3) contrast(1.8) saturate(0.4) hue-rotate(185deg)',
            filter: 'brightness(0.3) contrast(1.8) saturate(0.4) hue-rotate(185deg)'
          }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,5,11,0.05)_0%,#02050b_95%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#081022_1px,transparent_1px),linear-gradient(to_bottom,#081022_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 z-0 pointer-events-none" />

        {/* NODE 1: KADAWATHA */}
        <div onClick={() => handleSelectGarage(garagesData.kadawatha)} className="absolute top-[6%] left-[2%] md:top-[12%] md:left-[12%] cursor-pointer group z-10 transition-all w-[58vw] md:w-auto">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 bg-[#ff9eaf] rotate-45 mb-2 md:mb-2 ml-6 md:ml-10 shadow-[0_0_12px_rgba(255,158,175,0.8)] group-hover:scale-110 transition-transform shrink-0" />
            <div className="bg-[#101424]/90 border border-[#ff9eaf]/40 px-3 py-2.5 md:px-3 md:py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-full md:w-[280px]">
              <div className="text-slate-300 text-[12px] leading-snug md:text-[15px] font-bold tracking-wide font-mono break-words">
                Kadawatha Hub
                <span className="block md:inline"> [15.8 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-slate-400 inline-block shrink-0" /> 35 Mins</span>]</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center mt-2 md:mt-2 border-t border-slate-900/80 pt-1.5 md:pt-1.5 gap-1 md:gap-0 text-[11px] md:text-[12px]">
                <div className="text-[#ff9eaf] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 95%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-3 md:h-3 text-slate-500 shrink-0" /> Free: <span className="text-white font-bold">{garagesData.kadawatha.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER POSITION INDICATOR */}
        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center z-10 w-[68vw] md:w-auto">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#b49eff] rotate-45 mb-2 md:mb-2.5 shadow-[0_0_15px_rgba(180,158,255,0.8)] shrink-0" />
            <div className="bg-[#101424]/95 border border-[#b49eff]/50 px-3 py-2 md:px-3 md:py-2 rounded-sm shadow-2xl backdrop-blur-md w-full md:min-w-[200px]">
              <div className="font-black tracking-widest text-[#b49eff] text-[11px] md:text-[12px] whitespace-nowrap"> YOUR CURRENT LOCATION</div>
            </div>
          </div>
        </div>

        {/* NODE 2: MALABE */}
        <div onClick={() => handleSelectGarage(garagesData.malabe)} className="absolute top-[8%] right-[2%] md:top-[16%] md:right-[22%] cursor-pointer group z-10 transition-all w-[58vw] md:w-auto">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 bg-[#00ffaa] rotate-45 mb-2 md:mb-2 ml-6 md:ml-10 shadow-[0_0_12px_rgba(0,255,170,0.8)] group-hover:scale-110 transition-transform shrink-0" />
            <div className="bg-[#101424]/90 border border-[#00ffaa]/40 px-3 py-2.5 md:px-3 md:py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-full md:w-[280px]">
              <div className="text-slate-300 text-[12px] leading-snug md:text-[15px] font-bold tracking-wide font-mono break-words">
                Malabe Hub
                <span className="block md:inline"> [8.4 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-slate-400 inline-block shrink-0" /> 14 Mins</span>]</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center mt-2 md:mt-2 border-t border-slate-900/80 pt-1.5 md:pt-1.5 gap-1 md:gap-0 text-[11px] md:text-[12px]">
                <div className="text-[#00ffaa] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 28%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-3 md:h-3 text-slate-500 shrink-0" /> Free: <span className="text-[#00ffaa] font-bold">{garagesData.malabe.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NODE 3: KADUWELA */}
        <div onClick={() => handleSelectGarage(garagesData.kaduwela)} className="absolute bottom-[20%] left-[2%] md:bottom-[18%] md:left-[16%] cursor-pointer group z-10 transition-all w-[58vw] md:w-auto">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 bg-[#ff9d00] rotate-45 mb-2 md:mb-2 ml-8 md:ml-14 shadow-[0_0_12px_rgba(255,157,0,0.8)] group-hover:scale-110 transition-transform shrink-0" />
            <div className="bg-[#101424]/90 border border-[#ff9d00]/40 px-3 py-2.5 md:px-3 md:py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-full md:w-[280px]">
              <div className="text-slate-300 text-[12px] leading-snug md:text-[15px] font-bold tracking-wide font-mono break-words">
                Kaduwela Hub
                <span className="block md:inline"> [12.1 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-slate-400 inline-block shrink-0" /> 22 Mins</span>]</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center mt-2 md:mt-2 border-t border-slate-900/80 pt-1.5 md:pt-1.5 gap-1 md:gap-0 text-[11px] md:text-[12px]">
                <div className="text-[#ff9d00] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 60%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-3 md:h-3 text-slate-500 shrink-0" /> Free: <span className="text-[#ff9d00] font-bold">{garagesData.kaduwela.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP ZOOM CONTROLS */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Plus className="w-3.5 h-3.5" /></button>
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Minus className="w-3.5 h-3.5" /></button>
        </div>

        {/* SIDE DETAIL PANEL */}
        <div className={`fixed bottom-0 left-0 w-full h-[78vh] md:h-full md:absolute md:top-0 md:right-0 md:left-auto md:w-[400px] bg-[#040713] border-t md:border-t-0 md:border-l border-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto z-30 shadow-2xl ${
          selectedGarage ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-x-full md:translate-y-0 opacity-0 pointer-events-none'
        }`}>
          {selectedGarage && (
            <div className="p-5 md:p-6 flex flex-col h-full justify-between">
              <div className="min-w-0">
                <div className="flex justify-between items-start gap-2 mb-5">
                  <h2 className="text-lg md:text-base font-black text-white uppercase tracking-widest break-words min-w-0">{selectedGarage.name}</h2>
                  <button onClick={handleCloseDetails} className="text-slate-500 hover:text-white p-1.5 md:p-1 border border-slate-800 rounded cursor-pointer shrink-0"><X className="w-5 h-5 md:w-4 md:h-4" /></button>
                </div>

                <div className="bg-slate-950/50 border border-slate-900 p-4 md:p-3 rounded-sm text-base md:text-xs mb-4 break-words">
                  <span className="block font-bold text-cyan-400 tracking-wider text-sm md:text-[9px] uppercase mb-1.5 md:mb-1">Node Specialization</span>
                  <span className="block text-slate-200 font-bold">{selectedGarage.specialization}</span>
                  <span className="block text-slate-400 font-sans mt-1 md:mt-0.5">{selectedGarage.specDesc}</span>
                </div>

                <div className="bg-[#091124]/40 border border-slate-900 p-4 md:p-3 rounded-sm text-base md:text-xs mb-4 break-words">
                  <span className="block font-bold text-slate-400 tracking-wider text-sm md:text-[9px] uppercase mb-2.5 md:mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 md:w-3 md:h-3 text-slate-500 shrink-0" /> Available Specialists ({selectedGarage.freeTechs.length})
                  </span>
                  {selectedGarage.freeTechs.length === 0 ? (
                    <div className="text-slate-500 italic text-sm md:text-[11px] py-1">No technicians free right now. Queueing active.</div>
                  ) : (
                    <div className="flex flex-col gap-3 md:gap-2 max-h-40 md:max-h-32 overflow-y-auto pr-1">
                      {selectedGarage.freeTechs.map((tech, idx) => (
                        <div key={idx} className="border-b border-slate-900 pb-2 md:pb-1.5 last:border-0 last:pb-0">
                          <div className="text-slate-200 font-bold text-sm md:text-[11px]">{tech.name}</div>
                          <div className="text-slate-500 text-sm md:text-[10px] font-sans">{tech.expert}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-b border-slate-900/60 my-4 py-4 md:py-3 flex flex-col gap-3 md:gap-2 text-base md:text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5 md:gap-1 uppercase tracking-wider font-bold text-sm md:text-[10px] shrink-0">
                      <Clock className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-500 shrink-0" /> Response Window
                    </span>
                    <span className="font-bold text-white text-right">{selectedGarage.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5 md:gap-1 uppercase tracking-wider font-bold text-sm md:text-[10px] shrink-0">
                      <MapPin className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-500 shrink-0" /> Displacements
                    </span>
                    <span className="font-bold text-slate-300 text-right">{selectedGarage.distance}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 bg-[#040713]">
                {isRequested ? (
                  <div className="w-full py-3.5 md:py-3 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm text-center">
                    Request Confirmed
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsRequested(true);
                      onNavigate("navigation-hub");
                    }} 
                    className="w-full py-3.5 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm cursor-pointer transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                  >
                    Request
                  </button>
                )}
                <button onClick={handleCloseDetails} className="w-full py-3 md:py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-red-400 font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm cursor-pointer text-center">
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