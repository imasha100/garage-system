
import React, { useEffect, useState } from "react";
import {
  Star,
  Eye,
  X,
  Search,
  Bell,
  Menu,
  User,
} from "lucide-react";

const ExperienceAudit = ({ openSidebar }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultReviews = [
    {
      id: 1,
      name: "Sunil D.",
      rating: 5,
      comment: "Smooth process, happy with the support.",
      time: "02:11",
      flag: false,
    },
    {
      id: 2,
      name: "Roy K.",
      rating: 1,
      comment: "Delayed repair, tech didn't update on time.",
      time: "14:09",
      flag: true,
      flagMsg: "SYSTEM FLAG: SERVICE SLA BREACH DETECTED",
    },
    {
      id: 3,
      name: "Sarah J.",
      rating: 4,
      comment:
        "The technician was very professional but the parts took a while to arrive.",
      time: "05:52",
      flag: false,
    },
  ];

  const loadReviews = () => {
    const savedReviews =
      JSON.parse(localStorage.getItem("customerFeedbackReviews")) || [];

    setFeedData([...savedReviews, ...defaultReviews]);
  };

  useEffect(() => {
    loadReviews();

    window.addEventListener("feedbackUpdated", loadReviews);
    window.addEventListener("storage", loadReviews);

    return () => {
      window.removeEventListener("feedbackUpdated", loadReviews);
      window.removeEventListener("storage", loadReviews);
    };
  }, []);

  const filteredFeedData = feedData.filter((review) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      review.name?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.flagMsg?.toLowerCase().includes(query) ||
      String(review.rating).includes(query) ||
      review.time?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full min-h-0 w-full bg-[#050608] text-[#e4e9e7] font-sans overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-black border-b border-blue-900/40">
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={openSidebar}
            className="md:hidden text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              type="text"
              placeholder="Search customer or review..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-slate-800 py-2 pl-10 pr-10 rounded-md text-xs text-white focus:outline-none focus:border-blue-500"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-4">
          <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            ONLINE
          </span>

          <button
            type="button"
            className="text-slate-300 hover:text-white cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
            <User size={14} />
          </div>
        </div>
      </header>

      {/* EXPERIENCE AUDIT CONTENT */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto bg-[#050608] text-[#e4e9e7] font-sans p-6 md:p-8">
        <main className="max-w-5xl mx-auto pb-10">
          <h2 className="flex items-center gap-3 text-2xl uppercase tracking-widest mb-10 text-[#52f0ac]">
            Real-time Customer Satisfaction Feed
          </h2>

          {filteredFeedData.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredFeedData.map((data) => (
                <div
                  key={data.id}
                  className={`p-6 border rounded-lg transition-all duration-300 hover:scale-[1.01] shadow-lg ${
                    data.flag
                      ? "bg-[#1f1515] border-[#4a2525]"
                      : "bg-[#0b0e14] border-[#1a1f26]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xl">{data.name}</p>

                    <span className="text-sm text-[#6e7681] bg-[#050608] px-3 py-1 rounded">
                      {data.time}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, star) => (
                      <Star
                        key={star}
                        size={18}
                        className={
                          star < data.rating
                            ? "fill-[#52f0ac] text-[#52f0ac]"
                            : "text-[#1a1f26]"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-lg leading-relaxed text-white mt-4">
                    {data.comment}
                  </p>

                  {data.flag && (
                    <p className="text-sm mt-4 font-bold text-[#ff6666] bg-[#2a1010] p-2 rounded inline-block">
                      {data.flagMsg}
                    </p>
                  )}

                  <div className="flex justify-end border-t border-[#1a1f26] pt-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedReview(data)}
                      className="flex items-center gap-2 text-xs text-[#6e7681] hover:text-[#52f0ac] uppercase font-bold cursor-pointer"
                    >
                      <Eye size={16} />
                      View Audit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0b0e14] border border-[#1a1f26] rounded-xl p-10 text-center">
              <Search size={40} className="mx-auto text-[#52f0ac] mb-4" />

              <h3 className="text-white text-xl font-bold">
                No Reviews Found
              </h3>

              <p className="text-[#6e7681] mt-2">
                No customer review matches “{searchQuery}”.
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 px-5 py-2 rounded-lg bg-[#52f0ac] hover:bg-[#45d99c] text-black font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </main>

        {selectedReview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#10233d] to-[#08121f] border border-cyan-400 rounded-2xl w-full max-w-xl shadow-2xl">
              <div className="flex justify-between items-center border-b border-cyan-800 p-5">
                <h2 className="text-3xl font-bold text-cyan-300">
                  Customer Review
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-red-400 cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white">
                  {selectedReview.name}
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Submitted at {selectedReview.time}
                </p>

                <div className="flex gap-1 my-5">
                  {[...Array(5)].map((_, star) => (
                    <Star
                      key={star}
                      size={20}
                      className={
                        star < selectedReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>

                <div className="bg-[#0a1626] border border-cyan-900 rounded-xl p-5">
                  <p className="text-white leading-8">
                    {selectedReview.comment}
                  </p>
                </div>

                {selectedReview.flag && (
                  <div className="mt-5 bg-red-950 border border-red-600 text-red-300 rounded-lg p-4">
                    {selectedReview.flagMsg}
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => setSelectedReview(null)}
                    className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceAudit;

