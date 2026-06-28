import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Car, MoreVertical, Plus, LogIn, User } from 'lucide-react';
// Ensure your image path is correct
import garageImage from '../../assets/garage-car.jpeg'; 
import avatarImage from '../../assets/profile.png'; 

export default function VehicleIntake() {
  const [repairDuration, setRepairDuration] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [openMenuId, setOpenMenuId] = useState(null); // Action menu එක සඳහා
  
  const [activeQueue] = useState([
    { id: 1, plate: 'B-7412-HX', duration: '2 hrs', timeIn: '08:45 AM', status: 'IN-PROGRESS', color: 'bg-emerald-500/10 text-emerald-400' },
    { id: 2, plate: 'TX-902-LK', duration: '30 min', timeIn: '09:12 AM', status: 'QUEUED', color: 'bg-amber-500/10 text-amber-400' },
    { id: 3, plate: 'CAS-1120-W', duration: '1 hr', timeIn: '09:30 AM', status: 'IN-PROGRESS', color: 'bg-emerald-500/10 text-emerald-400' },
    { id: 4, plate: 'DE-5544-ZZ', duration: '3+ hrs', timeIn: '09:45 AM', status: 'STALLED', color: 'bg-rose-500/10 text-rose-400' }
  ]);

  const filteredQueue = activeQueue.filter(item => 
    item.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToWorkload = (e) => {
    e.preventDefault();
    if (!repairDuration.trim()) {
      alert("Please fill in the Estimated Repair Duration!");
      return;
    }
    setRepairDuration('');
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
            <input 
              type="text" 
              placeholder="Search Workshop..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 py-1.5 pl-9 pr-4 rounded-md text-xs focus:outline-none focus:border-indigo-500" 
            />
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

      {/* WORKSPACE CONTENT */}
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Intake Terminal</h1>
          <p className="text-slate-500 text-sm">Register new vehicle arrivals for the current shift.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#10121b] border border-slate-800 p-6 rounded-lg">
            <form onSubmit={handleAddToWorkload}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="flex items-center gap-2 text-white font-bold"><Car size={18} /> Vehicle Intake</h2>
                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-700">ENTRY-702</span>
              </div>
              <label className="text-[10px] uppercase text-slate-500 block mb-2">Vehicle License Plate</label>
              <input type="text" defaultValue="WP CAS 1234" className="w-full bg-[#06080e] border border-slate-700 p-3 rounded mb-4 text-white" />
              
              <label className="text-[10px] uppercase text-slate-500 block mb-2">Estimated Repair Duration</label>
              <input 
                required
                type="text" 
                value={repairDuration} 
                onChange={(e) => setRepairDuration(e.target.value)}
                placeholder="e.g., 45 min" 
                className="w-full bg-[#06080e] border border-slate-700 p-3 rounded mb-6 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" 
              />
              
              <button type="submit" className="w-full bg-[#5244E9] py-3 rounded font-bold text-white text-sm hover:bg-[#4338ca] transition">
                <Plus size={16} className="inline mr-2" /> Add to Active Workload
              </button>
            </form>
          </div>

          <div className="bg-[#10121b] border border-slate-800 rounded-lg overflow-hidden relative flex flex-col justify-end">
            <img src={garageImage} alt="Garage Bay" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="relative z-10 p-6 bg-gradient-to-t from-[#10121b] via-transparent to-transparent">
              <p className="text-[10px] uppercase text-slate-300">Bay Status: Optimized</p>
              <h3 className="text-xl font-bold text-white">4 Available Maintenance Slots</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#10121b] border border-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold text-sm flex items-center gap-2"><Car size={16} /> Active Queue</h2>
            <span className="text-emerald-500 text-[10px] flex items-center gap-1">● Live Updates Enabled</span>
          </div>
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase">
                <th className="text-left pb-4">Plate</th>
                <th className="text-left pb-4">Duration</th>
                <th className="text-left pb-4">Time In</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-right pb-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/50">
                  <td className="py-4 text-white font-bold">{item.plate}</td>
                  <td className="py-4">{item.duration}</td>
                  <td className="py-4">{item.timeIn}</td>
                  <td className="py-4"><span className={`px-2 py-1 rounded text-[10px] ${item.color}`}>{item.status}</span></td>
                  <td className="py-4 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}>
                      <MoreVertical size={16} className="inline cursor-pointer hover:text-white" />
                    </button>
                    {/* Action Dropdown Menu */}
                    {openMenuId === item.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-[#111827] border border-slate-700 rounded-md shadow-2xl z-50 text-left">
                        
                        <button className="block w-full px-4 py-2 text-[10px] text-red-400 hover:bg-slate-800 hover:text-red-300">Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}