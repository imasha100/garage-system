import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 justify-center mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-4xl transition-transform duration-100 focus:outline-none cursor-pointer select-none ${
            star <= (hover || value)
              ? "text-[#f5a623] scale-[1.1]"
              : "text-[#3a3f5c] scale-100"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ======================================================
// DISPLAY SELECTED RATING
// ======================================================

function RatingDisplay({ rating }) {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${
            star <= numericRating
              ? "text-[#f5a623]"
              : "text-[#3a3f5c]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ======================================================
// SUBMISSION MODAL
// ======================================================

function SubmissionModal({
  onClose,
  feedbackData,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="relative z-10 w-full max-w-[480px] rounded-xl border border-[#00e676]/30 bg-[rgba(5,15,20,0.96)] px-8 py-9 text-center shadow-2xl">
        {/* SUCCESS ICON */}
        <div className="mx-auto mb-5 flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-[#00e676] bg-[#00e676]/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="#00e676"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-[1.65rem] font-bold tracking-[0.12em] text-[#00e5a0]">
          SUBMISSION COMPLETE
        </h2>

        <p className="mb-1 text-[0.7rem] uppercase tracking-[0.13em] text-[#c8d8d0]">
          THANK YOU FOR VISITING OUR GARAGE
        </p>

        <p className="mb-6 text-[0.7rem] uppercase tracking-[0.13em] text-[#c8d8d0]">
          YOUR REVIEW WAS SENT SUCCESSFULLY
        </p>

        {/* ==================================================
            SERVICE SUMMARY
        =================================================== */}

        <div className="mb-6 rounded-lg border border-[#1e3740] bg-[#071117] p-5 text-left">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#627784]">
                Vehicle
              </span>

              <span className="text-right text-sm font-bold text-white">
                {feedbackData?.vehicleNumber ||
                  "N/A"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#627784]">
                Garage
              </span>

              <span className="max-w-[250px] text-right text-sm font-bold text-[#b6c8cf]">
                {feedbackData?.garageName ||
                  "Garage"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#627784]">
                Technician
              </span>

              <span className="text-right text-sm font-bold text-[#00e5a0]">
                {feedbackData?.technicianName ||
                  "Not Assigned"}
              </span>
            </div>

            <div className="border-b border-white/5 pb-3">
              <p className="mb-2 text-center text-[10px] uppercase tracking-[0.16em] text-[#627784]">
                Your Rating
              </p>

              <RatingDisplay
                rating={feedbackData?.rating}
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#627784]">
                Your Feedback
              </p>

              <p className="rounded border border-white/5 bg-black/20 p-3 text-xs leading-5 text-[#aabdc5]">
                "
                {feedbackData?.comment ||
                  "No comment provided."}
                "
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded border-2 border-[#00e676] px-8 py-2.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[#00e676] transition hover:bg-[#00e676]/10"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ServiceFeedback({
  onNavigate,
}) {
  const [rating, setRating] =
    useState(4);

  const [notes, setNotes] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [showThankYou, setShowThankYou] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    submittedFeedback,
    setSubmittedFeedback,
  ] = useState(null);

  const [serviceDetails, setServiceDetails] = useState({
    vehicleNumber: "",
    technicianName: "",
  });

  const [isLoadingServiceDetails, setIsLoadingServiceDetails] =
    useState(true);

  // ======================================================
  // GET COMPLETED JOB DETAILS
  // ======================================================

  const getCompletedJobDetails =
    async () => {
      try {
        // ================================================
        // 1. TRY CACHED COMPLETED JOB
        // ================================================

        const storedJob =
          sessionStorage.getItem(
            "latestCompletedJob"
          );

        if (storedJob) {
          const parsedJob =
            JSON.parse(storedJob);

          const storedJobId =
            Number(
              parsedJob?.jobId
            );

          if (
            Number.isInteger(
              storedJobId
            ) &&
            storedJobId > 0
          ) {
            return parsedJob;
          }
        }

        // ================================================
        // 2. FALLBACK TO LATEST SERVICE REQUEST
        // ================================================

        const storedRequest =
          sessionStorage.getItem(
            "latestServiceRequest"
          );

        if (!storedRequest) {
          return null;
        }

        const request =
          JSON.parse(
            storedRequest
          );

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

        if (
          !contactNumber ||
          !vehicleNumber
        ) {
          return null;
        }

        // ================================================
        // 3. GET ACTUAL JOB FROM BACKEND
        // ================================================

        const response =
          await fetch(
            `${API_BASE_URL}/service-jobs/customer/${encodeURIComponent(
              contactNumber
            )}/${encodeURIComponent(
              vehicleNumber
            )}/live-progress`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false ||
          !result.job
        ) {
          console.error(
            "Unable to load completed job:",
            result
          );

          return null;
        }

        // ================================================
        // 4. CHECK COMPLETED STATUS
        // ================================================

        const jobStatus =
          String(
            result.job.jobStatus ||
              ""
          )
            .trim()
            .toUpperCase();

        if (
          jobStatus !==
          "COMPLETED"
        ) {
          return null;
        }

        // ================================================
        // 5. CACHE JOB
        // ================================================

        sessionStorage.setItem(
          "latestCompletedJob",
          JSON.stringify(
            result.job
          )
        );

        return result.job;
      } catch (error) {
        console.error(
          "Get completed job details error:",
          error
        );

        return null;
      }
    };

  // ======================================================
  // LOAD VEHICLE + TECHNICIAN DETAILS
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadServiceDetails = async () => {
      setIsLoadingServiceDetails(true);

      try {
        const completedJob = await getCompletedJobDetails();

        if (!isMounted) {
          return;
        }

        if (!completedJob) {
          setServiceDetails({
            vehicleNumber: "",
            technicianName: "",
          });
          return;
        }

        setServiceDetails({
          vehicleNumber:
            completedJob?.vehicleNumber ||
            completedJob?.vehicle_number ||
            "N/A",

          technicianName:
            completedJob?.technicianName ||
            completedJob?.technician_name ||
            "Not Assigned",
        });
      } catch (error) {
        console.error(
          "Load feedback service details error:",
          error
        );
      } finally {
        if (isMounted) {
          setIsLoadingServiceDetails(false);
        }
      }
    };

    loadServiceDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // SUBMIT FEEDBACK
  // ======================================================

  const handleSubmit =
    async () => {
      if (rating === 0) {
        setError(
          "Please select a star rating."
        );

        return;
      }

      if (!notes.trim()) {
        setError(
          "Please type your review."
        );

        return;
      }

      // ================================================
      // GET JOB
      // ================================================

      const completedJob =
        await getCompletedJobDetails();

      if (!completedJob) {
        setError(
          "Completed service details could not be identified."
        );

        return;
      }

      const jobId =
        Number(
          completedJob?.jobId
        );

      if (
        !Number.isInteger(
          jobId
        ) ||
        jobId <= 0
      ) {
        setError(
          "Completed service job could not be identified."
        );

        return;
      }

      try {
        setIsSubmitting(true);
        setError("");

        // ================================================
        // POST FEEDBACK
        // ================================================

        const response =
          await fetch(
            `${API_BASE_URL}/feedback`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                jobId,
                rating,
                comment:
                  notes.trim(),
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to submit feedback."
          );
        }

        // ================================================
        // CREATE SUCCESS MODAL DATA
        // ================================================

        const feedbackSummary = {
          feedbackId:
            result.feedback
              ?.feedbackId,

          jobId,

          rating,

          comment:
            notes.trim(),

          vehicleNumber:
            result.feedback
              ?.vehicleNumber ||
            completedJob
              ?.vehicleNumber ||
            "N/A",

          garageName:
            result.feedback
              ?.garageName ||
            completedJob
              ?.garageName ||
            "Garage",

          technicianName:
            result.feedback
              ?.technicianName ||
            completedJob
              ?.technicianName ||
            "Not Assigned",
        };

        // ================================================
        // SAVE LATEST FEEDBACK
        // ================================================

        sessionStorage.setItem(
          "latestSubmittedFeedback",
          JSON.stringify(
            feedbackSummary
          )
        );

        setSubmittedFeedback(
          feedbackSummary
        );

        setSubmitted(true);

        setError("");
      } catch (error) {
        console.error(
          "Submit feedback error:",
          error
        );

        setError(
          error.message ||
            "Unable to submit feedback."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const handleClose = () => {
    setSubmitted(false);
    setSubmittedFeedback(null);
    setRating(4);
    setNotes("");
    setError("");

    // Do not logout immediately.
    // Show a final thank-you screen first.
    setShowThankYou(true);
  };

  // ======================================================
  // FINISH CUSTOMER SERVICE JOURNEY
  // ======================================================

  const handleFinish = () => {
    sessionStorage.removeItem(
      "latestServiceRequest"
    );

    sessionStorage.removeItem(
      "selectedGarage"
    );

    sessionStorage.removeItem(
      "customerUser"
    );

    sessionStorage.removeItem(
      "customerId"
    );

    sessionStorage.removeItem(
      "customerResumeTab"
    );

    sessionStorage.removeItem(
      "customerFlowStage"
    );

    sessionStorage.removeItem(
      "latestTowDispatch"
    );

    sessionStorage.removeItem(
      "latestCompletedJob"
    );

    sessionStorage.removeItem(
      "latestSubmittedFeedback"
    );

    sessionStorage.removeItem(
      "serviceRequestId"
    );

    localStorage.removeItem(
      "currentCustomerRequest"
    );

    setShowThankYou(false);

    if (
      typeof onNavigate === "function"
    ) {
      onNavigate("start");
      return;
    }

    window.location.href = "/";
  };

  // ======================================================
  // FINAL THANK-YOU SCREEN
  // ======================================================

  if (showThankYou) {
    return (
      <div className="min-h-full w-full flex items-center justify-center bg-[#0a0c14] px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-[#0b1118] p-8 md:p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-400/10">
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
            Service Journey Complete
          </p>

          <h1 className="mt-3 text-3xl md:text-4xl font-black text-white">
            Thank You For Your Feedback!
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm md:text-base leading-7 text-slate-400">
            Your feedback has been submitted successfully.
            Thank you for choosing our garage service.
            Your experience helps us provide better service
            in the future.
          </p>

          <div className="mt-7 rounded-xl border border-slate-800 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Feedback Status
            </p>

            <p className="mt-2 font-bold text-emerald-400">
              ✓ Successfully Recorded
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="mt-8 w-full rounded-xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-emerald-500"
          >
            Finish & Return Home
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="w-full min-h-full flex flex-col items-center py-10 px-4 bg-[#0a0c14]">
      <h1 className="text-center font-bold tracking-[0.18em] uppercase mb-8 text-[#e8ecf0] text-[1.55rem] leading-[1.5]">
        CUSTOMER SATISFACTION AUDIT & SERVICE
        <br />
        FEEDBACK
      </h1>

      <div className="w-full max-w-[520px] bg-[#111827] border-[1.5px] border-[#2a3560] rounded-[6px] p-[32px_36px_28px]">
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#263451] bg-[#0d1117] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#5a6a8a]">
              Vehicle
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {isLoadingServiceDetails
                ? "Loading..."
                : serviceDetails.vehicleNumber || "N/A"}
            </p>
          </div>

          <div className="rounded-md border border-[#263451] bg-[#0d1117] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#5a6a8a]">
              Service Technician
            </p>

            <p className="mt-1 text-sm font-bold text-[#00e5a0]">
              {isLoadingServiceDetails
                ? "Loading..."
                : serviceDetails.technicianName || "Not Assigned"}
            </p>
          </div>
        </div>

        <p className="text-center tracking-[0.15em] uppercase mb-1 text-[0.9rem] text-[#7a8aaa]">
          WRENCH-TIME SPEED & DIAGNOSTICS ACCURACY RATING
        </p>

        <StarRating
          value={rating}
          onChange={(value) => {
            setRating(value);
            setError("");
          }}
        />

        <div className="h-6" />

        <p className="tracking-[0.14em] uppercase mb-2 text-[0.9rem] text-[#5a6a8a]">
          SERVICE LOGS & FIELD NOTES
        </p>

        <textarea
          value={notes}
          onChange={(event) => {
            setNotes(
              event.target.value
            );

            setError("");
          }}
          rows={5}
          maxLength={400}
          placeholder="Type your service experience..."
          className="w-full resize-none focus:outline-none bg-[#0d1117] text-[#8a9ab8] text-[0.73rem] p-[10px_12px] rounded-[3px] leading-[1.7] border border-[#1e2a40]"
        />

        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#5a6a8a]">
            {notes.length}/400
          </span>
        </div>

        {error && (
          <p className="text-xs mt-2 text-[#f87171] tracking-[0.05em]">
            {error}
          </p>
        )}

        <div className="h-6" />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting
            }
            className="font-bold tracking-[0.18em] uppercase bg-[#3b5bdb] text-white px-11 py-3 text-[0.95rem] rounded cursor-pointer hover:bg-[#4a6af0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "SUBMITTING..."
              : "SUBMIT"}
          </button>
        </div>
      </div>

      {submitted && (
        <SubmissionModal
          onClose={
            handleClose
          }
          feedbackData={
            submittedFeedback
          }
        />
      )}
    </div>
  );
}