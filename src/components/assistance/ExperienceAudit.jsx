import React, { useState } from "react";
import { List, Star, Eye, X } from "lucide-react";

const ExperienceAudit = () => {
  const [selectedReview, setSelectedReview] = useState(null);

  const feedData = [
    {
      name: "Sunil D.",
      rating: 5,
      comment: "Smooth process, happy with the support.",
      time: "02:11",
      flag: false,
    },
    {
      name: "Roy K.",
      rating: 1,
      comment: "Delayed repair, tech didn't update on time.",
      time: "14:09",
      flag: true,
      flagMsg: "SYSTEM FLAG: SERVICE SLA BREACH DETECTED",
    },
    {
      name: "Sarah J.",
      rating: 4,
      comment:
        "The technician was very professional but the parts took a while to arrive.",
      time: "05:52",
      flag: false,
    },
    {
      name: "Elena W.",
      rating: 5,
      comment: "Excellent communication throughout. Very satisfied.",
      time: "12:08",
      flag: false,
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-[#050608] text-[#e4e9e7] font-sans p-6 md:p-8">
      <main className="max-w-5xl mx-auto pb-10">
        <section>
          {/* HEADER */}
          <h2 className="flex items-center gap-3 text-2xl md:text-2xl uppercase tracking-widest mb-10 text-[#52f0ac]">
            Real-time Customer Satisfaction Feed
          </h2>

          <div className="flex flex-col gap-6">
            {feedData.map((data, i) => {
              const isSecondReview = i === 1;
              const showFlag = data.flag && !isSecondReview;

              return (
                <div
                  key={i}
                  className={`p-6 border rounded-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer shadow-lg ${
                    showFlag
                      ? "bg-[#1f1515] border-[#4a2525]"
                      : "bg-[#0b0e14] border-[#1a1f26]"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        {/* 👇 MOBILE BIGGER TEXT */}
                        <p className="font-bold text-xl md:text-lg">
                          {data.name}
                        </p>
                      </div>

                      <span className="text-sm md:text-xs text-[#6e7681] bg-[#050608] px-3 py-1 rounded">
                        {data.time}
                      </span>
                    </div>

                    {/* STARS */}
                    <div className="flex gap-1">
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

                    {/* COMMENT */}
                    <p className="text-lg md:text-base leading-relaxed text-white">
                      {data.comment}
                    </p>

                    {showFlag && (
                      <p className="text-lg md:text-sm mt-3 font-bold text-[#ff6666] bg-[#2a1010] p-2 rounded inline-block">
                        {data.flagMsg}
                      </p>
                    )}

                    <div className="flex justify-end border-t border-[#1a1f26] pt-4">
                      <button
                        onClick={() => setSelectedReview(data)}
                        className="flex items-center gap-2 text-base md:text-xs text-[#6e7681] hover:text-[#52f0ac] uppercase font-bold"
                      >
                        <Eye size={16} />
                        View Audit Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* MODAL (unchanged) */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#10233d] to-[#08121f] border border-cyan-400 rounded-2xl w-full max-w-xl shadow-2xl">

            <div className="flex justify-between items-center border-b border-cyan-800 p-5">
              <h2 className="text-3xl font-bold text-cyan-300">
                Customer Review
              </h2>

              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-red-400"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <h3 className="text-2xl font-bold text-white">
                  {selectedReview.name}
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Submitted at {selectedReview.time}
                </p>
              </div>

              <div className="flex gap-1 mb-5">
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
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceAudit;