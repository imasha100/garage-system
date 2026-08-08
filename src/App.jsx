import React, { useEffect, useState } from "react";

import StartPage from "./components/StartPage";
import StaffLogin from "./components/StaffLogin";
import GarageRegistration from "./components/GarageRegistration";

import CustomerLogin from "./components/customer/CustomerLogin";
import GarageMap from "./components/customer/GarageMap";
import NavigationHub from "./components/customer/NavigationHub";
import TrackMyTowTruck from "./components/customer/TrackMyTowTruck";

import VehicleIntake from "./components/technician/VehicleIntake";
import TechnicianDashboard from "./components/technician/TechnicianDashboard";
import TechnicianSidebar from "./components/technician/TechnicianSidebar";
import TechnicianProfile from "./components/technician/TechnicianProfile";
import TaskHistory from "./components/technician/TaskHistory";

import AssistanceDashboard from "./components/assistance/AssistanceDashboard";

import GarageOwnerSidebar from "./components/garageOwner/GarageOwnerSidebar";
import LiveDashboard from "./components/garageOwner/LiveDashboard";
import ResourceMatrix from "./components/garageOwner/ResourceMatrix";
import PerformanceAudit from "./components/garageOwner/PerformanceAudit";
import ServiceQuality from "./components/garageOwner/ServiceQuality";
import ProfitLoss from "./components/garageOwner/ProfitLoss";
import StockManagement from "./components/garageOwner/StockManagement";
import OwnerProfile from "./components/garageOwner/OwnerProfile";
import RegistrationCenter from "./components/garageOwner/RegistrationCenter";
import TechRegistration from "./components/garageOwner/TechRegistration";
import TruckRegistration from "./components/garageOwner/TruckRegistration";
import AssistRegistration from "./components/garageOwner/AssistRegistration";
import ExternalTruckRegistration from "./components/garageOwner/ExternalTruckRegistration";
import ExternalTruckRequests from "./components/garageOwner/ExternalTruckRequests";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return sessionStorage.getItem("currentPage") || "start";
  });

  // ======================================================
  // BROWSER HISTORY MANAGEMENT
  // ======================================================

  useEffect(() => {
    const savedPage =
      sessionStorage.getItem("currentPage") ||
      "start";

    // Keep the current application page after browser refresh.
    window.history.replaceState(
      { page: savedPage, swiftGarage: true },
      "",
      window.location.href
    );

    const handlePopState = (event) => {
      const state = event.state;

      if (
        state?.swiftGarage &&
        state?.page
      ) {
        sessionStorage.setItem(
          "currentPage",
          state.page
        );

        setCurrentPage(state.page);
        return;
      }

      // If the browser tries to leave the app history,
      // restore the Start Page as the active app screen.
      sessionStorage.setItem(
        "currentPage",
        "start"
      );

      window.history.pushState(
        { page: "start", swiftGarage: true },
        "",
        window.location.href
      );

      setCurrentPage("start");
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  const [selectedGarage, setSelectedGarage] =
    useState(null);

  const [resourceRequests, setResourceRequests] =
    useState([]);

  const [
    technicianSidebarOpen,
    setTechnicianSidebarOpen,
  ] = useState(false);

  const [
    technicianShiftOn,
    setTechnicianShiftOn,
  ] = useState(false);

  const [
    isLoadingTechnicianShift,
    setIsLoadingTechnicianShift,
  ] = useState(false);

  const [
    technicianShiftError,
    setTechnicianShiftError,
  ] = useState("");

  const [
    ownerSidebarOpen,
    setOwnerSidebarOpen,
  ] = useState(false);

  // ======================================================
  // TECHNICIAN SHIFT ACCESS
  // ======================================================

  const technicianPages = [
    "technician-dashboard",
    "technician-intake",
    "technician-profile",
    "task-logs",
  ];

  const technicianRestrictedPages = [
    "technician-dashboard",
    "technician-intake",
    "task-logs",
  ];

  const getLoggedInTechnicianId = () => {
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
        "Read technician session error:",
        error
      );

      return null;
    }
  };

  const loadTechnicianShiftStatus =
    async (
      showLoading = false
    ) => {
      const technicianId =
        getLoggedInTechnicianId();

      if (!technicianId) {
        setTechnicianShiftOn(
          false
        );

        return false;
      }

      if (showLoading) {
        setIsLoadingTechnicianShift(
          true
        );
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/technicians/${technicianId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false ||
          !result.technician
        ) {
          throw new Error(
            result.message ||
              "Unable to load technician shift status."
          );
        }

        const isOnShift =
          String(
            result.technician
              ?.shiftStatus ??
              result.technician
                ?.shift_status ??
              "OFF"
          )
            .trim()
            .toUpperCase() ===
          "ON";

        setTechnicianShiftOn(
          isOnShift
        );

        setTechnicianShiftError(
          ""
        );

        return isOnShift;
      } catch (error) {
        console.error(
          "Load technician shift status error:",
          error
        );

        setTechnicianShiftOn(
          false
        );

        setTechnicianShiftError(
          error.message ||
            "Unable to verify technician shift status."
        );

        return false;
      } finally {
        if (showLoading) {
          setIsLoadingTechnicianShift(
            false
          );
        }
      }
    };

  useEffect(() => {
    if (
      !technicianPages.includes(
        currentPage
      )
    ) {
      return undefined;
    }

    loadTechnicianShiftStatus(
      true
    );

    const interval =
      window.setInterval(
        () => {
          loadTechnicianShiftStatus(
            false
          );
        },
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [currentPage]);

  // ======================================================
  // MAIN NAVIGATION
  // ======================================================

  const handleNavigate = (page) => {
    if (
      page === "logout" ||
      page === "start"
    ) {
      localStorage.clear();
      sessionStorage.clear();

      setSelectedGarage(null);
      setResourceRequests([]);

      setTechnicianSidebarOpen(false);
      setOwnerSidebarOpen(false);

      setTechnicianShiftOn(false);
      setIsLoadingTechnicianShift(false);
      setTechnicianShiftError("");

      setCurrentPage("start");

      window.history.pushState(
        {
          page: "start",
          swiftGarage: true,
        },
        "",
        window.location.href
      );

      return;
    }

    sessionStorage.setItem(
      "currentPage",
      page
    );

    setCurrentPage(page);

    window.history.pushState(
      {
        page,
        swiftGarage: true,
      },
      "",
      window.location.href
    );

    if (window.innerWidth < 768) {
      setTechnicianSidebarOpen(false);
      setOwnerSidebarOpen(false);
    }
  };

  // ======================================================
  // TECHNICIAN SIDEBAR
  // ======================================================

  const openTechnicianSidebar = () =>
    setTechnicianSidebarOpen(true);

  const closeTechnicianSidebar = () =>
    setTechnicianSidebarOpen(false);

  const toggleTechnicianSidebar = () =>
    setTechnicianSidebarOpen(
      (previousState) =>
        !previousState
    );

  // ======================================================
  // GARAGE OWNER SIDEBAR
  // ======================================================

  const openOwnerSidebar = () =>
    setOwnerSidebarOpen(true);

  const closeOwnerSidebar = () =>
    setOwnerSidebarOpen(false);

  const toggleOwnerSidebar = () =>
    setOwnerSidebarOpen(
      (previousState) =>
        !previousState
    );

  // ======================================================
  // TECHNICIAN LAYOUT
  // ======================================================

  const TechnicianLayout = ({
    children,
  }) => {
    const isRestrictedPage =
      technicianRestrictedPages.includes(
        currentPage
      );

    const shouldLock =
      isRestrictedPage &&
      !isLoadingTechnicianShift &&
      !technicianShiftOn;

    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#0a0d14]">
        <TechnicianSidebar
          activeItem={currentPage}
          onNavigate={handleNavigate}
          isOpen={technicianSidebarOpen}
          onClose={closeTechnicianSidebar}
          isShiftOn={technicianShiftOn}
          isCheckingShift={
            isLoadingTechnicianShift
          }
        />

        <main className="h-screen min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {isRestrictedPage &&
          isLoadingTechnicianShift ? (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0d14] p-6 text-center font-mono text-slate-300">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#10121b] p-8">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

                <h2 className="mt-5 text-xl font-black text-white">
                  Checking Shift Status
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Please wait while your current technician shift is verified.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative min-h-screen">
              {children}

              {shouldLock && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#10121b] p-6 text-center font-mono shadow-2xl sm:p-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-2xl font-black text-rose-400">
                      !
                    </div>

                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-rose-400">
                      Shift OFF
                    </p>

                    <h2 className="mt-3 text-2xl font-black text-white">
                      Start Your Shift
                    </h2>

                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      Your technician shift is currently OFF. Please turn your shift ON from Technician Profile before continuing with technician work.
                    </p>

                    {technicianShiftError && (
                      <p className="mt-4 text-xs text-amber-400">
                        {technicianShiftError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "technician-profile"
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700"
                    >
                      Open Technician Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  };

  // ======================================================
  // GARAGE OWNER LAYOUT
  // ======================================================

  const GarageOwnerLayout = ({
    children,
  }) => (
    <div className="flex h-screen w-full overflow-hidden bg-[#07080f]">
      <GarageOwnerSidebar
        activeItem={currentPage}
        onNavigate={handleNavigate}
        isOpen={ownerSidebarOpen}
        toggleSidebar={toggleOwnerSidebar}
        closeSidebar={closeOwnerSidebar}
      />

      <main className="h-screen min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );

  // ======================================================
  // PAGE SWITCH
  // ======================================================

  switch (currentPage) {
    // ====================================================
    // START
    // ====================================================

    case "start":
      return (
        <StartPage
          onNavigate={handleNavigate}
        />
      );

    // ====================================================
    // CUSTOMER
    // ====================================================

    case "customer-login":
      return (
        <CustomerLogin
          onNavigate={handleNavigate}
          setSelectedGarage={
            setSelectedGarage
          }
        />
      );

    case "garage-map":
      return (
        <GarageMap
          onNavigate={handleNavigate}
          selectedGarage={
            selectedGarage
          }
          setSelectedGarage={
            setSelectedGarage
          }
          setResourceRequests={
            setResourceRequests
          }
        />
      );

    case "navigation-hub":
      return (
        <NavigationHub
          onNavigate={handleNavigate}
          selectedGarage={
            selectedGarage
          }
        />
      );

    case "track-my-tow-truck":
      return (
        <TrackMyTowTruck
          onNavigate={handleNavigate}
        />
      );

    // ====================================================
    // STAFF LOGIN
    // ====================================================

    case "staff-login":
      return (
        <StaffLogin
          onNavigate={handleNavigate}
        />
      );

    case "garage-registration":
      return (
        <GarageRegistration
          onNavigate={handleNavigate}
        />
      );

    // ====================================================
    // TECHNICIAN
    // ====================================================

    case "technician-dashboard":
      return (
        <TechnicianLayout>
          <TechnicianDashboard
            onNavigate={
              handleNavigate
            }
            toggleSidebar={
              toggleTechnicianSidebar
            }
          />
        </TechnicianLayout>
      );

    case "technician-intake":
      return (
        <TechnicianLayout>
          <VehicleIntake
            onNavigate={
              handleNavigate
            }
            toggleSidebar={
              openTechnicianSidebar
            }
          />
        </TechnicianLayout>
      );

    case "technician-profile":
      return (
        <TechnicianLayout>
          <TechnicianProfile
            onNavigate={
              handleNavigate
            }
            toggleSidebar={
              openTechnicianSidebar
            }
          />
        </TechnicianLayout>
      );

    case "task-logs":
      return (
        <TechnicianLayout>
          <TaskHistory
            onNavigate={
              handleNavigate
            }
            toggleSidebar={
              openTechnicianSidebar
            }
          />
        </TechnicianLayout>
      );

    // ====================================================
    // ASSISTANCE
    // ====================================================

    case "assistance-dashboard":
      return (
        <AssistanceDashboard
          onNavigate={handleNavigate}
          resourceRequests={
            resourceRequests
          }
        />
      );

    // ====================================================
    // GARAGE OWNER - LIVE DASHBOARD
    // ====================================================

    case "Live Dashboard":
      return (
        <GarageOwnerLayout>
          <LiveDashboard
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - RESOURCE MATRIX
    // ====================================================

    case "Resource Matrix":
      return (
        <GarageOwnerLayout>
          <ResourceMatrix
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - PERFORMANCE AUDIT
    // ====================================================

    case "Performance Audit":
      return (
        <GarageOwnerLayout>
          <PerformanceAudit
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - SERVICE QUALITY
    // ====================================================

    case "Service Quality":
      return (
        <GarageOwnerLayout>
          <ServiceQuality
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - PROFIT LOSS
    // ====================================================

    case "Profit Loss":
      return (
        <GarageOwnerLayout>
          <ProfitLoss
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - STOCK MANAGEMENT
    // ====================================================

    case "Stock Management":
      return (
        <GarageOwnerLayout>
          <StockManagement
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER - REGISTRATION CENTER
    // ====================================================

    case "Registration":
      return (
        <GarageOwnerLayout>
          <RegistrationCenter
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // TECHNICIAN REGISTRATION
    // ====================================================

    case "technician-registration":
      return (
        <GarageOwnerLayout>
          <TechRegistration
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // TOW TRUCK REGISTRATION
    // ====================================================

    case "truck-registration":
      return (
        <GarageOwnerLayout>
          <TruckRegistration
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // ASSISTANCE REGISTRATION
    // ====================================================

    case "assistance-registration":
      return (
        <GarageOwnerLayout>
          <AssistRegistration
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // EXTERNAL TRUCK REGISTRATION
    // ====================================================

    case "external-truck-registration":
      return (
        <GarageOwnerLayout>
          <ExternalTruckRegistration
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // EXTERNAL TRUCK REQUESTS
    // ====================================================

    case "external-truck-requests":
      return (
        <GarageOwnerLayout>
          <ExternalTruckRequests
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // GARAGE OWNER PROFILE
    // ====================================================

    case "Owner Profile":
      return (
        <GarageOwnerLayout>
          <OwnerProfile
            toggleSidebar={
              openOwnerSidebar
            }
            onNavigate={
              handleNavigate
            }
          />
        </GarageOwnerLayout>
      );

    // ====================================================
    // DEFAULT
    // ====================================================

    default:
      return (
        <StartPage
          onNavigate={handleNavigate}
        />
      );
  }
}

export default App;