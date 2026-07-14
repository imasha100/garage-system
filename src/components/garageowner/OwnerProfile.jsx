import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Menu,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  CalendarDays,
  Edit3,
  Save,
  X,
  BadgeCheck,
  Camera,
  BriefcaseBusiness,
} from "lucide-react";

export default function OwnerProfile({ toggleSidebar }) {
  const fileInputRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [profile, setProfile] = useState({
    name: "Master Admin",
    role: "Garage Owner",
    email: "owner@gearos.lk",
    phone: "+94 77 123 4567",
    garageName: "GearOS Auto Service Center",
    location: "Colombo, Sri Lanka",
    joinedDate: "2026-01-15",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const stats = [
    {
      label: "Total Vehicles Managed",
      value: "248",
      icon: Building2,
      color: "text-cyan-400",
    },
    {
      label: "Active Technicians",
      value: "12",
      icon: BriefcaseBusiness,
      color: "text-emerald-400",
    },
    {
      label: "Approval Level",
      value: "Owner",
      icon: ShieldCheck,
      color: "text-indigo-400",
    },
  ];

  const informationFields = [
    {
      icon: User,
      label: "Owner Name",
      value: profile.name,
      name: "name",
    },
    {
      icon: BriefcaseBusiness,
      label: "Role",
      value: profile.role,
      name: "role",
    },
    {
      icon: Mail,
      label: "Email Address",
      value: profile.email,
      name: "email",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: profile.phone,
      name: "phone",
    },
    {
      icon: Building2,
      label: "Garage Name",
      value: profile.garageName,
      name: "garageName",
    },
    {
      icon: MapPin,
      label: "Location",
      value: profile.location,
      name: "location",
    },
    {
      icon: CalendarDays,
      label: "Joined Date",
      value: profile.joinedDate,
      name: "joinedDate",
    },
  ];

  const filteredStats = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return stats;
    }

    return stats.filter((item) =>
      `${item.label} ${item.value}`.toLowerCase().includes(query)
    );
  }, [searchText]);

  const filteredInformationFields = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return informationFields;
    }

    return informationFields.filter((field) =>
      `${field.label} ${field.value}`.toLowerCase().includes(query)
    );
  }, [searchText, profile]);

  const handleEdit = () => {
    setTempProfile(profile);
    setEditMode(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileImage(URL.createObjectURL(file));
  };

  const updateField = (name, value) => {
    setTempProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const renderField = (Icon, label, value, name) => (
    <div
      key={name}
      className="rounded-xl border border-white/10 bg-[#191923] p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <Icon size={16} className="text-cyan-400" />

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          {label}
        </p>
      </div>

      {editMode ? (
        <input
          type="text"
          value={tempProfile[name]}
          onChange={(event) => updateField(name, event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
        />
      ) : (
        <p className="text-sm font-medium text-gray-200 md:text-base">
          {value}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b13] font-sans text-white">
      {/* Top Bar */}
      <header className="flex min-h-16 flex-col gap-4 border-b border-white/10 bg-[#191922] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="flex h-10 w-full items-center gap-3 rounded-xl border border-white/20 bg-[#0b0b12] px-4 md:w-80">
            <Search size={15} className="shrink-0 text-gray-500" />

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search owner profile..."
              className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="text-[10px] font-bold text-gray-500 transition hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 md:justify-end">
          <button
            type="button"
            className="text-gray-300 transition hover:text-white"
          >
            <Bell size={18} />
          </button>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-xs font-bold tracking-widest">
              {profile.name}
            </p>

            <p className="text-[10px] uppercase text-indigo-400">
              Owner Level
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-indigo-400 text-xs">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              "MA"
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="mb-3 text-3xl font-black md:text-4xl">
              GARAGE OWNER PROFILE
            </h1>

            <p className="max-w-3xl text-sm text-gray-400 md:text-base">
              Manage owner identity, garage information, and access level.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!editMode ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-5 py-3 text-xs font-bold tracking-widest text-cyan-400 transition hover:bg-cyan-500/25"
              >
                <Edit3 size={15} />
                EDIT PROFILE
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-xs font-bold tracking-widest text-emerald-400 transition hover:bg-emerald-500/30"
                >
                  <Save size={15} />
                  SAVE
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-xs font-bold tracking-widest text-red-300 transition hover:bg-red-500/25"
                >
                  <X size={15} />
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#191923] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-500/10">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Owner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={46} className="text-cyan-400" />
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-black transition hover:bg-cyan-400"
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black md:text-3xl">
                  {profile.name}
                </h2>

                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-400">
                  <BadgeCheck size={13} />
                  VERIFIED OWNER
                </span>
              </div>

              <p className="text-gray-400">
                {profile.role} of {profile.garageName}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {filteredStats.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {filteredStats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-[#1c1c25] p-6"
                >
                  <div className="mb-6 flex justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                      {item.label}
                    </p>

                    <Icon size={16} className={item.color} />
                  </div>

                  <h3
                    className={`font-mono text-3xl font-black ${item.color}`}
                  >
                    {item.value}
                  </h3>
                </div>
              );
            })}
          </div>
        )}

        {/* Owner Information */}
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 md:p-6">
          <h2 className="mb-5 text-lg font-bold">
            Owner & Garage Information
          </h2>

          {filteredInformationFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredInformationFields.map((field) =>
                renderField(
                  field.icon,
                  field.label,
                  field.value,
                  field.name
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#191923] p-10 text-center">
              <Search
                size={28}
                className="mx-auto mb-3 text-gray-600"
              />

              <p className="text-sm text-gray-500">
                No owner profile information found for "{searchText}".
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}