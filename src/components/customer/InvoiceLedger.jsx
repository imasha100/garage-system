import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Download,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";

// ── Modal backdrop ──────────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm mx-4 bg-[#0c1219] border border-slate-800 rounded-sm shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ── Pay Online Modal ────────────────────────────────────────────────────────
function OnlineModal({ open, onClose, total, onSuccess }) {
  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const formatCard = (val) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length > 2 ? clean.slice(0, 2) + " / " + clean.slice(2) : clean;
  };

  const handlePay = () => {
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Valid card number ekak denna.");
      return;
    }
    if (expiry.length < 7) {
      setError("Expiry date denna (MM / YY).");
      return;
    }
    if (cvv.length < 3) {
      setError("CVV 3 digits enna oni.");
      return;
    }
    if (!name.trim()) {
      setError("Cardholder name denna.");
      return;
    }
    setError("");
    onSuccess(cardType);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <p className="text-[10px] text-slate-500 tracking-widest">PAYMENT METHOD</p>
          <h2 className="text-white font-black text-sm mt-0.5">Online Payment</h2>
        </div>

        {/* Card type toggle */}
        <div className="grid grid-cols-2 gap-2">
          {["visa", "master"].map((c) => (
            <button
              key={c}
              onClick={() => setCardType(c)}
              className={`py-2.5 border rounded-sm text-xs font-black tracking-widest transition-colors ${
                cardType === c
                  ? "border-emerald-400 bg-emerald-900/20 text-emerald-400"
                  : "border-slate-800 text-slate-500 hover:border-slate-600"
              }`}
            >
              {c === "visa" ? "💳 VISA" : "🔴 MASTERCARD"}
            </button>
          ))}
        </div>

        {/* Card fields */}
        <div className="space-y-2">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCard(e.target.value))}
            placeholder="Card number"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2.5 rounded-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2.5 rounded-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="CVV"
              type="password"
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2.5 rounded-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cardholder name"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2.5 rounded-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-[11px]">⚠ {error}</p>
        )}

        {/* Total & pay */}
        <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500">TOTAL DUE</p>
            <p className="text-white font-black text-base">
              LKR {total.toLocaleString()}
            </p>
          </div>
          <button
            onClick={handlePay}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-5 py-2.5 rounded-sm transition-colors"
          >
            PAY NOW
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Pay Counter Modal ────────────────────────────────────────────────────────
function CounterModal({ open, onClose, total }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <p className="text-[10px] text-slate-500 tracking-widest">PAYMENT METHOD</p>
          <h2 className="text-white font-black text-sm mt-0.5">Counter / Bank Transfer</h2>
        </div>

        {/* Banks */}
        <div className="space-y-2">
          {[
            { name: "Commercial Bank", branch: "Colombo 03", acc: "8801 2234 9901" },
            { name: "People's Bank", branch: "Pettah", acc: "001 4421 7890" },
          ].map((b) => (
            <div
              key={b.name}
              className="flex justify-between items-center bg-[#080d12] border border-slate-900 p-3 rounded-sm"
            >
              <div>
                <p className="text-white text-xs font-bold">{b.name}</p>
                <p className="text-slate-500 text-[10px]">Branch: {b.branch}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-xs font-mono font-bold">{b.acc}</p>
                <p className="text-slate-500 text-[10px]">Account No.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reference */}
        <div className="bg-emerald-900/10 border border-emerald-900 rounded-sm px-3 py-2">
          <p className="text-[10px] text-slate-500">PAYMENT REFERENCE</p>
          <p className="text-emerald-400 font-black text-sm font-mono mt-0.5">TXN-9982</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Transfer ekata meka reference widiha use karanna.
          </p>
        </div>

        {/* Total & note */}
        <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500">TOTAL DUE</p>
            <p className="text-white font-black text-base">
              LKR {total.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-slate-700 hover:border-slate-500 text-slate-300 text-xs px-4 py-2.5 rounded-sm transition-colors"
          >
            GOT IT
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ open, onClose, total, cardType }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
        <div>
          <h2 className="text-white font-black text-sm">Payment Successful!</h2>
          <p className="text-slate-500 text-xs mt-1">
            {cardType?.toUpperCase()} card ekata charge karanawa
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-sm p-3 text-left space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Amount</span>
            <span className="text-white font-bold">LKR {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Reference</span>
            <span className="text-emerald-400 font-mono">TXN-9982</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Status</span>
            <span className="text-emerald-400">APPROVED</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2.5 rounded-sm transition-colors"
        >
          DONE
        </button>
      </div>
    </Modal>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function InvoiceLedger() {
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, code: "01", title: "OBD Diagnostics", desc: "Full system scan and error log extraction", price: 3500 },
    { id: 2, code: "02", title: "Inverter Coolant Fluid", desc: "High-performance dielectric thermal management fluid", price: 8500 },
    { id: 3, code: "03", title: "Labor Run-Time Fee", desc: "Technical specialist duration (95 mins)", price: 2500 },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const [showOnline, setShowOnline] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paidCardType, setPaidCardType] = useState("");

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemTitle || !newItemPrice) return;
    const item = {
      id: Date.now(),
      code: String(invoiceItems.length + 1).padStart(2, "0"),
      title: newItemTitle,
      desc: newItemDesc || "Custom service item",
      price: parseFloat(newItemPrice) || 0,
    };
    setInvoiceItems([...invoiceItems, item]);
    setNewItemTitle("");
    setNewItemDesc("");
    setNewItemPrice("");
  };

  const handleRemoveItem = (id) =>
    setInvoiceItems(invoiceItems.filter((i) => i.id !== id));

  const total = invoiceItems.reduce((a, b) => a + b.price, 0);

  const handlePayNow = () => {
    if (paymentMethod === "online") setShowOnline(true);
    else setShowCounter(true);
  };

  const handleSuccess = (cardType) => {
    setPaidCardType(cardType);
    setShowOnline(false);
    setShowSuccess(true);
  };

  return (
    <div className="w-full h-full text-slate-300 font-mono">
      {/* MAIN */}
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* HEADER BOX */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-900 pb-4">
            <div>
              <p className="text-[10px] text-slate-500">SESSION AUTH</p>
              <h2 className="text-white font-bold text-sm md:text-lg">TXN-9982</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] text-slate-500">TOTAL</p>
              <h1 className="text-xl md:text-3xl font-black text-white">
                LKR {total.toLocaleString()}
              </h1>
            </div>
          </div>

          {/* ITEMS */}
          <div className="space-y-2">
            {invoiceItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1219] border border-slate-900 p-3 rounded-sm"
              >
                <div className="min-w-0">
                  <h3 className="text-sm text-white font-bold truncate">{item.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-sm font-bold">LKR {item.price.toLocaleString()}</span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FORM */}
          <form
            onSubmit={handleAddItem}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-900 p-4 rounded-sm"
          >
            <input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Title"
              className="bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <input
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="Price"
              type="number"
              className="bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <input
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              placeholder="Description"
              className="sm:col-span-2 bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="sm:col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2 rounded-sm transition-colors"
            >
              ADD ITEM
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {/* Pay Online card */}
          <div
            onClick={() => setPaymentMethod("online")}
            className={`p-4 border rounded-sm cursor-pointer transition-colors ${
              paymentMethod === "online"
                ? "border-emerald-400 bg-emerald-900/10"
                : "border-slate-900 hover:border-slate-700"
            }`}
          >
            <CreditCard className={`w-5 h-5 ${paymentMethod === "online" ? "text-emerald-400" : "text-slate-500"}`} />
            <p className="text-sm font-bold mt-2">Pay Online</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Visa / Mastercard</p>
          </div>

          {/* Pay Counter card */}
          <div
            onClick={() => setPaymentMethod("counter")}
            className={`p-4 border rounded-sm cursor-pointer transition-colors ${
              paymentMethod === "counter"
                ? "border-emerald-400 bg-emerald-900/10"
                : "border-slate-900 hover:border-slate-700"
            }`}
          >
            <DollarSign className={`w-5 h-5 ${paymentMethod === "counter" ? "text-emerald-400" : "text-slate-500"}`} />
            <p className="text-sm font-bold mt-2">Pay Counter</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cash / Bank Transfer</p>
          </div>

          {/* Actions */}
          <button
            onClick={handlePayNow}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 text-xs transition-colors"
          >
            PAY NOW
          </button>
          <button className="w-full border border-slate-800 hover:border-slate-600 py-2 text-xs flex items-center justify-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            DOWNLOAD RECEIPT
          </button>
        </div>
      </div>

      {/* MODALS */}
      <OnlineModal
        open={showOnline}
        onClose={() => setShowOnline(false)}
        total={total}
        onSuccess={handleSuccess}
      />
      <CounterModal
        open={showCounter}
        onClose={() => setShowCounter(false)}
        total={total}
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        total={total}
        cardType={paidCardType}
      />
    </div>
  );
}