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
  onArrivedAtGarage,
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

        if (onArrivedAtGarage) {
          onArrivedAtGarage();
        }

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
  const [activeTab, setActiveTab] = useState(() => {
    const resumeTab =
      sessionStorage.getItem(
        "customerResumeTab"
      );

    if (
      resumeTab ===
        "arrived-at-garage" ||
      resumeTab ===
        "progress" ||
      resumeTab ===
        "track-tow" ||
      resumeTab ===
        "mobility" ||
      resumeTab ===
        "invoice" ||
      resumeTab ===
        "audit"
    ) {
      return resumeTab;
    }

    return "navigation";
  });
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

  const latestCompletedJob = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "latestCompletedJob"
        ) || "null"
      );
    } catch {
      return null;
    }
  })();

  const savedResumeTab =
    sessionStorage.getItem(
      "customerResumeTab"
    );

  const isFinalCustomerFlow =
    Boolean(latestCompletedJob) ||
    activeTab === "progress" ||
    activeTab === "invoice" ||
    activeTab === "audit" ||
    savedResumeTab === "progress" ||
    savedResumeTab === "invoice" ||
    savedResumeTab === "audit";

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
  const [isSavingArrival, setIsSavingArrival] = useState(false);
  const [arrivalSaved, setArrivalSaved] = useState(
    String(savedRequest?.customerStage || "")
      .trim()
      .toUpperCase() === "ARRIVED_AT_GARAGE"
  );
  const [arrivalError, setArrivalError] = useState("");

  const handleCustomerTabChange = (
    nextTab
  ) => {
    // After the customer has reached the garage,
    // the road-navigation step must not be repeated.
    if (
      arrivalSaved &&
      nextTab === "navigation"
    ) {
      return;
    }

    // Once the customer is in the final service flow,
    // do not send them back to map/navigation pages.
    // Keep access to Live Progress, Invoice and Feedback
    // until the customer finishes the final flow or logs out.
    if (
      isFinalCustomerFlow &&
      (
        nextTab === "navigation" ||
        nextTab === "mobility" ||
        nextTab === "track-tow"
      )
    ) {
      return;
    }

    sessionStorage.setItem(
      "customerResumeTab",
      nextTab
    );

    setActiveTab(nextTab);
  };

  const markArrivedAtGarage = async () => {
    if (arrivalSaved || isSavingArrival) {
      return;
    }

    const requestId = Number(
      savedRequest?.requestId ||
        savedRequest?.request_id
    );

    if (!Number.isInteger(requestId) || requestId <= 0) {
      console.error(
        "Unable to mark arrival: valid service request ID was not found."
      );
      setArrivalError(
        "Unable to save garage arrival because the service request ID is missing."
      );
      return;
    }

    try {
      setIsSavingArrival(true);
      setArrivalError("");

      const response = await fetch(
        `http://localhost:5000/api/service-requests/${requestId}/customer-stage`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stage: "ARRIVED_AT_GARAGE",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save garage arrival."
        );
      }

      const updatedRequest = {
        ...(savedRequest || {}),
        customerStage: "ARRIVED_AT_GARAGE",
      };

      sessionStorage.setItem(
        "latestServiceRequest",
        JSON.stringify(updatedRequest)
      );

      const storedCurrentRequest = JSON.parse(
        localStorage.getItem("currentCustomerRequest") ||
          "null"
      );

      if (storedCurrentRequest) {
        localStorage.setItem(
          "currentCustomerRequest",
          JSON.stringify({
            ...storedCurrentRequest,
            customerStage: "ARRIVED_AT_GARAGE",
          })
        );
      }

      sessionStorage.setItem(
        "customerFlowStage",
        "arrived-at-garage"
      );

      sessionStorage.setItem(
        "customerResumeTab",
        "arrived-at-garage"
      );

      setArrivalSaved(true);
      setActiveTab(
        "arrived-at-garage"
      );
    } catch (error) {
      console.error(
        "Mark arrived at garage error:",
        error
      );

      setArrivalError(
        error.message ||
          "Unable to save garage arrival."
      );
    } finally {
      setIsSavingArrival(false);
    }
  };

  useEffect(() => {
    setMovingPosition(customerLocation);
    setProgress(0);
    setIsAutoPilot(false);
    setArrivalError("");

    setArrivalSaved(
      String(savedRequest?.customerStage || "")
        .trim()
        .toUpperCase() === "ARRIVED_AT_GARAGE"
    );
  }, [selectedGarage]);

  // ======================================================
  // WAITING AT GARAGE -> WATCH FOR TECHNICIAN ASSIGNMENT
  // ======================================================

  useEffect(() => {
    if (
      activeTab !==
      "arrived-at-garage"
    ) {
      return undefined;
    }

    const contactNumber = String(
      savedRequest?.customerContact ||
        savedRequest?.contact ||
        ""
    )
      .trim()
      .replace(/\s+/g, "");

    const vehicleNumber = String(
      savedRequest?.vehicleNumber ||
        ""
    )
      .trim()
      .toUpperCase();

    if (
      !contactNumber ||
      !vehicleNumber
    ) {
      return undefined;
    }

    let isMounted = true;

    const checkTechnicianAssignment =
      async () => {
        try {
          const response =
            await fetch(
              `http://localhost:5000/api/service-requests/customer/${encodeURIComponent(
                contactNumber
              )}/latest?vehicleNumber=${encodeURIComponent(
                vehicleNumber
              )}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success ||
            !result.request ||
            !isMounted
          ) {
            return;
          }

          const jobStatus = String(
            result.jobStatus || ""
          )
            .trim()
            .toUpperCase();

          if (
            jobStatus === "ASSIGNED" ||
            jobStatus === "IN_PROGRESS"
          ) {
            const updatedRequest = {
              ...savedRequest,
              ...result.request,
              jobId:
                result.jobId ||
                null,
              jobStatus:
                result.jobStatus ||
                null,
              customerStage:
                result.customerStage ||
                "ARRIVED_AT_GARAGE",
              resumeStage:
                "live-progress",
            };

            sessionStorage.setItem(
              "latestServiceRequest",
              JSON.stringify(
                updatedRequest
              )
            );

            sessionStorage.setItem(
              "customerResumeTab",
              "progress"
            );

            sessionStorage.setItem(
              "customerFlowStage",
              "progress"
            );

            setActiveTab(
              "progress"
            );
          }
        } catch (error) {
          console.error(
            "Technician assignment check error:",
            error
          );
        }
      };

    checkTechnicianAssignment();

    const intervalId =
      window.setInterval(
        checkTechnicianAssignment,
        5000
      );

    return () => {
      isMounted = false;
      window.clearInterval(
        intervalId
      );
    };
  }, [activeTab]);

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

  const canContinueWithoutSelectedGarage =
    activeTab === "progress" ||
    activeTab === "invoice" ||
    activeTab === "audit" ||
    isFinalCustomerFlow;

  if (
    !selectedGarage &&
    !canContinueWithoutSelectedGarage
  ) {
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
          setActiveTab={handleCustomerTabChange}
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
              handleCustomerTabChange(
                tab
              );
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
                {selectedGarage?.name || savedRequest?.garageName || "Selected Garage"} - LOGISTICS SYNC
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
                      onArrivedAtGarage={markArrivedAtGarage}
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
                    Active Node: {selectedGarage?.id || savedRequest?.garageId || "-"}
                  </p>

                  <div className="space-y-6 text-white">
                    <div>
                      <p className="text-xs text-slate-400">ETA</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage?.time)} MINS
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">DISTANCE</p>
                      <p className="text-3xl font-black">
                        {formatValue(selectedGarage?.distance)} KM
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
                    disabled={
                      isAutoPilot ||
                      arrivalSaved ||
                      isSavingArrival
                    }
                    className={`w-full mt-6 py-3 rounded font-bold ${
                      isAutoPilot ||
                      arrivalSaved ||
                      isSavingArrival
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                    }`}
                  >
                    {isSavingArrival
                      ? "SAVING ARRIVAL..."
                      : arrivalSaved
                      ? "ARRIVED - WAITING FOR TECHNICIAN"
                      : isAutoPilot
                      ? "NAVIGATING.."
                      : "START NAVIGATION"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsAutoPilot(false);
                      setMovingPosition(
                        garageLocation
                      );
                      setProgress(100);

                      await markArrivedAtGarage();
                    }}
                    disabled={
                      arrivalSaved ||
                      isSavingArrival
                    }
                    className={`w-full mt-3 py-3 rounded font-bold border ${
                      arrivalSaved ||
                      isSavingArrival
                        ? "border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                    }`}
                  >
                    {isSavingArrival
                      ? "SAVING ARRIVAL..."
                      : arrivalSaved
                      ? "ARRIVAL CONFIRMED"
                      : "SIMULATE ARRIVAL"}
                  </button>

                  <button
                    onClick={() => {
                      setIsAutoPilot(false);
                      setProgress(0);
                      setMovingPosition(customerLocation);
                    }}
                    disabled={arrivalSaved || isSavingArrival}
                    className={`w-full mt-3 border border-slate-600 py-3 rounded font-bold ${
                      arrivalSaved || isSavingArrival
                        ? "text-slate-600 cursor-not-allowed"
                        : "cursor-pointer text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    RESET ROUTE
                  </button>

                  <button
                    onClick={() => onNavigate("garage-map")}
                    disabled={arrivalSaved || isSavingArrival}
                    className={`w-full mt-3 border border-slate-600 py-3 rounded font-bold ${
                      arrivalSaved || isSavingArrival
                        ? "text-slate-600 cursor-not-allowed"
                        : "cursor-pointer text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    SELECT ANOTHER GARAGE
                  </button>

                  {arrivalSaved && (
                    <div className="mt-4 border border-emerald-500/30 bg-emerald-500/10 rounded p-3">
                      <p className="text-xs font-bold text-emerald-400">
                        ARRIVAL CONFIRMED
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        You have arrived at the garage. Please wait while the assistance officer assigns a technician.
                      </p>
                    </div>
                  )}

                  {arrivalError && (
                    <div className="mt-4 border border-red-500/30 bg-red-500/10 rounded p-3">
                      <p className="text-xs text-red-400">
                        {arrivalError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab ===
            "arrived-at-garage" && (
            <div className="max-w-3xl mx-auto min-h-[65vh] flex items-center justify-center">
              <div className="w-full rounded-xl border border-emerald-500/30 bg-[#0c0d19] p-6 md:p-10 text-center shadow-[0_0_35px_rgba(16,185,129,0.12)]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <MapPin className="h-8 w-8 text-emerald-400" />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                  Arrival Confirmed
                </p>

                <h1 className="mt-3 text-2xl md:text-3xl font-black uppercase tracking-wide text-white">
                  Arrived at Garage
                </h1>

                <p className="mt-4 text-sm md:text-base leading-7 text-slate-400">
                  Your vehicle has reached{" "}
                  <span className="font-bold text-white">
                    {selectedGarage?.name ||
                      savedRequest?.garageName ||
                      "the selected garage"}
                  </span>
                  . Please wait while the assistance officer assigns a technician.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2 text-left">
                  <div className="rounded-lg border border-slate-800 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Vehicle
                    </p>
                    <p className="mt-1 font-bold text-cyan-300">
                      {savedRequest?.vehicleNumber ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Ticket Number
                    </p>
                    <p className="mt-1 font-bold text-emerald-300">
                      {savedRequest?.ticketNumber ||
                        "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                    Waiting for Technician Assignment
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    This page checks automatically. Once a technician is assigned or starts the repair, you will be moved to Live Progress.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mobility" && (
  <MobilityRecovery
    onNavigate={onNavigate}
    setActiveTab={handleCustomerTabChange}
  />
)}
          {activeTab === "track-tow" && (
            <TrackMyTowTruck onNavigate={onNavigate} />
          )}

          {activeTab === "progress" && (
            <LiveProgress
              setActiveTab={
                handleCustomerTabChange
              }
            />
          )}
          {activeTab === "invoice" && <InvoiceLedger />}
          {activeTab === "audit" && <ExperienceAudit />}
        </div>
      </div>
    </div>
  );
}