
import React, { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Search,
  Bell,
  User,
  Cpu,
  Menu,
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

export default function AssistanceDashboard({ resourceRequests = [] }) {
  const [view, setView] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [request1, setRequest1] = useState("PENDING");
  const [request2, setRequest2] = useState("PENDING");
  const [request3, setRequest3] = useState("PENDING");
  const [request4, setRequest4] = useState("PENDING");
  const [request5, setRequest5] = useState("PENDING");

  const stats = [
    {
      label: "Active Bays",
      val: "08 / 10",
      icon: LayoutDashboard,
      img: garageImg,
    },
    {
      label: "Pending Vehicles",
      val: String(resourceRequests.length + 4).padStart(2, "0"),
      icon: Car,
      img: carQueueImg,
    },
    {
      label: "Active Techs",
      val: "12",
      icon: User,
      img: techImg,
    },
  ];

  const liveRequests = [
    {
      id: 1,
      req: request1,
      set: setRequest1,
      text: "Technician Marcus Thorne requested delay for WP-CAS-1234",
    },
    {
      id: 2,
      req: request2,
      set: setRequest2,
      text: "Customer requested priority service WP-CAR-7788",
    },
    {
      id: 3,
      req: request3,
      set: setRequest3,
      text: "Emergency support request WP-EMG-9921",
    },
    {
      id: 4,
      req: request4,
      set: setRequest4,
      text: "Technician Alan Stark requested additional repair time for CP-CB-8890",
    },
    {
      id: 5,
      req: request5,
      set: setRequest5,
      text: "Customer requested vehicle inspection update for WP-KV-1122",
    },
  ];

  const filteredRequests = liveRequests.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.text.toLowerCase().includes(query) ||
      item.req.toLowerCase().includes(query) ||
      String(item.id).includes(query)
    );
  });

  const handleNavigate = (page) => {
    setView(page);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case "Incident Dispatch":
        return (
          <IncidentDispatch
            onBack={() => setView("Dashboard")}
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      case "Customer Comms":
        return (
          <CustomerCommunication
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      case "Resource Schedule":
        return (
          <ResourceSchedule
            resourceRequests={resourceRequests}
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      case "Counter Ledger":
        return (
          <CounterReceipt
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      case "Experience Audit":
        return (
          <ExperienceAudit
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      case "Assistance Profile":
        return (
          <AssistanceProfile
            openSidebar={() => setIsSidebarOpen(true)}
          />
        );

      default:
        return (
          <main className="h-full min-h-0 flex-1 p-4 sm:p-6 md:p-10 space-y-8 overflow-y-auto overflow-x-hidden pb-16">
            <section>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                Assistance Dashboard
              </h1>

              <p className="text-base md:text-xl text-slate-400 mt-2">
                System monitoring and garage assistance control
              </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const StatIcon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    style={{ animationDelay: `${index * 0.2}s` }}
                    className="opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] bg-gradient-to-b from-blue-950/30 to-black rounded-2xl border border-blue-900/40 overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                  >
                    <div className="w-full h-56 md:h-64 overflow-hidden">
                      <img
                        src={stat.img}
                        alt={stat.label}
                        className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-900/30 text-blue-300">
                          <StatIcon size={24} />
                        </div>

                        <div>
                          <p className="text-sm uppercase text-slate-400">
                            {stat.label}
                          </p>

                          <p className="text-3xl font-bold text-white mt-1">
                            {stat.val}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black p-4 sm:p-5 rounded-xl border border-blue-900/40"
                  >
                    <div className="flex items-center gap-2 mb-3 text-slate-300">
                      <Cpu size={16} />
                      LIVE REQUEST {item.id}
                    </div>

                    <div className="bg-blue-950/20 p-4 rounded-xl flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                      <p className="text-sm text-slate-300">
                        {item.text}
                      </p>

                      <div className="flex flex-wrap gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => item.set("APPROVED")}
                          className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                        >
                          APPROVE
                        </button>

                        <button
                          type="button"
                          onClick={() => item.set("DENIED")}
                          className="px-4 py-2 text-xs border border-blue-500 text-blue-300 hover:bg-blue-950/50 rounded-md transition"
                        >
                          DENY
                        </button>

                        <span
                          className={`text-xs min-w-20 text-right font-bold ${
                            item.req === "APPROVED"
                              ? "text-green-400"
                              : item.req === "DENIED"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {item.req}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black p-8 rounded-xl border border-blue-900/40 text-center">
                  <Search
                    size={36}
                    className="mx-auto text-blue-400 mb-3"
                  />

                  <h2 className="text-white text-lg font-bold">
                    No Requests Found
                  </h2>

                  <p className="text-sm text-slate-400 mt-2">
                    No live request matches "{searchQuery}".
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                  >
                    CLEAR SEARCH
                  </button>
                </div>
              )}
            </section>
          </main>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-slate-200 overflow-hidden">
      <AssistanceSidebar
        activeItem={view}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        toggleSidebar={() =>
          setIsSidebarOpen((prev) => !prev)
        }
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header is displayed only on the Assistance Dashboard */}
        {view === "Dashboard" && (
          <header className="h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 bg-black border-b border-blue-900/40">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <button
                type="button"
                className="md:hidden shrink-0 text-slate-300 hover:text-white"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={21} />
              </button>

              <div className="relative w-full max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search requests..."
                  className="w-full bg-black border border-slate-800 py-2 pl-10 pr-4 rounded-md text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
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
                <Bell size={17} />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleNavigate("Assistance Profile")
                }
                className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition"
                aria-label="Open assistance profile"
              >
                <User size={14} />
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>

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

