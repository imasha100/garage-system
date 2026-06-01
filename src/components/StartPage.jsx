import React from 'react';
import { ShieldAlert, Building2, Wrench, ShieldQuestion, Cpu } from 'lucide-react';

export default function StartPage({ onNavigate }) {
  return (
    <div className="w-screen min-h-screen md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden bg-slate-950 flex flex-col justify-between p-6 md:p-12 relative text-white font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-1/4 left-10 w-64 h-64 md:w-96 md:h-96 bg-teal-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-64 h-64 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* IDENTITY ZONE */}
      <div className="flex justify-center items-center gap-3 animate-fade-in z-10 mt-4 md:mt-0">
        <div className="p-2 md:p-2.5 bg-slate-900/80 rounded-xl border border-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
          <div className="relative">
            <Wrench className="w-6 h-6 md:w-8 md:h-8 text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
            <Cpu className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-linear-to-r from-white via-slate-100 to-teal-400">
          SwiftGarage <span className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">AI</span>
        </h1>
      </div>

      {/* PRIMARY ACTION */}
      <div className="flex flex-col items-center justify-center z-10 my-12 md:my-auto w-full px-2">
        <button 
          onClick={() => onNavigate('customer-login')}
          className="group relative w-full max-w-md md:max-w-none md:w-auto px-6 md:px-12 py-6 md:py-8 bg-linear-to-r from-red-600 via-orange-600 to-red-600 rounded-2xl font-black text-lg md:text-2xl tracking-widest uppercase text-white shadow-[0_0_40px_rgba(220,38,38,0.45)] md:shadow-[0_0_60px_rgba(220,38,38,0.55)] transition-all duration-300 hover:scale-102 md:hover:scale-105 hover:shadow-[0_0_80px_rgba(249,115,22,0.7)] active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl" />
          <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
            <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 animate-bounce text-yellow-300 shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] md:text-sm font-bold tracking-widest text-orange-200/90 mb-0.5">🚨 NEED IMMEDIATE HELP?</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] text-sm md:text-2xl block">EMERGENCY / CUSTOMER LOGIN</span>
            </div>
          </div>
        </button>
      </div>

      {/* SECONDARY ROLES */}
      <div className="w-full max-w-5xl mx-auto z-10 animate-fade-in-up mb-6 md:mb-0">
        <div className="w-full h-px bg-linear-to-r from-transparent via-slate-800 to-transparent mb-6 md:mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Garage Owner */}
          <button 
            onClick={() => alert('Garage Owner Portal')}
            className="group flex items-center md:flex-col justify-start md:justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 transition-all duration-300 hover:md:-translate-y-1.5 hover:border-blue-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] text-left md:text-center cursor-pointer gap-4 md:gap-0"
          >
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-300 md:mb-3 shrink-0">
              <Building2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-base md:text-lg font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors">
              Garage Owner
            </span>
          </button>

          {/* On-Duty Technician */}
          <button 
            onClick={() => onNavigate('technician-intake')}
            className="group flex items-center md:flex-col justify-start md:justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 transition-all duration-300 hover:md:-translate-y-1.5 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(52,211,153,0.25)] text-left md:text-center cursor-pointer gap-4 md:gap-0"
          >
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-300 md:mb-3 shrink-0">
              <Wrench className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-base md:text-lg font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors">
              On-Duty Technician
            </span>
          </button>

          {/* Assistance */}
          <button 
            onClick={() => alert('Roadside Assistance Portal')}
            className="group flex items-center md:flex-col justify-start md:justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 transition-all duration-300 hover:md:-translate-y-1.5 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] text-left md:text-center cursor-pointer gap-4 md:gap-0"
          >
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-all duration-300 md:mb-3 shrink-0">
              <ShieldQuestion className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-base md:text-lg font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors">
              Assistance
            </span>
          </button>

        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}