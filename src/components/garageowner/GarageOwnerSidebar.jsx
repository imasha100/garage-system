import React from "react";
import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  ShieldCheck,
  DollarSign,
  User,
  LogOut,
  X,
  Settings2,
} from "lucide-react";

export default function GarageOwnerSidebar({
  activeItem,
  onNavigate,
  isOpen,
  closeSidebar,
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Live Dashboard" },
    { icon: Boxes, label: "Resource Matrix" },
    { icon: BarChart3, label: "Performance Audit" },
    { icon: ShieldCheck, label: "Service Quality" },
    { icon: DollarSign, label: "Profit Loss" },
    { icon: Settings2, label: "Registration" },
    { icon: User, label: "Owner Profile" },
  ];

  const handleMenuClick = (label) => {
    onNavigate(label);

    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    onNavigate("logout");
  };

  return (
    <>
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 z-50
        w-[82%] max-w-[280px] md:w-72
        h-screen bg-black border-r border-[#1a1a1a]
        flex flex-col overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 md:p-6 border-b border-[#1a1a1a] shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-white font-black text-lg md:text-xl tracking-widest">
              OWNER SYSTEM
            </h1>

            <button
              type="button"
              className="md:hidden text-white hover:text-red-400 transition"
              onClick={closeSidebar}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          <nav className="space-y-3 md:space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handleMenuClick(item.label)}
                  className={`w-full flex items-center gap-3 md:gap-4
                  px-4 md:px-5 py-3 md:py-4
                  text-[11px] md:text-xs font-bold tracking-widest border
                  transition-all duration-300
                  ${
                    activeItem === item.label
                      ? "bg-[#0a142e]/40 border-[#1e3a8a] text-blue-400"
                      : "border-[#1a1a1a] text-gray-500 hover:text-gray-300 hover:border-[#333]"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">
                    {item.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 md:p-6 border-t border-[#1a1a1a] shrink-0 bg-black">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3
            px-4 py-3 md:px-5 md:py-4
            text-[11px] md:text-xs font-bold tracking-widest
            border border-red-500 text-red-400
            hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut size={18} />
            LOG OUT
          </button>
        </div>
      </aside>
    </>
  );
}