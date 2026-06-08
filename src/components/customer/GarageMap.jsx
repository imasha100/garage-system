import React, { useState } from 'react';
import { 
  Compass, Plus, Minus, Bell, Wrench, Shield, CheckCircle2, X, 
  Navigation, Layers, Settings, AlertCircle, Clock, FileText, Eye,
  MapPin, User, Flame, Menu, Car, AlertTriangle, Rocket, ArrowRight, Check,
  Search, CreditCard, DollarSign, Download, PlusCircle, Trash2, Users
} from 'lucide-react';

export default function GarageMap() {
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [isRequested, setIsRequested] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Tab control state: 'navigation' | 'mobility' | 'progress' | 'invoice'
  const [activeTab, setActiveTab] = useState('navigation'); 
  // Mobility screen selection state
  const [vehicleStatus, setVehicleStatus] = useState('driveable'); 

  // =========================================================================
  // 🧾 INVOICE LEDGER STATE MANAGEMENT
  // =========================================================================
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, code: '01', title: 'OBD Diagnostics', desc: 'Full system scan and error log extraction', price: 3500 },
    { id: 2, code: '02', title: 'Inverter Coolant Fluid', desc: 'High-performance dielectric thermal management fluid', price: 8500 },
    { id: 3, code: '03', title: 'Labor Run-Time Fee', desc: 'Technical specialist duration (95 mins)', price: 2500 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'counter'
  
  // Form states for adding new bill items
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Function to add item to invoice dynamically
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemTitle || !newItemPrice) return;

    const nextCode = String(invoiceItems.length + 1).padStart(2, '0');
    const item = {
      id: Date.now(),
      code: nextCode,
      title: newItemTitle,
      desc: newItemDesc || 'Custom breakdown asset/service item',
      price: parseFloat(newItemPrice) || 0
    };

    setInvoiceItems([...invoiceItems, item]);
    setNewItemTitle('');
    setNewItemDesc('');
    setNewItemPrice('');
  };

  // Function to remove an item from the bill
  const handleRemoveItem = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  // Calculate dynamic liability total
  const totalLiability = invoiceItems.reduce((acc, curr) => acc + curr.price, 0);

  // Exact data synchronized with the reference image
  const garagesData = {
    malabe: {
      id: "MALABE",
      name: "MALABE PREMIUM HUB",
      distance: "8.4 KM", 
      time: "14 MINS",   
      workload: "28%",
      status: "NEAREST & RECOMMENDED",
      specialization: "Hybrid Powertrain Experts Available",
      specDesc: "Node specialized in Toyota/Lexus/Honda high-voltage systems.",
      freeTechs: [
        { name: "Kamal Silva", expert: "Hybrid & EV Battery Diagnosis" },
        { name: "Nuwan Perera", expert: "Auto Electrical & ECU Tuning" },
        { name: "Sahan Fernando", expert: "Suspension & Brake Systems" }
      ]
    },
    kadawatha: {
      id: "KADAWATHA",
      name: "KADAWATHA HIGHWAY HUB",
      distance: "15.8 KM",
      time: "35 MINS",
      workload: "95%",
      status: "HIGH WORKLOAD",
      specialization: "Heavy Mechanical Specialists",
      specDesc: "Expertise in diesel turbo engines, transmission rebuilds, and highway recovery.",
      freeTechs: [] // No free technicians at the moment
    },
    kaduwela: {
      id: "KADUWELA",
      name: "KADUWELA CENTRAL HUB",
      distance: "12.1 KM",
      time: "22 MINS",
      workload: "60%",
      status: "MODERATE AVAILABLE",
      specialization: "General Mechanical & Scanning",
      specDesc: "Multi-brand vehicle scanners and quick routine recovery support.",
      freeTechs: [
        { name: "Roshan Alwis", expert: "Engine Overhauling & Scanning" }
      ]
    }
  };

  // Shared Sidebar Component Helper for clean state switching
  const renderSidebarNav = () => (
    <nav className="flex flex-col gap-1 text-xs font-bold tracking-wider text-slate-400">
      <button 
        onClick={() => { setActiveTab('navigation'); setMobileMenuOpen(false); }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded text-left cursor-pointer transition-all ${activeTab === 'navigation' ? 'bg-indigo-950/30 text-indigo-400 border-l-2 border-indigo-500' : 'hover:bg-slate-900/40 hover:text-white'}`}
      >
        <Navigation className="w-4 h-4" /> Navigation Hub
      </button>
      <button 
        onClick={() => { setActiveTab('mobility'); setMobileMenuOpen(false); }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded text-left cursor-pointer transition-all ${activeTab === 'mobility' ? 'bg-cyan-950/20 text-cyan-400 border-l-2 border-cyan-500' : 'hover:bg-slate-900/40 hover:text-white'}`}
      >
        <Wrench className="w-4 h-4" /> Mobility Recovery
      </button>
      <button 
        onClick={() => { setActiveTab('progress'); setMobileMenuOpen(false); }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded text-left cursor-pointer transition-all ${activeTab === 'progress' ? 'bg-emerald-950/20 text-emerald-400 border-l-2 border-emerald-500' : 'hover:bg-slate-900/40 hover:text-white'}`}
      >
        <Clock className="w-4 h-4" /> Live Progress
      </button>
      <button 
        onClick={() => { setActiveTab('invoice'); setMobileMenuOpen(false); }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded text-left cursor-pointer transition-all ${activeTab === 'invoice' ? 'bg-sky-950/30 text-sky-400 border-l-2 border-sky-500' : 'hover:bg-slate-900/40 hover:text-white'}`}
      >
        <FileText className="w-4 h-4" /> Invoice Ledger
      </button>
      <button className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/40 hover:text-white transition-colors text-left cursor-pointer">
        <Eye className="w-4 h-4" /> Experience Audit
      </button>
    </nav>
  );

  // =========================================================================
  //  INTERFACE 5: INVOICE LEDGER MODULE
  // =========================================================================
  if (activeTab === 'invoice') {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0a0f14] text-slate-300 font-mono flex relative selection:bg-sky-500 selection:text-slate-950">
        
        {/* DESKTOP SIDEBAR */}
        <div className="w-72 h-full border-r border-slate-900/80 bg-[#070b0f] hidden md:flex flex-col justify-between p-6 z-20">
          <div>
            <div className="mb-10 pl-2">
              <h1 className="text-2xl font-black tracking-widest text-sky-400">GEAR_OS</h1>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase block mt-1">CORE_SYSTEM_v4</span>
            </div>
            {renderSidebarNav()}
          </div>
          <div className="border-t border-slate-900 pt-4 pl-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" className="w-full h-full object-cover filter grayscale" alt="" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-200 font-bold tracking-wide">SYSTEM_OPERATOR</span>
              <span className="block text-[8px] text-emerald-400 tracking-widest uppercase flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE_MODE
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#0a0f14]/95 z-50 flex flex-col p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-black tracking-widest text-sky-400">GEAR_OS</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            {renderSidebarNav()}
          </div>
        )}

        {/* MAIN WORKSPACE */}
        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#0a0f14]">
          
          {/* HEADER TOP UTILITY */}
          <div className="w-full h-16 border-b border-slate-900/60 bg-[#070b0f]/40 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
              <div className="relative max-w-xs w-full hidden sm:block">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="QUERY_LEDGER_DATABASE..." 
                  className="w-full bg-slate-950/80 border border-slate-900/60 rounded-sm py-1.5 pl-9 pr-4 text-[10px] tracking-wider text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                  disabled 
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-white"><Bell className="w-4 h-4" /></button>
            </div>
          </div>

          {/* MONITOR CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
            
            {/* INVOICE META & LIABILITY HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900/40 pb-4">
              <div>
                <span className="text-[9px] font-bold text-slate-500 tracking-widest block uppercase">SESSION AUTHENTICATION</span>
                <h2 className="text-base md:text-lg font-black text-white tracking-wider mt-0.5">
                  TRANSACTION_ID: <span className="text-sky-400">TXN-9982</span>
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[9px] font-bold text-slate-500 tracking-widest block uppercase">TOTAL LIABILITY</span>
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-wide mt-0.5">
                  LKR {totalLiability.toLocaleString()}<span className="text-sky-400">_</span>
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* LEFT & CENTER: INVOICE ITEMS & ADDITION FORM */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* INVOICE ITEMS DYNAMIC LIST */}
                <div className="flex flex-col gap-2">
                  {invoiceItems.length === 0 ? (
                    <div className="border border-dashed border-slate-900 p-8 text-center text-slate-600 text-xs">
                      No items inside this statement ledger. Use the injector below.
                    </div>
                  ) : (
                    invoiceItems.map((item) => (
                      <div key={item.id} className="bg-[#0c1219] border border-slate-900/80 rounded-sm p-4 flex justify-between items-center group hover:border-slate-800 transition-colors">
                        <div className="flex items-start gap-4 min-w-0">
                          <span className="text-[10px] font-black text-slate-600 tracking-wider pt-0.5">{item.code}</span>
                          <div className="min-w-0">
                            <h4 className="text-xs md:text-sm font-bold text-slate-200 tracking-wide">{item.title}</h4>
                            <p className="text-[11px] text-slate-500 font-sans tracking-wide mt-0.5 truncate">{item.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 pl-2">
                          <span className="text-xs md:text-sm font-bold text-slate-300">LKR {item.price.toLocaleString()}</span>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-600 hover:text-red-400 p-1 transition-colors rounded hover:bg-red-950/20"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* DYNAMIC ITEM INJECTOR FORM */}
                <div className="bg-[#080d13] border border-dashed border-slate-900/80 rounded-sm p-4 md:p-5 mt-2">
                  <h3 className="text-[11px] font-black text-sky-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Inject New Item / Service Fee
                  </h3>
                  <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Item Title *</label>
                      <input 
                        type="text" 
                        required
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="e.g., Brake Pad Replacement" 
                        className="w-full bg-slate-950 border border-slate-900 rounded-sm p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price (LKR) *</label>
                      <input 
                        type="number" 
                        required
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="4500" 
                        className="w-full bg-slate-950 border border-slate-900 rounded-sm p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <button 
                        type="submit"
                        className="w-full bg-slate-900 border border-slate-800 text-sky-400 hover:bg-sky-950/30 hover:border-sky-500/40 p-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer h-8.5 flex items-center justify-center"
                      >
                        Add
                      </button>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                      <input 
                        type="text" 
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="Provide deep technical diagnostics breakdown details..." 
                        className="w-full bg-slate-950 border border-slate-900 rounded-sm p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT SIDE: PAYMENT METHOD SELECTOR */}
              <div className="flex flex-col gap-3">
                <div 
                  onClick={() => setPaymentMethod('online')}
                  className={`border rounded-sm p-5 cursor-pointer transition-all relative ${paymentMethod === 'online' ? 'bg-[#0b161c]/60 border-emerald-500/80 ring-1 ring-emerald-500/20' : 'bg-[#090e14] border-slate-900/80 hover:border-slate-800'}`}
                >
                  <div className="flex items-start gap-4">
                    <CreditCard className={`w-5 h-5 mt-0.5 ${paymentMethod === 'online' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 tracking-wide">Pay Online Now</h4>
                      <p className="text-[11px] text-slate-500 font-sans tracking-wide mt-1 leading-relaxed">
                        Settle instantly via Credit/Debit card or Secure Digital Wallet API. Recommended for rapid vehicle release.
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('counter')}
                  className={`border rounded-sm p-5 cursor-pointer transition-all relative ${paymentMethod === 'counter' ? 'bg-[#0b161c]/60 border-emerald-500/80 ring-1 ring-emerald-500/20' : 'bg-[#090e14] border-slate-900/80 hover:border-slate-800'}`}
                >
                  <div className="flex items-start gap-4">
                    <DollarSign className={`w-5 h-5 mt-0.5 ${paymentMethod === 'counter' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 tracking-wide">Pay at Counter</h4>
                      <p className="text-[11px] text-slate-500 font-sans tracking-wide mt-1 leading-relaxed">
                        Settle physically via Cash or Card terminal at the garage counter upon vehicle collection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => alert(`Processing Statement Settlement: LKR ${totalLiability.toLocaleString()}`)}
                    className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black tracking-widest text-xs uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  >
                    EXECUTE PAY / CONFIRM SELECTION
                  </button>
                  <button 
                    onClick={() => alert('Generating diagnostic documentation ledger PDF...')}
                    className="w-full py-2.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-slate-200 font-bold tracking-widest text-[10px] uppercase rounded-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Official Receipt (PDF)
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  //  INTERFACE 3: LIVE PROGRESS MODULE
  // =========================================================================
  if (activeTab === 'progress') {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0a0f14] text-slate-300 font-mono flex relative selection:bg-emerald-500 selection:text-slate-950">
        
        {/* DESKTOP SIDEBAR */}
        <div className="w-72 h-full border-r border-slate-900/80 bg-[#070b0f] hidden md:flex flex-col justify-between p-6 z-20">
          <div>
            <div className="mb-10 pl-2">
              <h1 className="text-2xl font-black tracking-widest text-[#4cc2c4]">GEAR_OS</h1>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase block mt-1">Terminal v4.2</span>
            </div>
            {renderSidebarNav()}
          </div>
          <div className="border-t border-slate-900 pt-4 pl-2 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-200 font-bold tracking-wide">User Workspace</span>
              <span className="block text-[8px] text-slate-500 tracking-widest uppercase">ROOT ACCESS</span>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#0a0f14]/95 z-50 flex flex-col p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-black tracking-widest text-[#4cc2c4]">GEAR_OS</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            {renderSidebarNav()}
          </div>
        )}

        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#0a0f14]">
          <div className="w-full h-16 border-b border-slate-900/60 bg-[#070b0f]/40 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
            <div className="w-full flex justify-end items-center gap-4">
              <button className="text-slate-400 hover:text-white"><Bell className="w-4 h-4" /></button>
              <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-xl w-full flex flex-col items-center gap-10 select-none">
              <div className="flex flex-col items-center">
                <h1 className="text-6xl md:text-8xl font-black text-[#5ef7c3] tracking-wider drop-shadow-[0_0_25px_rgba(94,247,195,0.45)]">
                  22 MINS
                </h1>
                <p className="text-[10px] md:text-xs tracking-[0.25em] text-slate-500 font-bold uppercase mt-4">
                  REMAINING UNTIL COMPLETION
                </p>
              </div>

              <div className="w-full max-w-md bg-[#0e151d] border border-slate-900 rounded-sm p-5 text-left flex items-center gap-4 shadow-xl">
                <div className="relative">
                  <div className="w-14 h-14 rounded-sm border border-[#5ef7c3]/60 bg-slate-950 overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(94,247,195,0.15)]">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                      alt="Marcus Thorne" 
                      className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5ef7c3] rounded-full border-2 border-[#0e151d] flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 text-slate-950 stroke-3" />
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-black tracking-widest text-[#5ef7c3] uppercase mb-0.5">
                    LEAD TECHNICIAN
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Marcus Thorne
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans tracking-wide mt-1">
                    Expertise: Hybrid Brake Systems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🗺️ INTERFACE 2: REAL-TIME GPS WAYFINDING HUB (Post-Request State)
  // =========================================================================
  if (isRequested && selectedGarage && activeTab === 'navigation') {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#070814] text-slate-200 font-mono flex relative selection:bg-indigo-500">
        
        {/* ENTERPRISE SIDEBAR PANEL (Desktop) */}
        <div className="w-72 h-full border-r border-slate-900 bg-[#0c0d19] hidden md:flex flex-col justify-between p-6 z-20">
          <div>
            <div className="mb-10 pl-2">
              <h1 className="text-2xl font-black tracking-widest text-white">GEAR_OS</h1>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase block mt-1">Enterprise Terminal</span>
            </div>
            {renderSidebarNav()}
          </div>
          <div className="text-[10px] text-slate-600 border-t border-slate-950 pt-4 pl-2 tracking-widest">
            SECURE_CONN // TERMINAL_V2.0
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#070814]/95 z-50 flex flex-col p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-black tracking-widest text-white">GEAR_OS</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            {renderSidebarNav()}
          </div>
        )}

        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#070814]">
          <div className="w-full h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
              <button className="text-slate-400 hover:text-white cursor-pointer"><Bell className="w-4 h-4" /></button>
              <button className="text-slate-400 hover:text-white cursor-pointer"><Settings className="w-4 h-4" /></button>
            </div>
            <div className="w-9 h-9 rounded border border-slate-800 bg-slate-900 flex items-center justify-center shadow-md text-slate-400">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 md:gap-5">
            <div>
              <h2 className="text-lg md:text-2xl font-black tracking-wider text-white">REAL-TIME GPS WAYFINDING HUB</h2>
              <p className="text-[11px] md:text-xs text-slate-400 font-sans tracking-wide mt-1">Turn-by-turn routing optimization and automated geofence sync with targeted branch.</p>
            </div>

            <div className="w-full bg-emerald-950/10 border border-emerald-900/40 rounded px-4 py-3 flex items-center gap-3 text-xs text-emerald-400/90 shadow-[inset_0_0_15px_rgba(16,185,129,0.02)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-sans tracking-wide">Your service slot has been reserved for immediate entry upon vehicle arrival.</span>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6">
              <div className="flex-1 bg-[#090b16] border border-slate-900 rounded relative overflow-hidden min-h-75 md:min-h-87.5">
                <div 
                  className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat pointer-events-none"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
                    WebkitFilter: 'brightness(0.15) contrast(1.6) saturate(0.5) hue-rotate(200deg)',
                    filter: 'brightness(0.15) contrast(1.6) saturate(0.5) hue-rotate(200deg)'
                  }} 
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-25 z-0" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M 50 250 Q 180 200, 240 120 T 440 90" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="3" 
                    strokeDasharray="8,5"
                    className="animate-[dash_12s_linear_infinite]"
                  />
                </svg>

                <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-900 px-3 py-1.5 rounded text-[8px] md:text-[9px] tracking-wider text-emerald-400 font-bold z-10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" /> ROUTE: LIVE TRAFFIC OPTIMIZED
                </div>

                <div className="absolute bottom-[30%] left-[15%] z-10 flex flex-col items-center">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute" />
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full border border-white relative" />
                </div>

                <div className="absolute top-[35%] right-[25%] z-10 text-center flex flex-col items-center">
                  <div className="w-4 h-4 bg-emerald-400 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.8)] mb-1" />
                  <span className="text-[8px] md:text-[9px] font-black text-emerald-400 tracking-widest uppercase bg-slate-950/90 px-1.5 py-0.5 border border-emerald-900/60 rounded">
                    {selectedGarage.id}_NODE
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-87.5 bg-[#090b16] border border-slate-900 rounded p-4 md:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-black tracking-widest text-white leading-tight">LOGISTICS<br />SYNC</h3>
                    </div>
                    <div className="p-2 border border-indigo-500/30 bg-indigo-950/10 text-indigo-400 rounded">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Target ETA</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedGarage.time.split(' ')[0]}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider">MINS</span>
                      </div>
                    </div>
                    <div className="lg:border-t lg:border-slate-900/60 lg:pt-4">
                      <span className="text-[10px] text-slate-500 tracking-widest block uppercase font-bold">Remaining Distance</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedGarage.distance.split(' ')[0]}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider">KM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 mt-6">
                  <button 
                    onClick={() => alert("Auto-Pilot sequence initialized successfully.")}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold tracking-widest text-xs uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" /> Start Auto-Pilot
                  </button>
                  <button 
                    onClick={() => { setIsRequested(false); setSelectedGarage(null); }}
                    className="w-full py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-white font-bold tracking-widest text-xs uppercase rounded cursor-pointer text-center"
                  >
                    Reroute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // INTERFACE 4: EMERGENCY LOGISTICS & FLEET DISPATCH MODULE
  // =========================================================================
  if (activeTab === 'mobility') {
    return (
      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#050b14] text-slate-200 font-mono flex relative selection:bg-cyan-500">
        
        {/* SIDEBAR PANEL */}
        <div className="w-72 h-full border-r border-slate-900 bg-[#060e1a] hidden md:flex flex-col justify-between p-6 z-20">
          <div>
            <div className="mb-10 pl-2">
              <h1 className="text-2xl font-black tracking-widest text-white">GEAR_OS</h1>
              <span className="text-[10px] text-purple-500 tracking-widest uppercase block mt-1">Enterprise Terminal</span>
            </div>
            {renderSidebarNav()}
          </div>
          <div className="text-[10px] text-slate-600 border-t border-slate-950 pt-4 pl-2 tracking-widest">
            SECURE_CONN // TERMINAL_V2.0
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#050b14]/95 z-50 flex flex-col p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-black tracking-widest text-white">GEAR_OS</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            {renderSidebarNav()}
          </div>
        )}

        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#040914]">
          <div className="w-full h-16 border-b border-slate-900 bg-[#060e1a]/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
              <span className="text-[#ff5e7e] font-bold tracking-widest text-[9px] md:text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5e7e] animate-pulse inline-block" /> EMERGENCY SYSTEM ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-white"><Bell className="w-4 h-4" /></button>
              <div className="w-9 h-9 rounded border border-slate-800 bg-slate-900 flex items-center justify-center shadow-md text-slate-400">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 max-w-4xl flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-wider text-white leading-tight uppercase font-sans">
                  EMERGENCY LOGISTICS &<br />FLEET DISPATCH MODULE
                </h1>
                <div className="w-24 h-1 bg-cyan-400 mt-4" />
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div 
                  onClick={() => setVehicleStatus('driveable')}
                  className={`border p-6 rounded-sm flex items-center gap-6 cursor-pointer transition-all bg-[#0a1224]/40 hover:bg-[#0d1830]/60 ${vehicleStatus === 'driveable' ? 'border-cyan-500/80 ring-1 ring-cyan-500/30' : 'border-slate-800'}`}
                >
                  <div className="p-3 bg-slate-900/80 border border-slate-800 text-slate-300 rounded-sm">
                    <Car className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-black tracking-widest text-white uppercase">DRIVEABLE</span>
                </div>

                <div 
                  onClick={() => setVehicleStatus('non-driveable')}
                  className={`border p-6 rounded-sm flex items-center gap-6 cursor-pointer transition-all bg-[#0a1224]/40 hover:bg-[#0d1830]/60 ${vehicleStatus === 'non-driveable' ? 'border-[#ff9eaf] ring-1 ring-[#ff9eaf]/40' : 'border-slate-800'}`}
                >
                  <div className="p-3 bg-slate-900/80 border border-slate-800 text-[#ff9eaf] rounded-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-black tracking-widest text-white uppercase">NON-DRIVEABLE / BREAKDOWN</span>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={() => alert(`Emergency Sequence Protocol Initiated.`)}
                className="w-full bg-[#990a1a] hover:bg-[#b30c1e] text-white border border-red-700/50 p-4 rounded-sm flex items-center justify-between font-bold transition-all shadow-[0_0_20px_rgba(153,10,26,0.2)] cursor-pointer"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-white text-red-950 rounded-sm">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs tracking-widest text-slate-200 font-sans font-black">AUTHORIZED COMMAND REQUIRED</span>
                    <span className="block text-[10px] md:text-xs tracking-wider text-white uppercase mt-0.5">INITIATE IMMEDIATE EMERGENCY TOW TRUCK DISPATCH</span>
                  </div>
                </div>
                <div className="bg-white text-red-950 p-2 rounded-sm hidden sm:block">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🗺️ INTERFACE 1: SELECT GARAGE MAP (Initial Discovery State)
  // =========================================================================
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#02050b] text-[#cbd5e1] font-mono flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOP STATUS BAR */}
      <div className="w-full h-14 border-b border-slate-900 bg-[#02050b]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-400 tracking-widest font-bold text-[9px] md:text-xs">
            SYS_STAT: <span className="text-cyan-400">ACTIVE // INTEL_MAP_V3</span>
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-white font-bold tracking-wide">AMILA PERERA</span>
            <span className="block text-[9px] text-purple-400 tracking-widest uppercase">Premium Hub Access</span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* MAP WORKSPACE */}
      <div className="flex-1 w-full relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-[0.22] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=90')`,
            WebkitFilter: 'brightness(0.3) contrast(1.8) saturate(0.4) hue-rotate(185deg)',
            filter: 'brightness(0.3) contrast(1.8) saturate(0.4) hue-rotate(185deg)'
          }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,5,11,0.05)_0%,#02050b_95%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#081022_1px,transparent_1px),linear-gradient(to_bottom,#081022_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 z-0 pointer-events-none" />

        {/* =========================================================================
            MAP LABELS & DYNAMIC TECHNICIAN COUNTERS
           ========================================================================= */}
        
        {/* NODE 1: KADAWATHA */}
        <div onClick={() => setSelectedGarage(garagesData.kadawatha)} className="absolute top-[8%] left-[4%] md:top-[12%] md:left-[12%] cursor-pointer group z-10 transition-all">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 bg-[#ff9eaf] rotate-45 mb-2 ml-10 shadow-[0_0_12px_rgba(255,158,175,0.8)] group-hover:scale-110 transition-transform" />
            <div className="bg-[#101424]/90 border border-[#ff9eaf]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono">
                Kadawatha Hub [15.8 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 35 Mins</span>]
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-slate-900/80 pt-1.5 text-[9px] md:text-[10px]">
                <div className="text-[#ff9eaf] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 95%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" /> Free Techs: <span className="text-white font-bold">{garagesData.kadawatha.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER POSITION INDICATOR */}
        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-[#b49eff] rotate-45 mb-2.5 shadow-[0_0_15px_rgba(180,158,255,0.8)]" />
            <div className="bg-[#101424]/95 border border-[#b49eff]/50 px-3 py-2 rounded-sm shadow-2xl backdrop-blur-md min-w-[200px]">
              <div className="font-black tracking-widest text-[#b49eff] text-[9px] md:text-[10px]">📍 YOUR CURRENT LOCATION</div>
            </div>
          </div>
        </div>

        {/* NODE 2: MALABE */}
        <div onClick={() => setSelectedGarage(garagesData.malabe)} className="absolute top-[10%] right-[4%] md:top-[16%] md:right-[22%] cursor-pointer group z-10 transition-all">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 bg-[#00ffaa] rotate-45 mb-2 ml-10 shadow-[0_0_12px_rgba(0,255,170,0.8)] group-hover:scale-110 transition-transform" />
            <div className="bg-[#101424]/90 border border-[#00ffaa]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono">
                Malabe Hub [8.4 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 14 Mins</span>]
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-slate-900/80 pt-1.5 text-[9px] md:text-[10px]">
                <div className="text-[#00ffaa] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 28%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" /> Free Techs: <span className="text-[#00ffaa] font-bold">{garagesData.malabe.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NODE 3: KADUWELA */}
        <div onClick={() => setSelectedGarage(garagesData.kaduwela)} className="absolute bottom-[22%] left-[4%] md:bottom-[18%] md:left-[16%] cursor-pointer group z-10 transition-all">
          <div className="flex flex-col items-start">
            <div className="w-3.5 h-3.5 bg-[#ff9d00] rotate-45 mb-2 ml-14 shadow-[0_0_12px_rgba(255,157,0,0.8)] group-hover:scale-110 transition-transform" />
            <div className="bg-[#101424]/90 border border-[#ff9d00]/40 px-3 py-2.5 rounded-sm shadow-2xl backdrop-blur-md w-56 md:w-[280px]">
              <div className="text-slate-300 text-[10px] md:text-[11px] font-bold tracking-wide font-mono">
                Kaduwela Hub [12.1 KM | <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 22 Mins</span>]
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-slate-900/80 pt-1.5 text-[9px] md:text-[10px]">
                <div className="text-[#ff9d00] tracking-wide font-medium flex items-center gap-1"><span>→</span> Workload: 60%</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" /> Free Techs: <span className="text-[#ff9d00] font-bold">{garagesData.kaduwela.freeTechs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP ZOOM CONTROLS */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Plus className="w-3.5 h-3.5" /></button>
          <button className="w-7 h-7 bg-[#0c1020] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-sm cursor-pointer shadow-lg"><Minus className="w-3.5 h-3.5" /></button>
        </div>

        {/* SIDE DETAIL PANEL */}
        <div className={`fixed bottom-0 left-0 w-full h-[78vh] md:h-full md:absolute md:top-0 md:right-0 md:left-auto md:w-[400px] bg-[#040713] border-t md:border-t-0 md:border-l border-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto z-30 shadow-2xl ${
          selectedGarage ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-x-full md:translate-y-0 opacity-0 pointer-events-none'
        }`}>
          {selectedGarage && (
            <div className="p-5 md:p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm md:text-base font-black text-white uppercase tracking-widest">{selectedGarage.name}</h2>
                  <button onClick={() => setSelectedGarage(null)} className="text-slate-500 hover:text-white p-1 border border-slate-800 rounded cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-sm text-xs mb-4">
                  <span className="block font-bold text-cyan-400 tracking-wider text-[9px] uppercase mb-1">Node Specialization</span>
                  <span className="block text-slate-200 font-bold">{selectedGarage.specialization}</span>
                  <span className="block text-slate-400 font-sans mt-0.5">{selectedGarage.specDesc}</span>
                </div>

                {/* DETAILED FREE TECHNICIANS LIST */}
                <div className="bg-[#091124]/40 border border-slate-900 p-3 rounded-sm text-xs mb-4">
                  <span className="block font-bold text-slate-400 tracking-wider text-[9px] uppercase mb-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-500" /> Available Specialists ({selectedGarage.freeTechs.length})
                  </span>
                  {selectedGarage.freeTechs.length === 0 ? (
                    <div className="text-slate-500 italic text-[11px] py-1">No technicians free right now. Queueing active.</div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                      {selectedGarage.freeTechs.map((tech, idx) => (
                        <div key={idx} className="border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                          <div className="text-slate-200 font-bold text-[11px]">{tech.name}</div>
                          <div className="text-slate-500 text-[10px] font-sans">{tech.expert}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-b border-slate-900/60 my-4 py-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Response Window
                    </span>
                    <span className="font-bold text-white">{selectedGarage.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Displacements
                    </span>
                    <span className="font-bold text-slate-300">{selectedGarage.distance}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 bg-[#040713]">
                <button onClick={() => setIsRequested(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-xs uppercase rounded-sm cursor-pointer transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                  Initiate Lock-In Request
                </button>
                <button onClick={() => setSelectedGarage(null)} className="w-full py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-red-400 font-bold tracking-widest text-xs uppercase rounded-sm cursor-pointer text-center">
                  Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}