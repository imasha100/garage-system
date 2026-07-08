import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Star,
  RotateCcw,
  MessageSquare,
  Filter,
  Cloud,
} from "lucide-react";

export default function ServiceQuality({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");

  const reviews = [
    {
      vehicle: "WP-CAS-1234",
      tech: "Marco Rossi",
      rating: "5.0 ★",
      feedback: "Excellent diagnostic accuracy, hybrid system feels brand new.",
    },
    {
      vehicle: "CP-CB-8890",
      tech: "Alan Stark",
      rating: "4.5 ★",
      feedback:
        "Quick turn-around time, minor smudge left on interior steering.",
    },
  ];

  const complaints = [
    "Turnaround Time",
    "Interior Cleaning",
    "Oil Leakage",
    "HVAC Noise",
    "Brake Squeal",
    "Service Price",
    "Navigation Lag",
  ];

  const filteredReviews = reviews.filter((item) =>
    `${item.vehicle} ${item.tech} ${item.rating} ${item.feedback}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">
      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search size={15} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Global search..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />
            {searchText && (
              <button
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
            <p className="text-xs font-bold tracking-widest">Master Admin</p>
            <p className="text-[10px] text-indigo-400 uppercase">
              Owner Level
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl border border-indigo-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4">
          SERVICE QUALITY & CUSTOMER SATISFACTION
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-3xl mb-8">
          Monitor post-service vehicle reliability, comeback rates, and live
          customer feedback metrics across the workshop network.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Net Satisfaction Score (CSAT)
              </p>
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold mb-5">4.7 / 5.0</h2>
            <p className="text-[11px] text-emerald-400 font-bold">
              ↗ +0.2% improvement
            </p>
          </div>

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Vehicle Comeback Rate (14-Day)
              </p>
              <RotateCcw size={17} className="text-red-300" />
            </div>
            <h2 className="text-2xl font-bold mb-5">2.4%</h2>
            <p className="text-[11px] text-gray-400">
              Vehicles returning for repetitive breakdown symptoms - Target &lt;
              3%
            </p>
          </div>

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Total Reviews Logged
              </p>
              <MessageSquare size={17} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-5">
              142 Submissions
            </h2>
            <div className="w-full h-1 bg-gray-700 rounded">
              <div className="h-1 w-[75%] bg-cyan-400 rounded" />
            </div>
          </div>
        </div>

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold">
              Post-Service Experience Matrix
            </h2>
            <button className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-gray-300">
              <Filter size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-[750px] md:w-full text-left">
              <thead className="bg-white/5 text-gray-500 text-[10px] tracking-[0.25em] uppercase">
                <tr>
                  <th className="px-8 py-5">Vehicle Number</th>
                  <th className="px-4 py-5">Assigned Tech</th>
                  <th className="px-4 py-5">Rating</th>
                  <th className="px-4 py-5">Customer Feedback</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-white/10 hover:bg-white/[0.03]"
                  >
                    <td className="px-8 py-6 font-mono text-indigo-300 text-sm">
                      {item.vehicle}
                    </td>
                    <td className="px-4 py-6 text-sm text-gray-300">
                      {item.tech}
                    </td>
                    <td className="px-4 py-6 text-sm font-mono text-yellow-400">
                      {item.rating}
                    </td>
                    <td className="px-4 py-6 text-sm text-gray-300 max-w-md">
                      "{item.feedback}"
                    </td>
                  </tr>
                ))}

                {filteredReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center text-gray-500 text-xs tracking-widest"
                    >
                      NO SERVICE QUALITY DATA FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-[#191923] border border-white/10 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-gray-500 uppercase">
                Common Customer Complaints
              </h2>
              <Cloud size={18} className="text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-3 justify-center items-center">
              {complaints.map((item, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded border text-sm font-bold ${
                    index === 0
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-lg"
                      : index === 1
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xl"
                      : index === 4
                      ? "bg-red-500/20 text-red-300 border-red-400/30 text-lg"
                      : index === 5
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-white/10 text-gray-300 border-white/10"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}