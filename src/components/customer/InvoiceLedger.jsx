import React, { useState } from "react";
import {
  Bell,
  Search,
  CreditCard,
  DollarSign,
  Download,
  PlusCircle,
  Trash2,
} from "lucide-react";

export default function InvoiceLedger() {
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: 1,
      code: "01",
      title: "OBD Diagnostics",
      desc: "Full system scan and error log extraction",
      price: 3500,
    },
    {
      id: 2,
      code: "02",
      title: "Inverter Coolant Fluid",
      desc: "High-performance dielectric thermal management fluid",
      price: 8500,
    },
    {
      id: 3,
      code: "03",
      title: "Labor Run-Time Fee",
      desc: "Technical specialist duration (95 mins)",
      price: 2500,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("online");

  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

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

  const handleRemoveItem = (id) => {
    setInvoiceItems(invoiceItems.filter((i) => i.id !== id));
  };

  const total = invoiceItems.reduce((a, b) => a + b.price, 0);

  return (
    <div className="w-full h-full  text-slate-300 font-mono">
      {/* HEADER */}
     

        

      {/* MAIN */}
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">

          {/* HEADER BOX */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-900 pb-4">
            <div>
              <p className="text-[10px] text-slate-500">SESSION AUTH</p>
              <h2 className="text-white font-bold text-sm md:text-lg">
                TXN-9982
              </h2>
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
                  <h3 className="text-sm text-white font-bold truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-sm font-bold">
                    LKR {item.price}
                  </span>
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
              className="bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm"
            />

            <input
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="Price"
              type="number"
              className="bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm"
            />

            <input
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              placeholder="Description"
              className="sm:col-span-2 bg-slate-950 p-2 text-xs border border-slate-800 rounded-sm"
            />

            <button className="sm:col-span-2 bg-emerald-500 text-black font-bold text-xs py-2 rounded-sm">
              ADD ITEM
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">

          {/* PAYMENT */}
          <div
            onClick={() => setPaymentMethod("online")}
            className={`p-4 border rounded-sm cursor-pointer ${
              paymentMethod === "online"
                ? "border-emerald-400 bg-emerald-900/10"
                : "border-slate-900"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <p className="text-sm font-bold mt-2">Pay Online</p>
          </div>

          <div
            onClick={() => setPaymentMethod("counter")}
            className={`p-4 border rounded-sm cursor-pointer ${
              paymentMethod === "counter"
                ? "border-emerald-400 bg-emerald-900/10"
                : "border-slate-900"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <p className="text-sm font-bold mt-2">Pay Counter</p>
          </div>

          {/* ACTIONS */}
          <button
            onClick={() =>
              alert(`Paying LKR ${total.toLocaleString()}`)
            }
            className="w-full bg-emerald-500 text-black font-black py-3 text-xs"
          >
            PAY NOW
          </button>

          <button className="w-full border border-slate-800 py-2 text-xs flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            DOWNLOAD RECEIPT
          </button>
        </div>
      </div>
    </div>
  );
}