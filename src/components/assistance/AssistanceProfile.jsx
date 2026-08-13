import React, {
  useEffect,
  useState,
} from "react";

import {
  Upload,
  Power,
  PowerOff,
  User,
  Save,
  X,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

const API_BASE =
  "http://localhost:5000";

const API_BASE_URL =
  `${API_BASE}/api`;

const AssistanceProfile = ({
  openSidebar,
}) => {
  const [profile, setProfile] =
    useState({
      name: "",
      email: "",
      contactNumber: "",
      nic: "",
      shiftOn: false,
      profilePhoto: null,
      selectedPhoto: null,
      assistanceId: null,
      garageId: null,
      garageName: "",
    });

  const [
    preview,
    setPreview,
  ] = useState(null);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isUpdatingShift,
    setIsUpdatingShift,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccessPopup,
    setPasswordSuccessPopup,
  ] = useState(false);

  // ======================================================
  // GET LOGGED-IN ASSISTANCE OFFICER
  // ======================================================

  const getLoggedInAssistance = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        return null;
      }

      const staffUser =
        JSON.parse(
          storedStaffUser
        );

      const role =
        String(
          staffUser?.role || ""
        )
          .trim()
          .toLowerCase();

      const staffId =
        Number(
          staffUser?.staffId ??
            staffUser?.staff_id ??
            staffUser
              ?.assistanceId ??
            staffUser
              ?.assistance_id
        );

      const loginId =
        Number(
          staffUser?.loginId ??
            staffUser?.login_id
        );

      if (
        role !==
        "assistance"
      ) {
        return null;
      }

      return {
        ...staffUser,

        staffId:
          Number.isInteger(
            staffId
          ) &&
          staffId > 0
            ? staffId
            : null,

        loginId:
          Number.isInteger(
            loginId
          ) &&
          loginId > 0
            ? loginId
            : null,
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
  // BUILD PHOTO URL
  // ======================================================

  const buildPhotoUrl = (
    photoPath
  ) => {
    if (!photoPath) {
      return null;
    }

    const normalizedPath =
      String(
        photoPath
      ).trim();

    if (
      normalizedPath.startsWith(
        "http"
      )
    ) {
      return normalizedPath;
    }

    return `${API_BASE}${normalizedPath}`;
  };

  // ======================================================
  // LOAD PROFILE DETAILS
  // ======================================================

  const loadProfile =
    async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const staffUser =
          getLoggedInAssistance();

        if (!staffUser) {
          throw new Error(
            "Logged-in assistance officer details were not found. Please sign in again."
          );
        }

        let response;

        // Preferred:
        // load by login ID
        if (
          Number.isInteger(
            staffUser.loginId
          ) &&
          staffUser.loginId > 0
        ) {
          response =
            await fetch(
              `${API_BASE_URL}/assistances/profile/${staffUser.loginId}`
            );
        } else if (
          Number.isInteger(
            staffUser.staffId
          ) &&
          staffUser.staffId >
            0
        ) {
          // Fallback:
          // load by assistance ID
          response =
            await fetch(
              `${API_BASE_URL}/assistances/${staffUser.staffId}`
            );
        } else {
          throw new Error(
            "A valid assistance officer ID was not found."
          );
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to load assistance profile."
          );
        }

        const assistance =
          data.assistance;

        if (!assistance) {
          throw new Error(
            "Assistance profile data was not returned."
          );
        }

        const profilePhotoUrl =
          buildPhotoUrl(
            assistance.profilePhoto
          );

        setProfile({
          name:
            assistance.fullName ||
            "",

          email:
            assistance.email ||
            "",

          contactNumber:
            assistance.contactNumber ||
            "",

          nic:
            assistance.nic ||
            "",

          shiftOn:
            String(
              assistance.shiftStatus ||
                "OFF"
            ).toUpperCase() ===
            "ON",

          profilePhoto:
            assistance.profilePhoto ||
            null,

          selectedPhoto:
            null,

          assistanceId:
            Number(
              assistance.assistanceId
            ) || null,

          garageId:
            Number(
              assistance.garageId
            ) || null,

          garageName:
            assistance.garageName ||
            "",
        });

        setPreview(
          profilePhotoUrl
        );
      } catch (error) {
        console.error(
          "Load assistance profile error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load assistance profile."
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

  const handleImageUpload = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setErrorMessage(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setErrorMessage(
        "Profile image must be smaller than 5 MB."
      );

      event.target.value =
        "";

      return;
    }

    if (
      preview &&
      preview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        preview
      );
    }

    const localPreview =
      URL.createObjectURL(
        file
      );

    setProfile(
      (
        previousProfile
      ) => ({
        ...previousProfile,

        selectedPhoto:
          file,
      })
    );

    setPreview(
      localPreview
    );

    setSaved(false);
    setErrorMessage("");
  };

  // ======================================================
  // CLEAN LOCAL PREVIEW
  // ======================================================

  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          preview
        );
      }
    };
  }, [preview]);

  // ======================================================
  // PROFILE FIELD CHANGES
  // ======================================================

  const handleProfileChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProfile(
      (
        previousProfile
      ) => ({
        ...previousProfile,

        [name]:
          value,
      })
    );

    setSaved(false);
    setErrorMessage("");
  };

  // ======================================================
  // UPLOAD PROFILE PHOTO
  // ======================================================

  const uploadProfilePhoto =
    async (
      assistanceId,
      photoFile
    ) => {
      if (
        !photoFile
      ) {
        return null;
      }

      const formData =
        new FormData();

      formData.append(
        "profilePhoto",
        photoFile
      );

      const response =
        await fetch(
          `${API_BASE_URL}/assistances/${assistanceId}/photo`,
          {
            method:
              "PUT",

            body:
              formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        data.success ===
          false
      ) {
        throw new Error(
          data.message ||
            "Unable to upload profile photo."
        );
      }

      return (
        data.profilePhoto ||
        data.assistance
          ?.profilePhoto ||
        null
      );
    };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave =
    async () => {
      const staffUser =
        getLoggedInAssistance();

      if (!staffUser) {
        setErrorMessage(
          "Logged-in assistance officer details were not found. Please sign in again."
        );

        return;
      }

      const assistanceId =
        Number(
          profile.assistanceId ||
            staffUser.staffId
        );

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        setErrorMessage(
          "A valid assistance officer ID was not found."
        );

        return;
      }

      if (
        !profile.name.trim()
      ) {
        setErrorMessage(
          "Full name is required."
        );

        return;
      }

      if (
        !profile.email.trim()
      ) {
        setErrorMessage(
          "Email address is required."
        );

        return;
      }

      if (
        !profile.contactNumber.trim()
      ) {
        setErrorMessage(
          "Contact number is required."
        );

        return;
      }

      if (
        !profile.nic.trim()
      ) {
        setErrorMessage(
          "NIC number is required."
        );

        return;
      }

      setIsSaving(true);
      setSaved(false);
      setErrorMessage("");

      try {
        // ==============================================
        // UPDATE TEXT PROFILE DETAILS
        // ==============================================

        const response =
          await fetch(
            `${API_BASE_URL}/assistances/${assistanceId}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  fullName:
                    profile.name.trim(),

                  email:
                    profile.email
                      .trim()
                      .toLowerCase(),

                  contactNumber:
                    profile.contactNumber
                      .trim(),

                  nic:
                    profile.nic
                      .trim()
                      .toUpperCase(),
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to update assistance profile."
          );
        }

        const updatedAssistance =
          data.assistance ||
          {};

        let uploadedPhotoPath =
          profile.profilePhoto;

        // ==============================================
        // UPLOAD NEW PHOTO
        // ==============================================

        if (
          profile.selectedPhoto
        ) {
          uploadedPhotoPath =
            await uploadProfilePhoto(
              assistanceId,
              profile.selectedPhoto
            );
        }

        // ==============================================
        // UPDATE LOCAL PROFILE
        // ==============================================

        setProfile(
          (
            previousProfile
          ) => ({
            ...previousProfile,

            name:
              updatedAssistance
                .fullName ||
              profile.name.trim(),

            email:
              updatedAssistance
                .email ||
              profile.email
                .trim()
                .toLowerCase(),

            contactNumber:
              updatedAssistance
                .contactNumber ||
              profile.contactNumber
                .trim(),

            nic:
              updatedAssistance
                .nic ||
              profile.nic
                .trim()
                .toUpperCase(),

            profilePhoto:
              uploadedPhotoPath ||
              previousProfile
                .profilePhoto,

            selectedPhoto:
              null,
          })
        );

        if (
          uploadedPhotoPath
        ) {
          setPreview(
            buildPhotoUrl(
              uploadedPhotoPath
            )
          );
        }

        setSaved(true);

        window.setTimeout(
          () => {
            setSaved(
              false
            );
          },
          2500
        );
      } catch (error) {
        console.error(
          "Save assistance profile error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to update assistance profile."
        );
      } finally {
        setIsSaving(false);
      }
    };

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  const isStrongPassword = (
    password
  ) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(
        password
      )
    );
  };

  const changePassword =
    async (event) => {
      event.preventDefault();

      setPasswordError("");

      const staffUser =
        getLoggedInAssistance();

      const assistanceId =
        Number(
          profile.assistanceId ||
            staffUser?.staffId
        );

      if (
        !staffUser ||
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        setPasswordError(
          "A valid assistance officer ID was not found. Please sign in again."
        );
        return;
      }

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setPasswordError(
          "Please complete all password fields."
        );
        return;
      }

      if (
        !isStrongPassword(
          newPassword
        )
      ) {
        setPasswordError(
          "New password must contain at least 8 characters, including uppercase, lowercase, a number and a special character."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          "New password and confirm password do not match."
        );
        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordError(
          "New password must be different from the current password."
        );
        return;
      }

      setIsChangingPassword(
        true
      );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/assistances/${assistanceId}/change-password`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  currentPassword,
                  newPassword,
                }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              (response.status === 404
                ? "Password change API route was not found."
                : "Unable to change password.")
          );
        }

        if (
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to change password."
          );
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowCurrentPassword(
          false
        );
        setShowNewPassword(false);
        setShowConfirmPassword(
          false
        );

        setPasswordSuccessPopup(
          true
        );
      } catch (error) {
        console.error(
          "Change assistance password error:",
          error
        );

        setPasswordError(
          error.message ||
            "Unable to change password."
        );
      } finally {
        setIsChangingPassword(
          false
        );
      }
    };

  // ======================================================
  // SHIFT STATUS
  // ======================================================

  const openShiftConfirm =
    () => {
      setShowConfirm(true);
    };

  const confirmShiftChange =
    async () => {
      const staffUser =
        getLoggedInAssistance();

      const assistanceId =
        Number(
          profile.assistanceId ||
            staffUser?.staffId
        );

      if (
        !staffUser ||
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        setShowConfirm(false);

        setErrorMessage(
          "Logged-in assistance officer details were not found. Please sign in again."
        );

        return;
      }

      const newShiftStatus =
        profile.shiftOn
          ? "OFF"
          : "ON";

      setIsUpdatingShift(
        true
      );

      setErrorMessage("");

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/assistances/${assistanceId}/shift-status`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  shiftStatus:
                    newShiftStatus,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success ===
            false
        ) {
          throw new Error(
            data.message ||
              "Unable to update shift status."
          );
        }

        setProfile(
          (
            previousProfile
          ) => ({
            ...previousProfile,

            shiftOn:
              newShiftStatus ===
              "ON",
          })
        );

        setShowConfirm(
          false
        );
      } catch (error) {
        console.error(
          "Update assistance shift status error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to update shift status."
        );
      } finally {
        setIsUpdatingShift(
          false
        );
      }
    };

  const nextStatus =
    profile.shiftOn
      ? "OFF"
      : "ON";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-[#050608] text-white">

      {/* PROFILE CONTENT */}

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full"
        >
          {/* PAGE HEADER */}

          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Assistance Workspace
            </p>

            <h1 className="mt-2 text-3xl font-black text-white">
              Assistance Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your profile details, shift status, profile photo and account security.
            </p>
          </div>

          {/* ERROR MESSAGE */}

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1">
                <p>
                  {errorMessage}
                </p>

                {!isLoading && (
                  <button
                    type="button"
                    onClick={
                      loadProfile
                    }
                    className="mt-3 flex items-center gap-2 font-bold text-red-200 hover:text-white"
                  >
                    <RefreshCw
                      size={15}
                    />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[#1f2a36] bg-[#0b0e14] text-center">
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
              {/* TOP GRID */}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* PROFILE CARD */}

                <div className="rounded-2xl border border-[#1f2a36] bg-[#0b0e14] p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400 bg-[#111] shadow-lg shadow-cyan-500/10">
                      {preview ? (
                        <img
                          src={
                            preview
                          }
                          alt="Assistance Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User
                          size={44}
                          className="text-gray-500"
                        />
                      )}
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400 transition hover:bg-cyan-500/10">
                      <Upload
                        size={15}
                      />

                      Change Photo

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        hidden
                        disabled={
                          isSaving
                        }
                        onChange={
                          handleImageUpload
                        }
                      />
                    </label>

                    <p className="mt-2 text-[9px] text-slate-600">
                      JPG, PNG or WEBP • Max 5 MB
                    </p>

                    {profile.selectedPhoto && (
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        New photo selected — click Save Profile
                      </p>
                    )}

                    <h2 className="mt-5 text-xl font-bold text-white">
                      {profile.name || "Assistance Officer"}
                    </h2>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cyan-400">
                      Assistance Officer
                    </p>

                    {profile.garageName && (
                      <div className="mt-5 w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                          Assigned Garage
                        </p>

                        <p className="mt-1 text-sm font-bold text-cyan-400">
                          {profile.garageName}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 w-full rounded-xl border border-[#1f2a36] bg-[#050608] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[9px] uppercase tracking-widest text-slate-500">
                            Shift Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-bold ${
                              profile.shiftOn
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {profile.shiftOn
                              ? "Currently On-Shift"
                              : "Currently Off-Shift"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            openShiftConfirm
                          }
                          disabled={
                            isUpdatingShift
                          }
                          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            profile.shiftOn
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {profile.shiftOn ? (
                            <>
                              <Power
                                size={15}
                              />
                              ON
                            </>
                          ) : (
                            <>
                              <PowerOff
                                size={15}
                              />
                              OFF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}

                <div className="space-y-6 lg:col-span-2">
                  {/* PROFILE DETAILS */}

                  <div className="rounded-2xl border border-[#1f2a36] bg-[#0b0e14] p-6">
                    <div className="mb-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Profile Information
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-white">
                        Personal Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Full Name
                        </label>

                        <div className="relative">
                          <User
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
                          />

                          <input
                            type="text"
                            name="name"
                            value={
                              profile.name
                            }
                            onChange={
                              handleProfileChange
                            }
                            disabled={
                              isSaving
                            }
                            className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                            placeholder="Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Email
                        </label>

                        <div className="relative">
                          <Mail
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
                          />

                          <input
                            type="email"
                            name="email"
                            value={
                              profile.email
                            }
                            onChange={
                              handleProfileChange
                            }
                            disabled={
                              isSaving
                            }
                            className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                            placeholder="Email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Contact Number
                        </label>

                        <div className="relative">
                          <Phone
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
                          />

                          <input
                            type="tel"
                            name="contactNumber"
                            value={
                              profile.contactNumber
                            }
                            onChange={
                              handleProfileChange
                            }
                            disabled={
                              isSaving
                            }
                            className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                            placeholder="Contact Number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          NIC
                        </label>

                        <div className="relative">
                          <User
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"
                          />

                          <input
                            type="text"
                            name="nic"
                            value={
                              profile.nic
                            }
                            onChange={
                              handleProfileChange
                            }
                            disabled={
                              isSaving
                            }
                            className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] pl-10 pr-3 text-sm uppercase outline-none transition focus:border-cyan-400 disabled:opacity-60"
                            placeholder="NIC"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#1f2a36] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] leading-5 text-slate-500">
                        Update your personal details and selected profile photo together.
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleSave
                        }
                        disabled={
                          isSaving
                        }
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save
                              size={16}
                            />
                            Save Profile
                          </>
                        )}
                      </button>
                    </div>

                    {saved && (
                      <motion.p
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        className="mt-3 text-right text-xs font-bold text-green-400"
                      >
                        Profile updated successfully ✔
                      </motion.p>
                    )}
                  </div>

                  {/* SECURITY */}

                  <div className="rounded-2xl border border-[#1f2a36] bg-[#0b0e14] p-6">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                        Security
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-white">
                        Change Password
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Replace the temporary password provided by your garage owner.
                      </p>
                    </div>

                    {passwordError && (
                      <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                        <AlertCircle
                          size={16}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {passwordError}
                        </span>
                      </div>
                    )}

                    <form
                      onSubmit={
                        changePassword
                      }
                      autoComplete="off"
                    >
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Current Password
                          </label>

                          <div className="relative">
                            <LockKeyhole
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                              type={
                                showCurrentPassword
                                  ? "text"
                                  : "password"
                              }
                              value={
                                currentPassword
                              }
                              onChange={(
                                event
                              ) => {
                                setCurrentPassword(
                                  event.target.value
                                );
                                setPasswordError(
                                  ""
                                );
                              }}
                              autoComplete="off"
                              data-lpignore="true"
                              data-1p-ignore="true"
                              disabled={
                                isChangingPassword
                              }
                              className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] pl-10 pr-11 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                              placeholder="Current password"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(
                                  (value) =>
                                    !value
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                              aria-label="Show or hide current password"
                            >
                              {showCurrentPassword ? (
                                <EyeOff
                                  size={17}
                                />
                              ) : (
                                <Eye
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            New Password
                          </label>

                          <div className="relative">
                            <input
                              type={
                                showNewPassword
                                  ? "text"
                                  : "password"
                              }
                              value={
                                newPassword
                              }
                              onChange={(
                                event
                              ) => {
                                setNewPassword(
                                  event.target.value
                                );
                                setPasswordError(
                                  ""
                                );
                              }}
                              autoComplete="new-password"
                              data-lpignore="true"
                              data-1p-ignore="true"
                              disabled={
                                isChangingPassword
                              }
                              className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] px-3 pr-11 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                              placeholder="New password"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(
                                  (value) =>
                                    !value
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                              aria-label="Show or hide new password"
                            >
                              {showNewPassword ? (
                                <EyeOff
                                  size={17}
                                />
                              ) : (
                                <Eye
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Confirm Password
                          </label>

                          <div className="relative">
                            <input
                              type={
                                showConfirmPassword
                                  ? "text"
                                  : "password"
                              }
                              value={
                                confirmPassword
                              }
                              onChange={(
                                event
                              ) => {
                                setConfirmPassword(
                                  event.target.value
                                );
                                setPasswordError(
                                  ""
                                );
                              }}
                              autoComplete="new-password"
                              data-lpignore="true"
                              data-1p-ignore="true"
                              disabled={
                                isChangingPassword
                              }
                              className="h-11 w-full rounded-lg border border-[#1f2a36] bg-[#050608] px-3 pr-11 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60"
                              placeholder="Confirm password"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(
                                  (value) =>
                                    !value
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                              aria-label="Show or hide confirm password"
                            >
                              {showConfirmPassword ? (
                                <EyeOff
                                  size={17}
                                />
                              ) : (
                                <Eye
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#1f2a36] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Strong Password Required
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-slate-600">
                            8+ characters • uppercase • lowercase • number • special character
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={
                            isChangingPassword
                          }
                          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isChangingPassword ? (
                            <>
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                              Changing...
                            </>
                          ) : (
                            <>
                              <LockKeyhole
                                size={15}
                              />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* PASSWORD SUCCESS POPUP */}

      {passwordSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-sm rounded-2xl border border-green-500/30 bg-[#0b0e14] p-6 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
              <CheckCircle2
                size={32}
              />
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-green-400">
              Security Updated
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Password Changed Successfully
            </h3>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              Your password has been updated. Use your new password the next time you sign in.
            </p>

            <button
              type="button"
              onClick={() =>
                setPasswordSuccessPopup(
                  false
                )
              }
              className="mt-5 w-full rounded-lg bg-green-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-green-500"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}

      {/* CUSTOM CONFIRM POPUP */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="relative w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-[#0b0e14] p-6 text-center shadow-2xl"
          >

            <button
              type="button"
              onClick={() =>
                setShowConfirm(
                  false
                )
              }
              disabled={
                isUpdatingShift
              }
              className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-white disabled:opacity-50"
              aria-label="Close shift confirmation"
            >

              <X
                size={22}
              />

            </button>

            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                profile.shiftOn
                  ? "bg-red-500/20"
                  : "bg-green-500/20"
              }`}
            >

              {profile.shiftOn ? (
                <PowerOff
                  size={34}
                  className="text-red-400"
                />
              ) : (
                <Power
                  size={34}
                  className="text-green-400"
                />
              )}

            </div>

            <h3 className="mb-2 text-2xl font-bold">
              Confirm Shift Change
            </h3>

            <p className="mb-6 text-lg text-gray-300">

              Are you sure you want to turn your shift{" "}

              <span
                className={
                  nextStatus ===
                  "ON"
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
                onClick={() =>
                  setShowConfirm(
                    false
                  )
                }
                disabled={
                  isUpdatingShift
                }
                className="w-1/2 cursor-pointer rounded-lg bg-gray-700 py-3 font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmShiftChange
                }
                disabled={
                  isUpdatingShift
                }
                className={`flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  nextStatus ===
                  "ON"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >

                {isUpdatingShift ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

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