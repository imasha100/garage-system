import React, { useState } from "react";
import { User, Lock, ArrowLeft, Wrench } from "lucide-react";

export default function TechLogin({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "tech" && password === "1234") {
      onNavigate("technician-dashboard");
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />

      <button
        onClick={() => onNavigate("start")}
        className="absolute top-6 left-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Wrench size={40} className="text-emerald-400" />
          </div>

          <h1 className="text-3xl font-bold">Technician Login</h1>
          <p className="text-slate-400 mt-2">SwiftGarage AI Technician Portal</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-slate-300 mb-2">Username</label>
          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-emerald-400">
            <User size={18} className="text-emerald-400" />
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

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">Password</label>
          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-emerald-400">
            <Lock size={18} className="text-emerald-400" />
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

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg"
        >
          Login
        </button>

        <div className="mt-6 text-center text-slate-500 text-sm">
          Authorized Technicians Only
        </div>
      </form>
    </div>
  );
}