import React from 'react';
import { User, Bell, ChevronDown } from 'lucide-react';

const CounterReceipt = () => {
  return (
    <div className="min-h-screen bg-[#050608] text-white p-6 font-sans">
      {/* 1. Header Section */}
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-[#1a1f26]">
        <h2 className="text-xl font-bold tracking-wider text-[#52f0ac]">DISPATCH SYSTEM</h2>
        <div className="flex items-center gap-4">
          <button className="text-[#a0a8b7] hover:text-white transition-colors">
            <Bell size={24} />
          </button>
          <div className="flex items-center gap-2 bg-[#15191f] px-3 py-1.5 rounded-full border border-[#2b313d]">
            <User size={20} className="text-[#52f0ac]" />
            <span className="text-sm font-medium">Assistance</span>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <div className="max-w-2xl mx-auto bg-[#15191f] border border-[#2b313d] rounded-xl p-8 shadow-2xl">
        
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1a1f26] p-2 rounded-lg">🏢</div>
          <h1 className="text-2xl font-bold tracking-tight">COUNTER RECEIPT VALIDATION</h1>
        </div>

        {/* Selected Token Selection */}
        <div className="mb-8">
          <label className="text-xs text-[#6e7681] uppercase font-bold mb-2 block">Selected_Token</label>
          <div className="w-full bg-[#0b0e14] border border-[#2b313d] rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-[#52f0ac] transition-all">
            <span className="text-[#52f0ac] font-mono">Active Token: #TK-9958 (Amila Perera)</span>
            <ChevronDown size={20} className="text-[#6e7681]" />
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b border-[#1a1f26]">
            <span className="text-[#a0a8b7]">GROSS_TOTAL</span>
            <span className="font-mono text-lg">LKR 14,500.00</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1a1f26]">
            <span className="text-[#a0a8b7]">TAX_APPLIED (0%)</span>
            <span className="font-mono text-lg">LKR 0.00</span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-lg font-bold text-[#52f0ac]">NET_DUE_TOTAL</span>
            <span className="font-mono text-2xl font-bold text-[#52f0ac]">LKR 14,500.00</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-[#1a1f26] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#1a1f26] cursor-pointer transition-all">
            <span className="text-2xl">💳</span>
            <span className="text-xs uppercase font-bold text-[#a0a8b7]">Cash Payment</span>
          </div>
          <div className="border-2 border-[#52f0ac] rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-[#1a1f26] cursor-pointer">
            <span className="text-2xl text-[#52f0ac]">📠</span>
            <span className="text-xs uppercase font-bold text-[#52f0ac]">POS Card Terminal</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button className="w-full bg-[#5d55fa] hover:bg-[#4a44d8] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all">
          <span className="text-sm">✔</span> CONFIRM COUNTER PAYMENT & CLOSE TOKEN
        </button>
      </div>
    </div>
  );
};

export default CounterReceipt;