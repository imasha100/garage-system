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
            star <= (hover || value) ? "text-[#f5a623] scale-[1.1]" : "text-[#3a3f5c] scale-100"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.75)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(0,80,60,0.6)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(0,60,80,0.5)_0%,transparent_50%),radial-gradient(ellipse_at_50%_50%,rgba(0,40,50,0.8)_0%,#030d0e_100%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,180,120,0.04)_0%,transparent_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,transparent_30%,rgba(0,255,180,0.015)_50%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center text-center px-10 py-12 rounded-lg bg-[rgba(5,15,20,0.72)] backdrop-blur-[10px] border border-[rgba(0,255,160,0.08)] max-w-[420px] w-[90%]">
        <div className="flex items-center justify-center rounded-full mb-6 w-[52px] h-[52px] border-2 border-[#00e676] bg-[rgba(0,230,118,0.08)] shadow-[0_0_18px_rgba(0,230,118,0.35)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="font-bold tracking-[0.12em] mb-4 text-[1.75rem] text-[#00e5a0] leading-[1.2]">
          SUBMISSION COMPLETE
        </h2>

        <p className="text-[0.7rem] text-[#c8d8d0] tracking-[0.13em] mb-1 uppercase">
          THANK YOU FOR VISITING OUR GARAGE
        </p>
        <p className="text-[0.7rem] text-[#c8d8d0] tracking-[0.13em] mb-8 uppercase">
          AND SHARING YOUR EXPERIENCE!
        </p>

        <button
          onClick={onClose}
          className="font-bold tracking-[0.12em] uppercase transition-all duration-150 text-[0.75rem] px-7 py-2.5 border-2 border-[#00e676] text-[#00e676] bg-transparent cursor-pointer rounded-[2px] hover:bg-[rgba(0,230,118,0.12)]"
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
    if (rating === 0) { setError("Please select a star rating."); return; }
   
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false); setRating(4); setNotes(""); setError("");
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
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Provide descriptive logs detailing your repair experience with Specialist Marcus Thorne..."
          className={`w-full resize-none focus:outline-none bg-[#0d1117] text-[#8a9ab8] text-[0.73rem] p-[10px_12px] rounded-[3px] leading-[1.7] border ${error && !notes.trim() ? "border-[rgba(239,68,68,0.5)]" : "border-[#1e2a40]"}`}
        />

        {error && (
          <p className="text-xs mt-1 text-[#f87171] tracking-[0.05em]">
            {error}
          </p>
        )}

        <div className="h-5" />

        <div className="inline-flex items-center gap-2 bg-[#1a2035] border border-[#2e3d60] rounded-[3px] p-[6px_14px]">
          <div className="flex items-center justify-center rounded-full w-[26px] h-[26px] bg-[linear-gradient(135deg,#2563eb,#06b6d4)] min-w-[26px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[0.75rem] text-[#5a6a8a] tracking-[0.15em] leading-[1] mb-[3px]">
              TECHNICIAN
            </p>
            <p className="text-[0.75rem] text-[#d0e0f0] font-bold tracking-[0.1em] leading-[1]">
              M. THORNE
            </p>
          </div>
        </div>

        <div className="h-6" />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="font-bold tracking-[0.18em] uppercase transition-all duration-150 bg-[#3b5bdb] text-[#ffffff] border-none p-[10px_44px] text-[0.95rem] rounded-[3px] cursor-pointer shadow-[0_2px_16px_rgba(59,91,219,0.4)] hover:bg-[#4a6af0] hover:shadow-[0_4px_22px_rgba(59,91,219,0.6)]"
          >
            SUBMIT
          </button>
        </div>
      </div>

      {submitted && <SubmissionModal onClose={handleReset} />}
    </div>
  );
}