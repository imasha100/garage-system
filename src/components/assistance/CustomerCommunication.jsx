import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:5000/api";

const getStoredAssistanceUser = () => {
  try {
    const storedStaffUser = sessionStorage.getItem("staffUser");

    if (!storedStaffUser) {
      return null;
    }

    const staffUser = JSON.parse(storedStaffUser);
    const assistanceId = Number(staffUser?.staffId);

    if (
      String(staffUser?.role || "").toLowerCase() !== "assistance" ||
      !Number.isInteger(assistanceId) ||
      assistanceId <= 0
    ) {
      return null;
    }

    return {
      ...staffUser,
      staffId: assistanceId,
    };
  } catch (error) {
    console.error("Unable to read assistance session:", error);
    return null;
  }
};

const formatDisplayTime = (value) => {
  if (!value) {
    return "";
  }

  const [hours = "0", minutes = "00"] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not Available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeConversation = (conversation) => ({
  id: conversation.requestId,
  requestId: conversation.requestId,
  ticketNumber: conversation.ticketNumber || "",
  customerId: conversation.customerId ?? null,
  name: conversation.customerName || "Customer",
  contact: conversation.customerContact || "",
  vehicleId: conversation.vehicleId ?? null,
  vehicleNumber: conversation.vehicleNumber || "Not Available",
  vehicleType: conversation.vehicleType || "Vehicle",
  vehicleModel: conversation.vehicleModel || "",
  requestType: conversation.requestType || "Garage Service",
  requestStatus: conversation.requestStatus || "Pending",
  status: conversation.jobStatus || conversation.requestStatus || "Pending",
  assistanceId: conversation.assistanceId ?? null,
  assistanceName: conversation.assistanceName || "",
  garageId: conversation.garageId ?? null,
  garageName: conversation.garageName || "",
  jobId: conversation.jobId ?? null,
  jobType: conversation.jobType || "",
  technicianId: conversation.technicianId ?? null,
  technician: conversation.technicianName || "Not Assigned",
  startDate: conversation.startDate || null,
  startTime: conversation.startTime || null,
  endDate: conversation.endDate || null,
  endTime: conversation.endTime || null,
  estimatedCompletionTime:
    conversation.estimatedCompletionTime || null,
  actualCompletionTime:
    conversation.actualCompletionTime || null,
  remarks: conversation.remarks || "",
  unreadCount: Number(conversation.unreadCount) || 0,
  lastMessage: conversation.lastMessage || "",
  lastMessageSender: conversation.lastMessageSender || "",
  lastMessageDate: conversation.lastMessageDate || null,
  lastMessageTime: conversation.lastMessageTime || null,
  messages: [],
  history: [],
});

const normalizeMessage = (message) => ({
  id: message.chatId,
  sender:
    String(message.senderType || "").toLowerCase() === "customer"
      ? "user"
      : "ai",
  senderType: message.senderType || "",
  text: message.message || "",
  sentDate: message.sentDate || null,
  sentTime: message.sentTime || null,
  time: formatDisplayTime(message.sentTime),
  status: message.messageStatus || "Sent",
});

const ChatInterface = ({
  openSidebar,
  searchQuery = "",
  setSearchQuery = () => {},
}) => {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [mobileView, setMobileView] = useState("list");

  const [garageId, setGarageId] = useState(null);
  const [assistanceId, setAssistanceId] = useState(null);

  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const activeChat = useMemo(
    () =>
      conversations.find((chat) => chat.id === activeChatId) ||
      conversations[0] ||
      null,
    [conversations, activeChatId]
  );

  const loadLoggedInOfficer = useCallback(async () => {
    const staffUser = getStoredAssistanceUser();

    if (!staffUser) {
      throw new Error(
        "Logged-in assistance officer details were not found."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/assistances/${staffUser.staffId}`
    );

    const result = await response.json();

    if (!response.ok || result.success === false || !result.assistance) {
      throw new Error(
        result.message || "Unable to load assistance officer details."
      );
    }

    const resolvedGarageId = Number(
      result.assistance.garageId ??
        result.assistance.garage_id ??
        result.assistance.garageGarageId ??
        result.assistance.garage_garage_id
    );

    if (
      !Number.isInteger(resolvedGarageId) ||
      resolvedGarageId <= 0
    ) {
      throw new Error(
        "The garage related to this assistance officer could not be identified."
      );
    }

    setAssistanceId(staffUser.staffId);
    setGarageId(resolvedGarageId);

    return {
      assistanceId: staffUser.staffId,
      garageId: resolvedGarageId,
    };
  }, []);

  const loadConversations = useCallback(
    async (selectedGarageId = garageId, preserveSelection = true) => {
      if (!selectedGarageId) {
        return;
      }

      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/chats/garage/${selectedGarageId}`
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load customer conversations."
          );
        }

        const normalizedConversations = Array.isArray(result.conversations)
          ? result.conversations.map(normalizeConversation)
          : [];

        setConversations(normalizedConversations);

        setActiveChatId((currentId) => {
          if (
            preserveSelection &&
            normalizedConversations.some((chat) => chat.id === currentId)
          ) {
            return currentId;
          }

          return normalizedConversations[0]?.id ?? null;
        });
      } catch (loadError) {
        console.error("Load conversations error:", loadError);
        setError(
          loadError.message || "Unable to load customer conversations."
        );
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [garageId]
  );

  const loadMessages = useCallback(
    async (requestId, markAsRead = false) => {
      if (!requestId) {
        setMessages([]);
        return;
      }

      try {
        setIsLoadingMessages(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/chats/${requestId}/messages`
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load chat messages."
          );
        }

        setMessages(
          Array.isArray(result.messages)
            ? result.messages.map(normalizeMessage)
            : []
        );

        if (markAsRead) {
          const readResponse = await fetch(
            `${API_BASE_URL}/chats/${requestId}/read`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                readerType: "Assistance",
              }),
            }
          );

          const readResult = await readResponse.json();

          if (
            !readResponse.ok ||
            readResult.success === false
          ) {
            throw new Error(
              readResult.message ||
                "Unable to mark customer messages as read."
            );
          }

          setConversations((previousConversations) =>
            previousConversations.map((chat) =>
              chat.id === requestId
                ? {
                    ...chat,
                    unreadCount: 0,
                  }
                : chat
            )
          );
        }
      } catch (loadError) {
        console.error("Load chat messages error:", loadError);
        setError(loadError.message || "Unable to load chat messages.");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initialise = async () => {
      setIsLoadingConversations(true);

      try {
        const officer = await loadLoggedInOfficer();

        if (isMounted && officer?.garageId) {
          await loadConversations(officer.garageId, false);
        }
      } catch (initialiseError) {
        console.error("Initialise chat error:", initialiseError);

        if (isMounted) {
          setError(
            initialiseError.message ||
              "Unable to initialise customer communication."
          );
          setIsLoadingConversations(false);
        }
      }
    };

    initialise();

    return () => {
      isMounted = false;
    };
  }, [loadLoggedInOfficer, loadConversations]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    loadMessages(activeChatId, true);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!garageId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadConversations(garageId, true);

      if (activeChatId) {
        loadMessages(activeChatId, true);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    garageId,
    activeChatId,
    loadConversations,
    loadMessages,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((chat) =>
      [
        chat.name,
        chat.contact,
        chat.vehicleNumber,
        chat.vehicleType,
        chat.vehicleModel,
        chat.status,
        chat.technician,
        chat.ticketNumber,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [conversations, searchQuery]);

  const handleSendMessage = async () => {
    const message = inputValue.trim();

    if (!message || !activeChat || !assistanceId || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/chats/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: activeChat.requestId,
          senderType: "Assistance",
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to send the message."
        );
      }

      setInputValue("");
      setShowMenu(false);

      await loadMessages(activeChat.requestId, true);
      await loadConversations(garageId, true);
    } catch (sendError) {
      console.error("Send message error:", sendError);
      setError(sendError.message || "Unable to send the message.");
    } finally {
      setIsSending(false);
    }
  };

  const selectConversation = (chatId) => {
    setActiveChatId(chatId);
    setShowMenu(false);
    setShowMobileContext(false);
    setMobileView("chat");
  };

  const handleBackToConversations = () => {
    setMobileView("list");
    setShowMenu(false);
    setShowMobileContext(false);
  };

  const getLastMessage = (chat) => ({
    text: chat.lastMessage || "No messages yet",
    time: formatDisplayTime(chat.lastMessageTime),
  });

  const activeVehicleLabel = activeChat
    ? `${activeChat.vehicleModel || activeChat.vehicleType}${
        activeChat.vehicleNumber
          ? ` (${activeChat.vehicleNumber})`
          : ""
      }`
    : "";

  const vehicleDetails = activeChat
    ? [
        {
          icon: Info,
          label: "REGISTRATION",
          val: activeChat.vehicleNumber || "Not Available",
        },
        {
          icon: Car,
          label: "MODEL",
          val:
            activeChat.vehicleModel ||
            activeChat.vehicleType ||
            "Not Available",
        },
        {
          icon: Wrench,
          label: "TECHNICIAN",
          val: activeChat.technician || "Not Assigned",
        },
        {
          icon: Play,
          label: "START TIME",
          val: activeChat.startTime
            ? formatDisplayTime(activeChat.startTime)
            : "Not Available",
        },
        {
          icon: AlertCircle,
          label: "STATUS",
          val: activeChat.status || "Pending",
          isAlert: true,
        },
        {
          icon: Clock,
          label: "COMPLETION",
          val:
            activeChat.actualCompletionTime
              ? formatDateTime(activeChat.actualCompletionTime)
              : activeChat.estimatedCompletionTime
              ? formatDateTime(activeChat.estimatedCompletionTime)
              : "Not Available",
        },
      ]
    : [];

  const attachmentItems = [
    { icon: Image, label: "Gallery" },
    { icon: Camera, label: "Camera" },
    { icon: MapPin, label: "Location" },
    { icon: User, label: "Contact" },
    { icon: FileText, label: "Document" },
    { icon: BarChart, label: "Poll" },
    { icon: Calendar, label: "Event" },
    { icon: Sparkles, label: "AI Images" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0b0e14] font-sans text-[#a0a8b7]">
      {error && (
        <div className="flex shrink-0 items-center justify-between border-b border-red-500/30 bg-red-950/40 px-4 py-2 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-300 hover:text-white"
            aria-label="Close error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#0b0e14]">
        <aside
          className={`h-full w-full shrink-0 flex-col border-[#1a1f26] bg-[#0b0e14] lg:flex lg:w-72 lg:border-r xl:w-80 ${
            mobileView === "list" ? "flex" : "hidden"
          }`}
        >
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
                  onClick={() => loadConversations(garageId, true)}
                  className="text-[#aebac1] transition hover:text-white"
                  aria-label="Refresh conversations"
                >
                  <RefreshCw
                    size={19}
                    className={
                      isLoadingConversations ? "animate-spin" : ""
                    }
                  />
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

            <div className="px-3 pb-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                />

                <input
                  type="text"
                  placeholder="Search customer or vehicle"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  className="w-full rounded-lg bg-[#202c33] py-2.5 pl-11 pr-10 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden p-5 lg:block">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#8b949e]">
                Active Conversations
              </div>

              <button
                type="button"
                onClick={() => loadConversations(garageId, true)}
                className="text-[#6e7681] transition hover:text-white"
                aria-label="Refresh conversations"
              >
                <RefreshCw
                  size={16}
                  className={
                    isLoadingConversations ? "animate-spin" : ""
                  }
                />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-[#8696a0]">
                <RefreshCw size={24} className="animate-spin" />
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#26353d] text-[#00a884] lg:hidden">
                      <User size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[15px] font-medium text-[#e9edef] lg:text-base lg:text-white">
                          {chat.name}
                        </p>

                        <span className="shrink-0 text-[11px] text-[#8696a0] lg:hidden">
                          {lastMessage.time}
                        </span>
                      </div>

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

                      <p className="mt-1 hidden truncate text-xs text-[#a0a8b7] lg:block">
                        {chat.vehicleModel || chat.vehicleType}{" "}
                        {chat.vehicleNumber
                          ? `(${chat.vehicleNumber})`
                          : ""}
                      </p>

                      <p className="mt-2 hidden text-[10px] uppercase tracking-wider text-[#52f0ac] lg:block">
                        {chat.status}
                      </p>

                      {chat.unreadCount > 0 && (
                        <span className="mt-2 hidden w-fit rounded-full bg-[#52f0ac] px-2 py-0.5 text-[9px] font-bold text-black lg:block">
                          {chat.unreadCount} NEW
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-[#8696a0]">
                {searchQuery
                  ? "No conversation matches your search."
                  : "No customer conversations found for this garage."}
              </div>
            )}
          </div>
        </aside>

        <main
          className={`relative min-h-0 flex-1 flex-col bg-[#0b141a] lg:flex lg:bg-[#0b0e14] ${
            mobileView === "chat" ? "flex" : "hidden"
          }`}
        >
          {activeChat ? (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1f2c33] bg-[#202c33] px-2.5 lg:h-20 lg:border-[#1a1f26] lg:bg-[#0b0e14] lg:px-6 xl:px-8">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className="flex h-10 w-8 shrink-0 items-center justify-center text-[#aebac1] transition hover:text-white lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={23} />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#26353d] text-[#00a884] lg:bg-[#1a2e26] lg:text-[#52f0ac]">
                    <User size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#e9edef] lg:text-base lg:text-white">
                      {activeChat.name}
                    </p>

                    <p className="truncate text-[11px] text-[#8696a0] lg:text-xs">
                      {activeChat.status}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      loadMessages(activeChat.requestId, true)
                    }
                    className="text-[#aebac1] transition hover:text-white"
                    aria-label="Refresh messages"
                  >
                    <RefreshCw
                      size={19}
                      className={
                        isLoadingMessages ? "animate-spin" : ""
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMobileContext(true)}
                    className="text-[#aebac1] transition hover:text-white lg:hidden"
                    aria-label="Vehicle information"
                  >
                    <Info size={20} />
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto bg-[#0b141a] px-3 py-4 sm:px-4 lg:space-y-6 lg:bg-[#0b0e14] lg:p-8">
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[#8696a0]">
                    <RefreshCw size={24} className="animate-spin" />
                    Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`relative max-w-[85%] rounded-lg px-3 py-2 pb-5 text-[13px] leading-relaxed shadow-sm sm:max-w-[75%] sm:text-sm lg:max-w-xl lg:rounded-xl lg:px-4 lg:py-3 lg:pb-6 ${
                          message.sender === "user"
                            ? "rounded-tl-none bg-[#202c33] text-[#e9edef] lg:border lg:border-[#1a1f26] lg:bg-[#15191f] lg:text-[#a0a8b7]"
                            : "rounded-tr-none bg-[#005c4b] text-[#e9edef] lg:bg-[#1a2e26] lg:text-[#52f0ac]"
                        }`}
                      >
                        <p className="break-words pr-7">
                          {message.text}
                        </p>

                        <span className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[9px] text-white/55 lg:text-[#6e7681]">
                          <span>
                            {message.time}
                          </span>

                          {message.sender !== "user" && (
                            <span
                              className={
                                String(
                                  message.status || ""
                                )
                                  .trim()
                                  .toLowerCase() === "read"
                                  ? "font-black text-cyan-300"
                                  : "font-black text-white/55 lg:text-[#6e7681]"
                              }
                              title={
                                String(
                                  message.status || ""
                                )
                                  .trim()
                                  .toLowerCase() === "read"
                                  ? "Read by Customer"
                                  : "Sent"
                              }
                            >
                              {String(
                                message.status || ""
                              )
                                .trim()
                                .toLowerCase() === "read"
                                ? "✓✓"
                                : "✓"}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2e26] text-[#52f0ac]">
                      <Send size={23} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-white">
                      Start the conversation
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#8696a0]">
                      Send the first update about this service request.
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

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

              <div className="shrink-0 bg-[#111b21] p-2 lg:border-t lg:border-[#1a1f26] lg:bg-[#0b0e14] lg:p-6 xl:p-8">
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#202c33] px-4 py-2.5 lg:rounded-xl lg:border lg:border-[#1a1f26] lg:bg-[#15191f] lg:px-4 lg:py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowMenu(
                          (previousState) => !previousState
                        )
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
                      onChange={(event) =>
                        setInputValue(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Message"
                      maxLength={500}
                      disabled={isSending}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0] disabled:opacity-60 lg:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={
                      !inputValue.trim() || isSending
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#06a57f] disabled:cursor-not-allowed disabled:opacity-50 lg:rounded-lg lg:bg-[#1a2e26] lg:text-[#52f0ac]"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={19} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <User size={40} className="text-[#52f0ac]" />

              <h2 className="mt-4 text-xl font-semibold text-white">
                Select a conversation
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8696a0]">
                Choose a customer conversation from the left side.
              </p>
            </div>
          )}
        </main>

        <aside
          key={activeChat?.id || "empty"}
          className="hidden h-full w-72 shrink-0 flex-col overflow-y-auto border-l border-[#1a1f26] bg-[#0b0e14] p-5 lg:flex xl:w-80 xl:p-6"
        >
          {activeChat ? (
            <>
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

                        <p className="break-words text-sm font-bold text-white">
                          {item.val}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="mt-5 rounded-xl border border-[#1a1f26] bg-[#15191f] p-4">
                <p className="text-[9px] text-[#6e7681]">
                  CUSTOMER CONTACT
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {activeChat.contact || "Not Available"}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[#1a1f26] bg-[#15191f] p-4">
                <p className="text-[9px] text-[#6e7681]">
                  SERVICE REQUEST
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {activeChat.ticketNumber ||
                    `Request ${activeChat.requestId}`}
                </p>

                <p className="mt-2 text-xs text-[#8b949e]">
                  {activeChat.requestType}
                </p>
              </div>

              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="w-full rounded-lg border border-[#1a1f26] py-3 text-xs uppercase tracking-widest transition hover:bg-[#15191f]"
                >
                  View full service details
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-[#8696a0]">
              No conversation selected.
            </div>
          )}
        </aside>
      </div>

      {showMobileContext && activeChat && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/75 lg:hidden"
          onClick={() => setShowMobileContext(false)}
        >
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border-t border-[#26353d] bg-[#111b21] p-4 sm:mx-auto sm:mb-5 sm:max-w-lg sm:rounded-2xl sm:border"
            onClick={(event) => event.stopPropagation()}
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
                  {activeVehicleLabel}
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

                      <p className="break-words text-xs font-semibold text-[#e9edef]">
                        {item.val}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && activeChat && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-5"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#26353d] bg-[#111b21] p-5 sm:rounded-2xl sm:p-7 lg:border-[#1a1f26] lg:bg-[#15191f]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#202c33] text-[#aebac1] transition hover:text-white"
              aria-label="Close service details"
            >
              <X size={19} />
            </button>

            <h2 className="mb-2 pr-12 text-base font-semibold text-[#e9edef] sm:text-lg lg:text-white">
              Service Details
            </h2>

            <p className="mb-5 text-xs text-[#8696a0]">
              {activeChat.name} · {activeVehicleLabel}
            </p>

            <div className="space-y-3">
              {[
                ["Ticket Number", activeChat.ticketNumber || "Not Available"],
                ["Request Type", activeChat.requestType],
                ["Request Status", activeChat.requestStatus],
                ["Job Status", activeChat.status],
                ["Technician", activeChat.technician],
                [
                  "Start Time",
                  activeChat.startTime
                    ? formatDisplayTime(activeChat.startTime)
                    : "Not Available",
                ],
                [
                  "Estimated Completion",
                  activeChat.estimatedCompletionTime
                    ? formatDateTime(
                        activeChat.estimatedCompletionTime
                      )
                    : "Not Available",
                ],
                ["Remarks", activeChat.remarks || "No remarks"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#26353d] bg-[#202c33] p-4 lg:border-[#1a1f26] lg:bg-[#0b0e14]"
                >
                  <p className="text-[9px] uppercase tracking-wider text-[#8696a0]">
                    {label}
                  </p>

                  <p className="mt-1 text-sm text-[#e9edef] lg:text-[#52f0ac]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;