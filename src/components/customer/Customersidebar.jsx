import React, { useState } from "react";
import {
  LayoutGrid,
  RefreshCw,
  Activity,
  FileText,
  ClipboardList,
  Truck,
  LogOut,
  X,
  Star,
  MessageCircle,
} from "lucide-react";

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
  onNavigate,
}) {
  const [showLogoutPopup, setShowLogoutPopup] =
    useState(false);

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
      id: "track-tow",
      label: "Track My Tow Truck",
      icon: Truck,
    },
    {
      id: "progress",
      label: "Live Progress",
      icon: Activity,
    },
    {
      id: "chat",
      label: "Chat with Assistance",
      icon: MessageCircle,
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

  const performLogout = () => {
    sessionStorage.removeItem(
      "latestServiceRequest"
    );

    sessionStorage.removeItem(
      "selectedGarage"
    );

    sessionStorage.removeItem(
      "customerUser"
    );

    sessionStorage.removeItem(
      "customerId"
    );

    if (
      typeof onNavigate === "function"
    ) {
      onNavigate("start");
      return;
    }

    window.location.href = "/";
  };

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleLeaveFeedback = () => {
    setShowLogoutPopup(false);

    if (
      typeof setActiveTab === "function"
    ) {
      setActiveTab("audit");
    }
  };

  const handleMenuClick = (itemId) => {
    if (
      typeof setActiveTab === "function"
    ) {
      setActiveTab(itemId);
    }
  };

  return (
    <>
      <aside
        className="
          sticky
          top-0
          flex
          h-[100dvh]
          w-72
          shrink-0
          flex-col
          overflow-hidden
          border-r-4
          border-blue-500
          bg-[#070b0f]
          font-mono
          text-slate-400
        "
      >
        {/* HEADER */}
        <div className="shrink-0 px-8 pb-4 pt-8">
          <h1 className="text-2xl font-black tracking-widest text-white">
            GARAGE SYSTEM
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-purple-500">
            Customer Portal
          </p>
        </div>

        {/* SCROLLABLE MENU AREA */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-5">
          <nav className="mt-6 flex flex-col gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleMenuClick(item.id)
                  }
                  className={`
                    flex
                    w-full
                    shrink-0
                    items-center
                    gap-4
                    rounded-xl
                    border
                    px-5
                    py-4
                    text-left
                    transition-all
                    duration-300

                    ${
                      isActive
                        ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10"
                        : "border-blue-900/40 bg-[#0a0e1a] text-blue-300/60 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-300"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span className="min-w-0 text-sm font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT ALWAYS VISIBLE */}
        <div className="shrink-0 border-t border-slate-800 bg-[#070b0f] p-6">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-red-500/40
              bg-red-500/10
              px-5
              py-4
              text-red-300
              transition-all
              duration-300
              hover:bg-red-500
              hover:text-white
            "
          >
            <LogOut className="h-5 w-5" />

            <span className="text-sm font-bold uppercase tracking-wider">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* LOGOUT POPUP */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-blue-500/30 bg-[#0b0f17] p-7 shadow-2xl shadow-blue-500/10">
            <button
              type="button"
              onClick={() =>
                setShowLogoutPopup(false)
              }
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-slate-400 transition hover:border-white/20 hover:text-white"
              aria-label="Close popup"
            >
              <X size={19} />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10">
                <Star
                  size={30}
                  className="text-yellow-300"
                />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                Before You Leave
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Share Your Experience
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-400">
                Your feedback helps us improve our
                service. Would you like to rate your
                garage experience before logging out?
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleLeaveFeedback}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-500"
                >
                  <Star size={18} />

                  LEAVE FEEDBACK
                </button>

                <button
                  type="button"
                  onClick={performLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 font-bold text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10"
                >
                  <LogOut size={18} />

                  LOGOUT ANYWAY
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowLogoutPopup(false)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-bold text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}