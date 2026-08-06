import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Check,
  Clock3,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
  Star,
  Wrench,
} from "lucide-react";

import techImage from "../../assets/profile.png";

const API_BASE = "http://localhost:5000";

export default function LiveProgress({ setActiveTab }) {
  // ======================================================
  // STATES
  // ======================================================

  const [job, setJob] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [showCompletedPopup, setShowCompletedPopup] =
    useState(false);

  // ======================================================
  // GET CUSTOMER REQUEST FROM SESSION STORAGE
  // ======================================================

  const getCustomerDetails = useCallback(() => {
    try {
      const stored =
        sessionStorage.getItem("latestServiceRequest");

      if (!stored) {
        return {
          contactNumber: "",
          vehicleNumber: "",
        };
      }

      const request = JSON.parse(stored);

      const contactNumber =
        request.contactNumber ??
        request.contact_number ??
        request.customerContact ??
        request.customer_contact ??
        "";

      const vehicleNumber =
        request.vehicleNumber ??
        request.vehicle_number ??
        request.vehicleNum ??
        request.vehicle_num ??
        "";

      return {
        contactNumber: String(contactNumber || "").trim(),
        vehicleNumber: String(vehicleNumber || "").trim(),
      };
    } catch (error) {
      console.error(
        "Unable to read latestServiceRequest:",
        error
      );

      return {
        contactNumber: "",
        vehicleNumber: "",
      };
    }
  }, []);

  // ======================================================
  // FORMAT COUNTDOWN
  // ======================================================

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const mins = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const secs = safeSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )} : ${String(mins).padStart(
        2,
        "0"
      )} : ${String(secs).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(mins).padStart(
      2,
      "0"
    )} : ${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ======================================================
  // FORMAT CLOCK TIME
  // ======================================================

  const formatClockTime = (value) => {
    if (!value) {
      return "--:--";
    }

    // ----------------------------------------------
    // MySQL TIME
    // Example: 10:30:00
    // ----------------------------------------------

    if (
      typeof value === "string" &&
      /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)
    ) {
      const parts = value.split(":");

      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      const date = new Date();

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // ----------------------------------------------
    // DATETIME
    // ----------------------------------------------

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // CALCULATE TIME LEFT
  // ======================================================

  const calculateTimeLeft = (currentJob) => {
    if (
      !currentJob ||
      !currentJob.estimatedCompletionTime
    ) {
      return 0;
    }

    const completionDate = new Date(
      currentJob.estimatedCompletionTime
    );

    if (
      Number.isNaN(
        completionDate.getTime()
      )
    ) {
      return 0;
    }

    const difference =
      completionDate.getTime() -
      Date.now();

    return Math.max(
      0,
      Math.floor(difference / 1000)
    );
  };

  // ======================================================
  // LOAD LIVE PROGRESS FROM BACKEND
  // ======================================================

  const loadLiveProgress = useCallback(
    async (initialLoad = false) => {
      try {
        if (initialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setLoadError("");

        const {
          contactNumber,
          vehicleNumber,
        } = getCustomerDetails();

        if (
          !contactNumber ||
          !vehicleNumber
        ) {
          throw new Error(
            "Customer contact number or vehicle number was not found."
          );
        }

        // ----------------------------------------------
        // API CALL
        // ----------------------------------------------

        const response = await fetch(
          `${API_BASE}/api/service-jobs/customer/${encodeURIComponent(
            contactNumber
          )}/${encodeURIComponent(
            vehicleNumber
          )}/live-progress`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load live progress."
          );
        }

        if (!result.job) {
          throw new Error(
            "No active service job was found."
          );
        }

        const receivedJob =
          result.job;

        setJob(receivedJob);

        const status = String(
          receivedJob.jobStatus || ""
        )
          .trim()
          .toUpperCase();

        // ----------------------------------------------
        // IN PROGRESS
        // ----------------------------------------------

        if (status === "IN_PROGRESS") {
          setTimeLeft(
            calculateTimeLeft(
              receivedJob
            )
          );
        }

        // ----------------------------------------------
        // COMPLETED
        // ----------------------------------------------

        if (status === "COMPLETED") {
          setTimeLeft(0);

          sessionStorage.setItem(
  "latestCompletedJob",
  JSON.stringify({
    customerId: receivedJob.customerId,
    jobId: receivedJob.jobId,
    garageId: receivedJob.garageId,
    requestId: receivedJob.requestId,
    vehicleNumber: receivedJob.vehicleNumber,
    technicianName: receivedJob.technicianName,
  })
);

          const popupKey =
            `completed_popup_${receivedJob.jobId}`;

          const popupAlreadyShown =
            sessionStorage.getItem(
              popupKey
            );

          if (!popupAlreadyShown) {
            setShowCompletedPopup(true);

            sessionStorage.setItem(
              popupKey,
              "true"
            );
          }
        }
      } catch (error) {
        console.error(
          "Live progress error:",
          error
        );

        setLoadError(
          error.message ||
            "Unable to load live progress."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getCustomerDetails]
  );

  // ======================================================
  // INITIAL LOAD + AUTO REFRESH
  // ======================================================

  useEffect(() => {
    loadLiveProgress(true);

    const interval = setInterval(() => {
      loadLiveProgress(false);
    }, 5000);

    return () =>
      clearInterval(interval);
  }, [loadLiveProgress]);

  // ======================================================
  // LIVE COUNTDOWN
  // ======================================================

  useEffect(() => {
    if (!job) {
      return;
    }

    const status = String(
      job.jobStatus || ""
    )
      .trim()
      .toUpperCase();

    if (
      status !== "IN_PROGRESS" ||
      !job.estimatedCompletionTime
    ) {
      return;
    }

    const updateTimer = () => {
      setTimeLeft(
        calculateTimeLeft(job)
      );
    };

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000
      );

    return () =>
      clearInterval(interval);
  }, [
    job?.jobId,
    job?.jobStatus,
    job?.estimatedCompletionTime,
  ]);

  // ======================================================
  // JOB STATUS
  // ======================================================

  const status = String(
    job?.jobStatus || ""
  )
    .trim()
    .toUpperCase();

  const isAssigned =
    status === "ASSIGNED";

  const isInProgress =
    status === "IN_PROGRESS";

  const isCompleted =
    status === "COMPLETED";

  // ======================================================
  // DISPLAY VALUES
  // ======================================================

  const technicianName =
    job?.technicianName ||
    "Not Assigned";

  const specialization =
    job?.technicianSpecialization ||
    "Not specified";

  const vehicleNumber =
    job?.vehicleNumber || "";

  const startTime =
    formatClockTime(
      job?.startTime
    );

  const completionTime =
    isCompleted
      ? formatClockTime(
          job?.actualCompletionTime
        )
      : formatClockTime(
          job?.estimatedCompletionTime
        );

  // ======================================================
  // FEEDBACK BUTTON
  // ======================================================

  const handleLeaveFeedback = () => {
  setShowCompletedPopup(false);

  if (typeof setActiveTab === "function") {
    setActiveTab("audit");
  }
};
  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative w-full h-full overflow-hidden max-md:overflow-y-auto text-slate-300 font-mono">
      <main className="w-full h-full max-md:min-h-screen flex items-center justify-center px-6 max-md:px-4 max-md:py-8">
        <div className="flex flex-col items-center text-center gap-10 max-md:gap-8 w-full">

          {/* ==================================================
              LOADING
          =================================================== */}

          {loading && (
            <div className="flex flex-col items-center gap-4">
              <RefreshCw
                size={40}
                className="text-[#5ef7c3] animate-spin"
              />

              <p className="text-xs text-slate-500 tracking-[0.25em] uppercase">
                Loading Live Progress
              </p>
            </div>
          )}

          {/* ==================================================
              ERROR
          =================================================== */}

          {!loading &&
            loadError && (
              <div className="w-full max-w-xl bg-[#0e151d] border border-red-500/30 rounded-xl p-7">
                <AlertCircle
                  size={40}
                  className="mx-auto text-red-400 mb-4"
                />

                <h2 className="text-xl font-bold text-white">
                  Live Progress Unavailable
                </h2>

                <p className="mt-3 text-sm text-red-300">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadLiveProgress(
                      true
                    )
                  }
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  <RefreshCw
                    size={15}
                  />

                  TRY AGAIN
                </button>
              </div>
            )}

          {/* ==================================================
              JOB FOUND
          =================================================== */}

          {!loading &&
            !loadError &&
            job && (
              <>
                {/* ==========================================
                    IN PROGRESS TIMER
                =========================================== */}

                {isInProgress && (
                  <div>
                    <h1 className="text-7xl sm:text-8xl md:text-8xl max-md:text-5xl font-black text-[#5ef7c3] tracking-wider drop-shadow-[0_0_25px_rgba(94,247,195,0.45)]">
                      {formatTime(
                        timeLeft
                      )}
                    </h1>

                    <p className="mt-5 text-sm md:text-xs max-md:text-[10px] max-md:tracking-[0.2em] tracking-[0.3em] text-slate-500 font-bold uppercase">
                      {timeLeft > 0
                        ? "REMAINING UNTIL COMPLETION"
                        : "ESTIMATED COMPLETION TIME REACHED"}
                    </p>
                  </div>
                )}

                {/* ==========================================
                    ASSIGNED
                =========================================== */}

                {isAssigned && (
                  <div>
                    <Wrench
                      size={65}
                      className="mx-auto text-indigo-400"
                    />

                    <h1 className="mt-5 text-4xl max-md:text-3xl font-black text-white">
                      VEHICLE ASSIGNED
                    </h1>

                    <p className="mt-4 text-xs text-slate-500 tracking-[0.25em] uppercase">
                      Waiting for technician to start repair
                    </p>
                  </div>
                )}

                {/* ==========================================
                    COMPLETED
                =========================================== */}

                {isCompleted && (
                  <div>
                    <CheckCircle2
                      size={75}
                      className="mx-auto text-[#5ef7c3]"
                    />

                    <h1 className="mt-5 text-4xl max-md:text-3xl font-black text-[#5ef7c3]">
                      SERVICE COMPLETED
                    </h1>

                    <p className="mt-4 text-xs text-slate-500 tracking-[0.25em] uppercase">
                      Your vehicle repair has been completed
                    </p>
                  </div>
                )}

                {/* ==========================================
                    OTHER STATUS
                =========================================== */}

                {!isAssigned &&
                  !isInProgress &&
                  !isCompleted && (
                    <div>
                      <Clock3
                        size={65}
                        className="mx-auto text-slate-500"
                      />

                      <h1 className="mt-5 text-3xl font-black text-white">
                        {status ||
                          "WAITING"}
                      </h1>
                    </div>
                  )}

                {/* ==========================================
                    TIME EXTENSION
                =========================================== */}

                {isInProgress &&
                  job?.timeExtended && (
                    <div className="w-full max-w-3xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-left">
                      <p className="text-xs font-black tracking-[0.2em] text-amber-400 uppercase">
                        Repair Time Extended
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        +
                        {
                          job.totalExtensionMinutes
                        }{" "}
                        minutes have been
                        added to the
                        repair time.
                      </p>

                      {job.latestExtensionReason && (
                        <p className="mt-2 text-xs text-slate-500">
                          Reason:{" "}
                          {
                            job.latestExtensionReason
                          }
                        </p>
                      )}
                    </div>
                  )}

                {/* ==========================================
                    TECHNICIAN CARD
                =========================================== */}

                <div className="w-full text-2xl sm:text-sm max-w-3xl bg-[#0e151d] border border-slate-800 rounded-xl p-7 max-md:p-4 shadow-xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* TECHNICIAN */}

                    <div className="flex items-center gap-5 max-md:flex-col max-md:text-center">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-md overflow-hidden border border-[#5ef7c3]/60">
                          <img
                            src={
                              techImage
                            }
                            alt="Technician"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#5ef7c3] border-2 border-[#0e151d] flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      </div>

                      <div className="text-left max-md:text-center">
                        <span className="block text-xs max-md:text-[10px] font-black tracking-[0.2em] text-[#5ef7c3] uppercase mb-2">
                          LEAD TECHNICIAN
                        </span>

                        <h3 className="text-2xl max-md:text-xl font-bold text-white">
                          {
                            technicianName
                          }
                        </h3>

                        <p className="text-sm max-md:text-xs text-slate-400 mt-1">
                          Expertise:{" "}
                          {
                            specialization
                          }
                        </p>

                        {vehicleNumber && (
                          <p className="mt-2 text-xs text-indigo-300">
                            Vehicle:{" "}
                            {
                              vehicleNumber
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* TIME */}

                    <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-5 md:pt-0 md:pl-8 text-center md:text-right max-md:w-full">
                      <div>
                        <p className="text-[14px] max-md:text-[10px] uppercase tracking-[0.25em] text-slate-500">
                          Start Time
                        </p>

                        <h4 className="text-4xl max-md:text-2xl font-bold text-[#5ef7c3] mt-1">
                          {
                            startTime
                          }
                        </h4>
                      </div>

                      <div className="mt-5">
                        <p className="text-[14px] max-md:text-[10px] uppercase tracking-[0.25em] text-slate-500">
                          {isCompleted
                            ? "Completed Time"
                            : "Completion Time"}
                        </p>

                        <h4 className="text-4xl max-md:text-2xl font-bold text-white mt-1">
                          {
                            completionTime
                          }
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* LIVE INDICATOR */}

                  {isInProgress && (
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#5ef7c3] animate-pulse" />

                        <p className="text-[10px] text-[#5ef7c3] font-bold tracking-[0.2em] uppercase">
                          Live Tracking
                        </p>
                      </div>

                      {refreshing && (
                        <RefreshCw
                          size={13}
                          className="text-slate-500 animate-spin"
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      </main>

      {/* ==================================================
          SERVICE COMPLETED POPUP
      =================================================== */}

      {showCompletedPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#0e151d] border border-[#5ef7c3]/30 rounded-2xl p-8 text-center shadow-2xl">

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setShowCompletedPopup(
                  false
                )
              }
              className="absolute right-4 top-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* ICON */}

            <div className="mx-auto w-16 h-16 rounded-full bg-[#5ef7c3]/10 flex items-center justify-center">
              <CheckCircle2
                size={38}
                className="text-[#5ef7c3]"
              />
            </div>

            <p className="mt-5 text-[10px] text-[#5ef7c3] font-bold tracking-[0.3em] uppercase">
              Service Update
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Service Completed
            </h2>

            <p className="mt-4 text-sm text-slate-400 leading-6">
              Your vehicle{" "}
              <span className="text-white font-bold">
                {
                  vehicleNumber
                }
              </span>{" "}
              has been repaired
              successfully.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Please share your
              experience with the
              garage.
            </p>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowCompletedPopup(
                    false
                  )
                }
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                CLOSE
              </button>

              <button
                type="button"
                onClick={
                  handleLeaveFeedback
                }
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#5ef7c3] py-3 text-xs font-black text-black hover:bg-[#4be3b2]"
              >
                <Star
                  size={15}
                />

                LEAVE FEEDBACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}