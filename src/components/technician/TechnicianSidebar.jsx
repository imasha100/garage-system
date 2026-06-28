import React from "react";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function TechnicianSidebar({ activeItem, onNavigate }) {
  const menuItems = [
    { id: "technician-intake", label: "Vehicle Intake", icon: Wrench },
    { id: "technician-dashboard", label: "Work Dashboard", icon: LayoutDashboard },
    { id: "task-logs", label: "Task History", icon: ClipboardList },
    { id: "technician-profile", label: "Profile", icon: User },
  ];

  return (
    <div className="w-72 h-screen bg-[#070b0f] text-slate-400 flex flex-col justify-between border-r-4 border-emerald-500 font-mono">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-white font-black text-2xl tracking-widest">
          TECHSUITE
        </h1>
        <p className="text-xs text-emerald-500 uppercase tracking-[0.2em] mt-2">
          Precision Ops
        </p>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 mt-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "border-emerald-900/40 bg-[#0a0e1a] text-emerald-300/60 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold uppercase tracking-wider text-left">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-emerald-500/20">
        <button
          onClick={() => onNavigate("start")}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-emerald-500/40 bg-[#0a0e1a] text-emerald-300 hover:bg-emerald-500/5 hover:border-red-500/50 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}