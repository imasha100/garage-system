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

  const [jobs, setJobs] =
    useState([]);

  const [
    isLoadingTechnician,
    setIsLoadingTechnician,
  ] = useState(true);

  const [
    technicianError,
    setTechnicianError,
  ] = useState("");

  const [
    currentTime,
    setCurrentTime,
  ] = useState(new Date());

  // ======================================================
  // GET LOGGED-IN STAFF USER
  // ======================================================

  const getLoggedInStaffUser = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        return null;
      }

      return JSON.parse(
        storedStaffUser
      );
    } catch (error) {
      console.error(
        "Unable to read logged-in staff user:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // GET TECHNICIAN ID
  // ======================================================

  const getLoggedInTechnicianId = () => {
    const staffUser =
      getLoggedInStaffUser();

    if (!staffUser) {
      return null;
    }

    if (
      String(
        staffUser.role || ""
      ).toLowerCase() !==
      "technician"
    ) {
      return null;
    }

    const technicianId =
      Number(
        staffUser.staffId
      );

    if (
      !Number.isInteger(
        technicianId
      ) ||
      technicianId <= 0
    ) {
      return null;
    }

    return technicianId;
  };

  // ======================================================
  // FORMAT DATE ONLY
  // ======================================================

  const formatDateOnly = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ======================================================
  // CREATE DATE + TIME OBJECT
  // ======================================================

  const createDateTime = (
    dateValue,
    timeValue
  ) => {
    if (
      !dateValue ||
      !timeValue
    ) {
      return null;
    }

    const datePart =
      formatDateOnly(
        dateValue
      );

    if (!datePart) {
      return null;
    }

    const cleanTime =
      String(
        timeValue
      )
        .split(".")[0];

    const date =
      new Date(
        `${datePart}T${cleanTime}`
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
  // FORMAT MINUTES
  // ======================================================

  const formatMinutes = (
    value
  ) => {
    const totalMinutes =
      Math.max(
        0,
        Math.round(
          Number(value) || 0
        )
      );

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    if (
      hours > 0 &&
      minutes > 0
    ) {
      return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${minutes}m`;
  };

  // ======================================================
  // GET ACTUAL JOB DURATION
  // ======================================================

  const getActualJobMinutes = (
    job
  ) => {
    const start =
      createDateTime(
        job.startDate,
        job.startTime
      );

    if (!start) {
      return null;
    }

    let end = null;

    if (
      job.actualCompletionTime
    ) {
      end = new Date(
        job.actualCompletionTime
      );
    } else if (
      job.endDate &&
      job.endTime
    ) {
      end =
        createDateTime(
          job.endDate,
          job.endTime
        );
    }

    if (
      !end ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return null;
    }

    return (
      end.getTime() -
      start.getTime()
    ) / 60000;
  };

  // ======================================================
  // GET ORIGINAL EXPECTED JOB DURATION
  // ======================================================

  const getExpectedJobMinutes = (
    job
  ) => {
    const start =
      createDateTime(
        job.startDate,
        job.startTime
      );

    const expectedValue =
      job.originalEstimatedCompletionTime ||
      job.estimatedCompletionTime;

    if (
      !start ||
      !expectedValue
    ) {
      return null;
    }

    const expected =
      new Date(
        expectedValue
      );

    if (
      Number.isNaN(
        expected.getTime()
      )
    ) {
      return null;
    }

    return (
      expected.getTime() -
      start.getTime()
    ) / 60000;
  };

  // ======================================================
  // FORMAT ELAPSED TIME
  // ======================================================

  const formatElapsedTime = (
    startDate,
    startTime
  ) => {
    const start =
      createDateTime(
        startDate,
        startTime
      );

    if (!start) {
      return "00:00:00";
    }

    const difference =
      Math.max(
        0,
        Math.floor(
          (
            currentTime.getTime() -
            start.getTime()
          ) / 1000
        )
      );

    const hours =
      Math.floor(
        difference / 3600
      );

    const minutes =
      Math.floor(
        (
          difference % 3600
        ) / 60
      );

    const seconds =
      difference % 60;

    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  };

  // ======================================================
  // LOAD TECHNICIAN + JOB DETAILS
  // ======================================================

  const loadDashboardData =
    async () => {
      try {
        setTechnicianError("");

        const technicianId =
          getLoggedInTechnicianId();

        if (!technicianId) {
          throw new Error(
            "A valid logged-in technician account could not be identified."
          );
        }

        const [
          technicianResponse,
          jobsResponse,
        ] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/technicians/${technicianId}`
            ),

            fetch(
              `http://localhost:5000/api/service-jobs/technician/${technicianId}`
            ),
          ]);

        const technicianResult =
          await technicianResponse.json();

        const jobsResult =
          await jobsResponse.json();

        if (
          !technicianResponse.ok ||
          technicianResult.success ===
            false ||
          !technicianResult.technician
        ) {
          throw new Error(
            technicianResult.message ||
              "Unable to load technician details."
          );
        }

        if (
          !jobsResponse.ok ||
          jobsResult.success ===
            false
        ) {
          throw new Error(
            jobsResult.message ||
              "Unable to load technician jobs."
          );
        }

        setTechnician(
          technicianResult.technician
        );

        setJobs(
          Array.isArray(
            jobsResult.jobs
          )
            ? jobsResult.jobs
            : []
        );
      } catch (error) {
        console.error(
          "Load technician dashboard error:",
          error
        );

        setTechnicianError(
          error.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setIsLoadingTechnician(
          false
        );
      }
    };

  // ======================================================
  // REAL-TIME DATABASE REFRESH
  // ======================================================

  useEffect(() => {
    loadDashboardData();

    const refreshInterval =
      setInterval(() => {
        loadDashboardData();
      }, 5000);

    return () => {
      clearInterval(
        refreshInterval
      );
    };
  }, []);

  // ======================================================
  // LIVE CLOCK FOR ELAPSED TIME
  // ======================================================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ======================================================
  // TECHNICIAN DISPLAY DETAILS
  // ======================================================

  const technicianName =
    technician?.fullName ||
    "Technician";

  const technicianRole =
    technician
      ?.specialization
      ?.length > 0
      ? technician
          .specialization[0]
      : "Workshop Technician";

  const technicianEmail =
    technician?.email ||
    "";

  const technicianInitials =
    technicianName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (namePart) =>
          namePart
            .charAt(0)
            .toUpperCase()
      )
      .join("") || "T";

  // ======================================================
  // JOB GROUPS
  // ======================================================

  const assignedJobs =
    useMemo(
      () =>
        jobs.filter(
          (job) =>
            String(
              job.jobStatus ||
                ""
            ).toUpperCase() ===
            "ASSIGNED"
        ),
      [jobs]
    );

  const inProgressJobs =
    useMemo(
      () =>
        jobs.filter(
          (job) =>
            String(
              job.jobStatus ||
                ""
            ).toUpperCase() ===
            "IN_PROGRESS"
        ),
      [jobs]
    );

  const completedJobs =
    useMemo(
      () =>
        jobs.filter(
          (job) =>
            String(
              job.jobStatus ||
                ""
            ).toUpperCase() ===
            "COMPLETED"
        ),
      [jobs]
    );

  // ======================================================
  // TODAY'S JOBS
  // ======================================================

  const todayString =
    formatDateOnly(
      new Date()
    );

  const todayJobs =
    useMemo(() => {
      return jobs.filter(
        (job) => {
          const status =
            String(
              job.jobStatus ||
                ""
            ).toUpperCase();

          // Assigned / active jobs belong
          // to current workload.
          if (
            status ===
              "ASSIGNED" ||
            status ===
              "IN_PROGRESS"
          ) {
            return true;
          }

          if (
            status ===
              "COMPLETED" &&
            formatDateOnly(
              job.startDate
            ) === todayString
          ) {
            return true;
          }

          return false;
        }
      );
    }, [
      jobs,
      todayString,
    ]);

  const totalToday =
    todayJobs.length;

  const completedToday =
    todayJobs.filter(
      (job) =>
        String(
          job.jobStatus ||
            ""
        ).toUpperCase() ===
        "COMPLETED"
    ).length;

  const pendingToday =
    todayJobs.filter(
      (job) => {
        const status =
          String(
            job.jobStatus ||
              ""
          ).toUpperCase();

        return (
          status ===
            "ASSIGNED" ||
          status ===
            "IN_PROGRESS"
        );
      }
    ).length;

  // ======================================================
  // COMPLETION PERCENTAGE
  // ======================================================

  const percentage =
    totalToday > 0
      ? Math.round(
          (
            completedToday /
            totalToday
          ) * 100
        )
      : 0;

  const radius = 65;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (
      percentage /
      100
    ) *
      circumference;

  // ======================================================
  // AVERAGE REPAIR TIME
  // ======================================================

  const completedDurations =
    completedJobs
      .map(
        getActualJobMinutes
      )
      .filter(
        (value) =>
          value !== null &&
          value >= 0
      );

  const averageRepairMinutes =
    completedDurations.length > 0
      ? completedDurations.reduce(
          (
            sum,
            value
          ) =>
            sum + value,
          0
        ) /
        completedDurations.length
      : 0;

  const averageRepairTime =
    completedDurations.length > 0
      ? formatMinutes(
          averageRepairMinutes
        )
      : "0m";

  // ======================================================
  // EFFICIENCY CALCULATION
  // ======================================================
  // Expected vs actual duration.
  // Finished within expected time = 100%.
  // ======================================================

  const efficiencyValues =
    completedJobs
      .map((job) => {
        const expected =
          getExpectedJobMinutes(
            job
          );

        const actual =
          getActualJobMinutes(
            job
          );

        if (
          expected === null ||
          actual === null ||
          expected <= 0 ||
          actual <= 0
        ) {
          return null;
        }

        const value =
          (
            expected /
            actual
          ) * 100;

        return Math.min(
          100,
          Math.max(
            0,
            value
          )
        );
      })
      .filter(
        (value) =>
          value !== null
      );

  const efficiency =
    efficiencyValues.length >
    0
      ? Math.round(
          efficiencyValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            efficiencyValues.length
        )
      : 0;

  // ======================================================
  // CURRENT ACTIVE TASK
  // ======================================================

  const currentActiveTask =
    inProgressJobs.length > 0
      ? inProgressJobs[0]
      : null;

  // ======================================================
  // CURRENT JOB ELAPSED PROGRESS
  // ======================================================

  const currentTaskProgress =
    useMemo(() => {
      if (
        !currentActiveTask
      ) {
        return 0;
      }

      const start =
        createDateTime(
          currentActiveTask.startDate,
          currentActiveTask.startTime
        );

      if (!start) {
        return 0;
      }

      const estimated =
        currentActiveTask
          .estimatedCompletionTime
          ? new Date(
              currentActiveTask.estimatedCompletionTime
            )
          : null;

      if (
        !estimated ||
        Number.isNaN(
          estimated.getTime()
        )
      ) {
        return 0;
      }

      const total =
        estimated.getTime() -
        start.getTime();

      const elapsed =
        currentTime.getTime() -
        start.getTime();

      if (total <= 0) {
        return 100;
      }

      return Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (
              elapsed /
              total
            ) * 100
          )
        )
      );
    }, [
      currentActiveTask,
      currentTime,
    ]);

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const stats = [
    {
      label:
        "Assigned Vehicles",

      value:
        String(totalToday),

      sub:
        "Current workload",

      icon:
        ClipboardList,

      color:
        "text-blue-400",

      bg:
        "bg-blue-500/10",

      border:
        "border-blue-500/20",
    },

    {
      label:
        "Completed Tasks",

      value:
        `${completedToday} / ${totalToday}`,

      sub:
        "Daily progress",

      icon:
        CheckCircle,

      color:
        "text-emerald-400",

      bg:
        "bg-emerald-500/10",

      border:
        "border-emerald-500/20",
    },

    {
      label:
        "Efficiency Index",

      value:
        `${efficiency}%`,

      sub:
        "Performance KPI",

      icon:
        Activity,

      color:
        "text-purple-400",

      bg:
        "bg-purple-500/10",

      border:
        "border-purple-500/20",
    },

    {
      label:
        "Avg Repair Time",

      value:
        averageRepairTime,

      sub:
        "Completed vehicles",

      icon:
        Clock,

      color:
        "text-amber-400",

      bg:
        "bg-amber-500/10",

      border:
        "border-amber-500/20",
    },
  ];

  // ======================================================
  // TODAY'S QUEUE
  // Only jobs waiting to start
  // ======================================================

  const queue =
    useMemo(() => {
      return assignedJobs.map(
        (
          job,
          index
        ) => {
          const vehicleDescription =
            [
              job.vehicleType,
              job.vehicleModel,
            ]
              .filter(Boolean)
              .join(" ");

          return {
            id:
              job.jobId,

            no:
              String(
                index + 1
              ).padStart(
                2,
                "0"
              ),

            vehicle:
              vehicleDescription ||
              "Vehicle",

            vehicleNumber:
              job.vehicleNumber ||
              "N/A",

            job:
              job.jobType ||
              "General Service",

            eta:
              "Awaiting Start",

            status:
              "Assigned",
          };
        }
      );
    }, [
      assignedJobs,
    ]);

  // ======================================================
  // SEARCH QUEUE
  // ======================================================

  const filteredQueue =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return queue;
      }

      return queue.filter(
        (item) =>
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
    }, [
      searchQuery,
      queue,
    ]);

  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#0a0d14] font-mono text-slate-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-3 border-b border-slate-800 bg-[#111827]/95 px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
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

          <h1 className="text-xs font-black tracking-[0.15em] text-white sm:text-sm">
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
            <HelpCircle
              size={17}
            />
          </button>

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
                    {
                      technicianName
                    }
                  </p>

                  <p className="max-w-[150px] truncate text-[9px] uppercase text-slate-500">
                    {
                      technicianRole
                    }
                  </p>
                </>
              )}
            </div>

            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={
                  avatarImage
                }
                alt={`${technicianName} profile`}
                className="h-full w-full object-cover"
                onError={(
                  event
                ) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <div className="absolute inset-0 -z-10 flex items-center justify-center text-xs font-black text-indigo-300">
                {
                  technicianInitials
                }
              </div>
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
            aria-label="Search dashboard queue"
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:px-6 md:py-8">
        {/* ERROR */}

        {technicianError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-red-300">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {
                  technicianError
                }
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadDashboardData
              }
              disabled={
                isLoadingTechnician
              }
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

        {/* WELCOME */}

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
              You have{" "}
              <span className="font-bold text-indigo-300">
                {
                  pendingToday
                }
              </span>{" "}
              active or pending{" "}
              {pendingToday === 1
                ? "task"
                : "tasks"}{" "}
              in your current workload.
            </p>

            {technicianEmail && (
              <p className="mt-2 text-xs text-slate-600">
                Signed in as{" "}
                {
                  technicianEmail
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "technician-intake"
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={16} />

            Vehicle Intake
          </button>
        </div>

        {/* STATISTICS */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(
            (
              card,
              index
            ) => {
              const Icon =
                card.icon;

              return (
                <div
                  key={
                    index
                  }
                  className={`relative overflow-hidden rounded-2xl border bg-[#10121b] p-5 ${card.border}`}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">
                        {
                          card.label
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        {
                          card.sub
                        }
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
                    >
                      <Icon
                        size={
                          18
                        }
                        className={
                          card.color
                        }
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-white">
                    {
                      card.value
                    }
                  </h2>
                </div>
              );
            }
          )}
        </div>

        {/* WORKFLOW + CURRENT TASK */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* DAILY WORKFLOW */}

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
                    r={
                      radius
                    }
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r={
                      radius
                    }
                    stroke="#6366f1"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={
                      circumference
                    }
                    strokeDashoffset={
                      offset
                    }
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="z-10 text-center">
                  <h2 className="text-4xl font-black text-white">
                    {
                      percentage
                    }
                    %
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
                    {
                      pendingToday
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Completed
                  </p>

                  <p className="text-2xl font-black text-emerald-400">
                    {
                      completedToday
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Avg Time
                  </p>

                  <p className="text-2xl font-black text-amber-400">
                    {
                      averageRepairTime
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <p className="text-[10px] uppercase text-slate-500">
                    Efficiency
                  </p>

                  <p className="text-2xl font-black text-purple-400">
                    {
                      efficiency
                    }
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CURRENT ACTIVE TASK */}

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

              <span
                className={`rounded border px-2 py-1 text-[9px] ${
                  currentActiveTask
                    ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                    : "border-slate-700 bg-slate-800 text-slate-500"
                }`}
              >
                {currentActiveTask
                  ? "IN_PROGRESS"
                  : "NO ACTIVE JOB"}
              </span>
            </div>

            {currentActiveTask ? (
              <>
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                    <Car
                      size={
                        24
                      }
                      className="text-indigo-400"
                    />
                  </div>

                  <div>
                    <p className="text-xl font-black text-white">
                      {currentActiveTask.vehicleNumber ||
                        "N/A"}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {[
                        currentActiveTask.vehicleType,
                        currentActiveTask.vehicleModel,
                        currentActiveTask.jobType,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " - "
                        )}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
                  <div className="mb-2 flex justify-between text-[11px]">
                    <span className="text-slate-500">
                      Elapsed Time
                    </span>

                    <span className="font-bold text-white">
                      {formatElapsedTime(
                        currentActiveTask.startDate,
                        currentActiveTask.startTime
                      )}
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-400 transition-all duration-1000"
                      style={{
                        width: `${currentTaskProgress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[9px] text-slate-600">
                    <span>
                      Progress
                    </span>

                    <span>
                      {
                        currentTaskProgress
                      }
                      %
                    </span>
                  </div>
                </div>

                {currentActiveTask.timeExtended ? (
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle
                      size={
                        14
                      }
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="font-bold">
                        Time Extended +
                        {formatMinutes(
                          currentActiveTask.totalExtensionMinutes
                        )}
                      </p>

                      {currentActiveTask.latestExtensionReason && (
                        <p className="mt-1 text-[10px] text-slate-500">
                          {
                            currentActiveTask.latestExtensionReason
                          }
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <Activity
                      size={
                        14
                      }
                    />

                    Repair currently in progress
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#0a0d14] p-6 text-center">
                <Car
                  size={
                    32
                  }
                  className="mb-3 text-slate-700"
                />

                <p className="text-sm font-bold text-slate-400">
                  No active repair
                </p>

                <p className="mt-2 text-[10px] leading-5 text-slate-600">
                  An active vehicle will appear here after you start an assigned job.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* TODAY'S QUEUE */}

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

            <span className="text-[10px] text-indigo-400">
              {
                assignedJobs.length
              }{" "}
              Waiting
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
                    Status
                  </th>

                  <th className="pb-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.length >
                0 ? (
                  filteredQueue.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="py-4">
                          <span className="rounded bg-slate-900 px-2 py-1">
                            {
                              item.no
                            }
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="rounded bg-slate-900 px-2 py-1 font-bold tracking-wider text-indigo-300">
                            {
                              item.vehicleNumber
                            }
                          </span>
                        </td>

                        <td className="py-4 font-bold text-white">
                          {
                            item.vehicle
                          }
                        </td>

                        <td className="py-4">
                          {
                            item.job
                          }
                        </td>

                        <td className="py-4">
                          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-400">
                            {
                              item.status
                            }
                          </span>
                        </td>

                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate?.(
                                "technician-intake"
                              )
                            }
                            aria-label="Open assigned vehicle"
                          >
                            <ChevronRight
                              size={
                                16
                              }
                              className="inline cursor-pointer text-slate-600 transition hover:text-white"
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
                      className="py-10 text-center text-xs italic text-slate-500"
                    >
                      {searchQuery
                        ? `No dashboard records found for "${searchQuery}".`
                        : "No assigned vehicles are waiting to start."}
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