import React from "react";
import { Menu, Wrench, Truck, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegistrationCenter({ toggleSidebar, onNavigate }) {
  const cards = [
    {
      title: "Technician Registration",
      subtitle: "Add workshop technicians and service team members",
      icon: Wrench,
      color: "emerald",
      page: "technician-registration",
    },
    {
      title: "Tow Truck Registration",
      subtitle: "Register recovery vehicles and driver information",
      icon: Truck,
      color: "amber",
      page: "truck-registration",
    },
  ];

  const colorClasses = {
    emerald: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    amber: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
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

        <ShieldCheck className="text-blue-400" size={22} />
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                type="button"
                onClick={() => onNavigate(card.page)}
                className="group text-left bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-7 hover:border-white/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${colorClasses[card.color]}`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="text-lg md:text-xl font-black tracking-wide mb-3">
                  {card.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  {card.subtitle}
                </p>

                <div className="flex items-center justify-between text-xs font-bold tracking-widest text-gray-500 group-hover:text-white transition">
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