import React from "react";
import {
  Menu,
  User,
} from "lucide-react";

import CustomerNotificationBell from "./CustomerNotificationBell";

export default function CustomerHeader({
  title = "Navigation Hub",
  customerName = "Customer",
  customerId = null,
  onMenuClick,
  onNavigateTarget,
}) {
  return (
    <header className="h-[72px] w-full shrink-0 border-b border-slate-800 bg-[#0c0d19] font-mono">
      <div className="flex h-full w-full items-center justify-between px-4 md:px-7">
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#0a0e18] text-slate-400 transition hover:border-blue-500/50 hover:text-blue-400 md:hidden"
            aria-label="Open customer menu"
          >
            <Menu size={20} />
          </button>

          {/* PAGE TITLE */}
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-purple-400">
              Customer Portal
            </p>

            <h1 className="mt-1 truncate text-base font-black uppercase tracking-wide text-white md:text-xl">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          {/* REAL CUSTOMER NOTIFICATION BELL */}
          <CustomerNotificationBell
            customerId={customerId}
            onNavigateTarget={onNavigateTarget}
          />

          {/* DIVIDER */}
          <div className="hidden h-9 w-px bg-slate-800 sm:block" />

          {/* CUSTOMER DETAILS */}
          <div className="hidden text-right sm:block">
            <p className="max-w-[220px] truncate text-sm font-black text-white md:text-base">
              {customerName}
            </p>

            <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">
              Customer
            </p>
          </div>

          {/* PROFILE ICON */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
            <User size={22} />
          </div>
        </div>
      </div>
    </header>
  );
}