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
  Copy,
  KeyRound,
  LogIn,
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

        const result = await response.json();

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

  // ======================================================
  // REQUEST STATES
  // ======================================================

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

  // ======================================================
  // UPDATED SUCCESS MODAL
  // Stores generated external-driver credentials
  // ======================================================

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",

    externalDriverId: "",
    temporaryPassword: "",

    garageName: "",
    driverName: "",
    truckNumber: "",

    isNewDriverAccount: false,
  });

  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  // ======================================================
  // COPY CREDENTIAL
  // ======================================================

  const copyCredential = async (value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error(
        "Unable to copy credential:",
        error
      );
    }
  };

  // ======================================================
  // GARAGE ID
  // ======================================================

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

  // ======================================================
  // LOAD REQUESTS
  // ======================================================

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

      if (
        !response.ok ||
        data.success === false
      ) {
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
    if (!ownerLoading) {
      fetchRequests();
    }
  }, [ownerLoading, ownerGarageId]);

  // ======================================================
  // OPEN REQUEST DETAILS
  // ======================================================

  const handleOpenDetails = async (request) => {
    setIsLoadingDetails(true);

    try {
      const response = await fetch(
        `${API_URL}/${request.registrationId}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
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

  // ======================================================
  // ACTION MODAL
  // ======================================================

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

  // ======================================================
  // APPROVE / REJECT / RELEASE
  // UPDATED TO READ DRIVER LOGIN CREDENTIALS
  // ======================================================

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

      if (
        !response.ok ||
        data.success === false
      ) {
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

                truckId:
                  actionType === "approve"
                    ? data?.data?.truckId ??
                      item.truckId
                    : item.truckId,

                assignmentStatus:
                  actionType === "approve"
                    ? "Active"
                    : actionType === "release"
                    ? "Inactive"
                    : item.assignmentStatus,
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

          truckId:
            actionType === "approve"
              ? data?.data?.truckId ??
                previous?.truckId
              : previous?.truckId,

          assignmentStatus:
            actionType === "approve"
              ? "Active"
              : actionType === "release"
              ? "Inactive"
              : previous?.assignmentStatus,
        }));
      }

      setActionModal({
        open: false,
        type: "",
        request: null,
      });

      // ==================================================
      // APPROVAL - SHOW GENERATED LOGIN DETAILS
      // ==================================================

      if (actionType === "approve") {
        const approvalData =
          data?.data || {};

        setSuccessModal({
          open: true,

          title:
            "REGISTRATION APPROVED",

          message:
            `Your registration with ${
              approvalData.garageName ||
              request.garageName ||
              garageName
            } has been approved.`,

          externalDriverId:
            approvalData.externalDriverId ||
            "",

          temporaryPassword:
            approvalData.temporaryPassword ||
            "",

          garageName:
            approvalData.garageName ||
            request.garageName ||
            garageName ||
            "",

          driverName:
            approvalData.driverFullName ||
            request.driverFullName ||
            "",

          truckNumber:
            approvalData.truckNumber ||
            request.truckNumber ||
            "",

          isNewDriverAccount:
            Boolean(
              approvalData.isNewDriverAccount ??
              approvalData.externalDriverId
            ),
        });
      } else {
        setSuccessModal({
          open: true,

          title:
            actionType === "reject"
              ? "Request Rejected"
              : "Truck Released",

          message:
            actionType === "reject"
              ? "The external tow truck registration request was rejected successfully."
              : "The external tow truck has been released successfully.",

          externalDriverId: "",
          temporaryPassword: "",
          garageName: "",
          driverName: "",
          truckNumber: "",
          isNewDriverAccount: false,
        });
      }

      await fetchRequests();
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

  // ======================================================
  // FILTER
  // ======================================================

  const filteredRequests = useMemo(() => {
    const searchText =
      searchQuery.trim().toLowerCase();

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
  }, [
    requests,
    searchQuery,
    statusFilter,
  ]);

  const counts = useMemo(
    () => ({
      total: requests.length,

      pending: requests.filter(
        (request) =>
          request.status === "Pending"
      ).length,

      approved: requests.filter(
        (request) =>
          request.status === "Approved"
      ).length,

      rejected: requests.filter(
        (request) =>
          request.status === "Rejected"
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

    if (status === "Released") {
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  };

  // ======================================================
  // MAP
  // ======================================================

  const openMap = (request) => {
    const latitude =
      Number(request.latitude);

    const longitude =
      Number(request.longitude);

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
    // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#07080f] text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

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

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="p-4 md:p-8">

        {ownerError && (
          <div className="mx-auto mb-6 max-w-7xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        <div className="mx-auto max-w-7xl">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              onNavigate("Registration")
            }
            className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Registration
          </button>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

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

          {/* ==================================================
              SEARCH / FILTER
          ================================================== */}

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
                    isLoading
                      ? "animate-spin"
                      : ""
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
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by truck, model, driver or NIC..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
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

          {/* ==================================================
              LOAD ERROR
          ================================================== */}

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

          {/* ==================================================
              REQUEST LIST
          ================================================== */}

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

              {filteredRequests.map(
                (request) => (

                  <div
                    key={
                      request.registrationId
                    }
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
                        value={
                          request.truckType
                        }
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
                        handleOpenDetails(
                          request
                        )
                      }
                      disabled={
                        isLoadingDetails
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-400 transition hover:bg-purple-500/20 disabled:opacity-50"
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

      {/* ==================================================
          REQUEST DETAILS MODAL
      ================================================== */}

      {selectedRequest && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f]">

            {/* MODAL HEADER */}

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

              {/* STATUS + MAP */}

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
                    openMap(
                      selectedRequest
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                >
                  <MapPin size={18} />
                  View Truck Location
                </button>

              </div>

              {/* ==================================================
                  TRUCK INFORMATION
              ================================================== */}

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
                      selectedRequest.capacity !==
                      ""
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

              {/* ==================================================
                  DRIVER INFORMATION
              ================================================== */}

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

              {/* ==================================================
                  GARAGE INFORMATION
              ================================================== */}

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

              {/* ==================================================
                  REQUEST ACTION BUTTONS
              ================================================== */}

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

                {selectedRequest.status ===
                  "Approved" &&
                  selectedRequest.assignmentStatus ===
                    "Active" &&
                  selectedRequest.truckId && (

                    <button
                      type="button"
                      onClick={() =>
                        openActionModal(
                          "release",
                          selectedRequest
                        )
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
            {/* ==================================================
          ACTION CONFIRMATION MODAL
      ================================================== */}

      {actionModal.open && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#15151f] p-6 shadow-2xl">

            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                actionModal.type === "approve"
                  ? "border border-emerald-500/30 bg-emerald-500/10"
                  : actionModal.type === "reject"
                  ? "border border-red-500/30 bg-red-500/10"
                  : "border border-orange-500/30 bg-orange-500/10"
              }`}
            >

              {actionModal.type === "approve" ? (

                <Check
                  size={30}
                  className="text-emerald-400"
                />

              ) : actionModal.type === "reject" ? (

                <XCircle
                  size={30}
                  className="text-red-400"
                />

              ) : (

                <Truck
                  size={30}
                  className="text-orange-400"
                />

              )}

            </div>

            <div className="mt-5 text-center">

              <h2 className="text-xl font-black">

                {actionModal.type === "approve"
                  ? "Approve Registration?"
                  : actionModal.type === "reject"
                  ? "Reject Registration?"
                  : "Release External Truck?"}

              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">

                {actionModal.type === "approve"
                  ? `Are you sure you want to approve ${
                      actionModal.request?.truckNumber ||
                      "this external truck"
                    }? A login account will be created for the external driver.`

                  : actionModal.type === "reject"
                  ? `Are you sure you want to reject the registration request for ${
                      actionModal.request?.truckNumber ||
                      "this external truck"
                    }?`

                  : `Are you sure you want to release ${
                      actionModal.request?.truckNumber ||
                      "this external truck"
                    } from your garage?`}

              </p>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={closeActionModal}
                disabled={isProcessing}
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-bold text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={processRequest}
                disabled={isProcessing}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  actionModal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : actionModal.type === "reject"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-orange-600 hover:bg-orange-500"
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

                ) : (

                  <>
                    {actionModal.type === "approve" ? (
                      <Check size={18} />
                    ) : actionModal.type === "reject" ? (
                      <XCircle size={18} />
                    ) : (
                      <Truck size={18} />
                    )}

                    {actionModal.type === "approve"
                      ? "Approve"
                      : actionModal.type === "reject"
                      ? "Reject"
                      : "Release"}
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          SUCCESS MODAL
      ================================================== */}

      {successModal.open && (

      <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 p-4 backdrop-blur-md">

      <div className="mx-auto my-4 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#15151f] shadow-2xl">
            {/* ==================================================
                APPROVED + NEW DRIVER ACCOUNT
            ================================================== */}

            {successModal.isNewDriverAccount ? (

              <>

                {/* TOP */}

                <div className="border-b border-white/10 bg-gradient-to-b from-emerald-500/10 to-transparent px-6 pb-6 pt-8 text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">

                    <Check
                      size={38}
                      className="text-emerald-400"
                    />

                  </div>

                  <h2 className="mt-5 text-2xl font-black tracking-wide text-white">
                    REGISTRATION APPROVED
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {successModal.message}
                  </p>

                </div>

                {/* DETAILS */}

                <div className="p-6">

                  {(successModal.driverName ||
                    successModal.truckNumber) && (

                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {successModal.driverName && (

                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Driver
                          </p>

                          <p className="mt-2 truncate text-sm font-bold text-white">
                            {successModal.driverName}
                          </p>

                        </div>

                      )}

                      {successModal.truckNumber && (

                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Truck
                          </p>

                          <p className="mt-2 text-sm font-bold text-white">
                            {successModal.truckNumber}
                          </p>

                        </div>

                      )}

                    </div>

                  )}

                  {/* LOGIN CREDENTIAL BOX */}

                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">

                        <KeyRound
                          size={21}
                          className="text-purple-400"
                        />

                      </div>

                      <div>

                        <h3 className="font-black text-white">
                          External Driver Login
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Use these credentials to access the driver portal.
                        </p>

                      </div>

                    </div>

                    {/* DRIVER ID */}

                    <div className="mt-5">

                      <label className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                        External Driver ID
                      </label>

                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3">

                        <span className="min-w-0 flex-1 break-all font-mono text-sm font-black tracking-wider text-emerald-400">
                          {successModal.externalDriverId ||
                            "Not available"}
                        </span>

                        {successModal.externalDriverId && (

                          <button
                            type="button"
                            onClick={() =>
                              copyCredential(
                                successModal.externalDriverId
                              )
                            }
                            title="Copy Driver ID"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                          >
                            <Copy size={16} />
                          </button>

                        )}

                      </div>

                    </div>

                    {/* TEMP PASSWORD */}

                    <div className="mt-4">

                      <label className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                        Temporary Password
                      </label>

                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-3">

                        <span className="min-w-0 flex-1 break-all font-mono text-sm font-black tracking-wider text-amber-400">
                          {successModal.temporaryPassword ||
                            "Not available"}
                        </span>

                        {successModal.temporaryPassword && (

                          <button
                            type="button"
                            onClick={() =>
                              copyCredential(
                                successModal.temporaryPassword
                              )
                            }
                            title="Copy Temporary Password"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                          >
                            <Copy size={16} />
                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                  {/* IMPORTANT NOTE */}

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />

                    <p className="text-xs leading-5 text-gray-400">
                      The External Driver ID is the permanent username.
                      The driver can change the temporary password after
                      logging in.
                    </p>

                  </div>

                  {/* BUTTONS */}

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        setSuccessModal({
                          open: false,
                          title: "",
                          message: "",
                          externalDriverId: "",
                          temporaryPassword: "",
                          garageName: "",
                          driverName: "",
                          truckNumber: "",
                          isNewDriverAccount: false,
                        })
                      }
                      className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => {

                        /*
                          Driver Login page is the next page
                          we are going to create.

                          After that page is added to App.jsx,
                          this navigation will open it.
                        */

                        setSuccessModal({
                          open: false,
                          title: "",
                          message: "",
                          externalDriverId: "",
                          temporaryPassword: "",
                          garageName: "",
                          driverName: "",
                          truckNumber: "",
                          isNewDriverAccount: false,
                        });

                        if (onNavigate) {
                          onNavigate(
                            "external-driver-login"
                          );
                        }

                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-500"
                    >
                      <LogIn size={18} />
                      GO TO DRIVER LOGIN
                    </button>

                  </div>

                </div>

              </>

            ) : (

              /* ==================================================
                 NORMAL SUCCESS POPUP
                 Reject / Release
              ================================================== */

              <div className="p-7 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">

                  <Check
                    size={30}
                    className="text-emerald-400"
                  />

                </div>

                <h2 className="mt-5 text-xl font-black">
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
                      externalDriverId: "",
                      temporaryPassword: "",
                      garageName: "",
                      driverName: "",
                      truckNumber: "",
                      isNewDriverAccount: false,
                    })
                  }
                  className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-500"
                >
                  OK
                </button>

              </div>

            )}

          </div>

        </div>

      )}

      {/* ==================================================
          ERROR MODAL
      ================================================== */}

      {errorModal.open && (

        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#15151f] p-7 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">

              <XCircle
                size={30}
                className="text-red-400"
              />

            </div>

            <h2 className="mt-5 text-xl font-black">
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
              className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
  className = "",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151f] p-5">

      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black ${className}`}
      >
        {value}
      </p>

    </div>
  );
}

// ======================================================
// INFORMATION ROW
// ======================================================

function InformationRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="max-w-[60%] break-words text-right font-bold text-gray-200">
        {value || "N/A"}
      </span>

    </div>
  );
}

// ======================================================
// DETAIL CARD
// ======================================================

function DetailCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-gray-200">
        {value === null ||
        value === undefined ||
        value === ""
          ? "N/A"
          : value}
      </p>

    </div>
  );
}