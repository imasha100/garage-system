import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Star,
  Eye,
  X,
  Search,
  RefreshCw,
  AlertCircle,
  Car,
  Wrench,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

const API_BASE_URL =
  "http://localhost:5000/api";

const ExperienceAudit = ({
  searchQuery = "",
  setSearchQuery = () => {},
}) => {
  const [
    selectedReview,
    setSelectedReview,
  ] = useState(null);

  const [
    feedData,
    setFeedData,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    garageName,
    setGarageName,
  ] = useState("");

  const [
    summary,
    setSummary,
  ] = useState({
    averageRating: 0,
    totalReviews: 0,
    lowRatingCount: 0,
    fiveStarCount: 0,
  });

  // ====================================================
  // GET LOGGED-IN ASSISTANCE USER
  // ====================================================

  const getLoggedInAssistance =
    () => {
      try {
        const stored =
          sessionStorage.getItem(
            "staffUser"
          );

        if (!stored) {
          return null;
        }

        const staffUser =
          JSON.parse(stored);

        const role =
          String(
            staffUser?.role ||
              ""
          )
            .trim()
            .toLowerCase();

        if (
          role !==
          "assistance"
        ) {
          return null;
        }

        const staffId =
          Number(
            staffUser?.staffId ??
              staffUser
                ?.staff_id ??
              staffUser
                ?.assistanceId ??
              staffUser
                ?.assistance_id
          );

        const loginId =
          Number(
            staffUser?.loginId ??
              staffUser
                ?.login_id
          );

        return {
          ...staffUser,

          staffId:
            Number.isInteger(
              staffId
            ) &&
            staffId > 0
              ? staffId
              : null,

          loginId:
            Number.isInteger(
              loginId
            ) &&
            loginId > 0
              ? loginId
              : null,
        };
      } catch (error) {
        console.error(
          "Unable to read assistance user:",
          error
        );

        return null;
      }
    };

  // ====================================================
  // GET GARAGE ID
  // ====================================================

  const getGarageId =
    async () => {
      const staffUser =
        getLoggedInAssistance();

      if (!staffUser) {
        throw new Error(
          "Logged-in assistance officer was not found."
        );
      }

      // -----------------------------------------------
      // First try garage ID stored during login
      // -----------------------------------------------

      const storedGarageId =
        Number(
          staffUser?.garageId ??
            staffUser
              ?.garage_id
        );

      if (
        Number.isInteger(
          storedGarageId
        ) &&
        storedGarageId > 0
      ) {
        return storedGarageId;
      }

      // -----------------------------------------------
      // Otherwise get profile using login ID
      // -----------------------------------------------

      if (
        Number.isInteger(
          staffUser.loginId
        ) &&
        staffUser.loginId > 0
      ) {
        const response =
          await fetch(
            `${API_BASE_URL}/assistances/profile/${staffUser.loginId}`
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success !==
            false &&
          data.assistance
        ) {
          const garageId =
            Number(
              data.assistance
                .garageId
            );

          if (
            Number.isInteger(
              garageId
            ) &&
            garageId > 0
          ) {
            return garageId;
          }
        }
      }

      // -----------------------------------------------
      // Fallback using assistance ID
      // -----------------------------------------------

      if (
        Number.isInteger(
          staffUser.staffId
        ) &&
        staffUser.staffId > 0
      ) {
        const response =
          await fetch(
            `${API_BASE_URL}/assistances/${staffUser.staffId}`
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success !==
            false &&
          data.assistance
        ) {
          const garageId =
            Number(
              data.assistance
                .garageId
            );

          if (
            Number.isInteger(
              garageId
            ) &&
            garageId > 0
          ) {
            return garageId;
          }
        }
      }

      throw new Error(
        "Garage information for this assistance officer was not found."
      );
    };

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ====================================================
  // LOAD FEEDBACK FROM DATABASE
  // ====================================================

  const loadReviews =
    useCallback(
      async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
          const garageId =
            await getGarageId();

          const response =
            await fetch(
              `${API_BASE_URL}/feedback/garage/${garageId}`
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            data.success ===
              false
          ) {
            throw new Error(
              data.message ||
                "Unable to load customer feedback."
            );
          }

          const reviews =
            Array.isArray(
              data.feedback
            )
              ? data.feedback
              : [];

          setFeedData(
            reviews.map(
              (review) => ({
                id:
                  review.feedbackId,

                name:
                  review.customerName ||
                  "Customer",

                rating:
                  Number(
                    review.rating
                  ) || 0,

                comment:
                  review.comment ||
                  "No comment provided.",

                date:
                  review.feedbackDate,

                vehicleNumber:
                  review.vehicleNumber ||
                  "—",

                vehicleType:
                  review.vehicleType ||
                  "",

                vehicleModel:
                  review.vehicleModel ||
                  "",

                technicianName:
                  review.technicianName ||
                  "Not Assigned",

                garageName:
                  review.garageName ||
                  "",

                ticketNumber:
                  review.ticketNumber ||
                  "",

                jobId:
                  review.jobId,

                requestId:
                  review.requestId,

                flag:
                  Boolean(
                    review.flag
                  ),

                flagMsg:
                  review.flagMessage ||
                  "",
              })
            )
          );

          setGarageName(
            data.garage
              ?.garageName ||
              ""
          );

          setSummary({
            averageRating:
              Number(
                data.summary
                  ?.averageRating
              ) || 0,

            totalReviews:
              Number(
                data.summary
                  ?.totalReviews
              ) || 0,

            lowRatingCount:
              Number(
                data.summary
                  ?.lowRatingCount
              ) || 0,

            fiveStarCount:
              Number(
                data.summary
                  ?.fiveStarCount
              ) || 0,
          });
        } catch (error) {
          console.error(
            "Load feedback error:",
            error
          );

          setFeedData([]);

          setErrorMessage(
            error.message ||
              "Unable to load customer feedback."
          );
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredFeedData =
    feedData.filter(
      (review) => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          review.name
            ?.toLowerCase()
            .includes(query) ||

          review.comment
            ?.toLowerCase()
            .includes(query) ||

          review.vehicleNumber
            ?.toLowerCase()
            .includes(query) ||

          review.vehicleType
            ?.toLowerCase()
            .includes(query) ||

          review.vehicleModel
            ?.toLowerCase()
            .includes(query) ||

          review.technicianName
            ?.toLowerCase()
            .includes(query) ||

          review.ticketNumber
            ?.toLowerCase()
            .includes(query) ||

          review.flagMsg
            ?.toLowerCase()
            .includes(query) ||

          String(
            review.rating
          ).includes(query)
        );
      }
    );

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#050608] font-sans text-[#e4e9e7]">

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#050608] p-4 md:p-8">

        <main className="mx-auto max-w-5xl pb-12">

          {/* TITLE */}

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#52f0ac] md:text-2xl">
                Real-time Customer Satisfaction Feed
              </h2>

              {garageName && (
                <p className="mt-2 text-sm text-slate-500">
                  {garageName}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={
                loadReviews
              }
              disabled={
                isLoading
              }
              className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-[#1f2a36] bg-[#0b0e14] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-[#52f0ac] hover:text-[#52f0ac] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* SUMMARY */}

          {!isLoading &&
            !errorMessage && (
              <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">

                <div className="rounded-xl border border-[#1a1f26] bg-[#0b0e14] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Average Rating
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Star
                      size={20}
                      className="fill-[#52f0ac] text-[#52f0ac]"
                    />

                    <span className="text-2xl font-black text-white">
                      {
                        summary.averageRating
                      }
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a1f26] bg-[#0b0e14] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Total Reviews
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {
                      summary.totalReviews
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-red-400/70">
                    Low Ratings
                  </p>

                  <p className="mt-2 text-2xl font-black text-red-400">
                    {
                      summary.lowRatingCount
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-[#52f0ac]/20 bg-[#52f0ac]/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-[#52f0ac]/70">
                    Five Star
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#52f0ac]">
                    {
                      summary.fiveStarCount
                    }
                  </p>
                </div>

              </div>
            )}

          {/* ERROR */}

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5">

              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="font-bold text-red-300">
                  Unable to load feedback
                </p>

                <p className="mt-1 text-sm text-red-300/80">
                  {
                    errorMessage
                  }
                </p>

                <button
                  type="button"
                  onClick={
                    loadReviews
                  }
                  className="mt-3 cursor-pointer text-sm font-bold text-white hover:text-red-200"
                >
                  Try Again
                </button>
              </div>

            </div>
          )}

          {/* LOADING */}

          {isLoading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-[#1a1f26] bg-[#0b0e14]">

              <RefreshCw
                size={38}
                className="animate-spin text-[#52f0ac]"
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading customer feedback...
              </p>

            </div>
          ) : filteredFeedData.length >
            0 ? (

            /* FEEDBACK LIST */

            <div className="flex flex-col gap-5">

              {filteredFeedData.map(
                (data) => (
                  <div
                    key={
                      data.id
                    }
                    className={`rounded-xl border p-5 shadow-lg transition-all duration-300 hover:scale-[1.005] md:p-6 ${
                      data.flag
                        ? "border-[#4a2525] bg-[#1f1515]"
                        : "border-[#1a1f26] bg-[#0b0e14]"
                    }`}
                  >

                    {/* CUSTOMER */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <p className="text-lg font-bold text-white md:text-xl">
                          {
                            data.name
                          }
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

                          <span className="flex items-center gap-1.5">
                            <Car
                              size={14}
                            />

                            {
                              data.vehicleNumber
                            }

                            {data.vehicleType &&
                              ` • ${data.vehicleType}`}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Wrench
                              size={14}
                            />

                            {
                              data.technicianName
                            }
                          </span>

                        </div>
                      </div>

                      <span className="flex shrink-0 items-center gap-2 rounded bg-[#050608] px-3 py-1.5 text-xs text-[#6e7681]">
                        <CalendarDays
                          size={13}
                        />

                        {formatDate(
                          data.date
                        )}
                      </span>

                    </div>

                    {/* STARS */}

                    <div className="mt-4 flex gap-1">

                      {[
                        ...Array(5),
                      ].map(
                        (
                          _,
                          star
                        ) => (
                          <Star
                            key={
                              star
                            }
                            size={
                              18
                            }
                            className={
                              star <
                              data.rating
                                ? "fill-[#52f0ac] text-[#52f0ac]"
                                : "text-[#27313b]"
                            }
                          />
                        )
                      )}

                    </div>

                    {/* COMMENT */}

                    <div className="mt-4 flex items-start gap-3">

                      <MessageSquare
                        size={18}
                        className="mt-1 shrink-0 text-slate-600"
                      />

                      <p className="text-base leading-relaxed text-white md:text-lg">
                        {
                          data.comment
                        }
                      </p>

                    </div>

                    {/* LOW RATING FLAG */}

                    {data.flag && (
                      <p className="mt-4 inline-block rounded bg-[#2a1010] p-2 text-xs font-bold text-[#ff6666] md:text-sm">
                        {data.flagMsg ||
                          "SYSTEM FLAG: LOW CUSTOMER SATISFACTION DETECTED"}
                      </p>
                    )}

                    {/* VIEW */}

                    <div className="mt-5 flex justify-end border-t border-[#1a1f26] pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReview(
                            data
                          )
                        }
                        className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase text-[#6e7681] transition hover:text-[#52f0ac]"
                      >
                        <Eye
                          size={16}
                        />

                        View Audit Details
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          ) : (

            /* EMPTY */

            <div className="rounded-xl border border-[#1a1f26] bg-[#0b0e14] p-10 text-center">

              <Search
                size={40}
                className="mx-auto mb-4 text-[#52f0ac]"
              />

              <h3 className="text-xl font-bold text-white">
                {searchQuery
                  ? "No Reviews Found"
                  : "No Customer Feedback Yet"}
              </h3>

              <p className="mt-2 text-[#6e7681]">
                {searchQuery
                  ? `No customer review matches "${searchQuery}".`
                  : "Customer feedback will appear here after completed services are reviewed."}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                  className="mt-5 cursor-pointer rounded-lg bg-[#52f0ac] px-5 py-2 font-bold text-black hover:bg-[#45d99c]"
                >
                  Clear Search
                </button>
              )}

            </div>
          )}

        </main>

        {/* DETAILS MODAL */}

        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-cyan-400 bg-gradient-to-br from-[#10233d] to-[#08121f] shadow-2xl">

              {/* MODAL HEADER */}

              <div className="sticky top-0 flex items-center justify-between border-b border-cyan-800 bg-[#10233d] p-5">

                <h2 className="text-xl font-bold text-cyan-300 md:text-2xl">
                  Customer Review
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedReview(
                      null
                    )
                  }
                  className="cursor-pointer text-gray-400 hover:text-red-400"
                  aria-label="Close review details"
                >
                  <X
                    size={22}
                  />
                </button>

              </div>

              <div className="p-5 md:p-6">

                {/* NAME */}

                <h3 className="text-2xl font-bold text-white">
                  {
                    selectedReview.name
                  }
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Submitted on{" "}
                  {formatDate(
                    selectedReview.date
                  )}
                </p>

                {/* STARS */}

                <div className="my-5 flex gap-1">

                  {[
                    ...Array(5),
                  ].map(
                    (
                      _,
                      star
                    ) => (
                      <Star
                        key={
                          star
                        }
                        size={20}
                        className={
                          star <
                          selectedReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    )
                  )}

                </div>

                {/* DETAILS */}

                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-cyan-900 bg-[#0a1626] p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Vehicle
                    </p>

                    <p className="mt-1 font-bold text-white">
                      {
                        selectedReview.vehicleNumber
                      }
                    </p>

                    {(selectedReview.vehicleType ||
                      selectedReview.vehicleModel) && (
                      <p className="mt-1 text-sm text-gray-400">
                        {
                          selectedReview.vehicleType
                        }

                        {selectedReview.vehicleType &&
                        selectedReview.vehicleModel
                          ? " • "
                          : ""}

                        {
                          selectedReview.vehicleModel
                        }
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-cyan-900 bg-[#0a1626] p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Technician
                    </p>

                    <p className="mt-1 font-bold text-white">
                      {
                        selectedReview.technicianName
                      }
                    </p>
                  </div>

                  {selectedReview.ticketNumber && (
                    <div className="rounded-xl border border-cyan-900 bg-[#0a1626] p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Ticket
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {
                          selectedReview.ticketNumber
                        }
                      </p>
                    </div>
                  )}

                  {selectedReview.jobId && (
                    <div className="rounded-xl border border-cyan-900 bg-[#0a1626] p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Job ID
                      </p>

                      <p className="mt-1 font-bold text-white">
                        #
                        {
                          selectedReview.jobId
                        }
                      </p>
                    </div>
                  )}

                </div>

                {/* COMMENT */}

                <div className="rounded-xl border border-cyan-900 bg-[#0a1626] p-5">

                  <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                    Customer Comment
                  </p>

                  <p className="leading-7 text-white">
                    {
                      selectedReview.comment
                    }
                  </p>

                </div>

                {/* FLAG */}

                {selectedReview.flag && (
                  <div className="mt-5 rounded-lg border border-red-600 bg-red-950 p-4 text-red-300">
                    {selectedReview.flagMsg ||
                      "SYSTEM FLAG: LOW CUSTOMER SATISFACTION DETECTED"}
                  </div>
                )}

                {/* CLOSE */}

                <div className="mt-8 flex justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReview(
                        null
                      )
                    }
                    className="cursor-pointer rounded-lg bg-cyan-500 px-6 py-2 font-bold text-black hover:bg-cyan-600"
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