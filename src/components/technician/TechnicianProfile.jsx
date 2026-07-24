import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  X,
  Power,
  PowerOff,
  Menu,
  RefreshCw,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  UserCog,
} from "lucide-react";

import avatarImage from "../../assets/profile.png";

export default function TechnicianProfile({ toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState("");

  const [technician, setTechnician] = useState(null);
  const [isLoadingTechnician, setIsLoadingTechnician] =
    useState(true);
  const [technicianError, setTechnicianError] = useState("");

  const [isOnShift, setIsOnShift] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [duration, setDuration] = useState("00:00:00");

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);

  const [shiftHistory, setShiftHistory] = useState([
    {
      date: "Oct 24, 2023",
      dur: "08h 12m",
      status: "VERIFIED",
    },
    {
      date: "Oct 23, 2023",
      dur: "07h 55m",
      status: "VERIFIED",
    },
    {
      date: "Oct 22, 2023",
      dur: "09h 05m",
      status: "PENDING",
    },
  ]);

  // ======================================================
  // GET LOGGED-IN STAFF USER
  // ======================================================

  const getLoggedInStaffUser = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      return JSON.parse(storedStaffUser);
    } catch (error) {
      console.error(
        "Unable to read logged-in staff user:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // LOAD TECHNICIAN PROFILE
  // ======================================================

  const loadTechnicianDetails = async () => {
    setIsLoadingTechnician(true);
    setTechnicianError("");

    try {
      const staffUser = getLoggedInStaffUser();

      if (!staffUser) {
        throw new Error(
          "Logged-in technician details were not found. Please sign in again."
        );
      }

      if (staffUser.role !== "technician") {
        throw new Error(
          "This profile is only available for technician accounts."
        );
      }

      const technicianId = Number(staffUser.staffId);

      if (
        !Number.isInteger(technicianId) ||
        technicianId <= 0
      ) {
        throw new Error(
          "A valid technician ID could not be found. Please sign in again."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/technicians/${technicianId}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.success === false ||
        !data.technician
      ) {
        throw new Error(
          data.message ||
            "Unable to load technician profile."
        );
      }

      const technicianData = data.technician;

      setTechnician(technicianData);

      const databaseSkills = Array.isArray(
        technicianData.specialization
      )
        ? technicianData.specialization
        : [];

      setSkills(databaseSkills);

      setIsOnShift(
        String(technicianData.shiftStatus).toUpperCase() ===
          "ON"
      );
    } catch (error) {
      console.error(
        "Load technician profile error:",
        error
      );

      setTechnician(null);
      setSkills([]);

      setTechnicianError(
        error.message ||
          "Unable to load technician profile."
      );
    } finally {
      setIsLoadingTechnician(false);
    }
  };

  useEffect(() => {
    loadTechnicianDetails();
  }, []);

  // ======================================================
  // SHIFT TIMER
  // ======================================================

  useEffect(() => {
    let interval;

    if (isOnShift && shiftStartTime) {
      interval = setInterval(() => {
        const diff = Date.now() - shiftStartTime;

        const hours = Math.floor(
          diff / 1000 / 60 / 60
        );

        const minutes = Math.floor(
          (diff / 1000 / 60) % 60
        );

        const seconds = Math.floor(
          (diff / 1000) % 60
        );

        setDuration(
          `${String(hours).padStart(2, "0")}:${String(
            minutes
          ).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOnShift, shiftStartTime]);

  // ======================================================
  // SHIFT ACTIONS
  // ======================================================

  const openShiftPopup = () => {
    setShowConfirm(true);
  };

  const confirmShiftChange = async () => {
    if (isUpdatingShift) {
      return;
    }

    setIsUpdatingShift(true);

    try {
      const staffUser = getLoggedInStaffUser();
      const technicianId = Number(staffUser?.staffId);

      if (
        !Number.isInteger(technicianId) ||
        technicianId <= 0
      ) {
        throw new Error(
          "A valid technician ID could not be found. Please sign in again."
        );
      }

      const newStatus = isOnShift ? "OFF" : "ON";

      const response = await fetch(
        `http://localhost:5000/api/technicians/${technicianId}/shift-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shiftStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to update technician shift status."
        );
      }

      if (newStatus === "ON") {
        setIsOnShift(true);
        setShiftStartTime(Date.now());
        setDuration("00:00:00");
      } else {
        const newEntry = {
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          dur:
            duration.split(":")[0] +
            "h " +
            duration.split(":")[1] +
            "m",
          status: "VERIFIED",
        };

        setShiftHistory((previousHistory) => [
          newEntry,
          ...previousHistory,
        ]);

        setIsOnShift(false);
        setShiftStartTime(null);
        setDuration("00:00:00");
      }

      setTechnician((previousTechnician) =>
        previousTechnician
          ? {
              ...previousTechnician,
              shiftStatus: newStatus,
            }
          : previousTechnician
      );

      setShowConfirm(false);
    } catch (error) {
      console.error(
        "Update technician shift status error:",
        error
      );

      setTechnicianError(
        error.message ||
          "Unable to update technician shift status."
      );
    } finally {
      setIsUpdatingShift(false);
    }
  };

  // ======================================================
  // SKILL ACTIONS
  // ======================================================

  const addSkill = (event) => {
    event.preventDefault();

    const trimmedSkill = newSkill.trim();

    if (
      trimmedSkill &&
      !skills.some(
        (skill) =>
          skill.toLowerCase() ===
          trimmedSkill.toLowerCase()
      )
    ) {
      setSkills((previousSkills) => [
        ...previousSkills,
        trimmedSkill,
      ]);

      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setSkills((previousSkills) =>
      previousSkills.filter(
        (_, skillIndex) => skillIndex !== index
      )
    );
  };

  // ======================================================
  // DISPLAY VALUES
  // ======================================================

  const technicianName =
    technician?.fullName || "Technician";

  const technicianRole =
    skills.length > 0
      ? skills[0]
      : "Workshop Technician";

  const technicianEmail =
    technician?.email || "N/A";

  const technicianContact =
    technician?.contactNumber || "N/A";

  const technicianNic =
    technician?.nic || "N/A";

  const technicianExperience =
    technician?.experience !== undefined &&
    technician?.experience !== null &&
    technician?.experience !== ""
      ? `${technician.experience} Years`
      : "N/A";

  const technicianInitials =
    technicianName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) =>
        namePart.charAt(0).toUpperCase()
      )
      .join("") || "T";

  // ======================================================
  // SEARCH
  // ======================================================

  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredSkills = useMemo(() => {
    if (!normalizedSearch) {
      return skills.map((skill, index) => ({
        skill,
        originalIndex: index,
      }));
    }

    return skills
      .map((skill, index) => ({
        skill,
        originalIndex: index,
      }))
      .filter(({ skill }) =>
        skill.toLowerCase().includes(normalizedSearch)
      );
  }, [skills, normalizedSearch]);

  const filteredShiftHistory = useMemo(() => {
    return shiftHistory.filter((row) =>
      [row.date, row.dur, row.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [shiftHistory, normalizedSearch]);

  const nextStatus = isOnShift ? "OFF" : "ON";

  return (
    <div className="relative min-h-screen bg-[#0a0d14] font-mono text-slate-300">
      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 backdrop-blur-xl sm:px-6">
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
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
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
              <p className="max-w-[150px] truncate text-[10px] font-bold text-white">
                {isLoadingTechnician
                  ? "Loading..."
                  : technicianName}
              </p>

              <p className="max-w-[150px] truncate text-[9px] uppercase text-slate-500">
                {isLoadingTechnician
                  ? "Technician"
                  : technicianRole}
              </p>
            </div>

            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={avatarImage}
                alt={`${technicianName} profile`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <div className="absolute inset-0 -z-10 flex items-center justify-center text-xs font-black text-indigo-300">
                {technicianInitials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          MOBILE SEARCH
      =================================================== */}

      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search Workshop..."
            aria-label="Search profile content"
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ==================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {technicianError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-red-300">
                Unable to load technician profile
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {technicianError}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTechnicianDetails}
              disabled={isLoadingTechnician}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoadingTechnician
                    ? "animate-spin"
                    : ""
                }
              />

              Retry
            </button>
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Technician Profile
            </h1>

            <p className="mt-1 text-base text-slate-500 sm:text-xl">
              Manage your professional credentials and
              shift availability.
            </p>
          </div>

          <button
            type="button"
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>

        {/* ==================================================
            PROFILE AND SHIFT
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}

          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-8 text-center">
            <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 animate-spin-slow rounded-full bg-gradient-to-tr from-indigo-500 via-emerald-400 to-indigo-500" />

              <div className="absolute inset-1 rounded-full bg-[#10121b]" />

              <div className="relative z-10 h-28 w-28 overflow-hidden rounded-full bg-slate-800">
                <img
                  src={avatarImage}
                  alt={`${technicianName} profile`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

                <div className="absolute inset-0 -z-10 flex items-center justify-center text-2xl font-black text-indigo-300">
                  {technicianInitials}
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white">
              {isLoadingTechnician
                ? "Loading..."
                : technicianName}
            </h2>

            <p className="mb-6 mt-1 text-xs uppercase tracking-widest text-indigo-400">
              {technicianRole}
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600">
                    Email
                  </p>

                  <p className="mt-1 break-all text-xs font-bold text-white">
                    {technicianEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600">
                    Contact Number
                  </p>

                  <p className="mt-1 text-xs font-bold text-white">
                    {technicianContact}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <CreditCard
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600">
                    NIC
                  </p>

                  <p className="mt-1 text-xs font-bold text-white">
                    {technicianNic}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <Briefcase
                  size={17}
                  className="mt-0.5 shrink-0 text-purple-400"
                />

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600">
                    Experience
                  </p>

                  <p className="mt-1 text-xs font-bold text-white">
                    {technicianExperience}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Card */}

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-[#10121b] p-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Attendance
                  </p>

                  <h3 className="text-xl font-bold text-white">
                    Shift Status
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] ${
                      isOnShift
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isOnShift
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />

                    {isOnShift
                      ? "Currently On-Shift"
                      : "Currently Off-Shift"}
                  </span>

                  <button
                    type="button"
                    onClick={openShiftPopup}
                    disabled={isUpdatingShift}
                    className={`h-6 w-12 rounded-full p-1 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isOnShift
                        ? "bg-emerald-500"
                        : "bg-slate-700"
                    }`}
                    aria-label="Change shift status"
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        isOnShift
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h2 className="mb-2 text-4xl font-black text-white">
                {duration}

                <span className="ml-2 text-sm font-normal text-slate-500">
                  Current Duration
                </span>
              </h2>

              <div className="mb-6 h-2 w-full rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOnShift
                      ? "w-2/3 bg-indigo-500"
                      : "w-0"
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

        {/* ==================================================
            SKILLS AND SHIFT HISTORY
        =================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Skills */}

          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-6">
            <h3 className="mb-4 text-sm font-bold text-white">
              Skill Categories
            </h3>

            {filteredSkills.length > 0 ? (
              filteredSkills.map(
                ({ skill, originalIndex }) => (
                  <div
                    key={`${skill}-${originalIndex}`}
                    className="mb-2 flex justify-between rounded border border-slate-800 bg-[#0a0d14] p-3 text-[11px] text-slate-300"
                  >
                    <span>{skill}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(originalIndex)
                      }
                      className="text-red-500 hover:text-red-300"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                )
              )
            ) : (
              <p className="rounded border border-slate-800 bg-[#0a0d14] p-4 text-center text-[11px] text-slate-500">
                No skills found.
              </p>
            )}

            <form
              onSubmit={addSkill}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={newSkill}
                onChange={(event) =>
                  setNewSkill(event.target.value)
                }
                placeholder="Add new skill..."
                className="flex-1 rounded border border-slate-800 bg-[#0a0d14] p-2 text-[10px] outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="rounded bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                aria-label="Add skill"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>

          {/* Shift History */}

          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-6 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-white">
              Recent Shifts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[10px] text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 uppercase">
                    <th className="pb-3 text-left">
                      Date
                    </th>

                    <th className="pb-3 text-left">
                      Duration
                    </th>

                    <th className="pb-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShiftHistory.length > 0 ? (
                    filteredShiftHistory.map(
                      (row, index) => (
                        <tr
                          key={`${row.date}-${index}`}
                          className="border-b border-slate-800/50"
                        >
                          <td className="py-3">
                            {row.date}
                          </td>

                          <td className="py-3">
                            {row.dur}
                          </td>

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
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-10 text-center text-slate-500"
                      >
                        No shift history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SHIFT CONFIRMATION POPUP
      =================================================== */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#10121b] p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              aria-label="Close shift confirmation"
            >
              <X size={22} />
            </button>

            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                nextStatus === "ON"
                  ? "bg-emerald-500/10"
                  : "bg-rose-500/10"
              }`}
            >
              {nextStatus === "ON" ? (
                <Power
                  size={34}
                  className="text-emerald-400"
                />
              ) : (
                <PowerOff
                  size={34}
                  className="text-rose-400"
                />
              )}
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              Confirm Shift Change
            </h2>

            <p className="mb-6 text-slate-400">
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
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isUpdatingShift}
                className="w-1/2 rounded-lg bg-slate-700 py-3 font-bold text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmShiftChange}
                disabled={isUpdatingShift}
                className={`w-1/2 rounded-lg py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  nextStatus === "ON"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isUpdatingShift
                  ? "Updating..."
                  : `Yes, Turn ${nextStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}