import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Plus,
  CircleDot,
  Gauge,
} from "lucide-react";

export default function ResourceMatrix({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const technicianScrollRef = useRef(null);

  // Database එකෙන් technicians load කරන function එක
  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(
        "http://localhost:5000/api/technicians"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load technicians."
        );
      }

      const receivedTechnicians = Array.isArray(data)
        ? data
        : data.technicians ||
          data.data ||
          data.results ||
          [];

      setTechnicians(receivedTechnicians);
    } catch (error) {
      console.error("Error loading technicians:", error);

      setLoadError(
        error.message || "Unable to load technicians."
      );
    } finally {
      setLoading(false);
    }
  };

  // Page එක open වුණාම database data load කරනවා
  useEffect(() => {
    fetchTechnicians();
  }, []);

  const overrunVehicles = [
    {
      vehicle: "WP-KV-1122",
      technician: "John Doe",
      metric: "+15 Mins Overrun",
      reason: "Engine diagnostics took longer than expected",
      color: "text-red-300",
    },
    {
      vehicle: "SP-HN-4455",
      technician: "David Kim",
      metric: "+08 Mins Overrun",
      reason: "Waiting for spare part confirmation",
      color: "text-orange-400",
    },
  ];

  // Database status එක UI status එකට convert කරනවා
  const normalizeSpecialization = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (!value) {
      return "No specialization";
    }

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
          return parsedValue.join(", ");
        }
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .join(", ");
      }
    }

    return String(value);
  };

  // Database response එක snake_case හෝ camelCase වුණත් support කරනවා
  const formattedTechnicians = technicians.map((tech, index) => {
    const databaseStatus = String(
      tech.availabilityStatus ??
        tech.availability_status ??
        tech.status ??
        "AVAILABLE"
    ).toUpperCase();

    const displayStatus =
      databaseStatus === "AVAILABLE" ||
      databaseStatus === "FREE"
        ? "FREE"
        : "BUSY";

    const rawExperience =
      tech.experience ??
      tech.experienceYears ??
      tech.experience_years;

    const shiftStatus = String(
      tech.shiftStatus ??
        tech.shift_status ??
        "OFF"
    ).toUpperCase();

    return {
      id:
        tech.technicianId ??
        tech.technician_id ??
        tech.id ??
        `TECH-${index + 1}`,

      name:
        tech.fullName ??
        tech.full_name ??
        tech.name ??
        "Unnamed Technician",

      status: displayStatus,
      databaseStatus,

      vehicle:
        tech.activeVehicle ??
        tech.active_vehicle ??
        tech.vehicleNumber ??
        tech.vehicle_number ??
        "— None —",

      specialization: normalizeSpecialization(
        tech.specialization
      ),

      email: tech.email || "No email",

      contactNumber:
        tech.contactNumber ??
        tech.contact_number ??
        "No contact number",

      experience:
        rawExperience !== null &&
        rawExperience !== undefined &&
        rawExperience !== ""
          ? `${rawExperience} Years`
          : "Not provided",

      shiftStatus,

      highlight:
        displayStatus === "BUSY" &&
        Boolean(
          tech.activeVehicle ??
            tech.active_vehicle ??
            tech.vehicleNumber ??
            tech.vehicle_number
        ),
    };
  });

  // Search
  const filteredTechnicians = formattedTechnicians.filter(
    (tech) =>
      `${tech.id} ${tech.name} ${tech.status} ${tech.vehicle} ${tech.specialization} ${tech.email} ${tech.contactNumber}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  // Summary counts
  const freeTechnicianCount = formattedTechnicians.filter(
    (tech) => tech.status === "FREE"
  ).length;

  const busyTechnicianCount = formattedTechnicians.filter(
    (tech) => tech.status === "BUSY"
  ).length;

  const handleTechnicianWheel = (event) => {
    const scrollContainer = technicianScrollRef.current;

    if (!scrollContainer) return;

    event.preventDefault();

    scrollContainer.scrollBy({
      left: event.deltaY,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">
      {/* Top Bar */}
      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search
              size={15}
              className="text-gray-500 shrink-0"
            />

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Search technicians..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500 border-none"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-5">
          <Bell size={18} className="text-gray-300" />

          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-xs font-bold tracking-widest">
              Master Admin
            </p>

            <p className="text-[10px] text-indigo-400 uppercase">
              Owner Level
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl border border-cyan-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
          RESOURCE & LABOR MATRIX
        </h1>

        <p className="text-gray-400 text-sm md:text-base mb-10">
          Real-time personnel optimization, allocation controls,
          and active buffer queues.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 max-w-5xl mb-8">
          <div className="bg-[#181820] border border-white/10 rounded-lg p-6">
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em] mb-5">
              Registered <br /> Technicians
            </p>

            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black">
                {formattedTechnicians.length}
              </h2>
            </div>
          </div>

          <div className="bg-[#181820] border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-start mb-5">
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em]">
                Available Free <br /> Technicians
              </p>

              <CircleDot
                size={13}
                className="text-emerald-400"
              />
            </div>

            <h2 className="text-3xl font-mono font-black text-emerald-400">
              {freeTechnicianCount} Free
            </h2>
          </div>

          <div className="bg-[#181820] border border-white/10 rounded-lg p-6 sm:col-span-2 xl:col-span-1">
            <div className="flex justify-between items-start mb-5">
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em]">
                Confirmed Allocations
              </p>

              <Gauge
                size={14}
                className="text-indigo-300"
              />
            </div>

            <h2 className="text-3xl font-mono font-black text-indigo-300">
              {busyTechnicianCount} Active
            </h2>
          </div>
        </div>

        {/* Technician Cards */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h2 className="text-sm md:text-base text-gray-200">
              Technician Availability & Real-time Workload Mapping
            </h2>

            <button
              type="button"
              onClick={fetchTechnicians}
              disabled={loading}
              className="self-start sm:self-auto text-xs px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 transition"
            >
              {loading ? "LOADING..." : "REFRESH"}
            </button>
          </div>

          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Live breakdown of registered personnel availability
            and active jobs.
          </p>

          {loadError && (
            <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg p-4">
              <p className="text-sm text-red-300">
                {loadError}
              </p>

              <button
                type="button"
                onClick={fetchTechnicians}
                className="mt-3 text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-200 hover:bg-red-500/10 transition"
              >
                TRY AGAIN
              </button>
            </div>
          )}

          <div
            ref={technicianScrollRef}
            onWheel={handleTechnicianWheel}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth overscroll-x-contain cursor-grab active:cursor-grabbing"
          >
            {loading ? (
              <div className="w-full border border-white/10 bg-[#1b1b24] rounded-lg p-8 text-center text-sm text-gray-500">
                Loading technicians from database...
              </div>
            ) : filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className={`min-w-[250px] sm:min-w-[270px] lg:min-w-[290px] bg-[#1b1b24] border rounded-lg p-5 shrink-0 transition duration-300 hover:-translate-y-1 ${
                    tech.highlight
                      ? "border-red-400/30 bg-red-500/5"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-mono font-bold">
                        {tech.name.toUpperCase()}
                      </h3>

                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        {tech.id}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-1 rounded border ${
                        tech.status === "FREE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {tech.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">
                        Specialization
                      </p>

                      <p className="mt-2 text-sm text-gray-300">
                        {tech.specialization}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">
                        Experience
                      </p>

                      <p className="mt-2 text-sm font-mono text-gray-300">
                        {tech.experience}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">
                        Shift Status
                      </p>

                      <p
                        className={`mt-2 text-sm font-mono ${
                          tech.shiftStatus === "ON"
                            ? "text-emerald-400"
                            : "text-gray-400"
                        }`}
                      >
                        {tech.shiftStatus}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">
                        Active Vehicle
                      </p>

                      <p
                        className={`mt-2 text-sm font-mono ${
                          tech.highlight
                            ? "text-red-300"
                            : "text-gray-300"
                        }`}
                      >
                        {tech.vehicle}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full border border-white/10 bg-[#1b1b24] rounded-lg p-8 text-center text-sm text-gray-500">
                {searchText
                  ? "No technicians match your search."
                  : "No technicians are registered yet."}
              </div>
            )}
          </div>

          <p className="mt-2 text-[10px] text-gray-500">
            Use the mouse wheel or swipe to view more technician
            cards.
          </p>
        </section>

        {/* Overrun Table */}
        <section className="mb-20">
          <h2 className="text-sm md:text-base text-gray-200 mb-2">
            Critical Time Overrun & Vehicles in Buffer Queue
          </h2>

          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Vehicles exceeding baseline diagnostic durations.
          </p>

          <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-[950px] md:w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs">
                  <tr>
                    <th className="px-8 py-5">
                      Vehicle ID
                    </th>

                    <th className="px-8 py-5">
                      Assigned Technician
                    </th>

                    <th className="px-8 py-5">
                      Overrun Metric
                    </th>

                    <th className="px-8 py-5">
                      Overrun Reason
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {overrunVehicles.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-white/5 text-sm text-gray-300"
                    >
                      <td className="px-8 py-5 font-mono">
                        {item.vehicle}
                      </td>

                      <td className="px-8 py-5">
                        {item.technician}
                      </td>

                      <td
                        className={`px-8 py-5 font-mono ${item.color}`}
                      >
                        {item.metric}
                      </td>

                      <td className="px-8 py-5 text-gray-400">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-xl bg-indigo-300 text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
        >
          <Plus size={24} />
        </button>
      </main>
    </div>
  );
}