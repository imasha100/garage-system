import React, { useEffect, useState } from "react";
import {
  Menu,
  UserPlus,
  Save,
  ArrowLeft,
  LoaderCircle,
  Users,
  Search,
  RefreshCw,
  Eye,
  X,
  Pencil,
  Check,
  Mail,
  Phone,
  CreditCard,
  BadgeCheck,
  AlertCircle,
  Copy,
  Bell,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function AssistRegistration({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // LOGGED-IN GARAGE OWNER PROFILE
  // ======================================================

  const [ownerData, setOwnerData] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [ownerError, setOwnerError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile = async () => {
      try {
        setOwnerLoading(true);
        setOwnerError("");

        const storedStaffUser =
          sessionStorage.getItem("staffUser");

        if (!storedStaffUser) {
          throw new Error(
            "Logged-in garage owner details were not found."
          );
        }

        const staffUser =
          JSON.parse(storedStaffUser);

        const loginId = Number(
          staffUser?.loginId ??
            staffUser?.login_id
        );

        if (
          !Number.isInteger(loginId) ||
          loginId <= 0
        ) {
          throw new Error(
            "A valid garage owner login ID was not found."
          );
        }

        const response = await fetch(
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

        if (isMounted) {
          setOwnerData(
            result.data || null
          );
        }
      } catch (error) {
        console.error(
          "Assistance Registration owner loading error:",
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
          setOwnerLoading(false);
        }
      }
    };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const ownerName =
    ownerData?.owner?.fullName ??
    ownerData?.owner?.full_name ??
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage?.garageName ??
    ownerData?.garage?.garage_name ??
    (ownerLoading
      ? "Loading Garage..."
      : "Garage");

  const ownerGarageId = Number(
    ownerData?.garage?.garageId ??
      ownerData?.garage?.garage_id
  );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "GO";

  const profilePhotoPath =
    ownerData?.owner?.profilePhoto ??
    ownerData?.owner?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(
          profilePhotoPath
        ).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  const getLoggedInGarageId = () => {
    try {
      if (
        Number.isInteger(ownerGarageId) &&
        ownerGarageId > 0
      ) {
        return ownerGarageId;
      }

      const storedStaffUser =
        sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      const staffUser =
        JSON.parse(storedStaffUser);

      const garageId = Number(
        staffUser?.garageId ??
          staffUser?.garage_id ??
          staffUser?.garageGarageId ??
          staffUser?.garage_garage_id
      );

      return Number.isInteger(garageId) &&
        garageId > 0
        ? garageId
        : null;
    } catch (error) {
      console.error(
        "Unable to read logged-in garage details:",
        error
      );

      return null;
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    email: "",
    contactNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showRegistrations, setShowRegistrations] = useState(false);
  const [assistances, setAssistances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAssistances, setIsLoadingAssistances] =
    useState(false);
  const [listError, setListError] = useState("");

  const [selectedAssistance, setSelectedAssistance] =
    useState(null);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [successModal, setSuccessModal] = useState({
    open: false,
    type: "register",
    title: "",
    message: "",
    assistanceId: "",
    username: "",
    password: "",
  });
  const [copied, setCopied] = useState(false);

  const closeSuccessModal = () => {
    setSuccessModal((previous) => ({ ...previous, open: false }));
    setCopied(false);
  };

  const handleCopyCredentials = async () => {
    const credentialsText =
      `Username: ${successModal.username}\n` +
      `Temporary Password: ${successModal.password}`;

    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy credentials:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const garageId = getLoggedInGarageId();

    if (!garageId) {
      setMessage({
        type: "error",
        text:
          "The logged-in garage could not be identified. Please sign in again using a Garage Owner account.",
      });

      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${API_BASE}/api/assistances`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            nic: formData.nic.trim().toUpperCase(),
            email: formData.email.trim().toLowerCase(),
            contactNumber: formData.contactNumber.trim(),
            garageId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to register assistance officer."
        );
      }

      const formattedAssistanceId =
        data.assistance?.formattedAssistanceId || "";
      const username =
        data.loginDetails?.username || formattedAssistanceId;
      const temporaryPassword =
        data.loginDetails?.temporaryPassword || "";

      setMessage({
        type: "success",
        text: "Assistance officer registered successfully.",
      });

      setSuccessModal({
        open: true,
        type: "register",
        title: "Registration Successful",
        message:
          "The assistance officer has been registered and login credentials have been created successfully.",
        assistanceId: formattedAssistanceId,
        username,
        password: temporaryPassword,
      });

      setFormData({
        fullName: "",
        nic: "",
        email: "",
        contactNumber: "",
      });

      if (showRegistrations) {
        fetchAssistances();
      }
    } catch (error) {
      console.error("Assistance registration error:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to register assistance officer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeAssistance = (item) => {
    const assistanceId =
      item.assistanceId ?? item.assistance_id ?? item.id;

    return {
      assistanceId,
      formattedAssistanceId:
        item.formattedAssistanceId ||
        `ASSIST-${String(assistanceId).padStart(4, "0")}`,
      fullName: item.fullName ?? item.full_name ?? "",
      email: item.email ?? "",
      contactNumber:
        item.contactNumber ?? item.contact_number ?? "",
      nic: item.nic ?? item.NIC ?? "",
      shiftStatus:
        item.shiftStatus ?? item.shift_status ?? "OFF",
    };
  };

  const fetchAssistances = async () => {
    setIsLoadingAssistances(true);
    setListError("");

    try {
      const garageId = getLoggedInGarageId();

      if (!garageId) {
        throw new Error(
          "The logged-in garage could not be identified. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/assistances?garageId=${garageId}`
      );
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to load assistance officers."
        );
      }

      const receivedAssistances = Array.isArray(data)
        ? data
        : data.assistances || data.data || data.results || [];

      setAssistances(
        receivedAssistances.map(normalizeAssistance)
      );
    } catch (error) {
      console.error("Fetch assistance officers error:", error);
      setListError(
        error.message || "Unable to load assistance officers."
      );
      setAssistances([]);
    } finally {
      setIsLoadingAssistances(false);
    }
  };

  const handleViewRegistrations = () => {
    setShowRegistrations(true);
    setSearchQuery("");
    setSelectedAssistance(null);
    setEditData(null);
    setIsEditing(false);
    fetchAssistances();
  };

  const handleBackToRegistration = () => {
    setShowRegistrations(false);
    setSelectedAssistance(null);
    setEditData(null);
    setIsEditing(false);
    setSearchQuery("");
  };

  const handleOpenDetails = async (assistance) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/assistances/${assistance.assistanceId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load assistance details."
        );
      }

      const normalized = normalizeAssistance(data.assistance);
      setSelectedAssistance(normalized);
      setEditData({ ...normalized });
      setIsEditing(false);
    } catch (error) {
      alert(
        error.message || "Unable to load assistance details."
      );
    }
  };

  const handleCloseDetails = () => {
    setSelectedAssistance(null);
    setEditData(null);
    setIsEditing(false);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditData({ ...selectedAssistance });
    setIsEditing(false);
  };

  const handleUpdateAssistance = async () => {
    if (!editData.fullName.trim()) {
      alert("Full name is required.");
      return;
    }

    if (!editData.nic.trim()) {
      alert("NIC is required.");
      return;
    }

    if (!editData.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!editData.contactNumber.trim()) {
      alert("Contact number is required.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/assistances/${editData.assistanceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: editData.fullName.trim(),
            nic: editData.nic.trim().toUpperCase(),
            email: editData.email.trim().toLowerCase(),
            contactNumber: editData.contactNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to update assistance details."
        );
      }

      const updatedAssistance = {
        ...editData,
        fullName: editData.fullName.trim(),
        nic: editData.nic.trim().toUpperCase(),
        email: editData.email.trim().toLowerCase(),
        contactNumber: editData.contactNumber.trim(),
      };

      setAssistances((previousAssistances) =>
        previousAssistances.map((item) =>
          item.assistanceId === updatedAssistance.assistanceId
            ? updatedAssistance
            : item
        )
      );

      setSelectedAssistance(updatedAssistance);
      setEditData(updatedAssistance);
      setIsEditing(false);

      setSuccessModal({
        open: true,
        type: "update",
        title: "Update Successful",
        message:
          "The assistance officer details have been updated and saved successfully.",
        assistanceId: updatedAssistance.formattedAssistanceId,
        username: "",
        password: "",
      });
    } catch (error) {
      console.error("Update assistance officer error:", error);
      alert(
        error.message || "Unable to update assistance details."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAssistances = assistances.filter((item) => {
    const searchText = searchQuery.trim().toLowerCase();

    if (!searchText) return true;

    return (
      item.fullName.toLowerCase().includes(searchText) ||
      item.nic.toLowerCase().includes(searchText) ||
      item.formattedAssistanceId
        .toLowerCase()
        .includes(searchText)
    );
  });

  if (showRegistrations) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white">
        <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-lg font-black tracking-widest md:text-xl">
                REGISTERED ASSISTANCE OFFICERS
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                View and manage assistance records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleBackToRegistration}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-gray-300 transition hover:border-blue-500/40 hover:text-blue-400"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">
                Back to Registration
              </span>
            </button>

            <Bell
              size={18}
              className="text-gray-300"
            />

            <div className="h-8 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-xs font-bold tracking-widest">
                {ownerName}
              </p>

              <p className="max-w-[240px] truncate text-[10px] uppercase text-indigo-400">
                {garageName}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
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
        </header>

        <main className="p-4 md:p-8">
          {ownerError && (
            <div className="mx-auto mb-6 max-w-6xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {ownerError}
            </div>
          )}

          <div className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#15151f] p-5 md:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <Users size={26} className="text-blue-400" />
                    <h2 className="text-xl font-black md:text-2xl">
                      Assistance Registrations
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500">
                    Total registered officers:{" "}
                    <span className="font-bold text-blue-400">
                      {assistances.length}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchAssistances}
                  disabled={isLoadingAssistances}
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      isLoadingAssistances ? "animate-spin" : ""
                    }
                  />
                  Refresh List
                </button>
              </div>

              <div className="relative mt-6">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search by name or NIC..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>
            </div>

            {listError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                <AlertCircle size={20} />
                <div>
                  <p className="font-bold">
                    Unable to load officers
                  </p>
                  <p className="mt-1 text-sm">{listError}</p>
                </div>
              </div>
            )}

            {isLoadingAssistances ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f]">
                <div className="text-center">
                  <RefreshCw
                    size={34}
                    className="mx-auto animate-spin text-blue-400"
                  />
                  <p className="mt-4 text-gray-400">
                    Loading assistance officers...
                  </p>
                </div>
              </div>
            ) : filteredAssistances.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f] p-8 text-center">
                <div>
                  <Users
                    size={48}
                    className="mx-auto text-gray-700"
                  />
                  <h3 className="mt-4 text-xl font-bold">
                    No Assistance Officers Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "No registered officer matches your search."
                      : "No assistance officers have been registered yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAssistances.map((item) => (
                  <div
                    key={item.assistanceId}
                    className="rounded-2xl border border-white/10 bg-[#15151f] p-5 transition hover:-translate-y-1 hover:border-blue-500/40"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
                          <UserPlus
                            size={24}
                            className="text-blue-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-black">
                            {item.fullName || "Unnamed Officer"}
                          </h3>
                        </div>
                      </div>

                      <BadgeCheck
                        size={20}
                        className="text-emerald-400"
                      />
                    </div>

                    <div className="mb-5 rounded-xl border border-white/5 bg-black/20 p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard
                          size={17}
                          className="text-gray-500"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                            NIC Number
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-300">
                            {item.nic || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetails(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedAssistance && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#15151f] p-5 md:p-6">
                <div>
                  <h2 className="text-xl font-black md:text-2xl">
                    Assistance Officer Details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ["fullName", "Full Name", UserPlus, "text"],
                    ["nic", "NIC", CreditCard, "text"],
                    ["email", "Email", Mail, "email"],
                    ["contactNumber", "Contact Number", Phone, "text"],
                  ].map(([name, label, Icon, type]) => (
                    <div key={name}>
                      <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                        <Icon size={16} />
                        {label}
                      </label>
                      <input
                        type={type}
                        name={name}
                        value={editData[name]}
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        className={`w-full rounded-xl border p-3 outline-none ${
                          isEditing
                            ? "border-white/10 bg-black/40 focus:border-blue-500"
                            : "cursor-default border-white/5 bg-black/20 text-gray-300"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCloseDetails}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300"
                      >
                        <X size={18} />
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold hover:bg-blue-500"
                      >
                        <Pencil size={18} />
                        Edit Details
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300 disabled:opacity-50"
                      >
                        <X size={18} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleUpdateAssistance}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw
                              size={18}
                              className="animate-spin"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {successModal.open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeSuccessModal();
              }
            }}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#11131b] shadow-2xl shadow-emerald-500/10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />

              <button
                type="button"
                onClick={closeSuccessModal}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close popup"
              >
                <X size={19} />
              </button>

              <div className="px-6 pb-6 pt-9 text-center sm:px-8 sm:pb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black">
                    <Check size={32} strokeWidth={3} />
                  </div>
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
                  Success
                </p>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {successModal.title}
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
                  {successModal.message}
                </p>

                {successModal.type === "register" ? (
                  <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-left">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Username
                      </span>
                      <span className="break-all text-right text-sm font-black text-white">
                        {successModal.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Temporary Password
                      </span>
                      <span className="break-all text-right text-sm font-black text-emerald-400">
                        {successModal.password}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-sm font-bold text-emerald-300">
                      The updated details have been saved successfully.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {successModal.type === "register" && (
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-400 transition hover:bg-blue-500/20"
                    >
                      {copied ? (
                        <>
                          <Check size={18} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Copy Credentials
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeSuccessModal}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-black transition hover:bg-emerald-400"
                  >
                    <Check size={18} />
                    Done
                  </button>
                </div>

                {successModal.type === "register" && (
                  <p className="mt-4 text-xs leading-5 text-amber-300/80">
                    Please save these login credentials securely before closing
                    this popup.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white">
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg font-black tracking-widest md:text-xl">
              ASSISTANCE REGISTRATION
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Register assistance officers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Bell
            size={18}
            className="text-gray-300"
          />

          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-[240px] truncate text-[10px] uppercase text-indigo-400">
              {garageName}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
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
      </header>

      <main className="p-4 md:p-8">
        {ownerError && (
          <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        <button
          type="button"
          onClick={() => onNavigate("Registration")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Registration
        </button>

        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-blue-400">
            ASSISTANCE OFFICER
          </p>
          <h2 className="mb-2 text-2xl font-black md:text-3xl">
            Register Assistance Officer
          </h2>
          <p className="text-gray-400">
            Add a new assistance officer or dispatch operator to
            the system.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#15151f] p-5 md:p-8"
        >
          {message.text && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["fullName", "FULL NAME", "text", "Enter full name"],
              ["nic", "NIC NUMBER", "text", "200012345678"],
              [
                "contactNumber",
                "CONTACT NUMBER",
                "tel",
                "0771234567",
              ],
              ["email", "EMAIL", "email", "officer@example.com"],
            ].map(([name, label, type, placeholder]) => (
              <div key={name}>
                <label className="mb-2 block text-xs font-bold text-gray-400">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-7 py-3 font-black text-black hover:bg-blue-400 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  REGISTERING...
                </>
              ) : (
                <>
                  <Save size={18} />
                  REGISTER ASSISTANCE
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleViewRegistrations}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-7 py-3 font-bold text-blue-400 hover:bg-blue-500/20 disabled:opacity-60"
            >
              <Users size={18} />
              VIEW REGISTRATIONS
              <Eye size={17} />
            </button>
          </div>
        </form>
      </main>

        {successModal.open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeSuccessModal();
              }
            }}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#11131b] shadow-2xl shadow-emerald-500/10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />

              <button
                type="button"
                onClick={closeSuccessModal}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close popup"
              >
                <X size={19} />
              </button>

              <div className="px-6 pb-6 pt-9 text-center sm:px-8 sm:pb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black">
                    <Check size={32} strokeWidth={3} />
                  </div>
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
                  Success
                </p>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {successModal.title}
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
                  {successModal.message}
                </p>

                {successModal.type === "register" ? (
                  <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-left">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Username
                      </span>
                      <span className="break-all text-right text-sm font-black text-white">
                        {successModal.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Temporary Password
                      </span>
                      <span className="break-all text-right text-sm font-black text-emerald-400">
                        {successModal.password}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-sm font-bold text-emerald-300">
                      The updated details have been saved successfully.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {successModal.type === "register" && (
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-400 transition hover:bg-blue-500/20"
                    >
                      {copied ? (
                        <>
                          <Check size={18} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Copy Credentials
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeSuccessModal}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-black transition hover:bg-emerald-400"
                  >
                    <Check size={18} />
                    Done
                  </button>
                </div>

                {successModal.type === "register" && (
                  <p className="mt-4 text-xs leading-5 text-amber-300/80">
                    Please save these login credentials securely before closing
                    this popup.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}