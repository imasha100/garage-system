import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Camera,
  FileText,
  Image,
  MapPin,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Send,
  User,
  Wrench,
  X,
} from "lucide-react";

const API_BASE_URL =
  "http://localhost:5000/api";

// ======================================================
// SAFE STORAGE HELPERS
// ======================================================

const safeJsonParse = (
  value,
  fallback = null
) => {
  try {
    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
};

// ======================================================
// TIME FORMAT
// ======================================================

const formatDisplayTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const [
    hours = "0",
    minutes = "00",
  ] = String(value).split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ======================================================
// NORMALIZE MESSAGE
// ======================================================

const normalizeMessage = (
  message
) => ({
  id:
    message.chatId ??
    message.chat_id ??
    `${message.sentDate || ""}-${message.sentTime || ""}-${message.message || ""}`,

  senderType:
    String(
      message.senderType ??
        message.sender_type ??
        ""
    )
      .trim()
      .toLowerCase(),

  text:
    message.message ??
    message.messageContent ??
    message.message_content ??
    "",

  sentDate:
    message.sentDate ??
    message.sent_date ??
    null,

  sentTime:
    message.sentTime ??
    message.sent_time ??
    null,

  status:
    message.messageStatus ??
    message.message_status ??
    "Sent",
});

// ======================================================
// COMPONENT
// ======================================================

export default function ChatWithAssistance() {
  const [
    requestDetails,
    setRequestDetails,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    inputValue,
    setInputValue,
  ] = useState("");

  const [
    showAttachmentMenu,
    setShowAttachmentMenu,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const messagesEndRef =
    useRef(null);

  const messagesContainerRef =
    useRef(null);

  // ======================================================
  // GET CURRENT CUSTOMER REQUEST
  // ======================================================

  const getCurrentRequest =
    useCallback(() => {
      const latestServiceRequest =
        safeJsonParse(
          sessionStorage.getItem(
            "latestServiceRequest"
          ),
          null
        );

      const currentCustomerRequest =
        safeJsonParse(
          localStorage.getItem(
            "currentCustomerRequest"
          ),
          null
        );

      const latestCompletedJob =
        safeJsonParse(
          sessionStorage.getItem(
            "latestCompletedJob"
          ),
          null
        );

      const source =
        latestServiceRequest ||
        currentCustomerRequest ||
        latestCompletedJob;

      if (!source) {
        return null;
      }

      const requestId =
        Number(
          source.requestId ??
            source.request_id ??
            source.serviceRequestId ??
            source.service_request_id
        );

      if (
        !Number.isInteger(
          requestId
        ) ||
        requestId <= 0
      ) {
        return null;
      }

      return {
        ...source,

        requestId,

        customerName:
          source.customerName ??
          source.fullName ??
          source.name ??
          "Customer",

        ticketNumber:
          source.ticketNumber ??
          source.ticket_number ??
          `REQ-${requestId}`,

        vehicleNumber:
          source.vehicleNumber ??
          source.vehicle_number ??
          source.vehicleNum ??
          "-",

        vehicleType:
          source.vehicleType ??
          source.vehicle_type ??
          "Vehicle",

        vehicleModel:
          source.vehicleModel ??
          source.vehicle_model ??
          "",

        requestStatus:
          source.requestStatus ??
          source.request_status ??
          source.status ??
          "Active",

        assistanceName:
          source.assistanceName ??
          source.assistance_name ??
          source.assistanceOfficerName ??
          "Assistance Officer",

        assistanceId:
          source.assistanceId ??
          source.assistance_id ??
          null,

        garageName:
          source.garageName ??
          source.garage_name ??
          "",
      };
    }, []);

  // ======================================================
  // LOAD MESSAGES
  // ======================================================

  const loadMessages =
    useCallback(
      async (
        requestId,
        showRefresh = false
      ) => {
        if (!requestId) {
          setMessages([]);
          return;
        }

        try {
          if (showRefresh) {
            setIsRefreshing(
              true
            );
          }

          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/chats/${requestId}/messages`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success ===
              false
          ) {
            throw new Error(
              result.message ||
                "Unable to load chat messages."
            );
          }

          const normalizedMessages =
            Array.isArray(
              result.messages
            )
              ? result.messages.map(
                  normalizeMessage
                )
              : [];

          setMessages(
            normalizedMessages
          );
        } catch (loadError) {
          console.error(
            "Load customer chat messages error:",
            loadError
          );

          setError(
            loadError.message ||
              "Unable to load chat messages."
          );
        } finally {
          setIsLoading(false);

          if (showRefresh) {
            setIsRefreshing(
              false
            );
          }
        }
      },
      []
    );

  // ======================================================
  // MARK ASSISTANCE MESSAGES AS READ
  // ======================================================

  const markReceivedMessagesAsRead =
    useCallback(
      async (requestId) => {
        if (!requestId) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/chats/${requestId}/read`,
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    readerType:
                      "Customer",
                  }),
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Unable to mark assistance messages as read."
            );
          }
        } catch (readError) {
          console.error(
            "Mark assistance messages as read error:",
            readError
          );
        }
      },
      []
    );

  // ======================================================
  // INITIALIZE CHAT
  // ======================================================

  useEffect(() => {
    const initialiseChat =
      async () => {
        const currentRequest =
          getCurrentRequest();

        setRequestDetails(
          currentRequest
        );

        if (!currentRequest) {
          setIsLoading(false);
          return;
        }

        await markReceivedMessagesAsRead(
          currentRequest.requestId
        );

        await loadMessages(
          currentRequest.requestId
        );
      };

    initialiseChat();
  }, [
    getCurrentRequest,
    loadMessages,
    markReceivedMessagesAsRead,
  ]);

  // ======================================================
  // AUTO REFRESH
  // ======================================================

  useEffect(() => {
    if (
      !requestDetails?.requestId
    ) {
      return undefined;
    }

    const refreshConversation =
      async () => {
        await markReceivedMessagesAsRead(
          requestDetails.requestId
        );

        await markReceivedMessagesAsRead(
          requestDetails.requestId
        );

        await loadMessages(
          requestDetails.requestId,
          false
        );
      };

    const intervalId =
      window.setInterval(
        refreshConversation,
        5000
      );

    return () =>
      window.clearInterval(
        intervalId
      );
  }, [
    requestDetails,
    loadMessages,
    markReceivedMessagesAsRead,
  ]);

  // ======================================================
  // AUTO SCROLL
  // ======================================================

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const handleSendMessage =
    async () => {
      const message =
        inputValue.trim();

      if (
        !message ||
        !requestDetails?.requestId ||
        isSending
      ) {
        return;
      }

      try {
        setIsSending(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/chats/messages`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  requestId:
                    requestDetails.requestId,

                  senderType:
                    "Customer",

                  message,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success ===
            false
        ) {
          throw new Error(
            result.message ||
              "Unable to send the message."
          );
        }

        setInputValue("");
        setShowAttachmentMenu(
          false
        );

        await loadMessages(
          requestDetails.requestId,
          false
        );
      } catch (sendError) {
        console.error(
          "Send customer message error:",
          sendError
        );

        setError(
          sendError.message ||
            "Unable to send the message."
        );
      } finally {
        setIsSending(false);
      }
    };

  // ======================================================
  // NO REQUEST
  // ======================================================

  if (!requestDetails) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-800 bg-[#0c0d19] p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
            <MessageCircle
              size={30}
              className="text-blue-400"
            />
          </div>

          <h1 className="mt-5 text-2xl font-black text-white">
            Chat with Assistance
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            No active service request was found. Start a service request first to chat with an assistance officer.
          </p>
        </div>
      </div>
    );
  }

  const assistanceName =
    requestDetails.assistanceName ||
    "Assistance Officer";

  const vehicleLabel =
    [
      requestDetails.vehicleModel,
      requestDetails.vehicleType,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Vehicle";

  // ======================================================
  // ATTACHMENT MENU
  // ======================================================

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
  ];

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="mx-auto flex h-[calc(100vh-190px)] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0e14] shadow-2xl">
      {/* HEADER */}

      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#101722] px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Wrench
              size={20}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white sm:text-base">
              {assistanceName}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <p className="truncate text-[10px] uppercase tracking-wider text-emerald-400">
                Assistance Support
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadMessages(
              requestDetails.requestId,
              true
            )
          }
          disabled={
            isRefreshing
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0a0e16] text-slate-400 transition hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh messages"
        >
          <RefreshCw
            size={17}
            className={
              isRefreshing
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* REQUEST CONTEXT */}

      <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-slate-800 bg-[#0a0e16] px-4 py-3 text-[10px] sm:grid-cols-3 sm:px-6">
        <div>
          <p className="uppercase tracking-wider text-slate-600">
            Ticket
          </p>

          <p className="mt-1 font-bold text-blue-300">
            {requestDetails.ticketNumber}
          </p>
        </div>

        <div>
          <p className="uppercase tracking-wider text-slate-600">
            Vehicle
          </p>

          <p className="mt-1 truncate font-bold text-white">
            {vehicleLabel}
            {requestDetails.vehicleNumber
              ? ` (${requestDetails.vehicleNumber})`
              : ""}
          </p>
        </div>

        <div>
          <p className="uppercase tracking-wider text-slate-600">
            Request Status
          </p>

          <p className="mt-1 font-bold text-emerald-400">
            {requestDetails.requestStatus}
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex shrink-0 items-center justify-between border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 sm:px-6">
          <div className="flex items-center gap-2">
            <AlertCircle
              size={15}
            />

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="font-bold text-red-200 transition hover:text-white"
          >
            CLOSE
          </button>
        </div>
      )}

      {/* MESSAGES */}

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#090d13] px-3 py-5 sm:px-6"
      >
        {isLoading &&
        messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <RefreshCw
              size={24}
              className="animate-spin"
            />

            Loading messages...
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map(
              (message) => {
                const isCustomer =
                  message.senderType ===
                  "customer";

                return (
                  <div
                    key={
                      message.id
                    }
                    className={`flex ${
                      isCustomer
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[88%] rounded-2xl px-4 py-3 pb-6 text-sm leading-6 shadow-md sm:max-w-[72%] ${
                        isCustomer
                          ? "rounded-br-sm border border-blue-500/20 bg-blue-600/20 text-blue-50"
                          : "rounded-bl-sm border border-slate-700 bg-[#151b24] text-slate-200"
                      }`}
                    >
                      <p className="break-words">
                        {message.text}
                      </p>

                      <span
                        className={`absolute bottom-1.5 right-3 flex items-center gap-1 text-[9px] ${
                          isCustomer
                            ? "text-blue-200/60"
                            : "text-slate-500"
                        }`}
                      >
                        <span>
                          {formatDisplayTime(
                            message.sentTime
                          )}
                        </span>

                        {isCustomer && (
                          <span
                            className={
                              String(
                                message.status ||
                                  ""
                              )
                                .trim()
                                .toLowerCase() ===
                              "read"
                                ? "font-black text-cyan-300"
                                : "font-black text-blue-200/60"
                            }
                            title={
                              String(
                                message.status ||
                                  ""
                              )
                                .trim()
                                .toLowerCase() ===
                              "read"
                                ? "Read by Assistance"
                                : "Sent"
                            }
                          >
                            {String(
                              message.status ||
                                ""
                            )
                              .trim()
                              .toLowerCase() ===
                            "read"
                              ? "✓✓"
                              : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <MessageCircle
                size={28}
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              Start the Conversation
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Send a message to your assistance officer about your current service request.
            </p>
          </div>
        )}
      </div>

      {/* ATTACHMENT MENU */}

      {showAttachmentMenu && (
        <div className="relative shrink-0 border-t border-slate-800 bg-[#0d131d] px-3 pt-3 sm:px-4">
          <div className="absolute bottom-3 left-3 z-30 w-[min(92vw,360px)] rounded-2xl border border-slate-700 bg-[#141b26] p-4 shadow-2xl sm:left-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Attach
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAttachmentMenu(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Close attachments"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {attachmentItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={
                        item.label
                      }
                      onClick={() => {
                        setShowAttachmentMenu(
                          false
                        );
                      }}
                      className="flex min-w-0 flex-col items-center gap-2 rounded-xl p-2 text-blue-300 transition hover:bg-blue-500/10 hover:text-white"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                        <Icon
                          size={18}
                        />
                      </div>

                      <span className="w-full truncate text-center text-[8px] font-bold uppercase tracking-wide">
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE INPUT */}

      <div className="shrink-0 border-t border-slate-800 bg-[#101722] p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-700 bg-[#080c12] px-3 py-1 transition focus-within:border-blue-500">
            <button
              type="button"
              onClick={() =>
                setShowAttachmentMenu(
                  (previous) =>
                    !previous
                )
              }
              className={`mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                showAttachmentMenu
                  ? "bg-blue-500/10 text-blue-300"
                  : "text-slate-500 hover:bg-white/5 hover:text-blue-300"
              }`}
              aria-label="Open attachments"
            >
              <Paperclip
                size={19}
              />
            </button>

            <input
              type="text"
              value={
                inputValue
              }
              onChange={(
                event
              ) =>
                setInputValue(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Message Assistance..."
              maxLength={500}
              disabled={
                isSending
              }
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
            />
          </div>

          <button
            type="button"
            onClick={
              handleSendMessage
            }
            disabled={
              !inputValue.trim() ||
              isSending
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            {isSending ? (
              <RefreshCw
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send
                size={19}
              />
            )}
          </button>
        </div>

        <p className="mt-2 px-1 text-[9px] uppercase tracking-wider text-slate-600">
          Messages are linked to service request #{requestDetails.requestId}
        </p>
      </div>
    </div>
  );
}