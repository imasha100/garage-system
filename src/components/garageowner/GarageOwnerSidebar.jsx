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
  PackageSearch,
  MessageSquareText,
} from "lucide-react";

export default function GarageOwnerSidebar({
  activeItem,
  onNavigate,
  isOpen,
  closeSidebar,
}) {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Live Dashboard",
    },
    {
      icon: Boxes,
      label: "Resource Matrix",
    },
    {
      icon: BarChart3,
      label: "Performance Audit",
    },
    {
      icon: ShieldCheck,
      label: "Service Quality",
    },
    {
      icon: DollarSign,
      label: "Profit Loss",
    },
    {
      icon: PackageSearch,
      label: "Stock Management",
    },
    {
      icon: MessageSquareText,
      label: "Contact Messages",
    },
    {
      icon: Settings2,
      label: "Registration",
    },
    {
      icon: User,
      label: "Owner Profile",
    },
  ];

  const handleMenuClick = (label) => {
    onNavigate(label);

    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }

    onNavigate("logout");
  };

  return (
    <>
      {/* ================================================
          MOBILE OVERLAY
      ================================================= */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close garage owner sidebar overlay"
          onClick={closeSidebar}
          className="
            fixed inset-0
            z-[190]
            bg-black/75
            backdrop-blur-sm
            md:hidden
          "
        />
      )}

      {/* ================================================
          SIDEBAR
      ================================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[200]

          w-[85%]
          max-w-[300px]
          h-[100dvh]

          bg-black
          border-r
          border-[#1a1a1a]

          flex
          flex-col

          overflow-hidden

          shadow-2xl

          transition-transform
          duration-300
          ease-in-out

          md:relative
          md:inset-auto
          md:z-auto
          md:w-72
          md:max-w-none
          md:h-screen
          md:translate-x-0
          md:shadow-none

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ================================================
            HEADER
        ================================================= */}
        <div
          className="
            shrink-0
            border-b
            border-[#1a1a1a]
            bg-black
            p-4
            md:p-6
          "
        >
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-black tracking-widest text-white md:text-xl">
              OWNER SYSTEM
            </h1>

            {/* MOBILE CLOSE */}
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close garage owner sidebar"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-lg
                border
                border-white/10

                bg-white/5
                text-white

                transition

                hover:border-red-500/40
                hover:bg-red-500/10
                hover:text-red-400

                md:hidden
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================================================
            MENU
        ================================================= */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            p-4
            md:p-6
          "
        >
          <nav className="space-y-3 md:space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeItem === item.label;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() =>
                    handleMenuClick(
                      item.label
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    border

                    px-4
                    py-3

                    text-left
                    text-[11px]
                    font-bold
                    tracking-widest

                    transition-all
                    duration-300

                    md:gap-4
                    md:px-5
                    md:py-4
                    md:text-xs

                    ${
                      isActive
                        ? "border-[#1e3a8a] bg-[#0a142e]/40 text-blue-400"
                        : "border-[#1a1a1a] text-gray-500 hover:border-[#333] hover:text-gray-300"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {item.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ================================================
            LOGOUT
        ================================================= */}
        <div
          className="
            shrink-0
            border-t
            border-[#1a1a1a]
            bg-black
            p-4
            md:p-6
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-3

              border
              border-red-500

              px-4
              py-3

              text-[11px]
              font-bold
              tracking-widest
              text-red-400

              transition-all

              hover:bg-red-500/10

              md:px-5
              md:py-4
              md:text-xs
            "
          >
            <LogOut size={18} />
            LOG OUT
          </button>
        </div>
      </aside>
    </>
  );
}