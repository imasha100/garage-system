import React, { useState, useRef } from 'react';
import { Search, Bell, HelpCircle, Calendar, Info } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import avatarImage from '../../assets/profile.png'; 

export default function TaskHistoryLogs() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarRef = useRef(null);

  const logs = [
    { id: 1, date: '2026-06-29 16:22', plate: 'TX-9902-BJ', expected: '45 mins', actual: '42 mins', status: 'Cleared By Assistance', statusColor: 'text-emerald-400 bg-emerald-500/10' },
    { id: 2, date: '2026-03-23 13:10', plate: 'AB-1234-ZY', expected: '30 mins', actual: '38 mins', status: 'Time Extended', statusColor: 'text-amber-400 bg-amber-500/10' },
    { id: 3, date: '2026-04-17 12:45', plate: 'K-930-LP', expected: '60 mins', actual: '58 mins', status: 'Cleared By Assistance', statusColor: 'text-emerald-400 bg-emerald-500/10' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'All Statuses' || log.status === statusFilter;
    const logDate = new Date(log.date.split(' ')[0]);
    const matchesDate = !selectedDate || logDate.toDateString() === selectedDate.toDateString();
    return matchesStatus && matchesDate;
  });

  return (
    <div className="h-full bg-[#0a0d14] text-slate-300 font-mono overflow-y-auto">
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
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
             <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="py-8 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Task History Logs</h1>
          <p className="text-slate-500 text-xl">Reviewing precision workflow and exit compliance</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center bg-[#111827] border border-slate-800 px-3 py-1.5 rounded text-xs gap-2">
            <Calendar size={14} className="text-slate-500 cursor-pointer hover:text-indigo-400" onClick={() => calendarRef.current.setOpen(true)} />
            <DatePicker
              ref={calendarRef}
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown={true}
              yearDropdownItemNumber={20}
              dropdownMode="select"
              minDate={new Date(2026, 0, 1)} // 2026 ජනවාරි 1 ට පෙර දින තෝරාගැනීම වළක්වයි
              className="bg-transparent focus:outline-none w-48 text-slate-300 placeholder-slate-500 cursor-pointer"
              placeholderText="Select a date"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111827] border border-slate-800 px-4 py-1.5 rounded text-xs focus:outline-none focus:border-indigo-500"
          >
            <option>All Statuses</option>
            <option>Cleared By Assistance</option>
            <option>Time Extended</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-[12px] uppercase">
                <th className="text-left p-4">Date & Time</th>
                <th className="text-left p-4">Vehicle Plate No</th>
                <th className="text-left p-4">Expected Time</th>
                <th className="text-left p-4">Actual Time</th>
                <th className="text-left p-4">Status Badge</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="p-4 text-white">{log.date}</td>
                    <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded">{log.plate}</span></td>
                    <td className="p-4">{log.expected}</td>
                    <td className="p-4 text-emerald-400">{log.actual}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] ${log.statusColor}`}>{log.status}</span>
                    </td>
                    <td className="p-4 text-right"><Info size={16} className="inline cursor-pointer hover:text-white" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 italic">No task logs found for the selected date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}