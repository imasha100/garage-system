import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Bell,
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  Hourglass,
  MoreVertical,
  Menu,
  Eye,
  X,
  User,
  Car,
  Wrench,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function LiveDashboard({
  toggleSidebar,
}) {
  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    openActionMenu,
    setOpenActionMenu,
  ] = useState(null);

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] = useState(null);

  const [
    ownerData,
    setOwnerData,
  ] = useState(null);

  const [
    ownerLoading,
    setOwnerLoading,
  ] = useState(true);

  const [
    ownerError,
    setOwnerError,
  ] = useState("");

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  // ======================================================
  // LOAD LOGGED-IN GARAGE OWNER PROFILE
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile =
      async () => {
        try {
          setOwnerLoading(
            true
          );

          setOwnerError("");

          const storedStaffUser =
            sessionStorage.getItem(
              "staffUser"
            );

          if (!storedStaffUser) {
            throw new Error(
              "Logged-in garage owner details were not found."
            );
          }

          const staffUser =
            JSON.parse(
              storedStaffUser
            );

          const loginId =
            Number(
              staffUser?.loginId
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
              `http://localhost:5000/api/owners/profile/${loginId}`
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
                "Unable to load the garage owner profile."
            );
          }

          if (isMounted) {
            setOwnerData(
              result.data
            );
          }
        } catch (error) {
          console.error(
            "Owner profile loading error:",
            error
          );

          if (isMounted) {
            setOwnerData(null);

            setOwnerError(
              error.message ||
                "Unable to load the garage owner profile."
            );
          }
        } finally {
          if (isMounted) {
            setOwnerLoading(
              false
            );
          }
        }
      };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // OWNER / GARAGE DISPLAY DATA
  // ======================================================

  const ownerName =
    ownerData?.owner
      ?.fullName ||
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage
      ?.garageName ||
    (ownerLoading
      ? "Loading Garage..."
      : "Garage Not Available");

  const garageId =
    Number(
      ownerData?.garage
        ?.garageId
    );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) =>
        namePart
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner
      ?.profilePhoto || "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? profilePhotoPath.startsWith(
          "http"
        )
        ? profilePhotoPath
        : `http://localhost:5000${profilePhotoPath}`
      : null;

  // ======================================================
  // LOAD LIVE DASHBOARD DATA
  // ======================================================

  const loadDashboardData =
    async (
      selectedGarageId =
        garageId,
      showLoading = false
    ) => {
      if (
        !Number.isInteger(
          selectedGarageId
        ) ||
        selectedGarageId <= 0
      ) {
        return;
      }

      try {
        if (showLoading) {
          setDashboardLoading(
            true
          );
        }

        setDashboardError("");

        const response =
          await fetch(
            `http://localhost:5000/api/service-jobs/garage/${selectedGarageId}/live-dashboard`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load live dashboard."
          );
        }

        setDashboardData(
          result
        );
      } catch (error) {
        console.error(
          "Live dashboard loading error:",
          error
        );

        setDashboardError(
          error.message ||
            "Unable to load live dashboard."
        );
      } finally {
        setDashboardLoading(
          false
        );
      }
    };

  // ======================================================
  // LIVE DASHBOARD AUTO REFRESH - EVERY 5 SECONDS
  // ======================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        garageId
      ) ||
      garageId <= 0
    ) {
      return undefined;
    }

    loadDashboardData(
      garageId,
      true
    );

    const interval =
      setInterval(() => {
        loadDashboardData(
          garageId,
          false
        );
      }, 5000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [garageId]);

  // ======================================================
  // OWNER NOTIFICATIONS - LIVE DASHBOARD ONLY
  // ======================================================

  const loadNotifications = async () => {
    if (!Number.isInteger(garageId) || garageId <= 0) {
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError("");

      const response = await fetch(
        `http://localhost:5000/api/notifications/garage/${garageId}?targetPage=live-dashboard`
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to load notifications."
        );
      }

      setNotifications(
        Array.isArray(result.notifications)
          ? result.notifications
          : []
      );
    } catch (error) {
      console.error("Notification loading error:", error);
      setNotificationError(
        error.message || "Unable to load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(garageId) || garageId <= 0) {
      return undefined;
    }

    loadNotifications();

    const notificationInterval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      clearInterval(notificationInterval);
    };
  }, [garageId]);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const handleNotificationBell = () => {
    setNotificationOpen((previous) => !previous);

    if (!notificationOpen) {
      loadNotifications();
    }
  };

  const markNotificationRead = async (notification) => {
    try {
      if (!notification.isRead) {
        const response = await fetch(
          `http://localhost:5000/api/notifications/${notification.notificationId}/read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to mark notification as read."
          );
        }

        setNotifications((previous) =>
          previous.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, isRead: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Notification read error:", error);
      setNotificationError(
        error.message || "Unable to update notification."
      );
    }
  };

  const markAllNotificationsRead = async () => {
    if (!Number.isInteger(garageId) || garageId <= 0) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/garage/${garageId}/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetPage: "live-dashboard" }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to mark notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Mark all notifications error:", error);
      setNotificationError(
        error.message || "Unable to update notifications."
      );
    }
  };

  const formatNotificationTime = (notification) => {
    if (!notification?.createdDate) {
      return notification?.createdTime || "";
    }

    const datePart = String(notification.createdDate).slice(0, 10);
    const timePart = String(notification.createdTime || "00:00:00").slice(
      0,
      8
    );

    const notificationDate = new Date(`${datePart}T${timePart}`);

    if (Number.isNaN(notificationDate.getTime())) {
      return `${datePart} ${timePart}`;
    }

    return notificationDate.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // SUMMARY
  // ======================================================

  const summary =
    dashboardData?.summary ||
    {};

  const globalWorkloadMinutes =
    Number(
      summary.globalWorkloadMinutes
    ) || 0;

  const activeVehicles =
    Number(
      summary.activeVehicles
    ) || 0;

  const assignedVehicles =
    Number(
      summary.assignedVehicles
    ) || 0;

  const totalLiveJobs =
    Number(
      summary.totalLiveJobs
    ) || 0;

  const totalBays =
    Number(
      summary.totalBays
    ) || 0;

  const occupancyPercentage =
    Number(
      summary.occupancyPercentage
    ) || 0;

  const workloadPercentage =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (globalWorkloadMinutes /
            480) *
            100
        )
      )
    );

  const workloadLevel =
    globalWorkloadMinutes ===
    0
      ? "Idle"
      : globalWorkloadMinutes <
        120
      ? "Low"
      : globalWorkloadMinutes <
        300
      ? "Moderate"
      : "Critical";

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (
    value
  ) => {
    if (!value) {
      return "Not Started";
    }

    const stringValue =
      String(value);

    if (
      /^\d{1,2}:\d{2}(:\d{2})?$/.test(
        stringValue
      )
    ) {
      const [
        hourString,
        minuteString,
      ] =
        stringValue.split(
          ":"
        );

      const hour =
        Number(hourString);

      const minute =
        Number(
          minuteString
        );

      if (
        Number.isInteger(
          hour
        ) &&
        Number.isInteger(
          minute
        )
      ) {
        const date =
          new Date();

        date.setHours(
          hour,
          minute,
          0,
          0
        );

        return date.toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        );
      }
    }

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.toLocaleTimeString(
        [],
        {
          hour:
            "2-digit",

          minute:
            "2-digit",
        }
      );
    }

    return stringValue;
  };

  // ======================================================
  // MAP API JOBS TO EXISTING UI
  // ======================================================

  const vehicles =
    useMemo(() => {
      const jobs =
        Array.isArray(
          dashboardData
            ?.vehicles
        )
          ? dashboardData
              .vehicles
          : [];

      return jobs.map(
        (job) => {
          const jobStatus =
            String(
              job.jobStatus ||
                ""
            ).toUpperCase();

          const displayStatus =
            String(
              job.displayStatus ||
                job.jobStatus ||
                "UNKNOWN"
            ).toUpperCase();

          const isTimeExtended =
            displayStatus ===
              "TIME EXTENDED" ||
            Boolean(
              job.timeExtended
            );

          let color =
            "cyan";

          let Icon =
            Hourglass;

          if (
            isTimeExtended
          ) {
            color = "red";
            Icon =
              AlertTriangle;
          } else if (
            jobStatus ===
            "ASSIGNED"
          ) {
            color =
              "amber";

            Icon =
              CalendarDays;
          } else if (
            jobStatus ===
            "IN_PROGRESS"
          ) {
            color =
              "cyan";

            Icon =
              Hourglass;
          }

          return {
            jobId:
              job.jobId,

            requestId:
              job.requestId,

            ticketNumber:
              job.ticketNumber ||
              "N/A",

            icon: Icon,

            vehicle:
              job.vehicleNumber ||
              "N/A",

            customer:
              job.customerName ||
              "Customer",

            contact:
              job.customerContact ||
              "N/A",

            vehicleType:
              [
                job.vehicleType,
                job.vehicleModel,
              ]
                .filter(
                  Boolean
                )
                .join(" ") ||
              "N/A",

            technician:
              job.technicianName ||
              "Not Assigned",

            entry:
              job.startTime
                ? formatTime(
                    job.startTime
                  )
                : "Not Started",

            completion:
              job.estimatedCompletionTime
                ? formatTime(
                    job.estimatedCompletionTime
                  )
                : "Not Set",

            status:
              displayStatus,

            serviceType:
              job.jobType ||
              "GENERAL SERVICE",

            extensionRequests:
              job.timeExtended
                ? "01"
                : "00",

            extensionMinutes:
              Number(
                job.totalExtensionMinutes
              ) || 0,

            extensionReason:
              job.latestExtensionReason ||
              "",

            notes:
              job.latestExtensionReason ||
              job.remarks ||
              "No service notes available.",

            color,
          };
        }
      );
    }, [dashboardData]);

  // ======================================================
  // SEARCH
  // ======================================================

  const normalizeText = (
    text
  ) =>
    String(text)
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        ""
      );

  const filteredVehicles =
    useMemo(() => {
      if (
        !searchText.trim()
      ) {
        return vehicles;
      }

      const search =
        normalizeText(
          searchText
        );

      return vehicles.filter(
        (item) => {
          const rowData =
            normalizeText(
              `${item.vehicle} ${item.customer} ${item.vehicleType} ${item.technician} ${item.entry} ${item.completion} ${item.status} ${item.serviceType} ${item.ticketNumber}`
            );

          return rowData.includes(
            search
          );
        }
      );
    }, [
      vehicles,
      searchText,
    ]);

  // ======================================================
  // STATUS STYLES
  // ======================================================

  const statusStyle = {
    cyan:
      "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",

    amber:
      "bg-amber-500/10 text-amber-400 border-amber-500/30",

    red:
      "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const iconStyle = {
    cyan:
      "text-cyan-400 border-cyan-500/20",

    amber:
      "text-amber-400 border-amber-500/20",

    red:
      "text-red-400 border-red-500/20",
  };

  // ======================================================
  // ACTIONS
  // ======================================================

  const handleActionMenu =
    (jobId) => {
      setOpenActionMenu(
        openActionMenu ===
          jobId
          ? null
          : jobId
      );
    };

  const handleViewDetails =
    (vehicle) => {
      setSelectedVehicle(
        vehicle
      );

      setOpenActionMenu(
        null
      );
    };

  const closeDetailsModal =
    () => {
      setSelectedVehicle(
        null
      );
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-8 py-4 md:py-0 relative z-20">

        <div className="flex items-center gap-3 w-full md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu
              size={20}
            />
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
                  event.target
                    .value
                )
              }
              placeholder="Search vehicle number..."
              autoComplete="off"
              className="w-full bg-transparent outline-none border-none text-sm text-white placeholder:text-gray-500"
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
            OWNER HEADER
        ================================================== */}

        <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:justify-end md:gap-5">

          <div className="relative">
            <button
              type="button"
              onClick={handleNotificationBell}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Open notifications"
            >
              <Bell size={18} />

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-[80] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#191923] shadow-2xl sm:w-96">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Notifications
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                      Live dashboard alerts
                    </p>
                  </div>

                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
                    >
                      MARK ALL READ
                    </button>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {notificationLoading && notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notificationError && notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-red-300">
                      {notificationError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-gray-500">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.notificationId}
                        type="button"
                        onClick={() => markNotificationRead(notification)}
                        className={`w-full border-b border-white/5 px-4 py-4 text-left transition hover:bg-white/5 ${
                          notification.isRead
                            ? "bg-transparent"
                            : "bg-cyan-500/[0.06]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-gray-700"
                                : notification.priority === "HIGH"
                                ? "bg-red-400"
                                : notification.priority === "LOW"
                                ? "bg-gray-400"
                                : "bg-amber-400"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={`text-xs ${
                                  notification.isRead
                                    ? "font-medium text-gray-300"
                                    : "font-bold text-white"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.isRead && (
                                <span className="shrink-0 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[8px] font-bold text-cyan-400">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-[11px] leading-5 text-gray-400">
                              {notification.message}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[9px] uppercase tracking-wider text-gray-600">
                                {notification.notificationType}
                              </span>

                              <span className="text-[9px] text-gray-700">
                                •
                              </span>

                              <span className="text-[9px] text-gray-600">
                                {formatNotificationTime(notification)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px shrink-0 bg-white/10" />

          <div className="min-w-0 flex-1 text-right md:flex-none">
            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-gray-500 md:max-w-[260px]">
              {garageName}
            </p>
          </div>

          <div className="h-9 w-9 min-h-9 min-w-9 shrink-0 overflow-hidden rounded-full border border-indigo-400 bg-[#0b0b12] text-xs flex items-center justify-center">
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

        <p className="text-gray-700 font-bold tracking-widest text-xs md:text-sm mb-4">
          PAGE HEADER
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>

            <h1 className="text-xl md:text-2xl font-bold mb-2">
              LIVE WORKSPACE ANALYTICS
            </h1>

            <p className="text-gray-400 mb-8 text-sm md:text-base">
              Real-time macro workload control room and workshop queue tracking.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-400">
              LIVE · 5 SEC REFRESH
            </span>

            <button
              type="button"
              onClick={() =>
                loadDashboardData(
                  garageId,
                  true
                )
              }
              disabled={
                dashboardLoading ||
                !Number.isInteger(
                  garageId
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh dashboard"
            >

              <RefreshCw
                size={15}
                className={
                  dashboardLoading
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

          </div>

        </div>

        {/* ==================================================
            ERRORS
        ================================================== */}

        {ownerError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {dashboardError}
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-8 mb-8">

          {/* GLOBAL WORKLOAD */}

          <div className="bg-[#1b1b26] border border-white/10 p-5 md:p-8 shadow-xl rounded-lg w-full md:w-[450px]">

            <div className="flex justify-between items-start mb-8">

              <div>

                <p className="text-xs text-gray-500 tracking-widest">
                  Global Workload Score
                </p>

                <p className="mt-2 text-[10px] text-gray-600">
                  Active repair workload
                </p>

              </div>

              <TrendingUp
                size={15}
                className="text-emerald-400"
              />

            </div>

            <h2 className="text-3xl md:text-4xl font-mono text-emerald-400 mb-6">

              {dashboardLoading &&
              !dashboardData
                ? "--"
                : globalWorkloadMinutes}{" "}
              Mins

            </h2>

            <div className="flex items-center gap-3">

              <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">

                <div
                  className="h-1 bg-emerald-400 rounded transition-all duration-500"
                  style={{
                    width: `${workloadPercentage}%`,
                  }}
                />

              </div>

              <span className="text-[10px] text-gray-400 tracking-widest whitespace-nowrap">
                {workloadLevel}
              </span>

            </div>

          </div>

          {/* ACTIVE VEHICLES */}

          <div className="bg-[#1b1b26] border border-white/10 p-5 md:p-8 shadow-xl rounded-lg w-full md:w-[450px]">

            <div className="flex justify-between items-start mb-8">

              <div>

                <p className="text-xs text-gray-500 tracking-widest">
                  Active Vehicles Inside Bays
                </p>

                <p className="mt-2 text-[10px] text-gray-600">
                  Current in-progress repairs
                </p>

              </div>

              <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-1 rounded">

                ●{" "}
                {
                  occupancyPercentage
                }
                %

              </span>

            </div>

            <h2 className="text-3xl md:text-4xl font-mono text-cyan-400 mb-4">

              {dashboardLoading &&
              !dashboardData
                ? "-- / --"
                : `${activeVehicles} / ${totalBays}`}

            </h2>

            <h3 className="text-3xl md:text-4xl font-mono text-cyan-400 mb-6">
              Vehicles
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">

                <p className="text-lg font-mono text-cyan-400">
                  {activeVehicles}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-600">
                  Active
                </p>

              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">

                <p className="text-lg font-mono text-amber-400">
                  {assignedVehicles}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-600">
                  Assigned
                </p>

              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">

                <p className="text-lg font-mono text-white">
                  {totalLiveJobs}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-600">
                  Live Jobs
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <p className="text-gray-700 font-bold tracking-widest text-xs md:text-sm mb-4">
          MASTER DATA TABLE MODULE
        </p>

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-visible max-w-6xl">

          <div className="p-5 md:p-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg">

            <h2 className="text-lg md:text-xl mb-2">
              Master Workload & Vehicle State Matrix
            </h2>

            <p className="text-xs text-gray-400">
              Search by vehicle number, technician, time, or status.
            </p>

          </div>

          <div className="overflow-x-auto overflow-y-visible">

            <table className="w-[900px] md:w-full text-left">

              <thead className="text-gray-500 text-xs tracking-widest">

                <tr className="border-b border-white/10">

                  <th className="px-5 md:px-8 py-5"></th>

                  <th className="px-4 py-5">
                    Vehicle Number
                  </th>

                  <th className="px-4 py-5">
                    Assigned Technician
                  </th>

                  <th className="px-4 py-5">
                    Entry Time
                  </th>

                  <th className="px-4 py-5">
                    Expected Completion
                  </th>

                  <th className="px-4 py-5">
                    Status
                  </th>

                  <th className="px-4 py-5">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {dashboardLoading &&
                !dashboardData ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-8 py-12 text-center text-gray-500 text-xs tracking-widest"
                    >
                      LOADING LIVE WORKLOAD...
                    </td>

                  </tr>

                ) : filteredVehicles.length >
                  0 ? (

                  filteredVehicles.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <tr
                          key={
                            item.jobId ||
                            item.vehicle
                          }
                          className="border-b border-white/5 hover:bg-white/[0.03] transition"
                        >

                          <td className="px-5 md:px-8 py-6">

                            <div
                              className={`w-8 h-8 border flex items-center justify-center rounded ${
                                iconStyle[
                                  item.color
                                ]
                              }`}
                            >
                              <Icon
                                size={14}
                              />
                            </div>

                          </td>

                          <td className="px-4 py-6 font-mono text-sm text-white">
                            {
                              item.vehicle
                            }
                          </td>

                          <td className="px-4 py-6 text-sm text-gray-300">
                            {
                              item.technician
                            }
                          </td>

                          <td className="px-4 py-6 font-mono text-sm text-gray-300">
                            {
                              item.entry
                            }
                          </td>

                          <td className="px-4 py-6 font-mono text-sm text-gray-300">
                            {
                              item.completion
                            }
                          </td>

                          <td className="px-4 py-6">

                            <span
                              className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${
                                statusStyle[
                                  item.color
                                ]
                              }`}
                            >
                              {
                                item.status
                              }
                            </span>

                          </td>

                          <td className="px-4 py-6 relative">

                            <button
                              type="button"
                              onClick={() =>
                                handleActionMenu(
                                  item.jobId
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
                              aria-label={`Open actions for ${item.vehicle}`}
                            >
                              <MoreVertical
                                size={17}
                              />
                            </button>

                            {openActionMenu ===
                              item.jobId && (

                              <div className="absolute right-6 top-14 z-40 w-40 bg-[#22222d] border border-white/10 rounded-lg shadow-2xl overflow-hidden">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewDetails(
                                      item
                                    )
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition"
                                >

                                  <Eye
                                    size={16}
                                    className="text-cyan-400"
                                  />

                                  View Details

                                </button>

                              </div>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-8 py-12 text-center text-gray-500 text-xs tracking-widest"
                    >

                      {searchText
                        ? "NO VEHICLE FOUND"
                        : "NO ACTIVE OR ASSIGNED VEHICLES"}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          <div className="h-10 md:h-20 border-t border-white/10" />

        </div>

      </main>

      {/* ==================================================
          VEHICLE DETAILS MODAL
      ================================================== */}

      {selectedVehicle && (

        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={
            closeDetailsModal
          }
        >

          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#171721] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="sticky top-0 z-10 bg-[#171721] border-b border-white/10 px-5 md:px-7 py-5 flex items-center justify-between">

              <div>

                <p className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] uppercase mb-1">
                  Vehicle Service Details
                </p>

                <h2 className="text-xl md:text-2xl font-bold">
                  {
                    selectedVehicle.vehicle
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeDetailsModal
                }
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close vehicle details"
              >
                <X
                  size={18}
                />
              </button>

            </div>

            <div className="p-5 md:p-7">

              <div className="flex flex-wrap items-center gap-3 mb-7">

                <span
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest ${
                    statusStyle[
                      selectedVehicle.color
                    ]
                  }`}
                >
                  {
                    selectedVehicle.status
                  }
                </span>

                {selectedVehicle.extensionMinutes >
                  0 && (

                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-amber-400">

                    +
                    {
                      selectedVehicle.extensionMinutes
                    }{" "}
                    MINS EXTENDED

                  </span>

                )}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <DetailCard
                  icon={Car}
                  label="Vehicle Number"
                  value={
                    selectedVehicle.vehicle
                  }
                />

                <DetailCard
                  icon={Car}
                  label="Vehicle Type"
                  value={
                    selectedVehicle.vehicleType
                  }
                />

                <DetailCard
                  icon={User}
                  label="Customer Name"
                  value={
                    selectedVehicle.customer
                  }
                />

                <DetailCard
                  icon={User}
                  label="Contact Number"
                  value={
                    selectedVehicle.contact
                  }
                />

                <DetailCard
                  icon={Wrench}
                  label="Assigned Technician"
                  value={
                    selectedVehicle.technician
                  }
                />

                <DetailCard
                  icon={Wrench}
                  label="Service Type"
                  value={
                    selectedVehicle.serviceType
                  }
                />

                <DetailCard
                  icon={Clock}
                  label="Entry Time"
                  value={
                    selectedVehicle.entry
                  }
                />

                <DetailCard
                  icon={Clock}
                  label="Expected Completion"
                  value={
                    selectedVehicle.completion
                  }
                />

                <DetailCard
                  icon={Clock}
                  label="Extension Requests"
                  value={
                    selectedVehicle.extensionRequests
                  }
                />

                <DetailCard
                  icon={FileText}
                  label="Ticket Number"
                  value={
                    selectedVehicle.ticketNumber
                  }
                />

              </div>

              {selectedVehicle.extensionMinutes >
                0 && (

                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    Time Extension
                  </p>

                  <p className="mt-2 text-sm text-white">

                    +
                    {
                      selectedVehicle.extensionMinutes
                    }{" "}
                    minutes

                  </p>

                  {selectedVehicle.extensionReason && (

                    <p className="mt-2 text-xs leading-5 text-gray-400">

                      Reason:{" "}
                      {
                        selectedVehicle.extensionReason
                      }

                    </p>

                  )}

                </div>

              )}

              <div className="mt-4 bg-[#20202b] border border-white/10 rounded-xl p-4">

                <div className="flex items-center gap-2 mb-3">

                  <FileText
                    size={16}
                    className="text-cyan-400"
                  />

                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    Service Notes
                  </p>

                </div>

                <p className="text-sm text-gray-300 leading-6">
                  {
                    selectedVehicle.notes
                  }
                </p>

              </div>

              <div className="mt-7 flex justify-end">

                <button
                  type="button"
                  onClick={
                    closeDetailsModal
                  }
                  className="px-6 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// ======================================================
// DETAIL CARD
// ======================================================

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="bg-[#20202b] border border-white/10 rounded-xl p-4">

      <div className="flex items-center gap-2 mb-2">

        <Icon
          size={15}
          className="text-cyan-400"
        />

        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.18em]">
          {label}
        </p>

      </div>

      <p className="text-sm text-white break-words">
        {value || "N/A"}
      </p>

    </div>
  );
}