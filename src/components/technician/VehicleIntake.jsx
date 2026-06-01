import React, { useState, useEffect } from 'react';

// ASSETS ෆෝල්ඩරයෙන් පින්තූර 2ම මෙලෙස IMPORT කර ඇත
import garageImage from '../../assets/garage-car.jpeg'; 
import avatarImage from '../../assets/profile.png'; 

import { 
  LayoutDashboard, 
  Car, 
  ClipboardList, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  HelpCircle, 
  PlusSquare, 
  MoreVertical, 
  LogIn 
} from 'lucide-react';

// 🚨 assignedVehicle prop එක හරහා Assistant දාන වාහන අංකය auto ලැබෙනවා (Test කර බැලීමට default අගයක් දමා ඇත)
export default function VehicleIntake({ onNavigate, assignedVehicle = "WP CAS 1234" }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [repairDuration, setRepairDuration] = useState(''); // ටෙක්නීෂියන් ටයිප් කරන කාලය තබා ගැනීමට
  
  // Assistant වාහනයක් Assign කළ වහාම එය auto අප්ඩේට් වේ
  useEffect(() => {
    if (assignedVehicle) {
      setLicensePlate(assignedVehicle.toUpperCase());
    }
  }, [assignedVehicle]);

  const [activeQueue, setActiveQueue] = useState([
    { id: 1, plate: 'B-7412-HX', duration: '2 hrs', timeIn: '08:45 AM', status: 'IN-PROGRESS' },
    { id: 2, plate: 'TX-902-LK', duration: '30 min', timeIn: '09:12 AM', status: 'QUEUED' },
    { id: 3, plate: 'CAS-1120-W', duration: '1 hr', timeIn: '09:30 AM', status: 'IN-PROGRESS' },
    { id: 4, plate: 'DE-5544-ZZ', duration: '3+ hrs', timeIn: '09:45 AM', status: 'STALLED' }
  ]);

  const handleAddToWorkload = (e) => {
    e.preventDefault();
    if (!licensePlate.trim() || !repairDuration.trim()) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const newArrival = {
      id: Date.now(),
      plate: licensePlate,
      duration: repairDuration.trim(), // ටෙක්නීෂියන් ටයිප් කරපු වෙලාව කෙලින්ම ගබඩා වේ
      timeIn: formattedTime,
      status: 'QUEUED'
    };

    setActiveQueue([newArrival, ...activeQueue]);
    setRepairDuration(''); // Submit වූ පසු කාලය ඇතුළත් කරන input එක හිස් කරයි
  };

  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0a0d14] text-slate-300 font-mono flex relative selection:bg-indigo-500 selection:text-white">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 h-full border-r border-slate-900 bg-[#06090f] flex flex-col justify-between p-4 z-20 shrink-0">
        <div>
          <div className="mb-8 pl-3 pt-2">
            <h1 className="text-xl font-black tracking-[0.15em] text-white">TECHSUITE</h1>
            <span className="text-[9px] text-slate-500 tracking-widest uppercase block mt-0.5">Precision Ops</span>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold tracking-wider">
            <button className="flex items-center gap-3 px-4 py-3.5 rounded text-left text-slate-500 hover:bg-slate-900/40 hover:text-slate-300 transition-all cursor-pointer">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button className="flex items-center gap-3 px-4 py-3.5 rounded text-left bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 transition-all cursor-pointer">
              <Car className="w-4 h-4" /> Vehicle Intake
            </button>
            <button className="flex items-center gap-3 px-4 py-3.5 rounded text-left text-slate-500 hover:bg-slate-900/40 hover:text-slate-300 transition-all cursor-pointer">
              <ClipboardList className="w-4 h-4" /> Task Logs
            </button>
            <button className="flex items-center gap-3 px-4 py-3.5 rounded text-left text-slate-500 hover:bg-slate-900/40 hover:text-slate-300 transition-all cursor-pointer">
              <User className="w-4 h-4" /> Profile
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-900/80 pt-4 flex flex-col gap-1 text-xs font-bold tracking-wider">
          <button className="flex items-center gap-3 px-4 py-3 text-left text-slate-500 hover:text-slate-300 transition-all cursor-pointer">
            <Settings className="w-4 h-4" /> Settings
          </button>
          
          <button 
            onClick={() => onNavigate('start')}
            className="flex items-center gap-3 px-4 py-3 text-left text-slate-500 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#090b11]">
        
        {/* TOP HEADER BAR */}
        <div className="w-full h-16 border-b border-slate-900/80 bg-[#06090f]/40 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search Workshop..." 
              className="w-full bg-[#04060a] border border-slate-900 rounded-sm py-1.5 pl-10 pr-4 text-xs tracking-wider text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-900" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-slate-800 overflow-hidden bg-slate-950">
                <img 
                  src={avatarImage} 
                  className="w-full h-full object-cover filter grayscale contrast-125" 
                  alt="M. Anderson Profile" 
                />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-black text-slate-200 tracking-wide leading-none">M. Anderson</span>
                <span className="block text-[9px] text-slate-500 tracking-wider uppercase mt-1">Senior Mechanic</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT LAYOUT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">Intake Terminal</h2>
            <p className="text-xs text-slate-500 tracking-wide mt-1">Register new vehicle arrivals for the current shift.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* INTAKE FORM */}
            <div className="lg:col-span-2 bg-[#10121b] border border-[#1d202c] rounded-sm p-5 md:p-6 shadow-2xl flex flex-col justify-between">
              <form onSubmit={handleAddToWorkload} className="flex flex-col h-full justify-between gap-6">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wider">
                      <LogIn className="w-4 h-4 text-indigo-400" />
                      <h3>Assigned Job</h3>
                    </div>
                    <span className="text-[9px] font-bold bg-[#171a26] border border-slate-800 text-indigo-400 px-2 py-0.5 rounded-sm tracking-widest animate-pulse">
                      ASSIGNED
                    </span>
                  </div>

                  {/* 🚨 AUTO ASSIGNED VEHICLE FIELD (READ-ONLY) */}
                  <div className="mb-4">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Assigned Vehicle Number
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        readOnly // වෙනස් කිරීමට නොහැක
                        disabled
                        value={licensePlate || 'NO VEHICLE ASSIGNED'}
                        className="w-full bg-[#090b11] border border-slate-900 rounded-sm p-3.5 pr-10 text-sm font-black tracking-[0.15em] text-indigo-400 uppercase select-none opacity-80"
                      />
                      <Car className="w-4 h-4 text-indigo-500/50 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* 🚨 DURATION FIELD: දැන් කෙලින්ම ටයිප් කළ හැකිය */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Estimated Repair Duration
                    </label>
                    <input 
                      type="text"
                      required
                      value={repairDuration}
                      onChange={(e) => setRepairDuration(e.target.value)}
                      placeholder="e.g., 15 min, 45 min, 2 hrs"
                      className="w-full bg-[#07080d] border border-slate-900 rounded-sm p-3.5 text-sm font-bold tracking-wide text-white placeholder-slate-800 focus:outline-none focus:border-indigo-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!licensePlate}
                  className={`w-full py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 ${
                    licensePlate 
                      ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white cursor-pointer' 
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <PlusSquare className="w-4 h-4" /> Add to Active Workload
                </button>
              </form>
            </div>

            {/* MAIN CAR IMAGE ZONE */}
            <div className="lg:col-span-3 bg-[#10121b] border border-[#1d202c] rounded-sm overflow-hidden relative shadow-2xl flex flex-col justify-end min-h-70">
              <div className="absolute inset-0 z-0">
                <img 
                  src={garageImage} 
                  alt="Car stopped inside mechanical garage" 
                  className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.25] saturate-[1.1]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0d14] via-[#0b1523]/40 to-cyan-950/20" />
                <div className="absolute inset-0 bg-linear-to-r from-[#0a0d14]/85 via-transparent to-transparent" />
              </div>

              <div className="p-6 z-10 relative">
                <span className="text-[10px] font-bold text-cyan-400 tracking-widest block uppercase mb-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                  ⚡ BAY STATUS: VEHICLE LOCATED
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  4 Available Maintenance Slots<span className="text-cyan-400 animate-pulse">_</span>
                </h2>
                
                <div className="flex gap-1.5 mt-4 max-w-35">
                  <div className="h-1 flex-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-sm"></div>
                  <div className="h-1 flex-1 bg-slate-800 rounded-sm"></div>
                  <div className="h-1 flex-1 bg-slate-800 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE QUEUE TABLE */}
          <div className="bg-[#10121b] border border-[#1d202c] rounded-sm p-5 md:p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-900/80 pb-4 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wider">
                <ClipboardList className="w-4.5 h-4.5 text-emerald-400" />
                <h3>Active Queue</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Updates Enabled
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-600 font-bold tracking-widest border-b border-slate-900/60 uppercase">
                    <th className="py-3 px-4">Plate</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Time In</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 font-bold tracking-wide">
                  {activeQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/20 group transition-colors">
                      <td className="py-4 px-4 text-sm font-black text-slate-200 tracking-wider">
                        {item.plate}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {item.duration}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-sans tracking-wide">
                        {item.timeIn}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider border ${
                          item.status === 'IN-PROGRESS' 
                            ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400' 
                            : item.status === 'QUEUED' 
                            ? 'bg-amber-950/20 border-amber-900/60 text-amber-500' 
                            : 'bg-red-950/20 border-red-900/60 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-slate-600 hover:text-white p-1 transition-colors">
                          <MoreVertical className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}