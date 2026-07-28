import React, { useEffect, useState } from "react";
import {
  User,
  AlertCircle,
  MapPin,
  X,
  Clock,
  Navigation,
  Search,
  Bell,
  Menu,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ResourceSchedule = ({ openSidebar }) => {
  const [currentCapacity, setCurrentCapacity] = useState(7);
  const maxCapacity = 10;

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    color: "#52f0ac",
    showCancel: false,
    requestData: null,
  });

  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [assistanceId, setAssistanceId] = useState(null);
  const [garageId, setGarageId] = useState(null);

  const [availableTechs, setAvailableTechs] = useState([
    "David Vance",
    "Sarah Jenkins",
  ]);

  const [activeTechs, setActiveTechs] = useState([
    {
      name: "Marcus Thorne",
      task: "Hybrid System",
      completion: 65,
      time: "18 Mins",
    },
    {
      name: "Alex Mercer",
      task: "Mechanical Overhaul",
      completion: 30,
      time: "42 Mins",
    },
  ]);

  const normalizeRequest = (request) => {
    const latitude = Number(request.customerLatitude);
    const longitude = Number(request.customerLongitude);

    return {
      id: request.requestId,
      requestId: request.requestId,
      name: request.customerName || "Customer",
      contact: request.customerContact || "Not available",
      vNo: request.vehicleNumber || "Not available",
      vehicle: request.vehicleType || "Not specified",
      loc: request.location || "Customer Live GPS Location",
      garageId: request.garageId || null,
      garageName: request.garageName || "Selected Garage",
      lat: Number.isFinite(latitude) ? latitude : null,
      lng: Number.isFinite(longitude) ? longitude : null,
      eta: "Live GPS",
      dist: "See Map",
      status: String(request.requestStatus || "Pending").toLowerCase(),
      requestDate: request.requestDate || null,
      requestTime: request.requestTime || null,
    };
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError("");

      const storedStaffUser = sessionStorage.getItem("staffUser");

      if (!storedStaffUser) {
        throw new Error(
          "Logged-in assistance officer details were not found."
        );
      }

      const staffUser = JSON.parse(storedStaffUser);
      const loggedAssistanceId = Number(staffUser?.staffId);

      if (
        String(staffUser?.role || "").toLowerCase() !== "assistance" ||
        !Number.isInteger(loggedAssistanceId) ||
        loggedAssistanceId <= 0
      ) {
        throw new Error(
          "A valid assistance officer account could not be identified."
        );
      }

      const assistanceResponse = await fetch(
        `http://localhost:5000/api/assistances/${loggedAssistanceId}`
      );

      const assistanceResult = await assistanceResponse.json();

      if (
        !assistanceResponse.ok ||
        assistanceResult.success === false ||
        !assistanceResult.assistance
      ) {
        throw new Error(
          assistanceResult.message ||
            "Unable to load assistance officer details."
        );
      }

      const assistance = assistanceResult.assistance;

      const relatedGarageId = Number(
        assistance.garageId ??
          assistance.garage_id ??
          assistance.garageGarageId ??
          assistance.garage_garage_id
      );

      if (
        !Number.isInteger(relatedGarageId) ||
        relatedGarageId <= 0
      ) {
        throw new Error(
          "The garage related to this assistance officer could not be identified."
        );
      }

      const pendingResponse = await fetch(
        `http://localhost:5000/api/service-requests?garageId=${relatedGarageId}&status=Pending`
      );

      const pendingResult = await pendingResponse.json();

      if (!pendingResponse.ok || !pendingResult.success) {
        throw new Error(
          pendingResult.message ||
            "Unable to load pending service requests."
        );
      }

      const acceptedResponse = await fetch(
        `http://localhost:5000/api/service-requests?garageId=${relatedGarageId}&status=Accepted`
      );

      const acceptedResult = await acceptedResponse.json();

      if (!acceptedResponse.ok || !acceptedResult.success) {
        throw new Error(
          acceptedResult.message ||
            "Unable to load accepted service requests."
        );
      }

      const pendingRequests = (
        Array.isArray(pendingResult.requests)
          ? pendingResult.requests
          : []
      ).map(normalizeRequest);

      const accepted = (
        Array.isArray(acceptedResult.requests)
          ? acceptedResult.requests
          : []
      ).map(normalizeRequest);

      setAssistanceId(loggedAssistanceId);
      setGarageId(relatedGarageId);
      setEmergencyRequests(pendingRequests);
      setAcceptedRequests(accepted);

      setCurrentCapacity(
        Math.min(7 + accepted.length, maxCapacity)
      );

      setSelectedReq((previousSelected) => {
        if (
          previousSelected &&
          pendingRequests.some(
            (request) => request.id === previousSelected.id
          )
        ) {
          return previousSelected;
        }

        return pendingRequests.length > 0
          ? { ...pendingRequests[0], status: "pending" }
          : null;
      });
    } catch (error) {
      console.error("Load resource requests error:", error);
      setEmergencyRequests([]);
      setAcceptedRequests([]);
      setSelectedReq(null);
      setRequestsError(
        error.message ||
          "Unable to load service requests."
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAllocate = (techName) => {
    const vNo = selectedVehicles[techName];

    if (!vNo) {
      setPopup({
        show: true,
        title: "SELECT VEHICLE",
        message: "Please select a vehicle to allocate.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
      return;
    }

    setAvailableTechs((prev) => prev.filter((t) => t !== techName));

    setActiveTechs((prev) => [
      ...prev,
      {
        name: techName,
        task: `Assigned: ${vNo}`,
        completion: 0,
        time: "Just Now",
      },
    ]);

    setPopup({
      show: true,
      title: "TECHNICIAN ALLOCATED",
      message: `${techName} has been assigned to vehicle ${vNo}.`,
      color: "#52f0ac",
      showCancel: false,
      requestData: null,
    });
  };

  const handleAccept = async () => {
    if (!selectedReq || actionLoading) return;

    if (currentCapacity >= maxCapacity) {
      setPopup({
        show: true,
        title: "CAPACITY FULL",
        message: "Garage capacity is full. Cannot accept this request.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
      return;
    }

    if (
      !Number.isInteger(assistanceId) ||
      assistanceId <= 0
    ) {
      setPopup({
        show: true,
        title: "OFFICER NOT FOUND",
        message:
          "The logged-in assistance officer could not be identified.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/service-requests/${selectedReq.requestId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assistanceId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to accept the service request."
        );
      }

      const acceptedReq = {
        ...selectedReq,
        status: "accepted",
      };

      const updatedRequests = emergencyRequests.filter(
        (request) => request.id !== selectedReq.id
      );

      setEmergencyRequests(updatedRequests);
      setAcceptedRequests((previous) => [
        acceptedReq,
        ...previous.filter(
          (request) => request.id !== acceptedReq.id
        ),
      ]);

      setCurrentCapacity((previous) =>
        Math.min(previous + 1, maxCapacity)
      );

      setSelectedReq(
        updatedRequests.length > 0
          ? { ...updatedRequests[0], status: "pending" }
          : null
      );

      setPopup({
        show: true,
        title: "REQUEST ACCEPTED",
        message: `${selectedReq.id} has been accepted successfully.`,
        color: "#52f0ac",
        showCancel: false,
        requestData: acceptedReq,
      });
    } catch (error) {
      console.error("Accept request error:", error);

      setPopup({
        show: true,
        title: "ACCEPT FAILED",
        message:
          error.message ||
          "Unable to accept the service request.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq || actionLoading) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/service-requests/${selectedReq.requestId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to reject the service request."
        );
      }

      const rejectedReq = {
        ...selectedReq,
        status: "rejected",
      };

      const updatedRequests = emergencyRequests.filter(
        (request) => request.id !== selectedReq.id
      );

      setEmergencyRequests(updatedRequests);
      setRejectedRequests((previous) => [
        rejectedReq,
        ...previous.filter(
          (request) => request.id !== rejectedReq.id
        ),
      ]);

      setSelectedReq(
        updatedRequests.length > 0
          ? { ...updatedRequests[0], status: "pending" }
          : null
      );

      setPopup({
        show: true,
        title: "REQUEST REJECTED",
        message: `${selectedReq.id} has been rejected successfully.`,
        color: "#f59e0b",
        showCancel: false,
        requestData: null,
      });
    } catch (error) {
      console.error("Reject request error:", error);

      setPopup({
        show: true,
        title: "REJECT FAILED",
        message:
          error.message ||
          "Unable to reject the service request.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setPopup({
      show: false,
      title: "",
      message: "",
      color: "#52f0ac",
      showCancel: false,
      requestData: null,
    });
  };

  const filteredEmergencyRequests = emergencyRequests.filter((req) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      String(req.id || "").toLowerCase().includes(query) ||
      String(req.name || "").toLowerCase().includes(query) ||
      String(req.contact || "").toLowerCase().includes(query) ||
      String(req.vNo || "").toLowerCase().includes(query) ||
      String(req.vehicle || "").toLowerCase().includes(query) ||
      String(req.loc || "").toLowerCase().includes(query) ||
      String(req.garageName || "").toLowerCase().includes(query)
    );
  });

  const RequestMap = ({ request, height = "h-64" }) => {
    const hasValidLocation =
      Number.isFinite(Number(request?.lat)) &&
      Number.isFinite(Number(request?.lng));

    if (!hasValidLocation) {
      return (
        <div
          className={`${height} rounded-lg overflow-hidden border border-[#1a1f26] mb-6 flex items-center justify-center bg-[#0b0e14] p-6 text-center`}
        >
          <div>
            <MapPin
              size={38}
              className="mx-auto mb-3 text-[#6e7681]"
            />
            <p className="font-bold text-white">
              No Customer GPS Location
            </p>
            <p className="mt-2 text-sm text-[#6e7681]">
              Latitude and longitude were not received for this request.
            </p>
          </div>
        </div>
      );
    }

    const customerLocation = [
      Number(request.lat),
      Number(request.lng),
    ];

    return (
      <div
        className={`${height} rounded-lg overflow-hidden border border-[#1a1f26] mb-6`}
      >
        <MapContainer
          key={`${request.id}-${customerLocation[0]}-${customerLocation[1]}`}
          center={customerLocation}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={customerLocation}>
            <Popup>
              <strong>{request?.name}</strong>
              <br />
              Contact: {request?.contact}
              <br />
              Vehicle: {request?.vehicle} ({request?.vNo})
              <br />
              Request Location: Customer Live GPS
              <br />
              Latitude: {customerLocation[0].toFixed(6)}
              <br />
              Longitude: {customerLocation[1].toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-0 bg-[#0b0e14] text-[#a0a8b7] font-sans overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-black border-b border-blue-900/40">
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={openSidebar}
            className="md:hidden text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request..."
              className="w-full bg-black border border-slate-800 py-2 pl-10 pr-4 rounded-md text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-4">
          <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            ONLINE
          </span>

          <button
            type="button"
            className="text-slate-300 hover:text-white cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
            <User size={14} />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 w-full bg-[#0b0e14] text-[#a0a8b7] p-4 md:p-8 font-sans overflow-y-auto relative">
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-5 md:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailsModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 uppercase">
              Request Details: {showDetailsModal.id}
            </h2>

            <RequestMap request={showDetailsModal} height="h-56" />

            <div className="space-y-4 text-white">
              <p>
                Customer:{" "}
                <span className="text-[#3b82f6]">{showDetailsModal.name}</span>
              </p>
              <p>Contact: {showDetailsModal.contact}</p>
              <p>
                Vehicle: {showDetailsModal.vehicle} ({showDetailsModal.vNo})
              </p>
              <p>
                Garage: {showDetailsModal.garageName || showDetailsModal.loc}
              </p>
              <p>
                Status:{" "}
                <span
                  className={`capitalize font-bold ${
                    showDetailsModal.status === "accepted"
                      ? "text-[#52f0ac]"
                      : showDetailsModal.status === "rejected"
                      ? "text-[#e78181]"
                      : "text-white"
                  }`}
                >
                  {showDetailsModal.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {popup.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-6 md:p-8 w-full max-w-[420px] text-center shadow-xl">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: popup.color }}
            >
              {popup.title}
            </h2>

            <p className="text-[#cbd5e1] mb-6">{popup.message}</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() =>
                  setPopup({
                    show: false,
                    title: "",
                    message: "",
                    color: "#52f0ac",
                    showCancel: false,
                    requestData: null,
                  })
                }
                className="bg-[#3b82f6] hover:bg-[#45cc92] text-black font-bold px-6 py-2 rounded-lg cursor-pointer"
              >
                OK
              </button>

              {popup.showCancel && (
                <button
                  onClick={() => handleCancel(popup.requestData)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-white text-2xl font-bold uppercase tracking-wider">
          Dispatch Center
        </h1>

        <div className="text-sm">
          Capacity :
          <span className="text-white font-bold ml-2">
            {currentCapacity}/{maxCapacity}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div
          className={`grid ${
            emergencyRequests.length === 0 && !selectedReq
              ? "grid-cols-1"
              : "grid-cols-1 xl:grid-cols-2"
          } gap-6`}
        >
          <div className="space-y-4">
            <h2 className="text-white font-bold mb-2">PENDING REQUESTS</h2>

            {requestsLoading ? (
              <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-8 text-center">
                <p className="text-sm text-[#6e7681]">
                  Loading pending requests...
                </p>
              </div>
            ) : requestsError ? (
              <div className="bg-[#15191f] rounded-xl border border-red-900/40 p-8 text-center">
                <AlertCircle
                  size={45}
                  className="text-[#e78181] mx-auto mb-4"
                />
                <h2 className="text-white font-bold">
                  Unable to Load Requests
                </h2>
                <p className="text-sm text-[#e78181] mt-2">
                  {requestsError}
                </p>
                <button
                  type="button"
                  onClick={loadRequests}
                  className="mt-4 bg-[#3b82f6] text-black px-4 py-2 rounded text-xs font-bold"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : filteredEmergencyRequests.length > 0 ? (
              filteredEmergencyRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq({ ...req, status: "pending" })}
                  className={`cursor-pointer rounded-xl p-6 border transition-all ${
                    selectedReq?.id === req.id
                      ? "border-[#3b82f6] shadow-[0_0_12px_rgba(82,240,172,0.2)]"
                      : "border-[#1a1f26] bg-[#15191f]"
                  }`}
                >
                  <h2 className="text-[#ce2222] font-bold mb-4 flex items-center gap-2">
                    <AlertCircle size={18} /> EMERGENCY REQUEST ({req.id})
                  </h2>

                  <p className="text-sm">
                    Customer :
                    <span className="text-white ml-2">{req.name}</span>
                  </p>

                  <p className="text-sm mt-1">
                    Contact :
                    <span className="text-white ml-2">{req.contact}</span>
                  </p>

                  <p className="text-sm mt-1">
                    Vehicle No :
                    <span className="text-white ml-2">{req.vNo}</span>
                  </p>

                  <p className="text-sm mt-1">
                    Vehicle :
                    <span className="text-white ml-2">{req.vehicle}</span>
                  </p>

                  <p className="text-sm mt-1">
                    Garage :
                    <span className="text-white ml-2">
                      {req.garageName || req.loc}
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-8 text-center">
                <AlertCircle
                  size={45}
                  className="text-[#3b82f6] mx-auto mb-4"
                />
                <h2 className="text-white font-bold">No Pending Requests</h2>
                <p className="text-sm text-[#6e7681] mt-2">
                  Customer requests will appear here automatically.
                </p>
              </div>
            )}
          </div>

          {selectedReq ? (
            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6 flex flex-col">
              <RequestMap request={selectedReq} height="h-64" />

              <div className="flex gap-4 mb-4 bg-black/40 px-4 py-3 rounded-lg border border-[#3b82f6]/30">
                <div className="flex items-center gap-2 text-[#3b82f6]">
                  <Clock size={16} />
                  <span className="font-bold">{selectedReq.eta}</span>
                </div>

                <div className="flex items-center gap-2 text-[#3b82f6]">
                  <Navigation size={16} />
                  <span className="font-bold">{selectedReq.dist}</span>
                </div>
              </div>

              <p className="mb-4 text-[10px] text-[#3b82f6] uppercase tracking-widest">
                {selectedReq.loc}
              </p>

              <div className="bg-[#0b0e14] border border-[#1a1f26] rounded-lg p-4 mb-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6e7681]">Contact</span>
                  <span className="text-white font-medium">
                    {selectedReq.contact}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6e7681]">Status</span>
                  <span className="text-white font-bold">
                    {selectedReq.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-auto">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-1 bg-[#52f0ac] hover:bg-[#45cc92] disabled:cursor-not-allowed disabled:opacity-60 text-black py-3 rounded font-bold cursor-pointer"
                >
                  {actionLoading
                    ? "PROCESSING..."
                    : "ACCEPT REQUEST"}
                </button>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 border border-[#e78181] text-[#e78181] disabled:cursor-not-allowed disabled:opacity-60 py-3 rounded font-bold cursor-pointer"
                >
                  {actionLoading ? "PROCESSING..." : "REJECT"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle size={50} className="text-[#3b82f6] mb-4" />
              <h2 className="text-white text-xl font-bold">
                All Requests Processed
              </h2>
            </div>
          )}
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
            <h2 className="text-[#3b82f6] font-bold mb-5">
              AVAILABLE TECHNICIANS
            </h2>

            {availableTechs.map((tech, index) => (
              <div
                key={index}
                className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4"
              >
                <div className="flex gap-3 items-center mb-2">
                  <User size={35} />
                  <p className="text-white font-bold">{tech}</p>
                </div>

                <select
                  className="w-full bg-[#15191f] border border-[#1a2e26] text-white p-2 mb-2 rounded text-sm"
                  value={selectedVehicles[tech] || ""}
                  onChange={(e) =>
                    setSelectedVehicles({
                      ...selectedVehicles,
                      [tech]: e.target.value,
                    })
                  }
                >
                  <option value="">Select Vehicle</option>
                  {acceptedRequests.map((req) => (
                    <option key={req.id} value={req.vNo}>
                      {req.vNo}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAllocate(tech)}
                  className="w-full bg-[#3b82f6] text-black px-4 py-2 rounded text-xs font-bold hover:bg-[#45cc92] cursor-pointer"
                >
                  ALLOCATE
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
            <h2 className="text-[#ce2222] font-bold mb-5">
              ACTIVE FIELD TECHS
            </h2>

            {activeTechs.map((tech, index) => (
              <div
                key={index}
                className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-3 items-center">
                    <User size={35} />
                    <div>
                      <p className="text-white font-bold">{tech.name}</p>
                      <p className="text-xs text-[#3b82f6]">{tech.task}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-bold">{tech.time}</p>
                    <p className="text-xs text-[#6e7681]">Remaining</p>
                  </div>
                </div>

                <div className="w-full bg-[#15191f] rounded-full h-2">
                  <div
                    className="bg-[#e78181] h-2 rounded-full"
                    style={{ width: `${tech.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
            <h2 className="text-[#52f0ac] font-bold mb-4">
              ACCEPTED REQUESTS
            </h2>

            {acceptedRequests.length > 0 ? (
              acceptedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0b0e14] border border-[#1a2e26] rounded-lg p-4 mb-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-bold">
                      {req.id} - {req.vNo}
                    </p>
                    <p className="text-xs text-[#52f0ac]">Accepted</p>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(req)}
                    className="bg-[#3b82f6] text-black px-3 py-1 rounded text-xs font-bold cursor-pointer"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6e7681]">No accepted requests yet.</p>
            )}
          </div>

          <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
            <h2 className="text-[#e78181] font-bold mb-4">
              REJECTED REQUESTS
            </h2>

            {rejectedRequests.length > 0 ? (
              rejectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0b0e14] border border-[#2b1d1d] rounded-lg p-4 mb-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-bold">
                      {req.id} - {req.vNo}
                    </p>
                    <p className="text-xs text-[#e78181]">Rejected</p>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(req)}
                    className="border border-[#e78181] text-[#e78181] px-3 py-1 rounded text-xs font-bold cursor-pointer"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6e7681]">No rejected requests yet.</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ResourceSchedule;