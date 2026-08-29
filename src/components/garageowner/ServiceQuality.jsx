import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Menu,
  Star,
  MessageSquare,
  Filter,
  Cloud,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import GarageOwnerNotifications from "./GarageOwnerNotifications";

const API_BASE = "http://localhost:5000";

export default function ServiceQuality({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // STATES
  // ======================================================

  const [searchText, setSearchText] =
    useState("");

  const [ownerData, setOwnerData] =
    useState(null);

  const [garageId, setGarageId] =
    useState(null);

  const [garageName, setGarageName] =
    useState("");

  const [reviews, setReviews] =
    useState([]);

  const [complaints, setComplaints] =
    useState([]);

  const [summary, setSummary] =
    useState({
      averageRating: 0,
      totalReviews: 0,
      lowRatingCount: 0,
      fiveStarCount: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [ratingFilter, setRatingFilter] =
    useState("ALL");

  const [showFilter, setShowFilter] =
    useState(false);

  // ======================================================
  // GET LOGGED-IN GARAGE OWNER
  // ======================================================

  const getLoggedInStaffUser =
    useCallback(() => {
      try {
        const stored =
          sessionStorage.getItem(
            "staffUser"
          );

        if (!stored) {
          return null;
        }

        return JSON.parse(stored);
      } catch (error) {
        console.error(
          "Unable to read staffUser:",
          error
        );

        return null;
      }
    }, []);

  // ======================================================
  // RESOLVE GARAGE ID
  // ======================================================

  const resolveGarageId = (
    staffUser,
    ownerResult
  ) => {
    const possibleValues = [
      ownerResult?.data?.garage
        ?.garageId,

      ownerResult?.data?.garage
        ?.garage_id,

      ownerResult?.data
        ?.garageId,

      ownerResult?.data
        ?.garage_id,

      ownerResult?.data?.owner
        ?.garageId,

      ownerResult?.data?.owner
        ?.garage_id,

      staffUser?.garageId,

      staffUser?.garage_id,

      staffUser?.garageGarageId,

      staffUser?.garage_garage_id,
    ];

    for (const value of possibleValues) {
      const numericValue =
        Number(value);

      if (
        Number.isInteger(
          numericValue
        ) &&
        numericValue > 0
      ) {
        return numericValue;
      }
    }

    return null;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      [],
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    );
  };

  // ======================================================
  // LOAD SERVICE QUALITY DATA
  // ======================================================

  const loadServiceQuality =
    useCallback(
      async (
        initialLoad = false
      ) => {
        try {
          if (initialLoad) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setLoadError("");

          // ==============================================
          // LOGGED-IN OWNER
          // ==============================================

          const staffUser =
            getLoggedInStaffUser();

          if (!staffUser) {
            throw new Error(
              "Logged-in garage owner details were not found."
            );
          }

          const loginId = Number(
            staffUser.loginId ??
              staffUser.login_id
          );

          if (
            !Number.isInteger(
              loginId
            ) ||
            loginId <= 0
          ) {
            throw new Error(
              "A valid garage owner login ID was not found."
            );
          }

          // ==============================================
          // OWNER PROFILE
          // ==============================================

          const ownerResponse =
            await fetch(
              `${API_BASE}/api/owners/profile/${loginId}`
            );

          const ownerResult =
            await ownerResponse.json();

          if (
            !ownerResponse.ok ||
            ownerResult.success ===
              false
          ) {
            throw new Error(
              ownerResult.message ||
                "Unable to load garage owner profile."
            );
          }

          setOwnerData(
            ownerResult.data ||
              null
          );

          // ==============================================
          // GARAGE ID
          // ==============================================

          const numericGarageId =
            resolveGarageId(
              staffUser,
              ownerResult
            );

          if (
            !numericGarageId
          ) {
            throw new Error(
              "Garage ID could not be identified for the logged-in owner."
            );
          }

          setGarageId(
            numericGarageId
          );

          // ==============================================
          // FEEDBACK API
          // ==============================================

          const feedbackResponse =
            await fetch(
              `${API_BASE}/api/feedback/garage/${numericGarageId}`
            );

          const feedbackResult =
            await feedbackResponse.json();

          if (
            !feedbackResponse.ok ||
            feedbackResult.success ===
              false
          ) {
            throw new Error(
              feedbackResult.message ||
                "Unable to load service quality data."
            );
          }

          // ==============================================
          // GARAGE NAME
          // ==============================================

          setGarageName(
            feedbackResult
              ?.garage
              ?.garageName ||
              ownerResult
                ?.data
                ?.garage
                ?.garageName ||
              ownerResult
                ?.data
                ?.garage
                ?.garage_name ||
              "Garage"
          );

          // ==============================================
          // SUMMARY
          // ==============================================

          setSummary({
            averageRating:
              Number(
                feedbackResult
                  ?.summary
                  ?.averageRating
              ) || 0,

            totalReviews:
              Number(
                feedbackResult
                  ?.summary
                  ?.totalReviews
              ) || 0,

            lowRatingCount:
              Number(
                feedbackResult
                  ?.summary
                  ?.lowRatingCount
              ) || 0,

            fiveStarCount:
              Number(
                feedbackResult
                  ?.summary
                  ?.fiveStarCount
              ) || 0,
          });

          // ==============================================
          // FEEDBACK / REVIEWS
          // ==============================================

          const receivedFeedback =
            Array.isArray(
              feedbackResult
                ?.feedback
            )
              ? feedbackResult
                  .feedback
              : [];

          const formattedReviews =
            receivedFeedback.map(
              (
                item,
                index
              ) => ({
                feedbackId:
                  item.feedbackId ??
                  item.feedback_id ??
                  index + 1,

                jobId:
                  item.jobId ??
                  item.job_id ??
                  null,

                requestId:
                  item.requestId ??
                  item.request_id ??
                  null,

                customerName:
                  item.customerName ??
                  item.customer_name ??
                  "Customer",

                customerContact:
                  item.customerContact ??
                  item.customer_contact ??
                  "",

                vehicle:
                  item.vehicleNumber ??
                  item.vehicle_number ??
                  "N/A",

                vehicleType:
                  item.vehicleType ??
                  item.vehicle_type ??
                  "",

                tech:
                  item.technicianName ??
                  item.technician_name ??
                  "Not Assigned",

                rating:
                  Number(
                    item.rating
                  ) || 0,

                feedback:
                  item.comment ??
                  item.feedback ??
                  item.message ??
                  "No comment provided.",

                feedbackDate:
                  item.feedbackDate ??
                  item.feedback_date ??
                  null,

                flag:
                  Boolean(
                    item.flag
                  ),

                flagMessage:
                  item.flagMessage ??
                  "",
              })
            );

          setReviews(
            formattedReviews
          );

          // ==============================================
          // COMPLAINTS
          // ==============================================

          const receivedComplaints =
            Array.isArray(
              feedbackResult
                ?.complaints
            )
              ? feedbackResult
                  .complaints
              : [];

          setComplaints(
            receivedComplaints.map(
              (
                item,
                index
              ) => {
                if (
                  typeof item ===
                  "string"
                ) {
                  return {
                    id:
                      index + 1,

                    label:
                      item,

                    count:
                      1,
                  };
                }

                return {
                  id:
                    item.id ??
                    item.complaintId ??
                    index + 1,

                  label:
                    item.label ??
                    item.name ??
                    item.complaint ??
                    "Other",

                  count:
                    Number(
                      item.count
                    ) || 0,
                };
              }
            )
          );
        } catch (error) {
          console.error(
            "Service Quality loading error:",
            error
          );

          setLoadError(
            error.message ||
              "Unable to load Service Quality."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [getLoggedInStaffUser]
    );

  // ======================================================
  // REAL-TIME AUTO REFRESH
  // ======================================================

  useEffect(() => {
    loadServiceQuality(true);

    const interval =
      setInterval(() => {
        loadServiceQuality(
          false
        );
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadServiceQuality]);

  // ======================================================
  // FILTER REVIEWS
  // ======================================================

  const filteredReviews =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      return reviews.filter(
        (item) => {
          const matchesSearch =
            !query ||
            `
              ${item.vehicle}
              ${item.vehicleType}
              ${item.tech}
              ${item.customerName}
              ${item.customerContact}
              ${item.rating}
              ${item.feedback}
              ${item.feedbackDate}
            `
              .toLowerCase()
              .includes(query);

          let matchesRating =
            true;

          if (
            ratingFilter === "5"
          ) {
            matchesRating =
              item.rating >=
              4.5;
          }

          if (
            ratingFilter === "4"
          ) {
            matchesRating =
              item.rating >=
                4 &&
              item.rating <
                4.5;
          }

          if (
            ratingFilter === "3"
          ) {
            matchesRating =
              item.rating >=
                3 &&
              item.rating < 4;
          }

          if (
            ratingFilter ===
            "LOW"
          ) {
            matchesRating =
              item.rating < 3;
          }

          return (
            matchesSearch &&
            matchesRating
          );
        }
      );
    }, [
      reviews,
      searchText,
      ratingFilter,
    ]);

  // ======================================================
  // OWNER DETAILS
  // ======================================================

  const ownerName =
    ownerData?.owner
      ?.fullName ??
    ownerData?.owner
      ?.full_name ??
    "Garage Owner";

  const displayGarageName =
    garageName ||
    ownerData?.garage
      ?.garageName ||
    ownerData?.garage
      ?.garage_name ||
    "Garage";

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("") ||
    "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner
      ?.profilePhoto ??
    ownerData?.owner
      ?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(
          profilePhotoPath
        ).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  // ======================================================
  // COMPLAINT STYLE
  // ======================================================

  const getComplaintStyle = (
    index
  ) => {
    const styles = [
      "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
      "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
      "bg-red-500/20 text-red-300 border-red-400/30",
      "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
      "bg-amber-500/20 text-amber-300 border-amber-400/30",
      "bg-purple-500/20 text-purple-300 border-purple-400/30",
    ];

    return styles[
      index % styles.length
    ];
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="sticky top-0 z-50 min-h-16 border-b border-white/10 bg-[#191922]/95 backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-0 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">

        <div className="flex items-center gap-3 w-full md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
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
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              placeholder="Search service quality..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText(
                    ""
                  )
                }
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            DYNAMIC OWNER HEADER
        ================================================== */}

        <div className="flex w-full min-w-0 items-center justify-end gap-2 sm:gap-3 md:w-auto md:gap-4">

          <div className="hidden h-8 w-px shrink-0 bg-white/10 md:block" />

          <div className="shrink-0">
            <GarageOwnerNotifications
              onNavigate={onNavigate}
            />
          </div>

          <div className="min-w-0 flex-1 text-right sm:flex-none">

            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-indigo-400 md:max-w-[260px]">
              {displayGarageName}
            </p>

          </div>

          <div className="h-9 w-9 min-h-9 min-w-9 shrink-0 overflow-hidden rounded-xl border border-indigo-400 bg-[#0b0b12] text-xs flex items-center justify-center">

            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              ownerInitials
            )}

          </div>

        </div>

      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-4 md:p-8">

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8">

          <div>

            <h1 className="text-[2rem] sm:text-3xl md:text-4xl font-black leading-tight mb-4 break-words">
              SERVICE QUALITY &
              CUSTOMER SATISFACTION
            </h1>

            <p className="text-gray-400 text-sm md:text-base max-w-3xl">
              Monitor post-service
              vehicle reliability and
              live customer feedback
              metrics across the
              workshop.
            </p>

            <p className="mt-3 text-[10px] text-gray-600 font-mono">

              {garageId
                ? `GARAGE ID: ${garageId} • AUTO REFRESH: 5 SECONDS`
                : "IDENTIFYING GARAGE..."}

            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              loadServiceQuality(
                false
              )
            }
            disabled={
              loading ||
              refreshing
            }
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >

            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "REFRESHING..."
              : "REFRESH"}

          </button>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div>

                <p className="font-bold text-red-300">
                  Unable to load
                  service quality data
                </p>

                <p className="mt-1 text-xs text-red-200/70">
                  {loadError}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                loadServiceQuality(
                  true
                )
              }
              className="mt-4 rounded-lg border border-red-500/30 px-4 py-2 text-xs text-red-200 hover:bg-red-500/10"
            >
              TRY AGAIN
            </button>

          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* AVERAGE RATING */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">

            <div className="flex justify-between items-start mb-6">

              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">
                Average Customer Rating
              </p>

              <Star
                size={18}
                className="text-yellow-400 fill-yellow-400"
              />

            </div>

            <h2 className="text-2xl font-bold mb-3">

              {summary.averageRating.toFixed(
                1
              )}{" "}
              / 5.0

            </h2>

            <div className="flex items-center gap-1 text-yellow-400">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={
                      star
                    }
                    size={
                      14
                    }
                    className={
                      star <=
                      Math.round(
                        summary.averageRating
                      )
                        ? "fill-yellow-400"
                        : ""
                    }
                  />
                )
              )}

            </div>

          </div>

          {/* TOTAL REVIEWS */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">

            <div className="flex justify-between items-start mb-6">

              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">
                Total Reviews Logged
              </p>

              <MessageSquare
                size={17}
                className="text-cyan-400"
              />

            </div>

            <h2 className="text-2xl font-bold text-cyan-400 mb-5">

              {summary.totalReviews}{" "}
              Submissions

            </h2>

            <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">

              <div
                className="h-1 bg-cyan-400 rounded transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    summary.totalReviews *
                      10
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* LOW RATING */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6 shadow-xl">

            <div className="flex justify-between items-start mb-6">

              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">
                Low Rating Alerts
              </p>

              <AlertCircle
                size={17}
                className="text-red-400"
              />

            </div>

            <h2 className="text-2xl font-bold text-red-300">
              {summary.lowRatingCount}
            </h2>

            <p className="mt-3 text-[10px] text-gray-500">
              Ratings below 3.0
            </p>

          </div>

        </div>

        {/* ==================================================
            EXPERIENCE MATRIX
        ================================================== */}

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden mb-8">

          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <h2 className="text-lg md:text-xl font-bold">
                Post-Service
                Experience Matrix
              </h2>

              <p className="mt-1 text-[10px] text-gray-500">
                Live customer
                feedback for this
                garage.
              </p>

            </div>

            <div className="relative self-end sm:self-auto">

              <button
                type="button"
                onClick={() =>
                  setShowFilter(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
                className="w-9 h-9 bg-white/10 rounded flex items-center justify-center text-gray-300 hover:bg-white/20"
              >

                <Filter
                  size={
                    14
                  }
                />

              </button>

              {showFilter && (

                <div className="absolute right-0 top-11 z-30 w-40 rounded-lg border border-white/10 bg-[#15151e] p-2 shadow-xl">

                  {[
                    {
                      key:
                        "ALL",
                      label:
                        "All Reviews",
                    },
                    {
                      key:
                        "5",
                      label:
                        "4.5 - 5.0",
                    },
                    {
                      key:
                        "4",
                      label:
                        "4.0 - 4.4",
                    },
                    {
                      key:
                        "3",
                      label:
                        "3.0 - 3.9",
                    },
                    {
                      key:
                        "LOW",
                      label:
                        "Below 3.0",
                    },
                  ].map(
                    (
                      option
                    ) => (

                      <button
                        key={
                          option.key
                        }
                        type="button"
                        onClick={() => {
                          setRatingFilter(
                            option.key
                          );

                          setShowFilter(
                            false
                          );
                        }}
                        className={`w-full rounded px-3 py-2 text-left text-xs transition ${
                          ratingFilter ===
                          option.key
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-[1000px] md:w-full text-left">

              <thead className="bg-white/5 text-gray-500 text-[10px] tracking-[0.2em] uppercase">

                <tr>

                  <th className="px-8 py-5">
                    Vehicle Number
                  </th>

                  <th className="px-4 py-5">
                    Customer
                  </th>

                  <th className="px-4 py-5">
                    Assigned Tech
                  </th>

                  <th className="px-4 py-5">
                    Rating
                  </th>

                  <th className="px-4 py-5">
                    Customer Feedback
                  </th>

                  <th className="px-4 py-5">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="py-14 text-center text-gray-500 text-xs tracking-widest"
                    >
                      LOADING SERVICE QUALITY DATA...
                    </td>

                  </tr>

                ) : filteredReviews.length >
                  0 ? (

                  filteredReviews.map(
                    (item) => (

                      <tr
                        key={
                          item.feedbackId
                        }
                        className="border-t border-white/10 hover:bg-white/[0.03]"
                      >

                        <td className="px-8 py-6 font-mono text-indigo-300 text-sm">
                          {item.vehicle}
                        </td>

                        <td className="px-4 py-6 text-sm text-gray-300">
                          {item.customerName}
                        </td>

                        <td className="px-4 py-6 text-sm">

                          <span className="font-semibold text-emerald-300">
                            {item.tech}
                          </span>

                        </td>

                        <td className="px-4 py-6">

                          <div className="flex items-center gap-2">

                            <span
                              className={`font-mono text-sm ${
                                item.rating <
                                3
                                  ? "text-red-300"
                                  : "text-yellow-400"
                              }`}
                            >
                              {item.rating.toFixed(
                                1
                              )}
                            </span>

                            <Star
                              size={
                                13
                              }
                              className="text-yellow-400 fill-yellow-400"
                            />

                          </div>

                        </td>

                        <td className="px-4 py-6 text-sm text-gray-300 max-w-md">
                          "{item.feedback}"
                        </td>

                        <td className="px-4 py-6 text-xs text-gray-500 whitespace-nowrap">

                          {formatDate(
                            item.feedbackDate
                          )}

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="py-12 text-center text-gray-500 text-xs tracking-widest"
                    >

                      {searchText ||
                      ratingFilter !==
                        "ALL"
                        ? "NO MATCHING SERVICE QUALITY DATA FOUND"
                        : "NO SERVICE QUALITY DATA AVAILABLE"}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ==================================================
            COMMON CUSTOMER COMPLAINTS
        ================================================== */}

        <div className="flex justify-center">

          <div className="bg-[#191923] border border-white/10 rounded-lg p-6 w-full max-w-3xl">

            <div className="flex justify-between items-center mb-8">

              <div>

                <h2 className="text-[11px] font-bold tracking-[0.25em] text-gray-500 uppercase">
                  Common Customer
                  Complaints
                </h2>

                <p className="mt-2 text-[10px] text-gray-600">
                  Complaint topics
                  detected from
                  customer feedback.
                </p>

              </div>

              <Cloud
                size={18}
                className="text-gray-400"
              />

            </div>

            {complaints.length >
            0 ? (

              <div className="flex flex-wrap gap-3 justify-center items-center">

                {complaints.map(
                  (
                    item,
                    index
                  ) => (

                    <span
                      key={
                        item.id
                      }
                      className={`px-4 py-2 rounded border text-sm font-bold ${getComplaintStyle(
                        index
                      )}`}
                    >

                      {item.label}

                      {item.count >
                        0 && (

                        <span className="ml-2 opacity-60">
                          ×{item.count}
                        </span>

                      )}

                    </span>

                  )
                )}

              </div>

            ) : (

              <div className="rounded-lg border border-white/5 bg-black/10 py-10 text-center">

                <p className="text-xs text-gray-500 tracking-wider">
                  NO COMMON
                  COMPLAINTS
                  IDENTIFIED
                </p>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}