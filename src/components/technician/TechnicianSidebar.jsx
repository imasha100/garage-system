import React from "react";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  X,
  Lock,
} from "lucide-react";

export default function TechnicianSidebar({
  activeItem,
  onNavigate,
  isOpen = false,
  onClose = () => {},
  isShiftOn = false,
  isCheckingShift = false,
}) {
  const menuItems = [
    {
      id: "technician-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      requiresShift: true,
    },
    {
      id: "technician-intake",
      label: "Vehicle Intake",
      icon: Wrench,
      requiresShift: true,
    },
    {
      id: "task-logs",
      label: "Task History",
      icon: ClipboardList,
      requiresShift: true,
    },
    {
      id: "technician-profile",
      label: "Profile",
      icon: User,
      requiresShift: false,
    },
  ];

  const handleNavigation = (item) => {
    const isLocked =
      item.requiresShift &&
      !isCheckingShift &&
      !isShiftOn;

    if (isLocked) {
      return;
    }

    onNavigate(item.id);

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
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
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

              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  isCheckingShift
                    ? "border-slate-700 bg-slate-800/60 text-slate-400"
                    : isShiftOn
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCheckingShift
                      ? "bg-slate-500"
                      : isShiftOn
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                  }`}
                />

                {isCheckingShift
                  ? "CHECKING SHIFT"
                  : `SHIFT ${isShiftOn ? "ON" : "OFF"}`}
              </div>
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
              const isActive =
                activeItem === item.id;

              const isLocked =
                item.requiresShift &&
                !isCheckingShift &&
                !isShiftOn;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    handleNavigation(item)
                  }
                  disabled={
                    isLocked ||
                    (item.requiresShift &&
                      isCheckingShift)
                  }
                  className={`
                    w-full
                    flex items-center gap-3 sm:gap-4
                    px-4 sm:px-5
                    py-3.5 sm:py-4
                    rounded-xl
                    border
                    transition-all duration-300
                    ${
                      isLocked
                        ? "cursor-not-allowed border-slate-800 bg-[#080b10] text-slate-600 opacity-65"
                        : isActive
                        ? "cursor-pointer border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10"
                        : "cursor-pointer border-emerald-900/40 bg-[#0a0e1a] text-emerald-300/60 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  <span className="flex-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-left">
                    {item.label}
                  </span>

                  {isLocked && (
                    <Lock className="h-4 w-4 shrink-0 text-rose-400/70" />
                  )}
                </button>
              );
            })}
          </nav>

          {!isCheckingShift &&
            !isShiftOn && (
              <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                  Work Access Disabled
                </p>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Open Profile and turn your shift ON to access technician work pages.
                </p>
              </div>
            )}
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