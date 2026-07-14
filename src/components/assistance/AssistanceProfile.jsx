
import React, { useState } from "react";
import {
  Upload,
  Power,
  PowerOff,
  User,
  Save,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

const AssistanceProfile = () => {
  const [profile, setProfile] = useState({
    name: "Assistance Officer",
    email: "assistance@gmail.com",
    contactNumber: "0771234567",
    shiftOn: true,
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfile((prev) => ({
        ...prev,
        photo: file,
      }));

      setPreview(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const openShiftConfirm = () => {
    setShowConfirm(true);
  };

  const confirmShiftChange = () => {
    setProfile((prev) => ({
      ...prev,
      shiftOn: !prev.shiftOn,
    }));

    setSaved(false);
    setShowConfirm(false);
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const nextStatus = profile.shiftOn ? "OFF" : "ON";

  return (
    <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-4 md:p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0b0e14] border border-[#1f2a36] rounded-2xl p-6 shadow-2xl"
      >
        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400 bg-[#111] flex items-center justify-center shadow-lg">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-gray-500" />
            )}
          </div>

          <label className="mt-3 cursor-pointer flex items-center gap-2 text-3xl md:text-sm text-cyan-400 hover:text-cyan-300">
            <Upload size={16} />
            Upload Photo

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* INPUTS */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => {
              setProfile({
                ...profile,
                name: e.target.value,
              });

              setSaved(false);
            }}
            className="w-full p-3 rounded bg-[#050608] border border-[#1f2a36] outline-none focus:border-cyan-400 text-2xl md:text-base"
            placeholder="Name"
          />

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
            />

            <input
              type="email"
              value={profile.email}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  email: e.target.value,
                });

                setSaved(false);
              }}
              className="w-full p-3 pl-10 rounded bg-[#050608] border border-[#1f2a36] outline-none focus:border-cyan-400 text-2xl md:text-base"
              placeholder="Email"
            />
          </div>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
            />

            <input
              type="tel"
              value={profile.contactNumber}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  contactNumber: e.target.value,
                });

                setSaved(false);
              }}
              className="w-full p-3 pl-10 rounded bg-[#050608] border border-[#1f2a36] outline-none focus:border-cyan-400 text-2xl md:text-base"
              placeholder="Contact Number"
            />
          </div>
        </div>

        {/* SHIFT STATUS */}
        <div className="flex items-center justify-between bg-[#050608] p-4 rounded-lg border border-[#1f2a36] mb-7">
          <p className="font-semibold text-2xl md:text-base">
            Shift Status:{" "}
            <span
              className={
                profile.shiftOn ? "text-green-400" : "text-red-400"
              }
            >
              {profile.shiftOn ? "ON" : "OFF"}
            </span>
          </p>

          <button
            onClick={openShiftConfirm}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded font-bold transition text-xl md:text-base ${
              profile.shiftOn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {profile.shiftOn ? (
              <>
                <Power size={16} />
                ON
              </>
            ) : (
              <>
                <PowerOff size={16} />
                OFF
              </>
            )}
          </button>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition text-3xl md:text-base"
        >
          <Save size={20} />
          Save Profile
        </button>

        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-center mt-3 text-2xl md:text-base"
          >
            Profile updated successfully ✔
          </motion.p>
        )}
      </motion.div>

      {/* CUSTOM CONFIRM POPUP */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-[#0b0e14] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-center"
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={22} />
            </button>

            <div
              className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
                profile.shiftOn
                  ? "bg-red-500/20"
                  : "bg-green-500/20"
              }`}
            >
              {profile.shiftOn ? (
                <PowerOff size={34} className="text-red-400" />
              ) : (
                <Power size={34} className="text-green-400" />
              )}
            </div>

            <h3 className="text-2xl font-bold mb-2">
              Confirm Shift Change
            </h3>

            <p className="text-gray-300 mb-6 text-lg">
              Are you sure you want to turn your shift{" "}
              <span
                className={
                  nextStatus === "ON"
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {nextStatus}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmShiftChange}
                className={`w-1/2 py-3 rounded-lg font-bold text-white cursor-pointer ${
                  nextStatus === "ON"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Yes, Turn {nextStatus}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AssistanceProfile;

