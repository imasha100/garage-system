import React, { useState } from "react";
// Import all your pages/components
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

function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [selectedGarage, setSelectedGarage] = useState(null);

  // නිවැරදි කළ TechnicianLayout
  const TechnicianLayout = ({ children }) => (
    <div className="flex w-full min-h-screen bg-[#0a0d14]">
      {/* Sidebar එක වම් පස ස්ථාවරව තබයි */}
      <div className="w-72 shrink-0">
        <TechnicianSidebar activeItem={currentPage} onNavigate={setCurrentPage} />
      </div>
      
      {/* main කොටස Sidebar එකට පසුව ඉතිරි ඉඩ ලබා ගනී */}
      <main className="flex-1 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );

  switch (currentPage) {
    case "start": return <StartPage onNavigate={setCurrentPage} />;
    case "customer-login": return <CustomerLogin onNavigate={setCurrentPage} />;
    case "garage-map": return <GarageMap onNavigate={setCurrentPage} selectedGarage={selectedGarage} setSelectedGarage={setSelectedGarage} />;
    case "navigation-hub": return <NavigationHub onNavigate={setCurrentPage} selectedGarage={selectedGarage} />;
    
    // Technician Routes
    case "technician-dashboard":
      return <TechnicianLayout><TechnicianDashboard onNavigate={setCurrentPage} /></TechnicianLayout>;
    case "technician-intake":
      return <TechnicianLayout><VehicleIntake onNavigate={setCurrentPage} /></TechnicianLayout>;
    case "technician-profile":
      return <TechnicianLayout><TechnicianProfile onNavigate={setCurrentPage} /></TechnicianLayout>;
    case "task-logs":
      return <TechnicianLayout><TaskHistory onNavigate={setCurrentPage} /></TechnicianLayout>;

    case "assistance-dashboard": return <AssistanceDashboard onNavigate={setCurrentPage} />;
    default: return <StartPage onNavigate={setCurrentPage} />;
  }
}

export default App;