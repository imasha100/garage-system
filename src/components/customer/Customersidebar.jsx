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
    <div className="w-64 h-screen bg-[#070b0f] text-slate-400 flex flex-col justify-between border-r-4 border-blue-500 font-mono">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-white font-black text-lg tracking-widest">
          GEAR_OS
        </h1>

        <p className="text-[10px] text-purple-500 uppercase tracking-[0.2em] mt-1">
          Enterprise Terminal
        </p>

        <nav className="flex flex-col gap-3 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-blue-900/40 bg-[#0a0e1a] text-blue-300/60 hover:text-blue-300"
                }`}
              >
                <Icon className="w-4 h-4" />

                <span className="text-xs font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-blue-500/20">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-blue-500/40 bg-[#0a0e1a] text-blue-300">
          <Settings className="w-4 h-4" />

          <span className="text-xs font-bold uppercase">
            System Settings
          </span>
        </button>
      </div>
    </div>
  );
}