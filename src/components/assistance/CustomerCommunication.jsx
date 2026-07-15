
import React, { useState } from "react";
import {
  Paperclip,
  Send,
  Image,
  Camera,
  MapPin,
  User,
  FileText,
  BarChart,
  Calendar,
  Sparkles,
  X,
  Bot,
  Info,
  Clock,
  AlertCircle,
  Wrench,
  Play,
  Car,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatInterface = ({ openSidebar }) => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Amila Perera",
      vehicle: "BMW i3 (WP-CAS-1234)",
      status: "Under Repair",
      completion: "11:05 AM",
      startTime: "08:30 AM",
      technician: "Kamal Perera",
      history: [
        "Engine Oil Change - 2025/10/12",
        "Brake Pad Replacement - 2026/01/15",
      ],
      messages: [
        {
          sender: "user",
          text: "Is the inverter replacement still on track?",
          time: "10:14 AM",
        },
        {
          sender: "ai",
          text: "Yes, our technician is finalizing tests.",
          time: "10:15 AM",
        },
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
      history: [
        "Tire Rotation - 2026/02/01",
        "Battery Check - 2026/05/10",
      ],
      messages: [
        {
          sender: "user",
          text: "Thank you for the update.",
          time: "09:00 AM",
        },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeChat = conversations.find(
    (chat) => chat.id === activeChatId
  );

  const filteredConversations = conversations.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
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

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  sender: "ai",
                  text: inputValue,
                  time: currentTime,
                },
              ],
            }
          : chat
      )
    );

    setInputValue("");
    setShowMenu(false);
    setIsTyping(false);
  };

  return (
    <div className="h-screen min-h-0 bg-[#0b0e14] text-[#a0a8b7] font-sans overflow-hidden flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-black border-b border-blue-900/40">
        <div className="flex items-center gap-4 flex-1">
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
              placeholder="Search customer or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-slate-800 py-2 pl-10 pr-4 rounded-md text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-4">
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

      {/* ================= ORIGINAL CHAT INTERFACE ================= */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[#0b0e14] text-[#a0a8b7] font-sans overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#1a1f26] flex flex-col h-[30vh] lg:h-full">
          <div className="p-6">
            <div className="text-lg lg:text-sm font-semibold text-[#8b949e] mb-4">
              Active Conversations
            </div>

            <div className="relative">
              <Search
                size={24}
                className="absolute left-3 top-4 text-[#6e7681]"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#15191f] border border-[#1a1f26] rounded-lg py-4 pl-12 pr-4 text-xl lg:text-sm text-white placeholder-[#6e7681] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`px-6 py-6 cursor-pointer border-l-4 transition-all ${
                  activeChatId === chat.id
                    ? "bg-[#1a1f26] border-[#52f0ac]"
                    : "border-transparent hover:bg-[#15191f]"
                }`}
              >
                <div className="text-2xl lg:text-base text-white font-medium">
                  {chat.name}
                </div>

                <div className="text-lg lg:text-xs text-[#a0a8b7]">
                  {chat.vehicle}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CHAT AREA ================= */}
        <div className="flex-1 flex flex-col relative h-[40vh] lg:h-full min-h-0">
          <header className="h-28 lg:h-20 shrink-0 border-b border-[#1a1f26] flex items-center px-8 text-white font-bold gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 lg:w-10 lg:h-10 rounded-full bg-[#1a2e26] flex items-center justify-center text-[#52f0ac]">
                <User size={28} />
              </div>

              <div className="text-2xl lg:text-base">
                {activeChat.name}

                {isTyping && (
                  <div className="text-lg lg:text-[10px] text-[#52f0ac] font-normal italic">
                    Typing...
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-4 ${
                  msg.sender === "user" ? "" : "flex-row-reverse"
                }`}
              >
                <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-[#1a1f26] border border-[#1a1f26] flex-shrink-0 text-[#a0a8b7]">
                  {msg.sender === "user" ? (
                    <User size={24} />
                  ) : (
                    <User size={24} className="text-[#52f0ac]" />
                  )}
                </div>

                <div
                  className={`max-w-xl p-6 lg:p-4 rounded-xl text-xl lg:text-sm ${
                    msg.sender === "user"
                      ? "bg-[#15191f] border border-[#1a1f26] text-[#a0a8b7]"
                      : "bg-[#1a2e26] text-[#52f0ac]"
                  }`}
                >
                  {msg.text}

                  <div className="text-sm lg:text-[9px] text-[#6e7681] mt-2 text-right">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attachment Menu */}
          {showMenu && (
            <div className="absolute bottom-36 left-4 right-4 lg:left-8 lg:right-8 bg-[#15191f] border border-[#1a1f26] rounded-2xl p-8 grid grid-cols-4 gap-6 z-10 shadow-2xl">
              {[
                {
                  icon: <Image size={36} />,
                  label: "Gallery",
                },
                {
                  icon: <Camera size={36} />,
                  label: "Camera",
                },
                {
                  icon: <MapPin size={36} />,
                  label: "Location",
                },
                {
                  icon: <User size={36} />,
                  label: "Contact",
                },
                {
                  icon: <FileText size={36} />,
                  label: "Document",
                },
                {
                  icon: <BarChart size={36} />,
                  label: "Poll",
                },
                {
                  icon: <Calendar size={36} />,
                  label: "Event",
                },
                {
                  icon: <Sparkles size={36} />,
                  label: "AI images",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 cursor-pointer text-[#52f0ac] hover:text-white transition"
                >
                  <div className="w-20 h-20 lg:w-12 lg:h-12 bg-[#1a2e26] rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>

                  <span className="text-sm lg:text-[10px]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-8 border-t border-[#1a1f26]">
            <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6 lg:p-4 flex items-center gap-6">
              <input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage()
                }
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-white text-xl lg:text-sm"
              />

              <Paperclip
                className={`cursor-pointer ${
                  showMenu ? "text-[#52f0ac]" : "text-[#6e7681]"
                }`}
                size={28}
                onClick={() => setShowMenu(!showMenu)}
              />

              <Send
                size={28}
                onClick={handleSendMessage}
                className="text-[#52f0ac] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div
          key={activeChat.id}
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#1a1f26] bg-[#0b0e14] p-8 lg:p-6 flex flex-col h-[30vh] lg:h-full overflow-y-auto"
        >
          <div className="text-sm lg:text-[10px] tracking-[0.2em] text-[#8b949e] mb-8">
            LIVE VEHICLE CONTEXT
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 lg:space-y-4"
          >
            {[
              {
                icon: Info,
                label: "REGISTRATION",
                val: activeChat.vehicle
                  .split("(")[1]
                  .replace(")", ""),
              },
              {
                icon: Car,
                label: "MODEL",
                val: activeChat.vehicle.split("(")[0],
              },
              {
                icon: Wrench,
                label: "TECHNICIAN",
                val: activeChat.technician,
              },
              {
                icon: Play,
                label: "START TIME",
                val: activeChat.startTime,
              },
              {
                icon: AlertCircle,
                label: "STATUS",
                val: activeChat.status,
                isAlert: true,
              },
              {
                icon: Clock,
                label: "COMPLETION",
                val: activeChat.completion,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[#15191f] p-6 lg:p-4 rounded-xl border border-[#1a1f26] flex items-center gap-5 lg:gap-4"
              >
                <div className="p-4 lg:p-2 bg-[#0b0e14] rounded-lg">
                  <item.icon
                    size={28}
                    className={
                      item.isAlert
                        ? "text-[#e78181]"
                        : "text-[#52f0ac]"
                    }
                  />
                </div>

                <div>
                  <p className="text-sm lg:text-[10px] text-[#6e7681]">
                    {item.label}
                  </p>

                  <p className="text-xl lg:text-sm font-bold text-white">
                    {item.val}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-auto pt-10">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-full py-5 lg:py-3 rounded-lg border border-[#1a1f26] text-lg lg:text-xs uppercase tracking-widest hover:bg-[#15191f] transition"
            >
              View full service history
            </button>
          </div>
        </div>

        {/* History Modal */}
        {isHistoryOpen && (
          <div className="absolute inset-0 bg-[#0b0e14]/95 z-50 flex items-center justify-center p-6">
            <div className="bg-[#15191f] w-full max-w-lg rounded-xl border border-[#1a1f26] p-10 relative">
              <X
                className="absolute top-6 right-6 cursor-pointer text-gray-400 hover:text-white"
                size={32}
                onClick={() => setIsHistoryOpen(false)}
              />

              <h2 className="text-white font-bold text-3xl lg:text-lg mb-8">
                Service History: {activeChat.name}
              </h2>

              <ul className="space-y-4">
                {activeChat.history.map((h, i) => (
                  <li
                    key={i}
                    className="p-6 lg:p-4 bg-[#0b0e14] rounded-lg text-xl lg:text-sm border border-[#1a1f26] text-[#52f0ac]"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

