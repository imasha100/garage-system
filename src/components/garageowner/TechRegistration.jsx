import React, { useEffect, useState } from "react";
import {
  Menu,
  Save,
  UserCog,
  Users,
  Eye,
  Search,
  ArrowLeft,
  X,
  Pencil,
  Check,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  BadgeCheck,
  RefreshCw,
  AlertCircle,
  Copy,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function TechRegistration({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // OWNER PROFILE
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
          "Technician Registration owner loading error:",
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

  const specializationOptions = [
    "Engine Repair",
    "Electrical Systems",
    "EV Diagnostics",
    "Transmission",
    "Tire & Brake",
  ];

  const getLoggedInGarageId = () => {
    try {
      const storedStaffUser = sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        return null;
      }

      const staffUser = JSON.parse(storedStaffUser);
      const garageId = Number(staffUser?.garageId);

      return Number.isInteger(garageId) && garageId > 0
        ? garageId
        : null;
    } catch (error) {
      console.error("Unable to read logged-in garage details:", error);
      return null;
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    nic: "",
    specialization: [],
    experience: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration list states
  const [showRegistrations, setShowRegistrations] =
    useState(false);

  const [technicians, setTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingTechnicians, setIsLoadingTechnicians] =
    useState(false);
  const [listError, setListError] = useState("");

  // Technician details modal states
  const [selectedTechnician, setSelectedTechnician] =
    useState(null);

  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    technicianId: "",
    username: "",
    password: "",
    showCredentials: false,
  });

  const [copied, setCopied] = useState(false);

  const closePopup = () => {
    setPopup((previous) => ({ ...previous, open: false }));
    setCopied(false);
  };

  const showPopup = ({
    type = "success",
    title,
    message,
    technicianId = "",
    username = "",
    password = "",
    showCredentials = false,
  }) => {
    setPopup({
      open: true,
      type,
      title,
      message,
      technicianId,
      username,
      password,
      showCredentials,
    });
    setCopied(false);
  };

  const handleCopyCredentials = async () => {
    const credentials = [
      popup.technicianId
        ? `System ID: ${popup.technicianId}`
        : null,
      `Username: ${popup.username}`,
      `Temporary Password: ${popup.password}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(credentials);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy credentials:", error);
      showPopup({
        type: "error",
        title: "Copy Failed",
        message: "Unable to copy the login credentials.",
      });
    }
  };

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "fullName") {
      value = value.replace(/[^A-Za-z\s.'-]/g, "").slice(0, 80);
    }

    if (name === "contactNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "nic") {
      const cleanedValue = value.toUpperCase().replace(/[^0-9VX]/g, "");
      const nicSuffix = cleanedValue.match(/[VX]/)?.[0];

      if (nicSuffix) {
        const digits = cleanedValue.replace(/[VX]/g, "").slice(0, 9);
        value = `${digits}${nicSuffix}`;
      } else {
        value = cleanedValue.replace(/\D/g, "").slice(0, 12);
      }
    }

    if (name === "experience") {
      value = value.replace(/\D/g, "").slice(0, 2);
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSpecializationChange = (value) => {
    setFormData((previousData) => {
      const alreadySelected =
        previousData.specialization.includes(value);

      return {
        ...previousData,
        specialization: alreadySelected
          ? previousData.specialization.filter(
              (item) => item !== value
            )
          : [...previousData.specialization, value],
      };
    });
  };

  const validateFullName = (fullName) =>
    /^[A-Za-z][A-Za-z\s.'-]{1,79}$/.test(fullName.trim());

  const validateEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email.trim()
    );

  const validateContactNumber = (contactNumber) =>
    /^0\d{9}$/.test(contactNumber.trim());

  const validateNic = (nic) =>
    /^\d{9}[VX]$/.test(nic.trim().toUpperCase()) ||
    /^\d{12}$/.test(nic.trim());

  const validateExperience = (experience) => {
    const numericExperience = Number(experience);

    return (
      Number.isInteger(numericExperience) &&
      numericExperience >= 0 &&
      numericExperience <= 60
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const garageId = getLoggedInGarageId();

    if (!garageId) {
      showPopup({
        type: "error",
        title: "Garage Account Required",
        message:
          "The logged-in garage could not be identified. Please sign in again using a Garage Owner account.",
      });
      return;
    }

    if (!validateFullName(formData.fullName)) {
      showPopup({
        type: "error",
        title: "Invalid Full Name",
        message:
          "Enter a valid full name using letters, spaces, apostrophes, hyphens or full stops only.",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      showPopup({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!validateContactNumber(formData.contactNumber)) {
      showPopup({
        type: "error",
        title: "Invalid Contact Number",
        message:
          "Contact number must contain exactly 10 digits and start with 0.",
      });
      return;
    }

    if (!validateNic(formData.nic)) {
      showPopup({
        type: "error",
        title: "Invalid NIC",
        message:
          "Enter 9 digits followed by V/X, or enter a 12-digit NIC number.",
      });
      return;
    }

    if (!validateExperience(formData.experience)) {
      showPopup({
        type: "error",
        title: "Invalid Experience",
        message:
          "Experience must be a whole number between 0 and 60 years.",
      });
      return;
    }

    if (formData.specialization.length === 0) {
      showPopup({
        type: "error",
        title: "Specialization Required",
        message: "Please select at least one specialization.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/technicians",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            contactNumber: formData.contactNumber,
            nic: formData.nic,
            specialization: formData.specialization,
            experience: formData.experience,
            garageId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showPopup({
          type: "error",
          title: "Registration Failed",
          message:
            data.message || "Technician registration failed.",
        });
        return;
      }

      showPopup({
        type: "success",
        title: "Registration Successful",
        message:
          "The technician has been registered and login credentials have been created successfully.",
        username: data.loginDetails?.username || "",
        password: data.loginDetails?.temporaryPassword || "",
        showCredentials: true,
      });

      setFormData({
        fullName: "",
        email: "",
        contactNumber: "",
        nic: "",
        specialization: [],
        experience: "",
      });
      if (showRegistrations) {
        fetchTechnicians();
      }
    } catch (error) {
      console.error("Technician registration error:", error);

      showPopup({
        type: "error",
        title: "Connection Error",
        message:
          "Unable to connect to the backend. Please make sure the backend server is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeSpecialization = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
          return parsedValue;
        }
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const normalizeTechnician = (technician) => {
    const numericId =
      technician.technicianId ??
      technician.technician_id ??
      technician.id;

    const displayId =
      numericId === null ||
      numericId === undefined ||
      numericId === ""
        ? "N/A"
        : String(numericId);

    return {
      technicianId: numericId,
      displayId,
      fullName:
        technician.fullName ??
        technician.full_name ??
        "",
      email: technician.email ?? "",
      contactNumber:
        technician.contactNumber ??
        technician.contact_number ??
        "",
      nic: technician.nic ?? technician.NIC ?? "",
      specialization: normalizeSpecialization(
        technician.specialization
      ),
      experience:
        technician.experience ??
        technician.experience_years ??
        "",
    };
  };

  const fetchTechnicians = async () => {
    setIsLoadingTechnicians(true);
    setListError("");

    try {
      const garageId = getLoggedInGarageId();

      if (!garageId) {
        throw new Error(
          "The logged-in garage could not be identified. Please sign in again."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/technicians?garageId=${garageId}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to load registered technicians."
        );
      }

      const receivedTechnicians = Array.isArray(data)
        ? data
        : data.technicians ||
          data.data ||
          data.results ||
          [];

      setTechnicians(
        receivedTechnicians.map(normalizeTechnician)
      );
    } catch (error) {
      console.error(
        "Fetch registered technicians error:",
        error
      );

      setListError(
        error.message ||
          "Unable to load registered technicians."
      );

      setTechnicians([]);
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  const handleViewRegistrations = () => {
    setShowRegistrations(true);
    setSearchQuery("");
    setSelectedTechnician(null);
    setIsEditing(false);
    fetchTechnicians();
  };

  const handleBackToRegistration = () => {
    setShowRegistrations(false);
    setSelectedTechnician(null);
    setEditData(null);
    setIsEditing(false);
    setSearchQuery("");
  };

  const handleOpenDetails = (technician) => {
    setSelectedTechnician(technician);

    setEditData({
      ...technician,
      specialization: [...technician.specialization],
    });

    setIsEditing(false);
  };

  const handleCloseDetails = () => {
    setSelectedTechnician(null);
    setEditData(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "fullName") {
      value = value.replace(/[^A-Za-z\s.'-]/g, "").slice(0, 80);
    }

    if (name === "contactNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "nic") {
      const cleanedValue = value.toUpperCase().replace(/[^0-9VX]/g, "");
      const nicSuffix = cleanedValue.match(/[VX]/)?.[0];

      if (nicSuffix) {
        const digits = cleanedValue.replace(/[VX]/g, "").slice(0, 9);
        value = `${digits}${nicSuffix}`;
      } else {
        value = cleanedValue.replace(/\D/g, "").slice(0, 12);
      }
    }

    if (name === "experience") {
      value = value.replace(/\D/g, "").slice(0, 2);
    }

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleEditSpecializationChange = (value) => {
    setEditData((previousData) => {
      const currentSpecializations =
        previousData.specialization || [];

      const alreadySelected =
        currentSpecializations.includes(value);

      return {
        ...previousData,
        specialization: alreadySelected
          ? currentSpecializations.filter(
              (item) => item !== value
            )
          : [...currentSpecializations, value],
      };
    });
  };

  const handleCancelEdit = () => {
    setEditData({
      ...selectedTechnician,
      specialization: [
        ...selectedTechnician.specialization,
      ],
    });

    setIsEditing(false);
  };

  const handleUpdateTechnician = async () => {
    if (!validateFullName(editData.fullName)) {
      showPopup({
        type: "error",
        title: "Invalid Full Name",
        message:
          "Enter a valid full name using letters, spaces, apostrophes, hyphens or full stops only.",
      });
      return;
    }

    if (!validateNic(editData.nic)) {
      showPopup({
        type: "error",
        title: "Invalid NIC",
        message:
          "Enter 9 digits followed by V/X, or enter a 12-digit NIC number.",
      });
      return;
    }

    if (!validateEmail(editData.email)) {
      showPopup({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!validateContactNumber(editData.contactNumber)) {
      showPopup({
        type: "error",
        title: "Invalid Contact Number",
        message:
          "Contact number must contain exactly 10 digits and start with 0.",
      });
      return;
    }

    if (!validateExperience(editData.experience)) {
      showPopup({
        type: "error",
        title: "Invalid Experience",
        message:
          "Experience must be a whole number between 0 and 60 years.",
      });
      return;
    }

    if (editData.specialization.length === 0) {
      showPopup({
        type: "error",
        title: "Specialization Required",
        message: "Please select at least one specialization.",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/technicians/${editData.technicianId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: editData.fullName.trim(),
            email: editData.email.trim(),
            contactNumber:
              editData.contactNumber.trim(),
            nic: editData.nic.trim(),
            specialization: editData.specialization,
            experience: editData.experience,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to update technician details."
        );
      }

      const updatedTechnician = {
        ...editData,
        fullName: editData.fullName.trim(),
        email: editData.email.trim(),
        contactNumber:
          editData.contactNumber.trim(),
        nic: editData.nic.trim(),
      };

      setTechnicians((previousTechnicians) =>
        previousTechnicians.map((technician) =>
          technician.technicianId ===
          updatedTechnician.technicianId
            ? updatedTechnician
            : technician
        )
      );

      setSelectedTechnician(updatedTechnician);
      setEditData(updatedTechnician);
      setIsEditing(false);

      showPopup({
        type: "success",
        title: "Update Successful",
        message:
          "The technician details have been updated and saved successfully.",
        technicianId: updatedTechnician.displayId,
      });
    } catch (error) {
      console.error("Update technician error:", error);

      showPopup({
        type: "error",
        title: "Update Failed",
        message:
          error.message ||
          "Unable to update technician details.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTechnicians = technicians.filter(
    (technician) => {
      const searchText = searchQuery
        .trim()
        .toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        technician.fullName
          .toLowerCase()
          .includes(searchText) ||
        technician.nic
          .toLowerCase()
          .includes(searchText) ||
        String(technician.displayId)
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  if (showRegistrations) {
    return (
      <div className="min-h-screen bg-[#07080f] font-sans text-white">
        <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-lg font-black tracking-widest md:text-xl">
                REGISTERED TECHNICIANS
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                View and manage technician records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleBackToRegistration}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-gray-300 transition hover:border-emerald-500/40 hover:text-emerald-400 md:px-4"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">
                Back to Registration
              </span>
            </button>

            <div className="h-8 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-xs font-bold tracking-widest">
                {ownerName}
              </p>

              <p className="text-[10px] text-indigo-400 uppercase max-w-[240px] truncate">
                {garageName}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl border border-indigo-400 flex items-center justify-center overflow-hidden bg-[#0b0b12] text-xs">
              {ownerProfilePhoto ? (
                <img
                  src={ownerProfilePhoto}
                  alt={`${ownerName} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                ownerInitials
              )}
            </div>
          </div>
        </div>

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
                    <Users
                      size={26}
                      className="text-emerald-400"
                    />

                    <h2 className="text-xl font-black md:text-2xl">
                      Technician Registrations
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500">
                    Total registered technicians:{" "}
                    <span className="font-bold text-emerald-400">
                      {technicians.length}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchTechnicians}
                  disabled={isLoadingTechnicians}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      isLoadingTechnicians
                        ? "animate-spin"
                        : ""
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
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search by name, NIC or system ID..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>
            </div>

            {listError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-bold">
                    Unable to load technicians
                  </p>
                  <p className="mt-1 text-sm">
                    {listError}
                  </p>
                </div>
              </div>
            )}

            {isLoadingTechnicians ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f]">
                <div className="text-center">
                  <RefreshCw
                    size={34}
                    className="mx-auto animate-spin text-emerald-400"
                  />

                  <p className="mt-4 text-gray-400">
                    Loading registered technicians...
                  </p>
                </div>
              </div>
            ) : filteredTechnicians.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f] p-8 text-center">
                <div>
                  <Users
                    size={48}
                    className="mx-auto text-gray-700"
                  />

                  <h3 className="mt-4 text-xl font-bold">
                    No Technicians Found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "No registered technician matches your search."
                      : "No technicians have been registered yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTechnicians.map(
                  (technician) => (
                    <div
                      key={technician.technicianId}
                      className="rounded-2xl border border-white/10 bg-[#15151f] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                            <UserCog
                              size={24}
                              className="text-emerald-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-black text-white">
                              {technician.fullName ||
                                "Unnamed Technician"}
                            </h3>
                          </div>
                        </div>

                        <BadgeCheck
                          size={20}
                          className="shrink-0 text-blue-400"
                        />
                      </div>

                      <div className="mb-5 rounded-xl border border-white/5 bg-black/20 p-4">
                        <div className="flex items-center gap-3">
                          <CreditCard
                            size={17}
                            className="shrink-0 text-gray-500"
                          />

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                              NIC Number
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-300">
                              {technician.nic || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDetails(technician)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400 transition hover:border-blue-500/60 hover:bg-blue-500/20"
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>

        {selectedTechnician && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#15151f] p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <UserCog
                      size={25}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-black md:text-2xl">
                      Technician Details
                    </h2>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:border-red-500/40 hover:text-red-400"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <UserCog size={16} />
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleEditChange}
                      readOnly={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none transition ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-emerald-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <CreditCard size={16} />
                      NIC
                    </label>

                    <input
                      type="text"
                      name="nic"
                      value={editData.nic}
                      onChange={handleEditChange}
                      maxLength={12}
                      pattern="([0-9]{9}[VvXx]|[0-9]{12})"
                      readOnly={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none transition ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-emerald-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <Mail size={16} />
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      maxLength={120}
                      readOnly={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none transition ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-emerald-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <Phone size={16} />
                      Contact Number
                    </label>

                    <input
                      type="text"
                      name="contactNumber"
                      value={editData.contactNumber}
                      onChange={handleEditChange}
                      inputMode="numeric"
                      maxLength={10}
                      pattern="0[0-9]{9}"
                      readOnly={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none transition ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-emerald-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <Briefcase size={16} />
                      Experience (Years)
                    </label>

                    <input
                      type="number"
                      name="experience"
                      min="0"
                      max="60"
                      step="1"
                      value={editData.experience}
                      onChange={handleEditChange}
                      readOnly={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none transition ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-emerald-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    />
                  </div>


                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm text-gray-400">
                      Specialization
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {specializationOptions.map(
                        (item) => {
                          const isSelected =
                            editData.specialization.includes(
                              item
                            );

                          return (
                            <button
                              key={item}
                              type="button"
                              disabled={!isEditing}
                              onClick={() =>
                                handleEditSpecializationChange(
                                  item
                                )
                              }
                              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                                !isEditing
                                  ? "cursor-default"
                                  : "cursor-pointer"
                              } ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                  : "border-white/10 bg-black/30 text-gray-500"
                              }`}
                            >
                              {item}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCloseDetails}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300 transition hover:bg-white/5"
                      >
                        <X size={18} />
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setIsEditing(true)
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold transition hover:bg-blue-500"
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
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        <X size={18} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleUpdateTechnician}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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

        {popup.open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closePopup();
              }
            }}
          >
            <div
              className={`relative w-full max-w-md overflow-hidden rounded-3xl border bg-[#11131b] shadow-2xl ${
                popup.type === "success"
                  ? "border-emerald-500/30 shadow-emerald-500/10"
                  : "border-red-500/30 shadow-red-500/10"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  popup.type === "success"
                    ? "bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                }`}
              />

              <button
                type="button"
                onClick={closePopup}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close popup"
              >
                <X size={19} />
              </button>

              <div className="px-6 pb-6 pt-9 text-center sm:px-8 sm:pb-8">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${
                    popup.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      popup.type === "success"
                        ? "bg-emerald-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {popup.type === "success" ? (
                      <Check size={32} strokeWidth={3} />
                    ) : (
                      <AlertCircle size={31} strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <p
                  className={`mt-5 text-xs font-black uppercase tracking-[0.28em] ${
                    popup.type === "success"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {popup.type === "success" ? "Success" : "Attention"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {popup.title}
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
                  {popup.message}
                </p>

                {popup.showCredentials && (
                  <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-left">
                    {popup.technicianId && (
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          System ID
                        </span>
                        <span className="break-all text-right text-sm font-black text-emerald-400">
                          {popup.technicianId}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Username
                      </span>
                      <span className="break-all text-right text-sm font-black text-white">
                        {popup.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Temporary Password
                      </span>
                      <span className="break-all text-right text-sm font-black text-blue-400">
                        {popup.password}
                      </span>
                    </div>
                  </div>
                )}

                {!popup.showCredentials && popup.technicianId && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      System ID
                    </p>
                    <p className="mt-2 text-base font-black text-emerald-400">
                      {popup.technicianId}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {popup.showCredentials && (
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
                    onClick={closePopup}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-black transition ${
                      popup.type === "success"
                        ? "bg-emerald-500 text-black hover:bg-emerald-400"
                        : "bg-red-500 text-white hover:bg-red-400"
                    }`}
                  >
                    <Check size={18} />
                    OK
                  </button>
                </div>

                {popup.showCredentials && (
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
    <div className="min-h-screen bg-[#07080f] font-sans text-white">
      <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg font-black tracking-widest md:text-xl">
              TECHNICIAN REGISTRATION
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Add workshop technicians
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="text-[10px] text-indigo-400 uppercase max-w-[240px] truncate">
              {garageName}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl border border-indigo-400 flex items-center justify-center overflow-hidden bg-[#0b0b12] text-xs">
            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              ownerInitials
            )}
          </div>
        </div>
      </div>

      <main className="p-4 md:p-8">
        {ownerError && (
          <div className="mx-auto mb-6 max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#15151f] p-6 shadow-2xl md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <UserCog
              className="text-emerald-400"
              size={28}
            />

            <h2 className="text-2xl font-bold">
              Technician Information
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                maxLength={80}
                pattern="[A-Za-z][A-Za-z .'-]{1,79}"
                title="Use letters, spaces, apostrophes, hyphens or full stops only"
                disabled={isSubmitting}
                placeholder="Enter full name"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={120}
                disabled={isSubmitting}
                placeholder="example@gmail.com"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Contact Number
              </label>

              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                inputMode="numeric"
                maxLength={10}
                pattern="0[0-9]{9}"
                title="Enter exactly 10 digits starting with 0"
                disabled={isSubmitting}
                placeholder="07XXXXXXXX"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                NIC
              </label>

              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                required
                maxLength={12}
                pattern="([0-9]{9}[VvXx]|[0-9]{12})"
                title="Enter 9 digits followed by V/X, or a 12-digit NIC"
                disabled={isSubmitting}
                placeholder="200012345678 or 901234567V"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Experience (Years)
              </label>

              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                max="60"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                placeholder="Enter 0 if no experience"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm text-gray-400">
                Specialization
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {specializationOptions.map((item) => {
                  const isSelected =
                    formData.specialization.includes(item);

                  return (
                    <label
                      key={item}
                      className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                        isSubmitting
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      } ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-black/30 text-gray-400 hover:border-emerald-500/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isSubmitting}
                        onChange={() =>
                          handleSpecializationChange(item)
                        }
                        className="hidden"
                      />

                      {item}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold transition-all duration-300 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Register Technician
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleViewRegistrations}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-8 py-3 font-bold text-blue-400 transition-all duration-300 hover:border-blue-500/60 hover:bg-blue-500/20 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Users size={18} />
                View Registrations
                <Eye size={17} />
              </button>
            </div>
          </form>
        </div>
      </main>

        {popup.open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closePopup();
              }
            }}
          >
            <div
              className={`relative w-full max-w-md overflow-hidden rounded-3xl border bg-[#11131b] shadow-2xl ${
                popup.type === "success"
                  ? "border-emerald-500/30 shadow-emerald-500/10"
                  : "border-red-500/30 shadow-red-500/10"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  popup.type === "success"
                    ? "bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                }`}
              />

              <button
                type="button"
                onClick={closePopup}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close popup"
              >
                <X size={19} />
              </button>

              <div className="px-6 pb-6 pt-9 text-center sm:px-8 sm:pb-8">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${
                    popup.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      popup.type === "success"
                        ? "bg-emerald-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {popup.type === "success" ? (
                      <Check size={32} strokeWidth={3} />
                    ) : (
                      <AlertCircle size={31} strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <p
                  className={`mt-5 text-xs font-black uppercase tracking-[0.28em] ${
                    popup.type === "success"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {popup.type === "success" ? "Success" : "Attention"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {popup.title}
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
                  {popup.message}
                </p>

                {popup.showCredentials && (
                  <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-left">
                    {popup.technicianId && (
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          System ID
                        </span>
                        <span className="break-all text-right text-sm font-black text-emerald-400">
                          {popup.technicianId}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Username
                      </span>
                      <span className="break-all text-right text-sm font-black text-white">
                        {popup.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Temporary Password
                      </span>
                      <span className="break-all text-right text-sm font-black text-blue-400">
                        {popup.password}
                      </span>
                    </div>
                  </div>
                )}

                {!popup.showCredentials && popup.technicianId && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      System ID
                    </p>
                    <p className="mt-2 text-base font-black text-emerald-400">
                      {popup.technicianId}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {popup.showCredentials && (
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
                    onClick={closePopup}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-black transition ${
                      popup.type === "success"
                        ? "bg-emerald-500 text-black hover:bg-emerald-400"
                        : "bg-red-500 text-white hover:bg-red-400"
                    }`}
                  >
                    <Check size={18} />
                    OK
                  </button>
                </div>

                {popup.showCredentials && (
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