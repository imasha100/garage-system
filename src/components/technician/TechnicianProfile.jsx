import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  HelpCircle,
  Plus,
  X,
  Power,
  PowerOff,
  Menu,
  RefreshCw,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  UserCog,
  Save,
  Pencil,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
} from "lucide-react";

import avatarImage from "../../assets/profile.png";
import TechnicianNotifications from "./TechnicianNotifications";

export default function TechnicianProfile({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // STATES
  // ======================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [technician, setTechnician] =
    useState(null);

  const [
    originalTechnician,
    setOriginalTechnician,
  ] = useState(null);

  const [
    isLoadingTechnician,
    setIsLoadingTechnician,
  ] = useState(true);

  const [
    technicianError,
    setTechnicianError,
  ] = useState("");

  const [isEditing, setIsEditing] =
    useState(false);

  const [isOnShift, setIsOnShift] =
    useState(false);

  const [
    shiftStartTime,
    setShiftStartTime,
  ] = useState(null);

  const [duration, setDuration] =
    useState("00:00:00");

  const [skills, setSkills] =
    useState([]);

  const [
    originalSkills,
    setOriginalSkills,
  ] = useState([]);

  const [newSkill, setNewSkill] =
    useState("");

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    isUpdatingShift,
    setIsUpdatingShift,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    saveMessageType,
    setSaveMessageType,
  ] = useState("success");

  const [
    shiftActivity,
    setShiftActivity,
  ] = useState([]);

  // ======================================================
  // CHANGE PASSWORD STATES
  // ======================================================

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
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

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
    passwordSuccessPopup,
    setPasswordSuccessPopup,
  ] = useState(false);

  const [
    profilePhotoPreview,
    setProfilePhotoPreview,
  ] = useState("");

  // ======================================================
  // GET LOGGED-IN STAFF USER
  // ======================================================

  const getLoggedInStaffUser = () => {
    try {
      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        return null;
      }

      return JSON.parse(
        storedStaffUser
      );
    } catch (error) {
      console.error(
        "Unable to read logged-in staff user:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // GET LOGGED-IN TECHNICIAN ID
  // ======================================================

  const getTechnicianId = () => {
    const staffUser =
      getLoggedInStaffUser();

    if (!staffUser) {
      return null;
    }

    if (
      String(
        staffUser.role || ""
      ).toLowerCase() !==
      "technician"
    ) {
      return null;
    }

    const technicianId =
      Number(
        staffUser.staffId
      );

    if (
      !Number.isInteger(
        technicianId
      ) ||
      technicianId <= 0
    ) {
      return null;
    }

    return technicianId;
  };

  // ======================================================
  // PROFILE PHOTO UPLOAD
  // ======================================================

  useEffect(() => {
    const technicianId =
      getTechnicianId();

    if (!technicianId) {
      return;
    }

    const storedPhoto =
      localStorage.getItem(
        `technicianProfilePhoto_${technicianId}`
      );

    if (storedPhoto) {
      setProfilePhotoPreview(
        storedPhoto
      );
    }
  }, []);

  const handleProfilePhotoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      showSaveMessage(
        "Please select a valid image file.",
        "error"
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      showSaveMessage(
        "Profile photo must be 2 MB or smaller.",
        "error"
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const imageData =
        String(
          reader.result || ""
        );

      const technicianId =
        getTechnicianId();

      setProfilePhotoPreview(
        imageData
      );

      if (technicianId) {
        localStorage.setItem(
          `technicianProfilePhoto_${technicianId}`,
          imageData
        );
      }

      showSaveMessage(
        "Profile photo updated successfully.",
        "success"
      );
    };

    reader.onerror = () => {
      showSaveMessage(
        "Unable to load the selected profile photo.",
        "error"
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // ======================================================
  // PROFILE PHOTO
  // ======================================================

  const getProfilePhoto = (
    value
  ) => {
    if (!value) {
      return avatarImage;
    }

    const photo =
      String(value).trim();

    if (
      photo.startsWith(
        "http://"
      ) ||
      photo.startsWith(
        "https://"
      ) ||
      photo.startsWith(
        "data:"
      ) ||
      photo.startsWith(
        "blob:"
      )
    ) {
      return photo;
    }

    if (
      photo.startsWith("/")
    ) {
      return `http://localhost:5000${photo}`;
    }

    return `http://localhost:5000/${photo}`;
  };

  // ======================================================
  // LOAD TECHNICIAN PROFILE
  // ======================================================

  const loadTechnicianDetails =
    async (
      showLoading = true
    ) => {
      if (showLoading) {
        setIsLoadingTechnician(
          true
        );
      }

      setTechnicianError("");

      try {
        const technicianId =
          getTechnicianId();

        if (!technicianId) {
          throw new Error(
            "A valid logged-in technician account could not be identified."
          );
        }

        const response =
          await fetch(
            `http://localhost:5000/api/technicians/${technicianId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false ||
          !data.technician
        ) {
          throw new Error(
            data.message ||
              "Unable to load technician profile."
          );
        }

        const technicianData =
          data.technician;

        setTechnician(
          technicianData
        );

        setOriginalTechnician(
          technicianData
        );

        const databaseSkills =
          Array.isArray(
            technicianData.specialization
          )
            ? technicianData.specialization
            : technicianData.specialization
            ? [
                technicianData.specialization,
              ]
            : [];

        setSkills(
          databaseSkills
        );

        setOriginalSkills(
          databaseSkills
        );

        const currentShift =
          String(
            technicianData.shiftStatus ||
              ""
          ).toUpperCase() ===
          "ON";

        setIsOnShift(
          currentShift
        );

        const storedShiftStart =
          sessionStorage.getItem(
            `technicianShiftStart_${technicianId}`
          );

        if (currentShift) {
          const start =
            Number(storedShiftStart);

          if (
            Number.isFinite(start) &&
            start > 0
          ) {
            setShiftStartTime(start);
          } else {
            const fallbackStart =
              Date.now();

            sessionStorage.setItem(
              `technicianShiftStart_${technicianId}`,
              String(fallbackStart)
            );

            setShiftStartTime(
              fallbackStart
            );
          }
        } else {
          sessionStorage.removeItem(
            `technicianShiftStart_${technicianId}`
          );

          setShiftStartTime(null);
          setDuration("00:00:00");
        }
      } catch (error) {
        console.error(
          "Load technician profile error:",
          error
        );

        setTechnician(null);
        setOriginalTechnician(null);

        setSkills([]);
        setOriginalSkills([]);

        setTechnicianError(
          error.message ||
            "Unable to load technician profile."
        );
      } finally {
        if (showLoading) {
          setIsLoadingTechnician(
            false
          );
        }
      }
    };

  // ======================================================
  // LOAD WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    loadTechnicianDetails();

    const refreshInterval =
      setInterval(() => {
        if (
          !isSaving &&
          !isUpdatingShift &&
          !isEditing
        ) {
          loadTechnicianDetails(
            false
          );
        }
      }, 5000);

    return () => {
      clearInterval(
        refreshInterval
      );
    };
  }, [
    isSaving,
    isUpdatingShift,
    isEditing,
  ]);

  // ======================================================
  // SHIFT TIMER
  // ======================================================

  useEffect(() => {
    let interval;

    if (
      isOnShift &&
      shiftStartTime
    ) {
      const updateDuration =
        () => {
          const difference =
            Math.max(
              0,
              Date.now() -
                shiftStartTime
            );

          const hours =
            Math.floor(
              difference /
                1000 /
                60 /
                60
            );

          const minutes =
            Math.floor(
              (
                difference /
                1000 /
                60
              ) % 60
            );

          const seconds =
            Math.floor(
              (
                difference /
                1000
              ) % 60
            );

          setDuration(
            `${String(
              hours
            ).padStart(
              2,
              "0"
            )}:${String(
              minutes
            ).padStart(
              2,
              "0"
            )}:${String(
              seconds
            ).padStart(
              2,
              "0"
            )}`
          );
        };

      updateDuration();

      interval =
        setInterval(
          updateDuration,
          1000
        );
    }

    return () => {
      if (interval) {
        clearInterval(
          interval
        );
      }
    };
  }, [
    isOnShift,
    shiftStartTime,
  ]);

  // ======================================================
  // SHOW MESSAGE
  // ======================================================

  const showSaveMessage = (
    message,
    type = "success"
  ) => {
    setSaveMessage(
      message
    );

    setSaveMessageType(
      type
    );

    setTimeout(() => {
      setSaveMessage("");
    }, 3500);
  };

  // ======================================================
  // EDIT PROFILE
  // ======================================================

  const startEditing = () => {
    if (!technician) {
      return;
    }

    setOriginalTechnician({
      ...technician,
    });

    setOriginalSkills([
      ...skills,
    ]);

    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (
      originalTechnician
    ) {
      setTechnician({
        ...originalTechnician,
      });
    }

    setSkills([
      ...originalSkills,
    ]);

    setNewSkill("");

    setIsEditing(false);
  };

  const updateField = (
    field,
    value
  ) => {
    setTechnician(
      (
        previous
      ) =>
        previous
          ? {
              ...previous,
              [field]:
                value,
            }
          : previous
    );
  };

  // ======================================================
  // SHIFT ACTIONS
  // ======================================================

  const openShiftPopup = () => {
    setShowConfirm(true);
  };

  const confirmShiftChange =
    async () => {
      if (
        isUpdatingShift
      ) {
        return;
      }

      setIsUpdatingShift(
        true
      );

      try {
        const technicianId =
          getTechnicianId();

        if (!technicianId) {
          throw new Error(
            "A valid technician account could not be identified."
          );
        }

        const newStatus =
          isOnShift
            ? "OFF"
            : "ON";

        const response =
          await fetch(
            `http://localhost:5000/api/technicians/${technicianId}/shift-status`,
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
                    newStatus,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to update technician shift status."
          );
        }

        if (
          newStatus === "ON"
        ) {
          const startTime =
            Date.now();

          setIsOnShift(true);

          setShiftStartTime(
            startTime
          );

          setDuration(
            "00:00:00"
          );

          sessionStorage.setItem(
            `technicianShiftStart_${technicianId}`,
            String(
              startTime
            )
          );

          setShiftActivity(
            (
              previous
            ) => [
              {
                id:
                  Date.now(),

                date:
                  new Date().toLocaleString(),

                action:
                  "SHIFT STARTED",

                duration:
                  "-",
              },

              ...previous,
            ]
          );
        }

        if (
          newStatus === "OFF"
        ) {
          const completedDuration =
            duration;

          setShiftActivity(
            (
              previous
            ) => [
              {
                id:
                  Date.now(),

                date:
                  new Date().toLocaleString(),

                action:
                  "SHIFT ENDED",

                duration:
                  completedDuration,
              },

              ...previous,
            ]
          );

          setIsOnShift(false);

          setShiftStartTime(
            null
          );

          setDuration(
            "00:00:00"
          );

          sessionStorage.removeItem(
            `technicianShiftStart_${technicianId}`
          );
        }

        setTechnician(
          (
            previous
          ) =>
            previous
              ? {
                  ...previous,
                  shiftStatus:
                    newStatus,
                }
              : previous
        );

        setShowConfirm(
          false
        );

        showSaveMessage(
          `Shift turned ${newStatus} successfully.`,
          "success"
        );
      } catch (error) {
        console.error(
          "Update technician shift status error:",
          error
        );

        setShowConfirm(
          false
        );

        showSaveMessage(
          error.message ||
            "Unable to update technician shift status.",
          "error"
        );
      } finally {
        setIsUpdatingShift(
          false
        );
      }
    };

  // ======================================================
  // SKILL ACTIONS
  // ======================================================

  const addSkill = (
    event
  ) => {
    event.preventDefault();

    if (!isEditing) {
      return;
    }

    const trimmedSkill =
      newSkill.trim();

    if (!trimmedSkill) {
      return;
    }

    const alreadyExists =
      skills.some(
        (skill) =>
          String(skill)
            .toLowerCase() ===
          trimmedSkill.toLowerCase()
      );

    if (alreadyExists) {
      showSaveMessage(
        "This specialization is already added.",
        "error"
      );

      return;
    }

    setSkills(
      (
        previousSkills
      ) => [
        ...previousSkills,
        trimmedSkill,
      ]
    );

    setNewSkill("");
  };

  const removeSkill = (
    index
  ) => {
    if (!isEditing) {
      return;
    }

    setSkills(
      (
        previousSkills
      ) =>
        previousSkills.filter(
          (
            _,
            skillIndex
          ) =>
            skillIndex !==
            index
        )
    );
  };

  // ======================================================
  // SAVE PROFILE CHANGES
  // ======================================================

  const saveChanges =
    async () => {
      if (
        isSaving ||
        !isEditing
      ) {
        return;
      }

      try {
        const technicianId =
          getTechnicianId();

        if (!technicianId) {
          throw new Error(
            "A valid technician account could not be identified."
          );
        }

        if (!technician) {
          throw new Error(
            "Technician profile is not available."
          );
        }

        if (
          !String(
            technician.fullName ||
              ""
          ).trim()
        ) {
          throw new Error(
            "Full name is required."
          );
        }

        if (
          !String(
            technician.email ||
              ""
          ).trim()
        ) {
          throw new Error(
            "Email is required."
          );
        }

        if (
          !String(
            technician.contactNumber ||
              ""
          ).trim()
        ) {
          throw new Error(
            "Contact number is required."
          );
        }

        if (
          !String(
            technician.nic ||
              ""
          ).trim()
        ) {
          throw new Error(
            "NIC is required."
          );
        }

        setIsSaving(true);

        const response =
          await fetch(
            `http://localhost:5000/api/technicians/${technicianId}`,
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
                    String(
                      technician.fullName ||
                        ""
                    ).trim(),

                  email:
                    String(
                      technician.email ||
                        ""
                    ).trim(),

                  contactNumber:
                    String(
                      technician.contactNumber ||
                        ""
                    ).trim(),

                  nic:
                    String(
                      technician.nic ||
                        ""
                    ).trim(),

                  experience:
                    Number(
                      technician.experience ??
                        technician.experienceYears ??
                        0
                    ),

                  experienceYears:
                    Number(
                      technician.experience ??
                        technician.experienceYears ??
                        0
                    ),

                  specialization:
                    skills,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to save technician profile."
          );
        }

        setIsEditing(false);

        showSaveMessage(
          "Profile changes saved successfully.",
          "success"
        );

        await loadTechnicianDetails(
          false
        );
      } catch (error) {
        console.error(
          "Save technician profile error:",
          error
        );

        showSaveMessage(
          error.message ||
            "Unable to save technician profile.",
          "error"
        );
      } finally {
        setIsSaving(
          false
        );
      }
    };

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  const changePassword = async (event) => {
    event.preventDefault();

    if (isChangingPassword) {
      return;
    }

    try {
      const technicianId =
        getTechnicianId();

      if (!technicianId) {
        throw new Error(
          "A valid technician account could not be identified."
        );
      }

      if (
        !currentPassword.trim() ||
        !newPassword.trim() ||
        !confirmPassword.trim()
      ) {
        throw new Error(
          "Please complete all password fields."
        );
      }

      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (
        !strongPasswordRegex.test(
          newPassword
        )
      ) {
        throw new Error(
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character."
        );
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        throw new Error(
          "New password and confirm password do not match."
        );
      }

      if (
        currentPassword ===
        newPassword
      ) {
        throw new Error(
          "New password must be different from the current password."
        );
      }

      setIsChangingPassword(true);

      const response =
        await fetch(
          `http://localhost:5000/api/technicians/${technicianId}/change-password`,
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

      const data =
        await response.json();

      if (
        !response.ok ||
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

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordSuccessPopup(
        true
      );
    } catch (error) {
      console.error(
        "Change technician password error:",
        error
      );

      showSaveMessage(
        error.message ||
          "Unable to change password.",
        "error"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ======================================================
  // DISPLAY VALUES
  // ======================================================

  const technicianName =
    technician?.fullName ||
    "Technician";

  const technicianRole =
    skills.length > 0
      ? skills[0]
      : "Workshop Technician";

  const technicianEmail =
    technician?.email ||
    "N/A";

  const technicianContact =
    technician
      ?.contactNumber ||
    "N/A";

  const technicianNic =
    technician?.nic ||
    "N/A";

  const experienceValue =
    technician?.experience ??
    technician
      ?.experienceYears;

  const technicianExperience =
    experienceValue !==
      undefined &&
    experienceValue !== null &&
    experienceValue !== ""
      ? `${experienceValue} Years`
      : "N/A";

  const technicianPhoto =
    profilePhotoPreview ||
    getProfilePhoto(
      technician
        ?.profilePhoto
    );

  const technicianInitials =
    technicianName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (
          namePart
        ) =>
          namePart
            .charAt(0)
            .toUpperCase()
      )
      .join("") || "T";

  // ======================================================
  // SEARCH
  // ======================================================

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredSkills =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return skills.map(
          (
            skill,
            index
          ) => ({
            skill,
            originalIndex:
              index,
          })
        );
      }

      return skills
        .map(
          (
            skill,
            index
          ) => ({
            skill,
            originalIndex:
              index,
          })
        )
        .filter(
          ({
            skill,
          }) =>
            String(
              skill
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );
    }, [
      skills,
      normalizedSearch,
    ]);

  const filteredShiftActivity =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return shiftActivity;
      }

      return shiftActivity.filter(
        (row) =>
          [
            row.date,
            row.action,
            row.duration,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }, [
      shiftActivity,
      normalizedSearch,
    ]);

  const nextStatus =
    isOnShift
      ? "OFF"
      : "ON";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative min-h-screen bg-[#0a0d14] font-mono text-slate-300">
      {/* HEADER */}

      <header className="sticky top-0 z-50 flex h-[70px] items-center gap-4 border-b border-slate-800 bg-[#111827]/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex w-auto shrink-0 items-center gap-3 md:w-48">
          <button
            type="button"
            onClick={
              toggleSidebar
            }
            aria-label="Open technician sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#0a0d14] text-slate-400 transition hover:border-indigo-500 hover:text-white md:hidden"
          >
            <Menu
              size={
                20
              }
            />
          </button>

          <h1 className="text-sm font-black tracking-[0.15em] text-white">
            TECHNICIANS
          </h1>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[525px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search Workshop..."
              aria-label="Search profile content"
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-11 pr-4 text-xs text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <TechnicianNotifications onNavigate={onNavigate} />

          <button
            type="button"
            aria-label="Help"
            className="text-slate-400 transition hover:text-white"
          >
            <HelpCircle
              size={
                17
              }
            />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="hidden text-right sm:block">
              <p className="max-w-[150px] truncate text-[10px] font-bold text-white">
                {isLoadingTechnician
                  ? "Loading..."
                  : technicianName}
              </p>

              <p className="max-w-[150px] truncate text-[9px] uppercase text-slate-500">
                {isLoadingTechnician
                  ? "Technician"
                  : technicianRole}
              </p>
            </div>

            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={
                  technicianPhoto
                }
                alt={`${technicianName} profile`}
                className="h-full w-full object-cover"
                onError={(
                  event
                ) => {
                  event.currentTarget.src =
                    avatarImage;
                }}
              />

              <div className="absolute inset-0 -z-10 flex items-center justify-center text-xs font-black text-indigo-300">
                {
                  technicianInitials
                }
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}

      <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="search"
            value={
              searchQuery
            }
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target
                  .value
              )
            }
            placeholder="Search Workshop..."
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#0a0d14] pl-10 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {technicianError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-red-300">
                Unable to load technician profile
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {
                  technicianError
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadTechnicianDetails()
              }
              disabled={
                isLoadingTechnician
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={
                  16
                }
                className={
                  isLoadingTechnician
                    ? "animate-spin"
                    : ""
                }
              />

              Retry
            </button>
          </div>
        )}

        {saveMessage && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              saveMessageType ===
              "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {
              saveMessage
            }
          </div>
        )}

        {/* TITLE + ACTIONS */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Technician Profile
            </h1>

            <p className="mt-1 text-base text-slate-500 sm:text-xl">
              Manage your professional credentials and shift availability.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={
                startEditing
              }
              disabled={
                isLoadingTechnician ||
                !technician
              }
              className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil
                size={
                  16
                }
              />

              EDIT PROFILE
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={
                  cancelEditing
                }
                disabled={
                  isSaving
                }
                className="rounded-md border border-slate-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={
                  saveChanges
                }
                disabled={
                  isSaving
                }
                className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save
                  size={
                    16
                  }
                />

                {isSaving
                  ? "SAVING..."
                  : "SAVE CHANGES"}
              </button>
            </div>
          )}
        </div>

        {/* PROFILE + SHIFT */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* PROFILE CARD */}

          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-8 text-center">
            <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-emerald-400 to-indigo-500" />

              <div className="absolute inset-1 rounded-full bg-[#10121b]" />

              <div className="relative z-10 h-28 w-28 overflow-hidden rounded-full bg-slate-800">
                <img
                  src={
                    technicianPhoto
                  }
                  alt={`${technicianName} profile`}
                  className="h-full w-full object-cover"
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      avatarImage;
                  }}
                />
              </div>
            </div>

            <div className="mb-5">
              <input
                id="technician-profile-photo"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={
                  handleProfilePhotoChange
                }
                className="hidden"
              />

              <label
                htmlFor="technician-profile-photo"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0a0d14] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-indigo-500 hover:text-white"
              >
                <Camera size={14} />
                Change Photo
              </label>

              <p className="mt-2 text-[8px] text-slate-600">
                JPG, PNG or WEBP • Max 2 MB
              </p>
            </div>

            {!isEditing ? (
              <>
                <h2 className="text-xl font-bold text-white">
                  {isLoadingTechnician
                    ? "Loading..."
                    : technicianName}
                </h2>

                <p className="mb-6 mt-1 text-xs uppercase tracking-widest text-indigo-400">
                  {
                    technicianRole
                  }
                </p>
              </>
            ) : (
              <div className="mb-6">
                <label className="mb-1 block text-left text-[9px] uppercase tracking-widest text-slate-500">
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    technician
                      ?.fullName ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "fullName",
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#0a0d14] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-3 text-left">
              {/* EMAIL */}

              <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <div className="flex items-start gap-3">
                  <Mail
                    size={
                      17
                    }
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-slate-600">
                      Email
                    </p>

                    {isEditing ? (
                      <input
                        type="email"
                        value={
                          technician
                            ?.email ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "email",
                            event.target
                              .value
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-700 bg-[#111827] px-2 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 break-all text-xs font-bold text-white">
                        {
                          technicianEmail
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTACT */}

              <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <div className="flex items-start gap-3">
                  <Phone
                    size={
                      17
                    }
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-slate-600">
                      Contact Number
                    </p>

                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          technician
                            ?.contactNumber ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "contactNumber",
                            event.target
                              .value
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-700 bg-[#111827] px-2 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-xs font-bold text-white">
                        {
                          technicianContact
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* NIC */}

              <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <div className="flex items-start gap-3">
                  <CreditCard
                    size={
                      17
                    }
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-slate-600">
                      NIC
                    </p>

                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          technician
                            ?.nic ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "nic",
                            event.target
                              .value
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-700 bg-[#111827] px-2 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-xs font-bold text-white">
                        {
                          technicianNic
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* EXPERIENCE */}

              <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3">
                <div className="flex items-start gap-3">
                  <Briefcase
                    size={
                      17
                    }
                    className="mt-0.5 shrink-0 text-purple-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-slate-600">
                      Experience
                    </p>

                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={
                          technician
                            ?.experience ??
                          technician
                            ?.experienceYears ??
                          ""
                        }
                        onChange={(
                          event
                        ) => {
                          const value =
                            event.target
                              .value;

                          updateField(
                            "experience",
                            value
                          );

                          updateField(
                            "experienceYears",
                            value
                          );
                        }}
                        className="mt-1 w-full rounded border border-slate-700 bg-[#111827] px-2 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-xs font-bold text-white">
                        {
                          technicianExperience
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHIFT CARD */}

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-[#10121b] p-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Attendance
                  </p>

                  <h3 className="text-xl font-bold text-white">
                    Shift Status
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] ${
                      isOnShift
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnShift
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />

                    {isUpdatingShift
                      ? "Updating Shift..."
                      : isOnShift
                      ? "Currently On-Shift"
                      : "Currently Off-Shift"}
                  </span>

                  <button
                    type="button"
                    onClick={
                      openShiftPopup
                    }
                    disabled={
                      isUpdatingShift
                    }
                    className={`h-6 w-12 rounded-full p-1 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isOnShift
                        ? "bg-emerald-500"
                        : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-300 ${
                        isOnShift
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    >
                      {isUpdatingShift && (
                        <RefreshCw
                          size={10}
                          className="animate-spin text-slate-600"
                        />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <h2 className="mb-2 text-4xl font-black text-white">
                {
                  duration
                }

                <span className="ml-2 text-sm font-normal text-slate-500">
                  Current Duration
                </span>
              </h2>

              <div className="mb-6 h-2 w-full rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOnShift
                      ? "w-2/3 bg-indigo-500"
                      : "w-0"
                  }`}
                />
              </div>

              <p className="text-[10px] text-slate-500">
                {isOnShift &&
                shiftStartTime
                  ? `Shift began at ${new Date(
                      shiftStartTime
                    ).toLocaleTimeString()}`
                  : isOnShift
                  ? "Shift is active."
                  : "Shift is currently inactive."}
              </p>
            </div>

            {/* CHANGE PASSWORD */}

            <div className="rounded-xl border border-slate-800 bg-[#10121b] p-5 sm:p-6">
              <div className="mb-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Security
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Change Password
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Replace the temporary password provided by your garage owner.
                </p>
              </div>

              <form
                onSubmit={changePassword}
                autoComplete="off"
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Current Password
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showCurrentPassword
                            ? "text"
                            : "password"
                        }
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(
                            event.target.value
                          )
                        }
                        placeholder="Current password"
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        disabled={isChangingPassword}
                        className="h-10 w-full rounded-lg border border-slate-700 bg-[#0a0d14] px-3 pr-10 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(
                            (previous) => !previous
                          )
                        }
                        disabled={isChangingPassword}
                        aria-label={
                          showCurrentPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(
                            event.target.value
                          )
                        }
                        placeholder="New password"
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        disabled={isChangingPassword}
                        className="h-10 w-full rounded-lg border border-slate-700 bg-[#0a0d14] px-3 pr-10 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            (previous) => !previous
                          )
                        }
                        disabled={isChangingPassword}
                        aria-label={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showNewPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        disabled={isChangingPassword}
                        className="h-10 w-full rounded-lg border border-slate-700 bg-[#0a0d14] px-3 pr-10 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        disabled={isChangingPassword}
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirmed password"
                            : "Show confirmed password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Strong password required
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-slate-600">
                      8+ characters • uppercase • lowercase • number • special character
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="h-9 shrink-0 rounded-lg bg-indigo-600 px-5 text-[9px] font-bold uppercase tracking-widest text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isChangingPassword
                      ? "CHANGING..."
                      : "CHANGE PASSWORD"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* SPECIALIZATION + SHIFT ACTIVITY */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserCog
                size={
                  17
                }
                className="text-indigo-400"
              />

              <h3 className="text-sm font-bold text-white">
                Specializations
              </h3>
            </div>

            {filteredSkills.length >
            0 ? (
              filteredSkills.map(
                ({
                  skill,
                  originalIndex,
                }) => (
                  <div
                    key={`${skill}-${originalIndex}`}
                    className="mb-2 flex items-center justify-between rounded border border-slate-800 bg-[#0a0d14] p-3 text-[11px] text-slate-300"
                  >
                    <span>
                      {
                        skill
                      }
                    </span>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(
                            originalIndex
                          )
                        }
                        className="text-red-500 transition hover:text-red-300"
                      >
                        <X
                          size={
                            14
                          }
                        />
                      </button>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="rounded border border-slate-800 bg-[#0a0d14] p-4 text-center text-[11px] text-slate-500">
                No specializations found.
              </p>
            )}

            {isEditing && (
              <>
                <form
                  onSubmit={
                    addSkill
                  }
                  className="mt-4 flex gap-2"
                >
                  <input
                    type="text"
                    value={
                      newSkill
                    }
                    onChange={(
                      event
                    ) =>
                      setNewSkill(
                        event.target
                          .value
                      )
                    }
                    placeholder="Add specialization..."
                    className="min-w-0 flex-1 rounded border border-slate-800 bg-[#0a0d14] p-2 text-[10px] outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="rounded bg-indigo-600 p-2 text-white transition hover:bg-indigo-700"
                  >
                    <Plus
                      size={
                        14
                      }
                    />
                  </button>
                </form>

                <p className="mt-3 text-[9px] leading-4 text-slate-600">
                  Save Changes after editing specializations.
                </p>
              </>
            )}
          </div>

          {/* SHIFT ACTIVITY */}

          <div className="rounded-xl border border-slate-800 bg-[#10121b] p-6 lg:col-span-2">
            <h3 className="mb-1 text-sm font-bold text-white">
              Shift Activity
            </h3>

            <p className="mb-4 text-[9px] text-slate-600">
              Shift changes made during the current login session.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-[10px] text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 uppercase">
                    <th className="pb-3 text-left">
                      Date & Time
                    </th>

                    <th className="pb-3 text-left">
                      Activity
                    </th>

                    <th className="pb-3 text-left">
                      Duration
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShiftActivity.length >
                  0 ? (
                    filteredShiftActivity.map(
                      (
                        row
                      ) => (
                        <tr
                          key={
                            row.id
                          }
                          className="border-b border-slate-800/50"
                        >
                          <td className="py-3">
                            {
                              row.date
                            }
                          </td>

                          <td
                            className={`py-3 font-bold ${
                              row.action ===
                              "SHIFT STARTED"
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {
                              row.action
                            }
                          </td>

                          <td className="py-3">
                            {
                              row.duration
                            }
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-10 text-center text-slate-500"
                      >
                        No shift activity recorded in this session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* PASSWORD SUCCESS POPUP */}

      {passwordSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-[#10121b] p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2
                size={32}
              />
            </div>

            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Security Updated
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Password Changed Successfully
            </h2>

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
              className="mt-6 w-full rounded-lg bg-emerald-600 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-emerald-500"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* SHIFT CONFIRMATION POPUP */}

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#10121b] p-6 text-center shadow-2xl">
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
              className="absolute right-4 top-4 text-slate-400 hover:text-white disabled:opacity-50"
            >
              <X
                size={
                  22
                }
              />
            </button>

            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                nextStatus ===
                "ON"
                  ? "bg-emerald-500/10"
                  : "bg-rose-500/10"
              }`}
            >
              {nextStatus ===
              "ON" ? (
                <Power
                  size={
                    34
                  }
                  className="text-emerald-400"
                />
              ) : (
                <PowerOff
                  size={
                    34
                  }
                  className="text-rose-400"
                />
              )}
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              Confirm Shift Change
            </h2>

            <p className="mb-6 text-slate-400">
              Are you sure you want to turn your shift{" "}
              <span
                className={`font-bold ${
                  nextStatus ===
                  "ON"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {
                  nextStatus
                }
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
                className="w-1/2 rounded-lg bg-slate-700 py-3 font-bold text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={
                  confirmShiftChange
                }
                disabled={
                  isUpdatingShift
                }
                className={`w-1/2 rounded-lg py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  nextStatus ===
                  "ON"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isUpdatingShift
                  ? "UPDATING..."
                  : `YES, TURN ${nextStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}