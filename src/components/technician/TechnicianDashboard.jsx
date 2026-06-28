import React from 'react';
import { Plus, Search, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import avatarImage from '../../assets/profile.png';

export default function Dashboard() {
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
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome Back, Alex Chen</h1>
            <p className="text-slate-500 text-sm">You have 4 remaining high-priority diagnostics today.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition text-sm">
            <Plus size={16} /> Start New Intake
          </button>
        </div>

        {/* Top Stats Cards (image_33d155.png style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: "Today's Assigned Vehicles", value: "12", tag: "ACTIVE_QUEUE" },
            { label: "Completed Tasks", value: "8 / 12 total", tag: "DAILY_OPS" },
            { label: "Active Efficiency Index", value: "94%", tag: "KPI_METRIC" }
          ].map((card, i) => (
            <div key={i} className="bg-[#10121b] border border-slate-800 p-5 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest">{card.label}</p>
                <span className="text-[8px] border border-slate-700 px-1.5 py-0.5 rounded text-slate-500">{card.tag}</span>
              </div>
              <h2 className="text-3xl font-black text-white">{card.value}</h2>
              {i === 2 && <div className="w-24 bg-emerald-500 h-1 mt-3 rounded-full" />}
            </div>
          ))}
        </div>

        {/* Workflow & Active Task Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Workflow Status */}
          <div className="lg:col-span-2 bg-[#10121b] border border-slate-800 p-6 rounded-xl">
             <h3 className="text-white font-bold text-sm">Daily Workflow Status</h3>
             <p className="text-[10px] text-slate-500 mb-6">Real-time task synchronization</p>
             <div className="flex items-center gap-10">
                <div className="w-32 h-32 rounded-full border-[8px] border-indigo-200/20 flex flex-col items-center justify-center">
                   <span className="text-2xl font-black text-white">66%</span>
                   <span className="text-[8px] uppercase">Completed</span>
                </div>
                <div className="space-y-4">
                   <div><p className="text-[10px] text-slate-500 uppercase">Pending</p><p className="text-lg font-bold">4</p></div>
                   <div><p className="text-[10px] text-slate-500 uppercase">Avg Time</p><p className="text-lg font-bold">42m</p></div>
                   
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Current Active Task */}
            <div className="bg-[#10121b] border border-slate-800 p-6 rounded-xl">
              <h3 className="text-white font-bold text-sm mb-4">Current Active Task</h3>
              <div className="flex justify-between text-xs mb-2">
                <p className="font-bold text-white">B-7729-TX</p>
                <span className="bg-slate-800 px-2 rounded text-[9px]">IN_PROGRESS</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-4">Tesla Model 3 - Battery Diag</p>
              <div className="text-[10px] flex justify-between mb-1"><span>Elapsed Time</span><span>01:14:22</span></div>
              <div className="w-full bg-slate-800 h-1 rounded-full"><div className="bg-indigo-400 w-2/3 h-full rounded-full"></div></div>
            </div>

            {/* Queue Preview */}
            <div className="bg-[#10121b] border border-slate-800 p-6 rounded-xl">
              <div className="flex justify-between mb-4"><h3 className="text-white font-bold text-sm">Queue Preview</h3><span className="text-[10px] text-slate-500 cursor-pointer">View All</span></div>
              {[["09", "VW Golf GTI", "Brake Pad Replacement"], ["10", "Audi RS6", "Oil System Flush"], ["11", "Ford F-150", "Suspension Tuning"]].map((item, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-slate-800/50 py-3 last:border-0">
                  <span className="text-[10px] bg-slate-900 px-2 py-1 rounded">{item[0]}</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold">{item[1]}</p>
                    <p className="text-[9px] text-slate-500">{item[2]}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}