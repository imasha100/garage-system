import React, { useEffect, useState } from "react";
import { Bell, User, Menu, X, Truck, MapPin, Clock, Phone } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import L from "leaflet";

import CustomerSidebar from "./CustomerSidebar";
import MobilityRecovery from "./MobilityRecovery";
import TrackMyTowTruck from "./TrackMyTowTruck";
import LiveProgress from "./LiveProgress";
import InvoiceLedger from "./InvoiceLedger";
import ExperienceAudit from "./ExperienceAudit";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function RoutingMachine({
  customerLocation,
  garageLocation,
  isAutoPilot,
  setMovingPosition,
  setProgress,
  setIsAutoPilot,
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !customerLocation || !garageLocation) return;

    let routeCoordinates = [];

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(customerLocation[0], customerLocation[1]),
        L.latLng(garageLocation[0], garageLocation[1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          {
            color: "#7c83ff",
            weight: 6,
            opacity: 0.9,
          },
        ],
      },
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
      routeCoordinates = e.routes[0].coordinates;

      window.currentRouteCoordinates = routeCoordinates;
    });

    return () => {
  try {
    if (map && routingControl) {
      map.removeControl(routingControl);
    }
  } catch (error) {
    console.warn(
      "Routing cleanup skipped:",
      error
    );
  }
};
  }, [map, customerLocation, garageLocation]);

  useEffect(() => {
    if (!isAutoPilot) return;

    const routeCoordinates = window.currentRouteCoordinates || [];

    if (routeCoordinates.length === 0) {
      setIsAutoPilot(false);
      return;
    }

    let index = 0;
    const total = routeCoordinates.length - 1;

    const interval = setInterval(() => {
      if (index >= routeCoordinates.length) {
        clearInterval(interval);
        setMovingPosition(garageLocation);
        setProgress(100);
        setIsAutoPilot(false);
        return;
      }

      const point = routeCoordinates[index];
      setMovingPosition([point.lat, point.lng]);

      const progressValue = Math.round((index / total) * 100);
      setProgress(progressValue);

      index += 1;
    }, 80);

    return () => clearInterval(interval);
  }, [isAutoPilot, garageLocation, setMovingPosition, setProgress, setIsAutoPilot]);

  return null;
}

function MapAutoCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.5 });
    }
  }, [position, map]);

  return null;
}

export default function NavigationHub({ onNavigate, selectedGarage }) {
  const [activeTab, setActiveTab] = useState("navigation");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTowRequest, setActiveTowRequest] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("currentCustomerRequest") || "null"
      );
    } catch {
      return null;
    }
  });
  const [isLoadingTowRequest, setIsLoadingTowRequest] =
    useState(false);
  const [towRequestError, setTowRequestError] = useState("");

  const savedRequest = JSON.parse(
  sessionStorage.getItem("latestServiceRequest") || "null"
);

const savedCustomerLatitude = Number(
  savedRequest?.customerLatitude
);

const savedCustomerLongitude = Number(
  savedRequest?.customerLongitude
);

const customerLocation =
  Number.isFinite(savedCustomerLatitude) &&
  Number.isFinite(savedCustomerLongitude)
    ? [
        savedCustomerLatitude,
        savedCustomerLongitude,
      ]
    : [6.8728, 79.8887];

  const garageLocation =
    selectedGarage?.lat && selectedGarage?.lng
      ? [selectedGarage.lat, selectedGarage.lng]
      : customerLocation;

  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [movingPosition, setMovingPosition] = useState(customerLocation);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMovingPosition(customerLocation);
    setProgress(0);
    setIsAutoPilot(false);
  }, [selectedGarage]);

  useEffect(() => {
    if (activeTab !== "track-tow") return undefined;

    const loadActiveTowRequest = async () => {
      try {
        setIsLoadingTowRequest(true);
        setTowRequestError("");

        const storedRequest = JSON.parse(
          localStorage.getItem("currentCustomerRequest") || "null"
        );

        const restoredDispatch = JSON.parse(
          sessionStorage.getItem("latestTowDispatch") || "null"
        );

        const dispatchId = Number(
          restoredDispatch?.dispatchId ||
            restoredDispatch?.dispatch_id ||
            storedRequest?.dispatchId
        );

        if (!Number.isInteger(dispatchId) || dispatchId <= 0) {
          setActiveTowRequest(null);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/tow-dispatches/${dispatchId}`
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.dispatch) {
          throw new Error(
            result.message || "Unable to load your tow truck request."
          );
        }

        const updatedRequest = {
          ...(storedRequest || {}),
          ...(restoredDispatch || {}),
          dispatchId,
          dispatchStatus: result.dispatch.dispatchStatus,
          estimatedArrivalTime:
            result.dispatch.estimatedArrivalTime ||
            storedRequest?.estimatedArrivalTime,
          selectedTruck: {
            ...(storedRequest?.selectedTruck || {}),
            number:
              result.dispatch.truckNumber ||
              storedRequest?.selectedTruck?.number,
            driverName:
              result.dispatch.driverName ||
              storedRequest?.selectedTruck?.driverName,
            phone:
              result.dispatch.driverContact ||
              storedRequest?.selectedTruck?.phone,
            latitude:
              result.dispatch.truckLatitude ??
              storedRequest?.selectedTruck?.latitude,
            longitude:
              result.dispatch.truckLongitude ??
              storedRequest?.selectedTruck?.longitude,
          },
        };

        localStorage.setItem(
          "currentCustomerRequest",
          JSON.stringify(updatedRequest)
        );

        setActiveTowRequest(updatedRequest);
      } catch (error) {
        console.error("Load active tow request error:", error);
        setTowRequestError(
          error.message || "Unable to load your tow truck request."
        );
      } finally {
        setIsLoadingTowRequest(false);
      }
    };

    loadActiveTowRequest();

    const intervalId = window.setInterval(
      loadActiveTowRequest,
      5000
    );

    return () => window.clearInterval(intervalId);
  }, [activeTab]);

  if (!selectedGarage) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#070814] text-white font-mono flex-col gap-5">
        <div className="text-center p-8 bg-[#0c0d19] border border-slate-800 rounded-lg shadow-xl">
          <h2 className="text-3xl font-black text-slate-300">
            NO MISSION ACTIVE
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            Please select a service hub from the map.
          </p>

          <button
            onClick={() => onNavigate("garage-map")}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase text-xs"
          >
            Return to Fleet Map
          </button>
        </div>
      </div>
    );
  }

  const formatValue = (value) => (value ? value.split(" ")[0] : "--");

  return (
    <div className="w-screen h-screen bg-[#070814] text-slate-200 font-mono flex overflow-hidden">
      <div className="hidden md:block">
        <CustomerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNavigate={onNavigate}
        />
      </div>

      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-700 rounded z-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <CustomerSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-slate-900 bg-[#0c0d19]/60 backdrop-blur px-4 flex items-center shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 border border-slate-700 rounded"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <div className="ml-auto flex items-center gap-5">
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">
                  {savedRequest?.customerName || "Customer"}
                </p>
                <p className="text-[10px] text-purple-400 uppercase tracking-widest">
                  User
                </p>
              </div>

              <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === "navigation" && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
                {selectedGarage.name} - LOGISTICS SYNC
              </h1>

              <p className="text-sm text-slate-400 mb-6">
  Vehicle :
  <span className="ml-2 font-bold text-cyan-400">
    {savedRequest?.vehicleNumber || "-"}
  </span>
</p>

<p className="text-sm text-slate-400 mb-6">
  Ticket No :
  <span className="ml-2 font-bold text-emerald-400">
    {savedRequest?.ticketNumber || "-"}
  </span>
</p>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[450px] bg-black border border-slate-800 rounded overflow-hidden relative">
                  <MapContainer
                    center={customerLocation}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="w-full h-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={customerLocation}>
                      <Popup>Customer Current Location</Popup>
                    </Marker>

                    <Marker position={garageLocation}>
                      <Popup>{selectedGarage.name}</Popup>
                    </Marker>

                    <Marker position={movingPosition} icon={carIcon}>
                      <Popup>
                        {progress >= 100
                          ? "Arrived at Garage"
                          : "Vehicle Moving on Road Route"}
                      </Popup>
                    </Marker>

                    <RoutingMachine
                      customerLocation={customerLocation}
                      garageLocation={garageLocation}
                      isAutoPilot={isAutoPilot}
                      setMovingPosition={setMovingPosition}
                      setProgress={setProgress}
                      setIsAutoPilot={setIsAutoPilot}
                    />

                    <MapAutoCenter position={movingPosition} />
                  </MapContainer>

                  <div className="absolute top-4 left-4 z-[999] bg-black/70 border border-slate-700 text-white px-4 py-2 rounded text-xs font-bold">
                    {isAutoPilot
                      ? "MOVING ON ROAD ROUTE"
                      : progress >= 100
                      ? "ARRIVED AT GARAGE"
                      : "GPS Navigation Ready"}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-[999] bg-black/75 border border-slate-700 p-3 rounded">
                    <div className="flex justify-between text-xs text-slate-300 mb-2">
                      <span>Route Progress</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0c0d19] border border-slate-800 p-6 rounded">
                  <h2 className="text-white font-bold mb-4">
                    MISSION METRICS
                  </h2>

                  <p className="text-purple-400 text-sm mb-6">
                    Active Node: {selectedGarage.id}
                  </p>

                  <div className="space-y-6 text-white">
                    <div>
                      <p className="text-xs text-slate-400">ETA</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage.time)} MINS
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">DISTANCE</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage.distance)} KM
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">STATUS</p>
                      <p className="text-lg font-black text-emerald-400">
                        {progress >= 100
                          ? "ARRIVED"
                          : isAutoPilot
                          ? "MOVING"
                          : "READY"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProgress(0);
                      setMovingPosition(customerLocation);
                      setIsAutoPilot(true);
                    }}
                    disabled={isAutoPilot}
                    className={`w-full mt-6 py-3 rounded font-bold ${
                      isAutoPilot
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                    }`}
                  >
                    {isAutoPilot ? "NAVIGATING.." : "START NAVIGATION"}
                  </button>

                  <button
                    onClick={() => {
                      setIsAutoPilot(false);
                      setProgress(0);
                      setMovingPosition(customerLocation);
                    }}
                    className="w-full mt-3 border border-slate-600 cursor-pointer text-slate-300 py-3 rounded font-bold hover:bg-slate-800"
                  >
                    RESET ROUTE
                  </button>

                  <button
                    onClick={() => onNavigate("garage-map")}
                    className="w-full mt-3 border border-slate-600 cursor-pointer text-slate-300 py-3 rounded font-bold hover:bg-slate-800"
                  >
                    SELECT ANOTHER GARAGE
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mobility" && (
  <MobilityRecovery
    onNavigate={onNavigate}
    setActiveTab={setActiveTab}
  />
)}
          {activeTab === "track-tow" && (
            <TrackMyTowTruck onNavigate={onNavigate} />
          )}

          {activeTab === "progress" && (
            <LiveProgress setActiveTab={setActiveTab} />
          )}
          {activeTab === "invoice" && <InvoiceLedger />}
          {activeTab === "audit" && <ExperienceAudit />}
        </div>
      </div>
    </div>
  );
}