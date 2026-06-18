import React from "react";
import { LayoutDashboard, Siren, MessageSquare, CalendarDays, ReceiptText, ShieldCheck, User, X } from "lucide-react";

export default function Sidebar({ activeItem, onNavigate, isOpen, toggleSidebar }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Siren, label: "Incident Dispatch" },
    { icon: MessageSquare, label: "Customer Comms" },
    { icon: CalendarDays, label: "Resource Schedule" },
    { icon: ReceiptText, label: "Counter Ledger" },
    { icon: ShieldCheck, label: "Experience Audit" },
    { icon: User, label: "Assistance Profile" },

  ];

  return (
    <>
      {/* Mobile Overlay: Sidebar එක විවෘත විට පිටුපස අඳුරු කරන ස්ථරය */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:relative  z-50 w-72 bg-[#000000] p-6 flex flex-col justify-between border-r border-[#1a1a1a] h-screen transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div>
          <div className="flex justify-between items-center mb-10 mt-2">
            <h1 className="text-white font-black text-xl tracking-widest">ASSIST SYSTEM</h1>
            <button className="md:hidden text-white" onClick={toggleSidebar}><X size={20} /></button>
          </div>
          
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { 
                  onNavigate(item.label); 
                  if(window.innerWidth < 768) toggleSidebar(); 
                }}
                className={`w-full flex items-center gap-4 cursor-pointer px-5 py-4 text-xs font-bold tracking-widest border transition-all duration-300 ${
                  activeItem === item.label
                    ? "bg-[#0a142e]/40 border-[#1e3a8a] text-blue-400 shadow-[0_0_15px_rgba(30,58,138,0.4)]"
                    : "bg-transparent border-[#1a1a1a] text-gray-500 hover:border-[#333]"
                }`}
              >
                <item.icon size={18} /> {item.label.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
        
        
      </aside>
    </>
  );
}