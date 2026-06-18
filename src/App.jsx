import React, { useState } from "react";
import StartPage from "./components/StartPage";
import CustomerLogin from "./components/customer/CustomerLogin";
import GarageMap from "./components/customer/GarageMap";
import NavigationHub from "./components/customer/NavigationHub";
import VehicleIntake from "./components/technician/VehicleIntake";
import AssistanceDashboard from "./components/assistance/AssistanceDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [selectedGarage, setSelectedGarage] = useState(null);

  switch (currentPage) {
    case "start":
      return <StartPage onNavigate={setCurrentPage} />;

    case "customer-login":
      return <CustomerLogin onNavigate={setCurrentPage} />;

    case "garage-map":
      return (
        <GarageMap
          onNavigate={setCurrentPage}
          selectedGarage={selectedGarage}
          setSelectedGarage={setSelectedGarage}
        />
      );

    case "navigation-hub":
      return (
        <NavigationHub
          onNavigate={setCurrentPage}
          selectedGarage={selectedGarage}
        />
      );

    case "technician-intake":
      return <VehicleIntake onNavigate={setCurrentPage} />;

    case "assistance-dashboard":
      return <AssistanceDashboard onNavigate={setCurrentPage} />;

    default:
      return <StartPage onNavigate={setCurrentPage} />;
  }
}

export default App;