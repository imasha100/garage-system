import React, { useState } from "react";
import { LayoutDashboard, Car, Search, Bell, User, Cpu, Menu } from "lucide-react";
import AssistanceSidebar from "./AssistanceSidebar";
import IncidentDispatch from "./IncidentDispatch";

import garageImg from "../../assets/GarageCapacityimg.jpg";
import carQueueImg from "../../assets/PendingVehicles.png";
import techImg from "../../assets/Tech.jpg";

export default function AssistanceDashboard() {
  const [view, setView] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [request1, setRequest1] = useState("PENDING");
  const [request2, setRequest2] = useState("PENDING");
  const [request3, setRequest3] = useState("PENDING");

  const stats = [
    { label: "Active Bays", val: "08 / 10", icon: LayoutDashboard, img: garageImg },
    { label: "Pending Vehicles", val: "04", icon: Car, img: carQueueImg },
    { label: "Active Techs", val: "12", icon: User, img: techImg },
  ];

  if (view === "Incident Dispatch") {
    return <IncidentDispatch onBack={() => setView("Dashboard")} />;
  }

  return (
    <div className="flex h-screen w-screen bg-black text-slate-200 overflow-hidden">
      <AssistanceSidebar 
        activeItem={view} 
        onNavigate={setView} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* NAVBAR */}
        <header className="h-16 flex items-center justify-between px-6 bg-black border-b border-blue-900/40 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}><Menu size={20}/></button>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input type="text" placeholder="Search system..." className="w-full bg-black border border-slate-800 py-2 pl-10 pr-4 text-xs rounded-md text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:flex text-xs text-slate-400 items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>ONLINE</span>
            <Bell size={16} />
            <div className="w-8 h-8 border border-slate-700 rounded-full flex items-center justify-center"><User size={14} /></div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
          <section>
            <h1 className="text-4xl md:text-5xl font-black text-white">Assistance Dashboard</h1>
            <p className="text-lg md:text-xl text-slate-400 mt-2">System monitoring and garage assistance control</p>
          </section>

          {/* STATS SECTION */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 cursor-pointer gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.2}s` }}
                className="
                  opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]
                  bg-gradient-to-b from-blue-950/30 to-black
                  rounded-2xl border border-blue-900/40 overflow-hidden
                  transition-all duration-300
                  
                  /* ස්ථිර Outline එක */
                  ring-1 ring-blue-500/50 ring-offset-2 ring-offset-black
                  
                  /* Desktop Hover Effects */
                  hover:-translate-y-3 hover:scale-[1.02] hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]
                  
                  /* Mobile Touch Feedback */
                  active:scale-[0.95] active:border-blue-400 active:ring-2 active:ring-blue-500
                "
              >
                <div className="w-full h-64 md:h-60 overflow-hidden cursor-pointer">
                  <img
                    src={stat.img}
                    alt={stat.label}
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-900/30"><stat.icon size={24} /></div>
                    <div>
                      <p className="text-sm md:text-base uppercase text-slate-400">{stat.label}</p>
                      <p className="text-3xl md:text-4xl font-bold text-white mt-1">{stat.val}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* REQUESTS */}
          <section className="space-y-4">
            {[
              { id: 1, req: request1, set: setRequest1, text: "Technician Marcus Thorne requested delay for WP-CAS-1234" },
              { id: 2, req: request2, set: setRequest2, text: "Customer requested priority service WP-CAR-7788" },
              { id: 3, req: request3, set: setRequest3, text: "Emergency support request WP-EMG-9921" }
            ].map((item) => (
              <div key={item.id} className="bg-black p-5 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2 mb-3 text-slate-300"><Cpu size={16} /> LIVE REQUEST {item.id}</div>
                <div className="bg-blue-950/20 p-4 rounded-xl flex justify-between items-center">
                  <p className="text-sm text-slate-300">{item.text}</p>
                  <div className="flex gap-3">
                    <button onClick={() => item.set("APPROVED")} className="px-4 py-2 cursor-pointer text-xs bg-blue-600 text-white rounded-md">APPROVE</button>
                    <button onClick={() => item.set("DENIED")} className="px-4 cursor-pointer py-2 text-xs border border-blue-500 text-blue-300 rounded-md">DENY</button>
                    <span className="ml-auto text-xs w-20 text-right">{item.req}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}