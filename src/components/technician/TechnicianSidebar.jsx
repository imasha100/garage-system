
import React from "react";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  X,
} from "lucide-react";

export default function TechnicianSidebar({
  activeItem,
  onNavigate,
  isOpen = false,
  onClose = () => {},
}) {
  const menuItems = [
    {
      id: "technician-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "technician-intake",
      label: "Vehicle Intake",
      icon: Wrench,
    },
    {
      id: "task-logs",
      label: "Task History",
      icon: ClipboardList,
    },
    {
      id: "technician-profile",
      label: "Profile",
      icon: User,
    },
  ];

  const handleNavigation = (itemId) => {
    onNavigate(itemId);

    // Mobile sidebar එක item එක click කළාම close වෙනවා
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleLogout = () => {
    onNavigate("start");

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile dark overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky
          top-0 left-0
          z-50
          w-[85%] max-w-72 md:w-72
          h-screen
          bg-[#070b0f]
          text-slate-400
          flex flex-col justify-between
          border-r-2 border-emerald-500
          font-mono
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Main Section */}
        <div className="p-5 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white font-black text-xl sm:text-2xl tracking-widest">
                TECHSUITE
              </h1>

              <p className="text-[10px] sm:text-xs text-emerald-500 uppercase tracking-[0.2em] mt-2">
                Precision Ops
              </p>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-emerald-500/40 bg-[#0a0e1a] text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 sm:gap-4 mt-8 md:mt-10">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full
                    flex items-center gap-3 sm:gap-4
                    px-4 sm:px-5
                    py-3.5 sm:py-4
                    rounded-xl
                    cursor-pointer
                    border
                    transition-all duration-300
                    ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10"
                        : "border-emerald-900/40 bg-[#0a0e1a] text-emerald-300/60 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-left">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-emerald-500/20">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border cursor-pointer border-emerald-500/40 bg-[#0a0e1a] text-emerald-300 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/50 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 shrink-0" />

            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

