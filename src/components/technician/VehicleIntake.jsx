import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Bell,
  HelpCircle,
  LogIn,
  Car,
  Clock3,
  ListChecks,
  Activity,
  ChevronDown,
  Menu,
} from "lucide-react";

import avatarImage from "../../assets/profile.png";
import garageImage from "../../assets/garage-car.jpeg";
import TechnicianNotifications from "./TechnicianNotifications";

export default function VehicleIntake({
  toggleSidebar,
  onNavigate,
}) {
  const [technician, setTechnician] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [vehiclePlate, setVehiclePlate] =
    useState("");

  const [assignedJob, setAssignedJob] =
    useState(null);

  const [assignedJobs, setAssignedJobs] =
    useState([]);

  const [jobsLoading, setJobsLoading] =
    useState(true);

  const [jobsError, setJobsError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [completingJobId, setCompletingJobId] =
    useState(null);

  const [popup, setPopup] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "CANCEL",
    onConfirm: null,
  });

  const [estimatedDays, setEstimatedDays] =
    useState("");

  const [estimatedTime, setEstimatedTime] =
    useState("");

  const dayOptions = [1, 2, 3, 4];

  const timeOptions = Array.from(
    { length: 95 },
    (_, index) => {
      const totalMinutes =
        (index + 1) * 15;

      const hours = Math.floor(
        totalMinutes / 60
      );

      const minutes =
        totalMinutes % 60;

      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }
  );

  // ======================================================
  // ACTIVE QUEUE
  // Loaded from IN_PROGRESS service jobs
  // ======================================================

  const [queue, setQueue] = useState([]);

  // ======================================================
  // FORMAT DURATION
  // ======================================================

  const formatDuration = (
    days,
    time
  ) => {
    if (days) {
      const numericDays =
        Number(days);

      return `${numericDays} ${
        numericDays === 1
          ? "day"
          : "days"
      }`;
    }

    if (time) {
      const [hours, minutes] =
        time
          .split(":")
          .map(Number);

      const parts = [];

      if (hours > 0) {
        parts.push(
          `${hours} ${
            hours === 1
              ? "hr"
              : "hrs"
          }`
        );
      }

      if (minutes > 0) {
        parts.push(
          `${minutes} min`
        );
      }

      return parts.join(" ");
    }

    return "Not selected";
  };

  // ======================================================
  // FORMAT ESTIMATED COMPLETION
  // ======================================================

  const formatEstimatedCompletion = (
    value
  ) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // FORMAT TIME EXTENSION
  // ======================================================

  const formatExtensionTime = (
    totalMinutes
  ) => {
    const minutesValue =
      Number(totalMinutes) || 0;

    if (minutesValue <= 0) {
      return "";
    }

    const hours =
      Math.floor(
        minutesValue / 60
      );

    const minutes =
      minutesValue % 60;

    const parts = [];

    if (hours > 0) {
      parts.push(
        `${hours} ${
          hours === 1
            ? "hr"
            : "hrs"
        }`
      );
    }

    if (minutes > 0) {
      parts.push(
        `${minutes} min`
      );
    }

    return parts.join(" ");
  };

  // ======================================================
  // LOAD LOGGED-IN TECHNICIAN DETAILS
  // ======================================================

  const loadTechnicianDetails = async () => {
    try {
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
          staffUser?.role || ""
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
          `http://localhost:5000/api/technicians/${technicianId}`
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.success === false ||
        !result.technician
      ) {
        throw new Error(
          result.message ||
            "Unable to load technician details."
        );
      }

      setTechnician(
        result.technician
      );
    } catch (error) {
      console.error(
        "Load technician details error:",
        error
      );

      setTechnician(null);
    }
  };

  const technicianName =
    technician?.fullName ||
    "Technician";

  const technicianRole =
    Array.isArray(
      technician?.specialization
    ) &&
    technician.specialization.length > 0
      ? technician.specialization[0]
      : technician?.specialization ||
        "Workshop Staff";

  // ======================================================
  // LOAD ASSIGNED JOBS
  // ======================================================

  const loadAssignedJobs =
    async () => {
      try {
        setJobsLoading(true);
        setJobsError("");

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
            staffUser?.role || ""
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
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load assigned jobs."
          );
        }

        const jobs =
          Array.isArray(
            result.jobs
          )
            ? result.jobs
            : [];

        setAssignedJobs(
          jobs
        );

        // ==================================================
        // LOAD IN-PROGRESS JOBS TO ACTIVE QUEUE
        // ==================================================

        const activeJobs = jobs
          .filter(
            (job) =>
              String(
                job.jobStatus || ""
              ).toUpperCase() ===
              "IN_PROGRESS"
          )
          .map((job) => ({
            jobId:
              job.jobId,

            plate:
              job.vehicleNumber ||
              "N/A",

            duration:
              formatEstimatedCompletion(
                job.estimatedCompletionTime
              ),

            originalEstimatedCompletion:
              formatEstimatedCompletion(
                job.originalEstimatedCompletionTime
              ),

            time:
              job.startTime ||
              "N/A",

            status:
              "IN_PROGRESS",

            timeExtended:
              Boolean(
                job.timeExtended
              ),

            totalExtensionMinutes:
              Number(
                job.totalExtensionMinutes
              ) || 0,

            extensionText:
              formatExtensionTime(
                job.totalExtensionMinutes
              ),

            extensionReason:
              job.latestExtensionReason ||
              "",

            extensionDateTime:
              job.latestExtensionDateTime ||
              null,
          }));

        setQueue(activeJobs);

        // ==================================================
        // FIND NEXT ASSIGNED JOB
        // ==================================================

        const firstAssignedJob =
          jobs.find(
            (job) =>
              String(
                job.jobStatus ||
                  ""
              ).toUpperCase() ===
              "ASSIGNED"
          ) || null;

        setAssignedJob(
          firstAssignedJob
        );

        setVehiclePlate(
          firstAssignedJob
            ?.vehicleNumber || ""
        );
      } catch (error) {
        console.error(
          "Load assigned jobs error:",
          error
        );

        setAssignedJobs([]);
        setAssignedJob(null);
        setVehiclePlate("");
        setQueue([]);

        setJobsError(
          error.message ||
            "Unable to load assigned jobs."
        );
      } finally {
        setJobsLoading(false);
      }
    };

  // ======================================================
  // LOAD JOBS WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    loadTechnicianDetails();
    loadAssignedJobs();

    const refreshInterval =
      setInterval(() => {
        loadTechnicianDetails();
        loadAssignedJobs();
      }, 5000);

    return () => {
      clearInterval(
        refreshInterval
      );
    };
  }, []);

  // ======================================================
  // SEARCH ACTIVE QUEUE
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
        (vehicle) =>
          [
            vehicle.plate,
            vehicle.duration,
            vehicle.time,
            vehicle.status,
            vehicle.extensionText,
            vehicle.extensionReason,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      queue,
      searchQuery,
    ]);

  // ======================================================
  // CUSTOM SCREEN POPUP
  // ======================================================

  const showMessage = (
    title,
    message,
    type = "info"
  ) => {
    setPopup({
      show: true,
      type,
      title,
      message,
      confirmText: "OK",
      cancelText: "CANCEL",
      onConfirm: null,
    });
  };

  const closePopup = () => {
    setPopup((previous) => ({
      ...previous,
      show: false,
      onConfirm: null,
    }));
  };

  const showConfirm = (
    title,
    message,
    onConfirm,
    confirmText = "CONFIRM"
  ) => {
    setPopup({
      show: true,
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText: "CANCEL",
      onConfirm,
    });
  };

  // ======================================================
  // ADD TO ACTIVE WORKLOAD
  // ======================================================

  const addToWorkload =
    async () => {
      if (!assignedJob) {
        showMessage(
          "NO ASSIGNED JOB",
          "No assigned service job was found.",
          "error"
        );
        return;
      }

      if (
        !vehiclePlate.trim()
      ) {
        showMessage(
          "VEHICLE NOT FOUND",
          "Assigned vehicle number could not be identified.",
          "error"
        );
        return;
      }

      if (
        !estimatedDays &&
        !estimatedTime
      ) {
        showMessage(
          "SELECT REPAIR DURATION",
          "Please select either Days or Time.",
          "error"
        );
        return;
      }

      if (
        estimatedDays &&
        estimatedTime
      ) {
        showMessage(
          "INVALID DURATION",
          "Please select only one option: Days or Time.",
          "error"
        );
        return;
      }

      try {
        setActionLoading(true);

        const response =
          await fetch(
            `http://localhost:5000/api/service-jobs/${assignedJob.jobId}/start`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  estimatedDays:
                    estimatedDays ||
                    null,

                  estimatedTime:
                    estimatedTime ||
                    null,
                }),
            }
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
              "Unable to add job to active workload."
          );
        }

        showMessage(
          "WORKLOAD STARTED",
          "Vehicle added to active workload successfully.",
          "success"
        );

        setEstimatedDays("");
        setEstimatedTime("");

        await loadAssignedJobs();
      } catch (error) {
        console.error(
          "Add to active workload error:",
          error
        );

        showMessage(
          "UNABLE TO START JOB",
          error.message ||
            "Unable to add job to active workload.",
          "error"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ======================================================
  // COMPLETE SERVICE JOB
  // ======================================================

  const completeJobRequest = async (jobId) => {
    const numericJobId = Number(jobId);

    if (
      !Number.isInteger(numericJobId) ||
      numericJobId <= 0
    ) {
      showMessage(
        "INVALID JOB",
        "A valid job ID is required.",
        "error"
      );
      return;
    }

    try {
      setCompletingJobId(numericJobId);

      const response = await fetch(
        `http://localhost:5000/api/service-jobs/${numericJobId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to complete service job."
        );
      }

      closePopup();
      await loadAssignedJobs();

      showMessage(
        "JOB COMPLETED",
        "Service job completed successfully. The technician is now available for a new job.",
        "success"
      );
    } catch (error) {
      console.error(
        "Complete service job error:",
        error
      );

      closePopup();

      showMessage(
        "COMPLETION FAILED",
        error.message ||
          "Unable to complete service job.",
        "error"
      );
    } finally {
      setCompletingJobId(null);
    }
  };

  const completeJob = (jobId) => {
    const numericJobId = Number(jobId);

    if (
      !Number.isInteger(numericJobId) ||
      numericJobId <= 0
    ) {
      showMessage(
        "INVALID JOB",
        "A valid job ID is required.",
        "error"
      );
      return;
    }

    showConfirm(
      "COMPLETE SERVICE JOB?",
      "Are you sure you want to mark this repair job as completed?",
      () => completeJobRequest(numericJobId),
      "COMPLETE JOB"
    );
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle = (
    status
  ) => {
    if (
      status ===
        "IN-PROGRESS" ||
      status ===
        "IN_PROGRESS"
    ) {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (
      status === "QUEUED"
    ) {
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }

    if (
      status === "STALLED"
    ) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-slate-600 bg-slate-700/20 text-slate-400";
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0d14] font-mono text-slate-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 backdrop-blur-xl sm:px-6">
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
              <p className="max-w-[160px] truncate text-[10px] font-bold text-white">
                {technicianName}
              </p>

              <p className="max-w-[160px] truncate text-[9px] uppercase text-slate-500">
                {technicianRole}
              </p>
            </div>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={
                  avatarImage
                }
                alt={`${technicianName} profile`}
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
        <div className="mb-5">
          <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
            Intake Terminal
          </h1>

          <p className="mt-1 text-[10px] text-slate-400 md:text-xs">
            View assigned vehicles and start repair workload.
          </p>
        </div>

        {/* ERROR */}
        {jobsError && (
          <div className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {jobsError}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          {/* VEHICLE INTAKE */}
          <div className="rounded-md border border-slate-700 bg-[#172036] p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn
                  size={17}
                  className="text-indigo-300"
                />

                <h2 className="text-sm font-bold text-slate-100 md:text-base">
                  Vehicle Intake
                </h2>
              </div>

              <span className="rounded-sm border border-slate-600 bg-slate-700/60 px-2 py-1 text-[8px] text-slate-300">
                {assignedJob
                  ? `JOB-${assignedJob.jobId}`
                  : "NO JOB"}
              </span>
            </div>

            {/* VEHICLE NUMBER */}
            <div className="mb-4">
              <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Vehicle License Plate
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={
                    vehiclePlate
                  }
                  readOnly
                  placeholder={
                    jobsLoading
                      ? "Loading assigned vehicle..."
                      : "No assigned vehicle"
                  }
                  className="w-full cursor-default rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs uppercase tracking-[0.18em] text-slate-300 outline-none"
                />

                <Car
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>

              {assignedJob && (
                <p className="mt-2 text-[9px] text-indigo-300">
                  Assigned Ticket:{" "}
                  {assignedJob.ticketNumber ||
                    `Request ${assignedJob.requestId}`}
                </p>
              )}
            </div>

            {/* ESTIMATED DURATION */}
            <div className="mb-8">
              <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Repair Duration
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* DAYS */}
                <div>
                  <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Days
                  </label>

                  <div className="relative">
                    <select
                      value={
                        estimatedDays
                      }
                      disabled={
                        !assignedJob ||
                        actionLoading
                      }
                      onChange={(
                        event
                      ) => {
                        setEstimatedDays(
                          event.target
                            .value
                        );

                        setEstimatedTime(
                          ""
                        );
                      }}
                      className="w-full appearance-none rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs text-slate-300 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        Select Days
                      </option>

                      {dayOptions.map(
                        (day) => (
                          <option
                            key={day}
                            value={day}
                          >
                            {day}{" "}
                            {day === 1
                              ? "Day"
                              : "Days"}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </div>

                {/* TIME */}
                <div>
                  <label className="mb-2 block text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </label>

                  <div className="relative">
                    <select
                      value={
                        estimatedTime
                      }
                      disabled={
                        !assignedJob ||
                        actionLoading
                      }
                      onChange={(
                        event
                      ) => {
                        setEstimatedTime(
                          event.target
                            .value
                        );

                        setEstimatedDays(
                          ""
                        );
                      }}
                      className="w-full appearance-none rounded-sm border border-slate-700 bg-[#0d1529] px-4 py-3 pr-10 text-xs text-slate-300 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        Select Time
                      </option>

                      {timeOptions.map(
                        (time) => (
                          <option
                            key={time}
                            value={time}
                          >
                            {time}
                          </option>
                        )
                      )}
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
                  Selected:{" "}
                  {formatDuration(
                    estimatedDays,
                    estimatedTime
                  )}
                </span>
              </p>
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={
                addToWorkload
              }
              disabled={
                !assignedJob ||
                jobsLoading ||
                actionLoading
              }
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-indigo-600 py-3 text-[10px] font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Activity
                size={13}
              />

              {actionLoading
                ? "Adding to Workload..."
                : jobsLoading
                ? "Loading..."
                : "Add to Active Workload"}
            </button>
          </div>

          {/* GARAGE IMAGE */}
          <div className="relative min-h-[250px] overflow-hidden rounded-md border border-slate-700 bg-[#172036] shadow-xl">
            <img
              src={
                garageImage
              }
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
                  Maintenance Workload
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

        {/* ACTIVE QUEUE */}
        <div className="rounded-md border border-slate-800 bg-[#172036] p-4 shadow-xl md:p-5">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ListChecks
                size={18}
                className="text-emerald-400"
              />

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
                  <th className="pb-4 pl-2">
                    Plate
                  </th>

                  <th className="pb-4">
                    Estimated Completion
                  </th>

                  <th className="pb-4">
                    Time In
                  </th>

                  <th className="pb-4">
                    Time Extension
                  </th>

                  <th className="pb-4">
                    Status
                  </th>

                  <th className="pb-4 pr-2 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.length >
                0 ? (
                  filteredQueue.map(
                    (
                      vehicle,
                      index
                    ) => (
                      <tr
                        key={`${vehicle.plate}-${index}`}
                        className="border-t border-slate-800/30 text-[10px] text-slate-300 transition hover:bg-slate-800/20"
                      >
                        <td className="py-4 pl-2">
                          <span className="font-black tracking-[0.18em] text-indigo-200">
                            {
                              vehicle.plate
                            }
                          </span>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Clock3
                              size={11}
                              className="text-slate-600"
                            />

                            {
                              vehicle.duration
                            }
                          </div>
                        </td>

                        <td className="py-4 text-slate-400">
                          {
                            vehicle.time
                          }
                        </td>

                        <td className="py-4">
                          {vehicle.timeExtended ? (
                            <div className="max-w-[220px]">
                              <p className="font-bold text-amber-300">
                                +{vehicle.extensionText}
                              </p>

                              {vehicle.extensionReason && (
                                <p className="mt-1 text-[8px] leading-relaxed text-slate-500">
                                  {vehicle.extensionReason}
                                </p>
                              )}

                              <p className="mt-1 text-[8px] text-slate-600">
                                Time extended by Assistance
                              </p>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-600">
                              No extension
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-flex min-w-[72px] items-center justify-center rounded-full border px-2 py-1 text-[6px] font-bold ${getStatusStyle(
                              vehicle.status
                            )}`}
                          >
                            {
                              vehicle.status
                            }
                          </span>
                        </td>

                        <td className="py-4 pr-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              completeJob(
                                vehicle.jobId
                              )
                            }
                            disabled={
                              completingJobId ===
                              vehicle.jobId
                            }
                            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {completingJobId ===
                            vehicle.jobId
                              ? "Completing..."
                              : "Complete Job"}
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
                        ? `No vehicles found for "${searchQuery}".`
                        : "No active workload yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CUSTOM SCREEN POPUP */}
      {popup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[460px] rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-2xl md:p-8">
            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border ${
                popup.type === "success"
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : popup.type === "error"
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : popup.type === "confirm"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
              }`}
            >
              <span className="text-2xl font-black">
                {popup.type === "success"
                  ? "✓"
                  : popup.type === "error"
                  ? "!"
                  : popup.type === "confirm"
                  ? "?"
                  : "i"}
              </span>
            </div>

            <h2
              className={`text-center text-xl font-black tracking-[0.08em] ${
                popup.type === "success"
                  ? "text-emerald-400"
                  : popup.type === "error"
                  ? "text-red-400"
                  : popup.type === "confirm"
                  ? "text-amber-300"
                  : "text-white"
              }`}
            >
              {popup.title}
            </h2>

            <p className="mt-4 text-center text-sm leading-6 text-slate-300">
              {popup.message}
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              {popup.type === "confirm" && (
                <button
                  type="button"
                  onClick={closePopup}
                  disabled={completingJobId !== null}
                  className="min-w-[130px] rounded-lg border border-slate-600 px-5 py-3 text-xs font-bold tracking-wider text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {popup.cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (
                    popup.type === "confirm" &&
                    typeof popup.onConfirm === "function"
                  ) {
                    popup.onConfirm();
                    return;
                  }

                  closePopup();
                }}
                disabled={
                  popup.type === "confirm" &&
                  completingJobId !== null
                }
                className={`min-w-[130px] rounded-lg px-5 py-3 text-xs font-black tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  popup.type === "error"
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : popup.type === "confirm"
                    ? "bg-emerald-500 text-[#07110d] hover:bg-emerald-400"
                    : popup.type === "success"
                    ? "bg-emerald-500 text-[#07110d] hover:bg-emerald-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {popup.type === "confirm" &&
                completingJobId !== null
                  ? "COMPLETING..."
                  : popup.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}