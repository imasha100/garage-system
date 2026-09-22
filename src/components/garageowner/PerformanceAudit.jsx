import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Menu,
  Info,
  User,
  RefreshCw,
  History,
  Users,
  Wrench,
  Clock3,
  X,
} from "lucide-react";

import GarageOwnerNotifications from "./GarageOwnerNotifications";

const API_BASE =
  "";

export default function PerformanceAudit({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // STATES
  // ======================================================

  const [searchText, setSearchText] =
    useState("");

  const [ownerData, setOwnerData] =
    useState(null);

  const [garageId, setGarageId] =
    useState(null);

  const [garageName, setGarageName] =
    useState("");

  const [auditData, setAuditData] =
    useState([]);

  const [summary, setSummary] =
    useState({
      totalTechnicians: 0,
      totalJobsDone: 0,
      totalExtensionRequests: 0,
      averageEfficiency: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [jobHistory, setJobHistory] =
    useState([]);

  const [selectedJobHistory, setSelectedJobHistory] =
    useState(null);

  const [shiftHistory, setShiftHistory] =
    useState([]);

  // ======================================================
  // GET LOGGED-IN STAFF USER
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
  // RESOLVE GARAGE ID
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

      staffUser?.garageGarageId,

      staffUser
        ?.garage_garage_id,
    ];

    for (
      const value of possibleValues
    ) {
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
  // PERFORMANCE COLOR
  // ======================================================

  const getPerformanceColor = (
    efficiency
  ) => {
    const value =
      Number(efficiency) || 0;

    if (value >= 85) {
      return "emerald";
    }

    if (value >= 70) {
      return "yellow";
    }

    return "red";
  };

  // ======================================================
  // LOAD PERFORMANCE AUDIT
  // ======================================================

  const loadPerformanceAudit =
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
        // GET LOGGED-IN OWNER
        // ================================================

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

        // ================================================
        // LOAD OWNER PROFILE
        // ================================================

        const ownerResponse =
          await fetch(
            `${API_BASE}/api/owners/profile/${loginId}`
          );

        const ownerResult =
          await ownerResponse.json();

        if (
          !ownerResponse.ok ||
          ownerResult.success ===
            false
        ) {
          throw new Error(
            ownerResult.message ||
              "Unable to load garage owner profile."
          );
        }

        setOwnerData(
          ownerResult.data ||
            null
        );

        // ================================================
        // FIND GARAGE ID
        // ================================================

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
        // LOAD PERFORMANCE AUDIT API
        // ================================================

        const auditResponse =
          await fetch(
            `${API_BASE}/api/service-jobs/garage/${numericGarageId}/performance-audit`
          );

        const auditResult =
          await auditResponse.json();

        if (
          !auditResponse.ok ||
          auditResult.success ===
            false
        ) {
          throw new Error(
            auditResult.message ||
              "Unable to load performance audit."
          );
        }

        // ================================================
        // GARAGE
        // ================================================

        setGarageName(
          auditResult?.garage
            ?.garageName ||
            ownerResult?.data
              ?.garage
              ?.garageName ||
            "Garage"
        );

        // ================================================
        // SUMMARY
        // ================================================

        setSummary({
          totalTechnicians:
            Number(
              auditResult
                ?.summary
                ?.totalTechnicians
            ) || 0,

          totalJobsDone:
            Number(
              auditResult
                ?.summary
                ?.totalJobsDone
            ) || 0,

          totalExtensionRequests:
            Number(
              auditResult
                ?.summary
                ?.totalExtensionRequests
            ) || 0,

          averageEfficiency:
            Number(
              auditResult
                ?.summary
                ?.averageEfficiency
            ) || 0,
        });

        // ================================================
        // TECHNICIANS
        // ================================================

        const receivedTechnicians =
          Array.isArray(
            auditResult
              ?.technicians
          )
            ? auditResult
                .technicians
            : [];

        const formatted =
          receivedTechnicians.map(
            (item) => {
              const efficiency =
                Number(
                  item.efficiencyIndex
                ) || 0;

              return {
                technicianId:
                  item.technicianId,

                name:
                  item.technicianName ||
                  "Technician",

                specialization:
                  item.specialization ||
                  "Not specified",

                shiftStatus:
                  item.shiftStatus ||
                  "OFF",

                availabilityStatus:
                  item.availabilityStatus ||
                  "AVAILABLE",

                jobsDone:
                  Number(
                    item.jobsDone
                  ) || 0,

                extRequests:
                  Number(
                    item.extensionRequests
                  ) || 0,

                avgErrorMinutes:
                  item.avgTimeErrorMinutes,

                avgError:
                  item.avgTimeError ||
                  "N/A",

                efficiency,

                performanceLevel:
                  item.performanceLevel ||
                  "NO DATA",

                color:
                  getPerformanceColor(
                    efficiency
                  ),
              };
            }
          );

        setAuditData(
          formatted
        );

        // ================================================
        // LOAD JOB TECHNICIAN HISTORY
        // ================================================

        const historyResponse =
          await fetch(
            `${API_BASE}/api/service-jobs/garage/${numericGarageId}/job-history`
          );

        const historyResult =
          await historyResponse.json();

        if (
          !historyResponse.ok ||
          historyResult.success === false
        ) {
          throw new Error(
            historyResult.message ||
              "Unable to load job technician history."
          );
        }

        setJobHistory(
          Array.isArray(historyResult?.jobs)
            ? historyResult.jobs
            : []
        );

        // ================================================
        // LOAD STAFF SHIFT HISTORY
        // ================================================

        const shiftHistoryResponse =
          await fetch(
            `${API_BASE}/api/shift-history/garage/${numericGarageId}`
          );

        const shiftHistoryResult =
          await shiftHistoryResponse.json();

        if (
          !shiftHistoryResponse.ok ||
          shiftHistoryResult.success === false
        ) {
          throw new Error(
            shiftHistoryResult.message ||
              "Unable to load staff shift history."
          );
        }

        setShiftHistory(
          Array.isArray(shiftHistoryResult?.history)
            ? shiftHistoryResult.history
            : []
        );
      } catch (error) {
        console.error(
          "Performance Audit loading error:",
          error
        );

        setLoadError(
          error.message ||
            "Unable to load Performance Audit."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  // ======================================================
  // REAL-TIME AUTO REFRESH
  // ======================================================

  useEffect(() => {
    loadPerformanceAudit(true);

    const interval =
      setInterval(() => {
        loadPerformanceAudit(
          false
        );
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
        return auditData;
      }

      return auditData.filter(
        (item) =>
          `
            ${item.name}
            ${item.specialization}
            ${item.jobsDone}
            ${item.extRequests}
            ${item.avgError}
            ${item.efficiency}
            ${item.performanceLevel}
            ${item.shiftStatus}
            ${item.availabilityStatus}
          `
            .toLowerCase()
            .includes(query)
      );
    }, [
      auditData,
      searchText,
    ]);

  const filteredJobHistory =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return jobHistory;
      }

      return jobHistory.filter((job) => {
        const supportText =
          Array.isArray(job.supportAssistances)
            ? job.supportAssistances
                .map(
                  (support) =>
                    `${support.supportTechnicianName || ""} ${support.reason || ""} ${support.assistanceStatus || ""}`
                )
                .join(" ")
            : "";

        return `
          ${job.jobId || ""}
          ${job.ticketNumber || ""}
          ${job.vehicleNumber || ""}
          ${job.vehicleType || ""}
          ${job.vehicleModel || ""}
          ${job.customerName || ""}
          ${job.jobType || ""}
          ${job.jobStatus || ""}
          ${job.mainTechnician?.technicianName || ""}
          ${job.mainTechnician?.specialization || ""}
          ${supportText}
        `
          .toLowerCase()
          .includes(query);
      });
    }, [jobHistory, searchText]);

  const filteredShiftHistory =
    useMemo(() => {
      const query =
        searchText.trim().toLowerCase();

      if (!query) {
        return shiftHistory;
      }

      return shiftHistory.filter((item) =>
        `
          ${item.staffName || ""}
          ${item.staffType || ""}
          ${item.staffId || ""}
          ${item.shiftStatus || ""}
        `
          .toLowerCase()
          .includes(query)
      );
    }, [shiftHistory, searchText]);

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  // ======================================================
  // KEEP SUPPORT HISTORY STRICTLY INSIDE ONE JOB
  // ======================================================

  const getSupportAssistancesForJob = (job) => {
    if (!job || !Array.isArray(job.supportAssistances)) {
      return [];
    }

    const selectedJobId = Number(job.jobId ?? job.job_id);

    if (!Number.isFinite(selectedJobId)) {
      return [];
    }

    return job.supportAssistances.filter((support) => {
      const supportJobId = Number(
        support.jobId ??
          support.job_id ??
          support.serviceJobId ??
          support.service_job_id
      );

      return (
        Number.isFinite(supportJobId) &&
        supportJobId === selectedJobId
      );
    });
  };

  // ======================================================
  // OWNER DISPLAY
  // ======================================================

  const ownerName =
    ownerData?.owner
      ?.fullName ??
    ownerData?.owner
      ?.full_name ??
    "Garage Owner";

  const displayGarageName =
    garageName ||
    ownerData?.garage
      ?.garageName ||
    ownerData?.garage
      ?.garage_name ||
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
  // COLOR STYLE
  // ======================================================

  const colorStyle = {
    emerald: {
      icon:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",

      text:
        "text-emerald-400",

      bar:
        "bg-emerald-400",
    },

    yellow: {
      icon:
        "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",

      text:
        "text-yellow-400",

      bar:
        "bg-yellow-400",
    },

    red: {
      icon:
        "bg-red-500/10 text-red-400 border-red-500/40",

      text:
        "text-red-300",

      bar:
        "bg-red-300",
    },
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <div className="sticky top-0 z-50 min-h-16 border-b border-white/10 bg-[#191922]/95 backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-0 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">

        <div className="flex items-center gap-3 w-full md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">

            <Search
              size={15}
              className="text-gray-500 shrink-0"
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
              placeholder="Search technician / job..."
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
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            DYNAMIC OWNER HEADER
        ================================================== */}

        <div className="flex w-full min-w-0 items-center justify-end gap-2 sm:gap-3 md:w-auto md:gap-4">

          <div className="hidden h-8 w-px shrink-0 bg-white/10 md:block" />

          <div className="shrink-0">
            <GarageOwnerNotifications
              onNavigate={onNavigate}
            />
          </div>

          <div className="min-w-0 flex-1 text-right sm:flex-none">

            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-indigo-400 md:max-w-[260px]">
              {displayGarageName}
            </p>

          </div>

          <div className="h-9 w-9 min-h-9 min-w-9 shrink-0 overflow-hidden rounded-xl border border-indigo-400 bg-[#0b0b12] text-xs flex items-center justify-center">

            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
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

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8">

          <div>

            <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-black leading-tight mb-3 break-words">
              Technician Precision &
              <br className="hidden md:block" />
              Operational Audit Trail
            </h1>

            <p className="text-gray-400 text-sm md:text-base flex items-start gap-2">

              <Info
                size={15}
                className="text-cyan-400"
              />

              Tracks individual time
              accuracy, approved extensions,
              and system efficiency indexes.

            </p>

            <p className="mt-3 text-[10px] text-gray-600 font-mono">

              {garageId
                ? `GARAGE ID: ${garageId} • AUTO REFRESH: 5 SECONDS`
                : "IDENTIFYING GARAGE..."}

            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              loadPerformanceAudit(
                false
              )
            }
            disabled={
              loading ||
              refreshing
            }
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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

            <p className="text-sm text-red-300">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                loadPerformanceAudit(
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
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <div className="rounded-xl border border-white/10 bg-[#181820] p-5">

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Technicians
            </p>

            <p className="mt-3 text-3xl font-mono font-bold text-white">
              {summary.totalTechnicians}
            </p>

          </div>

          <div className="rounded-xl border border-white/10 bg-[#181820] p-5">

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Completed Jobs
            </p>

            <p className="mt-3 text-3xl font-mono font-bold text-emerald-400">
              {summary.totalJobsDone}
            </p>

          </div>

          <div className="rounded-xl border border-white/10 bg-[#181820] p-5">

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Extension Requests
            </p>

            <p className="mt-3 text-3xl font-mono font-bold text-amber-400">
              {summary.totalExtensionRequests}
            </p>

          </div>

          <div className="rounded-xl border border-white/10 bg-[#181820] p-5">

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Avg. Efficiency
            </p>

            <p className="mt-3 text-3xl font-mono font-bold text-indigo-300">
              {summary.averageEfficiency}%
            </p>

          </div>

        </div>

        {/* ==================================================
            MAIN TABLE
        ================================================== */}

        <div className="bg-[#181820] border border-white/10 rounded-lg overflow-hidden mb-10">

          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <p className="text-[11px] text-cyan-400 font-bold tracking-[0.25em]">
                LIVE EFFICIENCY METRICS
              </p>

              <div className="flex items-center gap-2 text-[9px] text-emerald-400">

                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

                REAL TIME

              </div>

            </div>

            <p className="text-[10px] text-gray-600">
              {auditData.length} TECHNICIANS
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-[950px] md:w-full text-left">

              <thead className="text-gray-400 text-[11px] tracking-widest">

                <tr className="border-b border-white/10">

                  <th className="px-8 py-5"></th>

                  <th className="px-4 py-5">
                    Technician Name
                  </th>

                  <th className="px-4 py-5">
                    Jobs Done
                  </th>

                  <th className="px-4 py-5">
                    Ext. Requests
                  </th>

                  <th className="px-4 py-5">
                    Avg. Time Error
                  </th>

                  <th className="px-4 py-5">
                    Efficiency Index
                  </th>

                  <th className="px-4 py-5">
                    Performance
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="py-14 text-center text-gray-500 text-xs tracking-widest"
                    >
                      LOADING PERFORMANCE DATA...
                    </td>

                  </tr>

                ) : filteredTechnicians.length >
                  0 ? (

                  filteredTechnicians.map(
                    (item) => (

                      <tr
                        key={
                          item.technicianId
                        }
                        className="border-b border-white/10 hover:bg-white/[0.03] transition"
                      >

                        <td className="px-8 py-5">

                          <div
                            className={`w-8 h-8 border rounded flex items-center justify-center ${
                              colorStyle[
                                item.color
                              ].icon
                            }`}
                          >
                            <User
                              size={14}
                            />
                          </div>

                        </td>

                        <td className="px-4 py-5">

                          <p className="text-sm text-white">
                            {item.name}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-600 font-mono">
                            TECH-{item.technicianId}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-[9px] text-gray-500">
                            {item.specialization}
                          </p>

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
                            item.avgErrorMinutes ===
                            null
                              ? "text-gray-500"
                              : item.avgErrorMinutes >
                                0
                              ? "text-red-300"
                              : "text-emerald-400"
                          }`}
                        >
                          {item.avgError}
                        </td>

                        <td className="px-4 py-5">

                          <div className="flex flex-col gap-2">

                            <span className="font-mono text-sm">
                              {item.efficiency}%
                            </span>

                            <div className="w-28 h-1 bg-gray-700 rounded overflow-hidden">

                              <div
                                className={`h-1 rounded transition-all duration-500 ${
                                  colorStyle[
                                    item.color
                                  ].bar
                                }`}
                                style={{
                                  width: `${item.efficiency}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        <td className="px-4 py-5">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold tracking-wider ${
                              item.performanceLevel ===
                              "EXCELLENT"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : item.performanceLevel ===
                                  "GOOD"
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                : item.performanceLevel ===
                                  "AVERAGE"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                : item.performanceLevel ===
                                  "LOW"
                                ? "border-red-500/30 bg-red-500/10 text-red-300"
                                : "border-gray-500/30 bg-gray-500/10 text-gray-500"
                            }`}
                          >
                            {item.performanceLevel}
                          </span>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="py-14 text-center text-gray-500 text-xs tracking-widest"
                    >

                      {searchText
                        ? "NO MATCHING TECHNICIAN FOUND"
                        : "NO AUDIT DATA AVAILABLE"}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ==================================================
            JOB TECHNICIAN HISTORY
        ================================================== */}

        <div className="bg-[#181820] border border-white/10 rounded-lg overflow-hidden mb-10">

          <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-300">
                <History size={16} />
              </div>

              <div>
                <p className="text-[11px] text-indigo-300 font-bold tracking-[0.25em]">
                  JOB TECHNICIAN HISTORY
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Completed and cleared jobs with main and support technician records.
                </p>
              </div>

            </div>

            <p className="text-[10px] text-gray-600">
              {filteredJobHistory.length} JOBS
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-[1100px] md:w-full text-left">

              <thead className="text-gray-400 text-[11px] tracking-widest">

                <tr className="border-b border-white/10">
                  <th className="px-6 py-5">Job</th>
                  <th className="px-4 py-5">Vehicle</th>
                  <th className="px-4 py-5">Main Technician</th>
                  <th className="px-4 py-5">Support</th>
                  <th className="px-4 py-5">Completed</th>
                  <th className="px-4 py-5">Status</th>
                  <th className="px-4 py-5">Action</th>
                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-14 text-center text-gray-500 text-xs tracking-widest"
                    >
                      LOADING JOB HISTORY...
                    </td>
                  </tr>
                ) : filteredJobHistory.length > 0 ? (
                  filteredJobHistory.map((job) => {
                    const jobSupportAssistances =
                      getSupportAssistancesForJob(job);

                    const supportCount =
                      jobSupportAssistances.length;

                    return (
                      <tr
                        key={job.jobId}
                        className="border-b border-white/10 hover:bg-white/[0.03] transition"
                      >
                        <td className="px-6 py-5">
                          <p className="text-sm font-mono text-white">
                            #{job.jobId}
                          </p>
                          <p className="mt-1 text-[9px] text-gray-600 font-mono">
                            {job.ticketNumber || `JOB-${job.jobId}`}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-sm text-white">
                            {job.vehicleNumber || "N/A"}
                          </p>
                          <p className="mt-1 text-[9px] text-gray-500">
                            {[job.vehicleType, job.vehicleModel]
                              .filter(Boolean)
                              .join(" • ") || "Vehicle details not available"}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-sm text-cyan-300">
                            {job.mainTechnician?.technicianName ||
                              "Unknown Technician"}
                          </p>
                          <p className="mt-1 text-[9px] text-gray-500">
                            TECH-{job.mainTechnician?.technicianId || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          {supportCount > 0 ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[9px] font-bold text-violet-300">
                                <Users size={11} />
                                {supportCount} SUPPORT
                              </span>
                              <p className="mt-2 max-w-[170px] truncate text-[10px] text-gray-400">
                                {jobSupportAssistances
                                  .map(
                                    (item) =>
                                      item.supportTechnicianName ||
                                      "Support Technician"
                                  )
                                  .join(", ")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-600">
                              No support assistance
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-xs text-gray-300">
                            {formatDate(
                              job.actualCompletionTime ||
                                job.endDate
                            )}
                          </p>
                          <p className="mt-1 text-[9px] text-gray-600">
                            {job.endTime || ""}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold tracking-wider ${
                              String(job.jobStatus || "").toUpperCase() ===
                              "CLEARED"
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {job.jobStatus || "COMPLETED"}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedJobHistory(job)
                            }
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold tracking-wider text-cyan-300 hover:bg-cyan-500/20 transition"
                          >
                            VIEW FULL HISTORY
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-14 text-center text-gray-500 text-xs tracking-widest"
                    >
                      {searchText
                        ? "NO MATCHING JOB HISTORY FOUND"
                        : "NO COMPLETED JOB HISTORY AVAILABLE"}
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ==================================================
            STAFF SHIFT HISTORY - SEPARATE CARDS
        ================================================== */}

        <div className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-emerald-300">
                STAFF SHIFT HISTORY
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                Technician and assistance shift activity shown separately.
              </p>
            </div>

            <p className="text-[10px] text-gray-600">
              {filteredShiftHistory.length} TOTAL RECORDS
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* TECHNICIAN SHIFT HISTORY */}
            <div className="bg-[#181820] border border-cyan-500/20 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-300">
                    <Wrench size={16} />
                  </div>

                  <div>
                    <p className="text-[11px] text-cyan-300 font-bold tracking-[0.2em]">
                      TECHNICIAN SHIFT HISTORY
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Technician ON / OFF activity
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600">
                  {filteredShiftHistory.filter(
                    (item) => item.staffType === "TECHNICIAN"
                  ).length} RECORDS
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-[620px] md:w-full text-left">
                  <thead className="text-gray-400 text-[10px] tracking-widest">
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4">Technician</th>
                      <th className="px-4 py-4">Shift</th>
                      <th className="px-4 py-4">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-gray-500 text-xs tracking-widest">
                          LOADING...
                        </td>
                      </tr>
                    ) : filteredShiftHistory.filter(
                        (item) => item.staffType === "TECHNICIAN"
                      ).length > 0 ? (
                      filteredShiftHistory
                        .filter((item) => item.staffType === "TECHNICIAN")
                        .map((item) => (
                          <tr
                            key={item.shiftHistoryId}
                            className="border-b border-white/10 hover:bg-white/[0.03] transition"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-white">
                                {item.staffName || "Unknown Technician"}
                              </p>
                              <p className="mt-1 text-[9px] text-gray-600 font-mono">
                                TECH-{item.staffId}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-bold ${
                                  item.shiftStatus === "ON"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-300"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    item.shiftStatus === "ON"
                                      ? "bg-emerald-400"
                                      : "bg-red-300"
                                  }`}
                                />
                                {item.shiftStatus || "OFF"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-xs text-gray-300">
                                {formatDateTime(item.changedAt)}
                              </p>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-gray-500 text-xs tracking-widest">
                          {searchText
                            ? "NO MATCHING TECHNICIAN SHIFT HISTORY"
                            : "NO TECHNICIAN SHIFT HISTORY YET"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ASSISTANCE SHIFT HISTORY */}
            <div className="bg-[#181820] border border-violet-500/20 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-violet-300">
                    <Users size={16} />
                  </div>

                  <div>
                    <p className="text-[11px] text-violet-300 font-bold tracking-[0.2em]">
                      ASSISTANCE SHIFT HISTORY
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Assistance officer ON / OFF activity
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600">
                  {filteredShiftHistory.filter(
                    (item) => item.staffType === "ASSISTANCE"
                  ).length} RECORDS
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-[620px] md:w-full text-left">
                  <thead className="text-gray-400 text-[10px] tracking-widest">
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4">Assistance</th>
                      <th className="px-4 py-4">Shift</th>
                      <th className="px-4 py-4">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-gray-500 text-xs tracking-widest">
                          LOADING...
                        </td>
                      </tr>
                    ) : filteredShiftHistory.filter(
                        (item) => item.staffType === "ASSISTANCE"
                      ).length > 0 ? (
                      filteredShiftHistory
                        .filter((item) => item.staffType === "ASSISTANCE")
                        .map((item) => (
                          <tr
                            key={item.shiftHistoryId}
                            className="border-b border-white/10 hover:bg-white/[0.03] transition"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-white">
                                {item.staffName || "Unknown Assistance"}
                              </p>
                              <p className="mt-1 text-[9px] text-gray-600 font-mono">
                                ASSIST-{item.staffId}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-bold ${
                                  item.shiftStatus === "ON"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-300"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    item.shiftStatus === "ON"
                                      ? "bg-emerald-400"
                                      : "bg-red-300"
                                  }`}
                                />
                                {item.shiftStatus || "OFF"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-xs text-gray-300">
                                {formatDateTime(item.changedAt)}
                              </p>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-gray-500 text-xs tracking-widest">
                          {searchText
                            ? "NO MATCHING ASSISTANCE SHIFT HISTORY"
                            : "NO ASSISTANCE SHIFT HISTORY YET"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            NOTE
        ================================================== */}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">

          <p className="text-[10px] leading-5 text-gray-500">
            Efficiency Index is calculated
            from completed repair jobs,
            average completion-time accuracy
            and approved time-extension
            requests. A positive time error
            indicates that a job finished
            later than its estimated
            completion time. A negative value
            indicates that the job was
            completed earlier.
          </p>

        </div>

      </main>

      {/* ==================================================
          JOB HISTORY MODAL
      ================================================== */}

      {selectedJobHistory &&
        (() => {
          const selectedJobSupportAssistances =
            getSupportAssistancesForJob(selectedJobHistory);

          return (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedJobHistory(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#15151d] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#15151d]/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-400">
                  JOB TECHNICIAN HISTORY
                </p>
                <h2 className="mt-2 text-xl font-black text-white">
                  Job #{selectedJobHistory.jobId}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedJobHistory.ticketNumber ||
                    `JOB-${selectedJobHistory.jobId}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJobHistory(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[9px] uppercase tracking-widest text-gray-600">
                    Vehicle
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {selectedJobHistory.vehicleNumber || "N/A"}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {[
                      selectedJobHistory.vehicleType,
                      selectedJobHistory.vehicleModel,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "No vehicle details"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[9px] uppercase tracking-widest text-gray-600">
                    Customer
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {selectedJobHistory.customerName || "Customer"}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {selectedJobHistory.customerContact || "No contact"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[9px] uppercase tracking-widest text-gray-600">
                    Job Status
                  </p>
                  <p className="mt-2 text-sm font-bold text-emerald-400">
                    {selectedJobHistory.jobStatus || "COMPLETED"}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {selectedJobHistory.jobType || "GENERAL SERVICE"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                    <Wrench size={17} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-cyan-400">
                      MAIN TECHNICIAN
                    </p>
                    <p className="mt-1 text-base font-bold text-white">
                      {selectedJobHistory.mainTechnician?.technicianName ||
                        "Unknown Technician"}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      TECH-{selectedJobHistory.mainTechnician?.technicianId ||
                        "N/A"}
                      {selectedJobHistory.mainTechnician?.specialization
                        ? ` • ${selectedJobHistory.mainTechnician.specialization}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-violet-300" />
                    <p className="text-[10px] font-bold tracking-[0.2em] text-violet-300">
                      SUPPORT ASSISTANCE HISTORY
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {selectedJobSupportAssistances.length} RECORDS
                  </span>
                </div>

                {selectedJobSupportAssistances.length > 0 ? (
                  <div className="space-y-3">
                    {selectedJobSupportAssistances.map(
                      (support, index) => (
                        <div
                          key={
                            support.assistanceId ||
                            `${support.supportTechnicianId}-${index}`
                          }
                          className="rounded-xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {support.supportTechnicianName ||
                                  "Support Technician"}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-500">
                                TECH-{support.supportTechnicianId || "N/A"}
                                {support.specialization
                                  ? ` • ${support.specialization}`
                                  : ""}
                              </p>
                            </div>

                            <span className="inline-flex w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[9px] font-bold text-violet-300">
                              {support.assistanceStatus || "COMPLETED"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-gray-600">
                                Assigned At
                              </p>
                              <p className="mt-1 text-xs text-gray-300">
                                {formatDateTime(support.assignedAt)}
                              </p>
                            </div>

                            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-gray-600">
                                Completed At
                              </p>
                              <p className="mt-1 text-xs text-gray-300">
                                {formatDateTime(support.completedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <p className="text-[9px] uppercase tracking-wider text-gray-600">
                              Assistance Reason
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-300">
                              {support.reason || "No reason recorded."}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                    <Users
                      size={22}
                      className="mx-auto text-gray-700"
                    />
                    <p className="mt-3 text-xs text-gray-500">
                      No support technician was required for this job.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 size={15} className="text-amber-300" />
                  <p className="text-[10px] font-bold tracking-[0.2em] text-amber-300">
                    JOB TIMELINE
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-600">
                      Started
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                      {selectedJobHistory.startDate
                        ? `${formatDate(
                            selectedJobHistory.startDate
                          )} ${selectedJobHistory.startTime || ""}`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-600">
                      Estimated Completion
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                      {formatDateTime(
                        selectedJobHistory.estimatedCompletionTime
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-600">
                      Actual Completion
                    </p>
                    <p className="mt-1 text-xs text-emerald-300">
                      {formatDateTime(
                        selectedJobHistory.actualCompletionTime
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {selectedJobHistory.remarks && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-gray-600">
                    Remarks
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-300">
                    {selectedJobHistory.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
          );
        })()}

    </div>
  );
}