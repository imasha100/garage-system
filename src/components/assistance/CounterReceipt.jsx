import React, { useState } from "react";
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
  Search,
  Bell,
  Menu,
  User,
  AlertTriangle,
} from "lucide-react";
import jsPDF from "jspdf";

const CounterReceipt = ({ openSidebar }) => {
  const initialTokens = [
    {
      id: "#TK-9958",
      name: "Amila Perera",
      amount: 14500.0,
      items: [
        { name: "Engine Oil", price: 4500 },
        { name: "Oil Filter", price: 2000 },
        { name: "Labor Charge", price: 8000 },
      ],
      history: [
        { date: "2026-06-10", ref: "TXN8892", total: 14500.0 },
        { date: "2026-05-12", ref: "TXN4432", total: 12000.0 },
        { date: "2026-04-05", ref: "TXN1120", total: 9500.0 },
      ],
    },
    {
      id: "#TK-1025",
      name: "Sunil Shantha",
      amount: 8200.0,
      items: [
        { name: "Tire Patch", price: 1200 },
        { name: "Alignment", price: 7000 },
      ],
      history: [
        { date: "2026-05-15", ref: "TXN7710", total: 8200.0 },
        { date: "2026-03-20", ref: "TXN3390", total: 5000.0 },
        { date: "2026-02-10", ref: "TXN2210", total: 3000.0 },
      ],
    },
    {
      id: "#TK-4489",
      name: "Kamal Perera",
      amount: 22000.0,
      items: [{ name: "Battery Replacement", price: 22000 }],
      history: [
        { date: "2026-04-20", ref: "TXN5541", total: 22000.0 },
        { date: "2026-03-15", ref: "TXN4412", total: 18000.0 },
        { date: "2026-01-10", ref: "TXN1005", total: 15000.0 },
      ],
    },
  ];

  const [tokens, setTokens] = useState(initialTokens);
  const [selectedToken, setSelectedToken] = useState(initialTokens[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [cardType, setCardType] = useState("Visa");
  const [cashReceived, setCashReceived] = useState("");

  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [deleteItemIndex, setDeleteItemIndex] = useState(null);

  const updateSelectedToken = (updatedToken) => {
    setSelectedToken(updatedToken);
    setTokens((prev) =>
      prev.map((token) => (token.id === updatedToken.id ? updatedToken : token))
    );
  };

  const handleAddBillItem = () => {
    if (!itemName.trim() || !itemPrice || Number(itemPrice) <= 0) return;

    const newItem = {
      name: itemName,
      price: Number(itemPrice),
    };

    const updatedItems = [...selectedToken.items, newItem];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    const updatedToken = {
      ...selectedToken,
      items: updatedItems,
      amount: newTotal,
    };

    updateSelectedToken(updatedToken);
    setItemName("");
    setItemPrice("");
    setShowAddItem(false);
  };

  const requestRemoveBillItem = (index) => {
    setDeleteItemIndex(index);
  };

  const cancelRemoveBillItem = () => {
    setDeleteItemIndex(null);
  };

  const confirmRemoveBillItem = () => {
    if (deleteItemIndex === null) return;

    const updatedItems = selectedToken.items.filter(
      (_, index) => index !== deleteItemIndex
    );
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    const updatedToken = {
      ...selectedToken,
      items: updatedItems,
      amount: newTotal,
    };

    updateSelectedToken(updatedToken);
    setDeleteItemIndex(null);
  };

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    setShowModal(true);
  };

  const handlePaymentConfirm = () => {
    const newHistory = {
      date: new Date().toISOString().split("T")[0],
      ref: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      total: selectedToken.amount,
    };

    const updatedToken = {
      ...selectedToken,
      history: [newHistory, ...selectedToken.history],
    };

    updateSelectedToken(updatedToken);
    setShowModal(false);
    setShowSuccess(true);
  };

  const handleDownload = (historyItem) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Official Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${selectedToken.name}`, 20, 30);
    doc.text(`Token ID: ${selectedToken.id}`, 20, 40);
    doc.text(`Reference: ${historyItem.ref}`, 20, 50);
    doc.text(`Total Paid: LKR ${historyItem.total.toFixed(2)}`, 20, 60);

    let y = 75;
    selectedToken.items.forEach((item) => {
      doc.text(`${item.name} - LKR ${item.price.toFixed(2)}`, 20, y);
      y += 10;
    });

    doc.save(`Receipt_${historyItem.ref}.pdf`);
  };

  return (
    <div className="h-screen min-h-0 bg-[#050608] text-white font-sans overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="h-14 sm:h-16 shrink-0 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-black border-b border-blue-900/40">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={openSidebar}
            className="md:hidden text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              type="text"
              placeholder="Search system..."
              className="w-full bg-black border border-slate-800 py-2 pl-9 pr-3 rounded-md text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-2 sm:ml-4 shrink-0">
          <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            ONLINE
          </span>

          <button
            type="button"
            className="text-slate-300 hover:text-white cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
            <User size={14} />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 p-2.5 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto bg-[#15191f] border border-[#2b313d] lg:border-2 lg:border-blue-500 rounded-2xl lg:rounded-xl p-4 sm:p-5 lg:p-6 shadow-2xl flex flex-col mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 lg:mb-5 gap-3 lg:gap-2">
          <div className="flex items-center gap-3 lg:gap-3 min-w-0">
            <div className="bg-[#1a1f26] p-2.5 lg:p-2 rounded-xl lg:rounded-lg shrink-0">
              <Receipt className="text-[#52f0ac] w-7 h-7 lg:w-10 lg:h-10" size={40} />
            </div>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">
              COUNTER RECEIPT VALIDATION
            </h1>
          </div>

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center justify-center gap-2 text-[11px] lg:text-xs text-[#52f0ac] border border-[#52f0ac] px-3 lg:px-3 py-2 lg:py-1 rounded-lg lg:rounded hover:bg-[#52f0ac]/10 shrink-0 whitespace-nowrap"
          >
            <History size={16} className="lg:w-[22px] lg:h-[22px]" /> VIEW HISTORY
          </button>
        </div>

        <div className="mb-5 lg:mb-5 relative">
          <label className="text-[10px] lg:text-xs text-[#6e7681] uppercase font-bold mb-2 block tracking-wider">
            Select Token
          </label>

          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full bg-[#0b0e14] border border-[#2b313d] rounded-xl lg:rounded-lg p-3 lg:p-3 flex justify-between items-center cursor-pointer hover:border-[#52f0ac] transition-all gap-2"
          >
            <span className="text-[#52f0ac] font-mono text-sm sm:text-base lg:text-base truncate">
              {selectedToken.id} ({selectedToken.name})
            </span>
            <ChevronDown size={20} className="text-[#6e7681] shrink-0 lg:w-[30px] lg:h-[30px]" />
          </div>

          {showDropdown && (
            <div className="absolute w-full mt-2 bg-[#1a1f26] border border-[#2b313d] rounded-lg z-20 shadow-xl max-h-[220px] overflow-y-auto">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  onClick={() => {
                    setSelectedToken(token);
                    setShowDropdown(false);
                  }}
                  className="p-3.5 lg:p-4 hover:bg-[#2b313d] cursor-pointer border-b border-[#0b0e14] text-sm lg:text-base"
                >
                  {token.id} - {token.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 lg:mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-[10px] lg:text-xs text-[#6e7681] uppercase font-bold flex items-center gap-2 tracking-wider">
              <List size={16} className="lg:w-6 lg:h-6" /> Receipt Breakdown
            </h3>

            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center justify-center gap-1.5 bg-[#52f0ac] text-black px-2.5 sm:px-3 py-2 rounded-lg lg:rounded text-[10px] lg:text-xs font-bold hover:bg-[#3edc98] shrink-0"
            >
              <Plus size={16} />
              ADD BILL ITEM
            </button>
          </div>

          <div className="bg-[#0b0e14] rounded-xl lg:rounded-lg p-3 sm:p-4 lg:p-5 border border-[#2b313d] max-h-[220px] lg:h-[180px] overflow-y-auto">
            {selectedToken.items.length === 0 ? (
              <p className="text-center text-[#6e7681]">No bill items added.</p>
            ) : (
              selectedToken.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 lg:py-2 text-sm lg:text-base border-b border-[#1a1f26] last:border-0 gap-3"
                >
                  <span className="truncate">{item.name}</span>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-mono font-bold text-xs sm:text-sm lg:text-base">
                      LKR {item.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => requestRemoveBillItem(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-row justify-between items-end sm:items-center py-4 lg:py-3 border-y border-[#1a1f26] mb-5 gap-3">
          <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#52f0ac] tracking-wider">
            NET_DUE_TOTAL
          </span>

          <span className="font-mono text-xl sm:text-2xl lg:text-2xl font-bold text-[#52f0ac] text-right">
            LKR {selectedToken.amount.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div
            onClick={() => handleMethodSelect("Cash")}
            className="border border-[#b0c8e9] rounded-xl lg:rounded-lg p-4 lg:p-4 min-h-[105px] lg:min-h-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#5223c9] transition-all active:scale-[0.98]"
          >
            <Wallet size={28} className="lg:w-8 lg:h-8" />
            <span className="text-xs lg:text-xs uppercase font-bold">
              Cash
            </span>
          </div>

          <div
            onClick={() => handleMethodSelect("POS")}
            className="border border-[#b0c8e9] rounded-xl lg:rounded-lg p-4 lg:p-4 min-h-[105px] lg:min-h-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#5223c9] transition-all active:scale-[0.98]"
          >
            <CreditCard size={28} className="lg:w-8 lg:h-8" />
            <span className="text-xs lg:text-xs uppercase font-bold text-center">
              POS Terminal
            </span>
          </div>
        </div>
      </div>

      {deleteItemIndex !== null && selectedToken.items[deleteItemIndex] && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4"
          onClick={cancelRemoveBillItem}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-red-500/40 bg-[#15191f] p-5 sm:p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle size={25} />
            </div>

            <h2 className="text-center text-base sm:text-lg font-bold text-white">
              Delete bill item?
            </h2>

            <p className="mt-2 text-center text-xs sm:text-sm leading-5 text-[#8b949e]">
              Are you sure you want to remove
              <span className="font-semibold text-white">
                {` ${selectedToken.items[deleteItemIndex].name} `}
              </span>
              from this bill?
            </p>

            <div className="mt-4 rounded-xl border border-[#2b313d] bg-[#0b0e14] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-white">
                  {selectedToken.items[deleteItemIndex].name}
                </span>
                <span className="shrink-0 font-mono text-sm font-bold text-[#52f0ac]">
                  LKR {selectedToken.items[deleteItemIndex].price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={cancelRemoveBillItem}
                className="rounded-xl border border-[#2b313d] bg-[#20252d] py-3 text-xs font-bold text-white transition hover:bg-[#2b313d]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmRemoveBillItem}
                className="rounded-xl bg-red-500 py-3 text-xs font-bold text-white transition hover:bg-red-400"
              >
                DELETE ITEM
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#52f0ac] max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold uppercase">Add Bill Item</h2>
              <X
                className="cursor-pointer"
                onClick={() => setShowAddItem(false)}
              />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d] focus:outline-none focus:border-[#52f0ac]"
              />

              <input
                type="number"
                placeholder="Item price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d] focus:outline-none focus:border-[#52f0ac]"
              />
            </div>

            <button
              onClick={handleAddBillItem}
              className="w-full mt-6 bg-[#52f0ac] text-black font-bold py-3 rounded-lg"
            >
              ADD TO BILL
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#2b313d] max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold uppercase">
                {paymentMethod} Details
              </h2>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            {paymentMethod === "Cash" ? (
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Enter Cash"
                  className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d]"
                  onChange={(e) => setCashReceived(e.target.value)}
                />

                <p className="text-sm">
                  Change:{" "}
                  <span className="text-[#52f0ac]">
                    LKR{" "}
                    {Math.max(
                      0,
                      Number(cashReceived) - selectedToken.amount
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Transaction Ref *"
                  className="w-full bg-[#0b0e14] p-3 rounded border border-[#2b313d]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setCardType("Visa")}
                    className={`p-3 border rounded flex items-center gap-2 cursor-pointer ${
                      cardType === "Visa"
                        ? "border-[#52f0ac] bg-[#1a2e26]"
                        : "border-[#2b313d]"
                    }`}
                  >
                    <CreditCard size={18} className="text-blue-400" /> Visa
                  </div>

                  <div
                    onClick={() => setCardType("Mastercard")}
                    className={`p-3 border rounded flex items-center gap-2 cursor-pointer ${
                      cardType === "Mastercard"
                        ? "border-[#52f0ac] bg-[#1a2e26]"
                        : "border-[#2b313d]"
                    }`}
                  >
                    <CreditCard size={18} className="text-orange-400" /> Master
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePaymentConfirm}
              className="w-full mt-6 bg-[#52f0ac] text-black font-bold py-3 rounded-lg"
            >
              CONFIRM
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl border border-[#2b313d] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold">
                History: {selectedToken.id}
              </h2>
              <X
                className="cursor-pointer shrink-0"
                onClick={() => setShowHistory(false)}
              />
            </div>

            <div className="space-y-3">
              {selectedToken.history.length === 0 ? (
                <p className="text-center text-[#6e7681]">
                  No payment history yet.
                </p>
              ) : (
                selectedToken.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-[#0b0e14] rounded-lg border border-[#2b313d] gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm md:text-base truncate">
                        {h.ref}
                      </p>
                      <p className="text-xs text-[#6e7681]">{h.date}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewReceipt(h)}
                        className="text-blue-400 p-2"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => handleDownload(h)}
                        className="text-[#52f0ac] p-2"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full mt-6 bg-[#2b313d] py-2 rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {viewReceipt && (
        <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-white text-black p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold mb-4 text-center">OFFICIAL RECEIPT</h2>

            <div className="text-sm py-4 border-y border-gray-300 mb-4">
              Ref: {viewReceipt.ref} | Date: {viewReceipt.date}
            </div>

            <ul className="mb-4 text-sm">
              {selectedToken.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span>{it.name}</span>
                  <span className="shrink-0">
                    LKR {it.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="text-right font-bold text-lg">
              TOTAL: LKR {viewReceipt.total.toFixed(2)}
            </div>

            <button
              onClick={() => setViewReceipt(null)}
              className="w-full mt-6 bg-black text-white py-2 rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[70]">
          <div className="bg-[#15191f] p-5 sm:p-6 md:p-8 rounded-t-2xl sm:rounded-xl text-center border border-[#52f0ac] shadow-2xl max-w-sm w-full">
            <CheckCircle className="mx-auto text-[#52f0ac] mb-4" size={50} />
            <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>

            <button
              onClick={() => setShowSuccess(false)}
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