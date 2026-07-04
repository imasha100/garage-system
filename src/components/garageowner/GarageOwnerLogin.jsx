import React, { useState } from "react";
import { User, Lock, ArrowLeft, Building2 } from "lucide-react";

export default function GarageOwnerLogin({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo Authentication
    if (username === "owner" && password === "1234") {
      onNavigate("Live Dashboard");
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]" />

      {/* Back Button */}
      <button
        onClick={() => onNavigate("start")}
        className="absolute top-6 left-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 size={40} className="text-cyan-400" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Garage Owner Login
          </h1>

          <p className="text-slate-400 mt-2">
            SwiftGarage AI Management Portal
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="block text-sm text-slate-300 mb-2">
            Username
          </label>

          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-cyan-400 transition">
            <User size={18} className="text-cyan-400" />

            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-transparent outline-none px-3 py-4 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">
            Password
          </label>

          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-cyan-400 transition">
            <Lock size={18} className="text-cyan-400" />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent outline-none px-3 py-4 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition-all duration-300"
        >
          Login
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          Authorized Garage Owners Only
        </div>
      </form>
    </div>
  );
}