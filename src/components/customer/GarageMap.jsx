import React, { useEffect, useState } from "react";
import { X, Clock, MapPin, User, Users } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
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

export default function GarageMap({
  onNavigate,
  setSelectedGarage,
  selectedGarage,
  setResourceRequests,
}) {
  const [isRequested, setIsRequested] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fixed current location: Saegis Campus, Nugegoda
  const [userLocation, setUserLocation] = useState([6.8728, 79.8887]);

  const [requestData, setRequestData] = useState({
    customerName: "",
    contact: "",
    vehicleNumber: "",
    vehicleType: "",
  });

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getGarageWithLiveDistance = (garage) => {
    const distanceKm = calculateDistance(
      userLocation[0],
      userLocation[1],
      garage.lat,
      garage.lng
    );

    const averageSpeedKmH = 35;
    const timeMins = Math.max(
      1,
      Math.round((distanceKm / averageSpeedKmH) * 60)
    );

    return {
      ...garage,
      distance: `${distanceKm.toFixed(1)} KM`,
      time: `${timeMins} MINS`,
    };
  };

  useEffect(() => {
    setUserLocation([6.8728, 79.8887]);
  }, []);

  const garagesData = {
    kohuwala: {
      id: "KOHUWALA",
      name: "KOHUWALA AUTO CARE",
      workload: "30%",
      status: "NEAREST & RECOMMENDED",
      specialization: "General Vehicle Repair",
      specDesc: "Quick repair support near Saegis Campus / Kohuwala area.",
      lat: 6.8721,
      lng: 79.8852,
      freeTechs: [
        { name: "Kamal Silva", expert: "Engine Diagnosis" },
        { name: "Nuwan Perera", expert: "Auto Electrical" },
      ],
    },

    nugegoda: {
      id: "NUGEGODA",
      name: "NUGEGODA SERVICE HUB",
      workload: "55%",
      status: "MODERATE AVAILABLE",
      specialization: "Mechanical & Scanning",
      specDesc: "Multi-brand scanner and general mechanical support.",
      lat: 6.8729,
      lng: 79.8996,
      freeTechs: [{ name: "Roshan Alwis", expert: "Engine Scanning" }],
    },

    kirulapone: {
      id: "KIRULAPONE",
      name: "KIRULAPONE GARAGE POINT",
      workload: "42%",
      status: "AVAILABLE",
      specialization: "Brake, Suspension & Tune-up",
      specDesc: "Fast service for brake, suspension and routine maintenance.",
      lat: 6.8797,
      lng: 79.8746,
      freeTechs: [
        { name: "Sahan Fernando", expert: "Brake Systems" },
        { name: "Isuru Madushan", expert: "Suspension Repair" },
      ],
    },

    maharagama: {
      id: "MAHARAGAMA",
      name: "MAHARAGAMA AUTO TECH",
      workload: "68%",
      status: "BUSY",
      specialization: "Hybrid & EV Support",
      specDesc: "Hybrid vehicle diagnosis and battery inspection support.",
      lat: 6.848,
      lng: 79.9265,
      freeTechs: [{ name: "Dilan Perera", expert: "Hybrid Diagnosis" }],
    },

    piliyandala: {
      id: "PILIYANDALA",
      name: "PILIYANDALA RECOVERY HUB",
      workload: "75%",
      status: "HIGH WORKLOAD",
      specialization: "Recovery & Mechanical Repair",
      specDesc: "Tow recovery and heavy mechanical repair support.",
      lat: 6.8018,
      lng: 79.9227,
      freeTechs: [],
    },

    dehiwala: {
      id: "DEHIWALA",
      name: "DEHIWALA MOTOR WORKS",
      workload: "38%",
      status: "AVAILABLE",
      specialization: "Electrical & AC Repair",
      specDesc: "Vehicle electrical, AC repair and quick diagnostic support.",
      lat: 6.8519,
      lng: 79.8655,
      freeTechs: [
        { name: "Lahiru Fernando", expert: "Vehicle AC Repair" },
        { name: "Milan Jayasinghe", expert: "Auto Electrical Systems" },
      ],
    },
  };

  const resetForm = () => {
    setRequestData({
      customerName: "",
      contact: "",
      vehicleNumber: "",
      vehicleType: "",
    });
  };

  const handleSelectGarage = (garage) => {
    const updatedGarage = getGarageWithLiveDistance(garage);

    setIsRequested(false);
    setShowRequestForm(false);
    setShowSuccessMessage(false);
    resetForm();
    setSelectedGarage(updatedGarage);
  };

  const handleCloseDetails = () => {
    setIsRequested(false);
    setShowRequestForm(false);
    setShowSuccessMessage(false);
    setSelectedGarage(null);
  };

  const handleSubmitRequest = () => {
    if (
      !requestData.customerName ||
      !requestData.contact ||
      !requestData.vehicleNumber ||
      !requestData.vehicleType
    ) {
      alert("Please fill all fields");
      return;
    }

    const newRequest = {
      id: `TK-${Date.now().toString().slice(-4)}`,
      name: requestData.customerName,
      contact: requestData.contact,
      vehicle: requestData.vehicleType,
      vNo: requestData.vehicleNumber,
      eta: selectedGarage?.time || "N/A",
      dist: selectedGarage?.distance || "N/A",
      loc: selectedGarage?.name || "Selected Garage",
      garageName: selectedGarage?.name || "Selected Garage",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const oldRequests =
      JSON.parse(sessionStorage.getItem("resourceRequests")) || [];

    const updatedRequests = [newRequest, ...oldRequests];

    sessionStorage.setItem("resourceRequests", JSON.stringify(updatedRequests));
    window.dispatchEvent(new Event("resourceRequestsUpdated"));

    if (setResourceRequests) {
      setResourceRequests(updatedRequests);
    }

    setSelectedGarage({
      ...selectedGarage,
      customerRequest: newRequest,
    });

    setIsRequested(true);
    setShowRequestForm(false);
    setShowSuccessMessage(true);
    resetForm();
  };

  const liveGarages = Object.values(garagesData).map(getGarageWithLiveDistance);

  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#02050b] text-[#cbd5e1] font-mono flex flex-col">
      <div className="w-full h-14 border-b border-slate-900 bg-[#02050b]/90 backdrop-blur-md px-3 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-400 font-bold tracking-widest">
            LIVE GARAGE MAP
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="block text-white font-bold tracking-wide">
              CUSTOMER
            </span>
            <span className="block text-[9px] text-purple-400 tracking-widest uppercase">
              Premium Hub Access
            </span>
          </div>

          <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden">
        <MapContainer
          center={userLocation}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CircleMarker
            center={userLocation}
            radius={11}
            pathOptions={{
              color: "#b49eff",
              fillColor: "#b49eff",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>Saegis Campus</strong>
              <br />
              Current Location
            </Popup>
          </CircleMarker>

          {liveGarages.map((garage) => (
            <Marker
              key={garage.id}
              position={[garage.lat, garage.lng]}
              eventHandlers={{
                click: () => handleSelectGarage(garage),
              }}
            >
              <Popup>
                <div>
                  <strong>{garage.name}</strong>
                  <br />
                  Distance: {garage.distance}
                  <br />
                  Time: {garage.time}
                  <br />
                  Workload: {garage.workload}
                  <br />
                  Free Technicians: {garage.freeTechs.length}
                  <br />
                  <button
                    onClick={() => handleSelectGarage(garage)}
                    style={{
                      marginTop: "8px",
                      padding: "6px 10px",
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div
          className={`fixed bottom-0 left-0 w-full h-[78vh] md:h-full md:absolute md:top-0 md:right-0 md:left-auto md:w-[400px] bg-[#040713] border-t md:border-t-0 md:border-l border-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto z-30 shadow-2xl ${
            selectedGarage
              ? "translate-y-0 md:translate-x-0 opacity-100"
              : "translate-y-full md:translate-x-full md:translate-y-0 opacity-0 pointer-events-none"
          }`}
        >
          {selectedGarage && (
            <div className="p-5 md:p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-5">
                  <h2 className="text-lg md:text-base font-black text-white uppercase tracking-widest break-words">
                    {selectedGarage.name}
                  </h2>

                  <button
                    onClick={handleCloseDetails}
                    className="text-slate-500 hover:text-white p-1.5 md:p-1 border border-slate-800 rounded cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/50 border border-slate-900 p-4 md:p-3 rounded-sm text-base md:text-xs mb-4">
                  <span className="block font-bold text-cyan-400 tracking-wider text-sm md:text-[9px] uppercase mb-1.5">
                    Node Specialization
                  </span>
                  <span className="block text-slate-200 font-bold">
                    {selectedGarage.specialization}
                  </span>
                  <span className="block text-slate-400 font-sans mt-1">
                    {selectedGarage.specDesc}
                  </span>
                </div>

                <div className="bg-[#091124]/40 border border-slate-900 p-4 md:p-3 rounded-sm text-base md:text-xs mb-4">
                  <span className="font-bold text-slate-400 tracking-wider text-sm md:text-[9px] uppercase mb-2.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 md:w-3 md:h-3 text-slate-500 shrink-0" />
                    Available Specialists ({selectedGarage.freeTechs.length})
                  </span>

                  {selectedGarage.freeTechs.length === 0 ? (
                    <div className="text-slate-500 italic text-sm md:text-[11px] py-1">
                      No technicians free right now. Queueing active.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 md:gap-2 max-h-40 md:max-h-32 overflow-y-auto pr-1">
                      {selectedGarage.freeTechs.map((tech, idx) => (
                        <div
                          key={idx}
                          className="border-b border-slate-900 pb-2 md:pb-1.5 last:border-0 last:pb-0"
                        >
                          <div className="text-slate-200 font-bold text-sm md:text-[11px]">
                            {tech.name}
                          </div>
                          <div className="text-slate-500 text-sm md:text-[10px] font-sans">
                            {tech.expert}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-b border-slate-900/60 my-4 py-4 md:py-3 flex flex-col gap-3 md:gap-2 text-base md:text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-wider font-bold text-sm md:text-[10px]">
                      <Clock className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      Response Window
                    </span>
                    <span className="font-bold text-white text-right">
                      {selectedGarage.time}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-wider font-bold text-sm md:text-[10px]">
                      <MapPin className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      Distance
                    </span>
                    <span className="font-bold text-slate-300 text-right">
                      {selectedGarage.distance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-900/60 bg-[#040713]">
                {isRequested ? (
                  <div className="w-full py-3.5 md:py-3 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm text-center">
                    Request Confirmed
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full py-3.5 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm cursor-pointer transition-all"
                  >
                    Request
                  </button>
                )}

                <button
                  onClick={handleCloseDetails}
                  className="w-full py-3 md:py-2.5 bg-transparent border border-slate-900 text-slate-400 hover:text-red-400 font-bold tracking-widest text-sm md:text-xs uppercase rounded-sm cursor-pointer text-center"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>

        {showRequestForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
            <div className="w-full max-w-md bg-[#0b1120] border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_35px_rgba(79,70,229,0.25)]">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-white text-lg font-black uppercase tracking-widest">
                    Customer Request
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Fill customer vehicle details
                  </p>
                </div>

                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-slate-400 hover:text-white border border-slate-700 rounded p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={requestData.customerName}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      customerName: e.target.value,
                    })
                  }
                  className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <input
                  type="text"
                  placeholder="Enter contact number"
                  value={requestData.contact}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      contact: e.target.value,
                    })
                  }
                  className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <input
                  type="text"
                  placeholder="Example: WP CAS 1234"
                  value={requestData.vehicleNumber}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      vehicleNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <select
                  value={requestData.vehicleType}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      vehicleType: e.target.value,
                    })
                  }
                  className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white outline-none"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Motor Bike">Motor Bike</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  onClick={handleSubmitRequest}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase tracking-widest text-sm transition-all"
                >
                  Send Request
                </button>

                <button
                  onClick={() => setShowRequestForm(false)}
                  className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-red-400 rounded-lg font-bold uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
            <div className="w-full max-w-md bg-[#0b1120] border border-emerald-500/40 rounded-xl p-6 text-center shadow-[0_0_35px_rgba(16,185,129,0.25)]">
              <h2 className="text-emerald-400 text-xl font-black uppercase tracking-widest mb-3">
                Request Submitted
              </h2>

              <p className="text-slate-300 text-sm mb-6">
                Your request has been submitted successfully. Go to Navigation
                Hub to view the route.
              </p>

              <button
                onClick={() => {
                  setShowSuccessMessage(false);
                  onNavigate("navigation-hub");
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase tracking-widest text-sm"
              >
                Go to Navigation Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}