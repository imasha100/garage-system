import React, {
  useCallback,
  useEffect,
  useMemo,
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

const API_BASE_URL = "http://localhost:5000/api";

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
    assistanceId,
    setAssistanceId,
  ] = useState(null);

  const [
    garageId,
    setGarageId,
  ] = useState(null);

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
    notification,
    setNotification,
  ] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

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

      return {
        ...staffUser,
        staffId:
          storedAssistanceId,
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

        setAssistanceId(
          staffUser.staffId
        );

        setGarageId(
          relatedGarageId
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

        setAssistanceId(null);
        setGarageId(null);

        setDashboardError(
          error.message ||
            "Unable to identify the logged-in assistance officer."
        );

        return null;
      } finally {
        setIsLoadingOfficer(false);
      }
    }, []);

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
          ] = await Promise.all([
            fetch(
              `${API_BASE_URL}/garages`
            ),

            fetch(
              `${API_BASE_URL}/service-requests?garageId=${numericGarageId}`
            ),
          ]);

          const [
            garagesResult,
            requestsResult,
          ] = await Promise.all([
            garagesResponse.json(),
            requestsResponse.json(),
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

          setServiceRequests(
            requests
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

        val: "00",

        icon: User,
        img: techImg,

        note:
          "Technician module pending",
      },
    ],
    [
      garageDetails,
      isLoadingDashboard,
      pendingRequests.length,
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
      if (
        !request?.requestId ||
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
                                    isProcessing
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
                                    isProcessing
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
          </main>
        );
    }
  };

  // ====================================================
  // MAIN LAYOUT
  // ====================================================

  return (
    <div className="flex h-screen w-screen bg-black text-slate-200 overflow-hidden">
      <AssistanceSidebar
        activeItem={view}
        onNavigate={
          handleNavigate
        }
        isOpen={
          isSidebarOpen
        }
        toggleSidebar={() =>
          setIsSidebarOpen(
            (previousState) =>
              !previousState
          )
        }
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* COMMON HEADER */}

        <header className="h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 bg-black border-b border-blue-900/40">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              type="button"
              className="md:hidden shrink-0 text-slate-300 hover:text-white"
              onClick={() =>
                setIsSidebarOpen(
                  true
                )
              }
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 shrink-0">
              <p className="truncate text-sm font-black uppercase tracking-wider text-white">
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
              <div className="relative ml-2 w-full max-w-md">
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

          <div className="flex items-center gap-3 sm:gap-6 ml-3">
            <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              ONLINE
            </span>

            <button
              type="button"
              className="text-slate-400 hover:text-white transition"
              aria-label="Notifications"
            >
              <Bell
                size={17}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "Assistance Profile"
                )
              }
              className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-blue-900/50 hover:bg-blue-950/20"
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

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition group-hover:border-blue-500 group-hover:text-white">
                <User
                  size={15}
                />
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>

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