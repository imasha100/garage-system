import React from "react";
import {
  LayoutGrid,
  RefreshCw,
  Activity,
  FileText,
  ClipboardList,
  Settings,
} from "lucide-react";

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
}) {
  const menuItems = [
    {
      id: "navigation",
      label: "Navigation Hub",
      icon: LayoutGrid,
    },
    {
      id: "mobility",
      label: "Mobility Recovery",
      icon: RefreshCw,
    },
    {
      id: "progress",
      label: "Live Progress",
      icon: Activity,
    },
    {
      id: "invoice",
      label: "Invoice Ledger",
      icon: FileText,
    },
    {
      id: "audit",
      label: "Experience Audit",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="w-72 h-screen bg-[#070b0f] text-slate-400 flex flex-col justify-between border-r-4 border-blue-500 font-mono">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-white font-black text-2xl tracking-widest">
          GEAR_OS
        </h1>

        <p className="text-xs text-purple-500 uppercase tracking-[0.2em] mt-2">
          Enterprise Terminal
        </p>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 mt-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10"
                    : "border-blue-900/40 bg-[#0a0e1a] text-blue-300/60 hover:text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/5"
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
      <div className="p-6 border-t border-blue-500/20">
        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-blue-500/40 bg-[#0a0e1a] text-blue-300 hover:bg-blue-500/5 hover:border-blue-500 transition-all duration-300">
          <Settings className="w-5 h-5 flex-shrink-0" />

          <span className="text-sm font-bold uppercase tracking-wider">
            System Settings
          </span>
        </button>
      </div>
    </div>
  );
}