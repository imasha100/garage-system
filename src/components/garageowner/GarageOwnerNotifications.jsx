import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
} from "lucide-react";

export default function GarageOwnerNotifications({
  onNavigate,
}) {
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);

  const [
    notificationError,
    setNotificationError,
  ] = useState("");

  // ======================================================
  // GET LOGGED-IN GARAGE ID
  // ======================================================

  const getLoggedInGarageId = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        return null;
      }

      const staffUser =
        JSON.parse(
          storedStaffUser
        );

      const garageId =
        Number(
          staffUser?.garageId ??
          staffUser?.garage_id
        );

      if (
        !Number.isInteger(
          garageId
        ) ||
        garageId <= 0
      ) {
        return null;
      }

      return garageId;
    } catch (error) {
      console.error(
        "Read garage owner session error:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // LOAD ALL GARAGE NOTIFICATIONS
  // ======================================================

  const loadNotifications =
    async () => {
      const garageId =
        getLoggedInGarageId();

      if (!garageId) {
        setNotifications([]);
        return;
      }

      try {
        setNotificationLoading(
          true
        );

        setNotificationError(
          ""
        );

        const response =
          await fetch(
            `http://localhost:5000/api/notifications/garage/${garageId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load garage notifications."
          );
        }

        setNotifications(
          Array.isArray(
            result.notifications
          )
            ? result.notifications
            : []
        );
      } catch (error) {
        console.error(
          "Garage owner notification loading error:",
          error
        );

        setNotificationError(
          error.message ||
            "Unable to load garage notifications."
        );
      } finally {
        setNotificationLoading(
          false
        );
      }
    };

  // ======================================================
  // AUTO REFRESH
  // ======================================================

  useEffect(() => {
    loadNotifications();

    const interval =
      setInterval(
        () => {
          loadNotifications();
        },
        5000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  // ======================================================
  // UNREAD COUNT
  // ======================================================

  const unreadNotificationCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.isRead
        ).length,
      [notifications]
    );

  // ======================================================
  // MARK ONE AS READ
  // ======================================================

  const markNotificationRead =
    async (
      notification
    ) => {
      if (!notification) {
        return;
      }

      try {
        if (
          !notification.isRead
        ) {
          const response =
            await fetch(
              `http://localhost:5000/api/notifications/${notification.notificationId}/read`,
              {
                method:
                  "PUT",

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
                (item) =>
                  item.notificationId ===
                  notification.notificationId
                    ? {
                        ...item,
                        isRead:
                          true,
                      }
                    : item
              )
          );
        }

        setNotificationOpen(
          false
        );

        const targetPage =
          String(
            notification.targetPage ||
            ""
          )
            .trim()
            .toLowerCase();

        if (
          notification.notificationType ===
            "LOW_STOCK" ||
          targetPage ===
            "stock-management"
        ) {
          onNavigate?.(
            "Stock Management"
          );

          return;
        }

        if (
          targetPage ===
          "live-dashboard"
        ) {
          onNavigate?.(
            "Live Dashboard"
          );

          return;
        }

        if (
          targetPage ===
            "contact-messages" ||
          notification.notificationType ===
            "NEW_CONTACT_INQUIRY"
        ) {
          onNavigate?.(
            "Contact Messages"
          );

          return;
        }

        if (
          targetPage
        ) {
          onNavigate?.(
            targetPage
          );
        }
      } catch (error) {
        console.error(
          "Garage owner notification read error:",
          error
        );

        setNotificationError(
          error.message ||
            "Unable to update notification."
        );
      }
    };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const markAllNotificationsRead =
    async () => {
      const garageId =
        getLoggedInGarageId();

      if (!garageId) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/notifications/garage/${garageId}/read-all`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {}
                ),
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
                isRead:
                  true,
              })
            )
        );
      } catch (error) {
        console.error(
          "Mark all garage owner notifications error:",
          error
        );

        setNotificationError(
          error.message ||
            "Unable to update notifications."
        );
      }
    };

  // ======================================================
  // FORMAT DATE / TIME
  // ======================================================

  const formatNotificationTime =
    (
      notification
    ) => {
      if (
        !notification
          ?.createdDate
      ) {
        return (
          notification
            ?.createdTime ||
          ""
        );
      }

      const datePart =
        String(
          notification.createdDate
        ).slice(
          0,
          10
        );

      const timePart =
        String(
          notification.createdTime ||
            "00:00:00"
        ).slice(
          0,
          8
        );

      const notificationDate =
        new Date(
          `${datePart}T${timePart}`
        );

      if (
        Number.isNaN(
          notificationDate.getTime()
        )
      ) {
        return `${datePart} ${timePart}`;
      }

      return notificationDate.toLocaleString(
        [],
        {
          month:
            "short",

          day:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit",
        }
      );
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setNotificationOpen(
            (previous) =>
              !previous
          )
        }
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
        aria-label="Open notifications"
      >
        <Bell size={18} />

        {unreadNotificationCount >
          0 && (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
            {unreadNotificationCount >
            99
              ? "99+"
              : unreadNotificationCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 top-12 z-[100] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#191923] shadow-2xl sm:w-96">

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">

            <div>
              <p className="text-sm font-bold text-white">
                Notifications
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                Garage alerts
              </p>
            </div>

            {unreadNotificationCount >
              0 && (
              <button
                type="button"
                onClick={
                  markAllNotificationsRead
                }
                className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
              >
                MARK ALL READ
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">

            {notificationLoading &&
            notifications.length ===
              0 ? (
              <div className="px-4 py-10 text-center text-xs text-gray-500">
                Loading notifications...
              </div>
            ) : notificationError &&
              notifications.length ===
                0 ? (
              <div className="px-4 py-6 text-center text-xs text-red-300">
                {notificationError}
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-4 py-10 text-center text-xs text-gray-500">
                No notifications available.
              </div>
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <button
                    key={
                      notification.notificationId
                    }
                    type="button"
                    onClick={() =>
                      markNotificationRead(
                        notification
                      )
                    }
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
                            : notification.priority ===
                              "HIGH"
                            ? "bg-red-400"
                            : notification.priority ===
                              "LOW"
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
                            {notification.title ||
                              "Notification"}
                          </p>

                          {!notification.isRead && (
                            <span className="shrink-0 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[8px] font-bold text-cyan-400">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-[11px] leading-5 text-gray-400">
                          {notification.message ||
                            "You have a new notification."}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          <span className="text-[9px] uppercase tracking-wider text-gray-600">
                            {notification.notificationType}
                          </span>

                          <span className="text-[9px] text-gray-700">
                            •
                          </span>

                          <span className="text-[9px] text-gray-600">
                            {formatNotificationTime(
                              notification
                            )}
                          </span>

                          {notification.notificationType ===
                            "LOW_STOCK" && (
                            <>
                              <span className="text-[9px] text-gray-700">
                                •
                              </span>

                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                Open Stock Management
                              </span>
                            </>
                          )}

                          {notification.notificationType ===
                            "NEW_CONTACT_INQUIRY" && (
                            <>
                              <span className="text-[9px] text-gray-700">
                                •
                              </span>

                              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                                Open Contact Messages
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}