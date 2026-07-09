import React, { useRef, useState } from "react";
import {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
  };

  const updateField = (name, value) => {
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderField = (Icon, label, value, name) => (
    <div className="bg-[#191923] border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon size={16} className="text-cyan-400" />
        <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">
          {label}
        </p>
      </div>

      {editMode ? (
        <input
          value={tempProfile[name]}
          onChange={(e) => updateField(name, e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
        />
      ) : (
        <p className="text-sm md:text-base text-gray-200 font-medium">
          {value}
        </p>
      )}
    </div>
  );

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

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">
      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex items-center justify-between gap-4 px-4 md:px-8">
        <button
          onClick={toggleSidebar}
          className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-5">
          <Bell size={18} className="text-gray-300" />
          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-xs font-bold tracking-widest">{profile.name}</p>
            <p className="text-[10px] text-indigo-400 uppercase">
              Owner Level
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl border border-indigo-400 flex items-center justify-center text-xs overflow-hidden">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "MA"
            )}
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              GARAGE OWNER PROFILE
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-3xl">
              Manage owner identity, garage information, and access level.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!editMode ? (
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-5 py-3 rounded-xl text-xs font-bold tracking-widest"
              >
                <Edit3 size={15} />
                EDIT PROFILE
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl text-xs font-bold tracking-widest"
                >
                  <Save size={15} />
                  SAVE
                </button>

                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 px-5 py-3 rounded-xl text-xs font-bold tracking-widest"
                >
                  <X size={15} />
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#191923] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Owner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={46} className="text-cyan-400" />
              )}

              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 transition"
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
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className="text-2xl md:text-3xl font-black">
                  {profile.name}
                </h2>

                <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-[#1c1c25] border border-white/10 rounded-xl p-6"
              >
                <div className="flex justify-between mb-6">
                  <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">
                    {item.label}
                  </p>
                  <Icon size={16} className={item.color} />
                </div>

                <h3 className={`text-3xl font-mono font-black ${item.color}`}>
                  {item.value}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 md:p-6">
          <h2 className="text-lg font-bold mb-5">
            Owner & Garage Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(User, "Owner Name", profile.name, "name")}
            {renderField(BriefcaseBusiness, "Role", profile.role, "role")}
            {renderField(Mail, "Email Address", profile.email, "email")}
            {renderField(Phone, "Phone Number", profile.phone, "phone")}
            {renderField(
              Building2,
              "Garage Name",
              profile.garageName,
              "garageName"
            )}
            {renderField(MapPin, "Location", profile.location, "location")}
            {renderField(
              CalendarDays,
              "Joined Date",
              profile.joinedDate,
              "joinedDate"
            )}
          </div>
        </div>
      </main>
    </div>
  );
}