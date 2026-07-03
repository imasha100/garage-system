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

  const [request1, setRequest1] = useState("PENDING");
  const [request2, setRequest2] = useState("PENDING");
  const [request3, setRequest3] = useState("PENDING");

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

  const renderContent = () => {
    switch (view) {
      case "Incident Dispatch":
        return <IncidentDispatch onBack={() => setView("Dashboard")} />;

      case "Customer Comms":
        return <CustomerCommunication />;

      case "Resource Schedule":
        return <ResourceSchedule resourceRequests={resourceRequests} />;

      case "Counter Ledger":
        return <CounterReceipt />;

      case "Experience Audit":
        return <ExperienceAudit />;

      case "Assistance Profile":
        return <AssistanceProfile />;

      default:
        return (
          <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
            <section>
              <h1 className="text-4xl md:text-5xl font-black text-white">
                Assistance Dashboard
              </h1>

              <p className="text-lg md:text-xl text-slate-400 mt-2">
                System monitoring and garage assistance control
              </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 0.2}s` }}
                  className="opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] bg-gradient-to-b from-blue-950/30 to-black rounded-2xl border border-blue-900/40 overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                >
                  <div className="w-full h-64 overflow-hidden">
                    <img
                      src={stat.img}
                      alt={stat.label}
                      className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-900/30">
                        <stat.icon size={24} />
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
              ))}
            </section>

            <section className="space-y-4">
              {[
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
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-black p-5 rounded-xl border border-blue-900/40"
                >
                  <div className="flex items-center gap-2 mb-3 text-slate-300">
                    <Cpu size={16} />
                    LIVE REQUEST {item.id}
                  </div>

                  <div className="bg-blue-950/20 p-4 rounded-xl flex justify-between items-center">
                    <p className="text-sm text-slate-300">{item.text}</p>

                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => item.set("APPROVED")}
                        className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md"
                      >
                        APPROVE
                      </button>

                      <button
                        onClick={() => item.set("DENIED")}
                        className="px-4 py-2 text-xs border border-blue-500 text-blue-300 rounded-md"
                      >
                        DENY
                      </button>

                      <span className="text-xs w-20 text-right">
                        {item.req}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </main>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-slate-200 overflow-hidden">
      <AssistanceSidebar
        activeItem={view}
        onNavigate={setView}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-black border-b border-blue-900/40">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-2.5 text-slate-500"
                size={16}
              />

              <input
                type="text"
                placeholder="Search system..."
                className="w-full bg-black border border-slate-800 py-2 pl-10 pr-4 rounded-md text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              ONLINE
            </span>

            <Bell size={16} />

            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
              <User size={14} />
            </div>
          </div>
        </header>

        {renderContent()}
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