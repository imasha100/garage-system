import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Info,
  User,
} from "lucide-react";

export default function PerformanceAudit({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");

  const technicians = [
    {
      name: "Marco Rossi",
      jobsDone: 14,
      extRequests: "02",
      avgError: "-05 mins",
      efficiency: 94,
      color: "emerald",
    },
    {
      name: "Alan Stark",
      jobsDone: 11,
      extRequests: "05",
      avgError: "+08 mins",
      efficiency: 82,
      color: "yellow",
    },
    {
      name: "John Doe",
      jobsDone: "08",
      extRequests: "09",
      avgError: "+18 mins",
      efficiency: 64,
      color: "red",
    },
  ];

  const filteredTechnicians = technicians.filter((item) =>
    `${item.name} ${item.jobsDone} ${item.extRequests} ${item.avgError} ${item.efficiency}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const colorStyle = {
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
      text: "text-emerald-400",
      bar: "bg-emerald-400",
    },
    yellow: {
      icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
      text: "text-yellow-400",
      bar: "bg-yellow-400",
    },
    red: {
      icon: "bg-red-500/10 text-red-400 border-red-500/40",
      text: "text-red-300",
      bar: "bg-red-300",
    },
  };

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">
      {/* Top Bar */}
      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search size={15} className="text-gray-500 shrink-0" />

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Global search..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
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

        <div className="flex items-center justify-between md:justify-end gap-5">
          <Bell size={18} className="text-gray-300" />
          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-xs font-bold tracking-widest">Master Admin</p>
            <p className="text-[10px] text-indigo-400 uppercase">
              Owner Level
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl border border-indigo-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
          Technician Precision & <br className="hidden md:block" />
          Operational Audit Trail
        </h1>

        <p className="text-gray-400 text-sm md:text-base mb-10 flex items-center gap-2">
          <Info size={15} className="text-cyan-400" />
          Tracks individual time accuracy, approved extensions, and system
          efficiency indexes.
        </p>

        {/* Main Table */}
        <div className="bg-[#181820] border border-white/10 rounded-lg overflow-hidden mb-10">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-cyan-400 font-bold tracking-[0.25em]">
              ● LIVE EFFICIENCY METRICS
            </p>

            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="w-2 h-2 rounded-full bg-gray-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-[850px] md:w-full text-left">
              <thead className="text-gray-400 text-[11px] tracking-widest">
                <tr className="border-b border-white/10">
                  <th className="px-8 py-5"></th>
                  <th className="px-4 py-5">Technician Name</th>
                  <th className="px-4 py-5">Jobs Done</th>
                  <th className="px-4 py-5">Ext. Requests</th>
                  <th className="px-4 py-5">Avg. Time Error</th>
                  <th className="px-4 py-5">Efficiency Index</th>
                </tr>
              </thead>

              <tbody>
                {filteredTechnicians.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/10 hover:bg-white/[0.03]"
                  >
                    <td className="px-8 py-5">
                      <div
                        className={`w-8 h-8 border rounded flex items-center justify-center ${
                          colorStyle[item.color].icon
                        }`}
                      >
                        <User size={14} />
                      </div>
                    </td>

                    <td className="px-4 py-5 text-sm text-white">
                      {item.name}
                    </td>

                    <td className="px-4 py-5 font-mono text-sm">
                      {item.jobsDone}
                    </td>

                    <td className="px-4 py-5">
                      <span className="bg-white/5 px-3 py-1 rounded text-sm font-mono">
                        {item.extRequests}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-5 font-mono text-sm ${
                        colorStyle[item.color].text
                      }`}
                    >
                      {item.avgError}
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-2">
                        <span className="font-mono text-sm">
                          {item.efficiency}%
                        </span>

                        <div className="w-28 h-1 bg-gray-700 rounded">
                          <div
                            className={`h-1 rounded ${
                              colorStyle[item.color].bar
                            }`}
                            style={{ width: `${item.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTechnicians.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-gray-500 text-xs tracking-widest"
                    >
                      NO AUDIT DATA FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}