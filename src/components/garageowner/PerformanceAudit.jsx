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
} from "lucide-react";

import GarageOwnerNotifications from "./GarageOwnerNotifications";

const API_BASE =
  "http://localhost:5000";

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
              placeholder="Search technician..."
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

    </div>
  );
}