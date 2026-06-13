
import React from "react";
import { User, ArrowLeft } from "lucide-react";
import mechanicBg from "../../assets/mechanic-bg.jpg";

export default function CustomerLogin({ onNavigate }) {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div
        className="w-screen h-screen max-h-screen overflow-hidden flex flex-col justify-between relative text-white font-sans selection:bg-cyan-500 selection:text-slate-950 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${mechanicBg})`,
        }}
      >
        {/* SHARP OVERLAY */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />

        {/* TECH NEON GLOWS */}
        <div className="absolute top-1/3 left-1/4 w-100 h-100 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/4 w-100 h-100 bg-red-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* TOP NAVBAR */}
        <div className="w-full h-16 border-b border-slate-900/60 bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <button
            onClick={() => onNavigate("start")}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-cyan-400 uppercase transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900/80 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors cursor-pointer">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex flex-col items-center justify-center text-center z-10 my-auto px-4 fade-in">
          <h2 className="text-6xl sm:text-5xl md:text-6xl font-black tracking-wide uppercase mb-4 max-w-4xl bg-clip-text text-transparent bg-linear-to-b from-white via-slate-100 to-slate-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            DO YOU WANT HELP?
          </h2>

          <p className="text-slate-200 text-xl sm:text-lg md:text-4xl tracking-wide max-w-xl mb-12 font-medium drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            If your vehicle has suffered a breakdown or emergency,
            select an option below.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-2xl">
            {/* YES BUTTON */}
            <button
              onClick={() => onNavigate("garage-map")}
              className="flex-1 text-left p-6 bg-red-600/90 hover:bg-red-500 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.35)] border border-red-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] active:scale-98 cursor-pointer"
            >
              <span className="block font-black text-xl sm:text-lg tracking-wider uppercase mb-1 text-white">
                YES, I NEED ASSISTANCE
              </span>

              <span className="block text-sm sm:text-xs font-medium text-red-100/90 leading-relaxed">
                Instantly initializes GPS tracking and opens the live
                garage routing map.
              </span>
            </button>

            {/* NO BUTTON */}
            <button
              onClick={() => onNavigate("start")}
              className="flex-1 text-left p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            >
              <span className="block font-black text-xl sm:text-lg tracking-wider uppercase mb-1 text-slate-200">
                NO, I AM OKAY
              </span>

              <span className="block text-sm sm:text-xs font-medium text-slate-400 leading-relaxed">
                Exits the emergency portal and displays:
                "Thank you. Drive safely!"
              </span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full text-center py-6 text-[10px] tracking-widest text-slate-400 font-bold uppercase z-10">
          SwiftGarage AI • Emergency Routing System
        </div>
      </div>
    </>
  );
}

