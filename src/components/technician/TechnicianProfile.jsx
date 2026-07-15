
import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  X,
  Power,
  PowerOff,
  Menu,
} from "lucide-react";
import avatarImage from "../../assets/profile.png";

export default function TechnicianProfile({ toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnShift, setIsOnShift] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [duration, setDuration] = useState("00:00:00");

  const [skills, setSkills] = useState([
    "Hybrid Expert",
    "Electrical Specialist",
    "Brake Systems L2",
  ]);

  const [newSkill, setNewSkill] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [shiftHistory, setShiftHistory] = useState([
    { date: "Oct 24, 2023", dur: "08h 12m", status: "VERIFIED" },
    { date: "Oct 23, 2023", dur: "07h 55m", status: "VERIFIED" },
    { date: "Oct 22, 2023", dur: "09h 05m", status: "PENDING" },
  ]);

  useEffect(() => {
    let interval;

    if (isOnShift && shiftStartTime) {
      interval = setInterval(() => {
        const diff = Date.now() - shiftStartTime;
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setDuration(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOnShift, shiftStartTime]);

  const openShiftPopup = () => {
    setShowConfirm(true);
  };

  const confirmShiftChange = () => {
    if (isOnShift) {
      const newEntry = {
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dur: duration.split(":")[0] + "h " + duration.split(":")[1] + "m",
        status: "VERIFIED",
      };

      setShiftHistory([newEntry, ...shiftHistory]);
      setIsOnShift(false);
      setShiftStartTime(null);
      setDuration("00:00:00");
    } else {
      setShiftStartTime(Date.now());
      setDuration("00:00:00");
      setIsOnShift(true);
    }

    setShowConfirm(false);
  };

  const addSkill = (e) => {
    e.preventDefault();

    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(normalizedSearch)
  );

  const filteredShiftHistory = shiftHistory.filter((row) =>
    [row.date, row.dur, row.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const nextStatus = isOnShift ? "OFF" : "ON";

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-300 font-mono relative">
      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 sm:px-6 backdrop-blur-xl">
        <div className="flex w-auto shrink-0 items-center gap-3 md:w-48">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open technician sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0a0d14] text-slate-400 transition hover:border-indigo-500 hover:text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-sm font-black tracking-[0.15em] text-white">
            TECHNICIANS
          </h1>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[525px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Workshop..."
              aria-label="Search profile content"
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="text-slate-400 transition hover:text-white"
          >
            <Bell size={17} />
          </button>

          <button
            type="button"
            aria-label="Help"
            className="text-slate-400 transition hover:text-white"
          >
            <HelpCircle size={17} />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold text-white">M. Anderson</p>
              <p className="text-[9px] uppercase text-slate-500">
                Senior Mechanic
              </p>
            </div>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={avatarImage}
                alt="M. Anderson"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Workshop..."
            aria-label="Search profile content"
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="py-8 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Technician Profile
            </h1>
            <p className="text-slate-500 text-xl">
              Manage your professional credentials and shift availability.
            </p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition text-sm cursor-pointer uppercase tracking-widest">
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#10121b] border border-slate-800 p-8 rounded-xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-emerald-400 to-indigo-500 animate-spin-slow" />
              <div className="absolute inset-1 rounded-full bg-[#10121b]" />
              <div className="w-28 h-28 rounded-full overflow-hidden relative z-10">
                <img
                  src={avatarImage}
                  alt="Marco"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white">Marco Rossi</h2>
            <p className="text-indigo-400 text-xs uppercase tracking-widest mb-6">
              Master Technician
            </p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#10121b] border border-slate-800 p-8 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Attendance
                  </p>
                  <h3 className="text-xl font-bold text-white">
                    Shift Status
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full flex items-center gap-2 ${
                      isOnShift
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isOnShift ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {isOnShift
                      ? "Currently On-Shift"
                      : "Currently Off-Shift"}
                  </span>

                  <button
                    onClick={openShiftPopup}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                      isOnShift ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isOnShift ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h2 className="text-4xl font-black text-white mb-2">
                {duration}
                <span className="text-sm font-normal text-slate-500 ml-2">
                  Current Duration
                </span>
              </h2>

              <div className="w-full bg-slate-800 h-2 rounded-full mb-6">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOnShift ? "w-2/3 bg-indigo-500" : "w-0"
                  }`}
                />
              </div>

              <p className="text-[10px] text-slate-500">
                {isOnShift && shiftStartTime
                  ? `Shift began at ${new Date(
                      shiftStartTime
                    ).toLocaleTimeString()}`
                  : "Shift is currently inactive."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-[#10121b] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-white font-bold text-sm mb-4">
              Skill Categories
            </h3>

            {filteredSkills.map((skill, i) => (
              <div
                key={i}
                className="bg-[#0a0d14] border border-slate-800 p-3 mb-2 rounded text-[11px] text-slate-300 flex justify-between"
              >
                {skill}
                <button
                  onClick={() => removeSkill(i)}
                  className="text-red-500 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}

            <form onSubmit={addSkill} className="flex gap-2 mt-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill..."
                className="flex-1 bg-[#0a0d14] border border-slate-800 p-2 rounded text-[10px] focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="bg-indigo-600 p-2 rounded text-white hover:bg-indigo-700"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-[#10121b] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-white font-bold text-sm mb-4">
              Recent Shifts
            </h3>

            <table className="w-full text-[10px] text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 uppercase">
                  <th className="text-left pb-3">Date</th>
                  <th className="text-left pb-3">Duration</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredShiftHistory.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-3">{row.date}</td>
                    <td className="py-3">{row.dur}</td>
                    <td
                      className={`py-3 ${
                        row.status === "PENDING"
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#10121b] border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={22} />
            </button>

            <div
              className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
                nextStatus === "ON"
                  ? "bg-emerald-500/10"
                  : "bg-rose-500/10"
              }`}
            >
              {nextStatus === "ON" ? (
                <Power size={34} className="text-emerald-400" />
              ) : (
                <PowerOff size={34} className="text-rose-400" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Confirm Shift Change
            </h2>

            <p className="text-slate-400 mb-6">
              Are you sure you want to turn your shift{" "}
              <span
                className={`font-bold ${
                  nextStatus === "ON"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {nextStatus}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold"
              >
                Cancel
              </button>

              <button
                onClick={confirmShiftChange}
                className={`w-1/2 py-3 rounded-lg text-white font-bold ${
                  nextStatus === "ON"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Yes, Turn {nextStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

