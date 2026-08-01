import React, { useState } from "react";

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
import OwnerProfile from "./components/garageOwner/OwnerProfile";
import RegistrationCenter from "./components/garageOwner/RegistrationCenter";
import TechRegistration from "./components/garageOwner/TechRegistration";
import TruckRegistration from "./components/garageOwner/TruckRegistration";
import AssistRegistration from "./components/garageOwner/AssistRegistration";
import ExternalTruckRegistration from "./components/garageOwner/ExternalTruckRegistration";
import ExternalTruckRequests from "./components/garageOwner/ExternalTruckRequests";

function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [resourceRequests, setResourceRequests] = useState([]);

  const [technicianSidebarOpen, setTechnicianSidebarOpen] =
    useState(false);

  const [ownerSidebarOpen, setOwnerSidebarOpen] =
    useState(false);

  const handleNavigate = (page) => {
    if (page === "logout" || page === "start") {
      localStorage.clear();
      sessionStorage.clear();

      setSelectedGarage(null);
      setResourceRequests([]);
      setTechnicianSidebarOpen(false);
      setOwnerSidebarOpen(false);
      setCurrentPage("start");

      return;
    }

    setCurrentPage(page);

    if (window.innerWidth < 768) {
      setTechnicianSidebarOpen(false);
      setOwnerSidebarOpen(false);
    }
  };

  const openTechnicianSidebar = () =>
    setTechnicianSidebarOpen(true);

  const closeTechnicianSidebar = () =>
    setTechnicianSidebarOpen(false);

  const toggleTechnicianSidebar = () =>
    setTechnicianSidebarOpen(
      (previousState) => !previousState
    );

  const openOwnerSidebar = () =>
    setOwnerSidebarOpen(true);

  const closeOwnerSidebar = () =>
    setOwnerSidebarOpen(false);

  const toggleOwnerSidebar = () =>
    setOwnerSidebarOpen(
      (previousState) => !previousState
    );

  const TechnicianLayout = ({ children }) => (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0d14]">
      <TechnicianSidebar
        activeItem={currentPage}
        onNavigate={handleNavigate}
        isOpen={technicianSidebarOpen}
        onClose={closeTechnicianSidebar}
      />

      <main className="h-screen min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );

  const GarageOwnerLayout = ({ children }) => (
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

  switch (currentPage) {
    case "start":
      return (
        <StartPage
          onNavigate={handleNavigate}
        />
      );

    case "customer-login":
      return (
        <CustomerLogin
          onNavigate={handleNavigate}
          setSelectedGarage={setSelectedGarage}
        />
      );

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

    case "garage-map":
      return (
        <GarageMap
          onNavigate={handleNavigate}
          selectedGarage={selectedGarage}
          setSelectedGarage={setSelectedGarage}
          setResourceRequests={setResourceRequests}
        />
      );

    case "navigation-hub":
      return (
        <NavigationHub
          onNavigate={handleNavigate}
          selectedGarage={selectedGarage}
        />
      );

    case "track-my-tow-truck":
      return (
        <TrackMyTowTruck
          onNavigate={handleNavigate}
        />
      );

    case "technician-dashboard":
      return (
        <TechnicianLayout>
          <TechnicianDashboard
            onNavigate={handleNavigate}
            toggleSidebar={toggleTechnicianSidebar}
          />
        </TechnicianLayout>
      );

    case "technician-intake":
      return (
        <TechnicianLayout>
          <VehicleIntake
            onNavigate={handleNavigate}
            toggleSidebar={openTechnicianSidebar}
          />
        </TechnicianLayout>
      );

    case "technician-profile":
      return (
        <TechnicianLayout>
          <TechnicianProfile
            onNavigate={handleNavigate}
            toggleSidebar={openTechnicianSidebar}
          />
        </TechnicianLayout>
      );

    case "task-logs":
      return (
        <TechnicianLayout>
          <TaskHistory
            onNavigate={handleNavigate}
            toggleSidebar={openTechnicianSidebar}
          />
        </TechnicianLayout>
      );

    case "assistance-dashboard":
      return (
        <AssistanceDashboard
          onNavigate={handleNavigate}
          resourceRequests={resourceRequests}
        />
      );

    case "Live Dashboard":
      return (
        <GarageOwnerLayout>
          <LiveDashboard
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Resource Matrix":
      return (
        <GarageOwnerLayout>
          <ResourceMatrix
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Performance Audit":
      return (
        <GarageOwnerLayout>
          <PerformanceAudit
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Service Quality":
      return (
        <GarageOwnerLayout>
          <ServiceQuality
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Profit Loss":
      return (
        <GarageOwnerLayout>
          <ProfitLoss
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Registration":
      return (
        <GarageOwnerLayout>
          <RegistrationCenter
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "technician-registration":
      return (
        <GarageOwnerLayout>
          <TechRegistration
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "truck-registration":
      return (
        <GarageOwnerLayout>
          <TruckRegistration
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "assistance-registration":
      return (
        <GarageOwnerLayout>
          <AssistRegistration
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "external-truck-registration":
      return (
        <GarageOwnerLayout>
          <ExternalTruckRegistration
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "external-truck-requests":
      return (
        <GarageOwnerLayout>
          <ExternalTruckRequests
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "Owner Profile":
      return (
        <GarageOwnerLayout>
          <OwnerProfile
            toggleSidebar={openOwnerSidebar}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    default:
      return (
        <StartPage
          onNavigate={handleNavigate}
        />
      );
  }
}

export default App;