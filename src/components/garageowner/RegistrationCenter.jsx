import React from "react";
import {
  Menu,
  User,
  Wrench,
  Truck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function RegistrationCenter({
  toggleSidebar,
  onNavigate,
}) {
  const cards = [
    {
      title: "Technician Registration",
      subtitle: "Add workshop technicians and service team members",
      icon: Wrench,
      color: "emerald",
      page: "technician-registration",
    },
    {
      title: "Garage Tow Truck Registration",
      subtitle: "Register garage-owned tow trucks and driver information",
      icon: Truck,
      color: "amber",
      page: "truck-registration",
    },
    {
      title: "Assistance Registration",
      subtitle: "Register assistance officers and dispatch operators",
      icon: User,
      color: "blue",
      page: "assistance-registration",
    },
    {
      title: "External Tow Truck Registration",
      subtitle:
        "Register third-party tow trucks operating around the garage area",
      icon: Truck,
      color: "purple",
      page: "external-truck-registration",
    },
  ];

  const colorClasses = {
    emerald:
      "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    amber:
      "border-amber-500/40 text-amber-400 bg-amber-500/10",
    blue:
      "border-blue-500/40 text-blue-400 bg-blue-500/10",
    purple:
      "border-purple-500/40 text-purple-400 bg-purple-500/10",
  };

  const cardHoverClasses = {
    emerald: "hover:border-emerald-500/50",
    amber: "hover:border-amber-500/50",
    blue: "hover:border-blue-500/50",
    purple: "hover:border-purple-500/50",
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-black tracking-widest">
              REGISTRATION
            </h1>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Manage system registration modules
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
          <ShieldCheck className="text-blue-400" size={22} />
        </div>
      </header>

      <main className="p-4 md:p-8">
        <p className="text-gray-600 font-bold tracking-widest text-xs md:text-sm mb-4">
          SELECT REGISTRATION MODULE
        </p>

        <h2 className="text-2xl md:text-3xl font-black mb-3">
          Registration Dashboard
        </h2>

        <p className="text-gray-400 max-w-2xl mb-8">
          Choose a registration type to continue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.page}
                type="button"
                onClick={() => onNavigate(card.page)}
                className={`group text-left bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  cardHoverClasses[card.color]
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${
                    colorClasses[card.color]
                  }`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="text-lg md:text-xl font-black mb-3">
                  {card.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed mb-8 min-h-[44px]">
                  {card.subtitle}
                </p>

                <div className="flex items-center justify-between text-xs font-bold tracking-widest text-gray-500 group-hover:text-white">
                  <span>CONTINUE</span>
                  <ArrowRight size={18} />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}