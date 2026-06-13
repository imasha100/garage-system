import React, { useState } from "react";

import StartPage from "./components/StartPage";
import CustomerLogin from "./components/customer/CustomerLogin";
import GarageMap from "./components/customer/GarageMap";
import VehicleIntake from "./components/technician/VehicleIntake";
import AssistanceDashboard from "./components/assistance/AssistanceDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("start");

  if (currentPage === "start") {
    return <StartPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === "customer-login") {
    return <CustomerLogin onNavigate={setCurrentPage} />;
  }

  if (currentPage === "garage-map") {
    return <GarageMap onNavigate={setCurrentPage} />;
  }

  if (currentPage === "technician-intake") {
    return <VehicleIntake onNavigate={setCurrentPage} />;
  }

  if (currentPage === "assistance-dashboard") {
    return <AssistanceDashboard onNavigate={setCurrentPage} />;
  }

  return <StartPage onNavigate={setCurrentPage} />;
}

export default App;