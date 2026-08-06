import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function OwnerProfile({
  toggleSidebar,
}) {
  // ======================================================
  // REFS
  // ======================================================

  const fileInputRef = useRef(null);

  // ======================================================
  // BASIC STATES
  // ======================================================

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ======================================================
  // OWNER DATA
  // ======================================================

  const [
    ownerData,
    setOwnerData,
  ] = useState(null);

  // ======================================================
  // PROFILE PHOTO
  // ======================================================

  const [
    profileImage,
    setProfileImage,
  ] = useState(null);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    photoError,
    setPhotoError,
  ] = useState("");

  const [
    photoSuccess,
    setPhotoSuccess,
  ] = useState("");

  // ======================================================
  // PROFILE FORM
  // ======================================================

  const [
    profile,
    setProfile,
  ] = useState({
    name: "",
    role: "Garage Owner",
    email: "",
    phone: "",
    garageName: "",
    location: "",
    joinedDate: "",
    nic: "",
    garageCode: "",
    district: "",
  });

  const [
    tempProfile,
    setTempProfile,
  ] = useState(profile);

  // ======================================================
  // GET LOGGED-IN USER
  // ======================================================

  const getLoggedInUser = () => {
    const storedStaffUser =
      sessionStorage.getItem(
        "staffUser"
      );

    if (!storedStaffUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedStaffUser
      );
    } catch (error) {
      console.error(
        "Invalid staffUser session data:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // LOGIN ID
  // ======================================================

  const getLoginId = () => {
    const staffUser =
      getLoggedInUser();

    const loginId = Number(
      staffUser?.loginId
    );

    if (
      !Number.isInteger(loginId) ||
      loginId <= 0
    ) {
      return null;
    }

    return loginId;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const text =
      String(value);

    if (
      text.includes("T")
    ) {
      return text.split(
        "T"
      )[0];
    }

    return text.slice(
      0,
      10
    );
  };

  // ======================================================
  // CREATE FULL PHOTO URL
  // ======================================================

  const buildPhotoUrl = (
    photoPath
  ) => {
    if (!photoPath) {
      return null;
    }

    const path =
      String(
        photoPath
      ).trim();

    if (!path) {
      return null;
    }

    if (
      path.startsWith(
        "http://"
      ) ||
      path.startsWith(
        "https://"
      )
    ) {
      return path;
    }

    if (
      path.startsWith("/")
    ) {
      return `${API_BASE}${path}`;
    }

    return `${API_BASE}/${path}`;
  };

  // ======================================================
  // LOAD LOGGED-IN OWNER PROFILE
  // ======================================================

  const loadOwnerProfile =
    async () => {
      try {
        setLoading(true);
        setError("");

        const loginId =
          getLoginId();

        if (!loginId) {
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
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load garage owner profile."
          );
        }

        const data =
          result.data || {};

        const owner =
          data.owner || {};

        const garage =
          data.garage || {};

        setOwnerData(
          data
        );

        // ==============================================
        // LOAD SAVED PROFILE PHOTO
        // ==============================================

        const savedPhotoUrl =
          buildPhotoUrl(
            owner.profilePhoto
          );

        setProfileImage(
          savedPhotoUrl
        );

        // ==============================================
        // LOAD PROFILE DETAILS
        // ==============================================

        const loadedProfile = {
          name:
            owner.fullName ||
            "",

          role:
            "Garage Owner",

          email:
            owner.email ||
            "",

          phone:
            owner.contactNumber ||
            "",

          garageName:
            garage.garageName ||
            "",

          location:
            [
              garage.address,
              garage.district,
            ]
              .filter(
                Boolean
              )
              .join(", "),

          joinedDate:
            formatDate(
              owner.joinedDate
            ),

          nic:
            owner.nic || "",

          garageCode:
            garage.garageCode ||
            "",

          district:
            garage.district ||
            "",
        };

        setProfile(
          loadedProfile
        );

        setTempProfile(
          loadedProfile
        );
      } catch (error) {
        console.error(
          "Owner profile load error:",
          error
        );

        setError(
          error.message ||
            "Unable to load owner profile."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadOwnerProfile();
  }, []);

  // ======================================================
  // OWNER INITIALS
  // ======================================================

  const ownerInitials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") ||
    "GO";

  // ======================================================
  // GARAGE VALUES
  // ======================================================

  const garageId =
    ownerData?.garage
      ?.garageId ||
    "-";

  const garageCapacity =
    Number(
      ownerData?.garage
        ?.capacity || 0
    );

  // ======================================================
  // STATS
  // ======================================================

  const stats = [
    {
      label:
        "Garage ID",

      value:
        garageId,

      icon:
        Building2,

      color:
        "text-cyan-400",
    },

    {
      label:
        "Garage Capacity",

      value:
        garageCapacity ||
        "0",

      icon:
        BriefcaseBusiness,

      color:
        "text-emerald-400",
    },

    {
      label:
        "Approval Level",

      value:
        "Owner",

      icon:
        ShieldCheck,

      color:
        "text-indigo-400",
    },
  ];

  // ======================================================
  // INFORMATION FIELDS
  // ======================================================

  const informationFields = [
    {
      icon:
        User,

      label:
        "Owner Name",

      value:
        profile.name,

      name:
        "name",
    },

    {
      icon:
        BriefcaseBusiness,

      label:
        "Role",

      value:
        profile.role,

      name:
        "role",
    },

    {
      icon:
        Mail,

      label:
        "Email Address",

      value:
        profile.email,

      name:
        "email",
    },

    {
      icon:
        Phone,

      label:
        "Phone Number",

      value:
        profile.phone,

      name:
        "phone",
    },

    {
      icon:
        Building2,

      label:
        "Garage Name",

      value:
        profile.garageName,

      name:
        "garageName",
    },

    {
      icon:
        MapPin,

      label:
        "Location",

      value:
        profile.location,

      name:
        "location",
    },

    {
      icon:
        CalendarDays,

      label:
        "Joined Date",

      value:
        profile.joinedDate,

      name:
        "joinedDate",
    },

    {
      icon:
        ShieldCheck,

      label:
        "NIC",

      value:
        profile.nic,

      name:
        "nic",
    },

    {
      icon:
        Building2,

      label:
        "Garage Code",

      value:
        profile.garageCode,

      name:
        "garageCode",
    },
  ];

  // ======================================================
  // SEARCH STATS
  // ======================================================

  const filteredStats =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return stats;
      }

      return stats.filter(
        (item) =>
          `${item.label} ${item.value}`
            .toLowerCase()
            .includes(query)
      );
    }, [
      searchText,
      garageId,
      garageCapacity,
    ]);

  // ======================================================
  // SEARCH INFORMATION
  // ======================================================

  const filteredInformationFields =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return informationFields;
      }

      return informationFields.filter(
        (field) =>
          `${field.label} ${field.value}`
            .toLowerCase()
            .includes(query)
      );
    }, [
      searchText,
      profile,
    ]);

  // ======================================================
  // EDIT PROFILE
  // ======================================================

  const handleEdit = () => {
    setTempProfile(
      profile
    );

    setEditMode(true);
  };

  // ======================================================
  // SAVE PROFILE
  //
  // NOTE:
  // Currently saves only frontend state.
  // DB profile update API can be added later.
  // ======================================================

  const handleSave = () => {
    setProfile(
      tempProfile
    );

    setEditMode(false);
  };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const handleCancel = () => {
    setTempProfile(
      profile
    );

    setEditMode(false);
  };

  // ======================================================
  // UPDATE TEMP PROFILE FIELD
  // ======================================================

  const updateField = (
    name,
    value
  ) => {
    setTempProfile(
      (
        previousProfile
      ) => ({
        ...previousProfile,
        [name]: value,
      })
    );
  };

  // ======================================================
  // PROFILE PHOTO UPLOAD
  // ======================================================

  const handleImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setPhotoError("");
      setPhotoSuccess("");

      // ================================================
      // CLIENT VALIDATION
      // ================================================

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
        setPhotoError(
          "Please select a JPG, JPEG, PNG, or WEBP image."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setPhotoError(
          "Profile photo must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      const loginId =
        getLoginId();

      if (!loginId) {
        setPhotoError(
          "Unable to identify the logged-in garage owner."
        );

        event.target.value =
          "";

        return;
      }

      try {
        setUploadingPhoto(
          true
        );

        // ==============================================
        // FORM DATA
        // Field name must match:
        // upload.single("profilePhoto")
        // ==============================================

        const formData =
          new FormData();

        formData.append(
          "profilePhoto",
          file
        );

        // ==============================================
        // UPLOAD TO BACKEND
        // ==============================================

        const response =
          await fetch(
            `${API_BASE}/api/owners/profile/${loginId}/photo`,
            {
              method: "PUT",

              body:
                formData,
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
              "Unable to upload profile photo."
          );
        }

        // ==============================================
        // USE SERVER-SAVED IMAGE
        // ==============================================

        const savedPhotoPath =
          result.profilePhoto ||
          result.data
            ?.profilePhoto;

        const savedPhotoUrl =
          buildPhotoUrl(
            savedPhotoPath
          );

        setProfileImage(
          savedPhotoUrl
        );

        // ==============================================
        // UPDATE LOCAL OWNER DATA
        // ==============================================

        setOwnerData(
          (previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,

              owner: {
                ...previous.owner,

                profilePhoto:
                  savedPhotoPath,
              },
            };
          }
        );

        setPhotoSuccess(
          "Profile photo updated successfully."
        );

        // ==============================================
        // AUTO CLEAR SUCCESS MESSAGE
        // ==============================================

        setTimeout(() => {
          setPhotoSuccess(
            ""
          );
        }, 3000);
      } catch (error) {
        console.error(
          "Profile photo upload error:",
          error
        );

        setPhotoError(
          error.message ||
            "Unable to upload profile photo."
        );
      } finally {
        setUploadingPhoto(
          false
        );

        // Allows selecting same file again
        event.target.value =
          "";
      }
    };

  // ======================================================
  // RENDER INFORMATION FIELD
  // ======================================================

  const renderField = (
    Icon,
    label,
    value,
    name
  ) => {
    const editableFields = [
      "name",
      "email",
      "phone",
      "garageName",
      "location",
    ];

    const canEdit =
      editMode &&
      editableFields.includes(
        name
      );

    return (
      <div
        key={name}
        className="rounded-xl border border-white/10 bg-[#191923] p-5"
      >
        <div className="mb-3 flex items-center gap-3">

          <Icon
            size={16}
            className="text-cyan-400"
          />

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
            {label}
          </p>

        </div>

        {canEdit ? (
          <input
            type="text"
            value={
              tempProfile[
                name
              ] || ""
            }
            onChange={(
              event
            ) =>
              updateField(
                name,
                event.target
                  .value
              )
            }
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
          />
        ) : (
          <p className="text-sm font-medium text-gray-200 md:text-base">
            {value || "-"}
          </p>
        )}
      </div>
    );
  };

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b13] text-white">

        <div className="text-center">

          <RefreshCw
            size={30}
            className="mx-auto mb-4 animate-spin text-cyan-400"
          />

          <p className="text-sm text-gray-400">
            Loading garage owner profile...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] font-sans text-white">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <header className="flex min-h-16 flex-col gap-4 border-b border-white/10 bg-[#191922] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">

        {/* LEFT */}

        <div className="flex w-full items-center gap-3 md:w-auto">

          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
          >
            <Menu
              size={20}
            />
          </button>

          {/* SEARCH */}

          <div className="flex h-10 w-full items-center gap-3 rounded-xl border border-white/20 bg-[#0b0b12] px-4 md:w-80">

            <Search
              size={15}
              className="shrink-0 text-gray-500"
            />

            <input
              type="search"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              placeholder="Search owner profile..."
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
                className="text-[10px] font-bold text-gray-500 transition hover:text-white"
              >
                CLEAR
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            DYNAMIC HEADER
        ================================================== */}

        <div className="flex items-center justify-between gap-5 md:justify-end">

          <button
            type="button"
            className="text-gray-300 transition hover:text-white"
          >
            <Bell
              size={18}
            />
          </button>

          <div className="h-8 w-px bg-white/10" />

          <div>

            <p className="text-xs font-bold tracking-widest">
              {profile.name ||
                "Garage Owner"}
            </p>

            <p className="text-[10px] uppercase text-indigo-400">
              {profile.garageName ||
                "Garage"}
            </p>

          </div>

          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-indigo-400 text-xs">

            {profileImage ? (
              <img
                src={
                  profileImage
                }
                alt="Profile"
                className="h-full w-full object-cover"
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

        {/* ==================================================
            GENERAL ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <AlertCircle
              size={17}
            />

            {error}

          </div>
        )}

        {/* ==================================================
            PHOTO ERROR
        ================================================== */}

        {photoError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <AlertCircle
              size={17}
            />

            {photoError}

          </div>
        )}

        {/* ==================================================
            PHOTO SUCCESS
        ================================================== */}

        {photoSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">

            <CheckCircle
              size={17}
            />

            {photoSuccess}

          </div>
        )}

        {/* ==================================================
            PAGE TITLE
        ================================================== */}

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
                onClick={
                  handleEdit
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-5 py-3 text-xs font-bold tracking-widest text-cyan-400 transition hover:bg-cyan-500/25"
              >
                <Edit3
                  size={15}
                />

                EDIT PROFILE
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-xs font-bold tracking-widest text-emerald-400 transition hover:bg-emerald-500/30"
                >
                  <Save
                    size={15}
                  />

                  SAVE
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-xs font-bold tracking-widest text-red-300 transition hover:bg-red-500/25"
                >
                  <X
                    size={15}
                  />

                  CANCEL
                </button>
              </>
            )}

          </div>

        </div>

        {/* ==================================================
            MAIN PROFILE CARD
        ================================================== */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-[#191923] p-6 md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* PROFILE PHOTO */}

            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-500/10">

              {profileImage ? (
                <img
                  src={
                    profileImage
                  }
                  alt="Owner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User
                  size={46}
                  className="text-cyan-400"
                />
              )}

              {/* UPLOAD BUTTON */}

              <button
                type="button"
                disabled={
                  uploadingPhoto
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                title="Upload profile photo"
              >

                {uploadingPhoto ? (
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Camera
                    size={15}
                  />
                )}

              </button>

              {/* FILE INPUT */}

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={
                  handleImageUpload
                }
                className="hidden"
              />

            </div>

            {/* PROFILE DETAILS */}

            <div className="flex-1">

              <div className="mb-3 flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-black md:text-3xl">
                  {profile.name ||
                    "Garage Owner"}
                </h2>

                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-400">

                  <BadgeCheck
                    size={13}
                  />

                  VERIFIED OWNER

                </span>

              </div>

              <p className="text-gray-400">

                {profile.role} of{" "}

                {profile.garageName ||
                  "Garage"}

              </p>

              <div className="mt-4">

                <button
                  type="button"
                  disabled={
                    uploadingPhoto
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold tracking-widest text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
                >

                  {uploadingPhoto ? (
                    <>
                      <RefreshCw
                        size={13}
                        className="animate-spin"
                      />

                      UPLOADING...
                    </>
                  ) : (
                    <>
                      <Upload
                        size={13}
                      />

                      CHANGE PHOTO
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        {filteredStats.length >
          0 && (

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            {filteredStats.map(
              (
                item,
                index
              ) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      index
                    }
                    className="rounded-xl border border-white/10 bg-[#1c1c25] p-6"
                  >

                    <div className="mb-6 flex justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                        {item.label}
                      </p>

                      <Icon
                        size={16}
                        className={
                          item.color
                        }
                      />

                    </div>

                    <h3
                      className={`font-mono text-3xl font-black ${item.color}`}
                    >
                      {item.value}
                    </h3>

                  </div>
                );
              }
            )}

          </div>

        )}

        {/* ==================================================
            OWNER INFORMATION
        ================================================== */}

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 md:p-6">

          <h2 className="mb-5 text-lg font-bold">
            Owner & Garage Information
          </h2>

          {filteredInformationFields.length >
          0 ? (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {filteredInformationFields.map(
                (field) =>
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