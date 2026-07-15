import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Bell,
  HelpCircle,
  ChevronRight,
  ClipboardList,
  CheckCircle,
  Activity,
  Clock,
  Car,
  AlertTriangle,
  Menu,
} from "lucide-react";
import avatarImage from "../../assets/profile.png";

export default function Dashboard({
  toggleSidebar,
  onNavigate,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const percentage = 66;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const stats = [
    {
      label: "Assigned Vehicles",
      value: "12",
      sub: "Today workload",
      icon: ClipboardList,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Completed Tasks",
      value: "8 / 12",
      sub: "Daily progress",
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Efficiency Index",
      value: "94%",
      sub: "Performance KPI",
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Avg Repair Time",
      value: "42m",
      sub: "Per vehicle",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  const queue = [
    {
      no: "09",
      vehicle: "VW Golf GTI",
      vehicleNumber: "WP-CAS-1234",
      job: "Brake Pad Replacement",
      eta: "25m",
      status: "Queued",
    },
    {
      no: "10",
      vehicle: "Audi RS6",
      vehicleNumber: "CP-CB-8890",
      job: "Oil System Flush",
      eta: "40m",
      status: "Waiting",
    },
    {
      no: "11",
      vehicle: "Ford F-150",
      vehicleNumber: "WP-KV-1122",
      job: "Suspension Tuning",
      eta: "1h",
      status: "Waiting",
    },
  ];

  const filteredQueue = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return queue;
    }

    return queue.filter((item) =>
      [
        item.no,
        item.vehicle,
        item.vehicleNumber,
        item.job,
        item.eta,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-300 font-mono overflow-x-hidden overflow-y-auto">
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-3 sm:gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 sm:px-6 backdrop-blur-xl">
        <div className="flex w-auto shrink-0 items-center gap-3 md:w-48">
          {/* Mobile Sidebar Menu Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open technician sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0a0d14] text-slate-400 transition hover:border-indigo-500 hover:text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xs sm:text-sm font-black tracking-[0.15em] text-white">
            TECHNICIANS
          </h1>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[525px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Workshop..."
              aria-label="Search dashboard queue"
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="text-slate-400 transition hover:text-white"
          >
            <Bell size={17} />
          </button>

          <button
            type="button"
            aria-label="Help"
            className="text-slate-400 transition hover:text-white"
          >
            <HelpCircle size={17} />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold text-white">M. Anderson</p>
              <p className="text-[9px] uppercase text-slate-500">
                Senior Mechanic
              </p>
            </div>

            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={avatarImage}
                alt="M. Anderson"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Workshop..."
            aria-label="Search dashboard queue"
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-7xl mx-auto py-6 md:py-8 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-indigo-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">
              Technician Workstation
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-white">
              Welcome Back, Alex Chen
            </h1>

            <p className="text-slate-500 text-sm md:text-base mt-2">
              You have 4 remaining high-priority diagnostics today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.("technician-intake")}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition text-sm uppercase tracking-widest"
          >
            <Plus size={16} />
            Start New Intake
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {stats.map((card, i) => {
            const Icon = card.icon;

            return (
              <div
                key={i}
                className={`bg-[#10121b] border ${card.border} p-5 rounded-2xl relative overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                      {card.label}
                    </p>

                    <p className="text-slate-600 text-[10px] mt-1">
                      {card.sub}
                    </p>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}
                  >
                    <Icon size={18} className={card.color} />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-white">
                  {card.value}
                </h2>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#10121b] border border-slate-800 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-white font-bold text-xl">
                  Daily Workflow Status
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Real-time task synchronization
                </p>
              </div>

              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                LIVE TRACKING
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg width="160" height="160" className="-rotate-90 absolute">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#6366f1"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="text-center z-10">
                  <h2 className="text-4xl font-black text-white">
                    {percentage}%
                  </h2>

                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Completed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Pending
                  </p>

                  <p className="text-2xl font-black text-white">4</p>
                </div>

                <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Completed
                  </p>

                  <p className="text-2xl font-black text-emerald-400">8</p>
                </div>

                <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Avg Time
                  </p>

                  <p className="text-2xl font-black text-amber-400">42m</p>
                </div>

                <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Efficiency
                  </p>

                  <p className="text-2xl font-black text-purple-400">94%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#10121b] border border-indigo-500/20 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-white font-bold text-xl">
                  Current Active Task
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Live vehicle progress
                </p>
              </div>

              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[9px]">
                IN_PROGRESS
              </span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Car size={24} className="text-indigo-400" />
              </div>

              <div>
                <p className="text-white font-black text-xl">B-7729-TX</p>

                <p className="text-[11px] text-slate-500">
                  Tesla Model 3 - Battery Diagnostic
                </p>
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-slate-500">Elapsed Time</span>

                <span className="text-white font-bold">01:14:22</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-indigo-400 w-2/3 h-full rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-400 text-xs">
              <AlertTriangle size={14} />
              High voltage safety check required
            </div>
          </div>
        </div>

        <div className="bg-[#10121b] border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-white font-bold text-xl">
                Today’s Queue
              </h3>

              <p className="text-[11px] text-slate-500">
                Upcoming assigned vehicles
              </p>
            </div>

            <span className="text-[10px] text-indigo-400 cursor-pointer">
              View All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 uppercase text-[10px]">
                  <th className="text-left pb-4">No</th>
                  <th className="text-left pb-4">Vehicle Number</th>
                  <th className="text-left pb-4">Vehicle</th>
                  <th className="text-left pb-4">Job Type</th>
                  <th className="text-left pb-4">ETA</th>
                  <th className="text-right pb-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-800/50 last:border-0"
                    >
                      <td className="py-4">
                        <span className="bg-slate-900 px-2 py-1 rounded">
                          {item.no}
                        </span>
                      </td>

                      <td className="py-4">
                        <span className="rounded bg-slate-900 px-2 py-1 font-bold tracking-wider text-indigo-300">
                          {item.vehicleNumber}
                        </span>
                      </td>

                      <td className="py-4 text-white font-bold">
                        {item.vehicle}
                      </td>

                      <td className="py-4">{item.job}</td>

                      <td className="py-4">{item.eta}</td>

                      <td className="py-4 text-right">
                        <ChevronRight
                          size={16}
                          className="inline text-slate-600 hover:text-white cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-xs italic text-slate-500"
                    >
                      No dashboard records found for "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}