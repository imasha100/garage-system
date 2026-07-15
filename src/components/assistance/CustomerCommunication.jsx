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
  Info,
  Clock,
  AlertCircle,
  Wrench,
  Play,
  Car,
  Search,
  Bell,
  Menu,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";

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
      unreadCount: 2,
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
      unreadCount: 1,
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
  const [showMobileContext, setShowMobileContext] = useState(false);

  // Mobile WhatsApp-style views: list / chat
  const [mobileView, setMobileView] = useState("list");

  const activeChat =
    conversations.find((chat) => chat.id === activeChatId) ||
    conversations[0];

  const filteredConversations = conversations.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 14,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: "easeInOut",
      },
    },
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (!isTyping) {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setConversations((previousConversations) =>
      previousConversations.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              unreadCount: 0,
              messages: [
                ...chat.messages,
                {
                  sender: "ai",
                  text: inputValue.trim(),
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

  const selectConversation = (chatId) => {
    setActiveChatId(chatId);
    setShowMenu(false);
    setShowMobileContext(false);
    setMobileView("chat");

    setConversations((previousConversations) =>
      previousConversations.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
            }
          : chat
      )
    );
  };

  const handleBackToConversations = () => {
    setMobileView("list");
    setShowMenu(false);
    setShowMobileContext(false);
  };

  const getRegistrationNumber = () => {
    const vehicleParts = activeChat.vehicle.split("(");

    if (vehicleParts.length < 2) {
      return activeChat.vehicle;
    }

    return vehicleParts[1].replace(")", "").trim();
  };

  const getVehicleModel = () => {
    return activeChat.vehicle.split("(")[0].trim();
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return {
        text: "No messages yet",
        time: "",
      };
    }

    return chat.messages[chat.messages.length - 1];
  };

  const vehicleDetails = [
    {
      icon: Info,
      label: "REGISTRATION",
      val: getRegistrationNumber(),
    },
    {
      icon: Car,
      label: "MODEL",
      val: getVehicleModel(),
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
  ];

  const attachmentItems = [
    {
      icon: Image,
      label: "Gallery",
    },
    {
      icon: Camera,
      label: "Camera",
    },
    {
      icon: MapPin,
      label: "Location",
    },
    {
      icon: User,
      label: "Contact",
    },
    {
      icon: FileText,
      label: "Document",
    },
    {
      icon: BarChart,
      label: "Poll",
    },
    {
      icon: Calendar,
      label: "Event",
    },
    {
      icon: Sparkles,
      label: "AI Images",
    },
  ];

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0b0e14] font-sans text-[#a0a8b7]">
      {/* ================================================= */}
      {/* MAIN DESKTOP / TABLET HEADER */}
      {/* Mobile list එකේ custom WhatsApp header එක පෙන්වනවා */}
      {/* ================================================= */}
      <header
        className={`h-14 shrink-0 items-center justify-between border-b border-blue-900/40 bg-black px-3 sm:h-16 sm:px-4 md:px-6 lg:flex ${
          mobileView === "list" ? "hidden" : "flex"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={openSidebar}
            className="hidden shrink-0 cursor-pointer text-slate-300 transition hover:text-white md:block lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative hidden w-full max-w-md lg:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={15}
            />

            <input
              type="text"
              placeholder="Search customer or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-black py-2 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="ml-2 hidden shrink-0 items-center gap-3 sm:ml-4 sm:gap-5 lg:flex">
          <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            ONLINE
          </span>

          <button
            type="button"
            className="cursor-pointer text-slate-300 transition hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700">
            <User size={14} />
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN CHAT LAYOUT */}
      {/* ================================================= */}
      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#0b0e14]">
        {/* ================================================= */}
        {/* CONVERSATION LIST */}
        {/* Mobile: Full-screen WhatsApp list */}
        {/* Desktop: Left sidebar */}
        {/* ================================================= */}
        <aside
          className={`h-full w-full shrink-0 flex-col border-[#1a1f26] bg-[#0b0e14] lg:flex lg:w-72 lg:border-r xl:w-80 ${
            mobileView === "list" ? "flex" : "hidden"
          }`}
        >
          {/* Mobile WhatsApp Header */}
          <div className="shrink-0 border-b border-[#1f2c33] bg-[#111b21] lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openSidebar}
                  className="cursor-pointer text-[#aebac1] transition hover:text-white md:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu size={22} />
                </button>

                <h1 className="text-lg font-semibold text-[#e9edef]">
                  Customer Chats
                </h1>
              </div>

              <div className="flex items-center gap-5">
                <button
                  type="button"
                  className="text-[#aebac1] transition hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                </button>

                <button
                  type="button"
                  className="text-[#aebac1] transition hover:text-white"
                  aria-label="More options"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="px-3 pb-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                />

                <input
                  type="text"
                  placeholder="Search or start a new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-[#202c33] py-2.5 pl-11 pr-4 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                />
              </div>
            </div>
          </div>

          {/* Desktop Conversation Heading and Search */}
          <div className="hidden p-5 lg:block">
            <div className="mb-4 text-sm font-semibold text-[#8b949e]">
              Active Conversations
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-[#1a1f26] bg-[#15191f] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#6e7681]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation Cards */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((chat) => {
                const lastMessage = getLastMessage(chat);

                return (
                  <button
                    type="button"
                    key={chat.id}
                    onClick={() => selectConversation(chat.id)}
                    className={`flex w-full items-center gap-3 border-b border-[#1f2c33] px-3 py-3 text-left transition hover:bg-[#202c33] lg:block lg:border-b-0 lg:border-l-4 lg:px-6 lg:py-5 ${
                      activeChatId === chat.id
                        ? "lg:border-[#52f0ac] lg:bg-[#1a1f26]"
                        : "lg:border-transparent lg:bg-transparent"
                    }`}
                  >
                    {/* Mobile Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#26353d] text-[#00a884] lg:hidden">
                      <User size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[15px] font-medium text-[#e9edef] lg:text-base lg:text-white">
                          {chat.name}
                        </p>

                        <span
                          className={`shrink-0 text-[11px] lg:hidden ${
                            chat.unreadCount > 0
                              ? "text-[#00a884]"
                              : "text-[#8696a0]"
                          }`}
                        >
                          {lastMessage.time}
                        </span>
                      </div>

                      {/* Mobile Last Message */}
                      <div className="mt-1 flex items-center justify-between gap-3 lg:hidden">
                        <p className="min-w-0 flex-1 truncate text-[13px] text-[#8696a0]">
                          {lastMessage.text}
                        </p>

                        {chat.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#00a884] px-1 text-[10px] font-semibold text-[#111b21]">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Desktop Vehicle Details */}
                      <p className="mt-1 hidden truncate text-xs text-[#a0a8b7] lg:block">
                        {chat.vehicle}
                      </p>

                      <p className="mt-2 hidden text-[10px] uppercase tracking-wider text-[#52f0ac] lg:block">
                        {chat.status}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-[#8696a0]">
                No conversations found.
              </div>
            )}
          </div>
        </aside>

        {/* ================================================= */}
        {/* CHAT AREA */}
        {/* Mobile: Full-screen chat */}
        {/* Desktop: Middle area */}
        {/* ================================================= */}
        <main
          className={`relative min-h-0 flex-1 flex-col bg-[#0b141a] lg:flex lg:bg-[#0b0e14] ${
            mobileView === "chat" ? "flex" : "hidden"
          }`}
        >
          {/* WhatsApp-style Chat Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1f2c33] bg-[#202c33] px-2.5 lg:h-20 lg:border-[#1a1f26] lg:bg-[#0b0e14] lg:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-2">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={handleBackToConversations}
                className="flex h-10 w-8 shrink-0 items-center justify-center text-[#aebac1] transition hover:text-white lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft size={23} />
              </button>

              {/* Profile Image */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#26353d] text-[#00a884] lg:bg-[#1a2e26] lg:text-[#52f0ac]">
                <User size={19} />
              </div>

              {/* Customer Details */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#e9edef] lg:text-base lg:text-white">
                  {activeChat.name}
                </p>

                <p className="truncate text-[11px] text-[#8696a0] lg:text-xs">
                  {isTyping ? (
                    <span className="text-[#00a884] lg:text-[#52f0ac]">
                      typing...
                    </span>
                  ) : (
                    activeChat.status
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setShowMobileContext(true)}
                className="text-[#aebac1] transition hover:text-white lg:hidden"
                aria-label="Vehicle information"
              >
                <Info size={20} />
              </button>

              <button
                type="button"
                className="text-[#aebac1] transition hover:text-white lg:hidden"
                aria-label="More options"
              >
                <MoreVertical size={21} />
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 space-y-2 overflow-y-auto bg-[#0b141a] px-3 py-4 sm:px-4 lg:space-y-6 lg:bg-[#0b0e14] lg:p-8">
            {activeChat.messages.map((msg, index) => (
              <div
                key={`${msg.time}-${index}`}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`relative max-w-[85%] rounded-lg px-3 py-2 pb-5 text-[13px] leading-relaxed shadow-sm sm:max-w-[75%] sm:text-sm lg:max-w-xl lg:rounded-xl lg:px-4 lg:py-3 lg:pb-6 ${
                    msg.sender === "user"
                      ? "rounded-tl-none bg-[#202c33] text-[#e9edef] lg:border lg:border-[#1a1f26] lg:bg-[#15191f] lg:text-[#a0a8b7]"
                      : "rounded-tr-none bg-[#005c4b] text-[#e9edef] lg:bg-[#1a2e26] lg:text-[#52f0ac]"
                  }`}
                >
                  <p className="break-words pr-7">{msg.text}</p>

                  <span className="absolute bottom-1.5 right-2 text-[9px] text-white/55 lg:text-[#6e7681]">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ================================================= */}
          {/* ATTACHMENT MENU */}
          {/* ================================================= */}
          {showMenu && (
            <div className="absolute bottom-[70px] left-2 right-2 z-30 grid grid-cols-4 gap-4 rounded-2xl border border-[#26353d] bg-[#202c33] p-4 shadow-2xl sm:left-4 sm:right-4 lg:bottom-28 lg:left-8 lg:right-8 lg:border-[#1a1f26] lg:bg-[#15191f] lg:p-6">
              {attachmentItems.map((item) => {
                const AttachmentIcon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.label}
                    className="flex min-w-0 flex-col items-center gap-2 text-[#00a884] transition hover:text-white lg:text-[#52f0ac]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#26353d] sm:h-12 sm:w-12 lg:bg-[#1a2e26]">
                      <AttachmentIcon size={19} />
                    </div>

                    <span className="w-full truncate text-center text-[9px] sm:text-[10px]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ================================================= */}
          {/* MESSAGE INPUT */}
          {/* WhatsApp Style on Mobile */}
          {/* ================================================= */}
          <div className="shrink-0 bg-[#111b21] p-2 lg:border-t lg:border-[#1a1f26] lg:bg-[#0b0e14] lg:p-6 xl:p-8">
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#202c33] px-4 py-2.5 lg:rounded-xl lg:border lg:border-[#1a1f26] lg:bg-[#15191f] lg:px-4 lg:py-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenu((previousState) => !previousState)
                  }
                  className={`shrink-0 transition ${
                    showMenu
                      ? "text-[#00a884] lg:text-[#52f0ac]"
                      : "text-[#8696a0]"
                  }`}
                  aria-label="Open attachments"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0] lg:text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#06a57f] lg:rounded-lg lg:bg-[#1a2e26] lg:text-[#52f0ac]"
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </div>
          </div>
        </main>

        {/* ================================================= */}
        {/* DESKTOP VEHICLE CONTEXT */}
        {/* ================================================= */}
        <aside
          key={activeChat.id}
          className="hidden h-full w-72 shrink-0 flex-col overflow-y-auto border-l border-[#1a1f26] bg-[#0b0e14] p-5 lg:flex xl:w-80 xl:p-6"
        >
          <div className="mb-6 text-[10px] tracking-[0.2em] text-[#8b949e]">
            LIVE VEHICLE CONTEXT
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {vehicleDetails.map((item) => {
              const DetailIcon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  className="flex items-center gap-4 rounded-xl border border-[#1a1f26] bg-[#15191f] p-4"
                >
                  <div className="rounded-lg bg-[#0b0e14] p-2">
                    <DetailIcon
                      size={19}
                      className={
                        item.isAlert
                          ? "text-[#e78181]"
                          : "text-[#52f0ac]"
                      }
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] text-[#6e7681]">
                      {item.label}
                    </p>

                    <p className="truncate text-sm font-bold text-white">
                      {item.val}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-auto pt-8">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="w-full rounded-lg border border-[#1a1f26] py-3 text-xs uppercase tracking-widest transition hover:bg-[#15191f]"
            >
              View full service history
            </button>
          </div>
        </aside>
      </div>

      {/* ================================================= */}
      {/* MOBILE VEHICLE CONTEXT MODAL */}
      {/* ================================================= */}
      {showMobileContext && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/75 lg:hidden"
          onClick={() => setShowMobileContext(false)}
        >
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border-t border-[#26353d] bg-[#111b21] p-4 sm:mx-auto sm:mb-5 sm:max-w-lg sm:rounded-2xl sm:border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-[0.2em] text-[#8696a0]">
                  LIVE VEHICLE CONTEXT
                </p>

                <h2 className="mt-1 text-base font-semibold text-[#e9edef]">
                  {activeChat.name}
                </h2>

                <p className="mt-0.5 text-xs text-[#8696a0]">
                  {activeChat.vehicle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileContext(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202c33] text-[#aebac1] transition hover:text-white"
                aria-label="Close vehicle information"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {vehicleDetails.map((item) => {
                const DetailIcon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-[#26353d] bg-[#202c33] p-3"
                  >
                    <div className="rounded-lg bg-[#111b21] p-2">
                      <DetailIcon
                        size={18}
                        className={
                          item.isAlert
                            ? "text-[#e78181]"
                            : "text-[#00a884]"
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] text-[#8696a0]">
                        {item.label}
                      </p>

                      <p className="truncate text-xs font-semibold text-[#e9edef]">
                        {item.val}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMobileContext(false);
                setIsHistoryOpen(true);
              }}
              className="mt-5 w-full rounded-lg bg-[#00a884] py-3 text-[11px] font-semibold uppercase tracking-widest text-white transition hover:bg-[#06a57f]"
            >
              View full service history
            </button>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* SERVICE HISTORY MODAL */}
      {/* ================================================= */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-5"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#26353d] bg-[#111b21] p-5 sm:rounded-2xl sm:p-7 lg:border-[#1a1f26] lg:bg-[#15191f]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#202c33] text-[#aebac1] transition hover:text-white"
              aria-label="Close service history"
            >
              <X size={19} />
            </button>

            <h2 className="mb-2 pr-12 text-base font-semibold text-[#e9edef] sm:text-lg lg:text-white">
              Service History
            </h2>

            <p className="mb-5 text-xs text-[#8696a0]">
              {activeChat.name} · {activeChat.vehicle}
            </p>

            <ul className="space-y-3">
              {activeChat.history.map((historyItem, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-[#26353d] bg-[#202c33] p-3 text-xs text-[#e9edef] sm:p-4 sm:text-sm lg:border-[#1a1f26] lg:bg-[#0b0e14] lg:text-[#52f0ac]"
                >
                  <Wrench
                    size={16}
                    className="mt-0.5 shrink-0 text-[#00a884] lg:text-[#52f0ac]"
                  />

                  <span>{historyItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;