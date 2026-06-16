import React, { useState } from "react";
import { 
  Paperclip, Send, Image, Camera, MapPin, User, 
  FileText, BarChart, Calendar, Sparkles, X, Bot, Info, Clock, AlertCircle, Wrench, Play, Car, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatInterface = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Amila Perera",
      vehicle: "BMW i3 (WP-CAS-1234)",
      status: "Under Repair",
      completion: "11:05 AM",
      startTime: "08:30 AM",
      technician: "Kamal Perera",
      history: ["Engine Oil Change - 2025/10/12", "Brake Pad Replacement - 2026/01/15"],
      messages: [
        { sender: "user", text: "Is the inverter replacement still on track?", time: "10:14 AM" },
        { sender: "ai", text: "Yes, our technician is finalizing tests.", time: "10:15 AM" },
      ],
    },
    {
      id: 2,
      name: "Sunil Shantha",
      vehicle: "Toyota Aqua (WP-AQ-5566)",
      status: "Diagnostic Mode",
      completion: "01:30 PM",
      startTime: "09:00 AM",
      technician: "Nimal Silva",
      history: ["Tire Rotation - 2026/02/01", "Battery Check - 2026/05/10"],
      messages: [
        { sender: "user", text: "Thank you for the update.", time: "09:00 AM" },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // අලුතින් එකතු කළා

  const activeChat = conversations.find((chat) => chat.id === activeChatId);

  // Filtered conversations
  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.3, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: "easeInOut" } 
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, { sender: "ai", text: inputValue, time: currentTime }] }
          : chat
      )
    );
    setInputValue("");
    setShowMenu(false);
    setIsTyping(false);
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#a0a8b7] font-sans overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-80 border-r border-[#1a1f26] flex flex-col">
        <div className="p-6">
          <div className="text-sm font-semibold text-[#8b949e] mb-4">Active Conversations</div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-[#6e7681]" />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full bg-[#15191f] border border-[#1a1f26] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-[#6e7681] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((chat) => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`px-6 py-4 cursor-pointer border-l-2 transition-all ${activeChatId === chat.id ? "bg-[#1a1f26] border-[#52f0ac]" : "border-transparent hover:bg-[#15191f]"}`}>
              <div className="text-white font-medium">{chat.name}</div>
              <div className="text-xs text-[#a0a8b7]">{chat.vehicle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CHAT AREA ================= */}
      <div className="flex-1 flex flex-col relative">
        <header className="h-20 border-b border-[#1a1f26] flex items-center px-8 text-white font-bold gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a2e26] flex items-center justify-center text-[#52f0ac]">
              <User size={20} />
            </div>
            <div>
              {activeChat.name}
              {isTyping && <div className="text-[10px] text-[#52f0ac] font-normal italic">Typing...</div>}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeChat.messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.sender === "user" ? "" : "flex-row-reverse"}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1f26] border border-[#1a1f26] flex-shrink-0 text-[#a0a8b7]">
                {msg.sender === "user" ? <User size={20} /> : <User size={20} className="text-[#52f0ac]" />}
              </div>
              <div className={`max-w-xl p-4 rounded-lg text-sm ${msg.sender === "user" ? "bg-[#15191f] border border-[#1a1f26] text-[#a0a8b7]" : "bg-[#1a2e26] text-[#52f0ac]"}`}>
                {msg.text}
                <div className="text-[9px] text-[#6e7681] mt-1 text-right">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Attachment Menu */}
        {showMenu && (
          <div className="absolute bottom-28 left-8 right-8 bg-[#15191f] border border-[#1a1f26] rounded-2xl p-6 grid grid-cols-4 gap-6 z-10 shadow-2xl">
            {[
              { icon: <Image size={24} />, label: 'Gallery' }, { icon: <Camera size={24} />, label: 'Camera' },
              { icon: <MapPin size={24} />, label: 'Location' }, { icon: <User size={24} />, label: 'Contact' },
              { icon: <FileText size={24} />, label: 'Document' }, { icon: <BarChart size={24} />, label: 'Poll' },
              { icon: <Calendar size={24} />, label: 'Event' }, { icon: <Sparkles size={24} />, label: 'AI images' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer text-[#52f0ac] hover:text-white transition">
                <div className="w-12 h-12 bg-[#1a2e26] rounded-full flex items-center justify-center">{item.icon}</div>
                <span className="text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="p-8 border-t border-[#1a1f26]">
          <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-4 flex items-center gap-4">
            <input value={inputValue} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-white text-sm" />
            <Paperclip className={`cursor-pointer ${showMenu ? "text-[#52f0ac]" : "text-[#6e7681]"}`} size={20} onClick={() => setShowMenu(!showMenu)} />
            <Send size={20} onClick={handleSendMessage} className="text-[#52f0ac] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR ================= */}
      <div key={activeChat.id} className="w-80 border-l border-[#1a1f26] bg-[#0b0e14] p-6 flex flex-col">
        <div className="text-[10px] tracking-[0.2em] text-[#8b949e] mb-6">LIVE VEHICLE CONTEXT</div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><Info size={18} className="text-[#52f0ac]"/></div>
             <div><p className="text-[10px] text-[#6e7681]">REGISTRATION</p><p className="text-sm font-bold text-white">{activeChat.vehicle.split("(")[1].replace(")", "")}</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><Car size={18} className="text-[#52f0ac]"/></div>
             <div><p className="text-[10px] text-[#6e7681]">MODEL</p><p className="text-sm font-bold text-white">{activeChat.vehicle.split("(")[0]}</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><Wrench size={18} className="text-[#52f0ac]"/></div>
             <div><p className="text-[10px] text-[#6e7681]">TECHNICIAN</p><p className="text-sm font-bold text-white">{activeChat.technician}</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><Play size={18} className="text-white"/></div>
             <div><p className="text-[10px] text-[#6e7681]">START TIME</p><p className="text-sm font-bold text-white">{activeChat.startTime}</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><AlertCircle size={18} className="text-[#e78181]"/></div>
             <div><p className="text-[10px] text-[#6e7681]">STATUS</p><p className="text-sm font-bold text-[#e78181]">{activeChat.status}</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#15191f] p-4 rounded-xl border border-[#1a1f26] flex items-center gap-3">
             <div className="p-2 bg-[#0b0e14] rounded-lg"><Clock size={18} className="text-white"/></div>
             <div><p className="text-[10px] text-[#6e7681]">COMPLETION</p><p className="text-sm font-bold text-white">{activeChat.completion}</p></div>
          </motion.div>
        </motion.div>

        <div className="mt-auto pt-6">
          <button onClick={() => setIsHistoryOpen(true)} className="w-full py-3 rounded-lg border border-[#1a1f26] text-xs uppercase tracking-widest hover:bg-[#15191f] transition">View full service history</button>
        </div>
      </div>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="absolute inset-0 bg-[#0b0e14]/90 z-50 flex items-center justify-center p-10">
          <div className="bg-[#15191f] w-full max-w-lg rounded-xl border border-[#1a1f26] p-8 relative">
            <X className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsHistoryOpen(false)} />
            <h2 className="text-white font-bold text-lg mb-6">Service History: {activeChat.name}</h2>
            <ul className="space-y-4">
              {activeChat.history.map((h, i) => (
                <li key={i} className="p-4 bg-[#0b0e14] rounded-lg text-sm border border-[#1a1f26] text-[#52f0ac]">{h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;