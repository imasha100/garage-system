import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  LogIn,
  Car,
  Clock3,
  ListChecks,
  MoreVertical,
  Activity,
  ChevronDown,
  Menu,
} from "lucide-react";

import avatarImage from "../../assets/profile.png";
import garageImage from "../../assets/garage-car.jpeg";

export default function VehicleIntake({ toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("WP CAS 1234");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const dayOptions = [1, 2, 3, 4];

  const timeOptions = Array.from({ length: 95 }, (_, index) => {
    const totalMinutes = (index + 1) * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  });

  const [queue, setQueue] = useState([
    {
      plate: "B-7412-HX",
      duration: "2 hrs",
      time: "08:45 AM",
      status: "IN-PROGRESS",
    },
    {
      plate: "TX-902-LK",
      duration: "30 min",
      time: "09:12 AM",
      status: "QUEUED",
    },
    {
      plate: "CAS-1120-W",
      duration: "1 hr",
      time: "09:30 AM",
      status: "IN-PROGRESS",
    },
    {
      plate: "DE-5544-ZZ",
      duration: "3+ hrs",
      time: "09:45 AM",
      status: "STALLED",
    },
  ]);

  const formatDuration = (days, time) => {
    if (days) {
      const numericDays = Number(days);
      return `${numericDays} ${numericDays === 1 ? "day" : "days"}`;
    }

    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      const parts = [];

      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
      }

      if (minutes > 0) {
        parts.push(`${minutes} min`);
      }

      return parts.join(" ");
    }

    return "Not selected";
  };

  const filteredQueue = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return queue;
    }

    return queue.filter((vehicle) =>
      [
        vehicle.plate,
        vehicle.duration,
        vehicle.time,
        vehicle.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [queue, searchQuery]);

  const addToWorkload = () => {
    const plate = vehiclePlate.trim();

    if (!plate) {
      alert("Please enter the vehicle license plate.");
      return;
    }

    if (!estimatedDays && !estimatedTime) {
      alert("Please select either Days or Time.");
      return;
    }

    if (estimatedDays && estimatedTime) {
      alert("Please select only one option: Days or Time.");
      return;
    }

    const newVehicle = {
      plate: plate.toUpperCase(),
      duration: formatDuration(estimatedDays, estimatedTime),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "QUEUED",
    };

    setQueue((previousQueue) => [...previousQueue, newVehicle]);
    setVehiclePlate("");
    setEstimatedDays("");
    setEstimatedTime("");
  };

  const getStatusStyle = (status) => {
    if (status === "IN-PROGRESS") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (status === "QUEUED") {
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }

    if (status === "STALLED") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-slate-600 bg-slate-700/20 text-slate-400";
  };

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
        <div className="mb-5">
          <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
            Intake Terminal
          </h1>

          <p className="mt-1 text-[10px] text-slate-400 md:text-xs">
            Register new vehicle arrivals for the current shift.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-md border border-slate-700 bg-[#172036] p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn size={17} className="text-indigo-300" />

                <h2 className="text-sm font-bold text-slate-100 md:text-base">
                  Vehicle Intake
                </h2>
              </div>

              <span className="rounded-sm border border-slate-600 bg-slate-700/60 px-2 py-1 text-[8px] text-slate-300">
                ENTRY-702
              </span>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Vehicle License Plate
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(event) =>
                    setVehiclePlate(event.target.value)
                  }
                  placeholder="WP CAS 1234"
                  className="w-full rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs uppercase tracking-[0.18em] text-slate-300 outline-none transition focus:border-indigo-500"
                />

                <Car
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Repair Duration
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Days
                  </label>

                  <div className="relative">
                    <select
                      value={estimatedDays}
                      onChange={(event) => {
                        setEstimatedDays(event.target.value);
                        setEstimatedTime("");
                      }}
                      className="w-full appearance-none rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs text-slate-300 outline-none transition focus:border-indigo-500"
                    >
                      <option value="">Select Days</option>

                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day} {day === 1 ? "Day" : "Days"}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </label>

                  <div className="relative">
                    <select
                      value={estimatedTime}
                      onChange={(event) => {
                        setEstimatedTime(event.target.value);
                        setEstimatedDays("");
                      }}
                      className="w-full appearance-none rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs text-slate-300 outline-none transition focus:border-indigo-500"
                    >
                      <option value="">Select Time</option>

                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[9px] text-slate-500">
                Select only one: Days or Time.{" "}
                <span className="text-indigo-300">
                  Selected: {formatDuration(estimatedDays, estimatedTime)}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={addToWorkload}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-indigo-600 py-3 text-[10px] font-medium text-white transition hover:bg-indigo-500"
            >
              <Activity size={13} />
              Add to Active Workload
            </button>
          </div>

          <div className="relative min-h-[250px] overflow-hidden rounded-md border border-slate-700 bg-[#172036] shadow-xl">
            <img
              src={garageImage}
              alt="Garage maintenance bay"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1224] via-[#0b1224]/15 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-200">
                Bay Status: Optimized
              </p>

              <div className="mt-1 flex items-end justify-between gap-4">
                <h3 className="text-sm font-black text-white md:text-lg">
                  4 Available Maintenance Slots
                </h3>

                <div className="flex shrink-0 items-center gap-2 pb-1">
                  <span className="h-[3px] w-8 rounded-full bg-indigo-300" />
                  <span className="h-[3px] w-8 rounded-full bg-slate-600" />
                  <span className="h-[3px] w-8 rounded-full bg-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-800 bg-[#172036] p-4 shadow-xl md:p-5">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-emerald-400" />

              <h2 className="text-sm font-bold text-slate-100 md:text-base">
                Active Queue
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live Updates Enabled
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="text-left text-[8px] uppercase tracking-widest text-slate-500">
                  <th className="pb-4 pl-2">Plate</th>
                  <th className="pb-4">Duration</th>
                  <th className="pb-4">Time In</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((vehicle, index) => (
                    <tr
                      key={`${vehicle.plate}-${index}`}
                      className="border-t border-slate-800/30 text-[10px] text-slate-300 transition hover:bg-slate-800/20"
                    >
                      <td className="py-4 pl-2">
                        <span className="font-black tracking-[0.18em] text-indigo-200">
                          {vehicle.plate}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock3
                            size={11}
                            className="text-slate-600"
                          />
                          {vehicle.duration}
                        </div>
                      </td>

                      <td className="py-4 text-slate-400">
                        {vehicle.time}
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex min-w-[72px] items-center justify-center rounded-full border px-2 py-1 text-[6px] font-bold ${getStatusStyle(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <button
                          type="button"
                          className="rounded p-1 text-slate-600 transition hover:bg-slate-700 hover:text-white"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-xs italic text-slate-500"
                    >
                      No vehicles found for "{searchQuery}".
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