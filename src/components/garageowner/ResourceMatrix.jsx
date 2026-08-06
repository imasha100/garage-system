import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  Bell,
  Menu,
  CircleDot,
  Gauge,
  RefreshCw,
  Car,
  Clock,
  AlertTriangle,
} from "lucide-react";

const API_BASE =
  "http://localhost:5000";

export default function ResourceMatrix({
  toggleSidebar,
}) {
  // ======================================================
  // STATES
  // ======================================================

  const [searchText, setSearchText] =
    useState("");

  const [technicians, setTechnicians] =
    useState([]);

  const [liveJobs, setLiveJobs] =
    useState([]);

  const [ownerData, setOwnerData] =
    useState(null);

  const [garageId, setGarageId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const technicianScrollRef =
    useRef(null);

  // ======================================================
  // GET STAFF USER
  // ======================================================

  const getLoggedInStaffUser = () => {
    try {
      const stored =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error(
        "Unable to read staffUser:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // FIND GARAGE ID
  // ======================================================

  const resolveGarageId = (
    staffUser,
    ownerResult
  ) => {
    const possibleValues = [
      ownerResult?.data?.garage
        ?.garageId,

      ownerResult?.data?.garage
        ?.garage_id,

      ownerResult?.data
        ?.garageId,

      ownerResult?.data
        ?.garage_id,

      ownerResult?.data?.owner
        ?.garageId,

      ownerResult?.data?.owner
        ?.garage_id,

      staffUser?.garageId,

      staffUser?.garage_id,

      staffUser
        ?.garageGarageId,

      staffUser
        ?.garage_garage_id,
    ];

    for (const value of possibleValues) {
      const numericValue =
        Number(value);

      if (
        Number.isInteger(
          numericValue
        ) &&
        numericValue > 0
      ) {
        return numericValue;
      }
    }

    return null;
  };

  // ======================================================
  // NORMALIZE SPECIALIZATION
  // ======================================================

  const normalizeSpecialization = (
    value
  ) => {
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          String(item).trim()
        )
        .filter(Boolean)
        .join(", ");
    }

    if (!value) {
      return "No specialization";
    }

    if (
      typeof value === "string"
    ) {
      const text =
        value.trim();

      if (!text) {
        return "No specialization";
      }

      try {
        const parsed =
          JSON.parse(text);

        if (
          Array.isArray(parsed)
        ) {
          return parsed
            .map((item) =>
              String(item).trim()
            )
            .filter(Boolean)
            .join(", ");
        }
      } catch {
        // Normal string
      }

      return text
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
        .join(", ");
    }

    return String(value);
  };

  // ======================================================
  // FORMAT DATE TIME
  // ======================================================

  const formatDateTime = (
    value
  ) => {
    if (!value) {
      return "Not Set";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleString(
      [],
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ======================================================
  // LOAD OWNER
  // ======================================================

  const loadOwnerProfile =
    async () => {
      const staffUser =
        getLoggedInStaffUser();

      if (!staffUser) {
        throw new Error(
          "Logged-in garage owner details were not found."
        );
      }

      const loginId =
        Number(
          staffUser.loginId ??
            staffUser.login_id
        );

      if (
        !Number.isInteger(
          loginId
        ) ||
        loginId <= 0
      ) {
        throw new Error(
          "A valid garage owner login ID was not found."
        );
      }

      const response =
        await fetch(
          `${API_BASE}/api/owners/profile/${loginId}`
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to load garage owner profile."
        );
      }

      return {
        staffUser,
        ownerResult:
          result,
      };
    };

  // ======================================================
  // LOAD RESOURCE MATRIX
  // ======================================================

  const loadResourceMatrix =
    async (
      initialLoad = false
    ) => {
      try {
        if (initialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setLoadError("");

        // ================================================
        // OWNER + GARAGE
        // ================================================

        const {
          staffUser,
          ownerResult,
        } =
          await loadOwnerProfile();

        const loadedOwnerData =
          ownerResult?.data ||
          null;

        setOwnerData(
          loadedOwnerData
        );

        const numericGarageId =
          resolveGarageId(
            staffUser,
            ownerResult
          );

        if (
          !numericGarageId
        ) {
          throw new Error(
            "Garage ID could not be identified for the logged-in owner."
          );
        }

        setGarageId(
          numericGarageId
        );

        // ================================================
        // TECHNICIANS
        // ================================================

        const technicianResponse =
          await fetch(
            `${API_BASE}/api/technicians?garageId=${numericGarageId}`
          );

        const technicianResult =
          await technicianResponse.json();

        if (
          !technicianResponse.ok ||
          technicianResult.success ===
            false
        ) {
          throw new Error(
            technicianResult.message ||
              "Unable to load technicians."
          );
        }

        const receivedTechnicians =
          Array.isArray(
            technicianResult
          )
            ? technicianResult
            : Array.isArray(
                technicianResult
                  ?.technicians
              )
            ? technicianResult
                .technicians
            : Array.isArray(
                technicianResult
                  ?.data
              )
            ? technicianResult.data
            : [];

        setTechnicians(
          receivedTechnicians
        );

        // ================================================
        // LIVE JOBS
        // ================================================

        const dashboardResponse =
          await fetch(
            `${API_BASE}/api/service-jobs/garage/${numericGarageId}/live-dashboard`
          );

        const dashboardResult =
          await dashboardResponse.json();

        if (
          !dashboardResponse.ok ||
          dashboardResult.success ===
            false
        ) {
          throw new Error(
            dashboardResult.message ||
              "Unable to load live workshop jobs."
          );
        }

        const jobs =
          Array.isArray(
            dashboardResult
              ?.vehicles
          )
            ? dashboardResult
                .vehicles
            : [];

        setLiveJobs(jobs);
      } catch (error) {
        console.error(
          "Resource Matrix error:",
          error
        );

        setLoadError(
          error.message ||
            "Unable to load Resource Matrix."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  // ======================================================
  // INITIAL + REAL-TIME REFRESH
  // ======================================================

  useEffect(() => {
    loadResourceMatrix(true);

    const interval =
      setInterval(() => {
        loadResourceMatrix(
          false
        );
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ======================================================
  // ACTIVE JOB FINDER
  // ======================================================

  const getActiveJobForTechnician = (
    technicianId
  ) => {
    return liveJobs.find(
      (job) => {
        const jobTechnicianId =
          Number(
            job.technicianId ??
              job.technician_id ??
              job.technician_technician_id
          );

        const status =
          String(
            job.jobStatus ??
              job.job_status ??
              ""
          )
            .trim()
            .toUpperCase();

        return (
          jobTechnicianId ===
            Number(
              technicianId
            ) &&
          [
            "ASSIGNED",
            "IN_PROGRESS",
          ].includes(status)
        );
      }
    );
  };

  // ======================================================
  // FORMAT TECHNICIANS
  // ======================================================

  const formattedTechnicians =
    useMemo(() => {
      return technicians.map(
        (tech, index) => {
          const technicianId =
            tech.technicianId ??
            tech.technician_id ??
            tech.id ??
            index + 1;

          const activeJob =
            getActiveJobForTechnician(
              technicianId
            );

          const shiftStatus =
            String(
              tech.shiftStatus ??
                tech.shift_status ??
                "OFF"
            )
              .trim()
              .toUpperCase();

          const availability =
            String(
              tech.availabilityStatus ??
                tech.availability_status ??
                "AVAILABLE"
            )
              .trim()
              .toUpperCase();

          let status =
            "OFF SHIFT";

          if (
            shiftStatus === "ON"
          ) {
            if (
              activeJob ||
              availability ===
                "BUSY"
            ) {
              status =
                "BUSY";
            } else {
              status =
                "FREE";
            }
          }

          const experience =
            tech.experience ??
            tech.experienceYears ??
            tech.experience_years;

          const extensionMinutes =
            Number(
              activeJob
                ?.totalExtensionMinutes ??
                activeJob
                  ?.total_extension_minutes
            ) || 0;

          return {
            id:
              technicianId,

            name:
              tech.fullName ??
              tech.full_name ??
              tech.name ??
              "Unnamed Technician",

            specialization:
              normalizeSpecialization(
                tech.specialization
              ),

            experience:
              experience !==
                undefined &&
              experience !==
                null &&
              experience !== ""
                ? `${experience} Years`
                : "Not Provided",

            shiftStatus,

            availability,

            status,

            activeJob,

            vehicle:
              activeJob
                ?.vehicleNumber ??
              activeJob
                ?.vehicle_number ??
              "— None —",

            jobStatus:
              activeJob
                ?.displayStatus ??
              activeJob
                ?.jobStatus ??
              activeJob
                ?.job_status ??
              "NO ACTIVE JOB",

            jobType:
              activeJob
                ?.jobType ??
              activeJob
                ?.job_type ??
              "—",

            expectedCompletion:
              activeJob
                ?.estimatedCompletionTime ??
              activeJob
                ?.estimated_completion_time
                ? formatDateTime(
                    activeJob
                      ?.estimatedCompletionTime ??
                      activeJob
                        ?.estimated_completion_time
                  )
                : "—",

            extensionMinutes,

            extensionReason:
              activeJob
                ?.latestExtensionReason ??
              activeJob
                ?.latest_extension_reason ??
              "",
          };
        }
      );
    }, [
      technicians,
      liveJobs,
    ]);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredTechnicians =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return formattedTechnicians;
      }

      return formattedTechnicians.filter(
        (tech) =>
          `
            ${tech.id}
            ${tech.name}
            ${tech.specialization}
            ${tech.status}
            ${tech.shiftStatus}
            ${tech.vehicle}
            ${tech.jobStatus}
          `
            .toLowerCase()
            .includes(query)
      );
    }, [
      formattedTechnicians,
      searchText,
    ]);

  // ======================================================
  // COUNTS
  // ======================================================

  const registeredTechnicianCount =
    formattedTechnicians.length;

  const freeTechnicianCount =
    formattedTechnicians.filter(
      (tech) =>
        tech.status === "FREE"
    ).length;

  const busyTechnicianCount =
    formattedTechnicians.filter(
      (tech) =>
        tech.status === "BUSY"
    ).length;

  const offShiftTechnicianCount =
    formattedTechnicians.filter(
      (tech) =>
        tech.status ===
        "OFF SHIFT"
    ).length;

  // ======================================================
  // REAL-TIME EXTENSION DATA
  // ======================================================

  const extensionVehicles =
    useMemo(() => {
      return liveJobs
        .filter((job) => {
          const minutes =
            Number(
              job.totalExtensionMinutes ??
                job.total_extension_minutes
            ) || 0;

          return (
            job.timeExtended ===
              true ||
            minutes > 0
          );
        })
        .map((job) => {
          const minutes =
            Number(
              job.totalExtensionMinutes ??
                job.total_extension_minutes
            ) || 0;

          return {
            id:
              job.jobId ??
              job.job_id,

            vehicle:
              job.vehicleNumber ??
              job.vehicle_number ??
              "N/A",

            technician:
              job.technicianName ??
              job.technician_name ??
              "Not Assigned",

            minutes,

            reason:
              job.latestExtensionReason ??
              job.latest_extension_reason ??
              "No extension reason provided.",

            completion:
              formatDateTime(
                job.estimatedCompletionTime ??
                  job.estimated_completion_time
              ),
          };
        });
    }, [liveJobs]);

  // ======================================================
  // OWNER DISPLAY
  // ======================================================

  const ownerName =
    ownerData?.owner
      ?.fullName ??
    ownerData?.owner
      ?.full_name ??
    "Garage Owner";

  const garageName =
    ownerData?.garage
      ?.garageName ??
    ownerData?.garage
      ?.garage_name ??
    "Garage";

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner
      ?.profilePhoto ??
    ownerData?.owner
      ?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(
          profilePhotoPath
        ).startsWith(
          "http"
        )
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  // ======================================================
  // SCROLL
  // ======================================================

  const handleTechnicianWheel = (
    event
  ) => {
    const element =
      technicianScrollRef.current;

    if (!element) {
      return;
    }

    if (
      Math.abs(event.deltaY) >
      Math.abs(event.deltaX)
    ) {
      element.scrollBy({
        left: event.deltaY,
        behavior: "smooth",
      });
    }
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle = (
    status
  ) => {
    if (status === "FREE") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }

    if (status === "BUSY") {
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    }

    return "bg-slate-500/10 text-slate-400 border-slate-500/30";
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">

        <div className="flex items-center gap-3 w-full md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">

            <Search
              size={15}
              className="text-gray-500"
            />

            <input
              type="text"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search technicians..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText(
                    ""
                  )
                }
                className="text-xs text-gray-500 hover:text-white"
              >
                CLEAR
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            DYNAMIC OWNER HEADER
        ================================================== */}

        <div className="flex items-center gap-5">

          <Bell
            size={18}
            className="text-gray-300"
          />

          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">

            <p className="text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="text-[10px] text-indigo-400 uppercase max-w-[240px] truncate">
              {garageName}
            </p>

          </div>

          <div className="w-9 h-9 rounded-xl border border-cyan-400 flex items-center justify-center text-xs overflow-hidden bg-[#0b0b12]">

            {ownerProfilePhoto ? (
              <img
                src={
                  ownerProfilePhoto
                }
                alt={`${ownerName} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              ownerInitials
            )}

          </div>

        </div>

      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-4 md:p-8">

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-10">

          <div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              RESOURCE & LABOR MATRIX
            </h1>

            <p className="text-gray-400">
              Real-time personnel optimization,
              allocation controls, and active
              workshop queues.
            </p>

            <p className="mt-2 text-[10px] text-gray-600 font-mono">

              {garageId
                ? `GARAGE ID: ${garageId} • AUTO REFRESH: 5 SECONDS`
                : "IDENTIFYING GARAGE..."}

            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              loadResourceMatrix(
                false
              )
            }
            disabled={
              loading ||
              refreshing
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >

            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "REFRESHING..."
              : "REFRESH"}

          </button>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">

            <p className="text-sm font-bold text-red-300">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                loadResourceMatrix(
                  true
                )
              }
              className="mt-4 rounded-lg border border-red-500/30 px-4 py-2 text-xs text-red-200 hover:bg-red-500/10"
            >
              TRY AGAIN
            </button>

          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          <SummaryCard
            title="Registered Technicians"
            value={
              registeredTechnicianCount
            }
          />

          <SummaryCard
            title="Available Free Technicians"
            value={`${freeTechnicianCount} Free`}
            valueClass="text-emerald-400"
            icon={
              <CircleDot
                size={14}
                className="text-emerald-400"
              />
            }
          />

          <SummaryCard
            title="Confirmed Allocations"
            value={`${busyTechnicianCount} Active`}
            valueClass="text-indigo-300"
            icon={
              <Gauge
                size={15}
                className="text-indigo-300"
              />
            }
          />

          <SummaryCard
            title="Off Shift Technicians"
            value={`${offShiftTechnicianCount} Off`}
            valueClass="text-gray-400"
            icon={
              <Clock
                size={15}
                className="text-gray-500"
              />
            }
          />

        </div>

        {/* ==================================================
            TECHNICIANS
        ================================================== */}

        <section className="mb-10">

          <div className="flex items-center justify-between gap-4 mb-2">

            <h2 className="text-base text-gray-200">
              Technician Availability & Real-time Workload Mapping
            </h2>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400">

              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

              LIVE DATA

            </div>

          </div>

          <p className="text-sm text-gray-400 mb-5">
            Registered technicians, shifts,
            active vehicles and repair workload.
          </p>

          <div
            ref={
              technicianScrollRef
            }
            onWheel={
              handleTechnicianWheel
            }
            className="flex gap-4 overflow-x-auto pb-5"
          >

            {loading ? (

              <EmptyBox
                text="Loading technicians..."
              />

            ) : filteredTechnicians.length >
              0 ? (

              filteredTechnicians.map(
                (tech) => (

                  <div
                    key={
                      tech.id
                    }
                    className={`min-w-[290px] rounded-xl border bg-[#1b1b24] p-5 ${
                      tech.status ===
                      "BUSY"
                        ? "border-orange-400/30"
                        : tech.status ===
                          "FREE"
                        ? "border-emerald-500/20"
                        : "border-white/10"
                    }`}
                  >

                    <div className="flex justify-between gap-4 mb-5">

                      <div>

                        <h3 className="font-mono font-bold">
                          {tech.name.toUpperCase()}
                        </h3>

                        <p className="mt-1 text-[10px] text-gray-500">
                          TECH-{tech.id}
                        </p>

                      </div>

                      <span
                        className={`h-fit rounded border px-2 py-1 text-[10px] ${getStatusStyle(
                          tech.status
                        )}`}
                      >
                        {tech.status}
                      </span>

                    </div>

                    <Info
                      label="Specialization"
                      value={
                        tech.specialization
                      }
                    />

                    <Info
                      label="Experience"
                      value={
                        tech.experience
                      }
                    />

                    <Info
                      label="Shift Status"
                      value={
                        tech.shiftStatus ===
                        "ON"
                          ? "ON SHIFT"
                          : "OFF SHIFT"
                      }
                      className={
                        tech.shiftStatus ===
                        "ON"
                          ? "text-emerald-400"
                          : "text-gray-500"
                      }
                    />

                    <div className="mb-4">

                      <p className="text-[10px] uppercase text-gray-500">
                        Active Vehicle
                      </p>

                      <div className="mt-2 flex items-center gap-2">

                        <Car
                          size={14}
                          className={
                            tech.activeJob
                              ? "text-cyan-400"
                              : "text-gray-600"
                          }
                        />

                        <span
                          className={
                            tech.activeJob
                              ? "font-mono text-sm text-cyan-300"
                              : "font-mono text-sm text-gray-500"
                          }
                        >
                          {
                            tech.vehicle
                          }
                        </span>

                      </div>

                    </div>

                    {tech.activeJob && (

                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">

                        <Info
                          label="Job Status"
                          value={
                            tech.jobStatus
                          }
                          className={
                            tech.jobStatus ===
                            "TIME EXTENDED"
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }
                        />

                        <Info
                          label="Service Type"
                          value={
                            tech.jobType
                          }
                        />

                        <Info
                          label="Expected Completion"
                          value={
                            tech.expectedCompletion
                          }
                        />

                        {tech.extensionMinutes >
                          0 && (

                          <div className="mt-3 border-t border-white/10 pt-3">

                            <div className="flex items-center gap-2 text-amber-400">

                              <AlertTriangle
                                size={14}
                              />

                              <span className="text-xs font-bold">
                                +{tech.extensionMinutes} mins
                              </span>

                            </div>

                            {tech.extensionReason && (

                              <p className="mt-2 text-[10px] text-gray-500">
                                {tech.extensionReason}
                              </p>

                            )}

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                )
              )

            ) : (

              <EmptyBox
                text={
                  searchText
                    ? "No technicians match your search."
                    : "No technicians are registered for this garage."
                }
              />

            )}

          </div>

        </section>

        {/* ==================================================
            EXTENSIONS
        ================================================== */}

        <section className="mb-20">

          <h2 className="text-base text-gray-200 mb-2">
            Critical Time Extensions & Vehicle Workload Alerts
          </h2>

          <p className="text-sm text-gray-400 mb-5">
            Active vehicles with approved
            repair time extensions.
          </p>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#191923]">

            <div className="overflow-x-auto">

              <table className="w-[950px] md:w-full text-left">

                <thead className="bg-white/5 text-xs text-gray-400">

                  <tr>

                    <th className="px-7 py-5">
                      Vehicle ID
                    </th>

                    <th className="px-7 py-5">
                      Assigned Technician
                    </th>

                    <th className="px-7 py-5">
                      Extension
                    </th>

                    <th className="px-7 py-5">
                      Updated Completion
                    </th>

                    <th className="px-7 py-5">
                      Reason
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {extensionVehicles.length >
                  0 ? (

                    extensionVehicles.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-t border-white/5 text-sm"
                        >

                          <td className="px-7 py-5 font-mono text-cyan-300">
                            {
                              item.vehicle
                            }
                          </td>

                          <td className="px-7 py-5 text-gray-300">
                            {
                              item.technician
                            }
                          </td>

                          <td className="px-7 py-5 font-mono text-amber-400">
                            +{item.minutes} Mins
                          </td>

                          <td className="px-7 py-5 font-mono text-gray-300">
                            {
                              item.completion
                            }
                          </td>

                          <td className="px-7 py-5 text-gray-400">
                            {
                              item.reason
                            }
                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-8 py-12 text-center text-xs tracking-widest text-gray-500"
                      >
                        NO ACTIVE TIME EXTENSIONS
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

// ======================================================
// SMALL COMPONENTS
// ======================================================

function SummaryCard({
  title,
  value,
  valueClass = "text-white",
  icon = null,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#181820] p-6">

      <div className="mb-6 flex justify-between gap-3">

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
          {title}
        </p>

        {icon}

      </div>

      <h2
        className={`text-3xl font-mono font-black ${valueClass}`}
      >
        {value}
      </h2>

    </div>
  );
}

function Info({
  label,
  value,
  className = "text-gray-300",
}) {
  return (
    <div className="mb-4">

      <p className="text-[10px] uppercase text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-sm ${className}`}
      >
        {value}
      </p>

    </div>
  );
}

function EmptyBox({
  text,
}) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#1b1b24] p-10 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}