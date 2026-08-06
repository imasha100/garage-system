import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  LoaderCircle,
  Menu,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Truck,
  UserRound,
  X,
  Bell,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const API_URL = `${API_BASE}/api/trucks`;

const createEmptyForm = () => ({
  plateNumber: "",
  truckModel: "",
  truckType: "",
  capacity: "",
  driverName: "",
  driverEmail: "",
  driverContact: "",
  driverNic: "",
  licenseNumber: "",
  licenseExpireDate: "",
  driverExperience: "",
});

const normalizeTruck = (item = {}) => ({
  truckId: item.truckId ?? item.truck_id ?? item.id,
  plateNumber: item.plateNumber ?? item.truckNumber ?? item.truck_number ?? "",
  truckModel: item.truckModel ?? item.truck_model ?? "",
  truckType: item.truckType ?? item.truck_type ?? "",
  capacity: item.capacity ?? item.capacity_tons ?? "",
  registrationDate: item.registrationDate ?? item.registration_date ?? "",
  truckStatus: item.truckStatus ?? item.truck_status ?? "Internal",
  garageId: item.garageId ?? item.garage_garage_id ?? null,
  driverId: item.driverId ?? item.driver_id ?? null,
  driverName: item.driverName ?? item.driver_full_name ?? item.full_name ?? "",
  driverEmail: item.driverEmail ?? item.driver_email ?? item.email ?? "",
  driverContact:
    item.driverContact ??
    item.driver_contact_number ??
    item.contact_number ??
    "",
  driverNic: item.driverNic ?? item.driver_nic ?? item.nic ?? "",
  licenseNumber: item.licenseNumber ?? item.license_number ?? "",
  licenseExpireDate:
    item.licenseExpireDate ?? item.license_expire_date ?? "",
  driverExperience:
    item.driverExperience ?? item.experience_years ?? "",
  driverStatus: item.driverStatus ?? item.driver_status ?? "Internal",
});

export default function TruckRegistration({
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

        const staffUser = JSON.parse(storedStaffUser);
        const loginId = Number(
          staffUser?.loginId ?? staffUser?.login_id
        );

        if (!Number.isInteger(loginId) || loginId <= 0) {
          throw new Error(
            "A valid garage owner login ID was not found."
          );
        }

        const response = await fetch(
          `${API_BASE}/api/owners/profile/${loginId}`
        );
        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message ||
              "Unable to load garage owner profile."
          );
        }

        if (isMounted) {
          setOwnerData(result.data || null);
        }
      } catch (error) {
        console.error(
          "Tow Truck Registration owner loading error:",
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
    (ownerLoading ? "Loading Owner..." : "Garage Owner");

  const garageName =
    ownerData?.garage?.garageName ??
    ownerData?.garage?.garage_name ??
    (ownerLoading ? "Loading Garage..." : "Garage");

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "GO";

  const profilePhotoPath =
    ownerData?.owner?.profilePhoto ??
    ownerData?.owner?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(profilePhotoPath).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  const [formData, setFormData] = useState(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showRegistrations, setShowRegistrations] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);
  const [listError, setListError] = useState("");

  const [selectedTruck, setSelectedTruck] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [successModal, setSuccessModal] = useState({
    open: false,
    type: "register",
    title: "",
    message: "",
  });

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
      console.error("Unable to read garage details:", error);
      return null;
    }
  };

  const closeSuccessModal = () => {
    setSuccessModal((previous) => ({ ...previous, open: false }));
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
        text: "The logged-in garage could not be identified. Please sign in again using a Garage Owner account.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: formData.plateNumber.trim().toUpperCase(),
          truckModel: formData.truckModel.trim(),
          truckType: formData.truckType,
          capacity: formData.capacity,
          driverName: formData.driverName.trim(),
          driverEmail: formData.driverEmail.trim().toLowerCase(),
          driverContact: formData.driverContact.trim(),
          driverNic: formData.driverNic.trim().toUpperCase(),
          licenseNumber: formData.licenseNumber.trim().toUpperCase(),
          licenseExpireDate: formData.licenseExpireDate,
          driverExperience: formData.driverExperience,
          garageId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to register tow truck and driver."
        );
      }

      setFormData(createEmptyForm());
      setMessage({
        type: "success",
        text: "Tow truck and driver registered successfully.",
      });

      setSuccessModal({
        open: true,
        type: "register",
        title: "Registration Successful",
        message:
          "The tow truck and assigned driver have been saved successfully.",
      });

      if (showRegistrations) {
        fetchTrucks();
      }
    } catch (error) {
      console.error("Truck registration error:", error);
      setMessage({
        type: "error",
        text: error.message || "Unable to register tow truck and driver.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTrucks = async () => {
    setIsLoadingTrucks(true);
    setListError("");

    try {
      const garageId = getLoggedInGarageId();

      if (!garageId) {
        throw new Error(
          "The logged-in garage could not be identified. Please sign in again."
        );
      }

      const response = await fetch(`${API_URL}?garageId=${garageId}`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load tow trucks.");
      }

      const receivedTrucks = Array.isArray(data)
        ? data
        : data.trucks || data.data || data.results || [];

      setTrucks(receivedTrucks.map(normalizeTruck));
    } catch (error) {
      console.error("Fetch tow trucks error:", error);
      setListError(error.message || "Unable to load tow trucks.");
      setTrucks([]);
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  const handleViewRegistrations = () => {
    setShowRegistrations(true);
    setSearchQuery("");
    setSelectedTruck(null);
    setEditData(null);
    setIsEditing(false);
    fetchTrucks();
  };

  const handleBackToRegistration = () => {
    setShowRegistrations(false);
    setSelectedTruck(null);
    setEditData(null);
    setIsEditing(false);
    setSearchQuery("");
  };

  const handleOpenDetails = async (truck) => {
    try {
      const response = await fetch(`${API_URL}/${truck.truckId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load tow truck details.");
      }

      const normalized = normalizeTruck(data.truck);
      setSelectedTruck(normalized);
      setEditData({ ...normalized });
      setIsEditing(false);
    } catch (error) {
      window.alert(error.message || "Unable to load tow truck details.");
    }
  };

  const handleCloseDetails = () => {
    setSelectedTruck(null);
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
    setEditData({ ...selectedTruck });
    setIsEditing(false);
  };

  const handleUpdateTruck = async () => {
    const garageId = getLoggedInGarageId();

    if (!garageId) {
      window.alert("The logged-in garage could not be identified.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`${API_URL}/${editData.truckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: String(editData.plateNumber).trim().toUpperCase(),
          truckModel: String(editData.truckModel).trim(),
          truckType: editData.truckType,
          capacity: editData.capacity,
          driverName: String(editData.driverName).trim(),
          driverEmail: String(editData.driverEmail).trim().toLowerCase(),
          driverContact: String(editData.driverContact).trim(),
          driverNic: String(editData.driverNic).trim().toUpperCase(),
          licenseNumber: String(editData.licenseNumber)
            .trim()
            .toUpperCase(),
          licenseExpireDate: editData.licenseExpireDate,
          driverExperience: editData.driverExperience,
          garageId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to update tow truck details."
        );
      }

      const updatedTruck = normalizeTruck(data.truck || editData);

      setTrucks((previousTrucks) =>
        previousTrucks.map((item) =>
          item.truckId === updatedTruck.truckId ? updatedTruck : item
        )
      );

      setSelectedTruck(updatedTruck);
      setEditData({ ...updatedTruck });
      setIsEditing(false);

      setSuccessModal({
        open: true,
        type: "update",
        title: "Update Successful",
        message:
          "The tow truck and driver details have been updated successfully.",
      });
    } catch (error) {
      console.error("Update tow truck error:", error);
      window.alert(error.message || "Unable to update tow truck details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTrucks = trucks.filter((item) => {
    const searchText = searchQuery.trim().toLowerCase();

    if (!searchText) return true;

    return (
      item.plateNumber.toLowerCase().includes(searchText) ||
      item.truckModel.toLowerCase().includes(searchText) ||
      item.truckType.toLowerCase().includes(searchText) ||
      item.driverName.toLowerCase().includes(searchText) ||
      item.driverNic.toLowerCase().includes(searchText)
    );
  });

  const today = new Date().toISOString().slice(0, 10);

  if (showRegistrations) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white">
        <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
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
                REGISTERED TOW TRUCKS
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                View and manage recovery vehicles and drivers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleBackToRegistration}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-gray-300 transition hover:border-amber-500/40 hover:text-amber-400"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Registration</span>
            </button>

            <Bell size={18} className="text-gray-300" />
            <div className="h-8 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-xs font-bold tracking-widest">{ownerName}</p>
              <p className="max-w-[240px] truncate text-[10px] uppercase text-indigo-400">
                {garageName}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-indigo-400 bg-[#0b0b12] text-xs">
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
                    <Truck size={26} className="text-amber-400" />
                    <h2 className="text-xl font-black md:text-2xl">
                      Tow Truck Registrations
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500">
                    Total registered trucks:{" "}
                    <span className="font-bold text-amber-400">
                      {trucks.length}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchTrucks}
                  disabled={isLoadingTrucks}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={isLoadingTrucks ? "animate-spin" : ""}
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
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by plate, model, type, driver or NIC..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none placeholder:text-gray-600 focus:border-amber-500"
                />
              </div>
            </div>

            {listError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                <AlertCircle size={20} />
                <div>
                  <p className="font-bold">Unable to load tow trucks</p>
                  <p className="mt-1 text-sm">{listError}</p>
                </div>
              </div>
            )}

            {isLoadingTrucks ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f]">
                <div className="text-center">
                  <RefreshCw
                    size={34}
                    className="mx-auto animate-spin text-amber-400"
                  />
                  <p className="mt-4 text-gray-400">Loading tow trucks...</p>
                </div>
              </div>
            ) : filteredTrucks.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f] p-8 text-center">
                <div>
                  <Truck size={48} className="mx-auto text-gray-700" />
                  <h3 className="mt-4 text-xl font-bold">
                    No Tow Trucks Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "No registered truck matches your search."
                      : "No tow trucks have been registered yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTrucks.map((item) => (
                  <div
                    key={item.truckId}
                    className="rounded-2xl border border-white/10 bg-[#15151f] p-5 transition hover:-translate-y-1 hover:border-amber-500/40"
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                        <Truck size={24} className="text-amber-400" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black">
                          {item.plateNumber || "Unnamed Truck"}
                        </h3>
                        <p className="mt-1 truncate text-xs font-bold text-amber-400">
                          {item.truckModel || "No model"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 space-y-3 rounded-xl border border-white/5 bg-black/20 p-4 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Truck Type</span>
                        <span className="text-right font-semibold text-gray-300">
                          {item.truckType || "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Driver</span>
                        <span className="truncate text-right font-semibold text-gray-300">
                          {item.driverName || "N/A"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetails(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-400 transition hover:bg-amber-500/20"
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

        {selectedTruck && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#15151f] p-5 md:p-6">
                <div>
                  <h2 className="text-xl font-black md:text-2xl">
                    Tow Truck & Driver Details
                  </h2>
                  <p className="mt-1 text-xs font-bold text-amber-400">
                    {selectedTruck.plateNumber}
                  </p>
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
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-amber-400">
                  <Truck size={20} /> Truck Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DetailInput
                    label="Plate Number"
                    name="plateNumber"
                    value={editData.plateNumber}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="Truck Model"
                    name="truckModel"
                    value={editData.truckModel}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Truck Type
                    </label>
                    <select
                      name="truckType"
                      value={editData.truckType}
                      onChange={handleEditChange}
                      disabled={!isEditing}
                      className={`w-full rounded-xl border p-3 outline-none ${
                        isEditing
                          ? "border-white/10 bg-black/40 focus:border-amber-500"
                          : "cursor-default border-white/5 bg-black/20 text-gray-300"
                      }`}
                    >
                      <option value="Flatbed Tow Truck">Flatbed Tow Truck</option>
                      <option value="Wheel Lift Tow Truck">
                        Wheel Lift Tow Truck
                      </option>
                      <option value="Integrated Tow Truck">
                        Integrated Tow Truck
                      </option>
                      <option value="Heavy Duty Tow Truck">
                        Heavy Duty Tow Truck
                      </option>
                    </select>
                  </div>

                  <DetailInput
                    label="Capacity (Tons)"
                    name="capacity"
                    type="number"
                    value={editData.capacity}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div className="my-7 border-t border-white/10" />

                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-emerald-400">
                  <UserRound size={20} /> Driver Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DetailInput
                    label="Driver Full Name"
                    name="driverName"
                    value={editData.driverName}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="Driver Email"
                    name="driverEmail"
                    type="email"
                    value={editData.driverEmail}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="Driver Contact"
                    name="driverContact"
                    value={editData.driverContact}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="Driver NIC"
                    name="driverNic"
                    value={editData.driverNic}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="License Number"
                    name="licenseNumber"
                    value={editData.licenseNumber}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                  />
                  <DetailInput
                    label="License Expire Date"
                    name="licenseExpireDate"
                    type="date"
                    value={editData.licenseExpireDate}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                    min={today}
                  />
                  <DetailInput
                    label="Driving Experience (Years)"
                    name="driverExperience"
                    type="number"
                    value={editData.driverExperience}
                    onChange={handleEditChange}
                    isEditing={isEditing}
                    min="0"
                    max="60"
                    step="1"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCloseDetails}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300"
                      >
                        <X size={18} /> Close
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-bold text-black hover:bg-amber-500"
                      >
                        <Pencil size={18} /> Edit Details
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
                        <X size={18} /> Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleUpdateTruck}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={18} /> Save Changes
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080f] font-sans text-white">
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white transition hover:bg-white/10 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg font-black tracking-widest md:text-xl">
              TOW TRUCK REGISTRATION
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Register recovery vehicle and assigned driver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Bell size={18} className="text-gray-300" />
          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-xs font-bold tracking-widest">{ownerName}</p>
            <p className="max-w-[240px] truncate text-[10px] uppercase text-indigo-400">
              {garageName}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-indigo-400 bg-[#0b0b12] text-xs">
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
          <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("Registration")}
            className="mx-auto mb-6 flex w-full max-w-5xl items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} /> Back to Registration
          </button>
        )}

        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-[#15151f] p-6 shadow-2xl md:p-8">
          {message.text && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Truck className="text-amber-400" size={28} />
                <h2 className="text-2xl font-bold">Truck Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="Plate Number"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  placeholder="CAB-1234 or WP CAA-1234"
                  pattern="(?:[A-Za-z]{2}\s[A-Za-z]{1,3}-\d{4}|[A-Za-z]{2,3}-\d{4})"
                  title="Use CAB-1234 or WP CAA-1234 format"
                  maxLength={11}
                  disabled={isSubmitting}
                  accent="amber"
                />

                <FormInput
                  label="Truck Model"
                  name="truckModel"
                  value={formData.truckModel}
                  onChange={handleChange}
                  placeholder="Isuzu NPR / Toyota Dyna"
                  disabled={isSubmitting}
                  accent="amber"
                />

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Truck Type
                  </label>
                  <select
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/10 bg-[#101018] p-3 text-white outline-none focus:border-amber-500 disabled:opacity-60"
                  >
                    <option value="">Select Truck Type</option>
                    <option value="Flatbed Tow Truck">Flatbed Tow Truck</option>
                    <option value="Wheel Lift Tow Truck">
                      Wheel Lift Tow Truck
                    </option>
                    <option value="Integrated Tow Truck">
                      Integrated Tow Truck
                    </option>
                    <option value="Heavy Duty Tow Truck">
                      Heavy Duty Tow Truck
                    </option>
                  </select>
                </div>

                <FormInput
                  label="Capacity (Tons)"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Example: 3"
                  disabled={isSubmitting}
                  accent="amber"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </section>

            <div className="border-t border-white/10" />

            <section>
              <div className="mb-6 flex items-center gap-3">
                <UserRound className="text-emerald-400" size={28} />
                <h2 className="text-2xl font-bold">Driver Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="Driver Full Name"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  placeholder="Enter driver full name"
                  disabled={isSubmitting}
                />
                <FormInput
                  label="Driver Email"
                  name="driverEmail"
                  type="email"
                  value={formData.driverEmail}
                  onChange={handleChange}
                  placeholder="driver@gmail.com"
                  disabled={isSubmitting}
                />
                <FormInput
                  label="Driver Contact"
                  name="driverContact"
                  type="tel"
                  value={formData.driverContact}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  disabled={isSubmitting}
                  maxLength={10}
                />
                <FormInput
                  label="Driver NIC"
                  name="driverNic"
                  value={formData.driverNic}
                  onChange={handleChange}
                  placeholder="200012345678 or 901234567V"
                  disabled={isSubmitting}
                  maxLength={12}
                />
                <FormInput
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  disabled={isSubmitting}
                />
                <FormInput
                  label="License Expire Date"
                  name="licenseExpireDate"
                  type="date"
                  value={formData.licenseExpireDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min={today}
                />
                <FormInput
                  label="Driving Experience (Years)"
                  name="driverExperience"
                  type="number"
                  value={formData.driverExperience}
                  onChange={handleChange}
                  placeholder="0 if no experience"
                  disabled={isSubmitting}
                  min="0"
                  max="60"
                  step="1"
                />
              </div>
            </section>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-8 py-3 font-bold transition hover:bg-amber-500 disabled:opacity-60 md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Register Truck & Driver
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleViewRegistrations}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-8 py-3 font-bold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-60 md:w-auto"
              >
                <Eye size={18} /> View Registrations
              </button>
            </div>
          </form>
        </div>
      </main>

      {successModal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSuccessModal();
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[#11131b] p-7 text-center shadow-2xl shadow-emerald-500/10">
            <button
              type="button"
              onClick={closeSuccessModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 hover:text-white"
            >
              <X size={19} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-black">
              <Check size={32} strokeWidth={3} />
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
              Success
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {successModal.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {successModal.message}
            </p>

            <button
              type="button"
              onClick={closeSuccessModal}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-black hover:bg-emerald-400"
            >
              <Check size={18} /> Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  accent = "emerald",
  ...rest
}) {
  const focusClass =
    accent === "amber" ? "focus:border-amber-500" : "focus:border-emerald-500";

  return (
    <div>
      <label className="mb-2 block text-sm text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white outline-none placeholder:text-gray-600 disabled:opacity-60 ${focusClass} ${
          type === "date" ? "[color-scheme:dark]" : ""
        }`}
        {...rest}
      />
    </div>
  );
}

function DetailInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  isEditing,
  ...rest
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={!isEditing}
        className={`w-full rounded-xl border p-3 outline-none ${
          isEditing
            ? "border-white/10 bg-black/40 focus:border-emerald-500"
            : "cursor-default border-white/5 bg-black/20 text-gray-300"
        } ${type === "date" ? "[color-scheme:dark]" : ""}`}
        {...rest}
      />
    </div>
  );
}