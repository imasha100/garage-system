import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Calendar,
  Info,
  Menu,
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import avatarImage from "../../assets/profile.png";

export default function TaskHistoryLogs({ toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarRef = useRef(null);

  const logs = [
    {
      id: 1,
      date: "2026-06-29 16:22",
      plate: "TX-9902-BJ",
      expected: "45 mins",
      actual: "42 mins",
      status: "Cleared By Assistance",
      statusColor: "text-emerald-400 bg-emerald-500/10",
    },
    {
      id: 2,
      date: "2026-03-23 13:10",
      plate: "AB-1234-ZY",
      expected: "30 mins",
      actual: "38 mins",
      status: "Time Extended",
      statusColor: "text-amber-400 bg-amber-500/10",
    },
    {
      id: 3,
      date: "2026-04-17 12:45",
      plate: "K-930-LP",
      expected: "60 mins",
      actual: "58 mins",
      status: "Cleared By Assistance",
      statusColor: "text-emerald-400 bg-emerald-500/10",
    },
  ];

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === "All Statuses" ||
        log.status === statusFilter;

      const logDate = new Date(
        `${log.date.split(" ")[0]}T00:00:00`
      );

      const matchesDate =
        !selectedDate ||
        logDate.toDateString() === selectedDate.toDateString();

      const matchesSearch =
        !query ||
        [
          log.date,
          log.plate,
          log.expected,
          log.actual,
          log.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [searchQuery, statusFilter, selectedDate]);

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0d14] font-mono text-slate-300">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 sm:px-6 backdrop-blur-xl">
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

          <h1 className="text-sm font-black tracking-[0.15em] text-white">
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
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <button
            type="button"
            className="text-slate-400 transition hover:text-white"
          >
            <Bell size={17} />
          </button>

          <button
            type="button"
            className="text-slate-400 transition hover:text-white"
          >
            <HelpCircle size={17} />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold text-white">
                M. Anderson
              </p>

              <p className="text-[9px] uppercase text-slate-500">
                Senior Mechanic
              </p>
            </div>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={avatarImage}
                alt="M. Anderson"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
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
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-20 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Task History Logs
          </h1>

          <p className="text-base text-slate-500 md:text-xl">
            Reviewing precision workflow and exit compliance
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2 rounded border border-slate-800 bg-[#111827] px-3 py-1.5 text-xs">
            <button
              type="button"
              onClick={() => calendarRef.current?.setOpen(true)}
              className="text-slate-500 transition hover:text-indigo-400"
            >
              <Calendar size={14} />
            </button>

            <DatePicker
              ref={calendarRef}
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={20}
              dropdownMode="select"
              minDate={new Date(2026, 0, 1)}
              isClearable
              className="w-48 cursor-pointer bg-transparent text-slate-300 outline-none placeholder:text-slate-500"
              placeholderText="Select a date"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded border border-slate-800 bg-[#111827] px-4 py-2 text-xs outline-none focus:border-indigo-500"
          >
            <option>All Statuses</option>
            <option>Cleared By Assistance</option>
            <option>Time Extended</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#111827]">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[760px] text-xs text-slate-400">
              <thead className="sticky top-0 z-20 bg-[#111827]">
                <tr className="border-b border-slate-800 text-[12px] uppercase">
                  <th className="p-4 text-left">Date & Time</th>
                  <th className="p-4 text-left">
                    Vehicle Plate No
                  </th>
                  <th className="p-4 text-left">
                    Expected Time
                  </th>
                  <th className="p-4 text-left">Actual Time</th>
                  <th className="p-4 text-left">Status Badge</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/50 transition hover:bg-slate-800/20"
                    >
                      <td className="p-4 text-white">
                        {log.date}
                      </td>

                      <td className="p-4">
                        <span className="rounded bg-slate-800 px-2 py-1">
                          {log.plate}
                        </span>
                      </td>

                      <td className="p-4">{log.expected}</td>

                      <td className="p-4 text-emerald-400">
                        {log.actual}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-1 text-[10px] ${log.statusColor}`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          className="text-slate-400 transition hover:text-white"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center italic text-slate-500"
                    >
                      No task logs match the selected search or
                      filters.
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