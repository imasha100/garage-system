import React from "react";
import {
  LayoutDashboard,
  Siren,
  MessageSquare,
  CalendarDays,
  ReceiptText,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export default function Sidebar({
  activeItem,
  onNavigate,
  isOpen = false,
  onClose = () => {},
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Siren, label: "Incident Dispatch" },
    { icon: MessageSquare, label: "Customer Comms" },
    { icon: CalendarDays, label: "Resource Schedule" },
    { icon: ReceiptText, label: "Counter Ledger" },
    { icon: ShieldCheck, label: "Experience Audit" },
    { icon: User, label: "Assistance Profile" },
  ];

  const handleNavigation = (itemLabel) => {
    onNavigate(itemLabel);

    // Mobile screen එකේ menu item එක select කළාම sidebar close වෙනවා
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-[#1a1a1a] bg-black p-6 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="mb-10 mt-2 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-widest text-white">
              ASSIST SYSTEM
            </h1>

            <button
              type="button"
              className="text-white md:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handleNavigation(item.label)}
                  className={`flex w-full cursor-pointer items-center gap-4 border px-5 py-4 text-left text-xs font-bold tracking-widest transition-all duration-300 ${
                    activeItem === item.label
                      ? "border-[#1e3a8a] bg-[#0a142e]/40 text-blue-400 shadow-[0_0_15px_rgba(30,58,138,0.4)]"
                      : "border-[#1a1a1a] bg-transparent text-gray-500 hover:border-[#333]"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label.toUpperCase()}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}