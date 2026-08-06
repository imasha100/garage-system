import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  LoaderCircle,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  X,
  XCircle,
  Bell,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const API_URL =
  `${API_BASE}/api/external-truck-requests`;

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString("en-GB");
};

const normalizeRequest = (item = {}) => ({
  registrationId:
    item.registrationId ??
    item.registration_id ??
    item.id,

  status: item.status ?? "Pending",

  truckNumber:
    item.truckNumber ??
    item.truck_number ??
    "",

  truckType:
    item.truckType ??
    item.truck_type ??
    "",

  capacity:
    item.capacity ??
    item.capacity_tons ??
    "",

  truckModel:
    item.truckModel ??
    item.truck_model ??
    "",

  registrationDate:
    item.registrationDate ??
    item.registration_date ??
    "",

  latitude:
    item.latitude ?? "",

  longitude:
    item.longitude ?? "",

  truckStatus:
    item.truckStatus ??
    item.truck_status ??
    "External",

  driverFullName:
    item.driverFullName ??
    item.full_name ??
    "",

  driverNic:
    item.driverNic ??
    item.nic ??
    "",

  driverEmail:
    item.driverEmail ??
    item.email ??
    "",

  driverContactNumber:
    item.driverContactNumber ??
    item.contact_number ??
    "",

  licenceNumber:
    item.licenceNumber ??
    item.licenseNumber ??
    item.license_number ??
    "",

  licenceExpiryDate:
    item.licenceExpiryDate ??
    item.licenseExpireDate ??
    item.license_expire_date ??
    "",

  experienceYears:
    item.experienceYears ??
    item.experience_years ??
    "",

  driverStatus:
    item.driverStatus ??
    item.driver_status ??
    "External",

  truckId:
   item.truckId ??
   item.approved_truck_id ??
   null,

 assignmentStatus:
   item.assignmentStatus ??
   item.assignment_status ??
   "",

 garageId:
   item.garageId ??
   item.garage_garage_id ??
   null,

  garageName:
    item.garageName ??
    item.garage_name ??
    "",

  garageAddress:
    item.garageAddress ??
    item.garage_address ??
    "",

  garageDistrict:
    item.garageDistrict ??
    item.garage_district ??
    "",
});

export default function ExternalTruckRequests({
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
          "External Truck Requests owner loading error:",
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
      ? String(profilePhotoPath).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [isLoadingDetails, setIsLoadingDetails] =
    useState(false);

  const [actionModal, setActionModal] = useState({
    open: false,
    type: "",
    request: null,
  });

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [errorModal, setErrorModal] = useState({
  open: false,
  title: "",
  message: "",
});

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
        "Unable to read logged-in garage:",
        error
      );

      return null;
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const garageId = getLoggedInGarageId();

      if (!garageId) {
        throw new Error(
          "The logged-in garage could not be identified. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_URL}?garageId=${garageId}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to load external truck requests."
        );
      }

      const receivedRequests = Array.isArray(data)
        ? data
        : data.requests ||
          data.data ||
          data.results ||
          [];

      setRequests(
        receivedRequests.map(normalizeRequest)
      );
    } catch (error) {
      console.error(
        "Fetch external truck requests error:",
        error
      );

      setLoadError(
        error.message ||
          "Unable to load external truck requests."
      );

      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDetails = async (request) => {
    setIsLoadingDetails(true);

    try {
      const response = await fetch(
        `${API_URL}/${request.registrationId}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to load request details."
        );
      }

      setSelectedRequest(
        normalizeRequest(data.request)
      );
    } catch (error) {
      console.error(
        "Load external request details error:",
        error
      );

      setErrorModal({
        open: true,
        title: "Unable to Load Request",
        message:
          error.message ||
          "Unable to load external truck request details.",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  const openActionModal = (type, request) => {
    setActionModal({
      open: true,
      type,
      request,
    });
  };

  const closeActionModal = () => {
    if (isProcessing) return;

    setActionModal({
      open: false,
      type: "",
      request: null,
    });
  };

  const processRequest = async () => {
    const request = actionModal.request;
    const actionType = actionModal.type;

    if (!request || !actionType) return;

    setIsProcessing(true);

    try {

      const targetId =
        actionType === "release"
        ? request.truckId
        : request.registrationId;

      const response = await fetch(
        `${API_URL}/${targetId}/${actionType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            `Unable to ${actionType} this request.`
        );
      }

      let updatedStatus = request.status;

      if (actionType === "approve") {
        updatedStatus = "Approved";
      } else if (actionType === "reject") {
        updatedStatus = "Rejected";
      } else if (actionType === "release") {
        updatedStatus = "Released";
      }

      setRequests((previousRequests) =>
        previousRequests.map((item) =>
          item.registrationId ===
          request.registrationId
            ? {
                ...item,
                status: updatedStatus,
              }
            : item
        )
      );

      if (
        selectedRequest?.registrationId ===
        request.registrationId
      ) {
        setSelectedRequest((previous) => ({
          ...previous,
          status: updatedStatus,
        }));
      }

      setActionModal({
        open: false,
        type: "",
        request: null,
      });

      setSuccessModal({
        open: true,
        
        title:
  actionType === "approve"
    ? "Request Approved"
    : actionType === "reject"
    ? "Request Rejected"
    : "Truck Released",

message:
  actionType === "approve"
    ? "The external tow truck and driver were added to the garage successfully."
    : actionType === "reject"
    ? "The external tow truck registration request was rejected successfully."
    : "The external tow truck has been released successfully.",
      });
    } catch (error) {
      console.error(
        "Process external request error:",
        error
      );

      setErrorModal({
        open: true,
        title:
          actionType === "release"
            ? "Truck Release Failed"
            : actionType === "approve"
            ? "Approval Failed"
            : "Rejection Failed",
        message:
          error.message ||
          `Unable to ${actionType} this request.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const searchText = searchQuery
      .trim()
      .toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      const matchesSearch =
        !searchText ||
        request.truckNumber
          .toLowerCase()
          .includes(searchText) ||
        request.truckModel
          .toLowerCase()
          .includes(searchText) ||
        request.truckType
          .toLowerCase()
          .includes(searchText) ||
        request.driverFullName
          .toLowerCase()
          .includes(searchText) ||
        request.driverNic
          .toLowerCase()
          .includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [requests, searchQuery, statusFilter]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(
        (request) => request.status === "Pending"
      ).length,
      approved: requests.filter(
        (request) => request.status === "Approved"
      ).length,
      rejected: requests.filter(
        (request) => request.status === "Rejected"
      ).length,
    }),
    [requests]
  );

  const statusClass = (status) => {
    if (status === "Approved") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (status === "Rejected") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  };

  const openMap = (request) => {
    const latitude = Number(request.latitude);
    const longitude = Number(request.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      window.alert(
        "A valid truck location is not available."
      );
      return;
    }

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

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
              EXTERNAL TOW TRUCK REQUESTS
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Review external truck registration requests
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

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-purple-500/30 bg-purple-500/10 text-xs">
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
          <div className="mx-auto mb-6 max-w-7xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => onNavigate("Registration")}
            className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Registration
          </button>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Total Requests"
              value={counts.total}
              className="text-white"
            />

            <SummaryCard
              label="Pending"
              value={counts.pending}
              className="text-amber-400"
            />

            <SummaryCard
              label="Approved"
              value={counts.approved}
              className="text-emerald-400"
            />

            <SummaryCard
              label="Rejected"
              value={counts.rejected}
              className="text-red-400"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#15151f] p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-black md:text-2xl">
                  Registration Requests
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review requests sent to your garage.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchRequests}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-400 transition hover:bg-purple-500/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    isLoading ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
              <div className="relative">
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
                  placeholder="Search by truck, model, driver or NIC..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="Approved">
                  Approved
                </option>
                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>

          {loadError && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              <AlertCircle size={20} />

              <div>
                <p className="font-bold">
                  Unable to load requests
                </p>

                <p className="mt-1 text-sm">
                  {loadError}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f]">
              <div className="text-center">
                <LoaderCircle
                  size={36}
                  className="mx-auto animate-spin text-purple-400"
                />

                <p className="mt-4 text-gray-400">
                  Loading external requests...
                </p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-[#15151f] p-8 text-center">
              <div>
                <Truck
                  size={50}
                  className="mx-auto text-gray-700"
                />

                <h3 className="mt-4 text-xl font-bold">
                  No Requests Found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery ||
                  statusFilter !== "All"
                    ? "No request matches the selected filters."
                    : "No external tow truck requests have been received yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRequests.map((request) => (
                <div
                  key={request.registrationId}
                  className="rounded-2xl border border-white/10 bg-[#15151f] p-5 transition hover:-translate-y-1 hover:border-purple-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
                        <Truck
                          size={24}
                          className="text-purple-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black">
                          {request.truckNumber ||
                            "Unknown Truck"}
                        </h3>

                        <p className="mt-1 truncate text-xs font-bold text-purple-400">
                          {request.truckModel ||
                            "No model"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 rounded-xl border border-white/5 bg-black/20 p-4 text-sm">
                    <InformationRow
                      label="Truck Type"
                      value={request.truckType}
                    />

                    <InformationRow
                      label="Capacity"
                      value={
                        request.capacity !== ""
                          ? `${request.capacity} tons`
                          : "N/A"
                      }
                    />

                    <InformationRow
                      label="Driver"
                      value={
                        request.driverFullName
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenDetails(request)
                    }
                    disabled={isLoadingDetails}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-400 transition hover:bg-purple-500/20 disabled:opacity-50"
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

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#15151f] p-5 md:p-6">
              <div>
                <h2 className="text-xl font-black md:text-2xl">
                  External Truck Request
                </h2>

                <p className="mt-1 text-xs font-bold text-purple-400">
                  {selectedRequest.truckNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400 transition hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Request Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${statusClass(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openMap(selectedRequest)
                  }
                  className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                >
                  <MapPin size={18} />
                  View Truck Location
                </button>
              </div>

              <div className="mt-7">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-purple-400">
                  <Truck size={20} />
                  Truck Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailCard
                    label="Truck Number"
                    value={
                      selectedRequest.truckNumber
                    }
                  />

                  <DetailCard
                    label="Truck Model"
                    value={
                      selectedRequest.truckModel
                    }
                  />

                  <DetailCard
                    label="Truck Type"
                    value={
                      selectedRequest.truckType
                    }
                  />

                  <DetailCard
                    label="Capacity"
                    value={
                      selectedRequest.capacity !== ""
                        ? `${selectedRequest.capacity} tons`
                        : "N/A"
                    }
                  />

                  <DetailCard
                    label="Registration Date"
                    value={formatDate(
                      selectedRequest.registrationDate
                    )}
                  />

                  <DetailCard
                    label="Truck Status"
                    value={
                      selectedRequest.truckStatus
                    }
                  />

                  <DetailCard
                    label="Latitude"
                    value={
                      selectedRequest.latitude
                    }
                  />

                  <DetailCard
                    label="Longitude"
                    value={
                      selectedRequest.longitude
                    }
                  />
                </div>
              </div>

              <div className="my-7 border-t border-white/10" />

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-emerald-400">
                  <UserRound size={20} />
                  Driver Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailCard
                    label="Driver Full Name"
                    value={
                      selectedRequest.driverFullName
                    }
                  />

                  <DetailCard
                    label="NIC"
                    value={
                      selectedRequest.driverNic
                    }
                  />

                  <DetailCard
                    label="Email"
                    value={
                      selectedRequest.driverEmail
                    }
                  />

                  <DetailCard
                    label="Contact Number"
                    value={
                      selectedRequest.driverContactNumber
                    }
                  />

                  <DetailCard
                    label="Licence Number"
                    value={
                      selectedRequest.licenceNumber
                    }
                  />

                  <DetailCard
                    label="Licence Expiry Date"
                    value={formatDate(
                      selectedRequest.licenceExpiryDate
                    )}
                  />

                  <DetailCard
                    label="Experience"
                    value={
                      selectedRequest.experienceYears !==
                      ""
                        ? `${selectedRequest.experienceYears} years`
                        : "N/A"
                    }
                  />

                  <DetailCard
                    label="Driver Status"
                    value={
                      selectedRequest.driverStatus
                    }
                  />
                </div>
              </div>

              <div className="my-7 border-t border-white/10" />

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-blue-400">
                  <MapPin size={20} />
                  Selected Garage
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailCard
                    label="Garage Name"
                    value={
                      selectedRequest.garageName
                    }
                  />

                  <DetailCard
                    label="District"
                    value={
                      selectedRequest.garageDistrict
                    }
                  />

                  <div className="md:col-span-2">
                    <DetailCard
                      label="Garage Address"
                      value={
                        selectedRequest.garageAddress
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-6 py-3 font-bold text-gray-300 transition hover:text-white"
                >
                  <X size={18} />
                  Close
                </button>

                {selectedRequest.status ===
                  "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        openActionModal(
                          "reject",
                          selectedRequest
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-bold text-red-400 transition hover:bg-red-500/20"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openActionModal(
                          "approve",
                          selectedRequest
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-black text-white transition hover:bg-emerald-500"
                    >
                      <Check size={18} />
                      Approve
                    </button>
                  </>
                )}

                {selectedRequest.status === "Approved" &&
   selectedRequest.assignmentStatus === "Active" &&
  selectedRequest.truckId && (
    <button
      type="button"
      onClick={() =>
        openActionModal("release", selectedRequest)
      }
      className="flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-6 py-3 font-black text-orange-400 transition hover:bg-orange-500/20"
    >
      <Truck size={18} />
      Release Truck
    </button>
  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {actionModal.open && actionModal.request && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeActionModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11131b] p-6 text-center shadow-2xl">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${
                actionModal.type === "approve"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {actionModal.type === "approve" ? (
                <Check size={32} />
              ) : (
                <XCircle size={32} />
              )}
            </div>

            <h2 className="mt-5 text-2xl font-black">
              {actionModal.type === "approve"
                ? "Approve this request?"
                : actionModal.type === "reject"
                ? "Reject this request?"
                : "Release this truck?"}
            </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {actionModal.type === "approve"
              ? "The external truck and driver will be added to your garage records."
              : actionModal.type === "reject"
              ? "The request will be marked as rejected and no truck record will be created."
              : "This truck will be released from your garage and can be registered with another garage later."}
          </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-bold text-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={processRequest}
                disabled={isProcessing}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-black text-white disabled:opacity-60 ${
                  actionModal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : actionModal.type === "approve" ? (
  <>
    <Check size={18} />
    Approve
  </>
) : actionModal.type === "reject" ? (
  <>
    <XCircle size={18} />
    Reject
  </>
) : (
  <>
    <Truck size={18} />
    Release Truck
  </>
)}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[#11131b] p-7 text-center shadow-2xl shadow-emerald-500/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-black">
              <Check size={32} strokeWidth={3} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              {successModal.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {successModal.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccessModal({
                  open: false,
                  title: "",
                  message: "",
                })
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-black transition hover:bg-emerald-400"
            >
              <Check size={18} />
              Done
            </button>
          </div>
        </div>
      )}

      {errorModal.open && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#11131b] p-7 text-center shadow-2xl shadow-red-500/10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white">
        <XCircle size={32} strokeWidth={3} />
      </div>

      <h2 className="mt-5 text-2xl font-black text-white">
        {errorModal.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {errorModal.message}
      </p>

      <button
        type="button"
        onClick={() =>
          setErrorModal({
            open: false,
            title: "",
            message: "",
          })
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400"
      >
        <X size={18} />
        Close
      </button>
    </div>
  </div>
)}
    </div>


  );
}

function SummaryCard({
  label,
  value,
  className = "",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151f] p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black md:text-3xl ${className}`}
      >
        {value}
      </p>
    </div>
  );
}

function InformationRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right font-semibold text-gray-300">
        {value || "N/A"}
      </span>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-gray-300">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "N/A"}
      </p>
    </div>
  );
}