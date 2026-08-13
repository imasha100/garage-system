import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  EyeOff,
  Gauge,
  History,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

// ======================================================
// LEAFLET DEFAULT ICON FIX
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================================================
// CUSTOM MAP ICONS
// ======================================================

const createEmojiIcon = (
  emoji,
  background
) =>
  L.divIcon({
    className: "",

    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:9999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:${background};
        border:3px solid #ffffff;
        box-shadow:0 6px 18px rgba(0,0,0,.45);
        font-size:21px;
      ">
        ${emoji}
      </div>
    `,

    iconSize: [42, 42],

    iconAnchor: [21, 21],

    popupAnchor: [0, -22],
  });

const driverTruckIcon =
  createEmojiIcon(
    "🚚",
    "#0d9488"
  );

const breakdownVehicleIcon =
  createEmojiIcon(
    "🚗",
    "#7c3aed"
  );

const garageIcon =
  createEmojiIcon(
    "🏢",
    "#0284c7"
  );

// ======================================================
// ROUTE / PRICE HELPERS
// ======================================================

const AVERAGE_SPEED_KMH = 35;

const TOW_BASE_CHARGE = 3500;

const TOW_PRICE_PER_KM = 600;

const finiteNumber = (
  ...values
) => {
  for (const value of values) {
    const number =
      Number(value);

    if (
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return null;
};

const haversineDistanceKm = (
  from,
  to
) => {
  if (
    !Array.isArray(from) ||
    !Array.isArray(to) ||
    from.length < 2 ||
    to.length < 2
  ) {
    return 0;
  }

  const [
    lat1,
    lng1,
  ] = from;

  const [
    lat2,
    lng2,
  ] = to;

  if (
    ![
      lat1,
      lng1,
      lat2,
      lng2,
    ].every(
      Number.isFinite
    )
  ) {
    return 0;
  }

  const radius =
    6371;

  const radians = (
    degrees
  ) =>
    (
      degrees *
      Math.PI
    ) /
    180;

  const dLat =
    radians(
      lat2 - lat1
    );

  const dLng =
    radians(
      lng2 - lng1
    );

  const a =
    Math.sin(
      dLat / 2
    ) ** 2 +
    Math.cos(
      radians(lat1)
    ) *
      Math.cos(
        radians(lat2)
      ) *
      Math.sin(
        dLng / 2
      ) ** 2;

  return (
    radius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    )
  );
};

const calculateTowPrice = (
  distanceKm
) =>
  TOW_BASE_CHARGE +
  Number(
    distanceKm || 0
  ) *
    TOW_PRICE_PER_KM;

const formatLKR = (
  amount
) =>
  `LKR ${Math.round(
    Number(
      amount || 0
    )
  ).toLocaleString(
    "en-LK"
  )}`;

const formatDistance = (
  distanceKm
) =>
  `${Number(
    distanceKm || 0
  ).toFixed(1)} KM`;

const formatDuration = (
  durationMinutes
) =>
  `${Math.max(
    1,
    Math.round(
      Number(
        durationMinutes ||
          0
      )
    )
  )} Minutes`;

const fallbackRouteMetrics = (
  from,
  to
) => {
  const distanceKm =
    haversineDistanceKm(
      from,
      to
    );

  const durationMinutes =
    Math.max(
      1,
      Math.round(
        (
          distanceKm /
          AVERAGE_SPEED_KMH
        ) *
          60
      )
    );

  return {
    distanceKm,

    durationMinutes,

    isRoadRoute:
      false,
  };
};

// ======================================================
// FIT ALL 3 LOCATIONS ON MAP
// ======================================================

function FitRouteBounds({
  driverLocation,
  breakdownLocation,
  garageLocation,
}) {
  const map =
    useMap();

  const hasFittedRef =
    useRef(false);

  useEffect(() => {
    if (
      hasFittedRef.current
    ) {
      return;
    }

    const points = [
      driverLocation,
      breakdownLocation,
      garageLocation,
    ].filter(
      (point) =>
        Array.isArray(
          point
        ) &&
        point.length >=
          2 &&
        point.every(
          Number.isFinite
        )
    );

    if (
      points.length < 2
    ) {
      return;
    }

    map.fitBounds(
      points,
      {
        padding: [
          55,
          55,
        ],

        maxZoom:
          15,

        animate:
          false,
      }
    );

    hasFittedRef.current =
      true;
  }, [
    map,
    driverLocation,
    breakdownLocation,
    garageLocation,
  ]);

  return null;
}

// ======================================================
// OSRM ROAD ROUTE
// ======================================================

function RoadRoute({
  from,
  to,
  color,
  onRouteData,
}) {
  const [
    coordinates,
    setCoordinates,
  ] = useState([]);

  const [
    routeStatus,
    setRouteStatus,
  ] = useState(
    "idle"
  );

  const lastGoodCoordinatesRef =
    useRef([]);

  const requestIdRef =
    useRef(0);

  useEffect(() => {
    if (
      !Array.isArray(
        from
      ) ||
      !Array.isArray(
        to
      ) ||
      from.length < 2 ||
      to.length < 2 ||
      ![
        from[0],
        from[1],
        to[0],
        to[1],
      ].every(
        Number.isFinite
      )
    ) {
      return undefined;
    }

    const controller =
      new AbortController();

    const requestId =
      ++requestIdRef.current;

    const loadRoadRoute =
      async () => {
        // Keep previous successful route visible
        // while recalculating the next road route.

        setRouteStatus(
          "loading"
        );

        const [
          fromLatitude,
          fromLongitude,
        ] = from;

        const [
          toLatitude,
          toLongitude,
        ] = to;

        const routingServers =
          [
            "https://router.project-osrm.org",

            "https://routing.openstreetmap.de/routed-car",
          ];

        let lastError =
          null;

        for (
          const server of
          routingServers
        ) {
          try {
            const routeUrl =
              `${server}/route/v1/driving/` +
              `${fromLongitude},${fromLatitude};` +
              `${toLongitude},${toLatitude}` +
              `?alternatives=false&steps=false&overview=full&geometries=geojson`;

            const response =
              await fetch(
                routeUrl,
                {
                  signal:
                    controller.signal,

                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              );

            if (
              !response.ok
            ) {
              throw new Error(
                `Road route request failed with status ${response.status}.`
              );
            }

            const result =
              await response.json();

            const route =
              result
                ?.routes?.[0];

            const roadCoordinates =
              route
                ?.geometry
                ?.coordinates;

            if (
              !route ||
              !Array.isArray(
                roadCoordinates
              ) ||
              roadCoordinates.length <
                2
            ) {
              throw new Error(
                "Routing service returned no usable road geometry."
              );
            }

            if (
              requestId !==
              requestIdRef.current
            ) {
              return;
            }

            const leafletCoordinates =
              roadCoordinates.map(
                ([
                  longitude,
                  latitude,
                ]) => [
                  latitude,
                  longitude,
                ]
              );

            lastGoodCoordinatesRef.current =
              leafletCoordinates;

            setCoordinates(
              leafletCoordinates
            );

            setRouteStatus(
              "ready"
            );

            onRouteData?.({
              distanceKm:
                Number(
                  route.distance ||
                    0
                ) /
                1000,

              durationMinutes:
                Number(
                  route.duration ||
                    0
                ) /
                60,

              isRoadRoute:
                true,

              routeAvailable:
                true,
            });

            return;
          } catch (
            error
          ) {
            if (
              error.name ===
              "AbortError"
            ) {
              return;
            }

            lastError =
              error;

            console.warn(
              `Road routing server failed: ${server}`,
              error
            );
          }
        }

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "All road routing services failed:",
          lastError
        );

        if (
          lastGoodCoordinatesRef
            .current
            .length >= 2
        ) {
          setCoordinates(
            lastGoodCoordinatesRef
              .current
          );

          setRouteStatus(
            "ready"
          );
        } else {
          setRouteStatus(
            "unavailable"
          );
        }

        onRouteData?.({
          ...fallbackRouteMetrics(
            from,
            to
          ),

          routeAvailable:
            false,
        });
      };

    loadRoadRoute();

    return () =>
      controller.abort();
  }, [
    from?.[0],
    from?.[1],
    to?.[0],
    to?.[1],
  ]);

  if (
    coordinates.length <
      2 ||
    routeStatus ===
      "unavailable"
  ) {
    return null;
  }

  return (
    <Polyline
      positions={
        coordinates
      }
      pathOptions={{
        color,

        weight: 7,

        opacity:
          routeStatus ===
          "loading"
            ? 0.75
            : 0.95,

        lineCap:
          "round",

        lineJoin:
          "round",
      }}
    />
  );
}

// ======================================================
// EXTERNAL DRIVER DASHBOARD
// ======================================================

export default function ExternalDriverDashboard({
  onNavigate,
}) {
  const [
    driverSession,
    setDriverSession,
  ] = useState(null);

  const [
    activeSection,
    setActiveSection,
  ] = useState(
    "dashboard"
  );

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword:
      "",

    newPassword:
      "",

    confirmPassword:
      "",
  });

  // ====================================================
  // ACTIVE ASSIGNMENTS
  // ====================================================

  const [
    assignments,
    setAssignments,
  ] = useState([]);

  const [
    activeAssignment,
    setActiveAssignment,
  ] = useState(null);

  const [
    assignmentsLoading,
    setAssignmentsLoading,
  ] = useState(false);

  const [
    assignmentsError,
    setAssignmentsError,
  ] = useState("");

  // ====================================================
  // TOW HISTORY
  //
  // Completed tow jobs are stored here separately.
  // ====================================================

  const [
    towHistory,
    setTowHistory,
  ] = useState([]);

  const [
    towHistoryLoading,
    setTowHistoryLoading,
  ] = useState(false);

  const [
    towHistoryError,
    setTowHistoryError,
  ] = useState("");

  // ====================================================
  // NOTIFICATIONS
  // ====================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  // ====================================================
  // ROUTE MODAL
  // ====================================================

  const [
    routeAssignment,
    setRouteAssignment,
  ] = useState(null);

  // ====================================================
  // LOCK BODY SCROLL FOR MODALS
  // ====================================================

  useEffect(() => {
    if (
      !passwordModalOpen &&
      !routeAssignment
    ) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    passwordModalOpen,
    routeAssignment,
  ]);

  // ====================================================
  // LOAD DRIVER SESSION
  // ====================================================

  useEffect(() => {
    try {
      const storedSession =
        localStorage.getItem(
          "externalDriverSession"
        );

      if (
        !storedSession
      ) {
        onNavigate(
          "external-driver-login"
        );

        return;
      }

      const parsedSession =
        JSON.parse(
          storedSession
        );

      if (
        !parsedSession ||
        String(
          parsedSession.role ||
            ""
        )
          .trim()
          .toLowerCase() !==
          "external_driver"
      ) {
        localStorage.removeItem(
          "externalDriverSession"
        );

        onNavigate(
          "external-driver-login"
        );

        return;
      }

      setDriverSession(
        parsedSession
      );
    } catch (error) {
      console.error(
        "External driver session error:",
        error
      );

      localStorage.removeItem(
        "externalDriverSession"
      );

      onNavigate(
        "external-driver-login"
      );
    }
  }, [
    onNavigate,
  ]);

  // ====================================================
  // LOAD ACTIVE ASSIGNMENTS
  // ====================================================

  const loadAssignments =
    async (
      driverId,
      showLoader = false
    ) => {
      if (
        !driverId
      ) {
        return;
      }

      if (
        showLoader
      ) {
        setAssignmentsLoading(
          true
        );
      }

      setAssignmentsError(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/tow-dispatches/driver/${driverId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to load tow assignments."
          );
        }

        setAssignments(
          Array.isArray(
            data.assignments
          )
            ? data.assignments
            : []
        );

        setActiveAssignment(
          data.activeAssignment ||
            null
        );
      } catch (error) {
        console.error(
          "Load external driver assignments error:",
          error
        );

        setAssignments(
          []
        );

        setActiveAssignment(
          null
        );

        setAssignmentsError(
          error.message ||
            "Unable to load tow assignments."
        );
      } finally {
        if (
          showLoader
        ) {
          setAssignmentsLoading(
            false
          );
        }
      }
    };

  // ====================================================
  // LOAD TOW HISTORY
  //
  // Backend:
  // GET /api/tow-dispatches/driver/:driverId/history
  //
  // Only Completed tow jobs are returned.
  // ====================================================

  const loadTowHistory =
    async (
      driverId,
      showLoader = false
    ) => {
      if (
        !driverId
      ) {
        return;
      }

      if (
        showLoader
      ) {
        setTowHistoryLoading(
          true
        );
      }

      setTowHistoryError(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/tow-dispatches/driver/${driverId}/history`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to load tow history."
          );
        }

        setTowHistory(
          Array.isArray(
            data.history
          )
            ? data.history
            : []
        );
      } catch (error) {
        console.error(
          "Load external driver tow history error:",
          error
        );

        setTowHistory(
          []
        );

        setTowHistoryError(
          error.message ||
            "Unable to load tow history."
        );
      } finally {
        if (
          showLoader
        ) {
          setTowHistoryLoading(
            false
          );
        }
      }
    };

  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications =
    async (
      driverId
    ) => {
      if (
        !driverId
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/notifications/driver/${driverId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to load notifications."
          );
        }

        setNotifications(
          Array.isArray(
            data.notifications
          )
            ? data.notifications
            : []
        );

        setUnreadCount(
          Number(
            data.unreadCount ||
              0
          )
        );
      } catch (error) {
        console.error(
          "Load external driver notifications error:",
          error
        );
      }
    };

  // ====================================================
  // POLLING
  // ====================================================

  useEffect(() => {
    const driverId =
      Number(
        driverSession
          ?.driverId
      );

    if (
      !Number.isInteger(
        driverId
      ) ||
      driverId <= 0
    ) {
      return undefined;
    }

    loadAssignments(
      driverId,
      true
    );

    loadTowHistory(
      driverId,
      true
    );

    loadNotifications(
      driverId
    );

    const interval =
      window.setInterval(
        () => {
          loadAssignments(
            driverId,
            false
          );

          loadTowHistory(
            driverId,
            false
          );

          loadNotifications(
            driverId
          );
        },
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    driverSession
      ?.driverId,
  ]);

  // ====================================================
  // REFRESH ACTIVE ASSIGNMENTS
  // ====================================================

  const handleRefreshAssignments =
    async () => {
      const driverId =
        Number(
          driverSession
            ?.driverId
        );

      if (
        !driverId
      ) {
        return;
      }

      await Promise.all([
        loadAssignments(
          driverId,
          false
        ),

        loadNotifications(
          driverId
        ),
      ]);
    };

  // ====================================================
  // REFRESH TOW HISTORY
  // ====================================================

  const handleRefreshTowHistory =
    async () => {
      const driverId =
        Number(
          driverSession
            ?.driverId
        );

      if (
        !driverId
      ) {
        return;
      }

      await loadTowHistory(
        driverId,
        true
      );
    };

  // ====================================================
  // JOURNEY UPDATE FROM ROUTE MODAL
  //
  // IMPORTANT:
  //
  // When dispatch becomes Completed:
  //
  // - remove from active assignments immediately
  // - clear dashboard active assignment
  // - close route modal
  // - refresh Tow History
  // ====================================================

  const handleJourneyUpdated =
    async (
      updatedDispatch
    ) => {
      if (
        !updatedDispatch
      ) {
        return;
      }

      const dispatchId =
        Number(
          updatedDispatch
            .dispatchId
        );

      const dispatchStatus =
        String(
          updatedDispatch
            .dispatchStatus ||
            ""
        ).trim();

      if (
        !Number.isInteger(
          dispatchId
        ) ||
        dispatchId <= 0 ||
        !dispatchStatus
      ) {
        return;
      }

      const normalizedStatus =
        dispatchStatus
          .trim()
          .toUpperCase();

      // ==================================================
      // COMPLETED
      // Remove from active areas and move to history.
      // ==================================================

      if (
        normalizedStatus ===
        "COMPLETED"
      ) {
        setAssignments(
          (
            previous
          ) =>
            previous.filter(
              (item) =>
                Number(
                  item.dispatchId
                ) !==
                dispatchId
            )
        );

        setActiveAssignment(
          (previous) => {
            if (
              !previous ||
              Number(
                previous.dispatchId
              ) !==
                dispatchId
            ) {
              return previous;
            }

            return null;
          }
        );

        setRouteAssignment(
          null
        );

        const driverId =
          Number(
            driverSession
              ?.driverId
          );

        if (
          Number.isInteger(
            driverId
          ) &&
          driverId > 0
        ) {
          await Promise.all([
            loadAssignments(
              driverId,
              false
            ),

            loadTowHistory(
              driverId,
              false
            ),

            loadNotifications(
              driverId
            ),
          ]);
        }

        return;
      }

      // ==================================================
      // NORMAL ACTIVE JOURNEY UPDATE
      // ==================================================

      setAssignments(
        (
          previous
        ) =>
          previous.map(
            (item) =>
              Number(
                item.dispatchId
              ) ===
              dispatchId
                ? {
                    ...item,

                    ...updatedDispatch,

                    dispatchStatus,
                  }
                : item
          )
      );

      setActiveAssignment(
        (previous) => {
          if (
            !previous ||
            Number(
              previous.dispatchId
            ) !==
              dispatchId
          ) {
            return previous;
          }

          return {
            ...previous,

            ...updatedDispatch,

            dispatchStatus,
          };
        }
      );

      setRouteAssignment(
        (previous) => {
          if (
            !previous ||
            Number(
              previous.dispatchId
            ) !==
              dispatchId
          ) {
            return previous;
          }

          return {
            ...previous,

            ...updatedDispatch,

            dispatchStatus,
          };
        }
      );
    };

  // ====================================================
  // NOTIFICATION READ
  // ====================================================

  const handleMarkAllNotificationsRead =
    async () => {
      const driverId =
        Number(
          driverSession
            ?.driverId
        );

      if (
        !driverId ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/notifications/driver/${driverId}/read-all`,
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

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to update notifications."
          );
        }

        setNotifications(
          (
            previous
          ) =>
            previous.map(
              (item) => ({
                ...item,

                isRead:
                  true,
              })
            )
        );

        setUnreadCount(
          0
        );
      } catch (error) {
        console.error(
          "Mark notifications read error:",
          error
        );
      }
    };

  const handleNotificationBell =
    async () => {
      const nextState =
        !notificationOpen;

      setNotificationOpen(
        nextState
      );

      if (
        nextState &&
        unreadCount > 0
      ) {
        await handleMarkAllNotificationsRead();
      }
    };

  // ====================================================
  // DRIVER INITIALS
  // ====================================================

  const driverInitials =
    useMemo(() => {
      const name =
        driverSession
          ?.fullName ||
        "External Driver";

      return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (part) =>
            part
              .charAt(0)
              .toUpperCase()
        )
        .join("");
    }, [
      driverSession,
    ]);

  // ====================================================
  // PASSWORD
  // ====================================================

  const handlePasswordChange =
    (event) => {
      const {
        name,
        value,
      } =
        event.target;

      setPasswordForm(
        (
          previous
        ) => ({
          ...previous,

          [name]:
            value,
        })
      );

      if (
        passwordError
      ) {
        setPasswordError(
          ""
        );
      }

      if (
        passwordSuccess
      ) {
        setPasswordSuccess(
          ""
        );
      }
    };

  const openPasswordModal =
    () => {
      setPasswordForm({
        currentPassword:
          "",

        newPassword:
          "",

        confirmPassword:
          "",
      });

      setPasswordError(
        ""
      );

      setPasswordSuccess(
        ""
      );

      setShowCurrentPassword(
        false
      );

      setShowNewPassword(
        false
      );

      setShowConfirmPassword(
        false
      );

      setPasswordModalOpen(
        true
      );
    };
      const closePasswordModal =
    () => {
      if (
        isChangingPassword
      ) {
        return;
      }

      setPasswordModalOpen(
        false
      );

      setPasswordForm({
        currentPassword:
          "",

        newPassword:
          "",

        confirmPassword:
          "",
      });

      setPasswordError(
        ""
      );

      setPasswordSuccess(
        ""
      );
    };

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      setPasswordError(
        ""
      );

      setPasswordSuccess(
        ""
      );

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setPasswordError(
          "Please complete all password fields."
        );

        return;
      }

      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,20}$/;

      if (
        !strongPasswordRegex.test(
          passwordForm.newPassword
        )
      ) {
        setPasswordError(
          "Password must be 8-20 characters and include uppercase, lowercase, number and special character."
        );

        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setPasswordError(
          "New password and confirm password do not match."
        );

        return;
      }

      if (
        passwordForm.currentPassword ===
        passwordForm.newPassword
      ) {
        setPasswordError(
          "New password must be different from the current password."
        );

        return;
      }

      const loginId =
        Number(
          driverSession
            ?.loginId
        );

      if (
        !Number.isInteger(
          loginId
        ) ||
        loginId <= 0
      ) {
        setPasswordError(
          "Unable to identify your login account. Please sign in again."
        );

        return;
      }

      setIsChangingPassword(
        true
      );

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/external-driver/change-password",
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  loginId,

                  currentPassword:
                    passwordForm.currentPassword,

                  newPassword:
                    passwordForm.newPassword,

                  confirmPassword:
                    passwordForm.confirmPassword,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to change password."
          );
        }

        setPasswordSuccess(
          data.message ||
            "Password updated successfully."
        );

        setPasswordForm({
          currentPassword:
            "",

          newPassword:
            "",

          confirmPassword:
            "",
        });
      } catch (error) {
        console.error(
          "Change external driver password error:",
          error
        );

        setPasswordError(
          error.message ||
            "Unable to change password. Please try again."
        );
      } finally {
        setIsChangingPassword(
          false
        );
      }
    };

  // ====================================================
  // LOGOUT / NAVIGATION
  // ====================================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "externalDriverSession"
      );

      sessionStorage.removeItem(
        "externalDriverPrefill"
      );

      onNavigate(
        "start"
      );
    };

  const handleSectionChange =
    (section) => {
      setActiveSection(
        section
      );

      setSidebarOpen(
        false
      );

      // Refresh history whenever driver opens Tow History.
      if (
        section ===
        "history"
      ) {
        const driverId =
          Number(
            driverSession
              ?.driverId
          );

        if (
          Number.isInteger(
            driverId
          ) &&
          driverId > 0
        ) {
          loadTowHistory(
            driverId,
            true
          );
        }
      }
    };

  // ====================================================
  // LOADING SESSION SCREEN
  // ====================================================

  if (
    !driverSession
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-teal-400" />

          <p className="mt-4 text-sm font-bold text-slate-400">
            Loading External Driver Portal...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // SIDEBAR ITEMS
  // ====================================================

  const sidebarItems = [
    {
      id:
        "dashboard",

      label:
        "Dashboard",

      icon:
        Gauge,
    },

    {
      id:
        "jobs",

      label:
        "Tow Assignments",

      icon:
        Route,
    },

    {
      id:
        "history",

      label:
        "Tow History",

      icon:
        History,
    },

    {
      id:
        "truck",

      label:
        "My Tow Truck",

      icon:
        Truck,
    },

    {
      id:
        "garage",

      label:
        "Assigned Garage",

      icon:
        Building2,
    },

    {
      id:
        "profile",

      label:
        "Driver Profile",

      icon:
        CircleUserRound,
    },
  ];

  // ====================================================
  // MAIN LAYOUT
  // ====================================================

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <div className="flex min-h-screen">

        {/* ==================================================
            MOBILE SIDEBAR OVERLAY
        ================================================== */}

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{
                opacity:
                  0,
              }}

              animate={{
                opacity:
                  1,
              }}

              exit={{
                opacity:
                  0,
              }}

              onClick={() =>
                setSidebarOpen(
                  false
                )
              }

              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#080d14] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* LOGO */}

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-2.5">
                <Wrench className="h-5 w-5 text-teal-300" />
              </div>

              <div>
                <p className="font-black">
                  SwiftGarage{" "}

                  <span className="text-teal-400">
                    AI
                  </span>
                </p>

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  External Driver
                </p>
              </div>
            </div>

            <button
              type="button"

              onClick={() =>
                setSidebarOpen(
                  false
                )
              }

              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* DRIVER MINI PROFILE */}

          <div className="p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 font-black text-slate-950">
                  {driverInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {driverSession.fullName ||
                      "External Driver"}
                  </p>

                  <p className="mt-1 truncate font-mono text-[11px] text-teal-300">
                    {driverSession.externalDriverId ||
                      driverSession.username ||
                      "External Driver"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-bold text-emerald-300">
                  Active External Partner
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              Driver Portal
            </p>

            <div className="space-y-1">
              {sidebarItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }

                      type="button"

                      onClick={() =>
                        handleSectionChange(
                          item.id
                        )
                      }

                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                        active
                          ? "border border-teal-400/20 bg-teal-400/10 text-teal-300"
                          : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />

                      <span className="flex-1">
                        {
                          item.label
                        }
                      </span>

                      {active && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </nav>

          {/* SIDEBAR FOOTER */}

          <div className="space-y-2 border-t border-white/10 p-4">
            <button
              type="button"

              onClick={
                openPasswordModal
              }

              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              <KeyRound className="h-5 w-5" />

              Change Password
            </button>

            <button
              type="button"

              onClick={
                handleLogout
              }

              className="flex w-full items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-400/10"
            >
              <LogOut className="h-5 w-5" />

              Logout
            </button>
          </div>
        </aside>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="min-w-0 flex-1 overflow-x-hidden">

          {/* HEADER */}

          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05080d]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"

                  onClick={() =>
                    setSidebarOpen(
                      true
                    )
                  }

                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">
                    External Driver Portal
                  </p>

                  <h1 className="truncate text-xl font-black sm:text-2xl">
                    Welcome,{" "}

                    {driverSession.fullName ||
                      "Driver"}
                  </h1>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">

                {/* NOTIFICATION BELL */}

                <div className="relative">
                  <button
                    type="button"

                    onClick={
                      handleNotificationBell
                    }

                    className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-300"

                    aria-label="Driver notifications"
                  >
                    <Bell className="h-5 w-5" />

                    {unreadCount >
                      0 && (
                      <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                        {unreadCount >
                        99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{
                          opacity:
                            0,

                          y:
                            -8,

                          scale:
                            0.98,
                        }}

                        animate={{
                          opacity:
                            1,

                          y:
                            0,

                          scale:
                            1,
                        }}

                        exit={{
                          opacity:
                            0,

                          y:
                            -8,

                          scale:
                            0.98,
                        }}

                        className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#080d14] shadow-2xl"
                      >
                        <div className="border-b border-white/10 p-4">
                          <p className="font-black">
                            Notifications
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            External driver dispatch updates
                          </p>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto">
                          {notifications.length ===
                          0 ? (
                            <div className="p-8 text-center">
                              <Bell className="mx-auto h-8 w-8 text-slate-600" />

                              <p className="mt-3 text-sm font-bold text-slate-400">
                                No notifications
                              </p>
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

                                  onClick={() => {
                                    if (
                                      notification.targetPage ===
                                      "tow-assignments"
                                    ) {
                                      setActiveSection(
                                        "jobs"
                                      );
                                    }

                                    if (
                                      notification.targetPage ===
                                      "tow-history"
                                    ) {
                                      setActiveSection(
                                        "history"
                                      );
                                    }

                                    setNotificationOpen(
                                      false
                                    );
                                  }}

                                  className={`block w-full border-b border-white/5 p-4 text-left transition last:border-b-0 hover:bg-white/[0.04] ${
                                    notification.isRead
                                      ? ""
                                      : "bg-teal-400/[0.04]"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-lg bg-teal-400/10 p-2 text-teal-300">
                                      <Truck className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-black text-white">
                                        {
                                          notification.title
                                        }
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-slate-400">
                                        {
                                          notification.message
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              )
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* VERIFIED DRIVER */}

                <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2.5 sm:flex">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />

                  <span className="text-xs font-bold text-emerald-300">
                    Verified Driver
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ==================================================
              PAGE CONTENT
          ================================================== */}

          <div className="min-h-[calc(100vh-81px)] overflow-y-auto p-4 pb-12 sm:p-6 lg:p-8">

            {/* DASHBOARD */}

            {activeSection ===
              "dashboard" && (
              <DashboardSection
                driver={
                  driverSession
                }

                activeAssignment={
                  activeAssignment
                }

                assignmentsLoading={
                  assignmentsLoading
                }

                onOpenPassword={
                  openPasswordModal
                }

                onOpenAssignments={() =>
                  setActiveSection(
                    "jobs"
                  )
                }

                onOpenRoute={(
                  assignment
                ) =>
                  setRouteAssignment(
                    assignment
                  )
                }
              />
            )}

            {/* ACTIVE TOW ASSIGNMENTS */}

            {activeSection ===
              "jobs" && (
              <AssignmentsSection
                driver={
                  driverSession
                }

                assignments={
                  assignments
                }

                isLoading={
                  assignmentsLoading
                }

                error={
                  assignmentsError
                }

                onRefresh={
                  handleRefreshAssignments
                }

                onOpenRoute={(
                  assignment
                ) =>
                  setRouteAssignment(
                    assignment
                  )
                }
              />
            )}

            {/* ==================================================
                TOW HISTORY
                Completed jobs only
            ================================================== */}

            {activeSection ===
              "history" && (
              <TowHistorySection
                history={
                  towHistory
                }

                isLoading={
                  towHistoryLoading
                }

                error={
                  towHistoryError
                }

                onRefresh={
                  handleRefreshTowHistory
                }
              />
            )}

            {/* MY TOW TRUCK */}

            {activeSection ===
              "truck" && (
              <TruckSection
                driver={
                  driverSession
                }
              />
            )}

            {/* ASSIGNED GARAGE */}

            {activeSection ===
              "garage" && (
              <GarageSection
                driver={
                  driverSession
                }
              />
            )}

            {/* DRIVER PROFILE */}

            {activeSection ===
              "profile" && (
              <ProfileSection
                driver={
                  driverSession
                }

                onChangePassword={
                  openPasswordModal
                }
              />
            )}
          </div>
        </main>
      </div>

      {/* ==================================================
          ROUTE / JOURNEY MODAL
      ================================================== */}

      <AnimatePresence>
        {routeAssignment && (
          <RouteMapModal
            assignment={
              routeAssignment
            }

            driver={
              driverSession
            }

            onJourneyUpdated={
              handleJourneyUpdated
            }

            onClose={() =>
              setRouteAssignment(
                null
              )
            }
          />
        )}
      </AnimatePresence>

      {/* ==================================================
          CHANGE PASSWORD MODAL
      ================================================== */}

      <AnimatePresence>
        {passwordModalOpen && (
          <motion.div
            initial={{
              opacity:
                0,
            }}

            animate={{
              opacity:
                1,
            }}

            exit={{
              opacity:
                0,
            }}

            onMouseDown={
              closePasswordModal
            }

            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{
                opacity:
                  0,

                y:
                  25,

                scale:
                  0.97,
              }}

              animate={{
                opacity:
                  1,

                y:
                  0,

                scale:
                  1,
              }}

              exit={{
                opacity:
                  0,

                y:
                  20,

                scale:
                  0.97,
              }}

              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }

              className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#080d14] shadow-[0_35px_120px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Change Password
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Update your External Driver account password
                    </p>
                  </div>
                </div>

                <button
                  type="button"

                  disabled={
                    isChangingPassword
                  }

                  onClick={
                    closePasswordModal
                  }

                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={
                  handleChangePassword
                }

                className="space-y-5 p-5 sm:p-6"
              >
                <PasswordField
                  label="Current Password"

                  name="currentPassword"

                  value={
                    passwordForm.currentPassword
                  }

                  onChange={
                    handlePasswordChange
                  }

                  show={
                    showCurrentPassword
                  }

                  onToggle={() =>
                    setShowCurrentPassword(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }

                  disabled={
                    isChangingPassword
                  }
                />

                <PasswordField
                  label="New Password"

                  name="newPassword"

                  value={
                    passwordForm.newPassword
                  }

                  onChange={
                    handlePasswordChange
                  }

                  show={
                    showNewPassword
                  }

                  onToggle={() =>
                    setShowNewPassword(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }

                  disabled={
                    isChangingPassword
                  }
                />

                <PasswordField
                  label="Confirm New Password"

                  name="confirmPassword"

                  value={
                    passwordForm.confirmPassword
                  }

                  onChange={
                    handlePasswordChange
                  }

                  show={
                    showConfirmPassword
                  }

                  onToggle={() =>
                    setShowConfirmPassword(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }

                  disabled={
                    isChangingPassword
                  }
                />

                <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-xs leading-5 text-slate-500">
                  Password must be 8-20 characters and include uppercase, lowercase, number and special character.
                </div>

                {passwordError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <p>
                      {
                        passwordError
                      }
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                    <p>
                      {
                        passwordSuccess
                      }
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"

                    disabled={
                      isChangingPassword
                    }

                    onClick={
                      closePasswordModal
                    }

                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"

                    disabled={
                      isChangingPassword
                    }

                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isChangingPassword ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />

                        Updating...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-5 w-5" />

                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ======================================================
// DASHBOARD SECTION
// ======================================================

function DashboardSection({
  driver,
  activeAssignment,
  assignmentsLoading,
  onOpenPassword,
  onOpenAssignments,
  onOpenRoute,
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Driver Overview"
        title="External Tow Driver Dashboard"
        description="View your assigned garage, registered tow truck and towing assignments from one place."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Truck}
          label="Tow Truck"
          value={
            driver.truckNumber ||
            "Not Available"
          }
          secondary={
            driver.truckType ||
            "External Truck"
          }
        />

        <SummaryCard
          icon={Building2}
          label="Assigned Garage"
          value={
            driver.garageName ||
            "Not Assigned"
          }
          secondary={
            driver.garageDistrict ||
            driver.garageAddress ||
            "Garage"
          }
        />

        <SummaryCard
          icon={ShieldCheck}
          label="Account Status"
          value="Verified"
          secondary="External Partner"
        />

        <SummaryCard
          icon={Gauge}
          label="Truck Status"
          value={
            driver.assignmentStatus ||
            "Active"
          }
          secondary={
            driver.truckStatus ||
            "External"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                Tow Operations
              </p>

              <h3 className="mt-2 text-xl font-black">
                Current Assignment
              </h3>
            </div>

            <button
              type="button"
              onClick={
                onOpenAssignments
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-teal-400/20 bg-teal-400/10 px-4 py-2.5 text-sm font-bold text-teal-300"
            >
              View Assignments

              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {assignmentsLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <LoaderCircle className="h-9 w-9 animate-spin text-teal-400" />
            </div>
          ) : activeAssignment ? (
            <div className="py-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Dispatch #
                    {
                      activeAssignment.dispatchId
                    }
                  </p>

                  <h4 className="mt-2 text-xl font-black">
                    {activeAssignment.customerName ||
                      "Customer"}
                  </h4>
                </div>

                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-300">
                  {
                    activeAssignment.dispatchStatus
                  }
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AssignmentDetail
                  label="Vehicle"
                  value={`${activeAssignment.vehicleNumber || "N/A"}${
                    activeAssignment.vehicleType
                      ? ` • ${activeAssignment.vehicleType}`
                      : ""
                  }`}
                />

                <AssignmentDetail
                  label="Customer Contact"
                  value={
                    activeAssignment.customerContact
                  }
                />

                <AssignmentDetail
                  label="Pickup Location"
                  value={
                    activeAssignment.pickupLocation ||
                    activeAssignment.customerLocation
                  }
                />

                <AssignmentDetail
                  label="Destination Garage"
                  value={
                    activeAssignment.garageName ||
                    activeAssignment.destinationGarage
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenRoute(
                    activeAssignment
                  )
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3.5 text-sm font-black text-slate-950"
              >
                <Route className="h-5 w-5" />

                View Full Tow Route
              </button>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center">
              <Route className="h-10 w-10 text-cyan-300" />

              <h4 className="mt-5 text-lg font-black">
                No Active Tow Assignment
              </h4>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                New tow requests approved by the Assistance Officer will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-400">
            Account
          </p>

          <h3 className="mt-2 text-xl font-black">
            Quick Actions
          </h3>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={
                onOpenPassword
              }
              className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left"
            >
              <KeyRound className="h-5 w-5 text-cyan-300" />

              <div>
                <p className="font-black">
                  Change Password
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Update account security
                </p>
              </div>
            </button>

            <InformationBox
              label="Driver ID"
              value={
                driver.externalDriverId ||
                driver.username
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ======================================================
// ACTIVE TOW ASSIGNMENTS
// ======================================================

function AssignmentsSection({
  driver,
  assignments,
  isLoading,
  error,
  onRefresh,
  onOpenRoute,
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Dispatch Center"
          title="Tow Assignments"
          description="Active towing requests approved for your external tow truck."
        />

        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            isLoading
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isLoading
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-teal-300" />

            <div>
              <p className="font-black">
                {driver.truckNumber ||
                  "Registered Tow Truck"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {driver.truckType ||
                  "External Tow Truck"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-teal-400" />
          </div>
        ) : error ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />

            <p className="mt-4 font-black text-red-300">
              Unable to load assignments
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        ) : assignments.length ===
          0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <Navigation className="h-10 w-10 text-slate-600" />

            <h3 className="mt-6 text-xl font-black">
              No Active Tow Assignments
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Completed jobs are moved automatically to Tow History.
            </p>
          </div>
        ) : (
          <div className="max-h-[700px] space-y-4 overflow-y-auto p-4 sm:p-6">
            {assignments.map(
              (
                assignment
              ) => (
                <div
                  key={
                    assignment.dispatchId
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-400">
                        Dispatch #
                        {
                          assignment.dispatchId
                        }
                      </p>

                      <h3 className="mt-2 text-lg font-black">
                        {assignment.customerName ||
                          "Customer"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.vehicleNumber ||
                          "Vehicle"}

                        {assignment.vehicleType
                          ? ` • ${assignment.vehicleType}`
                          : ""}
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-300">
                      {
                        assignment.dispatchStatus
                      }
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <AssignmentDetail
                      label="Customer Contact"
                      value={
                        assignment.customerContact
                      }
                    />

                    <AssignmentDetail
                      label="Pickup Location"
                      value={
                        assignment.pickupLocation ||
                        assignment.customerLocation
                      }
                    />

                    <AssignmentDetail
                      label="Destination Garage"
                      value={
                        assignment.garageName ||
                        assignment.destinationGarage
                      }
                    />

                    <AssignmentDetail
                      label="Truck"
                      value={
                        assignment.truckNumber
                      }
                    />

                    <AssignmentDetail
                      label="Estimated Distance"
                      value={
                        assignment.estimatedDistance
                      }
                    />

                    <AssignmentDetail
                      label="Estimated Arrival"
                      value={
                        assignment.estimatedArrivalTime
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenRoute(
                        assignment
                      )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-300 transition hover:bg-cyan-400/15"
                  >
                    <Route className="h-4 w-4" />

                    View Full Route
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// TOW HISTORY
//
// Completed tow jobs only.
// Loaded from:
//
// GET /api/tow-dispatches/driver/:driverId/history
// ======================================================

function TowHistorySection({
  history,
  isLoading,
  error,
  onRefresh,
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Completed Operations"
          title="Tow History"
          description="Review towing jobs that you have successfully completed."
        />

        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            isLoading
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isLoading
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh History
        </button>
      </div>

      {/* SUMMARY */}

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-3">
              <History className="h-6 w-6 text-teal-300" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Completed Tow Jobs
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {
                  history.length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Status
              </p>

              <p className="mt-1 font-black text-emerald-300">
                Completed Operations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY LIST */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 border-b border-white/10 p-5 sm:p-6">
          <History className="h-5 w-5 text-teal-300" />

          <div>
            <p className="font-black">
              Completed Tow Records
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Completed assignments are stored here instead of the active Tow Assignments list.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-teal-400" />
          </div>
        ) : error ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />

            <h3 className="mt-5 text-lg font-black text-red-300">
              Unable to Load Tow History
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={
                onRefresh
              }
              className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />

              Try Again
            </button>
          </div>
        ) : history.length ===
          0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <History className="h-12 w-12 text-slate-600" />

            <h3 className="mt-6 text-xl font-black">
              No Tow History Yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              When you complete a tow assignment, it will automatically move from Tow Assignments to this history page.
            </p>
          </div>
        ) : (
          <div className="max-h-[720px] space-y-4 overflow-y-auto p-4 sm:p-6">
            {history.map(
              (
                item
              ) => {
                const towCharge =
                  Number(
                    item.towCharge ||
                      0
                  );

                return (
                  <div
                    key={
                      item.dispatchId
                    }
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60"
                  >
                    {/* CARD HEADER */}

                    <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-400">
                            Dispatch #
                            {
                              item.dispatchId
                            }
                          </p>

                          <h3 className="mt-1 text-lg font-black text-white">
                            {item.customerName ||
                              "Customer"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.vehicleNumber ||
                              "Vehicle"}

                            {item.vehicleType
                              ? ` • ${item.vehicleType}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <span className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        Completed
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                      <HistoryDetail
                        icon={
                          Truck
                        }
                        label="Tow Truck"
                        value={
                          item.truckNumber ||
                          "N/A"
                        }
                      />

                      <HistoryDetail
                        icon={
                          Phone
                        }
                        label="Customer Contact"
                        value={
                          item.customerContact ||
                          "N/A"
                        }
                      />

                      <HistoryDetail
                        icon={
                          MapPin
                        }
                        label="Pickup Location"
                        value={
                          item.pickupLocation ||
                          item.customerLocation ||
                          "N/A"
                        }
                      />

                      <HistoryDetail
                        icon={
                          Building2
                        }
                        label="Destination Garage"
                        value={
                          item.garageName ||
                          item.destinationGarage ||
                          "N/A"
                        }
                      />

                      <HistoryDetail
                        icon={
                          Clock3
                        }
                        label="Dispatch Date"
                        value={
                          item.dispatchDate ||
                          "N/A"
                        }
                      />

                      <HistoryDetail
                        icon={
                          Clock3
                        }
                        label="Dispatch Time"
                        value={
                          item.dispatchTime ||
                          "N/A"
                        }
                      />
                    </div>

                    {/* TOW CHARGE */}

                    {towCharge >
                      0 && (
                      <div className="border-t border-white/10 px-5 py-4">
                        <div className="flex flex-col gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                              Tow Service Charge
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Stored charge for this completed tow dispatch
                            </p>
                          </div>

                          <p className="text-lg font-black text-cyan-300">
                            {
                              formatLKR(
                                towCharge
                              )
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* COMPLETED JOURNEY INFO */}

                    <div className="border-t border-white/10 bg-emerald-400/[0.025] px-5 py-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                        <div>
                          <p className="text-sm font-black text-emerald-300">
                            Tow Journey Completed
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Vehicle{" "}
                            <span className="font-bold text-slate-300">
                              {item.vehicleNumber ||
                                "N/A"}
                            </span>{" "}
                            was transported successfully to{" "}
                            <span className="font-bold text-slate-300">
                              {item.garageName ||
                                item.destinationGarage ||
                                "the selected garage"}
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// TOW HISTORY DETAIL
// ======================================================

function HistoryDetail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-teal-400/10 p-2">
          <Icon className="h-4 w-4 text-teal-300" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-slate-200">
            {value ||
              "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
// ======================================================
// ROUTE MAP MODAL
//
// A = EXTERNAL TOW TRUCK LOCATION
// B = BREAKDOWN VEHICLE LOCATION
// C = SELECTED GARAGE
//
// FINAL FLOW:
//
// APPROVED
//    ↓
// EN_ROUTE_TO_CUSTOMER
//    ↓
// ARRIVED_AT_CUSTOMER
//    ↓
// EN_ROUTE_TO_GARAGE
//    ↓
// ARRIVED_AT_GARAGE
//    ↓
// COMPLETED
// ======================================================

function RouteMapModal({
  assignment,
  driver,
  onJourneyUpdated,
  onClose,
}) {
  const [
    driverLocation,
    setDriverLocation,
  ] = useState(null);

  // ====================================================
  // STABLE ROUTE DRIVER LOCATION
  //
  // Small GPS movements should not continuously
  // recalculate the full road route.
  // ====================================================

  const [
    routeDriverLocation,
    setRouteDriverLocation,
  ] = useState(null);

  const lastRouteDriverLocationRef =
    useRef(null);

  const ROUTE_RECALCULATE_DISTANCE_KM =
    0.05;

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(true);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [
    legOne,
    setLegOne,
  ] = useState(null);

  const [
    legTwo,
    setLegTwo,
  ] = useState(null);

  // ====================================================
  // BREAKDOWN VEHICLE LOCATION
  // ====================================================

  const breakdownLocation =
    useMemo(() => {
      const latitude =
        finiteNumber(
          assignment?.customerLatitude
        );

      const longitude =
        finiteNumber(
          assignment?.customerLongitude
        );

      return (
        latitude !== null &&
        longitude !== null
      )
        ? [
            latitude,
            longitude,
          ]
        : null;
    }, [
      assignment?.customerLatitude,
      assignment?.customerLongitude,
    ]);

  // ====================================================
  // SELECTED GARAGE LOCATION
  // ====================================================

  const garageLocation =
    useMemo(() => {
      const latitude =
        finiteNumber(
          assignment?.garageLatitude
        );

      const longitude =
        finiteNumber(
          assignment?.garageLongitude
        );

      return (
        latitude !== null &&
        longitude !== null
      )
        ? [
            latitude,
            longitude,
          ]
        : null;
    }, [
      assignment?.garageLatitude,
      assignment?.garageLongitude,
    ]);

  // ====================================================
  // EXTERNAL TOW TRUCK LOCATION FROM DATABASE
  //
  // IMPORTANT:
  // Browser GPS is NOT used.
  //
  // A = tow_truck.latitude / longitude
  // B = service_request.customer_latitude / longitude
  // C = garage.latitude / longitude
  // ====================================================

  useEffect(() => {
    setLocationLoading(
      true
    );

    setLocationError(
      ""
    );

    const registeredLatitude =
      finiteNumber(
        assignment?.truckLatitude,
        driver?.latitude
      );

    const registeredLongitude =
      finiteNumber(
        assignment?.truckLongitude,
        driver?.longitude
      );

    if (
      registeredLatitude ===
        null ||
      registeredLongitude ===
        null
    ) {
      setDriverLocation(
        null
      );

      setRouteDriverLocation(
        null
      );

      lastRouteDriverLocationRef.current =
        null;

      setLocationError(
        "Registered external tow truck coordinates are unavailable."
      );

      setLocationLoading(
        false
      );

      return;
    }

    const registeredLocation = [
      registeredLatitude,
      registeredLongitude,
    ];

    setDriverLocation(
      registeredLocation
    );

    setRouteDriverLocation(
      registeredLocation
    );

    lastRouteDriverLocationRef.current =
      registeredLocation;

    setLocationLoading(
      false
    );
  }, [
    driver?.latitude,
    driver?.longitude,
    assignment?.truckLatitude,
    assignment?.truckLongitude,
  ]);

  // ====================================================
  // STABILISE ROUTE LOCATION
  // ====================================================

  useEffect(() => {
    if (
      !driverLocation
    ) {
      return;
    }

    const previous =
      lastRouteDriverLocationRef.current;

    if (
      !previous
    ) {
      lastRouteDriverLocationRef.current =
        driverLocation;

      setRouteDriverLocation(
        driverLocation
      );

      return;
    }

    const movedKm =
      haversineDistanceKm(
        previous,
        driverLocation
      );

    if (
      movedKm >=
      ROUTE_RECALCULATE_DISTANCE_KM
    ) {
      lastRouteDriverLocationRef.current =
        driverLocation;

      setRouteDriverLocation(
        driverLocation
      );
    }
  }, [
    driverLocation?.[0],
    driverLocation?.[1],
  ]);

  // ====================================================
  // FIRST ROUTE LEG
  // TRUCK → CUSTOMER
  // ====================================================

  useEffect(() => {
    if (
      routeDriverLocation &&
      breakdownLocation
    ) {
      setLegOne(
        fallbackRouteMetrics(
          routeDriverLocation,
          breakdownLocation
        )
      );
    }
  }, [
    routeDriverLocation?.[0],
    routeDriverLocation?.[1],
    breakdownLocation?.[0],
    breakdownLocation?.[1],
  ]);

  // ====================================================
  // SECOND ROUTE LEG
  // CUSTOMER → GARAGE
  // ====================================================

  useEffect(() => {
    if (
      breakdownLocation &&
      garageLocation
    ) {
      setLegTwo(
        fallbackRouteMetrics(
          breakdownLocation,
          garageLocation
        )
      );
    }
  }, [
    breakdownLocation?.[0],
    breakdownLocation?.[1],
    garageLocation?.[0],
    garageLocation?.[1],
  ]);

  const legOneDistance =
    Number(
      legOne?.distanceKm ||
        0
    );

  const legTwoDistance =
    Number(
      legTwo?.distanceKm ||
        0
    );

  const legOneMinutes =
    Number(
      legOne?.durationMinutes ||
        0
    );

  const legTwoMinutes =
    Number(
      legTwo?.durationMinutes ||
        0
    );

  const legOnePrice =
    calculateTowPrice(
      legOneDistance
    );

  const legTwoPrice =
    calculateTowPrice(
      legTwoDistance
    );

  const totalDistance =
    legOneDistance +
    legTwoDistance;

  const totalMinutes =
    legOneMinutes +
    legTwoMinutes;

  const calculatedTotalPrice =
    legOnePrice +
    legTwoPrice;

  // Prefer the saved backend tow charge when available.

  const savedTowCharge =
    Number(
      assignment?.towCharge ||
        0
    );

  const totalPrice =
    savedTowCharge > 0
      ? savedTowCharge
      : calculatedTotalPrice;

  const mapReady =
    driverLocation &&
    routeDriverLocation &&
    breakdownLocation &&
    garageLocation;

  const driverDisplayLocation =
    routeDriverLocation ||
    driverLocation;

  // ====================================================
  // JOURNEY STATUS
  // ====================================================

  const [
    journeyStatus,
    setJourneyStatus,
  ] = useState(
    String(
      assignment?.dispatchStatus ||
        "Approved"
    ).trim()
  );

  const [
    journeyUpdating,
    setJourneyUpdating,
  ] = useState(false);

  const [
    journeyMessage,
    setJourneyMessage,
  ] = useState({
    type:
      "",

    text:
      "",
  });

  const [
    journeyConfirmation,
    setJourneyConfirmation,
  ] = useState({
    open:
      false,

    stage:
      "",

    title:
      "",

    message:
      "",
  });

  useEffect(() => {
    setJourneyStatus(
      String(
        assignment?.dispatchStatus ||
          "Approved"
      ).trim()
    );
  }, [
    assignment?.dispatchStatus,
  ]);

  // ====================================================
  // UPDATE JOURNEY STAGE
  // ====================================================

  const updateJourneyStage =
    async (
      stage,
      confirmationMessage
    ) => {
      const dispatchId =
        Number(
          assignment?.dispatchId
        );

      const driverId =
        Number(
          driver?.driverId
        );

      if (
        !Number.isInteger(
          dispatchId
        ) ||
        dispatchId <= 0
      ) {
        setJourneyMessage({
          type:
            "error",

          text:
            "Unable to identify the tow dispatch.",
        });

        return;
      }

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        setJourneyMessage({
          type:
            "error",

          text:
            "Unable to identify the external driver.",
        });

        return;
      }

      // ================================================
      // SHOW CONFIRMATION MODAL FIRST
      // ================================================

      if (
        confirmationMessage
      ) {
        const stageTitles = {
          EN_ROUTE_TO_CUSTOMER:
            "Confirm Journey Start",

          ARRIVED_AT_CUSTOMER:
            "Confirm Arrival",

          EN_ROUTE_TO_GARAGE:
            "Confirm Journey to Garage",

          ARRIVED_AT_GARAGE:
            "Confirm Garage Arrival",

          COMPLETED:
            "Complete Tow Job",
        };

        setJourneyConfirmation({
          open:
            true,

          stage,

          title:
            stageTitles[
              stage
            ] ||
            "Confirm Journey Update",

          message:
            confirmationMessage,
        });

        return;
      }

      // ================================================
      // SEND JOURNEY UPDATE TO BACKEND
      // ================================================

      try {
        setJourneyUpdating(
          true
        );

        setJourneyMessage({
          type:
            "",

          text:
            "",
        });

        const response =
          await fetch(
            `http://localhost:5000/api/tow-dispatches/${dispatchId}/journey-stage`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  driverId,

                  stage,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to update the journey."
          );
        }

        const nextStatus =
          data?.dispatch
            ?.dispatchStatus ||
          stage;

        setJourneyStatus(
          nextStatus
        );

        setJourneyMessage({
          type:
            "success",

          text:
            data.message ||
            "Journey updated successfully.",
        });

        // Parent component:
        //
        // COMPLETED:
        // - removes assignment
        // - clears dashboard active job
        // - closes route modal
        // - reloads Tow History

        onJourneyUpdated?.({
          ...assignment,

          ...(data.dispatch ||
            {}),

          dispatchStatus:
            nextStatus,
        });
      } catch (error) {
        console.error(
          "External driver journey update error:",
          error
        );

        setJourneyMessage({
          type:
            "error",

          text:
            error.message ||
            "Unable to update the journey.",
        });
      } finally {
        setJourneyUpdating(
          false
        );
      }
    };

  // ====================================================
  // CLOSE CONFIRMATION
  // ====================================================

  const closeJourneyConfirmation =
    () => {
      if (
        journeyUpdating
      ) {
        return;
      }

      setJourneyConfirmation({
        open:
          false,

        stage:
          "",

        title:
          "",

        message:
          "",
      });
    };

  // ====================================================
  // CONFIRM JOURNEY STAGE
  // ====================================================

  const confirmJourneyStage =
    async () => {
      const selectedStage =
        journeyConfirmation.stage;

      if (
        !selectedStage
      ) {
        closeJourneyConfirmation();

        return;
      }

      setJourneyConfirmation({
        open:
          false,

        stage:
          "",

        title:
          "",

        message:
          "",
      });

      await updateJourneyStage(
        selectedStage,
        null
      );
    };

  const normalizedJourneyStatus =
    String(
      journeyStatus ||
        ""
    )
      .trim()
      .toUpperCase();

  // ====================================================
  // JOURNEY BUTTON CONDITIONS
  // ====================================================

  const canStartCustomerJourney =
    normalizedJourneyStatus ===
      "APPROVED" ||
    normalizedJourneyStatus ===
      "DISPATCHED";

  const canConfirmCustomerArrival =
    normalizedJourneyStatus ===
    "EN_ROUTE_TO_CUSTOMER";

  const canStartGarageJourney =
    normalizedJourneyStatus ===
    "ARRIVED_AT_CUSTOMER";

  const canConfirmGarageArrival =
    normalizedJourneyStatus ===
    "EN_ROUTE_TO_GARAGE";

  // Driver can complete tow job ONLY after arrival
  // at selected garage.

  const canCompleteTowJob =
    normalizedJourneyStatus ===
    "ARRIVED_AT_GARAGE";

  const towJobCompleted =
    normalizedJourneyStatus ===
    "COMPLETED";

  return (
    <motion.div
      initial={{
        opacity:
          0,
      }}
      animate={{
        opacity:
          1,
      }}
      exit={{
        opacity:
          0,
      }}
      onMouseDown={
        onClose
      }
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-black/85 p-2 backdrop-blur-md sm:p-4"
    >
      <motion.div
        initial={{
          opacity:
            0,

          y:
            24,

          scale:
            0.98,
        }}
        animate={{
          opacity:
            1,

          y:
            0,

          scale:
            1,
        }}
        exit={{
          opacity:
            0,

          y:
            20,

          scale:
            0.98,
        }}
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="mx-auto flex max-h-[94vh] w-full max-w-7xl flex-col overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-[#080d14] shadow-2xl"
      >
        {/* ==================================================
            MODAL HEADER
        ================================================== */}

        <div className="sticky top-0 z-[1200] flex items-center justify-between border-b border-white/10 bg-[#080d14]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">
              Live Tow Navigation
            </p>

            <h2 className="mt-1 text-lg font-black sm:text-2xl">
              Driver Location → Breakdown Vehicle → Selected Garage
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Dispatch #
              {
                assignment.dispatchId
              }{" "}
              •{" "}
              {assignment.truckNumber ||
                driver.truckNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ==================================================
            MAP + ROUTE DETAILS
        ================================================== */}

        <div className="grid shrink-0 lg:grid-cols-[1.55fr_0.75fr]">

          {/* MAP */}

          <div
            onWheel={(
              event
            ) => {
              event.stopPropagation();
            }}
            className="relative min-h-[420px] lg:min-h-[650px]"
          >
            {mapReady ? (
              <MapContainer
                center={
                  breakdownLocation
                }
                zoom={
                  12
                }
                scrollWheelZoom={
                  true
                }
                className="h-full min-h-[420px] w-full lg:min-h-[650px]"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRouteBounds
                  driverLocation={
                    driverDisplayLocation
                  }
                  breakdownLocation={
                    breakdownLocation
                  }
                  garageLocation={
                    garageLocation
                  }
                />

                {/* EXTERNAL TRUCK */}

                <Marker
                  position={
                    driverDisplayLocation
                  }
                  icon={
                    driverTruckIcon
                  }
                >
                  <Popup>
                    <strong>
                      External Driver Location
                    </strong>

                    <br />

                    {assignment.truckNumber ||
                      driver.truckNumber}

                    <br />

                    Registered external truck location
                  </Popup>
                </Marker>

                {/* BREAKDOWN VEHICLE */}

                <Marker
                  position={
                    breakdownLocation
                  }
                  icon={
                    breakdownVehicleIcon
                  }
                >
                  <Popup>
                    <strong>
                      Breakdown Vehicle Location
                    </strong>

                    <br />

                    {assignment.customerName ||
                      "Customer"}

                    <br />

                    {assignment.vehicleNumber ||
                      "Vehicle"}
                  </Popup>
                </Marker>

                {/* GARAGE */}

                <Marker
                  position={
                    garageLocation
                  }
                  icon={
                    garageIcon
                  }
                >
                  <Popup>
                    <strong>
                      Selected Garage Location
                    </strong>

                    <br />

                    {assignment.garageName ||
                      "Selected Garage"}

                    {assignment.garageAddress && (
                      <>
                        <br />

                        {
                          assignment.garageAddress
                        }
                      </>
                    )}
                  </Popup>
                </Marker>

                {/* ROUTE 1 */}

                <RoadRoute
                  from={
                    routeDriverLocation
                  }
                  to={
                    breakdownLocation
                  }
                  color="#14b8a6"
                  onRouteData={
                    setLegOne
                  }
                />

                {/* ROUTE 2 */}

                <RoadRoute
                  from={
                    breakdownLocation
                  }
                  to={
                    garageLocation
                  }
                  color="#38bdf8"
                  onRouteData={
                    setLegTwo
                  }
                />

                <CircleMarker
                  center={
                    breakdownLocation
                  }
                  radius={
                    5
                  }
                  pathOptions={{
                    color:
                      "#ffffff",

                    fillColor:
                      "#ffffff",

                    fillOpacity:
                      1,
                  }}
                />
              </MapContainer>
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-950/70 p-8 text-center">
                <div>
                  {locationLoading ? (
                    <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-teal-400" />
                  ) : (
                    <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
                  )}

                  <p className="mt-4 font-black">
                    {locationLoading
                      ? "Loading live route..."
                      : "Route location unavailable"}
                  </p>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {!breakdownLocation
                      ? "Breakdown vehicle GPS coordinates are missing."
                      : !garageLocation
                        ? "Selected garage GPS coordinates are missing."
                        : locationError ||
                          "Waiting for external tow truck location."}
                  </p>
                </div>
              </div>
            )}

            {/* MAP LEGEND */}

            <div className="pointer-events-none absolute bottom-4 left-4 z-[800] rounded-xl border border-white/10 bg-[#080d14]/95 p-3 text-xs font-bold shadow-xl backdrop-blur">
              <p className="text-teal-300">
                🚚 External Driver Location
              </p>

              <p className="mt-1 text-violet-300">
                🚗 Breakdown Vehicle Location
              </p>

              <p className="mt-1 text-sky-300">
                🏢 Selected Garage Location
              </p>
            </div>
          </div>

          {/* ==================================================
              RIGHT ROUTE PANEL
          ================================================== */}

          <div className="border-t border-white/10 p-4 lg:border-l lg:border-t-0 lg:p-5">
            {locationError && (
              <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-200">
                {
                  locationError
                }
              </div>
            )}

            {/* ================================================
                LEG ONE
            ================================================ */}

            <RouteLegCard
              title="Driver Location → Breakdown Vehicle"
              subtitle={`${driver.fullName || "External Driver"} to ${
                assignment.pickupLocation ||
                assignment.customerLocation ||
                "Breakdown Vehicle Location"
              }`}
              distance={
                legOneDistance
              }
              minutes={
                legOneMinutes
              }
              price={
                legOnePrice
              }
              routeReady={
                Boolean(
                  legOne
                )
              }
              roadRouteAvailable={
                legOne
                  ?.routeAvailable !==
                false
              }
            />

            {/* ================================================
                CUSTOMER JOURNEY ACTIONS
            ================================================ */}

            <div className="mt-3 space-y-2">
              {canStartCustomerJourney && (
                <button
                  type="button"
                  disabled={
                    journeyUpdating
                  }
                  onClick={() =>
                    updateJourneyStage(
                      "EN_ROUTE_TO_CUSTOMER",
                      "Start the journey from the external tow truck location to the customer's breakdown vehicle?"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {journeyUpdating ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}

                  Start Journey to Customer
                </button>
              )}

              {canConfirmCustomerArrival && (
                <button
                  type="button"
                  disabled={
                    journeyUpdating
                  }
                  onClick={() =>
                    updateJourneyStage(
                      "ARRIVED_AT_CUSTOMER",
                      "Confirm that you have arrived at the customer's breakdown location?"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-black text-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {journeyUpdating ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}

                  Arrived at Breakdown Vehicle
                </button>
              )}

              {[
                "ARRIVED_AT_CUSTOMER",
                "EN_ROUTE_TO_GARAGE",
                "ARRIVED_AT_GARAGE",
                "COMPLETED",
              ].includes(
                normalizedJourneyStatus
              ) && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs font-bold text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />

                    Customer pickup stage confirmed.
                  </div>
                </div>
              )}
            </div>

            {/* ================================================
                LEG TWO
            ================================================ */}

            <div className="mt-3">
              <RouteLegCard
                title="Breakdown Vehicle → Selected Garage"
                subtitle={`${
                  assignment.pickupLocation ||
                  assignment.customerLocation ||
                  "Breakdown Vehicle Location"
                } to ${
                  assignment.garageName ||
                  assignment.destinationGarage ||
                  "Selected Garage"
                }`}
                distance={
                  legTwoDistance
                }
                minutes={
                  legTwoMinutes
                }
                price={
                  legTwoPrice
                }
                routeReady={
                  Boolean(
                    legTwo
                  )
                }
                roadRouteAvailable={
                  legTwo
                    ?.routeAvailable !==
                  false
                }
              />
            </div>

            {/* ================================================
                GARAGE JOURNEY ACTIONS
            ================================================ */}

            <div className="mt-3 space-y-2">
              {canStartGarageJourney && (
                <button
                  type="button"
                  disabled={
                    journeyUpdating
                  }
                  onClick={() =>
                    updateJourneyStage(
                      "EN_ROUTE_TO_GARAGE",
                      "Start the journey from the breakdown location to the selected garage?"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {journeyUpdating ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Route className="h-5 w-5" />
                  )}

                  Start Journey to Garage
                </button>
              )}

              {canConfirmGarageArrival && (
                <button
                  type="button"
                  disabled={
                    journeyUpdating
                  }
                  onClick={() =>
                    updateJourneyStage(
                      "ARRIVED_AT_GARAGE",
                      "Confirm that the tow truck and customer vehicle have arrived at the selected garage?"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {journeyUpdating ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}

                  Arrived at Selected Garage
                </button>
              )}

              {/* ==============================================
                  ARRIVED AT GARAGE
                  WAITING FOR DRIVER TO COMPLETE TOW JOB
              ============================================== */}

              {canCompleteTowJob && (
                <>
                  <div className="rounded-xl border border-sky-400/25 bg-sky-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />

                      <div>
                        <p className="text-sm font-black text-sky-200">
                          Vehicle Arrived at Garage
                        </p>

                        <p className="mt-2 text-xs leading-5 text-sky-100/70">
                          The customer vehicle has reached the selected garage. Complete the tow job after the vehicle handover is finished.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      COMPLETE TOW JOB BUTTON
                  ========================================== */}

                  <button
                    type="button"
                    disabled={
                      journeyUpdating
                    }
                    onClick={() =>
                      updateJourneyStage(
                        "COMPLETED",
                        `Confirm that the tow service for vehicle ${
                          assignment.vehicleNumber ||
                          "this vehicle"
                        } has been completed at ${
                          assignment.garageName ||
                          "the selected garage"
                        }? This job will move from Tow Assignments to Tow History.`
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {journeyUpdating ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}

                    Complete Tow Job
                  </button>
                </>
              )}

              {/* ==============================================
                  FINAL COMPLETED STATE
              ============================================== */}

              {towJobCompleted && (
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                    <div>
                      <p className="text-sm font-black text-emerald-200">
                        Tow Job Completed
                      </p>

                      <p className="mt-2 text-xs leading-5 text-emerald-100/70">
                        This tow assignment has been completed and is stored in Tow History.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================
                API SUCCESS / ERROR MESSAGE
            ================================================ */}

            {journeyMessage.text && (
              <div
                className={`mt-4 rounded-xl border p-4 text-xs font-bold leading-5 ${
                  journeyMessage.type ===
                  "success"
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/25 bg-red-400/10 text-red-200"
                }`}
              >
                {
                  journeyMessage.text
                }
              </div>
            )}

            {/* ================================================
                CURRENT STATUS
            ================================================ */}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan-300" />

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Current Journey Status
                </p>
              </div>

              <p className="mt-2 break-words text-sm font-black text-cyan-300">
                {
                  journeyStatus
                }
              </p>
            </div>

            {/* ================================================
                COMPLETE ROUTE SUMMARY
            ================================================ */}

            <div className="mt-4 rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-cyan-400/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-teal-300" />

                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">
                  Complete Journey
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <RouteSummaryRow
                  label="Total Distance"
                  value={
                    formatDistance(
                      totalDistance
                    )
                  }
                />

                <RouteSummaryRow
                  label="Total Time"
                  value={
                    formatDuration(
                      totalMinutes
                    )
                  }
                />

                <RouteSummaryRow
                  label="Tow Service Charge"
                  value={
                    formatLKR(
                      totalPrice
                    )
                  }
                  strong
                />
              </div>
            </div>

            {/* ================================================
                PRICE INFO
            ================================================ */}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-slate-500">
              <div className="flex items-start gap-3">
                <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />

                <p>
                  Tow pricing is based on the configured customer tow calculation. The saved dispatch charge is used when it is available.
                </p>
              </div>
            </div>

            {/* ================================================
                DESTINATION
            ================================================ */}

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-300" />

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Destination
                </p>
              </div>

              <p className="mt-2 font-black">
                {assignment.garageName ||
                  "Selected Garage"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {assignment.garageAddress ||
                  "Garage address unavailable"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            JOURNEY CONFIRMATION POPUP
        ================================================== */}

        <AnimatePresence>
          {journeyConfirmation.open && (
            <motion.div
              initial={{
                opacity:
                  0,
              }}
              animate={{
                opacity:
                  1,
              }}
              exit={{
                opacity:
                  0,
              }}
              onMouseDown={
                closeJourneyConfirmation
              }
              className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{
                  opacity:
                    0,

                  y:
                    20,

                  scale:
                    0.97,
                }}
                animate={{
                  opacity:
                    1,

                  y:
                    0,

                  scale:
                    1,
                }}
                exit={{
                  opacity:
                    0,

                  y:
                    15,

                  scale:
                    0.97,
                }}
                onMouseDown={(
                  event
                ) =>
                  event.stopPropagation()
                }
                className="w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#080d14] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
              >
                <div className="h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400" />

                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">

                    {/* CONFIRMATION ICON */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                      {journeyConfirmation.stage ===
                      "COMPLETED" ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                      ) : journeyConfirmation.stage ===
                        "ARRIVED_AT_GARAGE" ? (
                        <Building2 className="h-6 w-6" />
                      ) : journeyConfirmation.stage ===
                        "ARRIVED_AT_CUSTOMER" ? (
                        <MapPin className="h-6 w-6" />
                      ) : journeyConfirmation.stage ===
                        "EN_ROUTE_TO_GARAGE" ? (
                        <Route className="h-6 w-6" />
                      ) : (
                        <Navigation className="h-6 w-6" />
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        journeyUpdating
                      }
                      onClick={
                        closeJourneyConfirmation
                      }
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                      aria-label="Close confirmation"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Journey Confirmation
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    {
                      journeyConfirmation.title
                    }
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {
                      journeyConfirmation.message
                    }
                  </p>

                  {/* COMPLETE JOB INFO */}

                  {journeyConfirmation.stage ===
                    "COMPLETED" && (
                    <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <History className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                        <p className="text-xs leading-5 text-emerald-100/80">
                          After completion, this job will disappear from active Tow Assignments and remain available in Tow History.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        journeyUpdating
                      }
                      onClick={
                        closeJourneyConfirmation
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        journeyUpdating
                      }
                      onClick={
                        confirmJourneyStage
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {journeyUpdating ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      ) : journeyConfirmation.stage ===
                        "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Navigation className="h-5 w-5" />
                      )}

                      {journeyConfirmation.stage ===
                      "COMPLETED"
                        ? "Complete Job"
                        : "Confirm"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ======================================================
// ROUTE LEG CARD
// ======================================================

function RouteLegCard({
  title,
  subtitle,
  distance,
  minutes,
  price,
  routeReady,
  roadRouteAvailable = true,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">
            {
              title
            }
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {
              subtitle
            }
          </p>
        </div>

        <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-2.5 py-1 text-[10px] font-black text-teal-300">
          {routeReady
            ? roadRouteAvailable
              ? "ROAD ROUTE READY"
              : "ROUTE ESTIMATE"
            : "CALCULATING"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <SmallMetric
          label="KM"
          value={
            formatDistance(
              distance
            )
          }
        />

        <SmallMetric
          label="ETA"
          value={
            formatDuration(
              minutes
            )
          }
        />

        <SmallMetric
          label="PRICE"
          value={
            formatLKR(
              price
            )
          }
        />
      </div>
    </div>
  );
}

// ======================================================
// SMALL ROUTE METRIC
// ======================================================

function SmallMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
        {
          label
        }
      </p>

      <p className="mt-1 break-words text-xs font-black text-white">
        {
          value
        }
      </p>
    </div>
  );
}

// ======================================================
// ROUTE SUMMARY ROW
// ======================================================

function RouteSummaryRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500">
        {
          label
        }
      </span>

      <span
        className={
          strong
            ? "text-sm font-black text-teal-300"
            : "text-sm font-black text-white"
        }
      >
        {
          value
        }
      </span>
    </div>
  );
}

// ======================================================
// MY TOW TRUCK
// ======================================================

function TruckSection({
  driver,
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Registered Vehicle"
        title="My Tow Truck"
        description="Tow truck information linked to your External Driver account."
      />

      <div className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Truck className="h-10 w-10 text-teal-300" />

            <div>
              <p className="font-mono text-2xl font-black">
                {driver.truckNumber ||
                  "N/A"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {driver.truckType ||
                  "External Tow Truck"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2">
          <InformationBox
            label="Truck Number"
            value={
              driver.truckNumber
            }
          />

          <InformationBox
            label="Truck Type"
            value={
              driver.truckType
            }
          />

          <InformationBox
            label="Truck Model"
            value={
              driver.truckModel
            }
          />

          <InformationBox
            label="Capacity"
            value={
              driver.capacityTons
                ? `${driver.capacityTons} Tons`
                : ""
            }
          />

          <InformationBox
            label="Truck Status"
            value={
              driver.truckStatus ||
              "External"
            }
          />

          <InformationBox
            label="Assignment Status"
            value={
              driver.assignmentStatus ||
              "Active"
            }
          />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// ASSIGNED GARAGE
// ======================================================

function GarageSection({
  driver,
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Partner Garage"
        title="Assigned Garage"
        description="Garage associated with your external tow truck registration."
      />

      <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <DetailCard
            icon={
              Building2
            }
            label="Garage Name"
            value={
              driver.garageName
            }
          />

          <DetailCard
            icon={
              MapPin
            }
            label="Address"
            value={
              driver.garageAddress
            }
          />

          <DetailCard
            icon={
              MapPin
            }
            label="District"
            value={
              driver.garageDistrict
            }
          />

          <DetailCard
            icon={
              Phone
            }
            label="Contact Number"
            value={
              driver.garageContactNumber
            }
          />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// DRIVER PROFILE
// ======================================================

function ProfileSection({
  driver,
  onChangePassword,
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Driver Account"
        title="Driver Profile"
        description="Personal and account information linked to your External Driver profile."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <CircleUserRound className="mx-auto h-20 w-20 text-teal-300" />

          <h3 className="mt-5 text-xl font-black">
            {driver.fullName ||
              "External Driver"}
          </h3>

          <p className="mt-2 font-mono text-sm text-teal-300">
            {driver.externalDriverId ||
              driver.username}
          </p>

          <button
            type="button"
            onClick={
              onChangePassword
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-300"
          >
            <KeyRound className="h-4 w-4" />

            Change Password
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailCard
              icon={
                UserRound
              }
              label="Full Name"
              value={
                driver.fullName
              }
            />

            <DetailCard
              icon={
                UserRound
              }
              label="NIC"
              value={
                driver.nic
              }
            />

            <DetailCard
              icon={
                Mail
              }
              label="Email"
              value={
                driver.email
              }
            />

            <DetailCard
              icon={
                Phone
              }
              label="Contact Number"
              value={
                driver.contactNumber
              }
            />

            <DetailCard
              icon={
                ShieldCheck
              }
              label="Licence Number"
              value={
                driver.licenseNumber
              }
            />

            <DetailCard
              icon={
                Clock3
              }
              label="Experience"
              value={
                driver.experienceYears !==
                  null &&
                driver.experienceYears !==
                  undefined &&
                driver.experienceYears !==
                  ""
                  ? `${driver.experienceYears} Years`
                  : ""
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// COMMON UI
// ======================================================

function AssignmentDetail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
        {
          label
        }
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-300">
        {value ===
          null ||
        value ===
          undefined ||
        value ===
          ""
          ? "Not Available"
          : String(
              value
            )}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  secondary,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            {
              label
            }
          </p>

          <p className="mt-3 break-words text-lg font-black leading-snug">
            {value ||
              "Not Available"}
          </p>

          <p className="mt-1 break-words text-xs leading-5 text-slate-500">
            {secondary ||
              "—"}
          </p>
        </div>

        <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-3 text-teal-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-400">
        {
          eyebrow
        }
      </p>

      <h2 className="mt-2 text-2xl font-black sm:text-3xl">
        {
          title
        }
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {
              label
            }
          </p>

          <p className="mt-2 break-words text-sm font-black">
            {value ||
              "Not Available"}
          </p>
        </div>
      </div>
    </div>
  );
}

function InformationBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#080d14] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-2 break-words font-black">
        {value ||
          "Not Available"}
      </p>
    </div>
  );
}

// ======================================================
// PASSWORD FIELD
// ======================================================

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  disabled,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-300">
        {
          label
        }
      </label>

      <div className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

        <input
          type={
            show
              ? "text"
              : "password"
          }
          name={
            name
          }
          value={
            value
          }
          onChange={
            onChange
          }
          disabled={
            disabled
          }
          required
          autoComplete="off"
          placeholder={
            label
          }
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          disabled={
            disabled
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-teal-300 disabled:opacity-50"
        >
          {show ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}