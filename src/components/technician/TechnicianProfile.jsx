import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Plus } from 'lucide-react';
import avatarImage from '../../assets/profile.png'; 

export default function TechnicianProfile() {
  const [isOnShift, setIsOnShift] = useState(true);
  const [skills, setSkills] = useState(['Hybrid Expert', 'Electrical Specialist', 'Brake Systems L2']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-300 font-mono">
      
      {/* PROFESSIONAL ENTERPRISE HEADER */}
      <div className="bg-[#111827]/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center">
        <div className="flex items-center gap-3 w-48">
          <h1 className="text-sm font-black tracking-[0.15em] text-white">TECHNICIANS</h1>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-[420px]">
            <Search className="absolute left-3 top-2 text-slate-600" size={14} />
            <input type="text" placeholder="Search Workshop..." className="w-full bg-[#0a0d14] border border-slate-800 py-1.5 pl-9 pr-4 rounded-md text-xs focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="flex items-center gap-4 w-48 justify-end">
          <Bell size={16} className="text-slate-400 hover:text-white cursor-pointer" />
          <HelpCircle size={16} className="text-slate-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="text-right">
              <p className="text-white text-[10px] font-bold">M. Anderson</p>
              <p className="text-[9px] text-slate-500 uppercase">Senior Mechanic</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
               <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Technician Profile</h1>
            <p className="text-slate-500 text-sm">Manage your professional credentials and shift availability.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition text-xs uppercase tracking-widest">
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Info with Animation */}
          <div className="bg-[#10121b] border border-slate-800 p-8 rounded-xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-emerald-400 to-indigo-500 animate-spin-slow" />
              <div className="absolute inset-1 rounded-full bg-[#10121b]" />
              <div className="w-28 h-28 rounded-full overflow-hidden relative z-10">
                <img src={avatarImage} alt="Marco" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">Marco Rossi</h2>
            <p className="text-indigo-400 text-xs uppercase tracking-widest mb-6">Master Technician</p>
            <div className="bg-[#0a0d14] p-4 rounded-lg text-left border border-slate-800 space-y-2">
              <div className="flex justify-between text-[10px]"><span className="text-slate-500">WORKSHOP BAY</span><span className="text-white">Bay 01 - Hybrid/EV</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-slate-500">SECURITY CLEARANCE</span><span className="text-amber-500 font-bold">LEVEL 4</span></div>
            </div>
          </div>

          {/* Right Column: Attendance & Shifts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#10121b] border border-slate-800 p-8 rounded-xl">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Attendance</p>
                    <h3 className="text-xl font-bold text-white">Shift Status</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full flex items-center gap-2 ${isOnShift ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${isOnShift ? 'bg-emerald-500' : 'bg-rose-500'}`} /> 
                      {isOnShift ? 'Currently On-Shift' : 'Currently Off-Shift'}
                    </span>
                    <button onClick={() => setIsOnShift(!isOnShift)} className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isOnShift ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOnShift ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
               </div>
               <h2 className="text-4xl font-black text-white mb-2">08:42 <span className="text-sm font-normal text-slate-500">Current Duration</span></h2>
               <div className="w-full bg-slate-800 h-2 rounded-full mb-6">
                 <div className={`h-full rounded-full transition-all duration-500 ${isOnShift ? 'w-2/3 bg-indigo-500' : 'w-0'}`} />
               </div>
               <p className="text-[10px] text-slate-500">{isOnShift ? "Shift began at 07:30 AM." : "Shift is currently inactive."}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Skills & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-[#10121b] border border-slate-800 p-6 rounded-xl">
             <h3 className="text-white font-bold text-sm mb-4">Skill Categories</h3>
             {skills.map((skill, i) => (
               <div key={i} className="bg-[#0a0d14] border border-slate-800 p-3 mb-2 rounded text-[11px] text-slate-300 flex justify-between">
                 {skill}
                 <button onClick={() => removeSkill(i)} className="text-red-500 hover:text-red-300">×</button>
               </div>
             ))}
             <form onSubmit={addSkill} className="flex gap-2 mt-4">
               <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add new skill..." className="flex-1 bg-[#0a0d14] border border-slate-800 p-2 rounded text-[10px] focus:outline-none focus:border-indigo-500" />
               <button type="submit" className="bg-indigo-600 p-2 rounded text-white hover:bg-indigo-700"><Plus size={14} /></button>
             </form>
          </div>

          <div className="lg:col-span-2 bg-[#10121b] border border-slate-800 p-6 rounded-xl">
             <h3 className="text-white font-bold text-sm mb-4">Recent Shifts</h3>
             <table className="w-full text-[10px] text-slate-400">
               <thead>
                 <tr className="border-b border-slate-800 uppercase">
                    <th className="text-left pb-3">Date</th><th className="text-left pb-3">Duration</th><th className="text-left pb-3">Status</th>
                 </tr>
               </thead>
               <tbody>
                  {[
                    {date: 'Oct 24, 2023', dur: '08h 12m', status: 'VERIFIED'},
                    {date: 'Oct 23, 2023', dur: '07h 55m', status: 'VERIFIED'},
                    {date: 'Oct 22, 2023', dur: '09h 05m', status: 'PENDING'}
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-3">{row.date}</td><td className="py-3">{row.dur}</td>
                      <td className={`py-3 ${row.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'}`}>{row.status}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}