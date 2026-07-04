import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Plus,
  CircleDot,
  Gauge,
} from "lucide-react";

export default function ResourceMatrix({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");

  const technicians = [
    {
      name: "MARCO ROSSI",
      status: "BUSY",
      vehicle: "WP-CAS-1234",
      highlight: false,
    },
    {
      name: "ALAN STARK",
      status: "BUSY",
      vehicle: "CP-CB-8890",
      highlight: false,
    },
    {
      name: "JOHN DOE",
      status: "BUSY",
      vehicle: "WP-KV-1122",
      highlight: true,
    },
    {
      name: "DAVID KIM",
      status: "FREE",
      vehicle: "— None —",
      highlight: false,
    },
    {
      name: "ALEX WONG",
      status: "FREE",
      vehicle: "— None —",
      highlight: false,
    },
  ];

  const overrunVehicles = [
    {
      vehicle: "WP-KV-1122",
      technician: "John Doe",
      metric: "● +15 Mins Overrun",
      color: "text-red-300",
    },
    {
      vehicle: "SP-HN-4455",
      technician: "David Kim",
      metric: "● +08 Mins Overrun",
      color: "text-orange-400",
    },
  ];

  const filteredTechnicians = technicians.filter((tech) =>
    `${tech.name} ${tech.status} ${tech.vehicle}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

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
              placeholder="Search systems..."
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

          <div className="w-9 h-9 rounded-xl border border-cyan-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
          RESOURCE & LABOR MATRIX
        </h1>

        <p className="text-gray-400 text-sm md:text-base mb-10">
          Real-time personnel optimization, allocation controls, and active
          buffer queues.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 max-w-5xl mb-8">
          <div className="bg-[#181820] border border-white/10 rounded-lg p-6">
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em] mb-5">
              Vehicle Release <br /> Rate
            </p>

            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black">88%</h2>
              <div className="w-14 h-6 bg-emerald-400/20" />
            </div>
          </div>

          <div className="bg-[#181820] border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-start mb-5">
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em]">
                Available Free <br /> Technicians
              </p>
              <CircleDot size={13} className="text-emerald-400" />
            </div>

            <h2 className="text-3xl font-mono font-black text-emerald-400">
              2 Free
            </h2>
          </div>

          <div className="bg-[#181820] border border-white/10 rounded-lg p-6 sm:col-span-2 xl:col-span-1">
            <div className="flex justify-between items-start mb-5">
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em]">
                Confirmed Allocations
              </p>
              <Gauge size={14} className="text-indigo-300" />
            </div>

            <h2 className="text-3xl font-mono font-black text-indigo-300">
              4 Active
            </h2>
          </div>
        </div>

        {/* Technician Cards */}
        <section className="mb-8">
          <h2 className="text-sm md:text-base text-gray-200 mb-2">
            Technician Availability & Real-time Workload Mapping
          </h2>

          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Live breakdown of on-duty personnel availability and active jobs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredTechnicians.map((tech, index) => (
              <div
                key={index}
                className={`bg-[#1b1b24] border rounded-lg p-5 ${
                  tech.highlight
                    ? "border-red-400/30 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-mono font-bold">
                    {tech.name}
                  </h3>

                  <span
                    className={`text-[10px] px-2 py-1 rounded border ${
                      tech.status === "FREE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    }`}
                  >
                    {tech.status}
                  </span>
                </div>

                <p className="text-[10px] text-gray-500 uppercase">
                  Active Vehicle
                </p>

                <p
                  className={`mt-2 text-sm font-mono ${
                    tech.highlight ? "text-red-300" : "text-gray-300"
                  }`}
                >
                  {tech.vehicle}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Overrun Table */}
        <section className="mb-20">
          <h2 className="text-sm md:text-base text-gray-200 mb-2">
            Critical Time Overrun & Vehicles in Buffer Queue
          </h2>

          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Vehicles exceeding baseline diagnostic durations.
          </p>

          <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-[750px] md:w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs">
                  <tr>
                    <th className="px-8 py-5">Vehicle ID</th>
                    <th className="px-8 py-5">Assigned Technician</th>
                    <th className="px-8 py-5">Overrun Metric</th>
                  </tr>
                </thead>

                <tbody>
                  {overrunVehicles.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-white/5 text-sm text-gray-300"
                    >
                      <td className="px-8 py-5 font-mono">{item.vehicle}</td>
                      <td className="px-8 py-5">{item.technician}</td>
                      <td className={`px-8 py-5 font-mono ${item.color}`}>
                        {item.metric}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <button className="fixed bottom-6 right-6 w-14 h-14 rounded-xl bg-indigo-300 text-black flex items-center justify-center shadow-xl hover:scale-105 transition">
          <Plus size={24} />
        </button>
      </main>
    </div>
  );
}