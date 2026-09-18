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

import swiftGarageLogo from "../../assets/swiftgarage-logo.png";

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

  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleNavigation = (item) => {
    const isLocked =
      item.requiresShift &&
      !isCheckingShift &&
      !isShiftOn;

    const isDisabled =
      isLocked ||
      (item.requiresShift &&
        isCheckingShift);

    if (isDisabled) {
      return;
    }

    onNavigate(item.id);

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    onNavigate("start");

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* ==================================================
          MOBILE DARK OVERLAY
      ================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close technician sidebar overlay"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[110]
            bg-black/65
            md:hidden
          "
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[120]

          flex
          h-[100dvh]
          w-[81vw]
          max-w-[365px]
          flex-col

          overflow-hidden

          border-r
          border-cyan-500/35

          bg-[#050505]

          font-mono
          text-slate-400

          shadow-[12px_0_35px_rgba(0,0,0,0.55)]

          transition-transform
          duration-300
          ease-in-out

          md:sticky
          md:top-0
          md:z-30
          md:h-screen
          md:w-72
          md:max-w-none
          md:shrink-0
          md:translate-x-0
          md:shadow-none

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="shrink-0 px-6 pb-5 pt-6 md:px-6 md:pt-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <img
                src={swiftGarageLogo}
                alt="SwiftGarage AI"
                className="
                  h-14
                  w-auto
                  max-w-[190px]
                  object-contain
                  object-left
                "
              />

              <h1
                className="
                  mt-4
                  whitespace-nowrap
                  text-[22px]
                  font-black
                  tracking-[0.08em]
                  text-white
                  md:text-xl
                "
              >
                TECHNICIANS
              </h1>

              {/* SHIFT STATUS */}

              <div
                className={`
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3.5
                  py-1.5
                  text-[12px]
                  font-black
                  uppercase
                  tracking-[0.06em]

                  ${
                    isCheckingShift
                      ? "border-slate-700 bg-slate-900 text-slate-400"
                      : isShiftOn
                      ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/70 bg-rose-500/10 text-rose-400"
                  }
                `}
              >
                <span
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    ${
                      isCheckingShift
                        ? "bg-slate-500"
                        : isShiftOn
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                    }
                  `}
                />

                <span className="whitespace-nowrap">
                  {isCheckingShift
                    ? "CHECKING"
                    : `SHIFT ${
                        isShiftOn
                          ? "ON"
                          : "OFF"
                      }`}
                </span>
              </div>
            </div>

            {/* MOBILE CLOSE BUTTON */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="
                relative
                z-[130]
                mt-1
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                text-white
                transition
                hover:text-cyan-300
                md:hidden
              "
            >
              <X
                size={28}
                strokeWidth={2.3}
              />
            </button>
          </div>
        </div>

        {/* ==================================================
            TOP DIVIDER
        ================================================== */}

        <div
          className="
            mx-6
            shrink-0
            border-t
            border-slate-800
          "
        />

        {/* ==================================================
            NAVIGATION AREA
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-6
            py-5
          "
        >
          <nav className="space-y-5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeItem === item.id;

              const isLocked =
                item.requiresShift &&
                !isCheckingShift &&
                !isShiftOn;

              const isDisabled =
                isLocked ||
                (item.requiresShift &&
                  isCheckingShift);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    handleNavigation(item)
                  }
                  className={`
                    flex
                    min-h-[65px]
                    w-full
                    items-center
                    gap-5
                    border
                    px-6
                    text-left
                    transition-all
                    duration-200

                    ${
                      isLocked
                        ? `
                            cursor-not-allowed
                            border-slate-800
                            bg-[#060606]
                            text-slate-600
                            opacity-65
                          `
                        : isActive
                        ? `
                            border-blue-500
                            bg-[#07101f]
                            text-blue-400
                          `
                        : `
                            border-slate-800
                            bg-[#050505]
                            text-slate-500
                            hover:border-slate-700
                            hover:text-slate-300
                          `
                    }
                  `}
                >
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />

                  <span
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-[14px]
                      font-black
                      uppercase
                      tracking-[0.08em]
                    "
                  >
                    {item.label}
                  </span>

                  {isLocked && (
                    <Lock
                      size={17}
                      className="
                        shrink-0
                        text-rose-500/70
                      "
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ==================================================
              SHIFT OFF INFO
          ================================================== */}

          {!isCheckingShift &&
            !isShiftOn && (
              <div
                className="
                  mt-5
                  border
                  border-rose-500/25
                  bg-rose-500/[0.04]
                  p-4
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-rose-400
                  "
                >
                  Work Access Disabled
                </p>

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-slate-600
                  "
                >
                  Open Profile and turn your shift ON to access technician work pages.
                </p>
              </div>
            )}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          className="
            shrink-0
            px-6
            pb-7
            pt-3
            md:pb-6
          "
        >
          <div
            className="
              mb-6
              border-t
              border-slate-800
            "
          />

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              min-h-[65px]
              w-full
              items-center
              gap-5
              border
              border-red-500/60
              bg-red-950/20
              px-6
              text-left
              text-red-400
              transition
              hover:border-red-400
              hover:bg-red-950/35
              hover:text-red-300
            "
          >
            <LogOut
              size={23}
              strokeWidth={1.8}
            />

            <span
              className="
                text-[14px]
                font-black
                uppercase
                tracking-[0.08em]
              "
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
