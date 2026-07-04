import React from "react";
import {
  ShieldAlert,
  Building2,
  Wrench,
  ShieldQuestion,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StartPage({ onNavigate }) {
  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-12 relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-20 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-teal-500/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-20 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-red-500/10 rounded-full blur-[140px]" />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center items-center gap-3 z-10 pt-2 md:pt-0"
      >
        <div className="p-3 bg-slate-900/80 rounded-xl border border-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
          <div className="relative">
            <Wrench className="w-8 h-8 md:w-10 md:h-10 text-teal-400" />
            <Cpu className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
          SwiftGarage <span className="text-teal-400">AI</span>
        </h1>
      </motion.div>

      {/* Emergency Button */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 py-8">
        <motion.button
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.55 }}
          onClick={() => onNavigate("customer-login")}
          className="group w-full max-w-md md:max-w-4xl px-6 md:px-12 py-8 md:py-10 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-3xl font-black tracking-widest uppercase text-white shadow-[0_0_40px_rgba(220,38,38,0.45)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(220,38,38,0.65)]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5">
            <ShieldAlert className="w-14 h-14 md:w-16 md:h-16 text-white shrink-0 group-hover:animate-pulse" />

            <div className="text-center sm:text-left">
              <span className="block text-sm sm:text-base md:text-lg font-bold tracking-widest text-orange-100 mb-1">
                NEED IMMEDIATE HELP?
              </span>

              <span className="text-2xl sm:text-3xl md:text-5xl block leading-tight">
                EMERGENCY / CUSTOMER LOGIN
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Bottom Cards */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.15 }}
        className="w-full max-w-6xl mx-auto z-10 pb-2"
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Garage Owner */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("Live Dashboard")}
            className="group flex items-center md:flex-col p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 transition-all duration-300 hover:border-blue-500/50 cursor-pointer gap-6 md:gap-4"
          >
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-all duration-300 shrink-0">
              <Building2 className="w-10 h-10 md:w-9 md:h-9" />
            </div>

            <span className="text-xl sm:text-2xl md:text-lg font-bold tracking-wide text-white">
              Garage Owner
            </span>
          </motion.button>

          {/* Technician */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("technician-intake")}
            className="group flex items-center md:flex-col p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 transition-all duration-300 hover:border-emerald-500/50 cursor-pointer gap-6 md:gap-4"
          >
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-all duration-300 shrink-0">
              <Wrench className="w-10 h-10 md:w-9 md:h-9" />
            </div>

            <span className="text-xl sm:text-2xl md:text-lg font-bold tracking-wide text-white">
              On-Duty Technician
            </span>
          </motion.button>

          {/* Assistance */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("assistance-dashboard")}
            className="group flex items-center md:flex-col p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 transition-all duration-300 hover:border-amber-500/50 cursor-pointer gap-6 md:gap-4"
          >
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-all duration-300 shrink-0">
              <ShieldQuestion className="w-10 h-10 md:w-9 md:h-9" />
            </div>

            <span className="text-xl sm:text-2xl md:text-lg font-bold tracking-wide text-white">
              Assistance
            </span>
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}