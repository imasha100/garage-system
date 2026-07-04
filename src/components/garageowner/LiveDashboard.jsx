import React, { useState } from "react";
import {
  Search,
  Bell,
  TrendingUp,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  Hourglass,
  MoreVertical,
  Menu,
} from "lucide-react";

export default function LiveDashboard({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");

  const vehicles = [
    {
      icon: CalendarDays,
      vehicle: "WP-CAS-1234",
      technician: "Marco Rossi",
      entry: "08:30 AM",
      completion: "10:30 AM",
      status: "IN_PROGRESS",
      color: "cyan",
    },
    {
      icon: CheckCircle,
      vehicle: "CP-CB-8890",
      technician: "Alan Stark",
      entry: "09:15 AM",
      completion: "10:45 AM",
      status: "CLEARED BY ASSISTANCE",
      color: "green",
    },
    {
      icon: AlertTriangle,
      vehicle: "WP-KV-1122",
      technician: "John Doe",
      entry: "11:00 AM",
      completion: "11:30 AM",
      status: "TIME EXTENDED",
      color: "red",
    },
    {
      icon: Hourglass,
      vehicle: "SP-HN-4455",
      technician: "David Kim",
      entry: "11:45 AM",
      completion: "01:15 PM",
      status: "IN_PROGRESS",
      color: "gray",
    },
  ];

  const normalizeText = (text) =>
    String(text).toLowerCase().replace(/[^a-z0-9]/g, "");

  const filteredVehicles = vehicles.filter((item) => {
    if (!searchText.trim()) return true;

    const search = normalizeText(searchText);
    const rowData = normalizeText(
      `${item.vehicle} ${item.technician} ${item.entry} ${item.completion} ${item.status}`
    );

    return rowData.includes(search);
  });

  const statusStyle = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/20",
  };

  const iconStyle = {
    cyan: "text-cyan-400 border-cyan-500/20",
    green: "text-emerald-400 border-emerald-500/20",
    red: "text-red-400 border-red-500/20",
    gray: "text-gray-400 border-gray-500/20",
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      {/* Top Bar */}
      <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0 relative z-20">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-full flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search size={15} className="text-gray-500 shrink-0" />

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search vehicle number..."
              autoComplete="off"
              className="w-full bg-transparent outline-none border-none text-sm text-white placeholder:text-gray-500"
            />

            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-5">
          <Bell size={18} className="text-gray-300" />
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-xs font-bold tracking-widest">Master Admin</p>
            <p className="text-[10px] text-gray-500 uppercase">Owner Level</p>
          </div>
          <div className="w-9 h-9 rounded-full border border-indigo-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <p className="text-gray-700 font-bold tracking-widest text-xs md:text-sm mb-4">
          PAGE HEADER
        </p>

        <h1 className="text-xl md:text-2xl font-bold mb-2">
          LIVE WORKSPACE ANALYTICS
        </h1>
        <p className="text-gray-400 mb-8 text-sm md:text-base">
          Real-time macro workload control room and workshop queue tracking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mb-8">
          <div className="bg-[#1b1b26] border border-white/10 p-5 md:p-8 shadow-xl rounded-lg">
            <div className="flex justify-between items-start mb-8">
              <p className="text-xs text-gray-500 tracking-widest">
                Global Workload Score
              </p>
              <TrendingUp size={15} className="text-emerald-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-mono text-emerald-400 mb-6">
              340 Mins
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-full h-1 bg-gray-700 rounded">
                <div className="h-1 w-[75%] bg-emerald-400 rounded" />
              </div>
              <span className="text-[10px] text-gray-400 tracking-widest">
                Critical
              </span>
            </div>
          </div>

          <div className="bg-[#1b1b26] border border-white/10 p-5 md:p-8 shadow-xl rounded-lg">
            <div className="flex justify-between items-start mb-8">
              <p className="text-xs text-gray-500 tracking-widest">
                Active Vehicles Inside Bays
              </p>
              <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-1">
                ● 83%
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-mono text-cyan-400 mb-4">
              5 / 6
            </h2>
            <h3 className="text-3xl md:text-4xl font-mono text-cyan-400 mb-8">
              Vehicles
            </h3>

            <p className="text-xs italic text-gray-400">
              Bay 04 currently undergoing sanitation.
            </p>
          </div>
        </div>

        <p className="text-gray-700 font-bold tracking-widest text-xs md:text-sm mb-4">
          MASTER DATA TABLE MODULE
        </p>

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden max-w-6xl">
          <div className="p-5 md:p-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="text-lg md:text-xl mb-2">
              Master Workload & Vehicle State Matrix
            </h2>
            <p className="text-xs text-gray-400">
              Search by vehicle number, technician, time, or status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-[900px] md:w-full text-left">
              <thead className="text-gray-500 text-xs tracking-widest">
                <tr className="border-b border-white/10">
                  <th className="px-5 md:px-8 py-5"></th>
                  <th className="px-4 py-5">Vehicle Number</th>
                  <th className="px-4 py-5">Assigned Technician</th>
                  <th className="px-4 py-5">Entry Time</th>
                  <th className="px-4 py-5">Expected Completion</th>
                  <th className="px-4 py-5">Status</th>
                  <th className="px-4 py-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-5 md:px-8 py-6">
                        <div
                          className={`w-8 h-8 border flex items-center justify-center rounded ${iconStyle[item.color]}`}
                        >
                          <Icon size={14} />
                        </div>
                      </td>

                      <td className="px-4 py-6 font-mono text-sm text-white">
                        {item.vehicle}
                      </td>

                      <td className="px-4 py-6 text-sm text-gray-300">
                        {item.technician}
                      </td>

                      <td className="px-4 py-6 font-mono text-sm text-gray-300">
                        {item.entry}
                      </td>

                      <td className="px-4 py-6 font-mono text-sm text-gray-300">
                        {item.completion}
                      </td>

                      <td className="px-4 py-6">
                        <span
                          className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${statusStyle[item.color]}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-6 text-gray-400">
                        <MoreVertical size={16} />
                      </td>
                    </tr>
                  );
                })}

                {filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-8 py-12 text-center text-gray-500 text-xs tracking-widest"
                    >
                      NO VEHICLE FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="h-10 md:h-20 border-t border-white/10" />
        </div>
      </main>
    </div>
  );
}