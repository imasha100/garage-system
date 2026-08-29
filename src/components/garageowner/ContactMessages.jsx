import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Menu,
  MessageSquareText,
  Search,
  RefreshCw,
  User,
  Mail,
  Phone,
  CalendarDays,
  Clock,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Building2,
} from "lucide-react";

import GarageOwnerNotifications from "./GarageOwnerNotifications";

export default function ContactMessages({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // STATE
  // ======================================================

  const [
    ownerData,
    setOwnerData,
  ] = useState(null);

  const [
    ownerLoading,
    setOwnerLoading,
  ] = useState(true);

  const [
    ownerError,
    setOwnerError,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);

  const [
    messagesError,
    setMessagesError,
  ] = useState("");

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    selectedMessage,
    setSelectedMessage,
  ] = useState(null);

  const [
    updatingMessageId,
    setUpdatingMessageId,
  ] = useState(null);

  const [
    deletingMessageId,
    setDeletingMessageId,
  ] = useState(null);

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  // ======================================================
  // LOAD LOGGED-IN GARAGE OWNER PROFILE
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile =
      async () => {
        try {
          setOwnerLoading(true);
          setOwnerError("");

          const storedStaffUser =
            sessionStorage.getItem(
              "staffUser"
            );

          if (!storedStaffUser) {
            throw new Error(
              "Logged-in garage owner details were not found."
            );
          }

          const staffUser =
            JSON.parse(
              storedStaffUser
            );

          const loginId =
            Number(
              staffUser?.loginId
            );

          if (
            !Number.isInteger(
              loginId
            ) ||
            loginId <= 0
          ) {
            throw new Error(
              "A valid garage owner login ID was not found."
            );
          }

          const response =
            await fetch(
              `http://localhost:5000/api/owners/profile/${loginId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Unable to load the garage owner profile."
            );
          }

          if (isMounted) {
            setOwnerData(
              result.data
            );
          }
        } catch (error) {
          console.error(
            "Owner profile loading error:",
            error
          );

          if (isMounted) {
            setOwnerData(null);

            setOwnerError(
              error.message ||
                "Unable to load the garage owner profile."
            );
          }
        } finally {
          if (isMounted) {
            setOwnerLoading(false);
          }
        }
      };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // OWNER / GARAGE DETAILS
  // ======================================================

  const ownerName =
    ownerData?.owner?.fullName ||
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage?.garageName ||
    (ownerLoading
      ? "Loading Garage..."
      : "Garage Not Available");

  const garageId =
    Number(
      ownerData?.garage?.garageId
    );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (namePart) =>
          namePart
            .charAt(0)
            .toUpperCase()
      )
      .join("") ||
    "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner?.profilePhoto ||
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? profilePhotoPath.startsWith(
          "http"
        )
        ? profilePhotoPath
        : `http://localhost:5000${profilePhotoPath}`
      : null;

  // ======================================================
  // LOAD CONTACT MESSAGES
  // ======================================================

  const loadContactMessages =
    async (
      selectedGarageId =
        garageId,
      showLoading = true
    ) => {
      if (
        !Number.isInteger(
          selectedGarageId
        ) ||
        selectedGarageId <= 0
      ) {
        return;
      }

      try {
        if (showLoading) {
          setMessagesLoading(true);
        }

        setMessagesError("");

        const response =
          await fetch(
            `http://localhost:5000/api/contact-messages/garage/${selectedGarageId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load contact messages."
          );
        }

        const receivedMessages =
          Array.isArray(result)
            ? result
            : Array.isArray(result.data)
            ? result.data
            : Array.isArray(
                result.messages
              )
            ? result.messages
            : [];

        setMessages(
          receivedMessages
        );
      } catch (error) {
        console.error(
          "Contact messages loading error:",
          error
        );

        setMessages([]);

        setMessagesError(
          error.message ||
            "Unable to load contact messages."
        );
      } finally {
        setMessagesLoading(false);
      }
    };

  // ======================================================
  // LOAD WHEN GARAGE ID IS AVAILABLE
  // ======================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        garageId
      ) ||
      garageId <= 0
    ) {
      return;
    }

    loadContactMessages(
      garageId,
      true
    );
  }, [garageId]);

  // ======================================================
  // NORMALIZE MESSAGE DATA
  // ======================================================

  const normalizedMessages =
    useMemo(() => {
      return messages.map(
        (message) => {
          const messageId =
            message.message_id ??
            message.messageId;

          const fullName =
            message.full_name ??
            message.fullName ??
            "Unknown Sender";

          const email =
            message.email ||
            "N/A";

          const contactNumber =
            message.contact_number ??
            message.contactNumber ??
            "N/A";

          const messageText =
            message.message ||
            "";

          const submittedDate =
            message.submitted_date ??
            message.submittedDate ??
            "";

          const submittedTime =
            message.submitted_time ??
            message.submittedTime ??
            "";

          const status =
            String(
              message.status ||
                "NEW"
            )
              .trim()
              .toUpperCase();

          return {
            ...message,

            messageId,
            fullName,
            email,
            contactNumber,
            messageText,
            submittedDate,
            submittedTime,
            status,
          };
        }
      );
    }, [messages]);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredMessages =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return normalizedMessages;
      }

      return normalizedMessages.filter(
        (message) => {
          const searchableText =
            [
              message.fullName,
              message.email,
              message.contactNumber,
              message.messageText,
              message.status,
              message.submittedDate,
              message.submittedTime,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            search
          );
        }
      );
    }, [
      normalizedMessages,
      searchText,
    ]);

  // ======================================================
  // SUMMARY COUNTS
  // ======================================================

  const totalMessages =
    normalizedMessages.length;

  const newMessages =
    normalizedMessages.filter(
      (message) =>
        message.status === "NEW"
    ).length;

  const readMessages =
    normalizedMessages.filter(
      (message) =>
        message.status === "READ"
    ).length;

  const closedMessages =
    normalizedMessages.filter(
      (message) =>
        message.status ===
          "CLOSED" ||
        message.status ===
          "REPLIED"
    ).length;

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate =
    (value) => {
      if (!value) {
        return "N/A";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return String(value);
      }

      return date.toLocaleDateString(
        [],
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }
      );
    };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime =
    (value) => {
      if (!value) {
        return "N/A";
      }

      const stringValue =
        String(value);

      if (
        /^\d{1,2}:\d{2}(:\d{2})?$/.test(
          stringValue
        )
      ) {
        const [
          hourString,
          minuteString,
        ] =
          stringValue.split(
            ":"
          );

        const hour =
          Number(
            hourString
          );

        const minute =
          Number(
            minuteString
          );

        if (
          Number.isInteger(
            hour
          ) &&
          Number.isInteger(
            minute
          )
        ) {
          const date =
            new Date();

          date.setHours(
            hour,
            minute,
            0,
            0
          );

          return date.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute:
                "2-digit",
            }
          );
        }
      }

      return stringValue;
    };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle =
    (status) => {
      switch (
        String(
          status || ""
        ).toUpperCase()
      ) {
        case "NEW":
          return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

        case "READ":
          return "border-indigo-500/30 bg-indigo-500/10 text-indigo-300";

        case "REPLIED":
          return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

        case "CLOSED":
          return "border-slate-500/30 bg-slate-500/10 text-slate-300";

        default:
          return "border-white/10 bg-white/5 text-gray-300";
      }
    };

  // ======================================================
  // UPDATE MESSAGE STATUS
  // ======================================================

  const updateMessageStatus =
    async (
      messageId,
      status
    ) => {
      if (!messageId) {
        return false;
      }

      try {
        setUpdatingMessageId(
          messageId
        );

        setActionError("");
        setActionMessage("");

        const response =
          await fetch(
            `http://localhost:5000/api/contact-messages/${messageId}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status,
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
              "Unable to update message status."
          );
        }

        setMessages(
          (previousMessages) =>
            previousMessages.map(
              (message) => {
                const currentId =
                  message.message_id ??
                  message.messageId;

                if (
                  Number(currentId) !==
                  Number(messageId)
                ) {
                  return message;
                }

                return {
                  ...message,
                  status,
                };
              }
            )
        );

        setSelectedMessage(
          (previousMessage) => {
            if (
              !previousMessage ||
              Number(
                previousMessage.messageId
              ) !==
                Number(
                  messageId
                )
            ) {
              return previousMessage;
            }

            return {
              ...previousMessage,
              status,
            };
          }
        );

        setActionMessage(
          `Message marked as ${status.toLowerCase()}.`
        );

        return true;
      } catch (error) {
        console.error(
          "Update contact message status error:",
          error
        );

        setActionError(
          error.message ||
            "Unable to update message status."
        );

        return false;
      } finally {
        setUpdatingMessageId(
          null
        );
      }
    };

  // ======================================================
  // OPEN MESSAGE
  // ======================================================

  const handleOpenMessage =
    async (message) => {
      setSelectedMessage(
        message
      );

      setActionError("");
      setActionMessage("");

      if (
        message.status ===
        "NEW"
      ) {
        await updateMessageStatus(
          message.messageId,
          "READ"
        );
      }
    };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeMessageModal =
    () => {
      setSelectedMessage(
        null
      );
    };

  // ======================================================
  // DELETE MESSAGE
  // ======================================================

  const handleDeleteMessage =
    async (message) => {
      if (
        !message?.messageId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete the contact message from ${message.fullName}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingMessageId(
          message.messageId
        );

        setActionError("");
        setActionMessage("");

        const response =
          await fetch(
            `http://localhost:5000/api/contact-messages/${message.messageId}`,
            {
              method:
                "DELETE",
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
              "Unable to delete the contact message."
          );
        }

        setMessages(
          (previousMessages) =>
            previousMessages.filter(
              (item) => {
                const currentId =
                  item.message_id ??
                  item.messageId;

                return (
                  Number(currentId) !==
                  Number(
                    message.messageId
                  )
                );
              }
            )
        );

        if (
          Number(
            selectedMessage?.messageId
          ) ===
          Number(
            message.messageId
          )
        ) {
          setSelectedMessage(
            null
          );
        }

        setActionMessage(
          "Contact message deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete contact message error:",
          error
        );

        setActionError(
          error.message ||
            "Unable to delete the contact message."
        );
      } finally {
        setDeletingMessageId(
          null
        );
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#07080f] font-sans text-white">
      {/* ==================================================
          TOP BAR
      ================================================== */}

      <div className="sticky top-0 z-50 flex min-h-16 flex-col gap-3 border-b border-white/10 bg-[#15151f]/95 px-4 py-3 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-0">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex h-10 w-full items-center gap-3 rounded-xl border border-white/20 bg-[#0b0b12] px-4 md:w-80">
            <Search
              size={15}
              className="shrink-0 text-gray-500"
            />

            <input
              type="text"
              value={searchText}
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              placeholder="Search messages..."
              className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText(
                    ""
                  )
                }
                className="text-xs text-gray-500 transition hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            OWNER HEADER
        ================================================== */}

        <div className="flex w-full min-w-0 items-center justify-end gap-2 sm:gap-3 md:w-auto md:gap-4">
          <div className="hidden h-8 w-px shrink-0 bg-white/10 md:block" />

          <div className="shrink-0">
            <GarageOwnerNotifications
              onNavigate={onNavigate}
            />
          </div>

          <div className="min-w-0 flex-1 text-right sm:flex-none">
            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-gray-500 md:max-w-[260px]">
              {garageName}
            </p>
          </div>

          <div className="flex h-9 w-9 min-h-9 min-w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-400 bg-[#0b0b12] text-xs">
            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              ownerInitials
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-4 md:p-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              Customer Communication
            </p>

            <h1 className="text-2xl font-black md:text-3xl">
              CONTACT MESSAGES
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
              View and manage contact
              inquiries sent directly
              to {garageName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadContactMessages(
                garageId,
                true
              )
            }
            disabled={
              messagesLoading ||
              !Number.isInteger(
                garageId
              )
            }
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                messagesLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ==================================================
            ERRORS / MESSAGES
        ================================================== */}

        {ownerError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            {ownerError}
          </div>
        )}

        {messagesError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            {messagesError}
          </div>
        )}

        {actionError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            {actionError}
          </div>
        )}

        {actionMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            {actionMessage}
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Messages"
            value={totalMessages}
            icon={MessageSquareText}
          />

          <SummaryCard
            label="New Messages"
            value={newMessages}
            icon={Mail}
          />

          <SummaryCard
            label="Read Messages"
            value={readMessages}
            icon={Eye}
          />

          <SummaryCard
            label="Completed"
            value={closedMessages}
            icon={CheckCircle2}
          />
        </div>

        {/* ==================================================
            MESSAGE TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#191923]">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div>
              <div className="flex items-center gap-3">
                <MessageSquareText
                  size={19}
                  className="text-cyan-400"
                />

                <h2 className="text-lg font-bold">
                  Contact Inquiries
                </h2>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Messages submitted
                through the Start Page
                contact form.
              </p>
            </div>

            <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan-300">
              {filteredMessages.length}{" "}
              MESSAGE
              {filteredMessages.length ===
              1
                ? ""
                : "S"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-[1050px] text-left md:w-full">
              <thead className="text-xs uppercase tracking-widest text-gray-500">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-5 md:px-7">
                    Sender
                  </th>

                  <th className="px-4 py-5">
                    Contact
                  </th>

                  <th className="px-4 py-5">
                    Message
                  </th>

                  <th className="px-4 py-5">
                    Submitted
                  </th>

                  <th className="px-4 py-5">
                    Status
                  </th>

                  <th className="px-4 py-5">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {ownerLoading ||
                messagesLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-7 py-14 text-center text-xs font-bold tracking-widest text-gray-500"
                    >
                      LOADING CONTACT
                      MESSAGES...
                    </td>
                  </tr>
                ) : filteredMessages.length >
                  0 ? (
                  filteredMessages.map(
                    (message) => (
                      <tr
                        key={
                          message.messageId
                        }
                        className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                          message.status ===
                          "NEW"
                            ? "bg-cyan-500/[0.025]"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-5 md:px-7">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                              <User
                                size={
                                  16
                                }
                              />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-white">
                                {
                                  message.fullName
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-gray-600">
                                ID #
                                {
                                  message.messageId
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-xs text-gray-300">
                            {
                              message.email
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              message.contactNumber
                            }
                          </p>
                        </td>

                        <td className="max-w-[300px] px-4 py-5">
                          <p className="truncate text-sm text-gray-300">
                            {
                              message.messageText
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-xs text-gray-300">
                            {formatDate(
                              message.submittedDate
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            {formatTime(
                              message.submittedTime
                            )}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider ${getStatusStyle(
                              message.status
                            )}`}
                          >
                            {
                              message.status
                            }
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenMessage(
                                  message
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/20"
                              title="View Message"
                            >
                              <Eye
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMessage(
                                  message
                                )
                              }
                              disabled={
                                deletingMessageId ===
                                message.messageId
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete Message"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-7 py-16 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-500">
                        <MessageSquareText
                          size={23}
                        />
                      </div>

                      <p className="mt-4 text-sm font-bold text-gray-400">
                        {searchText
                          ? "No matching contact messages found."
                          : "No contact messages yet."}
                      </p>

                      <p className="mt-2 text-xs text-gray-600">
                        {searchText
                          ? "Try a different search."
                          : "New inquiries sent to this garage will appear here."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ==================================================
          MESSAGE DETAILS MODAL
      ================================================== */}

      {selectedMessage && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={
            closeMessageModal
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171721] shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#171721] px-5 py-5 md:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Contact Inquiry
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Message Details
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeMessageModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="p-5 md:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wider ${getStatusStyle(
                    selectedMessage.status
                  )}`}
                >
                  {
                    selectedMessage.status
                  }
                </span>

                <span className="text-xs text-gray-600">
                  Message #
                  {
                    selectedMessage.messageId
                  }
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={
                    selectedMessage.fullName
                  }
                />

                <InfoCard
                  icon={Mail}
                  label="Email"
                  value={
                    selectedMessage.email
                  }
                />

                <InfoCard
                  icon={Phone}
                  label="Contact Number"
                  value={
                    selectedMessage.contactNumber
                  }
                />

                <InfoCard
                  icon={
                    Building2
                  }
                  label="Garage"
                  value={
                    garageName
                  }
                />

                <InfoCard
                  icon={
                    CalendarDays
                  }
                  label="Submitted Date"
                  value={formatDate(
                    selectedMessage.submittedDate
                  )}
                />

                <InfoCard
                  icon={Clock}
                  label="Submitted Time"
                  value={formatTime(
                    selectedMessage.submittedTime
                  )}
                />
              </div>

              {/* Full Message */}

              <div className="mt-5 rounded-xl border border-white/10 bg-[#20202b] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText
                    size={17}
                    className="text-cyan-400"
                  />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Message
                  </p>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                  {
                    selectedMessage.messageText
                  }
                </p>
              </div>

              {/* Actions */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                {selectedMessage.status !==
                  "REPLIED" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage.messageId,
                        "REPLIED"
                      )
                    }
                    disabled={
                      updatingMessageId ===
                      selectedMessage.messageId
                    }
                    className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2
                      size={15}
                    />

                    Mark Replied
                  </button>
                )}

                {selectedMessage.status !==
                  "CLOSED" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage.messageId,
                        "CLOSED"
                      )
                    }
                    disabled={
                      updatingMessageId ===
                      selectedMessage.messageId
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Close Inquiry
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteMessage(
                      selectedMessage
                    )
                  }
                  disabled={
                    deletingMessageId ===
                    selectedMessage.messageId
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2
                    size={15}
                  />

                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#191923] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-mono font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#20202b] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon
          size={15}
          className="text-cyan-400"
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
          {label}
        </p>
      </div>

      <p className="break-words text-sm text-white">
        {value || "N/A"}
      </p>
    </div>
  );
}