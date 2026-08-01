import React, { useEffect, useState } from "react";
import {
  Upload,
  Power,
  PowerOff,
  User,
  Save,
  X,
  Mail,
  Phone,
  Search,
  Bell,
  Menu,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:5000/api";

const AssistanceProfile = ({ openSidebar }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    nic: "",
    shiftOn: false,
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // GET LOGGED-IN ASSISTANCE OFFICER
  // ======================================================

  const getLoggedInAssistance = () => {
    try {
      const storedStaffUser = sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      const staffUser = JSON.parse(storedStaffUser);
      const role = String(staffUser?.role || "")
        .trim()
        .toLowerCase();
      const staffId = Number(staffUser?.staffId);

      if (
        role !== "assistance" ||
        !Number.isInteger(staffId) ||
        staffId <= 0
      ) {
        return null;
      }

      return {
        ...staffUser,
        staffId,
      };
    } catch (error) {
      console.error(
        "Unable to read logged-in assistance officer:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // LOAD PROFILE DETAILS
  // ======================================================

  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const staffUser = getLoggedInAssistance();

      if (!staffUser) {
        throw new Error(
          "Logged-in assistance officer details were not found. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/assistances/${staffUser.staffId}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false || !data.assistance) {
        throw new Error(
          data.message || "Unable to load assistance profile."
        );
      }

      const assistance = data.assistance;

      setProfile((previousProfile) => ({
        ...previousProfile,
        name: assistance.fullName || "",
        email: assistance.email || "",
        contactNumber: assistance.contactNumber || "",
        nic: assistance.nic || "",
        shiftOn:
          String(assistance.shiftStatus || "OFF").toUpperCase() ===
          "ON",
      }));
    } catch (error) {
      console.error("Load assistance profile error:", error);
      setErrorMessage(
        error.message || "Unable to load assistance profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile image must be smaller than 5 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setProfile((previousProfile) => ({
      ...previousProfile,
      photo: file,
    }));

    setPreview(URL.createObjectURL(file));
    setSaved(false);
    setErrorMessage("");
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ======================================================
  // PROFILE FIELD CHANGES
  // ======================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));

    setSaved(false);
    setErrorMessage("");
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave = async () => {
    const staffUser = getLoggedInAssistance();

    if (!staffUser) {
      setErrorMessage(
        "Logged-in assistance officer details were not found. Please sign in again."
      );
      return;
    }

    if (!profile.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (!profile.email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (!profile.contactNumber.trim()) {
      setErrorMessage("Contact number is required.");
      return;
    }

    if (!profile.nic.trim()) {
      setErrorMessage("NIC number is required.");
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/assistances/${staffUser.staffId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: profile.name.trim(),
            email: profile.email.trim().toLowerCase(),
            contactNumber: profile.contactNumber.trim(),
            nic: profile.nic.trim().toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to update assistance profile."
        );
      }

      const updatedAssistance = data.assistance || {};

      setProfile((previousProfile) => ({
        ...previousProfile,
        name: updatedAssistance.fullName || profile.name.trim(),
        email: updatedAssistance.email || profile.email.trim().toLowerCase(),
        contactNumber:
          updatedAssistance.contactNumber ||
          profile.contactNumber.trim(),
        nic: updatedAssistance.nic || profile.nic.trim().toUpperCase(),
      }));

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Save assistance profile error:", error);
      setErrorMessage(
        error.message || "Unable to update assistance profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ======================================================
  // SHIFT STATUS
  // ======================================================

  const openShiftConfirm = () => {
    setShowConfirm(true);
  };

  const confirmShiftChange = async () => {
    const staffUser = getLoggedInAssistance();

    if (!staffUser) {
      setShowConfirm(false);
      setErrorMessage(
        "Logged-in assistance officer details were not found. Please sign in again."
      );
      return;
    }

    const newShiftStatus = profile.shiftOn ? "OFF" : "ON";

    setIsUpdatingShift(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/assistances/${staffUser.staffId}/shift-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shiftStatus: newShiftStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to update shift status."
        );
      }

      setProfile((previousProfile) => ({
        ...previousProfile,
        shiftOn: newShiftStatus === "ON",
      }));

      setShowConfirm(false);
    } catch (error) {
      console.error("Update assistance shift status error:", error);
      setErrorMessage(
        error.message || "Unable to update shift status."
      );
    } finally {
      setIsUpdatingShift(false);
    }
  };

  const nextStatus = profile.shiftOn ? "OFF" : "ON";

  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-hidden bg-[#050608] text-white">
      {/* PROFILE CONTENT */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-[#1f2a36] bg-[#0b0e14] p-6 shadow-2xl"
        >
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{errorMessage}</p>

                {isLoading && (
                  <button
                    type="button"
                    onClick={loadProfile}
                    className="mt-3 flex items-center gap-2 font-bold text-red-200 hover:text-white"
                  >
                    <RefreshCw size={15} />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <RefreshCw
                size={36}
                className="animate-spin text-cyan-400"
              />
              <p className="mt-4 text-sm text-slate-400">
                Loading assistance profile...
              </p>
            </div>
          ) : (
            <>
              {/* PROFILE IMAGE */}
              <div className="mb-6 flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400 bg-[#111] shadow-lg">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-500" />
                  )}
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-3xl text-cyan-400 hover:text-cyan-300 md:text-sm">
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
              <div className="mb-6 space-y-3">
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  disabled={isSaving}
                  className="w-full rounded border border-[#1f2a36] bg-[#050608] p-3 text-2xl outline-none focus:border-cyan-400 disabled:opacity-60 md:text-base"
                  placeholder="Name"
                />

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled={isSaving}
                    className="w-full rounded border border-[#1f2a36] bg-[#050608] p-3 pl-10 text-2xl outline-none focus:border-cyan-400 disabled:opacity-60 md:text-base"
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
                    name="contactNumber"
                    value={profile.contactNumber}
                    onChange={handleProfileChange}
                    disabled={isSaving}
                    className="w-full rounded border border-[#1f2a36] bg-[#050608] p-3 pl-10 text-2xl outline-none focus:border-cyan-400 disabled:opacity-60 md:text-base"
                    placeholder="Contact Number"
                  />
                </div>
              </div>

              {/* SHIFT STATUS */}
              <div className="mb-7 flex items-center justify-between rounded-lg border border-[#1f2a36] bg-[#050608] p-4">
                <p className="text-2xl font-semibold md:text-base">
                  Shift Status:{" "}
                  <span
                    className={
                      profile.shiftOn
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {profile.shiftOn ? "ON" : "OFF"}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={openShiftConfirm}
                  disabled={isUpdatingShift}
                  className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-xl font-bold transition disabled:cursor-not-allowed disabled:opacity-60 md:text-base ${
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
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 text-3xl font-bold text-black transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Profile
                  </>
                )}
              </button>

              {saved && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-2xl text-green-400 md:text-base"
                >
                  Profile updated successfully ✔
                </motion.p>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* CUSTOM CONFIRM POPUP */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-[#0b0e14] p-6 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isUpdatingShift}
              className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-white disabled:opacity-50"
              aria-label="Close shift confirmation"
            >
              <X size={22} />
            </button>

            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                profile.shiftOn ? "bg-red-500/20" : "bg-green-500/20"
              }`}
            >
              {profile.shiftOn ? (
                <PowerOff size={34} className="text-red-400" />
              ) : (
                <Power size={34} className="text-green-400" />
              )}
            </div>

            <h3 className="mb-2 text-2xl font-bold">
              Confirm Shift Change
            </h3>

            <p className="mb-6 text-lg text-gray-300">
              Are you sure you want to turn your shift{" "}
              <span
                className={
                  nextStatus === "ON"
                    ? "font-bold text-green-400"
                    : "font-bold text-red-400"
                }
              >
                {nextStatus}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isUpdatingShift}
                className="w-1/2 cursor-pointer rounded-lg bg-gray-700 py-3 font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmShiftChange}
                disabled={isUpdatingShift}
                className={`flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  nextStatus === "ON"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isUpdatingShift ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Yes, Turn ${nextStatus}`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AssistanceProfile;