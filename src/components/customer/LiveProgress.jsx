import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

//  local image import (change path according to your folder)
import techImage from "../../assets/profile.png";

export default function LiveProgress() {
  const [timeLeft, setTimeLeft] = useState(22 * 60);

  // Dynamic times (replace with API values if needed)
  const startTime = "10:30 AM";
  const completionTime = "10:52 AM";

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="w-full h-full overflow-hidden text-slate-300 font-mono">
      <main className="w-full h-full flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center gap-10 w-full">

          {/* TIMER */}
          <div>
            <h1
              className="
                text-7xl
                sm:text-8xl
                md:text-8xl
                font-black
                text-[#5ef7c3]
                tracking-wider
                drop-shadow-[0_0_25px_rgba(94,247,195,0.45)]
              "
            >
              {formatTime(timeLeft)}
            </h1>

            <p
              className="
                mt-5
                text-2xl
                sm:text-sm
                md:text-xs
                tracking-[0.3em]
                text-slate-500
                font-bold
                uppercase
              "
            >
              REMAINING UNTIL COMPLETION
            </p>
          </div>

          {/* TECHNICIAN CARD */}
          <div
            className="
              w-full
              text-2xl
              sm:text-sm
              max-w-3xl
              bg-[#0e151d]
              border
              border-slate-800
              rounded-xl
              p-7
              shadow-xl
            "
          >
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">

              {/* LEFT SECTION */}
              <div className="flex items-center gap-5">

                {/* IMAGE */}
                <div className="relative flex-shrink-0">
                  <div
                    className="
                      w-20
                      h-20
                      rounded-md
                      overflow-hidden
                      border
                      border-[#5ef7c3]/60
                    "
                  >
                    <img
                      src={techImage}
                      alt="Technician"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>

                  <div
                    className="
                      absolute
                      -bottom-1
                      -right-1
                      w-6
                      h-6
                      rounded-full
                      bg-[#5ef7c3]
                      border-2
                      border-[#0e151d]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Check className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* TECHNICIAN DETAILS */}
                <div className="text-left">
                  <span
                    className="
                      block
                      text-xs
                      font-black
                      tracking-[0.2em]
                      text-[#5ef7c3]
                      uppercase
                      mb-2
                    "
                  >
                    LEAD TECHNICIAN
                  </span>

                  <h3 className="text-2xl font-bold text-white">
                    Marcus Thorne
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Expertise: Hybrid Brake Systems
                  </p>
                </div>
              </div>

              {/* RIGHT SECTION - TIME DETAILS */}
              <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-5 md:pt-0 md:pl-8 text-center md:text-right">

                <div>
                  <p className="text-[14px] uppercase tracking-[0.25em] text-slate-500">
                    Start Time
                  </p>

                  <h4 className="text-4xl font-bold text-[#5ef7c3] mt-1">
                    {startTime}
                  </h4>
                </div>

                <div className="mt-5">
                  <p className="text-[14px] uppercase tracking-[0.25em] text-slate-500">
                    Completion Time
                  </p>

                  <h4 className="text-4xl font-bold text-white mt-1">
                    {completionTime}
                  </h4>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}