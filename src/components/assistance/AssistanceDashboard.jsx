import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LayoutDashboard,
  Car,
  Search,
  Bell,
  User,
  Cpu,
  Menu,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Truck,
  MapPin,
  Route,
  Building2,
  ChevronRight,
  ClipboardPlus,
} from "lucide-react";

import AssistanceSidebar from "./AssistanceSidebar";
import IncidentDispatch from "./IncidentDispatch";
import CustomerCommunication from "./CustomerCommunication";
import ResourceSchedule from "./ResourceSchedule";
import CounterReceipt from "./CounterReceipt";
import ExperienceAudit from "./ExperienceAudit";
import AssistanceProfile from "./AssistanceProfile";

import garageImg from "../../assets/GarageCapacityimg.jpg";
import carQueueImg from "../../assets/PendingVehicles.png";
import techImg from "../../assets/Tech.jpg";

const API_ORIGIN = "http://localhost:5000";
const API_BASE_URL = `${API_ORIGIN}/api`;

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const normalizeStatus = (value) => {
  return String(value || "Pending")
    .trim()
    .toLowerCase();
};

const getStatusStyles = (status) => {
  const normalizedStatus =
    normalizeStatus(status);

  if (normalizedStatus === "accepted") {
    return {
      text: "text-green-400",
      border: "border-green-500/30",
      background: "bg-green-500/10",
    };
  }

  if (normalizedStatus === "rejected") {
    return {
      text: "text-red-400",
      border: "border-red-500/30",
      background: "bg-red-500/10",
    };
  }

  if (normalizedStatus === "completed") {
    return {
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      background: "bg-cyan-500/10",
    };
  }

  if (normalizedStatus === "cancelled") {
    return {
      text: "text-slate-400",
      border: "border-slate-500/30",
      background: "bg-slate-500/10",
    };
  }

  return {
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    background: "bg-yellow-500/10",
  };
};


const normaliseTowNotification = (item) => ({
  notificationId:
    item?.notificationId ??
    item?.notification_id ??
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
    item?.priority ||
    "MEDIUM",

  isRead:
    Boolean(
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

  dispatchId:
    item?.dispatchId ??
    item?.dispatch_id ??
    item?.referenceId ??
    item?.reference_id ??
    null,

  dispatchStatus:
    item?.dispatchStatus ??
    item?.dispatch_status ??
    "",

  requestId:
    item?.requestId ??
    item?.request_id ??
    null,

  ticketNumber:
    item?.ticketNumber ??
    item?.ticket_number ??
    "",

  customerName:
    item?.customerName ??
    item?.customer_name ??
    "",

  customerContact:
    item?.customerContact ??
    item?.customer_contact ??
    "",

  customerLocation:
    item?.customerLocation ??
    item?.customer_location ??
    "",

  vehicleNumber:
    item?.vehicleNumber ??
    item?.vehicle_number ??
    "",

  vehicleType:
    item?.vehicleType ??
    item?.vehicle_type ??
    "",

  truckNumber:
    item?.truckNumber ??
    item?.truck_number ??
    "",

  truckType:
    item?.truckType ??
    item?.truck_type ??
    "",

  truckModel:
    item?.truckModel ??
    item?.truck_model ??
    "",

  driverName:
    item?.driverName ??
    item?.driver_name ??
    "",

  driverContact:
    item?.driverContact ??
    item?.driver_contact ??
    "",

  garageName:
    item?.garageName ??
    item?.garage_name ??
    "",

  garageAddress:
    item?.garageAddress ??
    item?.garage_address ??
    "",
});

const formatTowNotificationDateTime = (
  notification
) => {
  const datePart =
    notification?.createdDate ||
    "";

  const timePart =
    notification?.createdTime ||
    "";

  if (!datePart) {
    return "";
  }

  const value = new Date(
    `${datePart}T${timePart || "00:00:00"}`
  );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return `${datePart} ${timePart}`.trim();
  }

  return value.toLocaleString(
    "en-LK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getAssistanceTowNotificationIcon = (
  type
) => {
  const value = String(
    type || ""
  ).toUpperCase();

  if (
    value.includes(
      "EN_ROUTE_CUSTOMER"
    )
  ) {
    return Truck;
  }

  if (
    value.includes(
      "REACHED_CUSTOMER"
    )
  ) {
    return MapPin;
  }

  if (
    value.includes(
      "EN_ROUTE_GARAGE"
    )
  ) {
    return Route;
  }

  if (
    value.includes(
      "REACHED_GARAGE"
    )
  ) {
    return Building2;
  }

  return Bell;
};

const getAssistanceTowNotificationAccent = (
  type
) => {
  const value = String(
    type || ""
  ).toUpperCase();

  if (
    value.includes(
      "EN_ROUTE_CUSTOMER"
    )
  ) {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }

  if (
    value.includes(
      "REACHED_CUSTOMER"
    )
  ) {
    return "border-violet-500/30 bg-violet-500/10 text-violet-300";
  }

  if (
    value.includes(
      "EN_ROUTE_GARAGE"
    )
  ) {
    return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  }

  if (
    value.includes(
      "REACHED_GARAGE"
    )
  ) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

const formatTowDispatchStatus = (value) => {
  const normalized = String(
    value || ""
  )
    .trim()
    .toUpperCase();

  const labels = {
    "PENDING VERIFICATION":
      "Pending Verification",
    APPROVED:
      "Approved",
    DISPATCHED:
      "Dispatched",
    EN_ROUTE_TO_CUSTOMER:
      "En Route to Customer",
    ARRIVED_AT_CUSTOMER:
      "Arrived at Customer",
    EN_ROUTE_TO_GARAGE:
      "En Route to Garage",
    ARRIVED_AT_GARAGE:
      "Arrived at Garage",
    COMPLETED:
      "Completed",
    REJECTED:
      "Rejected",
  };

  return labels[normalized] ||
    String(value || "Not available");
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AssistanceDashboard({
  onNavigate,
  resourceRequests = [],
}) {
  const [view, setView] =
    useState("Dashboard");

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    officerName,
    setOfficerName,
  ] = useState("Assistance Officer");

  const [
    officerProfilePhoto,
    setOfficerProfilePhoto,
  ] = useState(null);

  const [
    assistanceId,
    setAssistanceId,
  ] = useState(null);

  const [
    garageId,
    setGarageId,
  ] = useState(null);

  const [
    isShiftOn,
    setIsShiftOn,
  ] = useState(false);

  const [
    garageDetails,
    setGarageDetails,
  ] = useState({
    garageName: "",
    capacity: 0,
    currentCapacity: 0,
  });

  const [
    serviceRequests,
    setServiceRequests,
  ] = useState([]);

  const [
    completedVehicles,
    setCompletedVehicles,
  ] = useState([]);

  const [
    technicians,
    setTechnicians,
  ] = useState([]);

  const [
    isLoadingOfficer,
    setIsLoadingOfficer,
  ] = useState(true);

  const [
    isLoadingDashboard,
    setIsLoadingDashboard,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  const [
    actionLoadingId,
    setActionLoadingId,
  ] = useState(null);

  const [
    clearConfirmJob,
    setClearConfirmJob,
  ] = useState(null);

  // ====================================================
  // WALK-IN VEHICLE
  // ====================================================

  const [
    isWalkInOpen,
    setIsWalkInOpen,
  ] = useState(false);

  const [
    isWalkInSubmitting,
    setIsWalkInSubmitting,
  ] = useState(false);

  const [
    walkInForm,
    setWalkInForm,
  ] = useState({
    customerName: "",
    contact: "",
    vehicleNumber: "",
    vehicleType: "",
  });

  const [
    notification,
    setNotification,
  ] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // ====================================================
  // TOW JOURNEY NOTIFICATION CENTER
  // ====================================================

  const [
    towNotifications,
    setTowNotifications,
  ] = useState([]);

  const [
    towUnreadCount,
    setTowUnreadCount,
  ] = useState(0);

  const [
    towNotificationOpen,
    setTowNotificationOpen,
  ] = useState(false);

  const [
    towNotificationToasts,
    setTowNotificationToasts,
  ] = useState([]);

  const [
    selectedTowNotification,
    setSelectedTowNotification,
  ] = useState(null);

  const shownTowNotificationIdsRef =
    useRef(new Set());

  const towToastTimersRef =
    useRef(new Map());

  // ====================================================
  // SHOW NOTIFICATION
  // ====================================================

  const showNotification = (
    type,
    title,
    message
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });
  };

  const closeNotification = () => {
    setNotification({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  // ====================================================
  // TOW NOTIFICATION HELPERS
  // ====================================================

  const addTowNotificationToast =
    useCallback(
      (notificationItem) => {
        const notificationId =
          Number(
            notificationItem
              ?.notificationId
          );

        if (
          !Number.isInteger(
            notificationId
          ) ||
          notificationId <= 0
        ) {
          return;
        }

        if (
          shownTowNotificationIdsRef
            .current
            .has(notificationId)
        ) {
          return;
        }

        shownTowNotificationIdsRef
          .current
          .add(notificationId);

        setTowNotificationToasts(
          (previous) => [
            notificationItem,
            ...previous,
          ].slice(0, 4)
        );

        const timeoutId =
          window.setTimeout(
            () => {
              setTowNotificationToasts(
                (previous) =>
                  previous.filter(
                    (item) =>
                      Number(
                        item.notificationId
                      ) !==
                      notificationId
                  )
              );

              towToastTimersRef
                .current
                .delete(
                  notificationId
                );
            },
            8000
          );

        towToastTimersRef
          .current
          .set(
            notificationId,
            timeoutId
          );
      },
      []
    );

  const dismissTowNotificationToast =
    useCallback(
      (notificationId) => {
        const id = Number(
          notificationId
        );

        setTowNotificationToasts(
          (previous) =>
            previous.filter(
              (item) =>
                Number(
                  item.notificationId
                ) !== id
            )
        );

        const timeoutId =
          towToastTimersRef
            .current
            .get(id);

        if (timeoutId) {
          window.clearTimeout(
            timeoutId
          );

          towToastTimersRef
            .current
            .delete(id);
        }
      },
      []
    );

  const loadTowNotifications =
    useCallback(
      async (
        selectedAssistanceId =
          assistanceId,
        showNewToasts = true
      ) => {
        const numericAssistanceId =
          Number(
            selectedAssistanceId
          );

        if (
          !Number.isInteger(
            numericAssistanceId
          ) ||
          numericAssistanceId <= 0
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/notifications/assistance/${numericAssistanceId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Unable to load assistance notifications."
            );
          }

          const items =
            Array.isArray(
              result.notifications
            )
              ? result.notifications.map(
                  normaliseTowNotification
                )
              : [];

          setTowNotifications(
            items
          );

          setTowUnreadCount(
            Number(
              result.unreadCount ??
              items.filter(
                (item) =>
                  !item.isRead
              ).length
            )
          );

          if (
            showNewToasts
          ) {
            items
              .filter(
                (item) =>
                  !item.isRead
              )
              .slice()
              .reverse()
              .forEach(
                addTowNotificationToast
              );
          }
        } catch (error) {
          console.error(
            "Load assistance tow notifications error:",
            error
          );
        }
      },
      [
        assistanceId,
        addTowNotificationToast,
      ]
    );

  const markTowNotificationRead =
    useCallback(
      async (
        notificationId
      ) => {
        const id = Number(
          notificationId
        );

        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/notifications/${id}/read`,
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

          setTowNotifications(
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

          setTowUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );
        } catch (error) {
          console.error(
            "Mark assistance notification read error:",
            error
          );
        }
      },
      []
    );

  const markAllTowNotificationsRead =
    useCallback(
      async () => {
        const numericAssistanceId =
          Number(
            assistanceId
          );

        if (
          !Number.isInteger(
            numericAssistanceId
          ) ||
          numericAssistanceId <= 0 ||
          towUnreadCount <= 0
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/notifications/assistance/${numericAssistanceId}/read-all`,
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
                "Unable to mark assistance notifications as read."
            );
          }

          setTowNotifications(
            (previous) =>
              previous.map(
                (item) => ({
                  ...item,
                  isRead: true,
                })
              )
          );

          setTowUnreadCount(
            0
          );
        } catch (error) {
          console.error(
            "Mark all assistance notifications read error:",
            error
          );
        }
      },
      [
        assistanceId,
        towUnreadCount,
      ]
    );

  const handleTowNotificationClick =
    useCallback(
      async (
        notificationItem
      ) => {
        if (
          !notificationItem.isRead
        ) {
          await markTowNotificationRead(
            notificationItem
              .notificationId
          );
        }

        dismissTowNotificationToast(
          notificationItem
            .notificationId
        );

        setTowNotificationOpen(
          false
        );

        const targetPage = String(
          notificationItem?.targetPage ||
            ""
        )
          .trim()
          .toLowerCase();

        // New customer service request -> Resource Schedule
        if (
          targetPage ===
            "resource-schedule" ||
          targetPage ===
            "resource schedule"
        ) {
          setSelectedTowNotification(
            null
          );
          setView(
            "Resource Schedule"
          );
          setSearchQuery("");
          return;
        }

        // Customer chat message -> Customer Communication
        if (
          targetPage ===
            "customer-communication" ||
          targetPage ===
            "customer-comms" ||
          targetPage === "chat"
        ) {
          setSelectedTowNotification(
            null
          );
          setView(
            "Customer Comms"
          );
          setSearchQuery("");
          return;
        }

        // Explicit dispatch target -> Incident Dispatch
        if (
          targetPage ===
            "incident-dispatch" ||
          targetPage ===
            "incident dispatch"
        ) {
          setSelectedTowNotification(
            null
          );
          setView(
            "Incident Dispatch"
          );
          setSearchQuery("");
          return;
        }

        // Tow journey updates keep the existing details modal.
        setSelectedTowNotification({
          ...notificationItem,
          isRead: true,
        });
      },
      [
        dismissTowNotificationToast,
        markTowNotificationRead,
      ]
    );

  const handleViewTowDispatch =
    useCallback(() => {
      if (!selectedTowNotification) {
        return;
      }

      const targetPage = String(
        selectedTowNotification?.targetPage ||
          ""
      )
        .trim()
        .toLowerCase();

      setSelectedTowNotification(
        null
      );

      setTowNotificationOpen(
        false
      );

      if (
        targetPage ===
          "resource-schedule" ||
        targetPage ===
          "resource schedule"
      ) {
        setView(
          "Resource Schedule"
        );
      } else if (
        targetPage ===
          "customer-communication" ||
        targetPage ===
          "customer-comms" ||
        targetPage === "chat"
      ) {
        setView(
          "Customer Comms"
        );
      } else {
        setView(
          "Incident Dispatch"
        );
      }

      setSearchQuery("");
    }, [selectedTowNotification]);

  // ====================================================
  // BUILD ASSISTANCE PROFILE PHOTO URL
  // ====================================================

  const buildProfilePhotoUrl = (photoPath) => {
    if (!photoPath) {
      return null;
    }

    const normalizedPath = String(photoPath).trim();

    if (!normalizedPath) {
      return null;
    }

    if (normalizedPath.startsWith("http")) {
      return normalizedPath;
    }

    return `${API_ORIGIN}${normalizedPath}`;
  };

  // ====================================================
  // GET LOGGED-IN ASSISTANCE OFFICER
  // ====================================================

  const getStoredAssistanceUser = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        return null;
      }

      const staffUser =
        JSON.parse(storedStaffUser);

      const storedAssistanceId =
        Number(staffUser?.staffId);

      const role = String(
        staffUser?.role || ""
      )
        .trim()
        .toLowerCase();

      if (
        role !== "assistance" ||
        !Number.isInteger(
          storedAssistanceId
        ) ||
        storedAssistanceId <= 0
      ) {
        return null;
      }

      const storedLoginId =
        Number(
          staffUser?.loginId ??
            staffUser?.login_id
        );

      return {
        ...staffUser,
        staffId:
          storedAssistanceId,

        loginId:
          Number.isInteger(
            storedLoginId
          ) &&
          storedLoginId > 0
            ? storedLoginId
            : null,
      };
    } catch (error) {
      console.error(
        "Read assistance session error:",
        error
      );

      return null;
    }
  };

  // ====================================================
  // LOAD OFFICER DETAILS
  // ====================================================

  const loadLoggedInOfficer =
    useCallback(async () => {
      setIsLoadingOfficer(true);

      try {
        const staffUser =
          getStoredAssistanceUser();

        if (!staffUser) {
          throw new Error(
            "Logged-in assistance officer details were not found."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/assistances/${staffUser.staffId}`
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false ||
          !data.assistance
        ) {
          throw new Error(
            data.message ||
              "Unable to load assistance officer details."
          );
        }

        const assistance =
          data.assistance;

        const relatedGarageId =
          Number(
            assistance.garageId ??
              assistance.garage_id ??
              assistance.garageGarageId ??
              assistance.garage_garage_id
          );

        if (
          !Number.isInteger(
            relatedGarageId
          ) ||
          relatedGarageId <= 0
        ) {
          throw new Error(
            "The garage related to this assistance officer could not be identified."
          );
        }

        setOfficerName(
          assistance.fullName ||
            "Assistance Officer"
        );

        setOfficerProfilePhoto(
          buildProfilePhotoUrl(
            assistance.profilePhoto
          )
        );

        setAssistanceId(
          staffUser.staffId
        );

        setGarageId(
          relatedGarageId
        );

        setIsShiftOn(
          String(
            assistance.shiftStatus ||
              assistance.shift_status ||
              "OFF"
          )
            .trim()
            .toUpperCase() === "ON"
        );

        setDashboardError("");

        return {
          assistanceId:
            staffUser.staffId,

          garageId:
            relatedGarageId,
        };
      } catch (error) {
        console.error(
          "Load logged-in assistance officer error:",
          error
        );

        setOfficerName(
          "Assistance Officer"
        );

        setOfficerProfilePhoto(
          null
        );

        setAssistanceId(null);
        setGarageId(null);
        setIsShiftOn(false);

        setDashboardError(
          error.message ||
            "Unable to identify the logged-in assistance officer."
        );

        return null;
      } finally {
        setIsLoadingOfficer(false);
      }
    }, []);

  const officerInitials =
    String(
      officerName ||
        "Assistance Officer"
    )
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "AO";

  // ====================================================
  // LOAD DASHBOARD DATABASE DATA
  // ====================================================

  const loadDashboardData =
    useCallback(
      async (
        selectedGarageId = garageId
      ) => {
        if (
          !Number.isInteger(
            Number(selectedGarageId)
          ) ||
          Number(selectedGarageId) <= 0
        ) {
          return;
        }

        try {
          setIsLoadingDashboard(true);
          setDashboardError("");

          const numericGarageId =
            Number(selectedGarageId);

          const [
            garagesResponse,
            requestsResponse,
            techniciansResponse,
            completedVehiclesResponse,
          ] = await Promise.all([
            fetch(
              `${API_BASE_URL}/garages`
            ),

            fetch(
              `${API_BASE_URL}/service-requests?garageId=${numericGarageId}`
            ),

            fetch(
              `${API_BASE_URL}/technicians?garageId=${numericGarageId}`
            ),

            fetch(
              `${API_BASE_URL}/service-jobs/garage/${numericGarageId}/completed-for-clear`
            ),
          ]);

          const [
            garagesResult,
            requestsResult,
            techniciansResult,
            completedVehiclesResult,
          ] = await Promise.all([
            garagesResponse.json(),
            requestsResponse.json(),
            techniciansResponse.json(),
            completedVehiclesResponse.json(),
          ]);

          if (
            !garagesResponse.ok ||
            garagesResult.success ===
              false
          ) {
            throw new Error(
              garagesResult.message ||
                "Unable to load garage details."
            );
          }

          if (
            !requestsResponse.ok ||
            requestsResult.success ===
              false
          ) {
            throw new Error(
              requestsResult.message ||
                "Unable to load service requests."
            );
          }

          if (
            !techniciansResponse.ok ||
            techniciansResult.success ===
              false
          ) {
            throw new Error(
              techniciansResult.message ||
                "Unable to load technicians."
            );
          }

          if (
            !completedVehiclesResponse.ok ||
            completedVehiclesResult.success ===
              false
          ) {
            throw new Error(
              completedVehiclesResult.message ||
                "Unable to load completed vehicles."
            );
          }

          const garages =
            Array.isArray(
              garagesResult.data
            )
              ? garagesResult.data
              : [];

          const currentGarage =
            garages.find(
              (garage) =>
                Number(
                  garage.garage_id
                ) ===
                numericGarageId
            );

          if (!currentGarage) {
            throw new Error(
              "The assistance officer's garage was not found."
            );
          }

          const requests =
            Array.isArray(
              requestsResult.requests
            )
              ? requestsResult.requests
              : [];

          setGarageDetails({
            garageName:
              currentGarage.garage_name ||
              "Selected Garage",

            capacity:
              Number(
                currentGarage.capacity
              ) || 0,

            currentCapacity:
              Number(
                currentGarage.current_capacity
              ) || 0,
          });

          const garageTechnicians =
            Array.isArray(
              techniciansResult.technicians
            )
              ? techniciansResult.technicians
              : [];

          setTechnicians(
            garageTechnicians
          );

          setServiceRequests(
            requests
          );

          setCompletedVehicles(
            Array.isArray(
              completedVehiclesResult.jobs
            )
              ? completedVehiclesResult.jobs
              : []
          );
        } catch (error) {
          console.error(
            "Load assistance dashboard error:",
            error
          );

          setDashboardError(
            error.message ||
              "Unable to load dashboard data."
          );
        } finally {
          setIsLoadingDashboard(false);
        }
      },
      [garageId]
    );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    let isMounted = true;

    const initialiseDashboard =
      async () => {
        const officer =
          await loadLoggedInOfficer();

        if (
          isMounted &&
          officer?.garageId
        ) {
          await loadDashboardData(
            officer.garageId
          );
        }
      };

    initialiseDashboard();

    return () => {
      isMounted = false;
    };
  }, [
    loadLoggedInOfficer,
    loadDashboardData,
  ]);

  // ====================================================
  // TOW NOTIFICATION POLLING
  // ====================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        Number(assistanceId)
      ) ||
      Number(assistanceId) <= 0
    ) {
      return undefined;
    }

    loadTowNotifications(
      assistanceId,
      true
    );

    const intervalId =
      window.setInterval(
        () => {
          loadTowNotifications(
            assistanceId,
            true
          );
        },
        3000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    assistanceId,
    loadTowNotifications,
  ]);

  useEffect(() => {
    return () => {
      towToastTimersRef
        .current
        .forEach(
          (timeoutId) => {
            window.clearTimeout(
              timeoutId
            );
          }
        );

      towToastTimersRef
        .current
        .clear();
    };
  }, []);

  // ====================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // ====================================================

  useEffect(() => {
    if (!garageId) {
      return undefined;
    }

    const refreshInterval =
      window.setInterval(() => {
        loadDashboardData(
          garageId
        );
      }, 5000);

    return () => {
      window.clearInterval(
        refreshInterval
      );
    };
  }, [
    garageId,
    loadDashboardData,
  ]);

  // ====================================================
  // REFRESH ASSISTANCE SHIFT STATUS EVERY 5 SECONDS
  // ====================================================

  useEffect(() => {
    const shiftRefreshInterval =
      window.setInterval(() => {
        loadLoggedInOfficer();
      }, 5000);

    return () => {
      window.clearInterval(
        shiftRefreshInterval
      );
    };
  }, [loadLoggedInOfficer]);

  // ====================================================
  // DASHBOARD COUNTS
  // ====================================================

  const pendingRequests =
    useMemo(() => {
      return serviceRequests.filter(
        (request) =>
          normalizeStatus(
            request.requestStatus
          ) === "pending"
      );
    }, [serviceRequests]);

  const activeRequests =
    useMemo(() => {
      return serviceRequests.filter(
        (request) => {
          const status =
            normalizeStatus(
              request.requestStatus
            );

          return (
            status === "pending" ||
            status === "accepted"
          );
        }
      );
    }, [serviceRequests]);

  const stats = useMemo(
    () => [
      {
        label: "Active Bays",

        val: isLoadingDashboard
          ? "-- / --"
          : `${garageDetails.currentCapacity} / ${garageDetails.capacity}`,

        icon: LayoutDashboard,
        img: garageImg,

        note:
          garageDetails.garageName ||
          "Garage capacity",
      },

      {
        label:
          "Pending Vehicles",

        val: isLoadingDashboard
          ? "--"
          : String(
              pendingRequests.length
            ).padStart(2, "0"),

        icon: Car,
        img: carQueueImg,

        note:
          "Pending service requests",
      },

      {
        label: "Active Techs",

        val: isLoadingDashboard
          ? "--"
          : String(
              technicians.filter(
                (technician) =>
                  String(
                    technician.shiftStatus ||
                      ""
                  )
                    .trim()
                    .toUpperCase() === "ON"
              ).length
            ).padStart(2, "0"),

        icon: User,
        img: techImg,

        note:
          "Technicians currently on shift",
      },
    ],
    [
      garageDetails,
      isLoadingDashboard,
      pendingRequests.length,
      technicians,
    ]
  );

  // ====================================================
  // SEARCH DASHBOARD REQUESTS
  // ====================================================

  const filteredRequests =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return activeRequests;
      }

      return activeRequests.filter(
        (request) => {
          return (
            String(
              request.ticketNumber ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.customerName ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.customerContact ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.vehicleNumber ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.vehicleType ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.requestStatus ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.requestType ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.location ||
                ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              request.garageName ||
                ""
            )
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      activeRequests,
      searchQuery,
    ]);

  // ====================================================
  // ACCEPT SERVICE REQUEST
  // ====================================================

  const handleAcceptRequest =
    async (request) => {
      if (!isShiftOn) {
        showNotification(
          "error",
          "Shift Is OFF",
          "Please start your shift from Assistance Profile before accepting service requests."
        );

        return;
      }

      if (
        !request?.requestId ||
        !assistanceId ||
        actionLoadingId
      ) {
        return;
      }

      try {
        setActionLoadingId(
          request.requestId
        );

        const response = await fetch(
          `${API_BASE_URL}/service-requests/${request.requestId}/accept`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              assistanceId,
            }),
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
              "Unable to accept the request."
          );
        }

        showNotification(
          "success",
          "Request Accepted",
          `${
            request.ticketNumber ||
            "Service request"
          } was accepted successfully.`
        );

        await loadDashboardData(
          garageId
        );
      } catch (error) {
        console.error(
          "Accept dashboard request error:",
          error
        );

        showNotification(
          "error",
          "Accept Failed",
          error.message ||
            "Unable to accept the request."
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  // ====================================================
  // REJECT SERVICE REQUEST
  // ====================================================

  const handleRejectRequest =
    async (request) => {
      if (!isShiftOn) {
        showNotification(
          "error",
          "Shift Is OFF",
          "Please start your shift from Assistance Profile before rejecting service requests."
        );

        return;
      }

      if (
        !request?.requestId ||
        !assistanceId ||
        actionLoadingId
      ) {
        return;
      }

      try {
        setActionLoadingId(
          request.requestId
        );

        const response = await fetch(
          `${API_BASE_URL}/service-requests/${request.requestId}/reject`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              assistanceId,
            }),
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
              "Unable to reject the request."
          );
        }

        showNotification(
          "success",
          "Request Rejected",
          `${
            request.ticketNumber ||
            "Service request"
          } was rejected successfully.`
        );

        await loadDashboardData(
          garageId
        );
      } catch (error) {
        console.error(
          "Reject dashboard request error:",
          error
        );

        showNotification(
          "error",
          "Reject Failed",
          error.message ||
            "Unable to reject the request."
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  // ====================================================
  // WALK-IN VEHICLE HANDLERS
  // ====================================================

  const resetWalkInForm = () => {
    setWalkInForm({
      customerName: "",
      contact: "",
      vehicleNumber: "",
      vehicleType: "",
    });
  };

  const openWalkInForm = () => {
    if (!isShiftOn) {
      showNotification(
        "error",
        "Shift Is OFF",
        "Please start your shift from Assistance Profile before registering a walk-in vehicle."
      );
      return;
    }

    if (!garageId || !assistanceId) {
      showNotification(
        "error",
        "Officer Details Missing",
        "Garage or assistance officer details could not be identified."
      );
      return;
    }

    resetWalkInForm();
    setIsWalkInOpen(true);
  };

  const closeWalkInForm = () => {
    if (isWalkInSubmitting) {
      return;
    }

    setIsWalkInOpen(false);
    resetWalkInForm();
  };

  const handleWalkInInputChange = (event) => {
    const { name, value } = event.target;

    setWalkInForm((previous) => ({
      ...previous,
      [name]:
        name === "vehicleNumber"
          ? value.toUpperCase()
          : value,
    }));
  };
const handleWalkInSubmit = async (event) => {
    event.preventDefault();

    if (!isShiftOn) {
      showNotification(
        "error",
        "Shift Is OFF",
        "Please start your shift before registering a walk-in vehicle."
      );
      return;
    }

    const customerName =
      walkInForm.customerName.trim();
    const contact =
      walkInForm.contact.trim();
    const vehicleNumber =
      walkInForm.vehicleNumber
        .trim()
        .toUpperCase();
    const vehicleType =
      walkInForm.vehicleType.trim();

    if (!customerName) {
      showNotification(
        "error",
        "Customer Name Required",
        "Please enter the walk-in customer's name."
      );
      return;
    }

    if (!/^0\d{9}$/.test(contact)) {
      showNotification(
        "error",
        "Invalid Contact Number",
        "Please enter a valid 10-digit contact number starting with 0."
      );
      return;
    }

    if (!vehicleNumber) {
      showNotification(
        "error",
        "Vehicle Number Required",
        "Please enter the vehicle registration number."
      );
      return;
    }

    if (!vehicleType) {
      showNotification(
        "error",
        "Vehicle Type Required",
        "Please select the vehicle type."
      );
      return;
    }

    try {
      setIsWalkInSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/service-requests/walk-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            contact,
            vehicleNumber,
            vehicleType,
            garageId: Number(garageId),
            assistanceId: Number(assistanceId),
            repairType: "MAJOR",
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to register the walk-in vehicle."
        );
      }

      setIsWalkInOpen(false);
      resetWalkInForm();

      showNotification(
        "success",
        "Major Walk-in Registered",
        `${vehicleNumber} was checked in successfully and is now ready for technician assignment.`
      );

      await loadDashboardData(garageId);

      setView("Resource Schedule");
      setSearchQuery("");
    } catch (error) {
      console.error(
        "Create walk-in request error:",
        error
      );

      showNotification(
        "error",
        "Walk-in Registration Failed",
        error.message ||
          "Unable to register the walk-in vehicle."
      );
    } finally {
      setIsWalkInSubmitting(false);
    }
  };

  // ====================================================
  // CLEAR COMPLETED VEHICLE
  // ====================================================

  const handleClearVehicle =
    (job) => {
      if (!isShiftOn) {
        showNotification(
          "error",
          "Shift Is OFF",
          "Please start your shift from Assistance Profile before clearing a vehicle."
        );

        return;
      }

      if (
        !job?.jobId ||
        actionLoadingId
      ) {
        return;
      }

      setClearConfirmJob(job);
    };

  const confirmClearVehicle =
    async () => {
      const job = clearConfirmJob;

      if (
        !job?.jobId ||
        actionLoadingId
      ) {
        return;
      }

      try {
        setActionLoadingId(
          `clear-${job.jobId}`
        );

        const response = await fetch(
          `${API_BASE_URL}/service-jobs/${job.jobId}/clear`,
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
              "Unable to clear the vehicle."
          );
        }

        setClearConfirmJob(null);

        showNotification(
          "success",
          "Vehicle Cleared Successfully",
          `${
            job.vehicleNumber ||
            "Vehicle"
          } has been cleared. One garage slot is now available.`
        );

        await loadDashboardData(
          garageId
        );
      } catch (error) {
        console.error(
          "Clear completed vehicle error:",
          error
        );

        setClearConfirmJob(null);

        showNotification(
          "error",
          "Clear Failed",
          error.message ||
            "Unable to clear the vehicle."
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleNavigate = (
    page
  ) => {
    if (
      page === "logout" ||
      page === "start"
    ) {
      setIsSidebarOpen(false);

      if (
        typeof onNavigate ===
        "function"
      ) {
        onNavigate(page);
      }

      return;
    }

    setView(page);
    setSearchQuery("");
    setIsSidebarOpen(false);

    // Refresh the logged-in officer details so a newly
    // uploaded profile photo appears in the common header.
    loadLoggedInOfficer();
  };

  // ====================================================
  // RENDER SELECTED PAGE
  // ====================================================

  const renderContent = () => {
    switch (view) {
      case "Incident Dispatch":
        return (
          <IncidentDispatch
            onBack={() =>
              setView("Dashboard")
            }
            openSidebar={() =>
              setIsSidebarOpen(true)
            }
          />
        );

      case "Customer Comms":
        return (
          <CustomerCommunication
            openSidebar={() =>
              setIsSidebarOpen(true)
            }
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );

      case "Resource Schedule":
        return (
          <ResourceSchedule
            resourceRequests={
              resourceRequests
            }
            searchQuery={
              searchQuery
            }
            setSearchQuery={
              setSearchQuery
            }
          />
        );

      case "Counter Ledger":
        return (
          <CounterReceipt
            openSidebar={() =>
              setIsSidebarOpen(true)
            }
            searchQuery={
              searchQuery
            }
          />
        );

      case "Experience Audit":
        return (
          <ExperienceAudit
            openSidebar={() =>
              setIsSidebarOpen(true)
            }
            searchQuery={
              searchQuery
            }
            setSearchQuery={
              setSearchQuery
            }
          />
        );

      case "Assistance Profile":
        return (
          <AssistanceProfile
            openSidebar={() =>
              setIsSidebarOpen(true)
            }
          />
        );

      default:
        return (
          <main className="h-full min-h-0 flex-1 p-4 sm:p-6 md:p-10 space-y-8 overflow-y-auto overflow-x-hidden pb-16">
            {/* DASHBOARD TITLE */}

            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  Assistance Dashboard
                </h1>

                <p className="text-base md:text-xl text-slate-400 mt-2">
                  Real-time garage
                  assistance monitoring
                  and control
                </p>

                {garageDetails.garageName && (
                  <p className="mt-2 text-xs uppercase tracking-widest text-blue-400">
                    {
                      garageDetails.garageName
                    }
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
<button
                  type="button"
                  onClick={openWalkInForm}
                  disabled={
                    !garageId ||
                    !assistanceId ||
                    !isShiftOn
                  }
                  className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardPlus size={16} />
                  REGISTER MAJOR WALK-IN VEHICLE
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadDashboardData(
                      garageId
                    )
                  }
                  disabled={
                    isLoadingDashboard ||
                    !garageId
                  }
                  className="flex w-fit items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/20 px-4 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      isLoadingDashboard
                        ? "animate-spin"
                        : ""
                    }
                  />
                  REFRESH DATA
                </button>
              </div>
            </section>

            {/* ERROR */}

            {dashboardError && (
              <section className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div className="flex-1">
                  <p className="font-bold text-red-300">
                    Unable to Load
                    Dashboard
                  </p>

                  <p className="mt-1 text-sm text-red-200/80">
                    {dashboardError}
                  </p>

                  <button
                    type="button"
                    onClick={async () => {
                      const officer =
                        await loadLoggedInOfficer();

                      if (
                        officer?.garageId
                      ) {
                        await loadDashboardData(
                          officer.garageId
                        );
                      }
                    }}
                    className="mt-3 flex items-center gap-2 text-xs font-bold text-red-200 hover:text-white"
                  >
                    <RefreshCw
                      size={14}
                    />

                    TRY AGAIN
                  </button>
                </div>
              </section>
            )}

            {/* STAT CARDS */}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map(
                (
                  stat,
                  index
                ) => {
                  const StatIcon =
                    stat.icon;

                  return (
                    <div
                      key={
                        stat.label
                      }
                      style={{
                        animationDelay: `${index * 0.2}s`,
                      }}
                      className="opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] bg-gradient-to-b from-blue-950/30 to-black rounded-2xl border border-blue-900/40 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    >
                      <div className="w-full h-48 md:h-56 overflow-hidden">
                        <img
                          src={
                            stat.img
                          }
                          alt={
                            stat.label
                          }
                          className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-blue-900/30 text-blue-300">
                            <StatIcon
                              size={
                                24
                              }
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm uppercase text-slate-400">
                              {
                                stat.label
                              }
                            </p>

                            <p className="text-3xl font-bold text-white mt-1">
                              {
                                stat.val
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                stat.note
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </section>

            {/* LIVE DATABASE REQUESTS */}

            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Live Service Requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Pending and accepted
                    requests from the
                    database
                  </p>
                </div>

                <span className="w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                  {
                    activeRequests.length
                  }{" "}
                  ACTIVE
                </span>
              </div>

              {isLoadingDashboard &&
              serviceRequests.length ===
                0 ? (
                <div className="rounded-xl border border-blue-900/40 bg-black p-10 text-center">
                  <RefreshCw
                    size={36}
                    className="mx-auto animate-spin text-blue-400"
                  />

                  <p className="mt-4 text-sm text-slate-400">
                    Loading real-time
                    requests...
                  </p>
                </div>
              ) : filteredRequests.length >
                0 ? (
                <div className="space-y-4">
                  {filteredRequests.map(
                    (
                      request
                    ) => {
                      const statusStyles =
                        getStatusStyles(
                          request.requestStatus
                        );

                      const isPending =
                        normalizeStatus(
                          request.requestStatus
                        ) ===
                        "pending";

                      const isProcessing =
                        actionLoadingId ===
                        request.requestId;

                      return (
                        <div
                          key={
                            request.requestId
                          }
                          className="rounded-xl border border-blue-900/40 bg-black p-4 sm:p-5"
                        >
                          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Cpu
                                  size={
                                    16
                                  }
                                />

                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {
                                    request.ticketNumber ||
                                    `Request ${request.requestId}`
                                  }
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-bold text-white">
                                {
                                  request.customerName ||
                                  "Customer"
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-400">
                                {
                                  request.vehicleType ||
                                  "Vehicle"
                                }{" "}
                                •{" "}
                                {
                                  request.vehicleNumber ||
                                  "No vehicle number"
                                }
                              </p>
                            </div>

                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusStyles.text} ${statusStyles.border} ${statusStyles.background}`}
                            >
                              {
                                request.requestStatus ||
                                "Pending"
                              }
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-blue-950/10 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Contact
                              </p>

                              <p className="mt-1 text-white">
                                {
                                  request.customerContact ||
                                  "Not available"
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Request Type
                              </p>

                              <p className="mt-1 text-white">
                                {
                                  request.requestType ||
                                  "Garage Service"
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Date
                              </p>

                              <p className="mt-1 text-white">
                                {formatDate(
                                  request.requestDate
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Time
                              </p>

                              <p className="mt-1 text-white">
                                {formatTime(
                                  request.requestTime
                                ) ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>

                          {request.location && (
                            <p className="mt-3 text-xs text-slate-500">
                              Location:{" "}
                              {
                                request.location
                              }
                            </p>
                          )}

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock
                                size={
                                  14
                                }
                              />

                              Auto-refreshes
                              every 5 seconds
                            </div>

                            {isPending && (
                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAcceptRequest(
                                      request
                                    )
                                  }
                                  disabled={
                                    isProcessing ||
                                    !isShiftOn
                                  }
                                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "PROCESSING..."
                                    : "ACCEPT"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRejectRequest(
                                      request
                                    )
                                  }
                                  disabled={
                                    isProcessing ||
                                    !isShiftOn
                                  }
                                  className="rounded-md border border-red-500 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "PROCESSING..."
                                    : "REJECT"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-blue-900/40 bg-black p-10 text-center">
                  <Search
                    size={38}
                    className="mx-auto text-blue-400"
                  />

                  <h2 className="mt-4 text-lg font-bold text-white">
                    {searchQuery
                      ? "No Requests Found"
                      : "No Active Requests"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {searchQuery
                      ? `No service request matches "${searchQuery}".`
                      : "Pending and accepted service requests will appear here automatically."}
                  </p>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery(
                          ""
                        )
                      }
                      className="mt-5 rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                    >
                      CLEAR SEARCH
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* COMPLETED VEHICLES WAITING TO LEAVE GARAGE */}

            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Completed Vehicles
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Clear a vehicle only after it has physically left the garage
                  </p>
                </div>

                <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  {completedVehicles.length}{" "}
                  WAITING TO CLEAR
                </span>
              </div>

              {completedVehicles.length > 0 ? (
                <div className="space-y-4">
                  {completedVehicles.map(
                    (job) => {
                      const isClearing =
                        actionLoadingId ===
                        `clear-${job.jobId}`;

                      return (
                        <div
                          key={`completed-${job.jobId}`}
                          className="rounded-xl border border-emerald-900/40 bg-black p-4 sm:p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                  COMPLETED
                                </span>

                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  {job.ticketNumber ||
                                    `JOB-${job.jobId}`}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-bold text-white">
                                {job.vehicleNumber ||
                                  "Vehicle"}
                              </h3>

                              <p className="mt-1 text-sm text-slate-400">
                                {job.vehicleType ||
                                  "Vehicle"}{" "}
                                •{" "}
                                {job.customerName ||
                                  "Customer"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleClearVehicle(
                                  job
                                )
                              }
                              disabled={
                                isClearing ||
                                !isShiftOn ||
                                Boolean(
                                  actionLoadingId
                                )
                              }
                              className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                            >
                              {isClearing
                                ? "CLEARING..."
                                : "CLEAR VEHICLE"}
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-emerald-950/10 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Customer
                              </p>
                              <p className="mt-1 text-white">
                                {job.customerName ||
                                  "Not available"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Contact
                              </p>
                              <p className="mt-1 text-white">
                                {job.contactNumber ||
                                  "Not available"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Completed Date
                              </p>
                              <p className="mt-1 text-white">
                                {formatDate(
                                  job.completedDate
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase text-slate-500">
                                Completed Time
                              </p>
                              <p className="mt-1 text-white">
                                {formatTime(
                                  job.completedTime
                                ) ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-amber-300/80">
                            Only press CLEAR VEHICLE after confirming the customer has collected the vehicle and it has exited the garage.
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-900/30 bg-black p-8 text-center">
                  <CheckCircle
                    size={34}
                    className="mx-auto text-emerald-400"
                  />

                  <h3 className="mt-3 font-bold text-white">
                    No Vehicles Waiting to Clear
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Completed vehicles that are still inside the garage will appear here automatically.
                  </p>
                </div>
              )}
            </section>
          </main>
        );
    }
  };

  // ====================================================
  // SHIFT-OFF POPUP STATE
  // ====================================================

  const shouldShowShiftPopup =
    !isLoadingOfficer &&
    !isShiftOn &&
    view !== "Assistance Profile";

  // ====================================================
  // MAIN LAYOUT
  // ====================================================

  return (
    <div className="flex h-screen w-screen bg-black text-slate-200 overflow-hidden">
      <div className="pointer-events-none fixed right-3 top-20 z-[1300] flex w-[min(390px,calc(100vw-1.5rem))] flex-col gap-3 sm:right-5">
        {towNotificationToasts.map(
          (notificationItem) => {
            const Icon =
              getAssistanceTowNotificationIcon(
                notificationItem.notificationType
              );

            return (
              <div
                key={`tow-toast-${notificationItem.notificationId}`}
                className="pointer-events-auto overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0b0e14]/95 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                <div className="flex items-start gap-3 p-4">
                  <div
                    className={`rounded-xl border p-2.5 ${getAssistanceTowNotificationAccent(
                      notificationItem.notificationType
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleTowNotificationClick(
                        notificationItem
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-white">
                        {notificationItem.title}
                      </p>

                      {notificationItem.referenceId && (
                        <span className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold text-slate-400">
                          #
                          {notificationItem.referenceId}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">
                      {notificationItem.message}
                    </p>

                    {(notificationItem.vehicleNumber ||
                      notificationItem.truckNumber) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {notificationItem.vehicleNumber && (
                          <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] font-bold text-slate-300">
                            Vehicle: {notificationItem.vehicleNumber}
                          </span>
                        )}

                        {notificationItem.truckNumber && (
                          <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-bold text-cyan-300">
                            Tow: {notificationItem.truckNumber}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      View notification details
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      dismissTowNotificationToast(
                        notificationItem.notificationId
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

      <AssistanceSidebar
        activeItem={view}
        onNavigate={
          handleNavigate
        }
        isOpen={
          isSidebarOpen
        }
        onClose={() =>
          setIsSidebarOpen(false)
        }
        isShiftOn={
          isShiftOn
        }
        isCheckingShift={
          isLoadingOfficer
        }
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* COMMON HEADER */}

        <header className="min-h-16 shrink-0 flex items-center justify-between gap-2 px-3 py-2 sm:h-16 sm:px-6 sm:py-0 bg-black border-b border-blue-900/40">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#0b0e14] text-slate-300 transition hover:border-blue-500/40 hover:text-white"
              onClick={() =>
                setIsSidebarOpen(
                  true
                )
              }
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1 sm:flex-none">
              <p className="truncate text-[12px] font-black uppercase tracking-[0.12em] text-white sm:text-sm sm:tracking-wider">
                {view ===
                "Dashboard"
                  ? "Assistance Dashboard"
                  : view}
              </p>

              <p className="mt-0.5 hidden text-[10px] uppercase tracking-widest text-slate-500 sm:block">
                Assistance
                Management
              </p>
            </div>

            {(view ===
              "Dashboard" ||
              view ===
                "Customer Comms" ||
              view ===
                "Resource Schedule" ||
              view ===
                "Counter Ledger" ||
              view ===
                "Experience Audit") && (
              <div className="relative ml-2 hidden w-full max-w-md md:block">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />

                <input
                  type="text"
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
                  placeholder={
                    view ===
                    "Customer Comms"
                      ? "Search customer or vehicle..."
                      : view ===
                        "Resource Schedule"
                      ? "Search ticket, customer, contact or vehicle..."
                      : view ===
                        "Counter Ledger"
                      ? "Search token, customer, item or transaction..."
                      : view ===
                        "Experience Audit"
                      ? "Search customer, review, rating or time..."
                      : "Search live service requests..."
                  }
                  className="w-full rounded-md border border-slate-800 bg-black py-2 pl-10 pr-10 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X
                      size={
                        15
                      }
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ml-1 flex shrink-0 items-center gap-1.5 sm:ml-3 sm:gap-6">
            <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              ONLINE
            </span>

            <span
              className={`hidden sm:inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                isShiftOn
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              SHIFT {isShiftOn ? "ON" : "OFF"}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setTowNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-[#0b0e14] text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 sm:h-9 sm:w-9"
                aria-label="Tow notifications"
              >
                <Bell
                  size={17}
                />

                {towUnreadCount >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                    {towUnreadCount >
                    99
                      ? "99+"
                      : towUnreadCount}
                  </span>
                )}
              </button>

              {towNotificationOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() =>
                      setTowNotificationOpen(
                        false
                      )
                    }
                    className="fixed inset-0 z-[1090] cursor-default bg-transparent"
                  />

                  <div className="fixed left-3 right-3 top-[76px] z-[1100] overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0b0e14] shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(400px,calc(100vw-2rem))]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 p-3 sm:p-4">
                      <div>
                        <p className="text-sm font-black text-white">
                          Tow Notifications
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                          External driver journey updates
                        </p>
                      </div>

                      {towUnreadCount >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllTowNotificationsRead
                          }
                          className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-blue-300 transition hover:bg-blue-500/15"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[calc(100vh-180px)] overflow-y-auto sm:max-h-[430px]">
                      {towNotifications.length ===
                      0 ? (
                        <div className="px-6 py-12 text-center">
                          <Bell className="mx-auto h-8 w-8 text-slate-700" />

                          <p className="mt-4 text-sm font-bold text-slate-400">
                            No tow notifications
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Driver journey updates will appear here.
                          </p>
                        </div>
                      ) : (
                        towNotifications.map(
                          (
                            notificationItem
                          ) => {
                            const Icon =
                              getAssistanceTowNotificationIcon(
                                notificationItem.notificationType
                              );

                            return (
                              <button
                                key={
                                  notificationItem.notificationId
                                }
                                type="button"
                                onClick={() =>
                                  handleTowNotificationClick(
                                    notificationItem
                                  )
                                }
                                className={`block w-full border-b border-slate-800/80 p-4 text-left transition last:border-b-0 hover:bg-white/[0.04] ${
                                  notificationItem.isRead
                                    ? ""
                                    : "bg-blue-500/[0.05]"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-0.5 rounded-xl border p-2.5 ${getAssistanceTowNotificationAccent(
                                      notificationItem.notificationType
                                    )}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-2">
                                      <p className="flex-1 text-sm font-black text-white">
                                        {notificationItem.title}
                                      </p>

                                      {!notificationItem.isRead && (
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                                      )}
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                      {notificationItem.message}
                                    </p>

                                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                                      {notificationItem.customerName && (
                                        <p className="truncate text-slate-500">
                                          Customer:{" "}
                                          <span className="font-bold text-slate-300">
                                            {notificationItem.customerName}
                                          </span>
                                        </p>
                                      )}

                                      {notificationItem.vehicleNumber && (
                                        <p className="truncate text-slate-500">
                                          Vehicle:{" "}
                                          <span className="font-bold text-white">
                                            {notificationItem.vehicleNumber}
                                          </span>
                                        </p>
                                      )}

                                      {notificationItem.truckNumber && (
                                        <p className="truncate text-slate-500">
                                          Tow Truck:{" "}
                                          <span className="font-bold text-cyan-300">
                                            {notificationItem.truckNumber}
                                          </span>
                                        </p>
                                      )}

                                      {notificationItem.driverName && (
                                        <p className="truncate text-slate-500">
                                          Driver:{" "}
                                          <span className="font-bold text-slate-300">
                                            {notificationItem.driverName}
                                          </span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-3">
                                      <span className="text-[10px] text-slate-600">
                                        {formatTowNotificationDateTime(
                                          notificationItem
                                        )}
                                      </span>

                                      {notificationItem.referenceId && (
                                        <span className="text-[10px] font-bold text-blue-400">
                                          Dispatch #
                                          {notificationItem.referenceId}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-600" />
                                </div>
                              </button>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "Assistance Profile"
                )
              }
              className="group flex shrink-0 items-center gap-0 rounded-xl border border-transparent p-0 text-left transition hover:border-blue-900/50 hover:bg-blue-950/20 sm:gap-3 sm:px-2 sm:py-1.5"
              aria-label="Open assistance profile"
            >
              <div className="hidden max-w-[180px] text-right sm:block">
                <p className="truncate text-xs font-bold text-white">
                  {isLoadingOfficer
                    ? "Loading..."
                    : officerName}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-500">
                  Assistance Officer
                </p>
              </div>

              <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-[#0b0e14] text-xs font-bold text-slate-300 transition group-hover:border-blue-500 group-hover:text-white sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9">
                {officerProfilePhoto ? (
                  <img
                    src={officerProfilePhoto}
                    alt={`${officerName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  officerInitials
                )}
              </div>
            </button>
          </div>
        </header>

        {(view === "Dashboard" ||
          view === "Customer Comms" ||
          view === "Resource Schedule" ||
          view === "Counter Ledger" ||
          view === "Experience Audit") && (
          <div className="shrink-0 border-b border-slate-800 bg-[#0b0e14] px-3 py-3 md:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder={
                  view === "Customer Comms"
                    ? "Search customer or vehicle..."
                    : view === "Resource Schedule"
                    ? "Search ticket, customer, contact or vehicle..."
                    : view === "Counter Ledger"
                    ? "Search token, customer, item or transaction..."
                    : view === "Experience Audit"
                    ? "Search customer, review, rating or time..."
                    : "Search live service requests..."
                }
                className="w-full rounded-xl border border-slate-800 bg-[#070b12] py-3 pl-10 pr-10 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* ASSISTANCE TOW NOTIFICATION DETAILS */}

      {selectedTowNotification && (
        <div className="fixed inset-0 z-[5000] overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center py-4">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-blue-900/60 bg-[#0b0e14] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {(() => {
                      const DetailIcon =
                        getAssistanceTowNotificationIcon(
                          selectedTowNotification.notificationType
                        );

                      return (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${getAssistanceTowNotificationAccent(
                            selectedTowNotification.notificationType
                          )}`}
                        >
                          <DetailIcon className="h-5 w-5" />
                        </div>
                      );
                    })()}

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">
                        Tow Journey Update
                      </p>

                      <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                        {selectedTowNotification.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTowNotification(
                        null
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-500 transition hover:text-white"
                    aria-label="Close tow notification details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {selectedTowNotification.message}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-black/25 p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedTowNotification.customerName ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-black/25 p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                      Vehicle
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedTowNotification.vehicleNumber ||
                        "Not available"}
                    </p>

                    {selectedTowNotification.vehicleType && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        {selectedTowNotification.vehicleType}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-cyan-600">
                      Tow Truck
                    </p>

                    <p className="mt-1 text-sm font-bold text-cyan-300">
                      {selectedTowNotification.truckNumber ||
                        "Not available"}
                    </p>

                    {(selectedTowNotification.truckType ||
                      selectedTowNotification.truckModel) && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        {[
                          selectedTowNotification.truckType,
                          selectedTowNotification.truckModel,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-black/25 p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                      Driver
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedTowNotification.driverName ||
                        "Not available"}
                    </p>

                    {selectedTowNotification.driverContact && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        {selectedTowNotification.driverContact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-black/25">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
                    <span className="text-xs text-slate-500">
                      Dispatch
                    </span>

                    <span className="text-xs font-black text-blue-400">
                      #
                      {selectedTowNotification.dispatchId ||
                        selectedTowNotification.referenceId ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
                    <span className="text-xs text-slate-500">
                      Current Status
                    </span>

                    <span className="text-right text-xs font-bold text-emerald-400">
                      {formatTowDispatchStatus(
                        selectedTowNotification.dispatchStatus
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs text-slate-500">
                      Update Time
                    </span>

                    <span className="text-right text-xs font-bold text-white">
                      {formatTowNotificationDateTime(
                        selectedTowNotification
                      ) || "Not available"}
                    </span>
                  </div>
                </div>

                {selectedTowNotification.garageName && (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-black/25 p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                      Destination Garage
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedTowNotification.garageName}
                    </p>

                    {selectedTowNotification.garageAddress && (
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedTowNotification.garageAddress}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={
                      handleViewTowDispatch
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
                  >
                    <ChevronRight className="h-4 w-4" />
                    View Dispatch
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTowNotification(
                        null
                      )
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
      )}

      {/* SHIFT OFF POPUP */}

      {shouldShowShiftPopup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0b0e14] p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle
                size={30}
                className="text-red-400"
              />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-red-400">
              Shift OFF
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Start Your Shift
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Your assistance shift is currently OFF. Please turn your shift ON from Assistance Profile before continuing with assistance operations.
            </p>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "Assistance Profile"
                )
              }
              className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-blue-500"
            >
              Open Assistance Profile
            </button>
          </div>
        </div>
      )}

      {/* CLEAR VEHICLE CONFIRMATION POPUP */}

      {clearConfirmJob && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#0b0e14] p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={30} />
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-white">
              Clear Vehicle?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-400">
              Confirm that
              <span className="mx-1 font-bold text-white">
                {clearConfirmJob.vehicleNumber || "this vehicle"}
              </span>
              has physically left the garage. Clearing this vehicle will free one garage slot.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setClearConfirmJob(null)}
                disabled={Boolean(actionLoadingId)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmClearVehicle}
                disabled={Boolean(actionLoadingId)}
                className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoadingId === `clear-${clearConfirmJob.jobId}`
                  ? "CLEARING..."
                  : "YES, CLEAR VEHICLE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN VEHICLE REGISTRATION MODAL */}

      {isWalkInOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-500/30 bg-slate-950 shadow-[0_0_50px_rgba(37,99,235,0.20)]">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                  Garage Check-in
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Register Walk-in Vehicle
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Record the vehicle details and complete the initial inspection.
                </p>
              </div>

              <button
                type="button"
                onClick={closeWalkInForm}
                disabled={isWalkInSubmitting}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                aria-label="Close walk-in registration"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleWalkInSubmit}
              className="max-h-[75vh] overflow-y-auto p-6"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    name="customerName"
                    value={walkInForm.customerName}
                    onChange={handleWalkInInputChange}
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-slate-700 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact Number
                  </label>

                  <input
                    type="tel"
                    name="contact"
                    value={walkInForm.contact}
                    onChange={handleWalkInInputChange}
                    maxLength={10}
                    placeholder="07XXXXXXXX"
                    className="w-full rounded-lg border border-slate-700 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    name="vehicleNumber"
                    value={walkInForm.vehicleNumber}
                    onChange={handleWalkInInputChange}
                    placeholder="ABC-1234"
                    className="w-full rounded-lg border border-slate-700 bg-black px-4 py-3 text-sm uppercase text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Vehicle Type
                  </label>

                  <select
                    name="vehicleType"
                    value={walkInForm.vehicleType}
                    onChange={handleWalkInInputChange}
                    className="w-full rounded-lg border border-slate-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  >
                    <option value="">
                      Select vehicle type
                    </option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="SUV">SUV</option>
                    <option value="Motorcycle">
                      Motorcycle
                    </option>
                    <option value="Three Wheeler">
                      Three Wheeler
                    </option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
              </div>

              

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeWalkInForm}
                  disabled={isWalkInSubmitting}
                  className="rounded-lg border border-slate-700 px-5 py-3 text-xs font-bold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isWalkInSubmitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isWalkInSubmitting ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      REGISTERING...
                    </>
                  ) : (
                    "CHECK-IN MAJOR VEHICLE"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION POPUP */}

      {notification.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-2xl border bg-[#0b0e14] p-6 text-center shadow-2xl ${
              notification.type ===
              "error"
                ? "border-red-500/50"
                : "border-green-500/50"
            }`}
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                notification.type ===
                "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {notification.type ===
              "error" ? (
                <AlertCircle
                  size={30}
                />
              ) : (
                <CheckCircle
                  size={30}
                />
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-white">
              {
                notification.title
              }
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {
                notification.message
              }
            </p>

            <button
              type="button"
              onClick={
                closeNotification
              }
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(35px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}