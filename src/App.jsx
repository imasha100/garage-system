import React, { useState } from "react";

import StartPage from "./components/StartPage";
import CustomerLogin from "./components/customer/CustomerLogin";
import GarageMap from "./components/customer/GarageMap";
import NavigationHub from "./components/customer/NavigationHub";

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

function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [resourceRequests, setResourceRequests] = useState([]);
  const [ownerSidebarOpen, setOwnerSidebarOpen] = useState(false);

  const handleNavigate = (page) => {
    if (page === "logout") {
      localStorage.clear();
      sessionStorage.clear();
      setSelectedGarage(null);
      setResourceRequests([]);
      setOwnerSidebarOpen(false);
      setCurrentPage("start");
      return;
    }

    setCurrentPage(page);

    if (window.innerWidth < 768) {
      setOwnerSidebarOpen(false);
    }
  };

  const TechnicianLayout = ({ children }) => (
    <div className="flex w-full h-screen overflow-hidden bg-[#0a0d14]">
      <div className="w-72 shrink-0 hidden md:block">
        <TechnicianSidebar
          activeItem={currentPage}
          onNavigate={handleNavigate}
        />
      </div>

      <main className="flex-1 h-screen overflow-y-auto">{children}</main>
    </div>
  );

  const GarageOwnerLayout = ({ children }) => (
    <div className="flex w-full h-screen overflow-hidden bg-[#07080f]">
      <GarageOwnerSidebar
        activeItem={currentPage}
        onNavigate={handleNavigate}
        isOpen={ownerSidebarOpen}
        closeSidebar={() => setOwnerSidebarOpen(false)}
      />

      <main className="flex-1 h-screen overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );

  switch (currentPage) {
    case "start":
      return <StartPage onNavigate={handleNavigate} />;

    case "customer-login":
      return <CustomerLogin onNavigate={handleNavigate} />;

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

    case "technician-dashboard":
      return (
        <TechnicianLayout>
          <TechnicianDashboard onNavigate={handleNavigate} />
        </TechnicianLayout>
      );

    case "technician-intake":
      return (
        <TechnicianLayout>
          <VehicleIntake onNavigate={handleNavigate} />
        </TechnicianLayout>
      );

    case "technician-profile":
      return (
        <TechnicianLayout>
          <TechnicianProfile onNavigate={handleNavigate} />
        </TechnicianLayout>
      );

    case "task-logs":
      return (
        <TechnicianLayout>
          <TaskHistory onNavigate={handleNavigate} />
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
          <LiveDashboard toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Resource Matrix":
      return (
        <GarageOwnerLayout>
          <ResourceMatrix toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Performance Audit":
      return (
        <GarageOwnerLayout>
          <PerformanceAudit toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Service Quality":
      return (
        <GarageOwnerLayout>
          <ServiceQuality toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Profit Loss":
      return (
        <GarageOwnerLayout>
          <ProfitLoss toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Registration":
      return (
        <GarageOwnerLayout>
          <RegistrationCenter
            toggleSidebar={() => setOwnerSidebarOpen(true)}
            onNavigate={handleNavigate}
          />
        </GarageOwnerLayout>
      );

    case "technician-registration":
      return (
        <GarageOwnerLayout>
          <TechRegistration toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "truck-registration":
      return (
        <GarageOwnerLayout>
          <TruckRegistration toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    case "Owner Profile":
      return (
        <GarageOwnerLayout>
          <OwnerProfile toggleSidebar={() => setOwnerSidebarOpen(true)} />
        </GarageOwnerLayout>
      );

    default:
      return <StartPage onNavigate={handleNavigate} />;
  }
}

export default App;