import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

export default function TechnicianNotifications({
  onNavigate,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  // ======================================================
  // GET LOGGED-IN TECHNICIAN ID
  // ======================================================

  const getLoggedInTechnicianId = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      const staffUser =
        JSON.parse(storedStaffUser);

      if (
        String(
          staffUser?.role || ""
        )
          .trim()
          .toLowerCase() !==
        "technician"
      ) {
        return null;
      }

      const technicianId =
        Number(
          staffUser?.staffId ??
            staffUser?.staff_id ??
            staffUser?.technicianId ??
            staffUser?.technician_id
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
    } catch (error) {
      console.error(
        "Read technician notification session error:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // LOAD TECHNICIAN NOTIFICATIONS
  // ======================================================

  const loadTechnicianNotifications =
    async () => {
      try {
        const technicianId =
          getLoggedInTechnicianId();

        if (!technicianId) {
          setNotifications([]);
          setUnreadNotificationCount(0);
          return;
        }

        setNotificationsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/notifications/technician/${technicianId}`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load technician notifications."
          );
        }

        const loadedNotifications =
          Array.isArray(
            result.notifications
          )
            ? result.notifications
            : [];

        setNotifications(
          loadedNotifications
        );

        setUnreadNotificationCount(
          Number(
            result.unreadCount
          ) || 0
        );
      } catch (error) {
        console.error(
          "Load technician notifications error:",
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

  // ======================================================
  // MARK ONE AS READ
  // ======================================================

  const markNotificationAsRead =
    async (notificationId) => {
      try {
        const id =
          Number(notificationId);

        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/notifications/${id}/read`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },
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
              (notification) =>
                Number(
                  notification.notificationId
                ) === id
                  ? {
                      ...notification,
                      isRead: true,
                    }
                  : notification
            )
        );

        setUnreadNotificationCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      } catch (error) {
        console.error(
          "Mark technician notification read error:",
          error
        );
      }
    };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const markAllAsRead =
    async () => {
      try {
        const technicianId =
          getLoggedInTechnicianId();

        if (!technicianId) {
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/notifications/technician/${technicianId}/read-all`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({}),
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
              "Unable to mark all notifications as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        setUnreadNotificationCount(0);
      } catch (error) {
        console.error(
          "Mark all technician notifications read error:",
          error
        );
      }
    };

  // ======================================================
  // CLICK NOTIFICATION
  // ======================================================

  const handleNotificationClick =
    async (notification) => {
      if (!notification) {
        return;
      }

      if (!notification.isRead) {
        await markNotificationAsRead(
          notification.notificationId
        );
      }

      setShowNotifications(false);

      const targetPage =
        String(
          notification.targetPage ||
            "technician-intake"
        )
          .trim()
          .toLowerCase();

      if (
        targetPage ===
          "technician-intake" ||
        notification.notificationType ===
          "NEW_JOB_ASSIGNED"
      ) {
        onNavigate?.(
          "technician-intake"
        );

        return;
      }

      onNavigate?.(targetPage);
    };

  // ======================================================
  // DATE + TIME
  // ======================================================

  const formatDateTime = (
    notification
  ) => {
    if (!notification) {
      return "";
    }

    const date =
      notification.createdDate ||
      "";

    const time =
      String(
        notification.createdTime ||
          ""
      )
        .split(".")[0]
        .slice(0, 5);

    return [date, time]
      .filter(Boolean)
      .join(" • ");
  };

  // ======================================================
  // AUTO REFRESH
  // ======================================================

  useEffect(() => {
    loadTechnicianNotifications();

    const intervalId =
      window.setInterval(
        () => {
          loadTechnicianNotifications();
        },
        5000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, []);

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Technician Notifications"
        onClick={() =>
          setShowNotifications(
            (previous) =>
              !previous
          )
        }
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0a0d14] text-slate-400 transition hover:border-indigo-500/50 hover:text-white"
      >
        <Bell size={17} />

        {unreadNotificationCount >
          0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
            {unreadNotificationCount >
            99
              ? "99+"
              : unreadNotificationCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-12 z-[500] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700 bg-[#0f1420] shadow-2xl shadow-black/50 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">
                Notifications
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {
                  unreadNotificationCount
                }{" "}
                unread
              </p>
            </div>

            {unreadNotificationCount >
              0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 transition hover:text-indigo-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notificationsLoading &&
            notifications.length ===
              0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length >
              0 ? (
              notifications.map(
                (notification) => (
                  <button
                    key={
                      notification.notificationId
                    }
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`w-full border-b border-slate-800/70 px-4 py-4 text-left transition last:border-b-0 hover:bg-indigo-500/5 ${
                      notification.isRead
                        ? "bg-transparent"
                        : "bg-indigo-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          notification.isRead
                            ? "bg-slate-700"
                            : "bg-indigo-400"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-black text-white">
                            {notification.title ||
                              "Notification"}
                          </p>

                          {!notification.isRead && (
                            <span className="shrink-0 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-300">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                          {notification.message ||
                            "You have a new notification."}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[9px] text-slate-600">
                            {formatDateTime(
                              notification
                            )}
                          </span>

                          {notification.targetPage ===
                            "technician-intake" && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                              Open Vehicle
                              Intake
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )
            ) : (
              <div className="px-5 py-10 text-center">
                <Bell
                  size={28}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-xs font-bold text-slate-400">
                  No notifications yet
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  New vehicle
                  assignments will
                  appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}