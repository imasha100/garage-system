import React, { useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import AssistanceSidebar from "./AssistanceSidebar";

const IncidentDispatch = ({ onBack }) => {
  const [selectedName, setSelectedName] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search State එක

  const requests = [
    { name: "Amila Perera", vehicle: "BMW i3", loc: "Colombo 07", top: "20%", left: "30%" },
    { name: "Sunil Shantha", vehicle: "Toyota Aqua", loc: "Nugegoda", top: "50%", left: "60%" },
  ];

  // Search Logic: නම හෝ වාහනය අනුව Filter කරයි
  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c10] text-gray-300 font-sans">
      <div className="relative z-10 flex w-full min-h-screen">
        
        {/* Sidebar */}
        <AssistanceSidebar
          activeItem="Incident Dispatch"
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={(label) => {
            if (label === "Dashboard") onBack();
            setIsSidebarOpen(false);
          }}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 gap-4">
            <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={26} />
            </button>
            
            {/* SEARCH BAR */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drivers or vehicles..."
                className="w-full bg-[#0f1218] border border-gray-700 rounded-xl p-3 pl-10 text-base focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex gap-4 text-gray-400">
              <Bell size={26} className="cursor-pointer hover:text-white" />
              <HelpCircle size={26} className="cursor-pointer hover:text-white" />
            </div>
          </header>

          {/* Main content grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Emergency Queue */}
            <div className="w-full lg:w-1/3 p-6 bg-[#0f1218] border border-red-900/30 rounded-xl overflow-y-auto max-h-[70vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-red-500 text-xs font-black tracking-[0.2em] flex items-center gap-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  EMERGENCY QUEUE
                </h2>
                <span className="text-xs bg-red-900/20 text-red-500 px-3 py-1 rounded font-bold">
                  {filteredRequests.length} ACTIVE
                </span>
              </div>

              {filteredRequests.map((req, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedName(req.name)}
                  className={`group cursor-pointer p-6 mb-4 rounded-lg border transition-all duration-300 ${
                    selectedName === req.name
                      ? "bg-[#1a1f29] border-green-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                      : "bg-[#161a22] border-red-900/20 hover:border-green-500/50"
                  }`}
                >
                  <h3 className="text-white text-xl font-bold">{req.name}</h3>
                  <p className="text-xl text-gray-400 mt-2">Vehicle: <span className="text-gray-200 font-mono text-sm">{req.vehicle}</span></p>
                </div>
              ))}
            </div>

            {/* Map Section */}
            <div className="flex-1 w-full">
              <h2 className="text-sm font-bold tracking-widest mb-4">LIVE DISPATCH MAP</h2>
              <div className="relative bg-[#10141c] h-80 border border-gray-800 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

                {filteredRequests.map((req, index) => (
                  <div
                    key={index}
                    style={{ top: req.top, left: req.left }}
                    className={`absolute transition-all duration-500 ${selectedName && selectedName !== req.name ? "opacity-30 scale-75" : "opacity-100 scale-100"}`}
                  >
                    <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-red-500/20 animate-ping"></div>
                    <div className="relative w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2">
                      <span className="bg-[#0f1218] backdrop-blur-sm text-[11px] px-3 py-1.5 rounded border border-gray-700 whitespace-nowrap text-white">
                        {req.loc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <select className="bg-[#0f1218] border border-gray-700 p-4 rounded-lg text-base text-white focus:outline-none">
                  <option>Assign Truck</option>
                  <option>Assign Truck 01</option>
                </select>
                <select className="bg-[#0f1218] border border-gray-700 p-4 rounded-lg text-base text-white focus:outline-none">
                  <option>Assign Tech</option>
                  <option>Ayesh Maroc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button className="w-full md:w-96 py-5 cursor-pointer rounded-lg bg-[#52f0ac] text-black text-lg font-bold tracking-wide hover:bg-[#42d996] transition-all duration-300 shadow-lg shadow-green-500/20">
              DISPATCH SELECTED RESOURCE
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncidentDispatch;