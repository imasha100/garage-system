import { useState } from "react";

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

function SubmissionModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative z-10 flex flex-col items-center text-center px-10 py-12 rounded-lg bg-[rgba(5,15,20,0.9)] border border-[#00e676]/30 max-w-[420px] w-[90%]">
        <div className="flex items-center justify-center rounded-full mb-6 w-[52px] h-[52px] border-2 border-[#00e676] bg-[#00e676]/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#00e676"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="font-bold tracking-[0.12em] mb-4 text-[1.75rem] text-[#00e5a0]">
          SUBMISSION COMPLETE
        </h2>

        <p className="text-[0.7rem] text-[#c8d8d0] tracking-[0.13em] mb-1 uppercase">
          THANK YOU FOR VISITING OUR GARAGE
        </p>

        <p className="text-[0.7rem] text-[#c8d8d0] tracking-[0.13em] mb-8 uppercase">
          YOUR REVIEW WAS SENT TO ASSISTANCE AUDIT
        </p>

        <button
          onClick={onClose}
          className="font-bold tracking-[0.12em] uppercase text-[0.75rem] px-7 py-2.5 border-2 border-[#00e676] text-[#00e676] rounded hover:bg-[#00e676]/10"
        >
          RETURN TO DASHBOARD
        </button>
      </div>
    </div>
  );
}

export default function ServiceFeedback() {
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!notes.trim()) {
      setError("Please type your review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: "Customer",
      rating,
      comment: notes,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      flag: rating <= 2,
      flagMsg:
        rating <= 2
          ? "SYSTEM FLAG: LOW CUSTOMER SATISFACTION DETECTED"
          : "",
    };

    const oldReviews =
      JSON.parse(localStorage.getItem("customerFeedbackReviews")) || [];

    localStorage.setItem(
      "customerFeedbackReviews",
      JSON.stringify([newReview, ...oldReviews])
    );

    window.dispatchEvent(new Event("feedbackUpdated"));

    setSubmitted(true);
    setError("");
  };

  const handleReset = () => {
    setSubmitted(false);
    setRating(4);
    setNotes("");
    setError("");
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center py-10 px-4 bg-[#0a0c14]">
      <h1 className="text-center font-bold tracking-[0.18em] uppercase mb-8 text-[#e8ecf0] text-[1.55rem] leading-[1.5]">
        CUSTOMER SATISFACTION AUDIT & SERVICE
        <br />
        FEEDBACK
      </h1>

      <div className="w-full max-w-[520px] bg-[#111827] border-[1.5px] border-[#2a3560] rounded-[6px] p-[32px_36px_28px]">
        <p className="text-center tracking-[0.15em] uppercase mb-1 text-[0.9rem] text-[#7a8aaa]">
          WRENCH-TIME SPEED & DIAGNOSTICS ACCURACY RATING
        </p>

        <StarRating value={rating} onChange={setRating} />

        <div className="h-6" />

        <p className="tracking-[0.14em] uppercase mb-2 text-[0.9rem] text-[#5a6a8a]">
          SERVICE LOGS & FIELD NOTES
        </p>

        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setError("");
          }}
          rows={5}
          placeholder="Type your service experience..."
          className="w-full resize-none focus:outline-none bg-[#0d1117] text-[#8a9ab8] text-[0.73rem] p-[10px_12px] rounded-[3px] leading-[1.7] border border-[#1e2a40]"
        />

        {error && (
          <p className="text-xs mt-2 text-[#f87171] tracking-[0.05em]">
            {error}
          </p>
        )}

        <div className="h-6" />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="font-bold tracking-[0.18em] uppercase bg-[#3b5bdb] text-white px-11 py-3 text-[0.95rem] rounded cursor-pointer hover:bg-[#4a6af0]"
          >
            SUBMIT
          </button>
        </div>
      </div>

      {submitted && <SubmissionModal onClose={handleReset} />}
    </div>
  );
}