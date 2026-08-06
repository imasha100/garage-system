import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Wallet,
  CreditCard,
  CheckCircle,
  X,
  Receipt,
  List,
  Download,
  History,
  Eye,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import jsPDF from "jspdf";

const API_BASE = "http://localhost:5000";

const CounterReceipt = ({
  openSidebar,
  searchQuery = "",
}) => {
  // ======================================================
  // COMPLETED JOBS FOR BILLING
  // ======================================================

  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  // ======================================================
  // PAYMENT
  // ======================================================

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);

  const [cardType, setCardType] = useState("Visa");
  const [cashReceived, setCashReceived] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ======================================================
  // DATABASE PAYMENT HISTORY
  // ======================================================

  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // ======================================================
  // ADD BILL ITEM
  // ======================================================

  const [showAddItem, setShowAddItem] = useState(false);

  // ======================================================
  // GARAGE STOCK
  // ======================================================

  const [stockItems, setStockItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState("");

  const [selectedStockBatchId, setSelectedStockBatchId] =
    useState("");

  const [itemQuantity, setItemQuantity] = useState("1");

  // ======================================================
  // DELETE BILL ITEM
  // ======================================================

  const [deleteItemIndex, setDeleteItemIndex] =
    useState(null);

  // ======================================================
  // LOGGED-IN GARAGE
  // ======================================================

  const staffUser = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("staffUser");

      return stored
        ? JSON.parse(stored)
        : null;
    } catch (error) {
      console.error(
        "Unable to read staff user:",
        error
      );

      return null;
    }
  }, []);

  const garageId = Number(
    staffUser?.garageId ??
      staffUser?.garage?.garageId ??
      staffUser?.garage_garage_id ??
      1
  );

  // ======================================================
  // LOAD COMPLETED JOBS FOR BILLING
  // ======================================================

  const loadCompletedJobsForBilling = async () => {
    try {
      setJobsLoading(true);
      setJobsError("");

      if (
        !Number.isInteger(garageId) ||
        garageId <= 0
      ) {
        throw new Error(
          "Garage could not be identified."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/service-jobs/garage/${garageId}/completed-for-billing`
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to load completed jobs."
        );
      }

      const completedJobs =
        Array.isArray(result.jobs)
          ? result.jobs
          : [];

      const mappedTokens =
        completedJobs.map((job) => ({
          id:
            job.ticketNumber ||
            `JOB-${job.jobId}`,

          jobId: job.jobId,
          requestId: job.requestId,

          customerId:
            job.customerId ?? null,

          name:
            job.customerName ||
            "Customer",

          contactNumber:
            job.contactNumber ||
            job.customerContact ||
            "",

          vehicleId:
            job.vehicleId ?? null,

          vehicleNumber:
            job.vehicleNumber || "",

          vehicleType:
            job.vehicleType || "",

          garageId:
            job.garageId || garageId,

          jobStatus:
            job.jobStatus ||
            "COMPLETED",

          completedDate:
            job.completedDate || null,

          completedTime:
            job.completedTime || null,

          amount: 0,
          items: [],
          history: [],
        }));

      setTokens(mappedTokens);

      setSelectedToken((currentToken) => {
        if (mappedTokens.length === 0) {
          return null;
        }

        if (currentToken) {
          const existingToken =
            mappedTokens.find(
              (token) =>
                token.jobId ===
                currentToken.jobId
            );

          if (existingToken) {
            return {
              ...existingToken,
              items:
                currentToken.items || [],
              amount:
                currentToken.amount || 0,
              history:
                currentToken.history || [],
            };
          }
        }

        return mappedTokens[0];
      });
    } catch (error) {
      console.error(
        "Load completed billing jobs error:",
        error
      );

      setTokens([]);
      setSelectedToken(null);

      setJobsError(
        error.message ||
          "Unable to load completed jobs."
      );
    } finally {
      setJobsLoading(false);
    }
  };

  // ======================================================
  // LOAD COMPLETED JOBS WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    loadCompletedJobsForBilling();
  }, [garageId]);

  // ======================================================
  // LOAD GARAGE STOCK
  // ======================================================

  const loadGarageStock = async () => {
    try {
      setStockLoading(true);
      setStockError("");

      if (
        !Number.isInteger(garageId) ||
        garageId <= 0
      ) {
        throw new Error(
          "Garage could not be identified."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/stock/garage/${garageId}`
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to load garage stock."
        );
      }

      const availableItems =
        Array.isArray(result.items)
          ? result.items.filter(
              (item) =>
                Number(
                  item.availableQuantity
                ) > 0
            )
          : [];

      setStockItems(availableItems);
    } catch (error) {
      console.error(
        "Load garage stock error:",
        error
      );

      setStockItems([]);

      setStockError(
        error.message ||
          "Unable to load garage stock."
      );
    } finally {
      setStockLoading(false);
    }
  };

  // ======================================================
  // OPEN ADD ITEM MODAL
  // ======================================================

  const openAddItemModal = async () => {
    if (!selectedToken) {
      return;
    }

    setSelectedStockBatchId("");
    setItemQuantity("1");
    setStockError("");
    setShowAddItem(true);

    await loadGarageStock();
  };

  // ======================================================
  // SELECTED STOCK ITEM
  // ======================================================

  const selectedStockItem = useMemo(
    () =>
      stockItems.find(
        (item) =>
          String(item.batchId) ===
          String(selectedStockBatchId)
      ) || null,
    [
      stockItems,
      selectedStockBatchId,
    ]
  );

  const selectedUnitPrice = Number(
    selectedStockItem?.sellingPrice || 0
  );

  const selectedAvailableQuantity =
    Number(
      selectedStockItem?.availableQuantity ||
        0
    );

  const selectedQuantity = Number(
    itemQuantity || 0
  );

  const selectedLineTotal =
    selectedUnitPrice *
    selectedQuantity;

  // ======================================================
  // SEARCH / FILTER COMPLETED JOBS
  // ======================================================

  const filteredTokens = useMemo(() => {
    const query = String(
      searchQuery || ""
    )
      .trim()
      .toLowerCase();

    if (!query) {
      return tokens;
    }

    return tokens.filter((token) =>
      [
        token.id,
        token.name,
        token.contactNumber,
        token.vehicleNumber,
        token.vehicleType,
        token.jobStatus,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [tokens, searchQuery]);

  // ======================================================
  // SEARCH AUTO SELECT
  // ======================================================

  useEffect(() => {
    const query = String(
      searchQuery || ""
    ).trim();

    if (
      !query ||
      filteredTokens.length === 0
    ) {
      return;
    }

    const selectedStillMatches =
      filteredTokens.some(
        (token) =>
          token.id ===
          selectedToken?.id
      );

    if (!selectedStillMatches) {
      setSelectedToken(
        filteredTokens[0]
      );
    }
  }, [
    filteredTokens,
    searchQuery,
    selectedToken?.id,
  ]);

  // ======================================================
  // UPDATE SELECTED TOKEN
  // ======================================================

  const updateSelectedToken = (
    updatedToken
  ) => {
    if (!updatedToken) {
      return;
    }

    setSelectedToken(updatedToken);

    setTokens((prev) =>
      prev.map((token) =>
        token.id === updatedToken.id
          ? updatedToken
          : token
      )
    );
  };

  // ======================================================
  // SELECT ANOTHER TOKEN
  // ======================================================

  const handleSelectToken = (
    token
  ) => {
    setSelectedToken(token);
    setShowDropdown(false);

    setPaymentMethod(null);
    setCashReceived("");
    setTransactionRef("");
    setViewReceipt(null);
  };

  // ======================================================
  // ADD STOCK ITEM TO BILL
  // ======================================================

  const handleAddBillItem = () => {
    if (!selectedToken) {
      setStockError(
        "Please select a completed job first."
      );

      return;
    }

    if (!selectedStockItem) {
      setStockError(
        "Please select a stock item."
      );

      return;
    }

    const quantity = Number(
      itemQuantity
    );

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setStockError(
        "Quantity must be a whole number greater than 0."
      );

      return;
    }

    const existingItem =
      selectedToken.items.find(
        (item) =>
          Number(item.batchId) ===
          Number(
            selectedStockItem.batchId
          )
      );

    const existingQuantity =
      Number(
        existingItem?.quantity || 0
      );

    const combinedQuantity =
      existingQuantity + quantity;

    if (
      combinedQuantity >
      Number(
        selectedStockItem.availableQuantity
      )
    ) {
      setStockError(
        `Only ${selectedStockItem.availableQuantity} unit(s) are available for ${selectedStockItem.itemName}.`
      );

      return;
    }

    const unitPrice = Number(
      selectedStockItem.sellingPrice
    );

    let updatedItems;

    if (existingItem) {
      updatedItems =
        selectedToken.items.map(
          (item) => {
            if (
              Number(item.batchId) !==
              Number(
                selectedStockItem.batchId
              )
            ) {
              return item;
            }

            const updatedLineTotal =
              unitPrice *
              combinedQuantity;

            return {
              ...item,

              quantity:
                combinedQuantity,

              unitPrice,

              lineTotal:
                updatedLineTotal,

              price:
                updatedLineTotal,
            };
          }
        );
    } else {
      const lineTotal =
        unitPrice * quantity;

      const newItem = {
        name:
          selectedStockItem.itemName,

        batchId:
          selectedStockItem.batchId,

        batchNumber:
          selectedStockItem.batchNumber,

        stockId:
          selectedStockItem.stockId,

        itemId:
          selectedStockItem.itemId,

        quantity,

        unitPrice,

        lineTotal,

        price: lineTotal,

        availableQuantity:
          selectedStockItem.availableQuantity,
      };

      updatedItems = [
        ...selectedToken.items,
        newItem,
      ];
    }

    const newTotal =
      updatedItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.lineTotal ??
              item.price ??
              0
          ),
        0
      );

    const updatedToken = {
      ...selectedToken,

      items: updatedItems,

      amount: newTotal,
    };

    updateSelectedToken(
      updatedToken
    );

    setSelectedStockBatchId("");
    setItemQuantity("1");
    setStockError("");
    setShowAddItem(false);
  };

  // ======================================================
  // DELETE BILL ITEM
  // ======================================================

  const requestRemoveBillItem = (
    index
  ) => {
    setDeleteItemIndex(index);
  };

  const cancelRemoveBillItem = () => {
    setDeleteItemIndex(null);
  };

  const confirmRemoveBillItem =
    () => {
      if (
        deleteItemIndex === null ||
        !selectedToken
      ) {
        return;
      }

      const updatedItems =
        selectedToken.items.filter(
          (_, index) =>
            index !==
            deleteItemIndex
        );

      const newTotal =
        updatedItems.reduce(
          (sum, item) =>
            sum +
            Number(
              item.lineTotal ??
                item.price ??
                0
            ),
          0
        );

      const updatedToken = {
        ...selectedToken,

        items: updatedItems,

        amount: newTotal,
      };

      updateSelectedToken(
        updatedToken
      );

      setDeleteItemIndex(null);
    };

  // ======================================================
  // PAYMENT METHOD
  // ======================================================

  const handleMethodSelect = (
    method
  ) => {
    if (!selectedToken) {
      return;
    }

    if (
      selectedToken.items.length === 0
    ) {
      alert(
        "Please add at least one bill item first."
      );

      return;
    }

    setPaymentMethod(method);
    setCashReceived("");
    setTransactionRef("");
    setPaymentError("");
    setShowModal(true);
  };

  // ======================================================
  // PAYMENT CONFIRM
  // ======================================================

  const handlePaymentConfirm = async () => {
    if (!selectedToken || paymentLoading) {
      return;
    }

    setPaymentError("");

    if (
      selectedToken.items.length === 0
    ) {
      setPaymentError(
        "Please add bill items first."
      );

      return;
    }

    if (
      selectedToken.amount <= 0
    ) {
      setPaymentError(
        "Bill total must be greater than zero."
      );

      return;
    }

    if (
      paymentMethod === "Cash" &&
      Number(cashReceived) <
        selectedToken.amount
    ) {
      setPaymentError(
        "Cash received is less than the bill total."
      );

      return;
    }

    if (
      paymentMethod === "POS" &&
      !transactionRef.trim()
    ) {
      setPaymentError(
        "Please enter the transaction reference."
      );

      return;
    }

    try {
      setPaymentLoading(true);

      const response = await fetch(
        `${API_BASE}/api/invoices/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: selectedToken.jobId,
            paymentMethod,
            taxAmount: 0,
            discountAmount: 0,
            items: selectedToken.items.map(
              (item) => ({
                batchId: item.batchId,
                quantity: item.quantity,
              })
            ),
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to complete payment."
        );
      }

      const paidAmount = Number(
        result.invoice?.finalAmount ??
          result.payment?.amountPaid ??
          selectedToken.amount
      );

      const receiptRef =
        paymentMethod === "POS"
          ? transactionRef.trim()
          : `PAY-${
              result.payment?.paymentId ||
              Date.now()
            }`;

      const newHistory = {
        date:
          result.invoice?.invoiceDate ||
          new Date()
            .toISOString()
            .split("T")[0],

        ref: receiptRef,

        total: paidAmount,

        paymentMethod,

        cardType:
          paymentMethod === "POS"
            ? cardType
            : null,

        invoiceId:
          result.invoice?.invoiceId ??
          null,

        paymentId:
          result.payment?.paymentId ??
          null,

        items: selectedToken.items.map(
          (item) => ({
            ...item,
          })
        ),
      };

      const updatedToken = {
        ...selectedToken,

        amount: paidAmount,

        history: [
          newHistory,
          ...(selectedToken.history || []),
        ],
      };

      updateSelectedToken(
        updatedToken
      );

      // Refresh stock so the latest available quantities
      // are shown after payment has reduced stock in MySQL.
      await loadGarageStock();

      setShowModal(false);
      setShowSuccess(true);

      setCashReceived("");
      setTransactionRef("");
      setPaymentError("");
    } catch (error) {
      console.error(
        "Invoice checkout error:",
        error
      );

      setPaymentError(
        error.message ||
          "Unable to complete payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================================
  // LOAD DATABASE PAYMENT HISTORY
  // GET /api/invoices/garage/:garageId/history
  // ======================================================

  const loadInvoiceHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      if (!Number.isInteger(garageId) || garageId <= 0) {
        throw new Error("Garage could not be identified.");
      }

      const response = await fetch(
        `${API_BASE}/api/invoices/garage/${garageId}/history`
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "Unable to load payment history."
        );
      }

      const databaseHistory = Array.isArray(result.history)
        ? result.history
        : [];

      const mappedHistory = databaseHistory.map((record) => ({
        invoiceId: record.invoiceId ?? null,
        paymentId: record.paymentId ?? null,
        jobId: record.jobId ?? null,
        requestId: record.requestId ?? null,

        ticketNumber:
          record.ticketNumber ||
          `JOB-${record.jobId || ""}`,

        customerName:
          record.customerName || "Customer",

        contactNumber:
          record.contactNumber || "",

        vehicleNumber:
          record.vehicleNumber || "",

        vehicleType:
          record.vehicleType || "",

        date: record.paymentDate
          ? String(record.paymentDate).split("T")[0]
          : record.invoiceDate
          ? String(record.invoiceDate).split("T")[0]
          : "",

        time: record.paymentTime || "",

        ref: record.paymentId
          ? `PAY-${record.paymentId}`
          : `INV-${record.invoiceId}`,

        total: Number(
          record.amountPaid ??
            record.finalAmount ??
            0
        ),

        paymentMethod:
          record.paymentMethod || "",

        items: Array.isArray(record.items)
          ? record.items.map((item) => ({
              invoiceItemId:
                item.invoiceItemId ?? null,

              name:
                item.itemName || "Item",

              batchId:
                item.stockBatchId ?? null,

              quantity:
                Number(item.quantity || 0),

              unitPrice:
                Number(item.unitPrice || 0),

              lineTotal:
                Number(item.lineTotal || 0),

              price:
                Number(item.lineTotal || 0),
            }))
          : [],
      }));

      setHistoryRecords(mappedHistory);
    } catch (error) {
      console.error(
        "Load invoice history error:",
        error
      );

      setHistoryRecords([]);

      setHistoryError(
        error.message ||
          "Unable to load payment history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setViewReceipt(null);
    setHistoryError("");
    setShowHistory(true);

    await loadInvoiceHistory();
  };

  // ======================================================
  // DOWNLOAD RECEIPT
  // ======================================================

  const handleDownload = (
    historyItem
  ) => {
    if (!historyItem) {
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Official Receipt",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Customer: ${
        historyItem.customerName ||
        selectedToken?.name ||
        "Customer"
      }`,
      20,
      30
    );

    doc.text(
      `Ticket: ${
        historyItem.ticketNumber ||
        selectedToken?.id ||
        "-"
      }`,
      20,
      40
    );

    const receiptVehicle =
      historyItem.vehicleNumber ||
      selectedToken?.vehicleNumber ||
      "";

    if (receiptVehicle) {
      doc.text(
        `Vehicle: ${receiptVehicle}`,
        20,
        50
      );
    }

    doc.text(
      `Reference: ${historyItem.ref || "-"}`,
      20,
      60
    );

    doc.text(
      `Payment: ${
        historyItem.paymentMethod ||
        "-"
      }`,
      20,
      70
    );

    doc.text(
      `Total Paid: LKR ${Number(
        historyItem.total || 0
      ).toFixed(2)}`,
      20,
      80
    );

    let y = 95;

    const receiptItems = Array.isArray(
      historyItem.items
    )
      ? historyItem.items
      : [];

    receiptItems.forEach((item) => {
      const quantityText = item.quantity
        ? ` x${item.quantity}`
        : "";

      const itemTotal = Number(
        item.lineTotal ??
          item.price ??
          0
      );

      doc.text(
        `${item.name}${quantityText} - LKR ${itemTotal.toFixed(
          2
        )}`,
        20,
        y
      );

      y += 10;
    });

    doc.save(
      `Receipt_${
        historyItem.ref ||
        historyItem.invoiceId ||
        Date.now()
      }.pdf`
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="h-[100dvh] min-h-0 bg-[#050608] text-white font-sans flex flex-col overflow-hidden">
      <div
        className="flex-1 min-h-0 overflow-y-scroll overscroll-contain p-2.5 sm:p-4 lg:p-6 pb-24"
        style={{
          scrollbarGutter: "stable",
        }}
      >

        <div className="w-full max-w-2xl mx-auto bg-[#15191f] border border-[#2b313d] lg:border-2 lg:border-blue-500 rounded-2xl lg:rounded-xl p-4 sm:p-5 lg:p-6 shadow-2xl flex flex-col mb-20">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">

            <div className="flex items-center gap-3 min-w-0">

              <div className="bg-[#1a1f26] p-2.5 rounded-xl shrink-0">
                <Receipt
                  className="text-[#52f0ac] w-7 h-7 lg:w-10 lg:h-10"
                />
              </div>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
                COUNTER RECEIPT VALIDATION
              </h1>

            </div>

            <button
              type="button"
              onClick={handleOpenHistory}
              className="flex items-center justify-center gap-2 text-[11px] lg:text-xs text-[#52f0ac] border border-[#52f0ac] px-3 py-2 rounded-lg hover:bg-[#52f0ac]/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <History size={16} />
              VIEW HISTORY
            </button>

          </div>

          {/* ==================================================
              JOB LOADING / ERROR
          ================================================== */}

          {jobsLoading && (
            <div className="mb-4 rounded-lg border border-[#2b313d] bg-[#0b0e14] p-3 text-center text-xs text-[#8b949e]">
              Loading completed jobs...
            </div>
          )}

          {jobsError && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
              {jobsError}
            </div>
          )}

          {/* ==================================================
              TOKEN SELECT
          ================================================== */}

          <div className="mb-5 relative">

            <label className="text-[10px] lg:text-xs text-[#6e7681] uppercase font-bold mb-2 block tracking-wider">
              Select Completed Job
            </label>

            <div
              onClick={() => {
                if (
                  !jobsLoading &&
                  tokens.length > 0
                ) {
                  setShowDropdown(
                    !showDropdown
                  );
                }
              }}
              className={`w-full bg-[#0b0e14] border border-[#2b313d] rounded-xl p-3 flex justify-between items-center gap-2 transition-all ${
                tokens.length > 0
                  ? "cursor-pointer hover:border-[#52f0ac]"
                  : "cursor-not-allowed opacity-70"
              }`}
            >

              <span className="text-[#52f0ac] font-mono text-sm sm:text-base truncate">

                {jobsLoading
                  ? "Loading completed jobs..."
                  : selectedToken
                  ? `${selectedToken.id} (${selectedToken.name})`
                  : "No completed jobs available"}

              </span>

              <ChevronDown
                size={20}
                className="text-[#6e7681] shrink-0"
              />

            </div>

            {showDropdown &&
              tokens.length > 0 && (

                <div className="absolute w-full mt-2 bg-[#1a1f26] border border-[#2b313d] rounded-lg z-20 shadow-xl max-h-[250px] overflow-y-auto">

                  {filteredTokens.map(
                    (token) => (

                      <div
                        key={token.jobId}
                        onClick={() =>
                          handleSelectToken(
                            token
                          )
                        }
                        className="p-3.5 hover:bg-[#2b313d] cursor-pointer border-b border-[#0b0e14]"
                      >

                        <div className="flex justify-between gap-3">

                          <div className="min-w-0">

                            <p className="font-bold text-sm truncate">
                              {token.id} -{" "}
                              {token.name}
                            </p>

                            <p className="mt-1 text-[11px] text-[#8b949e] truncate">
                              {token.vehicleNumber ||
                                "No vehicle number"}

                              {token.vehicleType
                                ? ` • ${token.vehicleType}`
                                : ""}
                            </p>

                          </div>

                          <span className="text-[10px] text-[#52f0ac] font-bold shrink-0">
                            COMPLETED
                          </span>

                        </div>

                      </div>
                    )
                  )}

                  {filteredTokens.length ===
                    0 && (

                    <div className="p-4 text-center text-sm text-[#6e7681]">
                      No matching completed
                      jobs found.
                    </div>

                  )}

                </div>

              )}

          </div>

          {/* ==================================================
              SELECTED JOB INFORMATION
          ================================================== */}

          {selectedToken && (

            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="bg-[#0b0e14] border border-[#2b313d] rounded-lg p-3">

                <p className="text-[10px] text-[#6e7681] uppercase font-bold">
                  Customer
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedToken.name}
                </p>

                {selectedToken.contactNumber && (
                  <p className="text-[11px] text-[#8b949e] mt-1">
                    {
                      selectedToken.contactNumber
                    }
                  </p>
                )}

              </div>

              <div className="bg-[#0b0e14] border border-[#2b313d] rounded-lg p-3">

                <p className="text-[10px] text-[#6e7681] uppercase font-bold">
                  Vehicle
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedToken.vehicleNumber ||
                    "N/A"}
                </p>

                {selectedToken.vehicleType && (
                  <p className="text-[11px] text-[#8b949e] mt-1">
                    {
                      selectedToken.vehicleType
                    }
                  </p>
                )}

              </div>

            </div>

          )}

          {/* ==================================================
              RECEIPT BREAKDOWN
          ================================================== */}

          <div className="mb-5">

            <div className="flex items-center justify-between gap-3 mb-3">

              <h3 className="text-[10px] lg:text-xs text-[#6e7681] uppercase font-bold flex items-center gap-2 tracking-wider">

                <List size={16} />

                Receipt Breakdown

              </h3>

              <button
                type="button"
                disabled={!selectedToken}
                onClick={
                  openAddItemModal
                }
                className="flex items-center justify-center gap-1.5 bg-[#52f0ac] text-black px-3 py-2 rounded-lg text-[10px] lg:text-xs font-bold hover:bg-[#3edc98] disabled:opacity-40 disabled:cursor-not-allowed"
              >

                <Plus size={16} />

                ADD BILL ITEM

              </button>

            </div>

            <div className="bg-[#0b0e14] rounded-xl p-3 sm:p-4 border border-[#2b313d] max-h-[220px] lg:h-[180px] overflow-y-auto">

              {!selectedToken ? (

                <div className="h-full flex items-center justify-center text-center text-[#6e7681] text-sm">
                  No completed job selected.
                </div>

              ) : selectedToken.items.length ===
                0 ? (

                <div className="h-full flex items-center justify-center text-center text-[#6e7681] text-sm">
                  No bill items added.
                </div>

              ) : (

                selectedToken.items.map(
                  (item, idx) => (

                    <div
                      key={`${item.batchId}-${idx}`}
                      className="flex justify-between items-center py-3 text-sm border-b border-[#1a1f26] last:border-0 gap-3"
                    >

                      <div className="min-w-0">

                        <span className="block truncate font-medium">
                          {item.name}
                        </span>

                        <span className="block mt-1 text-[10px] text-[#6e7681]">

                          Qty{" "}
                          {item.quantity}

                          {" × "}

                          LKR{" "}

                          {Number(
                            item.unitPrice
                          ).toFixed(2)}

                        </span>

                        {item.batchNumber && (
                          <span className="block mt-0.5 text-[10px] text-[#6e7681]">
                            Batch:{" "}
                            {
                              item.batchNumber
                            }
                          </span>
                        )}

                      </div>

                      <div className="flex items-center gap-3 shrink-0">

                        <span className="font-mono font-bold text-xs sm:text-sm">

                          LKR{" "}

                          {Number(
                            item.lineTotal ??
                              item.price ??
                              0
                          ).toFixed(2)}

                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            requestRemoveBillItem(
                              idx
                            )
                          }
                          className="text-red-400 hover:text-red-300"
                        >

                          <Trash2
                            size={18}
                          />

                        </button>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

          {/* ==================================================
              NET TOTAL
          ================================================== */}

          <div className="flex flex-row justify-between items-center py-4 border-y border-[#1a1f26] mb-5 gap-3">

            <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#52f0ac] tracking-wider">
              NET_DUE_TOTAL
            </span>

            <span className="font-mono text-xl sm:text-2xl font-bold text-[#52f0ac] text-right">

              LKR{" "}

              {Number(
                selectedToken?.amount || 0
              ).toFixed(2)}

            </span>

          </div>

          {/* ==================================================
              PAYMENT METHODS
          ================================================== */}

          <div className="grid grid-cols-2 gap-3 lg:gap-4">

            <button
              type="button"
              disabled={
                !selectedToken ||
                selectedToken.items.length ===
                  0
              }
              onClick={() =>
                handleMethodSelect(
                  "Cash"
                )
              }
              className="border border-[#b0c8e9] rounded-xl p-4 min-h-[105px] flex flex-col items-center justify-center gap-2 hover:border-[#52f0ac] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >

              <Wallet size={28} />

              <span className="text-xs uppercase font-bold">
                Cash
              </span>

            </button>

            <button
              type="button"
              disabled={
                !selectedToken ||
                selectedToken.items.length ===
                  0
              }
              onClick={() =>
                handleMethodSelect(
                  "POS"
                )
              }
              className="border border-[#b0c8e9] rounded-xl p-4 min-h-[105px] flex flex-col items-center justify-center gap-2 hover:border-[#52f0ac] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >

              <CreditCard
                size={28}
              />

              <span className="text-xs uppercase font-bold text-center">
                POS Terminal
              </span>

            </button>

          </div>

        </div>

        {/* ====================================================
            DELETE ITEM CONFIRMATION
        ==================================================== */}

        {deleteItemIndex !== null &&
          selectedToken &&
          selectedToken.items[
            deleteItemIndex
          ] && (

            <div
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4"
              onClick={
                cancelRemoveBillItem
              }
            >

              <div
                className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-red-500/40 bg-[#15191f] p-5 sm:p-6 shadow-2xl"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">

                  <AlertTriangle
                    size={25}
                  />

                </div>

                <h2 className="text-center text-base sm:text-lg font-bold">
                  Delete bill item?
                </h2>

                <p className="mt-2 text-center text-xs sm:text-sm text-[#8b949e]">

                  Are you sure you want
                  to remove{" "}

                  <span className="font-semibold text-white">

                    {
                      selectedToken
                        .items[
                        deleteItemIndex
                      ].name
                    }

                  </span>

                  {" "}from this bill?

                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={
                      cancelRemoveBillItem
                    }
                    className="rounded-xl border border-[#2b313d] bg-[#20252d] py-3 text-xs font-bold"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={
                      confirmRemoveBillItem
                    }
                    className="rounded-xl bg-red-500 py-3 text-xs font-bold"
                  >
                    DELETE ITEM
                  </button>

                </div>

              </div>

            </div>

          )}

        {/* ====================================================
            ADD BILL ITEM MODAL
        ==================================================== */}

        {showAddItem &&
          selectedToken && (

            <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">

              <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#52f0ac] max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-6">

                  <div>

                    <h2 className="text-lg font-bold uppercase">
                      Add Bill Item
                    </h2>

                    <p className="mt-1 text-xs text-[#6e7681]">
                      Select an
                      available spare
                      part from garage
                      stock.
                    </p>

                  </div>

                  <X
                    className="cursor-pointer shrink-0"
                    onClick={() => {
                      setShowAddItem(
                        false
                      );

                      setSelectedStockBatchId(
                        ""
                      );

                      setItemQuantity(
                        "1"
                      );

                      setStockError(
                        ""
                      );
                    }}
                  />

                </div>

                {stockError && (

                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                    {stockError}
                  </div>

                )}

                <div className="space-y-4">

                  <div>

                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#6e7681]">
                      Stock Item
                    </label>

                    <select
                      value={
                        selectedStockBatchId
                      }
                      onChange={(
                        event
                      ) => {

                        setSelectedStockBatchId(
                          event.target
                            .value
                        );

                        setItemQuantity(
                          "1"
                        );

                        setStockError(
                          ""
                        );
                      }}
                      disabled={
                        stockLoading
                      }
                      className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d] focus:outline-none focus:border-[#52f0ac] disabled:opacity-50"
                    >

                      <option value="">

                        {stockLoading
                          ? "Loading stock..."
                          : "Select stock item"}

                      </option>

                      {stockItems.map(
                        (item) => (

                          <option
                            key={
                              item.batchId
                            }
                            value={
                              item.batchId
                            }
                          >

                            {
                              item.itemName
                            }

                            {" - "}

                            {
                              item.batchNumber
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {selectedStockItem && (
                    <>

                      <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-lg border border-[#2b313d] bg-[#0b0e14] p-3">

                          <p className="text-[10px] uppercase tracking-wider text-[#6e7681]">
                            Selling Price
                          </p>

                          <p className="mt-1 font-mono font-bold text-[#52f0ac]">

                            LKR{" "}

                            {selectedUnitPrice.toFixed(
                              2
                            )}

                          </p>

                        </div>

                        <div className="rounded-lg border border-[#2b313d] bg-[#0b0e14] p-3">

                          <p className="text-[10px] uppercase tracking-wider text-[#6e7681]">
                            Available
                          </p>

                          <p className="mt-1 font-mono font-bold">

                            {
                              selectedAvailableQuantity
                            }

                          </p>

                        </div>

                      </div>

                      <div>

                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#6e7681]">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={
                            selectedAvailableQuantity
                          }
                          step="1"
                          value={
                            itemQuantity
                          }
                          onChange={(
                            event
                          ) => {

                            setItemQuantity(
                              event.target
                                .value
                            );

                            setStockError(
                              ""
                            );
                          }}
                          className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d] focus:outline-none focus:border-[#52f0ac]"
                        />

                      </div>

                      <div className="rounded-lg border border-[#52f0ac]/40 bg-[#52f0ac]/10 p-4">

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                            Line Total
                          </span>

                          <span className="font-mono text-lg font-bold text-[#52f0ac]">

                            LKR{" "}

                            {Number.isFinite(
                              selectedLineTotal
                            )
                              ? selectedLineTotal.toFixed(
                                  2
                                )
                              : "0.00"}

                          </span>

                        </div>

                      </div>

                    </>
                  )}

                  {!stockLoading &&
                    stockItems.length ===
                      0 &&
                    !stockError && (

                      <div className="rounded-lg border border-[#2b313d] bg-[#0b0e14] p-4 text-center text-xs text-[#6e7681]">
                        No available
                        stock items were
                        found.
                      </div>

                    )}

                </div>

                <button
                  type="button"
                  onClick={
                    handleAddBillItem
                  }
                  disabled={
                    stockLoading ||
                    !selectedStockItem ||
                    !Number.isInteger(
                      Number(
                        itemQuantity
                      )
                    ) ||
                    Number(
                      itemQuantity
                    ) <= 0 ||
                    Number(
                      itemQuantity
                    ) >
                      selectedAvailableQuantity
                  }
                  className="w-full mt-6 bg-[#52f0ac] text-black font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ADD TO BILL
                </button>

              </div>

            </div>

          )}

        {/* ====================================================
            PAYMENT MODAL
        ==================================================== */}

        {showModal &&
          selectedToken && (

            <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">

              <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#2b313d] max-w-sm w-full shadow-2xl">

                <div className="flex justify-between mb-6">

                  <h2 className="text-lg font-bold uppercase">
                    {paymentMethod}{" "}
                    Details
                  </h2>

                  <X
                    className="cursor-pointer"
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                  />

                </div>

                <div className="mb-5 bg-[#0b0e14] border border-[#2b313d] rounded-lg p-3">

                  <p className="text-[10px] text-[#6e7681] uppercase font-bold">
                    Amount Due
                  </p>

                  <p className="mt-1 text-xl font-mono font-bold text-[#52f0ac]">

                    LKR{" "}

                    {Number(
                      selectedToken.amount
                    ).toFixed(2)}

                  </p>

                </div>

                {paymentMethod ===
                "Cash" ? (

                  <div className="space-y-4">

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter Cash"
                      value={
                        cashReceived
                      }
                      className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d]"
                      onChange={(e) =>
                        setCashReceived(
                          e.target.value
                        )
                      }
                    />

                    <p className="text-sm">

                      Change:{" "}

                      <span className="text-[#52f0ac] font-mono">

                        LKR{" "}

                        {Math.max(
                          0,
                          Number(
                            cashReceived
                          ) -
                            selectedToken.amount
                        ).toFixed(2)}

                      </span>

                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    <input
                      type="text"
                      value={
                        transactionRef
                      }
                      onChange={(e) =>
                        setTransactionRef(
                          e.target.value
                        )
                      }
                      placeholder="Transaction Ref *"
                      className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d]"
                    />

                    <div className="grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setCardType(
                            "Visa"
                          )
                        }
                        className={`p-3 border rounded flex items-center justify-center gap-2 ${
                          cardType ===
                          "Visa"
                            ? "border-[#52f0ac] bg-[#1a2e26]"
                            : "border-[#2b313d]"
                        }`}
                      >

                        <CreditCard
                          size={18}
                        />

                        Visa

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCardType(
                            "Mastercard"
                          )
                        }
                        className={`p-3 border rounded flex items-center justify-center gap-2 ${
                          cardType ===
                          "Mastercard"
                            ? "border-[#52f0ac] bg-[#1a2e26]"
                            : "border-[#2b313d]"
                        }`}
                      >

                        <CreditCard
                          size={18}
                        />

                        Master

                      </button>

                    </div>

                  </div>

                )}

                {paymentError && (

                  <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                    {paymentError}
                  </div>

                )}

                <button
                  type="button"
                  onClick={
                    handlePaymentConfirm
                  }
                  disabled={paymentLoading}
                  className="w-full mt-6 bg-[#52f0ac] text-black font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading
                    ? "PROCESSING..."
                    : "CONFIRM"}
                </button>

              </div>

            </div>

          )}

        {/* ====================================================
            HISTORY MODAL - DATABASE DATA
        ==================================================== */}

        {showHistory && (

          <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">

            <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#2b313d] max-w-lg w-full max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h2 className="text-lg font-bold">
                    PAYMENT HISTORY
                  </h2>

                  <p className="mt-1 text-xs text-[#6e7681]">
                    Saved invoices and payments from the database.
                  </p>
                </div>

                <X
                  className="cursor-pointer shrink-0"
                  onClick={() => {
                    setShowHistory(false);
                    setViewReceipt(null);
                  }}
                />

              </div>

              {historyLoading && (

                <div className="rounded-lg border border-[#2b313d] bg-[#0b0e14] p-4 text-center text-sm text-[#8b949e]">
                  Loading payment history...
                </div>

              )}

              {historyError && !historyLoading && (

                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                  {historyError}
                </div>

              )}

              {!historyLoading &&
                !historyError &&
                historyRecords.length === 0 && (

                  <div className="rounded-lg border border-[#2b313d] bg-[#0b0e14] p-5 text-center text-sm text-[#6e7681]">
                    No payment history found.
                  </div>

                )}

              {!historyLoading &&
                !historyError &&
                historyRecords.length > 0 && (

                  <div className="space-y-3">

                    {historyRecords.map(
                      (historyItem) => (

                        <div
                          key={
                            historyItem.paymentId ||
                            historyItem.invoiceId
                          }
                          className="p-4 bg-[#0b0e14] rounded-lg border border-[#2b313d]"
                        >

                          <div className="flex justify-between gap-3">

                            <div className="min-w-0">

                              <p className="font-bold text-sm truncate">
                                {historyItem.ticketNumber}
                              </p>

                              <p className="mt-1 text-xs text-white truncate">
                                {historyItem.customerName}
                              </p>

                              <p className="mt-1 text-[11px] text-[#6e7681] truncate">
                                {historyItem.vehicleNumber || "No vehicle"}
                                {historyItem.vehicleType
                                  ? ` • ${historyItem.vehicleType}`
                                  : ""}
                              </p>

                              <p className="mt-1 text-[11px] text-[#6e7681]">
                                {historyItem.date}
                                {historyItem.time
                                  ? ` • ${historyItem.time}`
                                  : ""}
                                {historyItem.paymentMethod
                                  ? ` • ${historyItem.paymentMethod}`
                                  : ""}
                              </p>

                            </div>

                            <div className="shrink-0 text-right">

                              <p className="font-mono font-bold text-[#52f0ac] text-sm">
                                LKR{" "}
                                {Number(
                                  historyItem.total || 0
                                ).toFixed(2)}
                              </p>

                              <p className="mt-1 text-[10px] text-[#6e7681]">
                                {historyItem.ref}
                              </p>

                            </div>

                          </div>

                          <div className="mt-3 flex justify-end gap-2 border-t border-[#1a1f26] pt-3">

                            <button
                              type="button"
                              onClick={() =>
                                setViewReceipt(
                                  historyItem
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10"
                            >
                              <Eye size={16} />
                              VIEW
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  historyItem
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-[#52f0ac]/40 px-3 py-2 text-xs text-[#52f0ac] hover:bg-[#52f0ac]/10"
                            >
                              <Download size={16} />
                              PDF
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              <button
                type="button"
                onClick={() => {
                  setShowHistory(false);
                  setViewReceipt(null);
                }}
                className="w-full mt-6 bg-[#2b313d] py-2 rounded"
              >
                CLOSE
              </button>

            </div>

          </div>

        )}

        {/* ====================================================
            RECEIPT VIEW - DATABASE HISTORY
        ==================================================== */}

        {viewReceipt && (

          <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]">

            <div className="bg-white text-black p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">

              <h2 className="font-bold mb-4 text-center text-lg">
                OFFICIAL RECEIPT
              </h2>

              <div className="text-sm py-4 border-y border-gray-300 mb-4 space-y-1">

                <p>
                  Customer:{" "}
                  {viewReceipt.customerName ||
                    selectedToken?.name ||
                    "Customer"}
                </p>

                <p>
                  Ticket:{" "}
                  {viewReceipt.ticketNumber ||
                    selectedToken?.id ||
                    "-"}
                </p>

                {(viewReceipt.vehicleNumber ||
                  selectedToken?.vehicleNumber) && (
                  <p>
                    Vehicle:{" "}
                    {viewReceipt.vehicleNumber ||
                      selectedToken?.vehicleNumber}
                  </p>
                )}

                <p>
                  Ref: {viewReceipt.ref || "-"}
                </p>

                <p>
                  Date: {viewReceipt.date || "-"}
                </p>

                {viewReceipt.time && (
                  <p>
                    Time: {viewReceipt.time}
                  </p>
                )}

                <p>
                  Payment:{" "}
                  {viewReceipt.paymentMethod || "-"}
                </p>

              </div>

              <ul className="mb-4 text-sm space-y-2">

                {(viewReceipt.items || []).map(
                  (item, index) => (

                    <li
                      key={
                        item.invoiceItemId ||
                        `${item.batchId}-${index}`
                      }
                      className="flex justify-between gap-3"
                    >

                      <span>
                        {item.name}
                        {item.quantity
                          ? ` × ${item.quantity}`
                          : ""}
                      </span>

                      <span className="shrink-0 font-mono">
                        LKR{" "}
                        {Number(
                          item.lineTotal ??
                            item.price ??
                            0
                        ).toFixed(2)}
                      </span>

                    </li>

                  )
                )}

              </ul>

              <div className="text-right font-bold text-lg border-t pt-3">

                TOTAL: LKR{" "}

                {Number(
                  viewReceipt.total || 0
                ).toFixed(2)}

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewReceipt(null)
                }
                className="w-full mt-6 bg-black text-white py-2 rounded"
              >
                CLOSE
              </button>

            </div>

          </div>

        )}

        {/* ====================================================
            SUCCESS MODAL
        ==================================================== */}

        {showSuccess && (

          <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[70]">

            <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl text-center border border-[#52f0ac] shadow-2xl max-w-sm w-full">

              <CheckCircle
                className="mx-auto text-[#52f0ac] mb-4"
                size={50}
              />

              <h2 className="text-xl font-bold mb-2">
                Payment Successful!
              </h2>

              <p className="text-xs text-[#8b949e] mb-5">
                Receipt has been
                created successfully.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowSuccess(
                    false
                  )
                }
                className="bg-[#52f0ac] text-black w-full py-2 rounded font-bold"
              >
                CLOSE
              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  );
};

export default CounterReceipt;