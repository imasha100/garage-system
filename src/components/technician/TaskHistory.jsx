import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  HelpCircle,
  Calendar,
  Info,
  Menu,
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import avatarImage from "../../assets/profile.png";
import TechnicianNotifications from "./TechnicianNotifications";

export default function TaskHistoryLogs({
  toggleSidebar,
  onNavigate,
}) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Statuses");

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [technicianName, setTechnicianName] =
    useState("Technician");

  const [selectedTask, setSelectedTask] =
    useState(null);

  const calendarRef = useRef(null);

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-CA"
    );
  };

  // ======================================================
  // FORMAT DATE + TIME
  // ======================================================

  const formatDateTime = (
    dateValue,
    timeValue
  ) => {
    if (!dateValue) {
      return "Not started";
    }

    const datePart =
      formatDate(dateValue);

    if (!datePart) {
      return "Not started";
    }

    if (!timeValue) {
      return datePart;
    }

    const cleanTime =
      String(timeValue)
        .split(".")[0]
        .slice(0, 5);

    return `${datePart} ${cleanTime}`;
  };

  // ======================================================
  // FORMAT MINUTES
  // ======================================================

  const formatMinutes = (
    totalMinutes
  ) => {
    if (
      totalMinutes === null ||
      totalMinutes === undefined ||
      Number.isNaN(
        Number(totalMinutes)
      )
    ) {
      return "N/A";
    }

    const minutesValue =
      Math.max(
        0,
        Math.round(
          Number(totalMinutes)
        )
      );

    const hours =
      Math.floor(
        minutesValue / 60
      );

    const minutes =
      minutesValue % 60;

    if (
      hours > 0 &&
      minutes > 0
    ) {
      return `${hours} hr${
        hours > 1 ? "s" : ""
      } ${minutes} mins`;
    }

    if (hours > 0) {
      return `${hours} hr${
        hours > 1 ? "s" : ""
      }`;
    }

    return `${minutes} mins`;
  };

  // ======================================================
  // CREATE START DATE TIME
  // ======================================================

  const getStartDateTime = (
    job
  ) => {
    if (
      !job.startDate ||
      !job.startTime
    ) {
      return null;
    }

    const datePart =
      formatDate(
        job.startDate
      );

    if (!datePart) {
      return null;
    }

    const timePart =
      String(
        job.startTime
      ).split(".")[0];

    const date = new Date(
      `${datePart}T${timePart}`
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  };

  // ======================================================
  // EXPECTED REPAIR DURATION
  // ======================================================

  const getExpectedDuration = (
    job
  ) => {
    const startDateTime =
      getStartDateTime(job);

    const expectedValue =
      job.originalEstimatedCompletionTime ||
      job.estimatedCompletionTime;

    if (
      !startDateTime ||
      !expectedValue
    ) {
      return "N/A";
    }

    const expectedDate =
      new Date(
        expectedValue
      );

    if (
      Number.isNaN(
        expectedDate.getTime()
      )
    ) {
      return "N/A";
    }

    const difference =
      (
        expectedDate.getTime() -
        startDateTime.getTime()
      ) /
      60000;

    return formatMinutes(
      difference
    );
  };

  // ======================================================
  // ACTUAL REPAIR DURATION
  // ======================================================

  const getActualDuration = (
    job
  ) => {
    const startDateTime =
      getStartDateTime(job);

    if (!startDateTime) {
      return "N/A";
    }

    if (
      !job.actualCompletionTime
    ) {
      if (
        String(
          job.jobStatus || ""
        ).toUpperCase() ===
        "IN_PROGRESS"
      ) {
        return "In progress";
      }

      return "N/A";
    }

    const actualDate =
      new Date(
        job.actualCompletionTime
      );

    if (
      Number.isNaN(
        actualDate.getTime()
      )
    ) {
      return "N/A";
    }

    const difference =
      (
        actualDate.getTime() -
        startDateTime.getTime()
      ) /
      60000;

    return formatMinutes(
      difference
    );
  };

  // ======================================================
  // STATUS
  // ======================================================

  const getLogStatus = (
    job
  ) => {
    const status =
      String(
        job.jobStatus || ""
      ).toUpperCase();

    if (
      status === "COMPLETED"
    ) {
      return "Completed";
    }

    if (
      status === "IN_PROGRESS" &&
      job.timeExtended
    ) {
      return "Time Extended";
    }

    if (
      status === "IN_PROGRESS"
    ) {
      return "In Progress";
    }

    if (
      status === "ASSIGNED"
    ) {
      return "Assigned";
    }

    if (
      status === "CANCELLED"
    ) {
      return "Cancelled";
    }

    return status || "Unknown";
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusColor = (
    status
  ) => {
    if (
      status === "Completed"
    ) {
      return "text-emerald-400 bg-emerald-500/10";
    }

    if (
      status ===
      "Time Extended"
    ) {
      return "text-amber-400 bg-amber-500/10";
    }

    if (
      status === "In Progress"
    ) {
      return "text-blue-400 bg-blue-500/10";
    }

    if (
      status === "Assigned"
    ) {
      return "text-indigo-400 bg-indigo-500/10";
    }

    if (
      status === "Cancelled"
    ) {
      return "text-red-400 bg-red-500/10";
    }

    return "text-slate-400 bg-slate-500/10";
  };

  // ======================================================
  // LOAD TECHNICIAN JOB HISTORY
  // ======================================================

  const loadTaskHistory =
    async () => {
      try {
        setError("");

        const storedStaffUser =
          sessionStorage.getItem(
            "staffUser"
          );

        if (!storedStaffUser) {
          throw new Error(
            "Logged-in technician details were not found."
          );
        }

        const staffUser =
          JSON.parse(
            storedStaffUser
          );

        const technicianId =
          Number(
            staffUser?.staffId
          );

        if (
          String(
            staffUser?.role ||
              ""
          ).toLowerCase() !==
            "technician" ||
          !Number.isInteger(
            technicianId
          ) ||
          technicianId <= 0
        ) {
          throw new Error(
            "A valid technician account could not be identified."
          );
        }

        const response =
          await fetch(
            `http://localhost:5000/api/service-jobs/technician/${technicianId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success ===
            false
        ) {
          throw new Error(
            result.message ||
              "Unable to load task history."
          );
        }

        if (
          result.technician
            ?.fullName
        ) {
          setTechnicianName(
            result.technician
              .fullName
          );
        }

        const jobs =
          Array.isArray(
            result.jobs
          )
            ? result.jobs
            : [];

        const historyLogs =
          jobs.map(
            (job) => {
              const status =
                getLogStatus(
                  job
                );

              return {
                id:
                  job.jobId,

                date:
                  formatDateTime(
                    job.startDate,
                    job.startTime
                  ),

                rawDate:
                  job.startDate,

                plate:
                  job.vehicleNumber ||
                  "N/A",

                expected:
                  getExpectedDuration(
                    job
                  ),

                actual:
                  getActualDuration(
                    job
                  ),

                status,

                statusColor:
                  getStatusColor(
                    status
                  ),

                timeExtended:
                  Boolean(
                    job.timeExtended
                  ),

                extensionMinutes:
                  Number(
                    job.totalExtensionMinutes
                  ) || 0,

                extensionReason:
                  job.latestExtensionReason ||
                  "",

                estimatedCompletion:
                  job.estimatedCompletionTime,

                actualCompletion:
                  job.actualCompletionTime,

                ticketNumber:
                  job.ticketNumber ||
                  "",

                jobStatus:
                  job.jobStatus ||
                  "",
              };
            }
          );

        setLogs(
          historyLogs
        );
      } catch (error) {
        console.error(
          "Load task history error:",
          error
        );

        setLogs([]);

        setError(
          error.message ||
            "Unable to load task history."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // REAL-TIME REFRESH
  // ======================================================

  useEffect(() => {
    loadTaskHistory();

    const refreshInterval =
      setInterval(() => {
        loadTaskHistory();
      }, 5000);

    return () => {
      clearInterval(
        refreshInterval
      );
    };
  }, []);

  // ======================================================
  // FILTER LOGS
  // ======================================================

  const filteredLogs =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return logs.filter(
        (log) => {
          const matchesStatus =
            statusFilter ===
              "All Statuses" ||
            log.status ===
              statusFilter;

          let matchesDate =
            true;

          if (
            selectedDate &&
            log.rawDate
          ) {
            const logDate =
              new Date(
                log.rawDate
              );

            if (
              !Number.isNaN(
                logDate.getTime()
              )
            ) {
              matchesDate =
                logDate.toDateString() ===
                selectedDate.toDateString();
            }
          }

          const matchesSearch =
            !query ||
            [
              log.date,
              log.plate,
              log.expected,
              log.actual,
              log.status,
              log.ticketNumber,
              log.extensionReason,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query);

          return (
            matchesStatus &&
            matchesDate &&
            matchesSearch
          );
        }
      );
    }, [
      logs,
      searchQuery,
      statusFilter,
      selectedDate,
    ]);

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0d14] font-mono text-slate-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 sm:px-6 backdrop-blur-xl">
        <div className="flex w-auto shrink-0 items-center gap-3 md:w-48">
          <button
            type="button"
            onClick={
              toggleSidebar
            }
            aria-label="Open technician sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0a0d14] text-slate-400 transition hover:border-indigo-500 hover:text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-sm font-black tracking-[0.15em] text-white">
            TECHNICIANS
          </h1>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[525px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search Workshop..."
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <TechnicianNotifications onNavigate={onNavigate} />

          <button
            type="button"
            className="text-slate-400 transition hover:text-white"
          >
            <HelpCircle
              size={17}
            />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold text-white">
                {technicianName}
              </p>

              <p className="text-[9px] uppercase text-slate-500">
                Technician
              </p>
            </div>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={
                  avatarImage
                }
                alt={
                  technicianName
                }
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={
              searchQuery
            }
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target
                  .value
              )
            }
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
            Real-time technician service job history
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* FILTERS */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2 rounded border border-slate-800 bg-[#111827] px-3 py-1.5 text-xs">
            <button
              type="button"
              onClick={() =>
                calendarRef.current?.setOpen(
                  true
                )
              }
              className="text-slate-500 transition hover:text-indigo-400"
            >
              <Calendar
                size={14}
              />
            </button>

            <DatePicker
              ref={calendarRef}
              selected={
                selectedDate
              }
              onChange={(
                date
              ) =>
                setSelectedDate(
                  date
                )
              }
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={
                20
              }
              dropdownMode="select"
              minDate={
                new Date(
                  2026,
                  0,
                  1
                )
              }
              isClearable
              className="w-48 cursor-pointer bg-transparent text-slate-300 outline-none placeholder:text-slate-500"
              placeholderText="Select a date"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
            className="rounded border border-slate-800 bg-[#111827] px-4 py-2 text-xs outline-none focus:border-indigo-500"
          >
            <option>
              All Statuses
            </option>

            <option>
              Completed
            </option>

            <option>
              Time Extended
            </option>

            <option>
              In Progress
            </option>

            <option>
              Assigned
            </option>

            <option>
              Cancelled
            </option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#111827]">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[850px] text-xs text-slate-400">
              <thead className="sticky top-0 z-20 bg-[#111827]">
                <tr className="border-b border-slate-800 text-[12px] uppercase">
                  <th className="p-4 text-left">
                    Date & Time
                  </th>

                  <th className="p-4 text-left">
                    Vehicle Plate No
                  </th>

                  <th className="p-4 text-left">
                    Expected Time
                  </th>

                  <th className="p-4 text-left">
                    Actual Time
                  </th>

                  <th className="p-4 text-left">
                    Status Badge
                  </th>

                  <th className="p-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                logs.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-slate-500"
                    >
                      Loading task
                      history...
                    </td>
                  </tr>
                ) : filteredLogs.length >
                  0 ? (
                  filteredLogs.map(
                    (log) => (
                      <tr
                        key={
                          log.id
                        }
                        className="border-b border-slate-800/50 transition hover:bg-slate-800/20"
                      >
                        <td className="p-4 text-white">
                          {
                            log.date
                          }
                        </td>

                        <td className="p-4">
                          <span className="rounded bg-slate-800 px-2 py-1">
                            {
                              log.plate
                            }
                          </span>
                        </td>

                        <td className="p-4">
                          {
                            log.expected
                          }

                          {log.timeExtended && (
                            <p className="mt-1 text-[9px] text-amber-400">
                              +
                              {
                                log.extensionMinutes
                              }{" "}
                              mins extended
                            </p>
                          )}
                        </td>

                        <td
                          className={`p-4 ${
                            log.actual ===
                            "In progress"
                              ? "text-blue-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {
                            log.actual
                          }
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded px-2 py-1 text-[10px] ${log.statusColor}`}
                          >
                            {
                              log.status
                            }
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTask(
                                log
                              )
                            }
                            className="text-slate-400 transition hover:text-white"
                            title="View task details"
                          >
                            <Info
                              size={
                                16
                              }
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center italic text-slate-500"
                    >
                      No task logs
                      match the
                      selected search
                      or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {/* ==================================================
          TASK DETAILS POPUP
      =================================================== */}

      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Service Record
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Task Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTask(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                aria-label="Close task details"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-6">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Vehicle
                </span>

                <span className="rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">
                  {
                    selectedTask.plate
                  }
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Ticket
                </span>

                <span className="text-xs font-bold text-white">
                  {selectedTask.ticketNumber ||
                    "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Started
                </span>

                <span className="text-xs text-slate-300">
                  {
                    selectedTask.date
                  }
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Expected Time
                </span>

                <span className="text-xs font-bold text-slate-300">
                  {
                    selectedTask.expected
                  }
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Actual Time
                </span>

                <span
                  className={`text-xs font-bold ${
                    selectedTask.actual ===
                    "In progress"
                      ? "text-blue-400"
                      : "text-emerald-400"
                  }`}
                >
                  {
                    selectedTask.actual
                  }
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a0d14] px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Status
                </span>

                <span
                  className={`rounded px-2 py-1 text-[10px] font-bold ${selectedTask.statusColor}`}
                >
                  {
                    selectedTask.status
                  }
                </span>
              </div>

              {selectedTask.timeExtended && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-amber-500/70">
                      Time Extension
                    </span>

                    <span className="text-xs font-bold text-amber-400">
                      +
                      {
                        selectedTask.extensionMinutes
                      }{" "}
                      mins
                    </span>
                  </div>

                  {selectedTask.extensionReason && (
                    <div className="mt-3 border-t border-amber-500/10 pt-3">
                      <p className="text-[9px] uppercase tracking-wider text-slate-500">
                        Reason
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        {
                          selectedTask.extensionReason
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedTask(
                    null
                  )
                }
                className="w-full rounded-lg bg-indigo-600 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}