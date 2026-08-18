import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  Menu,
  TrendingUp,
  ReceiptText,
  BadgeDollarSign,
  Download,
  Filter,
  RotateCcw,
  CheckCircle,
  CalendarDays,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE =
  "http://localhost:5000";

export default function ProfitLoss({
  toggleSidebar,
}) {
  // ======================================================
  // FILTER STATES
  // ======================================================

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    selectedType,
    setSelectedType,
  ] = useState("All");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    downloaded,
    setDownloaded,
  ] = useState(false);

  const dateInputRef =
    useRef(null);

  // ======================================================
  // OWNER STATES
  // ======================================================

  const [
    ownerData,
    setOwnerData,
  ] = useState(null);

  const [
    ownerLoading,
    setOwnerLoading,
  ] = useState(true);

  const [
    ownerError,
    setOwnerError,
  ] = useState("");

  // ======================================================
  // PROFIT / LOSS STATES
  // ======================================================

  const [
    profitLossData,
    setProfitLossData,
  ] = useState(null);

  const [
    financialLoading,
    setFinancialLoading,
  ] = useState(true);

  const [
    financialError,
    setFinancialError,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  // ======================================================
  // LOAD LOGGED-IN GARAGE OWNER PROFILE
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile =
      async () => {
        try {
          setOwnerLoading(true);
          setOwnerError("");

          const storedStaffUser =
            sessionStorage.getItem(
              "staffUser"
            );

          if (!storedStaffUser) {
            throw new Error(
              "Logged-in garage owner details were not found."
            );
          }

          const staffUser =
            JSON.parse(
              storedStaffUser
            );

          const loginId =
            Number(
              staffUser?.loginId
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

          const response =
            await fetch(
              `${API_BASE}/api/owners/profile/${loginId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Unable to load the garage owner profile."
            );
          }

          if (isMounted) {
            setOwnerData(
              result.data
            );
          }
        } catch (error) {
          console.error(
            "Owner profile loading error:",
            error
          );

          if (isMounted) {
            setOwnerData(null);

            setOwnerError(
              error.message ||
                "Unable to load the garage owner profile."
            );
          }
        } finally {
          if (isMounted) {
            setOwnerLoading(
              false
            );
          }
        }
      };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // OWNER DISPLAY DATA
  // ======================================================

  const ownerName =
    ownerData?.owner?.fullName ||
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage
      ?.garageName ||
    (ownerLoading
      ? "Loading Garage..."
      : "Garage");

  const garageId =
    Number(
      ownerData?.garage
        ?.garageId
    );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "GO";

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
  // LOAD PROFIT / LOSS DATA
  // ======================================================

  const loadProfitLoss =
    async (
      selectedGarageId =
        garageId,
      showLoading = false
    ) => {
      if (
        !Number.isInteger(
          selectedGarageId
        ) ||
        selectedGarageId <= 0
      ) {
        return;
      }

      try {
        if (showLoading) {
          setFinancialLoading(
            true
          );
        }

        setFinancialError("");

        const response =
          await fetch(
            `${API_BASE}/api/profit-loss/garage/${selectedGarageId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load profit and loss data."
          );
        }

        setProfitLossData(
          result
        );

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          "Profit/Loss loading error:",
          error
        );

        setFinancialError(
          error.message ||
            "Unable to load profit and loss data."
        );
      } finally {
        setFinancialLoading(
          false
        );
      }
    };

  // ======================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // ======================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        garageId
      ) ||
      garageId <= 0
    ) {
      return undefined;
    }

    loadProfitLoss(
      garageId,
      true
    );

    const interval =
      setInterval(() => {
        loadProfitLoss(
          garageId,
          false
        );
      }, 5000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [garageId]);

  // ======================================================
  // DATABASE RECORDS
  // ======================================================

  const cashFlow =
    useMemo(() => {
      const records =
        Array.isArray(
          profitLossData
            ?.records
        )
          ? profitLossData
              .records
          : [];

      return records.map(
        (record) => ({
          ...record,

          amount:
            Number(
              record.amount
            ) || 0,

          type:
            record.type ||
            "Unknown",

          source:
            record.source ||
            "Financial Record",

          date:
            record.date ||
            null,
        })
      );
    }, [profitLossData]);

  // ======================================================
  // FORMAT DATE FOR TABLE / FILTER
  // ======================================================

  const formatDate =
    (value) => {
      if (!value) {
        return "";
      }

      const stringValue =
        String(value);

      if (
        stringValue.includes(
          "T"
        )
      ) {
        return stringValue.split(
          "T"
        )[0];
      }

      if (
        stringValue.includes(
          " "
        )
      ) {
        return stringValue.split(
          " "
        )[0];
      }

      return stringValue.slice(
        0,
        10
      );
    };

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatLKR =
    (value) => {
      const numericValue =
        Number(value) || 0;

      const sign =
        numericValue < 0
          ? "-LKR "
          : "LKR ";

      return (
        sign +
        Math.abs(
          numericValue
        ).toLocaleString(
          "en-LK"
        )
      );
    };

  // ======================================================
  // DATE PICKER
  // ======================================================

  const openDatePicker =
    () => {
      if (
        dateInputRef.current
          ?.showPicker
      ) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.focus();
      }
    };

  // ======================================================
  // FILTER REAL DATABASE RECORDS
  // ======================================================

  const filteredCashFlow =
    useMemo(() => {
      return cashFlow.filter(
        (item) => {
          const itemDate =
            formatDate(
              item.date
            );

          const searchData =
            `${itemDate} ${item.source} ${item.type} ${item.amount} ${item.paymentMethod || ""} ${item.vehicleNumber || ""} ${item.customerName || ""} ${item.itemName || ""}`
              .toLowerCase();

          const matchesSearch =
            searchData.includes(
              searchText
                .trim()
                .toLowerCase()
            );

          const matchesType =
            selectedType ===
              "All" ||
            item.type ===
              selectedType;

          const matchesDate =
            !selectedDate ||
            itemDate ===
              selectedDate;

          return (
            matchesSearch &&
            matchesType &&
            matchesDate
          );
        }
      );
    }, [
      cashFlow,
      searchText,
      selectedType,
      selectedDate,
    ]);

  // ======================================================
  // TOTAL REVENUE
  // FROM FILTERED REAL RECORDS
  // ======================================================

  const totalRevenue =
    useMemo(() => {
      return filteredCashFlow
        .filter(
          (item) =>
            item.type ===
              "Revenue" &&
            item.amount > 0
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.amount || 0
            ),
          0
        );
    }, [filteredCashFlow]);

  // ======================================================
  // TOTAL EXPENSES
  // ======================================================

  const totalExpenses =
    useMemo(() => {
      return filteredCashFlow
        .filter(
          (item) =>
            item.type ===
              "Expense" ||
            item.amount < 0
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            Math.abs(
              Number(
                item.amount || 0
              )
            ),
          0
        );
    }, [filteredCashFlow]);

  // ======================================================
  // NET PROFIT
  // ======================================================

  const netProfit =
    totalRevenue -
    totalExpenses;

  // ======================================================
  // EXPORT CSV
  // ======================================================

  const exportCSV =
    () => {
      const headers = [
        "Date",
        "Source",
        "Type",
        "Amount",
      ];

      const rows =
        filteredCashFlow.map(
          (item) => [
            formatDate(
              item.date
            ),

            item.source,

            item.type,

            formatLKR(
              item.amount
            ),
          ]
        );

      const csvContent = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(
              (field) =>
                `"${String(
                  field ?? ""
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\n");

      const blob =
        new Blob(
          [csvContent],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `profit_loss_${
          garageName
            .replace(
              /\s+/g,
              "_"
            )
            .toLowerCase()
        }.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setDownloaded(true);

      setTimeout(
        () =>
          setDownloaded(
            false
          ),
        2500
      );
    };

  // ======================================================
  // RESET FILTERS
  // ======================================================

  const resetFilters =
    () => {
      setSearchText("");
      setSelectedType(
        "All"
      );
      setSelectedDate("");
    };

  // ======================================================
  // LAST UPDATED TIME
  // ======================================================

  const lastUpdatedText =
    lastUpdated
      ? lastUpdated.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute:
              "2-digit",
            second:
              "2-digit",
          }
        )
      : "--";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">

      <style>{`
        .date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 0;
          position: absolute;
          pointer-events: none;
        }

        .date-input::-webkit-inner-spin-button,
        .date-input::-webkit-clear-button {
          display: none;
        }
      `}</style>

      {/* ==================================================
          DOWNLOAD SUCCESS MESSAGE
      ================================================== */}

      {downloaded && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl">

          <CheckCircle
            size={16}
          />

          Report Downloaded Successfully

        </div>
      )}

      {/* ==================================================
          TOP HEADER
      ================================================== */}

      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">

        {/* SEARCH */}

        <div className="flex items-center gap-3 w-full md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu
              size={20}
            />
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
              placeholder="Search financial records..."
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

        <div className="flex items-center justify-between md:justify-end gap-5">

          <div className="h-8 w-px bg-white/10" />

          <div>

            <p className="text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="text-[10px] text-indigo-400 uppercase">
              {garageName}
            </p>

          </div>

          <div className="w-9 h-9 rounded-xl border border-indigo-400 flex items-center justify-center text-xs overflow-hidden bg-[#0b0b12]">
            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              ownerInitials
            )}
          </div>

        </div>

      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="p-4 md:p-8">

        {/* OWNER ERROR */}

        {ownerError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <div className="flex items-center gap-2">

              <AlertCircle
                size={16}
              />

              {ownerError}

            </div>

          </div>
        )}

        {/* FINANCIAL ERROR */}

        {financialError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-2">

                <AlertCircle
                  size={16}
                />

                {financialError}

              </div>

              <button
                type="button"
                onClick={() =>
                  loadProfitLoss(
                    garageId,
                    true
                  )
                }
                className="text-xs font-bold text-white hover:text-red-200"
              >
                RETRY
              </button>

            </div>

          </div>
        )}

        {/* PAGE HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">

          <div>

            <h1 className="text-3xl md:text-4xl font-black mb-4">

              DAILY PROFIT & LOSS ANALYTICS , SPARE PARTS

            </h1>

            <p className="text-gray-400 text-sm md:text-base max-w-3xl">

              Read-only financial overview generated from assistance payments and garage stock purchases.

            </p>

          </div>

          {/* LIVE REFRESH */}

          <div className="flex items-center gap-3">

            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">

              <p className="text-[9px] font-bold tracking-widest text-emerald-400">

                LIVE · 5 SEC

              </p>

              <p className="text-[8px] text-gray-500 mt-0.5">

                {lastUpdatedText}

              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                loadProfitLoss(
                  garageId,
                  true
                )
              }
              disabled={
                financialLoading ||
                !Number.isInteger(
                  garageId
                )
              }
              className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
              aria-label="Refresh profit and loss"
            >

              <RefreshCw
                size={16}
                className={
                  financialLoading
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

          </div>

        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* TOTAL REVENUE */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">

            <div className="flex justify-between mb-6">

              <div>

                <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">

                  Total Revenue

                </p>

                <p className="text-[9px] text-gray-600 mt-2">

                  Received payments

                </p>

              </div>

              <TrendingUp
                size={15}
                className="text-emerald-400"
              />

            </div>

            <h2 className="text-3xl font-mono font-black">

              {financialLoading &&
              !profitLossData
                ? "LKR --"
                : formatLKR(
                    totalRevenue
                  )}

            </h2>

          </div>

          {/* TOTAL EXPENSES */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">

            <div className="flex justify-between mb-6">

              <div>

                <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">

                  Total Expenses

                </p>

                <p className="text-[9px] text-gray-600 mt-2">

                  Stock purchase cost

                </p>

              </div>

              <ReceiptText
                size={15}
                className="text-red-300"
              />

            </div>

            <h2 className="text-3xl font-mono font-black">

              {financialLoading &&
              !profitLossData
                ? "LKR --"
                : formatLKR(
                    totalExpenses
                  )}

            </h2>

          </div>

          {/* NET PROFIT */}

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">

            <div className="flex justify-between mb-6">

              <div>

                <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">

                  Net Profit

                </p>

                <p className="text-[9px] text-gray-600 mt-2">

                  Revenue - Expenses

                </p>

              </div>

              <BadgeDollarSign
                size={15}
                className={
                  netProfit >= 0
                    ? "text-emerald-400"
                    : "text-red-300"
                }
              />

            </div>

            <h2
              className={`text-3xl font-mono font-black ${
                netProfit >= 0
                  ? "text-emerald-400"
                  : "text-red-300"
              }`}
            >

              {financialLoading &&
              !profitLossData
                ? "LKR --"
                : formatLKR(
                    netProfit
                  )}

            </h2>

          </div>

        </div>

        {/* ==================================================
            CASH FLOW TABLE
        ================================================== */}

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden max-w-5xl mx-auto">

          {/* TABLE HEADER */}

          <div className="p-5 border-b border-white/10 flex flex-col gap-5">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold">

                  Auto Submitted Cash Flow Records

                </h2>

                <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-2">

                  REAL-TIME OWNER VIEW OF FINANCIAL DATA

                </p>

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15 text-red-300 px-4 py-2 rounded text-[11px] font-bold"
                >

                  <RotateCcw
                    size={13}
                  />

                  RESET FILTERS

                </button>

                <button
                  type="button"
                  onClick={
                    exportCSV
                  }
                  disabled={
                    filteredCashFlow.length ===
                    0
                  }
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-gray-300 px-4 py-2 rounded text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >

                  <Download
                    size={13}
                  />

                  EXPORT CSV

                </button>

              </div>

            </div>

            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* RECORD TYPE */}

              <div>

                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">

                  Record Type

                </p>

                <div className="flex items-center gap-3 bg-[#111118] border border-white/10 rounded-xl px-4 py-3">

                  <Filter
                    size={16}
                    className="text-cyan-400"
                  />

                  <select
                    value={
                      selectedType
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedType(
                        event.target
                          .value
                      )
                    }
                    className="w-full bg-transparent outline-none text-sm text-white"
                  >

                    <option
                      value="All"
                      className="bg-[#191923]"
                    >
                      All
                    </option>

                    <option
                      value="Revenue"
                      className="bg-[#191923]"
                    >
                      Revenue
                    </option>

                    <option
                      value="Expense"
                      className="bg-[#191923]"
                    >
                      Expense
                    </option>

                  </select>

                </div>

              </div>

              {/* DATE */}

              <div>

                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">

                  Select Date

                </p>

                <div className="relative flex items-center gap-3 bg-[#111118] border border-white/10 rounded-xl px-4 py-3">

                  <button
                    type="button"
                    onClick={
                      openDatePicker
                    }
                    className="text-cyan-400 hover:text-cyan-300 transition shrink-0"
                  >

                    <CalendarDays
                      size={16}
                    />

                  </button>

                  <input
                    ref={
                      dateInputRef
                    }
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedDate(
                        event.target
                          .value
                      )
                    }
                    onClick={
                      openDatePicker
                    }
                    className="date-input w-full bg-transparent outline-none text-sm text-white cursor-pointer"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="overflow-x-auto">

            <table className="w-[850px] md:w-full text-left">

              <thead className="text-gray-500 text-[10px] tracking-[0.25em] uppercase">

                <tr className="border-b border-white/10">

                  <th className="px-6 py-5">
                    Date
                  </th>

                  <th className="px-6 py-5">
                    Source
                  </th>

                  <th className="px-4 py-5">
                    Type
                  </th>

                  <th className="px-4 py-5">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* LOADING */}

                {financialLoading &&
                !profitLossData ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="py-12 text-center text-gray-500 text-xs tracking-widest"
                    >

                      <div className="flex items-center justify-center gap-2">

                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />

                        LOADING FINANCIAL RECORDS...

                      </div>

                    </td>

                  </tr>

                ) : filteredCashFlow.length >
                  0 ? (

                  filteredCashFlow.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          item.id ||
                          `${item.type}-${index}`
                        }
                        className="border-b border-white/5 hover:bg-white/[0.03] transition"
                      >

                        {/* DATE */}

                        <td className="px-6 py-6 text-sm font-mono text-gray-400">

                          {formatDate(
                            item.date
                          ) ||
                            "N/A"}

                        </td>

                        {/* SOURCE */}

                        <td className="px-6 py-6 text-sm text-gray-200">

                          <div>

                            <p>
                              {item.source}
                            </p>

                            {item.type ===
                              "Revenue" &&
                              item.paymentMethod && (

                              <p className="text-[9px] text-gray-600 mt-1">

                                Payment:{" "}
                                {
                                  item.paymentMethod
                                }

                              </p>

                            )}

                            {item.type ===
                              "Expense" &&
                              item.batchNumber && (

                              <p className="text-[9px] text-gray-600 mt-1">

                                Batch:{" "}
                                {
                                  item.batchNumber
                                }

                              </p>

                            )}

                          </div>

                        </td>

                        {/* TYPE */}

                        <td className="px-4 py-6">

                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                              item.type ===
                              "Revenue"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-300"
                            }`}
                          >

                            {item.type}

                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td
                          className={`px-4 py-6 text-sm font-mono ${
                            item.amount <
                            0
                              ? "text-red-300"
                              : "text-emerald-300"
                          }`}
                        >

                          {formatLKR(
                            item.amount
                          )}

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="4"
                      className="py-12 text-center text-gray-500 text-xs tracking-widest"
                    >

                      NO FINANCIAL RECORDS FOUND

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              TABLE FOOTER
          ================================================== */}

          <div className="border-t border-white/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

            <p className="text-[10px] text-gray-600">

              Showing{" "}
              {
                filteredCashFlow.length
              }{" "}
              of{" "}
              {cashFlow.length}{" "}
              financial records

            </p>

            <p className="text-[10px] text-gray-600">

              Garage ID:{" "}
              {Number.isInteger(
                garageId
              )
                ? garageId
                : "-"}

            </p>

          </div>

        </div>

      </main>

    </div>
  );
}