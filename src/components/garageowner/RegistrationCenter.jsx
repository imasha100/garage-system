import React, {
  useEffect,
  useState,
} from "react";

import {
  Menu,
  User,
  Wrench,
  Truck,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  Bell,
} from "lucide-react";

const API_BASE =
  "http://localhost:5000";

export default function RegistrationCenter({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // OWNER STATES
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

  // ======================================================
  // LOAD LOGGED-IN OWNER PROFILE
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
              staffUser?.loginId ??
                staffUser?.login_id
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
              `${API_BASE}/api/owners/profile/${loginId}`
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
                "Unable to load garage owner profile."
            );
          }

          if (isMounted) {
            setOwnerData(
              result.data ||
                null
            );
          }
        } catch (error) {
          console.error(
            "Registration Center owner loading error:",
            error
          );

          if (isMounted) {
            setOwnerError(
              error.message ||
                "Unable to load garage owner profile."
            );
          }
        } finally {
          if (isMounted) {
            setOwnerLoading(
              false
            );
          }
        }
      };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // OWNER DISPLAY
  // ======================================================

  const ownerName =
    ownerData?.owner
      ?.fullName ??
    ownerData?.owner
      ?.full_name ??
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage
      ?.garageName ??
    ownerData?.garage
      ?.garage_name ??
    (ownerLoading
      ? "Loading Garage..."
      : "Garage");

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner
      ?.profilePhoto ??
    ownerData?.owner
      ?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(
          profilePhotoPath
        ).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  // ======================================================
  // REGISTRATION CARDS
  // ======================================================

  const cards = [
    {
      title:
        "Technician Registration",

      subtitle:
        "Add workshop technicians and service team members",

      icon:
        Wrench,

      color:
        "emerald",

      page:
        "technician-registration",
    },

    {
      title:
        "Garage Tow Truck Registration",

      subtitle:
        "Register garage-owned tow trucks and driver information",

      icon:
        Truck,

      color:
        "amber",

      page:
        "truck-registration",
    },

    {
      title:
        "Assistance Registration",

      subtitle:
        "Register assistance officers and dispatch operators",

      icon:
        User,

      color:
        "blue",

      page:
        "assistance-registration",
    },

    {
      title:
        "External Tow Truck Requests",

      subtitle:
        "Review, approve or reject external tow truck registration requests",

      icon:
        ClipboardCheck,

      color:
        "purple",

      page:
        "external-truck-requests",
    },
  ];

  // ======================================================
  // CARD COLORS
  // ======================================================

  const colorClasses = {
    emerald:
      "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",

    amber:
      "border-amber-500/40 text-amber-400 bg-amber-500/10",

    blue:
      "border-blue-500/40 text-blue-400 bg-blue-500/10",

    purple:
      "border-purple-500/40 text-purple-400 bg-purple-500/10",
  };

  const cardHoverClasses = {
    emerald:
      "hover:border-emerald-500/50 hover:shadow-emerald-500/10",

    amber:
      "hover:border-amber-500/50 hover:shadow-amber-500/10",

    blue:
      "hover:border-blue-500/50 hover:shadow-blue-500/10",

    purple:
      "hover:border-purple-500/50 hover:shadow-purple-500/10",
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-8 py-4 md:py-0">

        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
            aria-label="Open sidebar"
          >
            <Menu
              size={20}
            />
          </button>

          <div>

            <h1 className="text-base sm:text-lg md:text-xl font-black tracking-widest break-words">
              REGISTRATION
            </h1>

            <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest break-words">
              Manage system registration modules
            </p>

          </div>

        </div>

        {/* ==================================================
            DYNAMIC OWNER HEADER
        ================================================== */}

        <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:justify-end md:gap-5">

          <Bell
            size={18}
            className="shrink-0 text-gray-300"
          />

          <div className="h-8 w-px shrink-0 bg-white/10" />

          <div className="min-w-0 flex-1 text-right md:flex-none">

            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-indigo-400 md:max-w-[260px]">
              {garageName}
            </p>

          </div>

          <div className="h-10 w-10 min-h-10 min-w-10 shrink-0 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs flex items-center justify-center">

            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
              />
            ) : ownerLoading ? (
              <ShieldCheck
                className="text-blue-400"
                size={22}
              />
            ) : (
              ownerInitials
            )}

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-4 md:p-8">

        {/* OWNER ERROR */}

        {ownerError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        <p className="text-gray-600 font-bold tracking-widest text-xs md:text-sm mb-4">
          SELECT REGISTRATION MODULE
        </p>

        <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3 break-words">
          Registration Dashboard
        </h2>

        <p className="text-gray-400 max-w-2xl mb-8">
          Choose a registration type to continue.
        </p>

        {/* ==================================================
            CARDS
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">

          {cards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <button
                  key={
                    card.page
                  }
                  type="button"
                  onClick={() =>
                    onNavigate(
                      card.page
                    )
                  }
                  className={`group text-left bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    cardHoverClasses[
                      card.color
                    ]
                  }`}
                >

                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${
                      colorClasses[
                        card.color
                      ]
                    }`}
                  >
                    <Icon
                      size={28}
                    />
                  </div>

                  <h3 className="text-lg md:text-xl font-black mb-3">
                    {card.title}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed mb-8 min-h-[44px]">
                    {card.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold tracking-widest text-gray-500 group-hover:text-white transition-colors">

                    <span>
                      CONTINUE
                    </span>

                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />

                  </div>

                </button>
              );
            }
          )}

        </div>

      </main>

    </div>
  );
}