import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  Bell,
  Building2,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  History,
  Inbox,
  MapPin,
  Route,
  Search,
  Truck,
  X,
} from "lucide-react";

// ======================================================
// CONFIG
// ======================================================

const API_BASE = "http://localhost:5000/api";
const POLLING_INTERVAL = 3000;
const RECENT_NOTIFICATION_LIMIT = 8;

// ======================================================
// SAFE JSON PARSE
// ======================================================

const safeJsonParse = (
  value,
  fallback = null
) => {
  try {
    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
};

// ======================================================
// NORMALISE NOTIFICATION
// ======================================================

const normaliseNotification = (
  item
) => ({
  notificationId:
    item?.notificationId ??
    item?.notification_id ??
    null,

  garageId:
    item?.garageId ??
    item?.garage_id ??
    null,

  driverId:
    item?.driverId ??
    item?.truck_driver_driver_id ??
    null,

  customerId:
    item?.customerId ??
    item?.customer_customer_id ??
    null,

  assistanceId:
    item?.assistanceId ??
    item?.assistance_assistance_id ??
    null,

  notificationType:
    item?.notificationType ??
    item?.notification_type ??
    "",

  title:
    item?.title ||
    "Notification",

  message:
    item?.message ||
    "",

  targetPage:
    item?.targetPage ??
    item?.target_page ??
    "",

  referenceId:
    item?.referenceId ??
    item?.reference_id ??
    null,

  priority:
    String(
      item?.priority ||
      "MEDIUM"
    ).toUpperCase(),

  isRead: Boolean(
    item?.isRead ??
    item?.is_read
  ),

  createdDate:
    item?.createdDate ??
    item?.created_date ??
    "",

  createdTime:
    item?.createdTime ??
    item?.created_time ??
    "",
});

// ======================================================
// RESOLVE CUSTOMER ID
// ======================================================

const resolveStoredCustomerId =
  () => {
    const latestRequest =
      safeJsonParse(
        sessionStorage.getItem(
          "latestServiceRequest"
        ),
        {}
      );

    const currentRequest =
      safeJsonParse(
        localStorage.getItem(
          "currentCustomerRequest"
        ),
        {}
      );

    const possibleId =
      latestRequest?.customerId ??
      latestRequest?.customer_id ??
      latestRequest
        ?.customer_customer_id ??
      currentRequest?.customerId ??
      currentRequest?.customer_id ??
      currentRequest
        ?.customer_customer_id;

    const customerId =
      Number(possibleId);

    return Number.isInteger(
      customerId
    ) &&
      customerId > 0
      ? customerId
      : null;
  };

// ======================================================
// DATE TIME FORMAT
// ======================================================

const formatNotificationDateTime =
  (notification) => {
    const datePart =
      notification?.createdDate ||
      "";

    const timePart =
      notification?.createdTime ||
      "";

    if (!datePart) {
      return "Time unavailable";
    }

    const rawDate =
      typeof datePart === "string"
        ? datePart.slice(0, 10)
        : datePart;

    const value =
      new Date(
        `${rawDate}T${
          timePart || "00:00:00"
        }`
      );

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return `${rawDate} ${timePart}`.trim();
    }

    return value.toLocaleString(
      "en-LK",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

// ======================================================
// RELATIVE TIME
// ======================================================

const getRelativeTime = (
  notification
) => {
  const datePart =
    notification?.createdDate;

  const timePart =
    notification?.createdTime;

  if (!datePart) {
    return "";
  }

  const rawDate =
    typeof datePart === "string"
      ? datePart.slice(0, 10)
      : datePart;

  const value =
    new Date(
      `${rawDate}T${
        timePart || "00:00:00"
      }`
    );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    value.getTime();

  const seconds =
    Math.floor(
      difference / 1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
};

// ======================================================
// NOTIFICATION ICON
// ======================================================

const getNotificationIcon = (
  type
) => {
  const value =
    String(type || "")
      .trim()
      .toUpperCase();

  if (
    value.includes(
      "REQUEST_ACCEPTED"
    )
  ) {
    return CheckCircle2;
  }

  if (
    value.includes(
      "EN_ROUTE_TO_CUSTOMER"
    ) ||
    value.includes(
      "JOURNEY_STARTED"
    )
  ) {
    return Truck;
  }

  if (
    value.includes(
      "ARRIVED_CUSTOMER"
    ) ||
    value.includes(
      "ARRIVED_AT_CUSTOMER"
    )
  ) {
    return MapPin;
  }

  if (
    value.includes(
      "EN_ROUTE_TO_GARAGE"
    ) ||
    value.includes(
      "GARAGE_JOURNEY"
    )
  ) {
    return Route;
  }

  if (
    value.includes(
      "ARRIVED_GARAGE"
    ) ||
    value.includes(
      "ARRIVED_AT_GARAGE"
    )
  ) {
    return Building2;
  }

  return Bell;
};

// ======================================================
// NOTIFICATION ACCENT
// ======================================================

const getNotificationAccentClass =
  (type) => {
    const value =
      String(type || "")
        .trim()
        .toUpperCase();

    if (
      value.includes(
        "REQUEST_ACCEPTED"
      )
    ) {
      return (
        "border-emerald-500/30 " +
        "bg-emerald-500/10 " +
        "text-emerald-300"
      );
    }

    if (
      value.includes(
        "EN_ROUTE_TO_CUSTOMER"
      ) ||
      value.includes(
        "JOURNEY_STARTED"
      )
    ) {
      return (
        "border-cyan-500/30 " +
        "bg-cyan-500/10 " +
        "text-cyan-300"
      );
    }

    if (
      value.includes(
        "ARRIVED_CUSTOMER"
      ) ||
      value.includes(
        "ARRIVED_AT_CUSTOMER"
      )
    ) {
      return (
        "border-violet-500/30 " +
        "bg-violet-500/10 " +
        "text-violet-300"
      );
    }

    if (
      value.includes(
        "EN_ROUTE_TO_GARAGE"
      ) ||
      value.includes(
        "GARAGE_JOURNEY"
      )
    ) {
      return (
        "border-sky-500/30 " +
        "bg-sky-500/10 " +
        "text-sky-300"
      );
    }

    if (
      value.includes(
        "ARRIVED_GARAGE"
      ) ||
      value.includes(
        "ARRIVED_AT_GARAGE"
      )
    ) {
      return (
        "border-emerald-500/30 " +
        "bg-emerald-500/10 " +
        "text-emerald-300"
      );
    }

    return (
      "border-slate-700 " +
      "bg-slate-800/80 " +
      "text-slate-300"
    );
  };

// ======================================================
// CUSTOMER-FRIENDLY NOTIFICATION ACTION
// ======================================================

const getCustomerNotificationAction = (notification) => {
  const type = String(
    notification?.notificationType || ""
  )
    .trim()
    .toUpperCase();

  const originalTarget = String(
    notification?.targetPage || ""
  )
    .trim()
    .toLowerCase();

  // Tow truck is travelling / has reached the customer:
  // customer should be taken to the live tow tracking page.
  if (
    type.includes("EN_ROUTE_TO_CUSTOMER") ||
    type.includes("JOURNEY_STARTED") ||
    type.includes("ARRIVED_CUSTOMER") ||
    type.includes("ARRIVED_AT_CUSTOMER") ||
    type.includes("EN_ROUTE_TO_GARAGE") ||
    type.includes("GARAGE_JOURNEY")
  ) {
    return {
      targetPage: "track-tow",
      label: "Track Tow Truck",
    };
  }

  // Tow request accepted:
  // keep the customer in the recovery flow where the
  // accepted truck/driver information can be reviewed.
  if (type.includes("REQUEST_ACCEPTED")) {
    return {
      targetPage: "mobility",
      label: "View Tow Details",
    };
  }

  // Once the tow reaches the garage, the customer should
  // continue with the garage/service flow rather than
  // being sent back to tow tracking.
  if (
    type.includes("ARRIVED_GARAGE") ||
    type.includes("ARRIVED_AT_GARAGE")
  ) {
    return {
      targetPage: "progress",
      label: "View Service Progress",
    };
  }

  // Known service-flow targets from the backend.
  if (
    originalTarget === "track-tow" ||
    originalTarget === "tow-assignments"
  ) {
    return {
      targetPage: "track-tow",
      label: "Track Tow Truck",
    };
  }

  if (
    originalTarget === "mobility-recovery" ||
    originalTarget === "mobility"
  ) {
    return {
      targetPage: "mobility",
      label: "Open Recovery",
    };
  }

  if (
    originalTarget === "live-progress" ||
    originalTarget === "progress"
  ) {
    return {
      targetPage: "progress",
      label: "View Live Progress",
    };
  }

  if (
    originalTarget === "invoice" ||
    originalTarget === "invoice-ledger"
  ) {
    return {
      targetPage: "invoice",
      label: "View Invoice",
    };
  }

  if (
    originalTarget === "audit" ||
    originalTarget === "feedback"
  ) {
    return {
      targetPage: "audit",
      label: "Open Feedback",
    };
  }

  return {
    targetPage: originalTarget,
    label: originalTarget ? "Open Update" : "",
  };
};

// ======================================================
// COMPONENT
// ======================================================

export default function CustomerNotificationBell({
  customerId: providedCustomerId = null,
  onNavigateTarget,
}) {
  const customerId =
    useMemo(() => {
      const provided =
        Number(
          providedCustomerId
        );

      if (
        Number.isInteger(
          provided
        ) &&
        provided > 0
      ) {
        return provided;
      }

      return resolveStoredCustomerId();
    }, [providedCustomerId]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    panelOpen,
    setPanelOpen,
  ] = useState(false);

  const [
    viewAllOpen,
    setViewAllOpen,
  ] = useState(false);

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState(null);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    filterType,
    setFilterType,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    toasts,
    setToasts,
  ] = useState([]);

  const shownNotificationIdsRef =
    useRef(new Set());

  const toastTimersRef =
    useRef(new Map());

  const hasLoadedOnceRef =
    useRef(false);

  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications =
    async (
      showNewToasts = true
    ) => {
      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0
      ) {
        return;
      }

      try {
        if (
          !hasLoadedOnceRef.current
        ) {
          setLoading(true);
        }

        setError("");

        const response =
          await fetch(
            `${API_BASE}/notifications/customer/${customerId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load notifications."
          );
        }

        const items =
          Array.isArray(
            result.notifications
          )
            ? result.notifications.map(
                normaliseNotification
              )
            : [];

        setNotifications(items);

        setUnreadCount(
          Number(
            result.unreadCount ??
              items.filter(
                (item) =>
                  !item.isRead
              ).length
          )
        );

        if (
          showNewToasts &&
          hasLoadedOnceRef.current
        ) {
          items
            .filter(
              (item) =>
                !item.isRead &&
                !shownNotificationIdsRef
                  .current
                  .has(
                    Number(
                      item.notificationId
                    )
                  )
            )
            .slice()
            .reverse()
            .forEach(
              showNotificationToast
            );
        }

        items.forEach(
          (item) => {
            const id =
              Number(
                item.notificationId
              );

            if (
              Number.isInteger(id) &&
              id > 0
            ) {
              shownNotificationIdsRef
                .current
                .add(id);
            }
          }
        );

        hasLoadedOnceRef.current =
          true;
      } catch (loadError) {
        console.error(
          "Customer notification load error:",
          loadError
        );

        setError(
          loadError.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    };
      // ====================================================
  // TOAST
  // ====================================================

  const showNotificationToast =
    (notification) => {
      const id =
        Number(
          notification
            ?.notificationId
        );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return;
      }

      setToasts(
        (previous) => [
          notification,
          ...previous.filter(
            (item) =>
              Number(
                item.notificationId
              ) !== id
          ),
        ].slice(0, 4)
      );

      const existingTimer =
        toastTimersRef
          .current
          .get(id);

      if (existingTimer) {
        window.clearTimeout(
          existingTimer
        );
      }

      const timeoutId =
        window.setTimeout(
          () => {
            dismissToast(id);
          },
          8000
        );

      toastTimersRef
        .current
        .set(
          id,
          timeoutId
        );
    };

  const dismissToast =
    (notificationId) => {
      const id =
        Number(notificationId);

      setToasts(
        (previous) =>
          previous.filter(
            (item) =>
              Number(
                item.notificationId
              ) !== id
          )
      );

      const timer =
        toastTimersRef
          .current
          .get(id);

      if (timer) {
        window.clearTimeout(
          timer
        );

        toastTimersRef
          .current
          .delete(id);
      }
    };

  // ====================================================
  // MARK ONE NOTIFICATION AS READ
  // ====================================================

  const markNotificationRead =
    async (
      notificationId
    ) => {
      const id =
        Number(notificationId);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return false;
      }

      const existing =
        notifications.find(
          (item) =>
            Number(
              item.notificationId
            ) === id
        );

      if (existing?.isRead) {
        return true;
      }

      try {
        const response =
          await fetch(
            `${API_BASE}/notifications/${id}/read`,
            {
              method: "PUT",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to mark notification as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                Number(
                  item.notificationId
                ) === id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
            )
        );

        setUnreadCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );

        return true;
      } catch (readError) {
        console.error(
          "Mark customer notification read error:",
          readError
        );

        return false;
      }
    };

  // ====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ====================================================

  const markAllRead =
    async () => {
      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0 ||
        unreadCount <= 0
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE}/notifications/customer/${customerId}/read-all`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({}),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to mark notifications as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (readError) {
        console.error(
          "Mark all customer notifications read error:",
          readError
        );
      }
    };

  // ====================================================
  // OPEN NOTIFICATION DETAILS
  // ====================================================

  const openDetails =
    async (
      notification
    ) => {
      if (
        !notification?.isRead
      ) {
        await markNotificationRead(
          notification
            .notificationId
        );
      }

      dismissToast(
        notification
          .notificationId
      );

      setSelectedNotification({
        ...notification,
        isRead: true,
      });

      setPanelOpen(false);
    };

  // ====================================================
  // TARGET NAVIGATION
  // ====================================================

  const handleOpenTarget =
    () => {
      if (
        !selectedNotification
      ) {
        return;
      }

      const action =
        getCustomerNotificationAction(
          selectedNotification
        );

      const target =
        String(
          action.targetPage || ""
        )
          .trim()
          .toLowerCase();

      setSelectedNotification(
        null
      );

      setViewAllOpen(false);
      setPanelOpen(false);

      if (
        target &&
        typeof onNavigateTarget ===
          "function"
      ) {
        onNavigateTarget(
          target,
          selectedNotification
        );
      }
    };

  // ====================================================
  // POLLING
  // ====================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        customerId
      ) ||
      customerId <= 0
    ) {
      return undefined;
    }

    loadNotifications(false);

    const intervalId =
      window.setInterval(
        () => {
          loadNotifications(true);
        },
        POLLING_INTERVAL
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [customerId]);

  // ====================================================
  // CLEANUP TOAST TIMERS
  // ====================================================

  useEffect(() => {
    return () => {
      toastTimersRef
        .current
        .forEach(
          (timer) =>
            window.clearTimeout(
              timer
            )
        );

      toastTimersRef
        .current
        .clear();
    };
  }, []);

  // ====================================================
  // FILTERED NOTIFICATIONS
  // ====================================================

  const filteredNotifications =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          if (
            filterType ===
              "unread" &&
            notification.isRead
          ) {
            return false;
          }

          if (
            filterType ===
              "read" &&
            !notification.isRead
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable =
            [
              notification.title,
              notification.message,
              notification
                .notificationType,
              notification
                .referenceId,
              notification
                .priority,
            ]
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      notifications,
      searchText,
      filterType,
    ]);

  const recentNotifications =
    notifications.slice(
      0,
      RECENT_NOTIFICATION_LIMIT
    );

  // ====================================================
  // NO CUSTOMER ID
  // ====================================================

  if (
    !Number.isInteger(
      customerId
    ) ||
    customerId <= 0
  ) {
    return (
      <button
        type="button"
        disabled
        title="Customer notification account is not available yet."
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-600"
      >
        <Bell className="h-5 w-5" />
      </button>
    );
  }

  // ====================================================
  // RENDER NOTIFICATION ITEM
  // ====================================================

  const renderNotificationItem =
    (
      notification,
      compact = false
    ) => {
      const Icon =
        getNotificationIcon(
          notification
            .notificationType
        );

      return (
        <button
          key={
            notification.notificationId
          }
          type="button"
          onClick={() =>
            openDetails(
              notification
            )
          }
          className={`group block w-full border-b border-slate-800/80 text-left transition last:border-b-0 hover:bg-white/[0.045] ${
            compact
              ? "p-3.5"
              : "p-4"
          } ${
            notification.isRead
              ? ""
              : "bg-cyan-500/[0.045]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 shrink-0 rounded-xl border p-2.5 ${getNotificationAccentClass(
                notification
                  .notificationType
              )}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p
                  className={`flex-1 font-black text-white ${
                    compact
                      ? "text-xs"
                      : "text-sm"
                  }`}
                >
                  {
                    notification.title
                  }
                </p>

                {!notification.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.75)]" />
                )}
              </div>

              <p
                className={`mt-1 leading-5 text-slate-400 ${
                  compact
                    ? "line-clamp-2 text-[11px]"
                    : "line-clamp-3 text-xs"
                }`}
              >
                {
                  notification.message
                }
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[9px] text-slate-600">
                  {getRelativeTime(
                    notification
                  )}
                </span>

                {notification.referenceId && (
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold text-cyan-400">
                    #
                    {
                      notification.referenceId
                    }
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-400" />
          </div>
        </button>
      );
    };

  // ====================================================
  // PORTAL HELPER
  // ====================================================

  const portalRoot =
    typeof document !== "undefined"
      ? document.body
      : null;

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <>
      {/* ==================================================
          NOTIFICATION BELL
      ================================================== */}

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setPanelOpen(
              (previous) =>
                !previous
            )
          }
          className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${
            panelOpen
              ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
              : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
          }`}
          aria-label="Customer notifications"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <>
              <span className="absolute -right-1 -top-1 z-20 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-lg">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>

              <span className="absolute -right-1 -top-1 z-10 h-5 w-5 animate-ping rounded-full bg-red-500/30" />
            </>
          )}
        </button>
      </div>

      {/* ==================================================
          EVERYTHING BELOW IS RENDERED DIRECTLY UNDER BODY.
          THIS PREVENTS PAGE / MODAL STACKING CONTEXTS FROM
          COVERING THE NOTIFICATION INTERFACE.
      ================================================== */}

      {portalRoot &&
        createPortal(
          <>
            {/* ==============================================
                NEW NOTIFICATION TOAST AREA
            ============================================== */}

            <div className="pointer-events-none fixed right-3 top-20 z-[2147483600] flex w-[min(390px,calc(100vw-1.5rem))] flex-col gap-3 sm:right-5">
              {toasts.map(
                (notification) => {
                  const Icon =
                    getNotificationIcon(
                      notification
                        .notificationType
                    );

                  return (
                    <div
                      key={`customer-toast-${notification.notificationId}`}
                      className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-700 bg-[#0c0d19]/95 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                    >
                      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

                      <div className="flex items-start gap-3 p-4">
                        <div
                          className={`rounded-xl border p-2.5 ${getNotificationAccentClass(
                            notification
                              .notificationType
                          )}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              notification
                            )
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black text-white">
                              {notification.title}
                            </p>

                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-300">
                              New
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                            View details
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            dismissToast(
                              notification
                                .notificationId
                            )
                          }
                          className="rounded-lg p-1 text-slate-600 transition hover:bg-white/5 hover:text-white"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* ==============================================
                RECENT NOTIFICATIONS PANEL
            ============================================== */}

            {panelOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() =>
                    setPanelOpen(false)
                  }
                  className="fixed inset-0 z-[2147483601] cursor-default bg-black/5"
                />

                <div className="fixed right-3 top-20 z-[2147483602] w-[min(400px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-700 bg-[#0c0d19] shadow-[0_25px_80px_rgba(0,0,0,0.75)] sm:right-5">
                  <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-500/[0.07] via-transparent to-violet-500/[0.07] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                          <Inbox className="h-4 w-4 text-cyan-300" />
                        </div>

                        <div>
                          <p className="text-sm font-black text-white">
                            Notifications
                          </p>

                          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                            Customer activity center
                          </p>
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-cyan-300 transition hover:bg-cyan-500/15"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark all
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-black/20 px-3 py-2">
                      <span className="text-[10px] text-slate-500">
                        {notifications.length} total
                      </span>

                      <span className="text-[10px] font-bold text-cyan-400">
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>

                  <div className="max-h-[min(410px,calc(100vh-190px))] overflow-y-auto overscroll-contain">
                    {loading &&
                    notifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                        <p className="mt-4 text-xs text-slate-500">
                          Loading notifications...
                        </p>
                      </div>
                    ) : error &&
                      notifications.length === 0 ? (
                      <div className="px-6 py-10 text-center">
                        <Bell className="mx-auto h-8 w-8 text-red-400/60" />

                        <p className="mt-4 text-sm font-bold text-red-300">
                          Unable to load notifications
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            loadNotifications(false)
                          }
                          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
                          <Bell className="h-6 w-6 text-slate-700" />
                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-400">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Tow dispatch and service updates will appear here.
                        </p>
                      </div>
                    ) : (
                      recentNotifications.map(
                        (notification) =>
                          renderNotificationItem(
                            notification,
                            true
                          )
                      )
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="border-t border-slate-800 p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPanelOpen(false);
                          setViewAllOpen(true);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 py-3 text-xs font-black text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
                      >
                        <History className="h-4 w-4" />
                        View All Notifications
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ==============================================
                VIEW ALL NOTIFICATIONS
            ============================================== */}

            {viewAllOpen && (
              <div className="fixed inset-0 z-[2147483603] overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-5">
                <div className="flex min-h-full items-center justify-center py-4">
                  <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#090b16] shadow-[0_35px_120px_rgba(0,0,0,0.85)] sm:max-h-[calc(100vh-2.5rem)]">
                    <div className="shrink-0 border-b border-slate-800 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-violet-500/[0.08] px-5 py-5 sm:px-7">
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                            <History className="h-5 w-5 text-cyan-300" />
                          </div>

                          <div>
                            <h2 className="text-xl font-black text-white sm:text-2xl">
                              Notification History
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                              Review all your service and tow updates.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setViewAllOpen(false)
                          }
                          className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-500 transition hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="rounded-xl border border-slate-800 bg-black/20 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                            Total
                          </p>
                          <p className="mt-1 text-lg font-black text-white">
                            {notifications.length}
                          </p>
                        </div>

                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">
                            Unread
                          </p>
                          <p className="mt-1 text-lg font-black text-cyan-300">
                            {unreadCount}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                            Read
                          </p>
                          <p className="mt-1 text-lg font-black text-emerald-300">
                            {Math.max(
                              0,
                              notifications.length -
                                unreadCount
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                          <input
                            type="text"
                            value={searchText}
                            onChange={(event) =>
                              setSearchText(
                                event.target.value
                              )
                            }
                            placeholder="Search notifications..."
                            className="w-full rounded-xl border border-slate-800 bg-black/30 py-3 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="flex gap-2">
                          {[
                            ["all", "All"],
                            ["unread", "Unread"],
                            ["read", "Read"],
                          ].map(
                            ([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setFilterType(value)
                                }
                                className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-wide transition ${
                                  filterType === value
                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                    : "border-slate-800 bg-slate-900 text-slate-500 hover:text-white"
                                }`}
                              >
                                {label}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                      {filteredNotifications.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                          <Inbox className="h-10 w-10 text-slate-800" />

                          <p className="mt-4 font-bold text-slate-400">
                            No matching notifications
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Try another search or filter.
                          </p>
                        </div>
                      ) : (
                        filteredNotifications.map(
                          (notification) =>
                            renderNotificationItem(
                              notification
                            )
                        )
                      )}
                    </div>

                    <div className="shrink-0 flex items-center justify-between gap-4 border-t border-slate-800 bg-[#0c0d19] px-5 py-4 sm:px-7">
                      <p className="text-[10px] text-slate-600">
                        Showing {filteredNotifications.length} notification(s)
                      </p>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-cyan-500"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Mark All Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================
                SIMPLE CUSTOMER NOTIFICATION DETAILS
            ============================================== */}

            {selectedNotification && (() => {
              const DetailIcon =
                getNotificationIcon(
                  selectedNotification.notificationType
                );

              const action =
                getCustomerNotificationAction(
                  selectedNotification
                );

              return (
                <div className="fixed inset-0 z-[2147483604] overflow-y-auto bg-black/90 p-3 backdrop-blur-md sm:p-5">
                  <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
                    <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-[#0c0d19] shadow-[0_35px_120px_rgba(0,0,0,0.9)]">
                      <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

                      <div className="p-5 sm:p-7">
                        <div className="flex items-start justify-between gap-5">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${getNotificationAccentClass(
                              selectedNotification.notificationType
                            )}`}
                          >
                            <DetailIcon className="h-6 w-6" />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedNotification(null)
                            }
                            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-500 transition hover:border-slate-700 hover:text-white"
                            aria-label="Close notification details"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-5">
                          <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">
                            {selectedNotification.title}
                          </h2>

                          <p className="mt-3 text-sm leading-6 text-slate-400 sm:leading-7">
                            {selectedNotification.message}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-800 bg-black/20 px-4 py-3.5">
                          <Clock3 className="h-4 w-4 shrink-0 text-cyan-400" />

                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
                              Update received
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-200">
                              {formatNotificationDateTime(
                                selectedNotification
                              )}
                            </p>
                          </div>
                        </div>

                        <div className={`mt-6 grid gap-3 ${action.targetPage ? "sm:grid-cols-2" : ""}`}>
                          {action.targetPage && (
                            <button
                              type="button"
                              onClick={handleOpenTarget}
                              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-500"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {action.label}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedNotification(null)
                            }
                            className="rounded-xl border border-slate-700 bg-slate-900 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>,
          portalRoot
        )}
    </>
  );
}