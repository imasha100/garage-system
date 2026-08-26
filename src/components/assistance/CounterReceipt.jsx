import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  Download,
  Eye,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Receipt,
} from "lucide-react";

import jsPDF from "jspdf";

const API_BASE =
  "http://localhost:5000";

// ======================================================
// COUNTER RECEIPT
//
// NEW PAYMENT FLOW:
//
// 1. Technician completes job
// 2. Assistance adds bill items
// 3. Assistance clicks CREATE BILL
// 4. Invoice is created as UNPAID
// 5. Customer can see UNPAID invoice
// 6. Customer gives Cash / POS payment
// 7. Assistance confirms payment
// 8. Payment record is created
// 9. Customer invoice becomes PAID
// ======================================================

export default function CounterReceipt() {
  // ======================================================
  // GARAGE SESSION
  // ======================================================

  const garageId = useMemo(() => {
    try {
      const possibleKeys = [
        "garageId",
        "garage_id",
        "selectedGarageId",
      ];

      for (const key of possibleKeys) {
        const value =
          sessionStorage.getItem(key);

        if (
          value &&
          Number(value) > 0
        ) {
          return Number(value);
        }
      }

      const possibleObjects = [
        "assistanceUser",
        "staffUser",
        "loggedUser",
        "user",
      ];

      for (const key of possibleObjects) {
        const stored =
          sessionStorage.getItem(key);

        if (!stored) {
          continue;
        }

        const parsed =
          JSON.parse(stored);

        const value =
          parsed?.garageId ??
          parsed?.garage_id ??
          parsed?.garageGarageId ??
          parsed?.garage_garage_id;

        if (Number(value) > 0) {
          return Number(value);
        }
      }
    } catch (error) {
      console.error(
        "Unable to read garage session:",
        error
      );
    }

    return 1;
  }, []);

  // ======================================================
  // JOB / TOKEN STATE
  // ======================================================

  const [tokens, setTokens] =
    useState([]);

  const [selectedTokenId, setSelectedTokenId] =
    useState(null);

  const [jobsLoading, setJobsLoading] =
    useState(true);

  const [jobsError, setJobsError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  // ======================================================
  // STOCK
  // ======================================================

  const [garageStock, setGarageStock] =
    useState([]);

  const [stockLoading, setStockLoading] =
    useState(false);

  const [stockError, setStockError] =
    useState("");

  const [showAddItemModal, setShowAddItemModal] =
    useState(false);

  const [selectedStockItem, setSelectedStockItem] =
    useState(null);

  const [itemQuantity, setItemQuantity] =
    useState(1);

  const [deleteItemIndex, setDeleteItemIndex] =
    useState(null);

  // ======================================================
  // BILL CREATION
  // ======================================================

  const [billLoading, setBillLoading] =
    useState(false);

  const [billError, setBillError] =
    useState("");

  // ======================================================
  // PAYMENT
  // ======================================================

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [cashReceived, setCashReceived] =
    useState("");

  const [cardType, setCardType] =
    useState("VISA");

  const [transactionRef, setTransactionRef] =
    useState("");

  // ======================================================
  // PAYMENT HISTORY
  // ======================================================

  const [invoiceHistory, setInvoiceHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  const [viewReceipt, setViewReceipt] =
    useState(null);

  // ======================================================
  // SELECTED TOKEN
  // ======================================================

  const selectedToken =
    tokens.find(
      (token) =>
        token.id === selectedTokenId
    ) || null;

  // ======================================================
  // LOAD COMPLETED SERVICE JOBS
  // ======================================================

  const loadCompletedJobs =
    async () => {
      try {
        setJobsLoading(true);
        setJobsError("");

        const response = await fetch(
          `${API_BASE}/api/service-jobs/garage/${garageId}/completed-for-billing`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load completed service jobs."
          );
        }

        const jobs =
          Array.isArray(result.jobs)
            ? result.jobs
            : [];

        setTokens(
          (currentTokens) =>
            jobs.map((job) => {
              const jobId = Number(
                job.jobId ??
                  job.job_id
              );

              const currentToken =
                currentTokens.find(
                  (token) =>
                    Number(
                      token.jobId
                    ) === jobId
                );

              return {
                id: jobId,

                jobId,

                requestId:
                  job.requestId ??
                  job.request_id ??
                  null,

                customerId:
                  job.customerId ??
                  job.customer_id ??
                  null,

                customerName:
                  job.customerName ??
                  job.customer_name ??
                  "Customer",

                contactNumber:
                  job.contactNumber ??
                  job.contact_number ??
                  "",

                vehicleNumber:
                  job.vehicleNumber ??
                  job.vehicle_number ??
                  job.vehicleNum ??
                  job.vehicle_num ??
                  "",

                vehicleType:
                  job.vehicleType ??
                  job.vehicle_type ??
                  "Vehicle",

                requestType:
                  job.requestType ??
                  job.request_type ??
                  "",

                completedAt:
                  job.actualCompletionTime ??
                  job.actual_completion_time ??
                  null,

                amount:
                  currentToken?.amount ||
                  0,

                items:
                  currentToken?.items ||
                  [],

                history:
                  currentToken?.history ||
                  [],

                invoiceId:
                  currentToken?.invoiceId ||
                  null,

                invoiceStatus:
                  currentToken?.invoiceStatus ||
                  "DRAFT",

                paymentId:
                  currentToken?.paymentId ||
                  null,
              };
            })
        );

        if (
          jobs.length > 0 &&
          selectedTokenId === null
        ) {
          const firstJobId =
            Number(
              jobs[0].jobId ??
                jobs[0].job_id
            );

          setSelectedTokenId(
            firstJobId
          );
        }
      } catch (error) {
        console.error(
          "Load completed jobs error:",
          error
        );

        setJobsError(
          error.message ||
            "Unable to load completed jobs."
        );
      } finally {
        setJobsLoading(false);
      }
    };

  // ======================================================
  // LOAD GARAGE STOCK
  // ======================================================

  const loadGarageStock =
    async () => {
      try {
        setStockLoading(true);
        setStockError("");

        const response = await fetch(
          `${API_BASE}/api/stock/garage/${garageId}`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load garage stock."
          );
        }

        const stock =
          Array.isArray(result.stock)
            ? result.stock
            : Array.isArray(result.items)
            ? result.items
            : [];

        setGarageStock(stock);
      } catch (error) {
        console.error(
          "Load stock error:",
          error
        );

        setStockError(
          error.message ||
            "Unable to load stock."
        );
      } finally {
        setStockLoading(false);
      }
    };

  // ======================================================
  // LOAD INVOICE HISTORY
  // ======================================================

  const loadInvoiceHistory =
    async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await fetch(
          `${API_BASE}/api/invoices/garage/${garageId}/history`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load invoice history."
          );
        }

        const history =
          Array.isArray(result.history)
            ? result.history
            : [];

        const mappedHistory =
          history.map(
            (record) => ({
              invoiceId:
                record.invoiceId,

              paymentId:
                record.paymentId,

              date:
                record.paymentDate ||
                record.invoiceDate,

              time:
                record.paymentTime ||
                "",

              ref:
                record.paymentId
                  ? `PAY-${record.paymentId}`
                  : `INV-${record.invoiceId}`,

              total:
                Number(
                  record.finalAmount ||
                    0
                ),

              amountPaid:
                Number(
                  record.amountPaid ||
                    0
                ),

              customerName:
                record.customerName ||
                "Customer",

              contactNumber:
                record.contactNumber ||
                "",

              vehicleNumber:
                record.vehicleNumber ||
                "",

              vehicleType:
                record.vehicleType ||
                "",

              paymentMethod:
                record.paymentMethod ||
                "",

              paymentStatus:
                record.paymentStatus ||
                (record.paymentId
                  ? "PAID"
                  : "UNPAID"),

              items:
                Array.isArray(
                  record.items
                )
                  ? record.items
                  : [],
            })
          );

        setInvoiceHistory(
          mappedHistory
        );
      } catch (error) {
        console.error(
          "Load invoice history error:",
          error
        );

        setHistoryError(
          error.message ||
            "Unable to load invoice history."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadCompletedJobs();
    loadGarageStock();
    loadInvoiceHistory();
  }, [garageId]);

  // ======================================================
  // AUTO REFRESH HISTORY
  // ======================================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadInvoiceHistory();
      }, 5000);

    return () =>
      clearInterval(interval);
  }, [garageId]);

  // ======================================================
  // UPDATE SELECTED TOKEN
  // ======================================================

  const updateSelectedToken = (
    updatedToken
  ) => {
    setTokens((currentTokens) =>
      currentTokens.map((token) =>
        token.id ===
        updatedToken.id
          ? updatedToken
          : token
      )
    );
  };

  // ======================================================
  // SELECT TOKEN
  // ======================================================

  const handleSelectToken = (
    tokenId
  ) => {
    setSelectedTokenId(tokenId);

    setPaymentMethod("");
    setCashReceived("");
    setCardType("VISA");
    setTransactionRef("");

    setViewReceipt(null);

    setBillError("");
    setPaymentError("");
    setStockError("");
  };

  // ======================================================
  // FILTER TOKENS
  // ======================================================

  const filteredTokens =
    tokens.filter((token) => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        String(
          token.customerName || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          token.vehicleNumber || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          token.contactNumber || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  // ======================================================
  // OPEN ADD ITEM MODAL
  // ======================================================

  const openAddItemModal =
    async () => {
      if (!selectedToken) {
        return;
      }

      if (
        selectedToken.invoiceId
      ) {
        setStockError(
          "This invoice has already been created. Bill items can no longer be changed."
        );

        return;
      }

      await loadGarageStock();

      setSelectedStockItem(null);
      setItemQuantity(1);
      setStockError("");

      setShowAddItemModal(true);
    };

  // ======================================================
  // NORMALIZE STOCK BATCHES
  // ======================================================

  const availableStockBatches =
    useMemo(() => {
      const batches = [];

      garageStock.forEach(
        (stockItem) => {
          const itemName =
            stockItem.itemName ??
            stockItem.item_name ??
            "Item";

          const itemId =
            stockItem.itemId ??
            stockItem.item_id ??
            null;

          const stockId =
            stockItem.stockId ??
            stockItem.stock_id ??
            null;

          const directBatchId =
            stockItem.batchId ??
            stockItem.batch_id;

          if (directBatchId) {
            batches.push({
              itemId,
              stockId,

              batchId:
                Number(
                  directBatchId
                ),

              batchNumber:
                stockItem.batchNumber ??
                stockItem.batch_num ??
                "",

              itemName,

              sellingPrice:
                Number(
                  stockItem.sellingPrice ??
                    stockItem.selling_price ??
                    0
                ),

              availableQuantity:
                Number(
                  stockItem.availableQuantity ??
                    stockItem.available_quantity ??
                    0
                ),
            });
          }

          const nestedBatches =
            Array.isArray(
              stockItem.batches
            )
              ? stockItem.batches
              : [];

          nestedBatches.forEach(
            (batch) => {
              batches.push({
                itemId,
                stockId,

                batchId:
                  Number(
                    batch.batchId ??
                      batch.batch_id
                  ),

                batchNumber:
                  batch.batchNumber ??
                  batch.batch_num ??
                  "",

                itemName,

                sellingPrice:
                  Number(
                    batch.sellingPrice ??
                      batch.selling_price ??
                      0
                  ),

                availableQuantity:
                  Number(
                    batch.availableQuantity ??
                      batch.available_quantity ??
                      0
                  ),
              });
            }
          );
        }
      );

      return batches.filter(
        (batch) =>
          Number(batch.batchId) >
            0 &&
          Number(
            batch.availableQuantity
          ) > 0
      );
    }, [garageStock]);

  // ======================================================
  // ADD BILL ITEM
  // ======================================================

  const handleAddBillItem = () => {
    if (
      !selectedToken ||
      !selectedStockItem
    ) {
      setStockError(
        "Please select a stock item."
      );

      return;
    }

    const quantity =
      Number(itemQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setStockError(
        "Quantity must be a whole number greater than zero."
      );

      return;
    }

    if (
      quantity >
      Number(
        selectedStockItem.availableQuantity
      )
    ) {
      setStockError(
        `Only ${selectedStockItem.availableQuantity} unit(s) are available.`
      );

      return;
    }

    const existingItemIndex =
      selectedToken.items.findIndex(
        (item) =>
          Number(item.batchId) ===
          Number(
            selectedStockItem.batchId
          )
      );

    let updatedItems;

    if (
      existingItemIndex >= 0
    ) {
      updatedItems =
        selectedToken.items.map(
          (item, index) => {
            if (
              index !==
              existingItemIndex
            ) {
              return item;
            }

            const newQuantity =
              Number(
                item.quantity || 0
              ) + quantity;

            if (
              newQuantity >
              Number(
                selectedStockItem.availableQuantity
              )
            ) {
              setStockError(
                `Only ${selectedStockItem.availableQuantity} unit(s) are available in this batch.`
              );

              return item;
            }

            return {
              ...item,

              quantity:
                newQuantity,

              lineTotal:
                newQuantity *
                Number(
                  item.unitPrice ||
                    0
                ),
            };
          }
        );
    } else {
      const unitPrice =
        Number(
          selectedStockItem.sellingPrice ||
            0
        );

      updatedItems = [
        ...selectedToken.items,

        {
          itemId:
            selectedStockItem.itemId,

          stockId:
            selectedStockItem.stockId,

          batchId:
            selectedStockItem.batchId,

          batchNumber:
            selectedStockItem.batchNumber,

          itemName:
            selectedStockItem.itemName,

          quantity,

          unitPrice,

          lineTotal:
            quantity * unitPrice,
        },
      ];
    }

    const newAmount =
      updatedItems.reduce(
        (total, item) =>
          total +
          Number(
            item.lineTotal || 0
          ),
        0
      );

    updateSelectedToken({
      ...selectedToken,

      items: updatedItems,

      amount:
        newAmount,
    });

    setShowAddItemModal(false);

    setSelectedStockItem(null);
    setItemQuantity(1);
    setStockError("");
  };

  // ======================================================
  // REMOVE BILL ITEM
  // ======================================================

  const requestRemoveBillItem = (
    index
  ) => {
    if (
      selectedToken?.invoiceId
    ) {
      setBillError(
        "This invoice has already been created. Bill items can no longer be changed."
      );

      return;
    }

    setDeleteItemIndex(index);
  };

  const confirmRemoveBillItem =
    () => {
      if (
        !selectedToken ||
        deleteItemIndex === null
      ) {
        return;
      }

      const updatedItems =
        selectedToken.items.filter(
          (_, index) =>
            index !==
            deleteItemIndex
        );

      const newAmount =
        updatedItems.reduce(
          (total, item) =>
            total +
            Number(
              item.lineTotal || 0
            ),
          0
        );

      updateSelectedToken({
        ...selectedToken,

        items:
          updatedItems,

        amount:
          newAmount,
      });

      setDeleteItemIndex(null);
    };

  // ======================================================
  // CREATE BILL
  //
  // IMPORTANT:
  // This creates invoice only.
  // Payment is NOT created here.
  // ======================================================

  const handleCreateBill =
    async () => {
      if (
        !selectedToken ||
        billLoading
      ) {
        return;
      }

      setBillError("");

      if (
        selectedToken.invoiceId
      ) {
        setBillError(
          "An invoice has already been created for this completed job."
        );

        return;
      }

      if (
        !Array.isArray(
          selectedToken.items
        ) ||
        selectedToken.items
          .length === 0
      ) {
        setBillError(
          "Please add at least one bill item first."
        );

        return;
      }

      if (
        Number(
          selectedToken.amount ||
            0
        ) <= 0
      ) {
        setBillError(
          "Bill total must be greater than zero."
        );

        return;
      }

      try {
        setBillLoading(true);

        const response =
          await fetch(
            `${API_BASE}/api/invoices/checkout`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                jobId:
                  selectedToken.jobId,

                taxAmount: 0,

                discountAmount: 0,

                items:
                  selectedToken.items.map(
                    (item) => ({
                      batchId:
                        item.batchId,

                      quantity:
                        item.quantity,
                    })
                  ),
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
              "Unable to create the invoice."
          );
        }

        const invoiceId =
          Number(
            result.invoice
              ?.invoiceId
          );

        if (
          !Number.isInteger(
            invoiceId
          ) ||
          invoiceId <= 0
        ) {
          throw new Error(
            "Invoice was created but a valid invoice ID was not returned."
          );
        }

        const finalAmount =
          Number(
            result.invoice
              ?.finalAmount ??
              selectedToken.amount
          );

        updateSelectedToken({
          ...selectedToken,

          invoiceId,

          invoiceStatus:
            "UNPAID",

          paymentId: null,

          amount:
            finalAmount,
        });

        // Invoice creation reduces stock.
        // Refresh stock after bill creation.
        await loadGarageStock();

        // Refresh history so UNPAID invoice appears.
        await loadInvoiceHistory();

        setBillError("");
      } catch (error) {
        console.error(
          "Create invoice error:",
          error
        );

        setBillError(
          error.message ||
            "Unable to create invoice."
        );
      } finally {
        setBillLoading(false);
      }
    };

  // ======================================================
  // SELECT PAYMENT METHOD
  // ======================================================

  const handleMethodSelect = (
    method
  ) => {
    if (!selectedToken) {
      return;
    }

    if (
      !selectedToken.invoiceId ||
      selectedToken.invoiceStatus !==
        "UNPAID"
    ) {
      alert(
        "Please create the bill first."
      );

      return;
    }

    setPaymentMethod(method);

    setPaymentError("");
    setCashReceived("");
    setTransactionRef("");

    if (method === "POS") {
      setCardType("VISA");
    }

    setShowModal(true);
  };

  // ======================================================
  // CASH CHANGE
  // ======================================================

  const cashChange =
    paymentMethod === "Cash"
      ? Math.max(
          0,
          Number(
            cashReceived || 0
          ) -
            Number(
              selectedToken?.amount ||
                0
            )
        )
      : 0;

  // ======================================================
  // CONFIRM PAYMENT
  // ======================================================

  const handlePaymentConfirm =
    async () => {
      if (
        !selectedToken ||
        paymentLoading
      ) {
        return;
      }

      setPaymentError("");

      const invoiceId =
        Number(
          selectedToken.invoiceId
        );

      if (
        !Number.isInteger(
          invoiceId
        ) ||
        invoiceId <= 0
      ) {
        setPaymentError(
          "Please create the bill before confirming payment."
        );

        return;
      }

      if (
        selectedToken.invoiceStatus ===
        "PAID"
      ) {
        setPaymentError(
          "This invoice has already been paid."
        );

        return;
      }

      if (
        paymentMethod === "Cash" &&
        Number(cashReceived) <
          Number(
            selectedToken.amount ||
              0
          )
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

        const response =
          await fetch(
            `${API_BASE}/api/invoices/${invoiceId}/confirm-payment`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                paymentMethod,

                transactionRef:
                  paymentMethod ===
                  "POS"
                    ? transactionRef.trim()
                    : "",

                cardType:
                  paymentMethod ===
                  "POS"
                    ? cardType
                    : "",
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
              "Unable to confirm payment."
          );
        }

        const paidAmount =
          Number(
            result.payment
              ?.amountPaid ??
              result.invoice
                ?.finalAmount ??
              selectedToken.amount
          );

        updateSelectedToken({
          ...selectedToken,

          amount:
            paidAmount,

          invoiceStatus:
            "PAID",

          paymentId:
            result.payment
              ?.paymentId ??
            null,
        });

        setShowModal(false);
        setShowSuccess(true);

        setCashReceived("");
        setTransactionRef("");
        setPaymentError("");

        // Reload DB history after payment.
        await loadInvoiceHistory();
      } catch (error) {
        console.error(
          "Confirm invoice payment error:",
          error
        );

        setPaymentError(
          error.message ||
            "Unable to confirm payment."
        );
      } finally {
        setPaymentLoading(false);
      }
    };

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatMoney = (
    value
  ) =>
    Number(value || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return String(value)
      .split("T")[0];
  };

  // ======================================================
  // DOWNLOAD RECEIPT
  // ======================================================

  const handleDownload = (receipt) => {
    if (!receipt || receipt.paymentStatus !== "PAID") {
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const navy = [8, 18, 38];
    const blue = [37, 99, 235];
    const lightBlue = [239, 246, 255];
    const green = [5, 150, 105];
    const lightGreen = [236, 253, 245];
    const dark = [17, 24, 39];
    const gray = [107, 114, 128];
    const border = [226, 232, 240];
    const white = [255, 255, 255];

    const money = (value) =>
      Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const safeText = (value, fallback = "-") => {
      const output = String(value ?? "").trim();
      return output || fallback;
    };

    const invoiceNo = `INV-${safeText(receipt.invoiceId)}`;

    const paymentRef = receipt.paymentId
      ? `PAY-${receipt.paymentId}`
      : safeText(receipt.ref);

    const vehicleNo = safeText(receipt.vehicleNumber);
    const customerName = safeText(
      receipt.customerName,
      "Customer"
    );
    const paymentMethod = safeText(
      receipt.paymentMethod
    );
    const receiptDate = formatDate(receipt.date);
    const receiptTime = safeText(receipt.time);

    const totalPaid = Number(
      receipt.amountPaid ??
        receipt.total ??
        0
    );

    const items = Array.isArray(receipt.items)
      ? receipt.items
      : [];

    const drawHeader = () => {
      doc.setFillColor(...navy);

      doc.roundedRect(
        margin,
        12,
        contentWidth,
        42,
        4,
        4,
        "F"
      );

      doc.setFillColor(...blue);

      doc.circle(
        margin + 13,
        27,
        7,
        "F"
      );

      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);

      doc.text(
        "MT",
        margin + 13,
        29.2,
        {
          align: "center",
        }
      );

      doc.setFontSize(20);

      doc.text(
        "MAGIC TOUCH",
        margin + 25,
        26
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      doc.text(
        "AUTOMOBILE REPAIR & SERVICE CENTER",
        margin + 25,
        32
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.text(
        "OFFICIAL SERVICE RECEIPT",
        margin + 25,
        41
      );

      doc.setFillColor(...green);

      doc.roundedRect(
        pageWidth -
          margin -
          34,
        21,
        25,
        10,
        5,
        5,
        "F"
      );

      doc.setTextColor(...white);
      doc.setFontSize(9);

      doc.text(
        "PAID",
        pageWidth -
          margin -
          21.5,
        27.5,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7.5);

      doc.setTextColor(
        203,
        213,
        225
      );

      doc.text(
        "Thank you for trusting us with your vehicle",
        margin + 25,
        47
      );
    };

    drawHeader();

    let y = 62;

    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...border);

    doc.roundedRect(
      margin,
      y,
      87,
      18,
      3,
      3,
      "FD"
    );

    doc.roundedRect(
      margin + 92,
      y,
      contentWidth - 92,
      18,
      3,
      3,
      "FD"
    );

    doc.setTextColor(...gray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);

    doc.text(
      "INVOICE NUMBER",
      margin + 5,
      y + 6
    );

    doc.text(
      "PAYMENT REFERENCE",
      margin + 97,
      y + 6
    );

    doc.setTextColor(...blue);
    doc.setFontSize(11);

    doc.text(
      invoiceNo,
      margin + 5,
      y + 13
    );

    doc.text(
      paymentRef,
      margin + 97,
      y + 13
    );

    y += 25;

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
      "CUSTOMER & VEHICLE DETAILS",
      margin,
      y
    );

    y += 5;

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.setDrawColor(...border);

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      32,
      3,
      3,
      "FD"
    );

    const leftX = margin + 6;
    const rightX = margin + 100;

    doc.setFontSize(7);
    doc.setTextColor(...gray);

    doc.text(
      "CUSTOMER",
      leftX,
      y + 7
    );

    doc.text(
      "CONTACT",
      leftX,
      y + 20
    );

    doc.text(
      "VEHICLE",
      rightX,
      y + 7
    );

    doc.text(
      "VEHICLE TYPE",
      rightX,
      y + 20
    );

    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");

    const customerLine =
      doc.splitTextToSize(
        customerName,
        80
      )[0];

    doc.text(
      customerLine,
      leftX,
      y + 13
    );

    doc.text(
      vehicleNo,
      rightX,
      y + 13
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      safeText(
        receipt.contactNumber
      ),
      leftX,
      y + 26
    );

    doc.text(
      safeText(
        receipt.vehicleType,
        "Vehicle"
      ),
      rightX,
      y + 26
    );

    y += 41;

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
      "SERVICE / PARTS SUMMARY",
      margin,
      y
    );

    y += 5;

    const colItem = margin;
    const colQty = margin + 100;
    const colPrice = margin + 124;
    const colTotal = pageWidth - margin;

    const drawTableHeader = () => {
      doc.setFillColor(...blue);

      doc.roundedRect(
        margin,
        y,
        contentWidth,
        10,
        2,
        2,
        "F"
      );

      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);

      doc.text(
        "ITEM",
        colItem + 4,
        y + 6.5
      );

      doc.text(
        "QTY",
        colQty,
        y + 6.5,
        {
          align: "center",
        }
      );

      doc.text(
        "UNIT PRICE",
        colPrice,
        y + 6.5
      );

      doc.text(
        "AMOUNT",
        colTotal - 4,
        y + 6.5,
        {
          align: "right",
        }
      );

      y += 10;
    };

    drawTableHeader();

    if (items.length === 0) {
      doc.setFillColor(
        248,
        250,
        252
      );

      doc.rect(
        margin,
        y,
        contentWidth,
        14,
        "F"
      );

      doc.setTextColor(...gray);
      doc.setFont(
        "helvetica",
        "normal"
      );
      doc.setFontSize(8.5);

      doc.text(
        "No item details available.",
        margin + 4,
        y + 9
      );

      y += 14;
    } else {
      items.forEach(
        (item, index) => {
          if (
            y >
            pageHeight - 65
          ) {
            doc.addPage();
            y = 18;
            drawTableHeader();
          }

          const quantity =
            Number(
              item.quantity || 0
            );

          const unitPrice =
            Number(
              item.unitPrice || 0
            );

          const lineTotal =
            Number(
              item.lineTotal ??
                quantity *
                  unitPrice
            );

          if (
            index % 2 === 0
          ) {
            doc.setFillColor(
              248,
              250,
              252
            );

            doc.rect(
              margin,
              y,
              contentWidth,
              13,
              "F"
            );
          }

          doc.setDrawColor(...border);

          doc.line(
            margin,
            y + 13,
            pageWidth -
              margin,
            y + 13
          );

          doc.setTextColor(...dark);
          doc.setFont(
            "helvetica",
            "bold"
          );
          doc.setFontSize(8.5);

          const itemName =
            doc.splitTextToSize(
              safeText(
                item.itemName,
                "Item"
              ),
              88
            )[0];

          doc.text(
            itemName,
            colItem + 4,
            y + 8
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.text(
            String(
              quantity
            ),
            colQty,
            y + 8,
            {
              align: "center",
            }
          );

          doc.text(
            `LKR ${money(
              unitPrice
            )}`,
            colPrice,
            y + 8
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setTextColor(...green);

          doc.text(
            `LKR ${money(
              lineTotal
            )}`,
            colTotal - 4,
            y + 8,
            {
              align: "right",
            }
          );

          y += 13;
        }
      );
    }

    y += 8;

    if (
      y >
      pageHeight - 75
    ) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...lightGreen);

    doc.setDrawColor(
      167,
      243,
      208
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      25,
      4,
      4,
      "FD"
    );

    doc.setTextColor(...green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text(
      "TOTAL PAID",
      margin + 7,
      y + 9
    );

    doc.setFontSize(19);

    doc.text(
      `LKR ${money(
        totalPaid
      )}`,
      pageWidth -
        margin -
        7,
      y + 16,
      {
        align: "right",
      }
    );

    y += 33;

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
      "PAYMENT DETAILS",
      margin,
      y
    );

    y += 5;

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.setDrawColor(...border);

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      24,
      3,
      3,
      "FD"
    );

    doc.setTextColor(...gray);
    doc.setFontSize(7);

    doc.text(
      "METHOD",
      margin + 6,
      y + 7
    );

    doc.text(
      "DATE",
      margin + 68,
      y + 7
    );

    doc.text(
      "TIME",
      margin + 125,
      y + 7
    );

    doc.setTextColor(...dark);
    doc.setFontSize(9);

    doc.text(
      paymentMethod,
      margin + 6,
      y + 15
    );

    doc.text(
      receiptDate,
      margin + 68,
      y + 15
    );

    doc.text(
      receiptTime,
      margin + 125,
      y + 15
    );

    y += 33;

    if (
      y >
      pageHeight - 38
    ) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...navy);

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      27,
      4,
      4,
      "F"
    );

    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
      "Thank you for choosing Magic Touch!",
      pageWidth / 2,
      y + 10,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
      191,
      219,
      254
    );

    doc.text(
      "Quality Service  |  Trusted Care  |  Drive Safe",
      pageWidth / 2,
      y + 17,
      {
        align: "center",
      }
    );

    doc.setFontSize(6.5);

    doc.setTextColor(
      148,
      163,
      184
    );

    doc.text(
      "Computer-generated official service receipt",
      pageWidth / 2,
      y + 23,
      {
        align: "center",
      }
    );

    const cleanVehicle =
      vehicleNo.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );

    doc.save(
      `MagicTouch_Service_Receipt_${cleanVehicle}_${invoiceNo}.pdf`
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#070b10] text-white">
      <div className="mx-auto w-full max-w-[1600px] p-4 pb-28 md:p-6 md:pb-28 lg:p-8 lg:pb-28">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 border-b border-[#1f2937] pb-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
                <Receipt
                  size={20}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight md:text-2xl">
                  Counter Receipt
                </h1>

                <p className="mt-1 text-xs text-[#8b949e]">
                  Create customer bills and confirm counter payments
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              loadCompletedJobs();
              loadGarageStock();
              loadInvoiceHistory();
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-xs font-bold text-[#c9d1d9] transition hover:border-blue-500/40 hover:text-blue-400"
          >
            <RefreshCw
              size={15}
            />

            REFRESH
          </button>

        </div>

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[330px_minmax(0,1fr)_360px]">

          {/* ==================================================
              LEFT SIDE
              COMPLETED JOBS
          ================================================== */}

          <div className="rounded-xl border border-[#21262d] bg-[#0d1117]">

            <div className="border-b border-[#21262d] p-4">

              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8b949e]">
                Completed Jobs
              </p>

              <div className="relative mt-3">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]"
                />

                <input
                  type="text"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                  placeholder="Search customer / vehicle"
                  className="w-full rounded-lg border border-[#30363d] bg-[#070b10] py-2.5 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-[#484f58] focus:border-blue-500/60"
                />

              </div>

            </div>

            <div className="max-h-[690px] overflow-y-auto">

              {jobsLoading && (
                <div className="p-6 text-center text-xs text-[#8b949e]">
                  Loading completed jobs...
                </div>
              )}

              {!jobsLoading &&
                jobsError && (
                  <div className="m-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {jobsError}
                  </div>
                )}

              {!jobsLoading &&
                !jobsError &&
                filteredTokens.length ===
                  0 && (
                  <div className="p-6 text-center">

                    <Receipt
                      size={28}
                      className="mx-auto text-[#30363d]"
                    />

                    <p className="mt-3 text-xs text-[#6e7681]">
                      No completed jobs found.
                    </p>

                  </div>
                )}

              {!jobsLoading &&
                filteredTokens.map(
                  (token) => {
                    const active =
                      token.id ===
                      selectedTokenId;

                    return (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() =>
                          handleSelectToken(
                            token.id
                          )
                        }
                        className={`w-full border-b border-[#161b22] p-4 text-left transition ${
                          active
                            ? "bg-blue-500/10"
                            : "hover:bg-[#161b22]"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-white">
                              {token.customerName}
                            </p>

                            <p className="mt-1 font-mono text-xs font-bold text-blue-400">
                              {token.vehicleNumber ||
                                "NO VEHICLE"}
                            </p>

                          </div>

                          {token.invoiceStatus ===
                          "PAID" ? (
                            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-black text-emerald-400">
                              PAID
                            </span>
                          ) : token.invoiceStatus ===
                            "UNPAID" ? (
                            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-black text-amber-400">
                              UNPAID
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full border border-[#30363d] bg-[#161b22] px-2 py-1 text-[9px] font-black text-[#8b949e]">
                              DRAFT
                            </span>
                          )}

                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">

                          <div>
                            <p className="text-[#484f58]">
                              JOB
                            </p>

                            <p className="mt-0.5 font-mono text-[#c9d1d9]">
                              #{token.jobId}
                            </p>
                          </div>

                          <div>
                            <p className="text-[#484f58]">
                              TYPE
                            </p>

                            <p className="mt-0.5 truncate text-[#c9d1d9]">
                              {token.requestType ||
                                "-"}
                            </p>
                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

            </div>

          </div>

          {/* ==================================================
              CENTER
              BILL CREATION
          ================================================== */}

          <div className="rounded-xl border border-[#21262d] bg-[#0d1117]">

            {!selectedToken ? (
              <div className="flex min-h-[620px] items-center justify-center p-8">

                <div className="text-center">

                  <Receipt
                    size={40}
                    className="mx-auto text-[#30363d]"
                  />

                  <p className="mt-4 text-sm font-bold text-[#8b949e]">
                    Select a completed job
                  </p>

                  <p className="mt-1 text-xs text-[#484f58]">
                    Select a customer from the completed jobs list.
                  </p>

                </div>

              </div>
            ) : (
              <>
                {/* ============================================
                    CUSTOMER DETAILS
                ============================================ */}

                <div className="border-b border-[#21262d] p-5">

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">
                        Customer
                      </p>

                      <h2 className="mt-1 text-lg font-black">
                        {selectedToken.customerName}
                      </h2>

                      <p className="mt-1 text-xs text-[#8b949e]">
                        {selectedToken.contactNumber ||
                          "No contact number"}
                      </p>

                    </div>

                    <div className="rounded-lg border border-[#30363d] bg-[#070b10] px-4 py-3 md:text-right">

                      <p className="text-[9px] font-bold uppercase text-[#6e7681]">
                        Vehicle
                      </p>

                      <p className="mt-1 font-mono text-sm font-black text-blue-400">
                        {selectedToken.vehicleNumber ||
                          "-"}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8b949e]">
                        {selectedToken.vehicleType ||
                          "Vehicle"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ============================================
                    BILL ITEMS
                ============================================ */}

                <div className="p-5">

                  <div className="mb-4 flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8b949e]">
                        Bill Items
                      </p>

                      <p className="mt-1 text-[10px] text-[#484f58]">
                        Add parts or stock items used for this repair
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        openAddItemModal
                      }
                      disabled={
                        !selectedToken ||
                        Boolean(
                          selectedToken.invoiceId
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={15} />

                      ADD ITEM
                    </button>

                  </div>

                  {stockError && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      {stockError}
                    </div>
                  )}

                  {selectedToken.items.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-[#30363d] bg-[#070b10] p-8 text-center">

                      <Receipt
                        size={30}
                        className="mx-auto text-[#30363d]"
                      />

                      <p className="mt-3 text-xs font-bold text-[#8b949e]">
                        No bill items added
                      </p>

                      <p className="mt-1 text-[10px] text-[#484f58]">
                        Click ADD ITEM to select stock.
                      </p>

                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-[#21262d]">

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[650px]">

                          <thead className="bg-[#070b10]">

                            <tr className="text-left text-[9px] font-black uppercase tracking-wider text-[#6e7681]">

                              <th className="px-4 py-3">
                                Item
                              </th>

                              <th className="px-4 py-3">
                                Batch
                              </th>

                              <th className="px-4 py-3 text-center">
                                Qty
                              </th>

                              <th className="px-4 py-3 text-right">
                                Unit Price
                              </th>

                              <th className="px-4 py-3 text-right">
                                Total
                              </th>

                              <th className="w-12 px-3 py-3" />

                            </tr>

                          </thead>

                          <tbody>

                            {selectedToken.items.map(
                              (
                                item,
                                idx
                              ) => (
                                <tr
                                  key={`${item.batchId}-${idx}`}
                                  className="border-t border-[#161b22]"
                                >

                                  <td className="px-4 py-3">

                                    <p className="text-xs font-bold text-white">
                                      {item.itemName}
                                    </p>

                                  </td>

                                  <td className="px-4 py-3 font-mono text-[10px] text-[#8b949e]">
                                    {item.batchNumber ||
                                      `#${item.batchId}`}
                                  </td>

                                  <td className="px-4 py-3 text-center text-xs font-bold">
                                    {item.quantity}
                                  </td>

                                  <td className="px-4 py-3 text-right font-mono text-xs text-[#c9d1d9]">
                                    LKR{" "}
                                    {formatMoney(
                                      item.unitPrice
                                    )}
                                  </td>

                                  <td className="px-4 py-3 text-right font-mono text-xs font-bold text-[#52f0ac]">
                                    LKR{" "}
                                    {formatMoney(
                                      item.lineTotal
                                    )}
                                  </td>

                                  <td className="px-3 py-3">

                                    {!selectedToken.invoiceId && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          requestRemoveBillItem(
                                            idx
                                          )
                                        }
                                        className="text-red-400 transition hover:text-red-300"
                                      >
                                        <Trash2
                                          size={17}
                                        />
                                      </button>
                                    )}

                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>
                  )}

                  {/* ============================================
                      TOTAL
                  ============================================ */}

                  <div className="mt-5 rounded-xl border border-[#21262d] bg-[#070b10] p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6e7681]">
                          Net Total
                        </p>

                        <p className="mt-1 text-[10px] text-[#484f58]">
                          Final amount payable
                        </p>
                      </div>

                      <p className="font-mono text-xl font-black text-[#52f0ac] md:text-2xl">
                        LKR{" "}
                        {formatMoney(
                          selectedToken.amount
                        )}
                      </p>

                    </div>

                  </div>

                  {/* ============================================
                      CREATE BILL
                  ============================================ */}

                  {billError && (
                    <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                      {billError}
                    </div>
                  )}

                  {!selectedToken.invoiceId ? (
                    <button
                      type="button"
                      onClick={
                        handleCreateBill
                      }
                      disabled={
                        billLoading ||
                        selectedToken.items
                          .length === 0 ||
                        Number(
                          selectedToken.amount ||
                            0
                        ) <= 0
                      }
                      className="mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {billLoading
                        ? "CREATING BILL..."
                        : "CREATE BILL"}
                    </button>
                  ) : (
                    <div
                      className={`mt-4 rounded-xl border p-4 ${
                        selectedToken.invoiceStatus ===
                        "PAID"
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-amber-500/40 bg-amber-500/10"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <p className="text-[9px] font-black uppercase tracking-wider text-[#8b949e]">
                            Invoice
                          </p>

                          <p className="mt-1 font-mono text-sm font-black text-white">
                            INV-
                            {selectedToken.invoiceId}
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black ${
                            selectedToken.invoiceStatus ===
                            "PAID"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {
                            selectedToken.invoiceStatus
                          }
                        </span>

                      </div>

                      {selectedToken.invoiceStatus ===
                        "UNPAID" && (
                        <p className="mt-3 text-xs leading-5 text-amber-200/80">
                          Bill created successfully. The customer can now see this invoice as UNPAID. Confirm payment after receiving Cash or POS payment.
                        </p>
                      )}

                      {selectedToken.invoiceStatus ===
                        "PAID" && (
                        <p className="mt-3 text-xs leading-5 text-emerald-200/80">
                          Payment has been confirmed. The customer can now see this invoice as PAID and download the receipt.
                        </p>
                      )}

                    </div>
                  )}

                  {/* ============================================
                      PAYMENT METHODS
                  ============================================ */}

                  <div className="mt-5">

                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-[#6e7681]">
                      Payment Method
                    </p>

                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          handleMethodSelect(
                            "Cash"
                          )
                        }
                        disabled={
                          !selectedToken.invoiceId ||
                          selectedToken.invoiceStatus !==
                            "UNPAID"
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Banknote
                          size={18}
                        />

                        CASH
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleMethodSelect(
                            "POS"
                          )
                        }
                        disabled={
                          !selectedToken.invoiceId ||
                          selectedToken.invoiceStatus !==
                            "UNPAID"
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-3.5 text-xs font-black text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <CreditCard
                          size={18}
                        />

                        POS
                      </button>

                    </div>

                  </div>

                </div>
              </>
            )}

          </div>

          {/* ==================================================
              RIGHT SIDE
              INVOICE HISTORY
          ================================================== */}

          <div className="rounded-xl border border-[#21262d] bg-[#0d1117]">

            <div className="flex items-center justify-between border-b border-[#21262d] p-4">

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8b949e]">
                  Invoice History
                </p>

                <p className="mt-1 text-[10px] text-[#484f58]">
                  Paid and unpaid invoices
                </p>
              </div>

              {historyLoading && (
                <RefreshCw
                  size={15}
                  className="animate-spin text-blue-400"
                />
              )}

            </div>

            {historyError && (
              <div className="m-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {historyError}
              </div>
            )}

            <div className="max-h-[690px] overflow-y-auto p-3">

              {!historyLoading &&
                invoiceHistory.length ===
                  0 && (
                  <div className="p-6 text-center text-xs text-[#6e7681]">
                    No invoice history yet.
                  </div>
                )}

              <div className="space-y-3">

                {invoiceHistory.map(
                  (
                    historyItem,
                    index
                  ) => (
                    <div
                      key={`${historyItem.invoiceId}-${index}`}
                      className="rounded-xl border border-[#21262d] bg-[#070b10] p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-xs font-bold text-white">
                            {historyItem.customerName}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-blue-400">
                            {historyItem.vehicleNumber ||
                              "-"}
                          </p>

                          <p className="mt-1 text-[10px] text-[#6e7681]">
                            INV-
                            {historyItem.invoiceId}
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                            historyItem.paymentStatus ===
                            "PAID"
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {
                            historyItem.paymentStatus
                          }
                        </span>

                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">

                        <div>

                          <p className="text-[9px] font-bold uppercase text-[#484f58]">
                            {historyItem.paymentStatus ===
                            "PAID"
                              ? "Paid"
                              : "Amount Due"}
                          </p>

                          <p className="mt-1 font-mono text-sm font-black text-[#52f0ac]">
                            LKR{" "}
                            {formatMoney(
                              historyItem.paymentStatus ===
                                "PAID"
                                ? historyItem.amountPaid ||
                                    historyItem.total
                                : historyItem.total
                            )}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-[10px] text-[#8b949e]">
                            {formatDate(
                              historyItem.date
                            )}
                          </p>

                          {historyItem.time && (
                            <p className="mt-1 font-mono text-[9px] text-[#484f58]">
                              {historyItem.time}
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="mt-3 flex justify-end gap-2 border-t border-[#1a1f26] pt-3">

                        {historyItem.paymentStatus ===
                        "PAID" ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewReceipt(
                                  historyItem
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 px-3 py-2 text-xs text-blue-400 transition hover:bg-blue-500/10"
                            >
                              <Eye
                                size={15}
                              />

                              VIEW
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  historyItem
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-[#52f0ac]/40 px-3 py-2 text-xs text-[#52f0ac] transition hover:bg-[#52f0ac]/10"
                            >
                              <Download
                                size={15}
                              />

                              PDF
                            </button>
                          </>
                        ) : (
                          <span className="py-2 text-[9px] font-black uppercase tracking-wider text-amber-400">
                            Payment Pending
                          </span>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          ADD STOCK ITEM MODAL
      ================================================== */}

      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#21262d] p-5">

              <div>
                <h3 className="text-sm font-black">
                  Add Bill Item
                </h3>

                <p className="mt-1 text-[10px] text-[#6e7681]">
                  Select an available stock batch
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddItemModal(
                    false
                  )
                }
                className="text-[#8b949e] hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="p-5">

              {stockError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {stockError}
                </div>
              )}

              {stockLoading ? (
                <div className="py-10 text-center text-xs text-[#8b949e]">
                  Loading stock...
                </div>
              ) : availableStockBatches.length ===
                0 ? (
                <div className="py-10 text-center text-xs text-[#8b949e]">
                  No available stock batches.
                </div>
              ) : (
                <>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#8b949e]">
                    Stock Item
                  </label>

                  <select
                    value={
                      selectedStockItem?.batchId ||
                      ""
                    }
                    onChange={(event) => {
                      const batchId =
                        Number(
                          event.target.value
                        );

                      const batch =
                        availableStockBatches.find(
                          (item) =>
                            Number(
                              item.batchId
                            ) === batchId
                        );

                      setSelectedStockItem(
                        batch || null
                      );

                      setItemQuantity(1);
                      setStockError("");
                    }}
                    className="w-full rounded-lg border border-[#30363d] bg-[#070b10] px-3 py-3 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select item
                    </option>

                    {availableStockBatches.map(
                      (batch) => (
                        <option
                          key={
                            batch.batchId
                          }
                          value={
                            batch.batchId
                          }
                        >
                          {batch.itemName} |{" "}
                          {batch.batchNumber ||
                            `Batch ${batch.batchId}`}{" "}
                          | Available:{" "}
                          {
                            batch.availableQuantity
                          }{" "}
                          | LKR{" "}
                          {formatMoney(
                            batch.sellingPrice
                          )}
                        </option>
                      )
                    )}

                  </select>

                  {selectedStockItem && (
                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                        <p className="text-[9px] font-bold uppercase text-[#6e7681]">
                          Available
                        </p>

                        <p className="mt-1 text-sm font-black text-white">
                          {
                            selectedStockItem.availableQuantity
                          }
                        </p>

                      </div>

                      <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                        <p className="text-[9px] font-bold uppercase text-[#6e7681]">
                          Unit Price
                        </p>

                        <p className="mt-1 font-mono text-sm font-black text-[#52f0ac]">
                          LKR{" "}
                          {formatMoney(
                            selectedStockItem.sellingPrice
                          )}
                        </p>

                      </div>

                    </div>
                  )}

                  <label className="mb-2 mt-5 block text-[10px] font-black uppercase tracking-wider text-[#8b949e]">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedStockItem?.availableQuantity ||
                      1
                    }
                    value={itemQuantity}
                    onChange={(event) =>
                      setItemQuantity(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#30363d] bg-[#070b10] px-3 py-3 text-xs text-white outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddBillItem
                    }
                    disabled={
                      !selectedStockItem
                    }
                    className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-xs font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ADD TO BILL
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          DELETE ITEM CONFIRMATION
      ================================================== */}

      {deleteItemIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">

          <div className="w-full max-w-sm rounded-2xl border border-[#30363d] bg-[#0d1117] p-5">

            <AlertCircle
              size={32}
              className="text-red-400"
            />

            <h3 className="mt-4 text-base font-black">
              Remove Item?
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#8b949e]">
              This item will be removed from the current bill.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeleteItemIndex(
                    null
                  )
                }
                className="rounded-lg border border-[#30363d] py-2.5 text-xs font-bold text-[#c9d1d9]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={
                  confirmRemoveBillItem
                }
                className="rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500"
              >
                REMOVE
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          PAYMENT MODAL
      ================================================== */}

      {showModal &&
        selectedToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

            <div className="w-full max-w-md rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl">

              <div className="flex items-center justify-between border-b border-[#21262d] p-5">

                <div>

                  <p className="text-[9px] font-black uppercase tracking-wider text-[#6e7681]">
                    Confirm Payment
                  </p>

                  <h3 className="mt-1 text-lg font-black">
                    {paymentMethod}
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      !paymentLoading
                    ) {
                      setShowModal(
                        false
                      );
                    }
                  }}
                  className="text-[#8b949e] hover:text-white"
                >
                  <X size={19} />
                </button>

              </div>

              <div className="p-5">

                <div className="rounded-xl border border-[#21262d] bg-[#070b10] p-4">

                  <p className="text-[9px] font-bold uppercase text-[#6e7681]">
                    Amount Due
                  </p>

                  <p className="mt-1 font-mono text-2xl font-black text-[#52f0ac]">
                    LKR{" "}
                    {formatMoney(
                      selectedToken.amount
                    )}
                  </p>

                  <p className="mt-2 text-[10px] text-[#6e7681]">
                    INV-
                    {selectedToken.invoiceId}
                  </p>

                </div>

                {paymentMethod ===
                  "Cash" && (
                  <>

                    <label className="mb-2 mt-5 block text-[10px] font-black uppercase tracking-wider text-[#8b949e]">
                      Cash Received
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        cashReceived
                      }
                      onChange={(
                        event
                      ) => {
                        setCashReceived(
                          event.target.value
                        );

                        setPaymentError(
                          ""
                        );
                      }}
                      placeholder="Enter cash amount"
                      className="w-full rounded-lg border border-[#30363d] bg-[#070b10] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500"
                    />

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                      <p className="text-xs text-[#8b949e]">
                        Change
                      </p>

                      <p className="font-mono text-sm font-black text-emerald-400">
                        LKR{" "}
                        {formatMoney(
                          cashChange
                        )}
                      </p>

                    </div>

                  </>
                )}

                {paymentMethod ===
                  "POS" && (
                  <>

                    <label className="mb-2 mt-5 block text-[10px] font-black uppercase tracking-wider text-[#8b949e]">
                      Card Type
                    </label>

                    <select
                      value={cardType}
                      onChange={(
                        event
                      ) =>
                        setCardType(
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-[#30363d] bg-[#070b10] px-3 py-3 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="VISA">
                        VISA
                      </option>

                      <option value="MASTER">
                        MASTER
                      </option>
                    </select>

                    <label className="mb-2 mt-4 block text-[10px] font-black uppercase tracking-wider text-[#8b949e]">
                      Transaction Reference
                    </label>

                    <input
                      type="text"
                      value={
                        transactionRef
                      }
                      onChange={(
                        event
                      ) => {
                        setTransactionRef(
                          event.target.value
                        );

                        setPaymentError(
                          ""
                        );
                      }}
                      placeholder="Enter POS reference"
                      className="w-full rounded-lg border border-[#30363d] bg-[#070b10] px-3 py-3 text-xs text-white outline-none focus:border-blue-500"
                    />

                  </>
                )}

                {paymentError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {paymentError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handlePaymentConfirm
                  }
                  disabled={
                    paymentLoading
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      CONFIRMING...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={16}
                      />

                      CONFIRM PAYMENT
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ==================================================
          PAYMENT SUCCESS
      ================================================== */}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-[#0d1117] p-6 text-center shadow-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">

              <CheckCircle2
                size={30}
                className="text-emerald-400"
              />

            </div>

            <h3 className="mt-4 text-lg font-black">
              Payment Confirmed
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#8b949e]">
              Payment has been saved successfully. The customer invoice will now display as PAID.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSuccess(
                  false
                );

                loadInvoiceHistory();
              }}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500"
            >
              DONE
            </button>

          </div>

        </div>
      )}

      {/* ==================================================
          VIEW PAID RECEIPT
      ================================================== */}

      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#21262d] p-5">

              <div>

                <p className="text-[9px] font-black uppercase tracking-wider text-[#6e7681]">
                  Official Receipt
                </p>

                <h3 className="mt-1 font-mono text-base font-black">
                  INV-
                  {viewReceipt.invoiceId}
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewReceipt(null)
                }
                className="text-[#8b949e] hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="p-5">

              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">

                <div>

                  <p className="text-[9px] font-bold uppercase text-emerald-300/70">
                    Payment Status
                  </p>

                  <p className="mt-1 text-sm font-black text-emerald-400">
                    PAID
                  </p>

                </div>

                <CheckCircle2
                  size={24}
                  className="text-emerald-400"
                />

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                  <p className="text-[9px] uppercase text-[#6e7681]">
                    Customer
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    {viewReceipt.customerName ||
                      "Customer"}
                  </p>

                </div>

                <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                  <p className="text-[9px] uppercase text-[#6e7681]">
                    Vehicle
                  </p>

                  <p className="mt-1 font-mono text-xs font-bold text-blue-400">
                    {viewReceipt.vehicleNumber ||
                      "-"}
                  </p>

                </div>

                <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                  <p className="text-[9px] uppercase text-[#6e7681]">
                    Payment Method
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    {viewReceipt.paymentMethod ||
                      "-"}
                  </p>

                </div>

                <div className="rounded-lg border border-[#21262d] bg-[#070b10] p-3">

                  <p className="text-[9px] uppercase text-[#6e7681]">
                    Date
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    {formatDate(
                      viewReceipt.date
                    )}
                  </p>

                </div>

              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[#21262d]">

                {(viewReceipt.items ||
                  []).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 border-b border-[#161b22] p-3 last:border-b-0"
                    >

                      <div>

                        <p className="text-xs font-bold">
                          {item.itemName ||
                            "Item"}
                        </p>

                        <p className="mt-1 text-[9px] text-[#6e7681]">
                          {item.quantity} × LKR{" "}
                          {formatMoney(
                            item.unitPrice
                          )}
                        </p>

                      </div>

                      <p className="font-mono text-xs font-bold text-[#52f0ac]">
                        LKR{" "}
                        {formatMoney(
                          item.lineTotal
                        )}
                      </p>

                    </div>
                  )
                )}

              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-[#30363d] bg-[#070b10] p-4">

                <p className="text-xs font-black uppercase text-[#8b949e]">
                  Total Paid
                </p>

                <p className="font-mono text-xl font-black text-emerald-400">
                  LKR{" "}
                  {formatMoney(
                    viewReceipt.amountPaid ||
                      viewReceipt.total
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    viewReceipt
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Download
                  size={16}
                />

                DOWNLOAD PDF
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}