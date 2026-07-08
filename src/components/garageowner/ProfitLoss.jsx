import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Menu,
  TrendingUp,
  ReceiptText,
  BadgeDollarSign,
  Download,
  Filter,
  RotateCcw,
  CheckCircle,
  CalendarDays,
} from "lucide-react";

export default function ProfitLoss({ toggleSidebar }) {
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const dateInputRef = useRef(null);

  const cashFlow = [
    {
      date: "2026-07-04",
      source: "Completed Repair Job - WP-CAS-1234",
      type: "Revenue",
      amount: 120000,
    },
    {
      date: "2026-07-04",
      source: "Spare Parts Sale - CP-CB-8890",
      type: "Revenue",
      amount: 125000,
    },
    {
      date: "2026-07-04",
      source: "Shop Utilities & Rent",
      type: "Expense",
      amount: -45000,
    },
    {
      date: "2026-07-04",
      source: "Labor Overrun Penalty - WP-KV-1122",
      type: "Expense",
      amount: -12000,
    },
    {
      date: "2026-07-05",
      source: "Completed Repair Job - CP-AB-7788",
      type: "Revenue",
      amount: 98000,
    },
    {
      date: "2026-07-05",
      source: "Diagnostic Service - WP-KD-4567",
      type: "Revenue",
      amount: 32000,
    },
    {
      date: "2026-07-05",
      source: "Parts Procurement",
      type: "Expense",
      amount: -28000,
    },
  ];

  const formatLKR = (value) => {
    const sign = value < 0 ? "-LKR " : "LKR ";
    return sign + Math.abs(value).toLocaleString("en-LK");
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.focus();
    }
  };

  const filteredCashFlow = cashFlow.filter((item) => {
    const matchesSearch = `${item.date} ${item.source} ${item.type} ${item.amount}`
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesDate = !selectedDate || item.date === selectedDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const totalRevenue = useMemo(
    () =>
      filteredCashFlow
        .filter((item) => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0),
    [filteredCashFlow]
  );

  const totalExpenses = useMemo(
    () =>
      filteredCashFlow
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0),
    [filteredCashFlow]
  );

  const netProfit = totalRevenue - totalExpenses;

  const exportCSV = () => {
    const headers = ["Date", "Source", "Type", "Amount"];

    const rows = filteredCashFlow.map((item) => [
      item.date,
      item.source,
      item.type,
      formatLKR(item.amount),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "garage_owner_profit_loss_report.csv";
    link.click();

    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedType("All");
    setSelectedDate("");
  };

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

      {downloaded && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl">
          <CheckCircle size={16} />
          Report Downloaded Successfully
        </div>
      )}

      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search size={15} className="text-gray-500 shrink-0" />

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search financial records..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />

            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-5">
          <Bell size={18} className="text-gray-300" />
          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-xs font-bold tracking-widest">Master Admin</p>
            <p className="text-[10px] text-indigo-400 uppercase">
              Owner Level
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl border border-indigo-400 flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4">
          DAILY PROFIT & LOSS ANALYTICS , SPARE PARTS
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-3xl mb-10">
          Read-only financial overview generated from assistance submissions and
          completed service jobs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Total Revenue
              </p>
              <TrendingUp size={15} className="text-emerald-400" />
            </div>

            <h2 className="text-3xl font-mono font-black">
              {formatLKR(totalRevenue)}
            </h2>

            
          </div>

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Total Expenses
              </p>
              <ReceiptText size={15} className="text-red-300" />
            </div>

            <h2 className="text-3xl font-mono font-black">
              {formatLKR(totalExpenses)}
            </h2>

            
          </div>

          <div className="bg-[#1c1c25] border border-white/10 rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em]">
                Net Profit
              </p>
              <BadgeDollarSign size={15} className="text-emerald-400" />
            </div>

            <h2
              className={`text-3xl font-mono font-black ${
                netProfit >= 0 ? "text-emerald-400" : "text-red-300"
              }`}
            >
              {formatLKR(netProfit)}
            </h2>

            
          </div>
        </div>

        <div className="bg-[#191923] border border-white/10 rounded-lg overflow-hidden max-w-5xl mx-auto">
          <div className="p-5 border-b border-white/10 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  Auto Submitted Cash Flow Records
                </h2>
                <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-2">
                  READ-ONLY OWNER VIEW OF FINANCIAL DATA
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15 text-red-300 px-4 py-2 rounded text-[11px] font-bold"
                >
                  <RotateCcw size={13} />
                  RESET FILTERS
                </button>

                <button
                  onClick={exportCSV}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-gray-300 px-4 py-2 rounded text-[11px] font-bold"
                >
                  <Download size={13} />
                  EXPORT CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Record Type
                </p>

                <div className="flex items-center gap-3 bg-[#111118] border border-white/10 rounded-xl px-4 py-3">
                  <Filter size={16} className="text-cyan-400" />

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-white"
                  >
                    <option className="bg-[#191923]">All</option>
                    <option className="bg-[#191923]">Revenue</option>
                    <option className="bg-[#191923]">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Select Date
                </p>

                <div className="relative flex items-center gap-3 bg-[#111118] border border-white/10 rounded-xl px-4 py-3">
                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="text-cyan-400 hover:text-cyan-300 transition shrink-0"
                  >
                    <CalendarDays size={16} />
                  </button>

                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onClick={openDatePicker}
                    className="date-input w-full bg-transparent outline-none text-sm text-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-[850px] md:w-full text-left">
              <thead className="text-gray-500 text-[10px] tracking-[0.25em] uppercase">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Source</th>
                  <th className="px-4 py-5">Type</th>
                  <th className="px-4 py-5">Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredCashFlow.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-6 text-sm font-mono text-gray-400">
                      {item.date}
                    </td>

                    <td className="px-6 py-6 text-sm text-gray-200">
                      {item.source}
                    </td>

                    <td className="px-4 py-6">
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          item.type === "Revenue"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-6 text-sm font-mono ${
                        item.amount < 0 ? "text-red-300" : "text-gray-300"
                      }`}
                    >
                      {formatLKR(item.amount)}
                    </td>
                  </tr>
                ))}

                {filteredCashFlow.length === 0 && (
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
        </div>
      </main>
    </div>
  );
}