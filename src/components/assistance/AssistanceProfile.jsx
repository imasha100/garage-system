import React, { useState } from "react";
import { Upload, Power, PowerOff, User, Save } from "lucide-react";
import { motion } from "framer-motion";

const AssistanceProfile = () => {
  const [profile, setProfile] = useState({
    name: "Assistance Officer",
    role: "Technical Support Agent",
    shiftOn: true,
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const toggleShift = () => {
    setProfile((prev) => ({
      ...prev,
      shiftOn: !prev.shiftOn,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-4 md:p-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0b0e14] border border-[#1f2a36] rounded-2xl p-6 shadow-2xl"
      >

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <User className="text-[#52f0ac]" />

          {/* 👇 MOBILE BIGGER TEXT */}
          <h2 className="text-4xl md:text-2xl font-bold">
            Assistance Profile
          </h2>
        </div>

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400 bg-[#111] flex items-center justify-center shadow-lg">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-500" />
            )}
          </div>

          {/* 👇 MOBILE BIGGER TEXT */}
          <label className="mt-3 cursor-pointer flex items-center gap-2 text-3xl md:text-sm text-cyan-400 hover:text-cyan-300">
            <Upload size={16} />
            Upload Photo
            <input type="file" hidden onChange={handleImageUpload} />
          </label>
        </div>

        {/* INPUTS */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => {
              setProfile({ ...profile, name: e.target.value });
              setSaved(false);
            }}
            className="w-full p-3 rounded bg-[#050608] border border-[#1f2a36] outline-none focus:border-cyan-400 text-2xl md:text-base"
            placeholder="Name"
          />

          <input
            type="text"
            value={profile.role}
            onChange={(e) => {
              setProfile({ ...profile, role: e.target.value });
              setSaved(false);
            }}
            className="w-full p-3 rounded bg-[#050608] border border-[#1f2a36] outline-none focus:border-cyan-400 text-2xl md:text-base"
            placeholder="Role"
          />
        </div>

        {/* SHIFT STATUS */}
        <div className="flex items-center justify-between bg-[#050608] p-4 rounded-lg border border-[#1f2a36] mb-7">

          {/* 👇 MOBILE BIG TEXT */}
          <p className="font-semibold text-2xl md:text-base">
            Shift Status:{" "}
            <span className={profile.shiftOn ? "text-green-400" : "text-red-400"}>
              {profile.shiftOn ? "ON" : "OFF"}
            </span>
          </p>

          <button
            onClick={toggleShift}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded font-bold transition text-xl md:text-base ${
              profile.shiftOn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {profile.shiftOn ? (
              <>
                <Power size={16} /> ON
              </>
            ) : (
              <>
                <PowerOff size={16} /> OFF
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

        {/* SAVED MESSAGE */}
        {saved && (
          <motion.p className="text-green-400 text-center mt-3 text-2xl md:text-base">
            Profile updated successfully ✔
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default AssistanceProfile;