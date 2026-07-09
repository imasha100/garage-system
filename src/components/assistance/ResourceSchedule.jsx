import React, { useEffect, useState } from "react";
import {
  User,
  AlertCircle,
  MapPin,
  X,
  Clock,
  Navigation,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
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

const ResourceSchedule = () => {
  const [currentCapacity, setCurrentCapacity] = useState(7);
  const maxCapacity = 10;

  const saegisLocation = [6.8728, 79.8887];

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

  const getRequests = () => {
    return JSON.parse(sessionStorage.getItem("resourceRequests")) || [];
  };

  const saveRequests = (requests) => {
    sessionStorage.setItem("resourceRequests", JSON.stringify(requests));
    window.dispatchEvent(new Event("resourceRequestsUpdated"));
  };

  const addDefaultLocation = (req) => {
    if (!req) return req;

    const locationMap = {
      "Colombo 07": { lat: 6.9108, lng: 79.8668 },
      Nugegoda: { lat: 6.8729, lng: 79.8996 },
      Kohuwala: { lat: 6.8721, lng: 79.8852 },
      Dehiwala: { lat: 6.8519, lng: 79.8655 },
      Maharagama: { lat: 6.848, lng: 79.9265 },
    };

    const matched = locationMap[req.loc] || locationMap[req.garageName];

    return {
      ...req,
      lat: req.lat || matched?.lat || 6.9108,
      lng: req.lng || matched?.lng || 79.8668,
    };
  };

  const [emergencyRequests, setEmergencyRequests] = useState(() => {
    return getRequests().map(addDefaultLocation);
  });

  const [selectedReq, setSelectedReq] = useState(() => {
    const requests = getRequests().map(addDefaultLocation);
    return requests.length > 0 ? { ...requests[0], status: "pending" } : null;
  });

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

  useEffect(() => {
    const loadRequests = () => {
      const requests = getRequests().map(addDefaultLocation);

      setEmergencyRequests(requests);

      setSelectedReq(
        requests.length > 0 ? { ...requests[0], status: "pending" } : null
      );
    };

    loadRequests();

    window.addEventListener("resourceRequestsUpdated", loadRequests);

    return () => {
      window.removeEventListener("resourceRequestsUpdated", loadRequests);
    };
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

  const handleAccept = () => {
    if (!selectedReq) return;

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

    const acceptedReq = { ...selectedReq, status: "accepted" };

    setCurrentCapacity((prev) => prev + 1);
    setAcceptedRequests((prev) => [...prev, acceptedReq]);

    const updatedRequests = emergencyRequests.filter(
      (req) => req.id !== selectedReq.id
    );

    setEmergencyRequests(updatedRequests);
    saveRequests(updatedRequests);

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
      showCancel: true,
      requestData: acceptedReq,
    });
  };

  const handleReject = () => {
    if (!selectedReq) return;

    const rejectedReq = { ...selectedReq, status: "rejected" };

    setRejectedRequests((prev) => [...prev, rejectedReq]);

    const updatedRequests = emergencyRequests.filter(
      (req) => req.id !== selectedReq.id
    );

    setEmergencyRequests(updatedRequests);
    saveRequests(updatedRequests);

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
  };

  const handleCancel = (req) => {
    if (!req) return;

    setAcceptedRequests((prev) => prev.filter((r) => r.id !== req.id));
    setCurrentCapacity((prev) => Math.max(prev - 1, 0));

    const pendingReq = { ...req, status: "pending" };
    const updatedRequests = [pendingReq, ...emergencyRequests];

    setEmergencyRequests(updatedRequests);
    saveRequests(updatedRequests);
    setSelectedReq(pendingReq);

    setPopup({
      show: false,
      title: "",
      message: "",
      color: "#52f0ac",
      showCancel: false,
      requestData: null,
    });
  };

  const RequestMap = ({ request, height = "h-64" }) => {
    const customerLocation = [
      request?.lat || 6.9108,
      request?.lng || 79.8668,
    ];

    return (
      <div
        className={`${height} rounded-lg overflow-hidden border border-[#1a1f26] mb-6`}
      >
        <MapContainer
          center={customerLocation}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={saegisLocation}>
            <Popup>
              <strong>Saegis Campus</strong>
              <br />
              Dispatch Center
            </Popup>
          </Marker>

          <Marker position={customerLocation}>
            <Popup>
              <strong>{request?.name}</strong>
              <br />
              {request?.vehicle} ({request?.vNo})
              <br />
              {request?.loc}
            </Popup>
          </Marker>

          <Polyline
            positions={[saegisLocation, customerLocation]}
            pathOptions={{
              color: "#3b82f6",
              weight: 5,
              dashArray: "10 8",
            }}
          />
        </MapContainer>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#0b0e14] text-[#a0a8b7] p-4 md:p-8 font-sans overflow-y-auto relative">
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

            {emergencyRequests.length > 0 ? (
              emergencyRequests.map((req) => (
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
                  className="flex-1 bg-[#52f0ac] hover:bg-[#45cc92] text-black py-3 rounded font-bold cursor-pointer"
                >
                  ACCEPT REQUEST
                </button>

                <button
                  onClick={handleReject}
                  className="flex-1 border border-[#e78181] text-[#e78181] py-3 rounded font-bold cursor-pointer"
                >
                  REJECT
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
  );
};

export default ResourceSchedule;