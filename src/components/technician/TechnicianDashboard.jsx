import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  RefreshCw,
} from "lucide-react";

import avatarImage from "../../assets/profile.png";

export default function TechnicianDashboard({
  toggleSidebar,
  onNavigate,
}) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [technician, setTechnician] =
    useState(null);

  const [isLoadingTechnician, setIsLoadingTechnician] =
    useState(true);

  const [technicianError, setTechnicianError] =
    useState("");

  const percentage = 66;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (percentage / 100) * circumference;

  // ==========================================
  // Get logged-in staff details
  // ==========================================

  const getLoggedInStaffUser = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      return JSON.parse(storedStaffUser);
    } catch (error) {
      console.error(
        "Unable to read logged-in staff user:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // Load logged-in technician details
  // ==========================================

  const loadTechnicianDetails = async () => {
    setIsLoadingTechnician(true);
    setTechnicianError("");

    try {
      const staffUser =
        getLoggedInStaffUser();

      if (!staffUser) {
        throw new Error(
          "Logged-in technician details were not found. Please sign in again."
        );
      }

      if (staffUser.role !== "technician") {
        throw new Error(
          "This dashboard is only available for technician accounts."
        );
      }

      const technicianId = Number(
        staffUser.staffId
      );

      if (
        !Number.isInteger(technicianId) ||
        technicianId <= 0
      ) {
        throw new Error(
          "A valid technician ID could not be found. Please sign in again."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/technicians/${technicianId}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.success === false ||
        !data.technician
      ) {
        throw new Error(
          data.message ||
            "Unable to load technician details."
        );
      }

      setTechnician(data.technician);
    } catch (error) {
      console.error(
        "Load technician dashboard details error:",
        error
      );

      setTechnician(null);

      setTechnicianError(
        error.message ||
          "Unable to load technician details."
      );
    } finally {
      setIsLoadingTechnician(false);
    }
  };

  useEffect(() => {
    loadTechnicianDetails();
  }, []);

  // ==========================================
  // Display values
  // ==========================================

  const technicianName =
    technician?.fullName ||
    "Technician";

  const technicianRole =
    technician?.specialization?.length > 0
      ? technician.specialization[0]
      : "Workshop Technician";

  const technicianEmail =
    technician?.email || "";

  const technicianInitials =
    technicianName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) =>
        namePart.charAt(0).toUpperCase()
      )
      .join("") || "T";

  // ==========================================
  // Dashboard statistics
  // ==========================================

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

  // ==========================================
  // Dashboard queue
  // ==========================================

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

  // ==========================================
  // Queue search
  // ==========================================

  const filteredQueue = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

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
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#0a0d14] font-mono text-slate-300">
      {/* ======================================
          Header
      ======================================= */}

      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-3 border-b border-slate-800 bg-[#111827]/95 px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
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

          <h1 className="text-xs font-black tracking-[0.15em] text-white sm:text-sm">
            TECHNICIANS
          </h1>
        </div>

        {/* Desktop Search */}

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[525px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search Workshop..."
              aria-label="Search dashboard queue"
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Header Actions */}

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

          {/* Logged-in Technician Header Profile */}

          <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              {isLoadingTechnician ? (
                <>
                  <p className="text-[10px] font-bold text-slate-400">
                    Loading...
                  </p>

                  <p className="text-[9px] uppercase text-slate-600">
                    Technician
                  </p>
                </>
              ) : (
                <>
                  <p className="max-w-[150px] truncate text-[10px] font-bold text-white">
                    {technicianName}
                  </p>

                  <p className="max-w-[150px] truncate text-[9px] uppercase text-slate-500">
                    {technicianRole}
                  </p>
                </>
              )}
            </div>

            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={avatarImage}
                alt={`${technicianName} profile`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <div className="absolute inset-0 -z-10 flex items-center justify-center text-xs font-black text-indigo-300">
                {technicianInitials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================
          Mobile Search
      ======================================= */}

      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search Workshop..."
            aria-label="Search dashboard queue"
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ======================================
          Dashboard Content
      ======================================= */}

      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:px-6 md:py-8">
        {/* Technician Loading Error */}

        {technicianError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-red-300">
                Unable to load technician details
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {technicianError}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTechnicianDetails}
              disabled={isLoadingTechnician}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoadingTechnician
                    ? "animate-spin"
                    : ""
                }
              />

              Retry
            </button>
          </div>
        )}

        {/* Welcome Section */}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
              Technician Workstation
            </p>

            <h1 className="text-3xl font-black text-white md:text-4xl">
              {isLoadingTechnician
                ? "Loading Technician..."
                : `Welcome Back, ${technicianName}`}
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              You have 4 remaining high-priority
              diagnostics today.
            </p>

            {technicianEmail && (
              <p className="mt-2 text-xs text-slate-600">
                Signed in as {technicianEmail}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("technician-intake")
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={16} />

            Start New Intake
          </button>
        </div>

        {/* ======================================
            Statistics
        ======================================= */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl border bg-[#10121b] p-5 ${card.border}`}
              >
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {card.sub}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon
                      size={18}
                      className={card.color}
                    />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-white">
                  {card.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* ======================================
            Workflow and Current Task
        ======================================= */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Daily Workflow */}

          <div className="rounded-2xl border border-slate-800 bg-[#10121b] p-6 lg:col-span-2">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Daily Workflow Status
                </h3>

                <p className="mt-1 text-[11px] text-slate-500">
                  Real-time task synchronization
                </p>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400">
                LIVE TRACKING
              </span>
            </div>

            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg
                  width="160"
                  height="160"
                  className="absolute -rotate-90"
                >
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

                <div className="z-10 text-center">
                  <h2 className="text-4xl font-black text-white">
                    {percentage}%
                  </h2>

                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Completed
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Pending
                  </p>

                  <p className="text-2xl font-black text-white">
                    4
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Completed
                  </p>

                  <p className="text-2xl font-black text-emerald-400">
                    8
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Avg Time
                  </p>

                  <p className="text-2xl font-black text-amber-400">
                    42m
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Efficiency
                  </p>

                  <p className="text-2xl font-black text-purple-400">
                    94%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Task */}

          <div className="rounded-2xl border border-indigo-500/20 bg-[#10121b] p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Current Active Task
                </h3>

                <p className="mt-1 text-[11px] text-slate-500">
                  Live vehicle progress
                </p>
              </div>

              <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[9px] text-indigo-400">
                IN_PROGRESS
              </span>
            </div>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                <Car
                  size={24}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <p className="text-xl font-black text-white">
                  B-7729-TX
                </p>

                <p className="text-[11px] text-slate-500">
                  Tesla Model 3 - Battery Diagnostic
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
              <div className="mb-2 flex justify-between text-[11px]">
                <span className="text-slate-500">
                  Elapsed Time
                </span>

                <span className="font-bold text-white">
                  01:14:22
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className="h-full w-2/3 rounded-full bg-indigo-400" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle size={14} />

              High voltage safety check required
            </div>
          </div>
        </div>

        {/* ======================================
            Today's Queue
        ======================================= */}

        <div className="rounded-2xl border border-slate-800 bg-[#10121b] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Today’s Queue
              </h3>

              <p className="text-[11px] text-slate-500">
                Upcoming assigned vehicles
              </p>
            </div>

            <span className="cursor-pointer text-[10px] text-indigo-400">
              View All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase">
                  <th className="pb-4 text-left">
                    No
                  </th>

                  <th className="pb-4 text-left">
                    Vehicle Number
                  </th>

                  <th className="pb-4 text-left">
                    Vehicle
                  </th>

                  <th className="pb-4 text-left">
                    Job Type
                  </th>

                  <th className="pb-4 text-left">
                    ETA
                  </th>

                  <th className="pb-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="py-4">
                          <span className="rounded bg-slate-900 px-2 py-1">
                            {item.no}
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="rounded bg-slate-900 px-2 py-1 font-bold tracking-wider text-indigo-300">
                            {item.vehicleNumber}
                          </span>
                        </td>

                        <td className="py-4 font-bold text-white">
                          {item.vehicle}
                        </td>

                        <td className="py-4">
                          {item.job}
                        </td>

                        <td className="py-4">
                          {item.eta}
                        </td>

                        <td className="py-4 text-right">
                          <ChevronRight
                            size={16}
                            className="inline cursor-pointer text-slate-600 hover:text-white"
                          />
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-xs italic text-slate-500"
                    >
                      No dashboard records found for "
                      {searchQuery}".
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