import React, { useState } from "react";
import { Search, Bell, HelpCircle, MapPin, Truck } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
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

const IncidentDispatch = ({ onBack }) => {
  const [selectedName, setSelectedName] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const saegisLocation = [6.8728, 79.8887];

  const requests = [
    {
      name: "Amila Perera",
      vehicle: "BMW i3",
      loc: "Colombo 07",
      lat: 6.9108,
      lng: 79.8668,
    },
    {
      name: "Sunil Shantha",
      vehicle: "Toyota Aqua",
      loc: "Nugegoda",
      lat: 6.8729,
      lng: 79.8996,
    },
  ];

  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRequest =
    filteredRequests.find((req) => req.name === selectedName) || null;

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c10] text-gray-300 font-sans p-3 sm:p-4 md:p-8 overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Incident Dispatch
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Current hub location: Saegis Campus
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[340px]">
            <Search className="absolute left-3 top-3 text-slate-600" size={16} />
            <input
              type="text"
              placeholder="Search customer or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1218] border border-slate-800 py-3 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <Bell size={18} className="text-slate-400 hidden md:block shrink-0" />
          <HelpCircle
            size={18}
            className="text-slate-400 hidden md:block shrink-0"
          />
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-5 md:gap-8">
        <div className="w-full xl:w-1/3 p-4 md:p-6 bg-[#0f1218] border border-red-900/30 rounded-xl overflow-y-auto max-h-[45vh] xl:max-h-[70vh]">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <h2 className="text-red-500 text-[10px] md:text-xs font-black tracking-[0.2em] flex items-center gap-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              EMERGENCY QUEUE
            </h2>

            <span className="text-[10px] md:text-xs bg-red-900/20 text-red-500 px-3 py-1 rounded font-bold">
              {filteredRequests.length} ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            {filteredRequests.map((req, index) => (
              <div
                key={index}
                onClick={() => setSelectedName(req.name)}
                className={`group cursor-pointer p-4 md:p-6 rounded-lg border transition-all duration-300 ${
                  selectedName === req.name
                    ? "bg-[#1a1f29] border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.25)]"
                    : "bg-[#161a22] border-red-900/20 hover:border-green-500/50"
                }`}
              >
                <h3 className="text-white text-lg md:text-xl font-bold">
                  {req.name}
                </h3>

                <p className="text-sm text-gray-400 mt-2">
                  Vehicle:{" "}
                  <span className="text-gray-200 font-mono">
                    {req.vehicle}
                  </span>
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Location: <span className="text-gray-200">{req.loc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full min-w-0">
          <h2 className="text-xs md:text-sm font-bold tracking-widest mb-4">
            LIVE DISPATCH MAP
          </h2>

          <div className="relative bg-[#10141c] h-[320px] sm:h-[380px] md:h-[420px] border border-gray-800 rounded-xl overflow-hidden">
            <MapContainer
              center={saegisLocation}
              zoom={12}
              scrollWheelZoom={true}
              className="w-full h-full z-0"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <CircleMarker
                center={saegisLocation}
                radius={11}
                pathOptions={{
                  color: "#22c55e",
                  fillColor: "#22c55e",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <strong>Saegis Campus</strong>
                  <br />
                  Dispatch Hub Location
                </Popup>
              </CircleMarker>

              {filteredRequests.map((req, index) => (
                <Marker
                  key={index}
                  position={[req.lat, req.lng]}
                  eventHandlers={{
                    click: () => setSelectedName(req.name),
                  }}
                >
                  <Popup>
                    <strong>{req.name}</strong>
                    <br />
                    Vehicle: {req.vehicle}
                    <br />
                    Location: {req.loc}
                  </Popup>
                </Marker>
              ))}

              {selectedRequest && (
                <Polyline
                  positions={[
                    saegisLocation,
                    [selectedRequest.lat, selectedRequest.lng],
                  ]}
                  pathOptions={{
                    color: "#52f0ac",
                    weight: 5,
                    dashArray: "10 8",
                  }}
                />
              )}
            </MapContainer>

            <div className="absolute top-3 left-3 z-[999] bg-black/70 border border-slate-700 text-white px-3 md:px-4 py-2 rounded text-[10px] md:text-xs font-bold max-w-[85%]">
              <MapPin size={14} className="inline mr-2 text-green-400" />
              Saegis Campus Dispatch Hub
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-5 md:mt-6">
            <select className="w-full bg-[#0f1218] border border-gray-700 p-3 md:p-4 rounded-lg text-sm md:text-base text-white">
              <option>Assign Truck</option>
              <option>TRK-8842 - Kohuwala Auto Care</option>
              <option>TRK-5521 - Kohuwala Auto Care</option>
              <option>TRK-9920 - Nugegoda Service Hub</option>
            </select>

            <select className="w-full bg-[#0f1218] border border-gray-700 p-3 md:p-4 rounded-lg text-sm md:text-base text-white">
              <option>Assign Tech</option>
              <option>Ayesh Maroc</option>
              <option>Kasun Perera</option>
              <option>Nuwan Silva</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8 md:mt-10 pb-6">
        <button className="w-full md:w-96 py-4 md:py-5 cursor-pointer rounded-lg bg-[#52f0ac] text-black text-base md:text-lg font-bold hover:bg-[#42d996] transition-all flex items-center justify-center gap-2">
          <Truck size={20} />
          DISPATCH SELECTED RESOURCE
        </button>
      </div>
    </div>
  );
};

export default IncidentDispatch;