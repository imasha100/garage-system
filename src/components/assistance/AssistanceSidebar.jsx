import React, { useState } from "react";
import {
  LayoutDashboard,
  Siren,
  MessageSquare,
  CalendarDays,
  ReceiptText,
  ShieldCheck,
  User,
  X,
  LogOut,
  AlertTriangle,
  Lock,
} from "lucide-react";

import swiftGarageLogo from "../../assets/swiftgarage-logo.png";

export default function Sidebar({
  activeItem,
  onNavigate,
  isOpen = false,
  onClose = () => {},
  isShiftOn = false,
  isCheckingShift = false,
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      requiresShift: true,
    },
    {
      icon: Siren,
      label: "Incident Dispatch",
      requiresShift: true,
    },
    {
      icon: MessageSquare,
      label: "Customer Comms",
      requiresShift: true,
    },
    {
      icon: CalendarDays,
      label: "Resource Schedule",
      requiresShift: true,
    },
    {
      icon: ReceiptText,
      label: "Counter Ledger",
      requiresShift: true,
    },
    {
      icon: ShieldCheck,
      label: "Experience Audit",
      requiresShift: true,
    },
    {
      icon: User,
      label: "Assistance Profile",
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

    if (isLocked) {
      return;
    }

    onNavigate(item.label);

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleOpenLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleCloseLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);

    if (window.innerWidth < 768) {
      onClose();
    }

    onNavigate("logout");
  };

  return (
    <>
      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close assistance sidebar overlay"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[110]

            bg-black/70

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
          border-[#1a1a1a]

          bg-black

          font-mono

          shadow-[12px_0_35px_rgba(0,0,0,0.55)]

          transition-transform
          duration-300
          ease-in-out

          md:relative
          md:left-auto
          md:top-auto
          md:z-auto
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

        <div
          className="
            shrink-0

            border-b
            border-[#1a1a1a]

            px-6
            pb-5
            pt-6

            md:px-6
            md:pt-7
          "
        >
          <div className="flex items-start justify-between gap-3">
            {/* LOGO + TITLE */}

            <div className="min-w-0 flex-1">
              <img
                src={swiftGarageLogo}
                alt="SwiftGarage AI"
                className="
                  h-14
                  w-auto
                  max-w-[185px]

                  object-contain
                  object-left

                  md:h-16
                  md:max-w-[200px]
                "
              />

              <h1
                className="
                  mt-3

                  whitespace-nowrap

                  text-[22px]
                  font-black
                  tracking-widest
                  text-white

                  md:text-xl
                "
              >
                ASSIST SYSTEM
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

                  px-3
                  py-1

                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest

                  ${
                    isCheckingShift
                      ? "border-slate-700 bg-slate-800/60 text-slate-400"
                      : isShiftOn
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }
                `}
              >
                <span
                  className={`
                    h-2
                    w-2
                    rounded-full

                    ${
                      isCheckingShift
                        ? "bg-slate-500"
                        : isShiftOn
                        ? "bg-green-400"
                        : "bg-red-400"
                    }
                  `}
                />

                <span className="whitespace-nowrap">
                  {isCheckingShift
                    ? "CHECKING SHIFT"
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
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X
                size={27}
                strokeWidth={2.2}
              />
            </button>
          </div>
        </div>

        {/* ==================================================
            MENU AREA
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
          <nav className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isLocked =
                item.requiresShift &&
                !isCheckingShift &&
                !isShiftOn;

              const isDisabled =
                item.requiresShift &&
                (isLocked ||
                  isCheckingShift);

              const isActive =
                activeItem === item.label;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() =>
                    handleNavigation(item)
                  }
                  disabled={isDisabled}
                  className={`
                    flex
                    min-h-[62px]
                    w-full
                    items-center
                    gap-4

                    border

                    px-5
                    py-4

                    text-left

                    text-xs
                    font-bold
                    tracking-widest

                    transition-all
                    duration-300

                    ${
                      isLocked
                        ? `
                            cursor-not-allowed
                            border-[#1a1a1a]
                            bg-[#070707]
                            text-gray-700
                            opacity-65
                          `
                        : isActive
                        ? `
                            cursor-pointer
                            border-[#1e3a8a]
                            bg-[#0a142e]/40
                            text-blue-400
                            shadow-[0_0_15px_rgba(30,58,138,0.4)]
                          `
                        : `
                            cursor-pointer
                            border-[#1a1a1a]
                            bg-transparent
                            text-gray-500

                            hover:border-[#333]
                            hover:text-gray-300
                          `
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1">
                    {item.label.toUpperCase()}
                  </span>

                  {isLocked && (
                    <Lock
                      size={15}
                      className="shrink-0 text-red-400/70"
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
                  mt-6

                  rounded-xl

                  border
                  border-red-500/20

                  bg-red-500/5

                  p-4
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-red-400
                  "
                >
                  Work Access Disabled
                </p>

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-gray-500
                  "
                >
                  Open Assistance Profile and turn your shift ON to access operational pages.
                </p>
              </div>
            )}
        </div>

        {/* ==================================================
            LOGOUT SECTION
        ================================================== */}

        <div
          className="
            shrink-0

            border-t
            border-[#1a1a1a]

            px-6
            pb-6
            pt-5
          "
        >
          <button
            type="button"
            onClick={handleOpenLogoutConfirm}
            className="
              flex
              w-full
              items-center
              gap-4

              border
              border-red-500/30

              bg-red-500/5

              px-5
              py-4

              text-left

              text-xs
              font-bold
              tracking-widest
              text-red-400

              transition-all
              duration-300

              hover:border-red-500/60
              hover:bg-red-500/10
              hover:text-red-300
            "
          >
            <LogOut
              size={18}
              className="shrink-0"
            />

            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* ==================================================
          LOGOUT CONFIRMATION POPUP
      ================================================== */}

      {showLogoutConfirm && (
        <div
          className="
            fixed
            inset-0
            z-[300]

            flex
            items-center
            justify-center

            bg-black/80

            p-4

            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseLogoutConfirm();
            }
          }}
        >
          <div
            className="
              relative

              w-full
              max-w-md

              rounded-3xl

              border
              border-red-500/30

              bg-[#0b0e14]

              p-6

              shadow-2xl
              shadow-red-500/10
            "
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={handleCloseLogoutConfirm}
              className="
                absolute
                right-4
                top-4

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-xl

                border
                border-white/10

                bg-black/30

                text-gray-400

                transition

                hover:border-white/20
                hover:text-white
              "
              aria-label="Close logout confirmation"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              {/* ICON */}

              <div
                className="
                  mx-auto

                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-red-500/30

                  bg-red-500/10
                "
              >
                <AlertTriangle
                  size={32}
                  className="text-red-400"
                />
              </div>

              <p
                className="
                  mt-5

                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-red-400
                "
              >
                Confirmation
              </p>

              <h2
                className="
                  mt-2

                  text-2xl
                  font-black
                  text-white
                "
              >
                Logout from account?
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-sm

                  text-sm
                  leading-6
                  text-gray-400
                "
              >
                Are you sure you want to logout from the Assistance Officer account?
              </p>

              {/* ACTION BUTTONS */}

              <div
                className="
                  mt-7

                  flex
                  flex-col
                  gap-3

                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={handleCloseLogoutConfirm}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    border
                    border-white/10

                    bg-black/30

                    px-5
                    py-3

                    font-bold
                    text-gray-300

                    transition

                    hover:border-white/20
                    hover:text-white
                  "
                >
                  <X size={18} />

                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    bg-red-600

                    px-5
                    py-3

                    font-black
                    text-white

                    transition

                    hover:bg-red-500
                  "
                >
                  <LogOut size={18} />

                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}