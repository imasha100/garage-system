import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Rocket,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
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

const createTruckIcon = (backgroundColor) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:38px;height:38px;border-radius:9999px;
        display:flex;align-items:center;justify-content:center;
        background:${backgroundColor};border:3px solid #fff;
        box-shadow:0 4px 14px rgba(0,0,0,.45);font-size:20px;
      ">🚚</div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });

const internalTruckIcon = createTruckIcon("#0891b2");
const externalTruckIcon = createTruckIcon("#e11d48");

const safeJsonParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const formatArrivalTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const finiteNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const normaliseStatus = (value) =>
  String(value || "").trim().toLowerCase() === "external"
    ? "External"
    : "Internal";

const parseDistance = (value) => {
  const distance = Number.parseFloat(String(value || ""));
  return Number.isFinite(distance) ? distance : 0;
};

const haversineDistanceKm = (from, to) => {
  if (!from || !to) return 0;

  const [lat1, lng1] = from;
  const [lat2, lng2] = to;

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return 0;

  const radius = 6371;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MobilityRecovery({
  onNavigate,
  setActiveTab,
}) {
  const [vehicleStatus, setVehicleStatus] = useState("driveable");
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(0);
  const [parkedTrucks, setParkedTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);
  const [truckError, setTruckError] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noticeView, setNoticeView] = useState("summary");
  const [routeRefreshKey, setRouteRefreshKey] = useState(0);

  const [activeDispatchId, setActiveDispatchId] = useState(() => {
    const currentRequest = safeJsonParse(
      localStorage.getItem("currentCustomerRequest"),
      {}
    );

    const dispatchId = Number(currentRequest?.dispatchId);

    return Number.isInteger(dispatchId) && dispatchId > 0
      ? dispatchId
      : null;
  });

  const savedRequest = useMemo(
    () =>
      safeJsonParse(
        sessionStorage.getItem("latestServiceRequest"),
        {}
      ),
    []
  );

  const storedGarage = useMemo(
    () =>
      safeJsonParse(
        sessionStorage.getItem("selectedGarage"),
        {}
      ),
    []
  );

  const customerLocation = useMemo(() => {
    const latitude = finiteNumber(
      savedRequest?.customerLatitude,
      savedRequest?.latitude
    );
    const longitude = finiteNumber(
      savedRequest?.customerLongitude,
      savedRequest?.longitude
    );

    return latitude !== null && longitude !== null
      ? [latitude, longitude]
      : [6.8728, 79.8887];
  }, [savedRequest]);

  const selectedGarage = useMemo(() => {
    const id = finiteNumber(
      storedGarage?.id,
      storedGarage?.garageId,
      savedRequest?.garageId
    );

    return {
      id,
      garageId: id,
      name:
        storedGarage?.name ||
        storedGarage?.garageName ||
        savedRequest?.garageName ||
        "Selected Garage",
      address:
        storedGarage?.address ||
        savedRequest?.garageAddress ||
        "",
      contact:
        storedGarage?.contact ||
        savedRequest?.garageContact ||
        "",
      lat: finiteNumber(
        storedGarage?.lat,
        storedGarage?.latitude,
        savedRequest?.garageLatitude
      ),
      lng: finiteNumber(
        storedGarage?.lng,
        storedGarage?.longitude,
        savedRequest?.garageLongitude
      ),
      distance:
        storedGarage?.distance ||
        savedRequest?.estimatedDistance ||
        "",
      time:
        storedGarage?.time ||
        savedRequest?.estimatedTime ||
        "",
    };
  }, [savedRequest, storedGarage]);

  const garageLocation = useMemo(() => {
    return Number.isFinite(selectedGarage.lat) &&
      Number.isFinite(selectedGarage.lng)
      ? [selectedGarage.lat, selectedGarage.lng]
      : null;
  }, [selectedGarage]);

  const normaliseTruck = (truck) => {
    const latitude = finiteNumber(
      truck?.latitude,
      truck?.lat,
      selectedGarage.lat
    );
    const longitude = finiteNumber(
      truck?.longitude,
      truck?.lng,
      selectedGarage.lng
    );

    const truckLocation =
      latitude !== null && longitude !== null
        ? [latitude, longitude]
        : garageLocation;

    const distanceKm =
      haversineDistanceKm(truckLocation, customerLocation) ||
      parseDistance(selectedGarage.distance);

    return {
      id: truck?.truckId ?? truck?.id,
      number:
        truck?.truckNumber ||
        truck?.plateNumber ||
        truck?.number ||
        "Unknown",
      truckType: truck?.truckType || "",
      truckModel: truck?.truckModel || "",
      capacity: truck?.capacity ?? "",
      status: normaliseStatus(truck?.truckStatus),
      garageId: truck?.garageId ?? selectedGarage.id,
      latitude,
      longitude,
      driverId: truck?.driverId ?? truck?.driver_id ?? null,
      driverName: truck?.driverName || "Driver not assigned",
      phone: truck?.driverContact || truck?.phone || "",
      licenseNumber: truck?.licenseNumber || "",
      distanceKm,
      etaMins: Math.max(1, Math.round((distanceKm / 35) * 60)),
    };
  };

  const loadTrucks = async () => {
    const garageId = Number(selectedGarage.id);

    if (!Number.isInteger(garageId) || garageId <= 0) {
      setParkedTrucks([]);
      setTruckError("The selected garage ID is unavailable.");
      return;
    }

    try {
      setIsLoadingTrucks(true);
      setTruckError("");
      setSelectedTruck(null);

      const response = await fetch(
        `http://localhost:5000/api/trucks?garageId=${garageId}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load tow trucks.");
      }

      setParkedTrucks(
        Array.isArray(result.trucks)
          ? result.trucks.map(normaliseTruck)
          : []
      );
    } catch (error) {
      console.error("Load tow trucks error:", error);
      setParkedTrucks([]);
      setTruckError(error.message || "Unable to connect to the server.");
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  useEffect(() => {
    if (showPopup && vehicleStatus === "non-driveable") {
      loadTrucks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup, vehicleStatus]);

  useEffect(() => {
    if (notice) {
      setNoticeView("summary");
    }
  }, [notice?.title]);

  useEffect(() => {
    if (!activeDispatchId) return undefined;

    let isMounted = true;

    const checkTowTruckRequest = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tow-dispatches/${activeDispatchId}`
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.dispatch) {
          return;
        }

        const dispatch = result.dispatch;
        const dispatchStatus = String(
          dispatch.dispatchStatus || ""
        ).trim();

        const currentRequest = safeJsonParse(
          localStorage.getItem("currentCustomerRequest"),
          {}
        );

        const alreadyNotifiedStatus = String(
          currentRequest?.customerNotifiedStatus || ""
        ).trim();

        localStorage.setItem(
          "currentCustomerRequest",
          JSON.stringify({
            ...currentRequest,
            dispatchId: activeDispatchId,
            dispatchStatus,
            selectedTruck: {
              ...(currentRequest?.selectedTruck || {}),
              number:
                dispatch.truckNumber ||
                currentRequest?.selectedTruck?.number,
              driverName:
                dispatch.driverName ||
                currentRequest?.selectedTruck?.driverName,
              phone:
                dispatch.driverContact ||
                currentRequest?.selectedTruck?.phone,
            },
            estimatedArrivalTime:
              dispatch.estimatedArrivalTime ||
              currentRequest?.estimatedArrivalTime,
          })
        );

        if (!isMounted || !dispatchStatus) return;

        if (
          dispatchStatus === "Approved" &&
          alreadyNotifiedStatus !== "Approved"
        ) {
          const truckLatitude = finiteNumber(
            dispatch.truckLatitude,
            currentRequest?.selectedTruck?.latitude
          );

          const truckLongitude = finiteNumber(
            dispatch.truckLongitude,
            currentRequest?.selectedTruck?.longitude
          );

          const truckLocation =
            truckLatitude !== null && truckLongitude !== null
              ? [truckLatitude, truckLongitude]
              : null;

          const remainingDistanceKm = truckLocation
            ? haversineDistanceKm(
                truckLocation,
                customerLocation
              )
            : Number(
                currentRequest?.selectedTruck?.distanceKm || 0
              );

          const remainingEtaMinutes = Math.max(
            1,
            Math.round((remainingDistanceKm / 35) * 60)
          );

          setNotice({
            type: "success",
            title: "Tow Truck Assigned",
            message:
              "Your tow truck has been assigned. The route from the truck to your location is shown below.",
            details: [
              {
                label: "Truck",
                value: dispatch.truckNumber || "Assigned truck",
              },
              {
                label: "Driver",
                value: dispatch.driverName || "Assigned driver",
              },
              {
                label: "Driver Contact",
                value:
                  dispatch.driverContact ||
                  currentRequest?.selectedTruck?.phone ||
                  "Contact unavailable",
              },
              {
                label: "Distance",
                value: `${remainingDistanceKm.toFixed(1)} KM`,
              },
              {
                label: "Estimated Travel Time",
                value: `${remainingEtaMinutes} Minutes`,
              },
            ],
            tracking: truckLocation
              ? {
                  truckLocation,
                  customerLocation,
                  truckNumber:
                    dispatch.truckNumber || "Tow Truck",
                  driverName:
                    dispatch.driverName || "Assigned Driver",
                }
              : null,
          });

          localStorage.setItem(
            "currentCustomerRequest",
            JSON.stringify({
              ...safeJsonParse(
                localStorage.getItem("currentCustomerRequest"),
                {}
              ),
              customerNotifiedStatus: "Approved",
            })
          );
        }

        if (
          dispatchStatus === "Dispatched" &&
          alreadyNotifiedStatus !== "Dispatched"
        ) {
          const truckLatitude = finiteNumber(
            dispatch.truckLatitude,
            currentRequest?.selectedTruck?.latitude
          );

          const truckLongitude = finiteNumber(
            dispatch.truckLongitude,
            currentRequest?.selectedTruck?.longitude
          );

          const truckLocation =
            truckLatitude !== null && truckLongitude !== null
              ? [truckLatitude, truckLongitude]
              : null;

          const remainingDistanceKm = truckLocation
            ? haversineDistanceKm(
                truckLocation,
                customerLocation
              )
            : Number(
                currentRequest?.selectedTruck?.distanceKm || 0
              );

          const remainingEtaMinutes = Math.max(
            1,
            Math.round((remainingDistanceKm / 35) * 60)
          );

          setNotice({
            type: "success",
            title: "Tow Truck On The Way",
            message:
              "Your assigned tow truck is now travelling to your location.",
            details: [
              {
                label: "Truck",
                value: dispatch.truckNumber || "Assigned truck",
              },
              {
                label: "Driver",
                value: dispatch.driverName || "Assigned driver",
              },
              {
                label: "Driver Contact",
                value:
                  dispatch.driverContact ||
                  currentRequest?.selectedTruck?.phone ||
                  "Contact unavailable",
              },
              {
                label: "Distance",
                value: `${remainingDistanceKm.toFixed(1)} KM`,
              },
              {
                label: "Estimated Travel Time",
                value: `${remainingEtaMinutes} Minutes`,
              },
            ],
            tracking: truckLocation
              ? {
                  truckLocation,
                  customerLocation,
                  truckNumber:
                    dispatch.truckNumber || "Tow Truck",
                  driverName:
                    dispatch.driverName || "Assigned Driver",
                }
              : null,
          });

          localStorage.setItem(
            "currentCustomerRequest",
            JSON.stringify({
              ...safeJsonParse(
                localStorage.getItem("currentCustomerRequest"),
                {}
              ),
              customerNotifiedStatus: "Dispatched",
            })
          );
        }

        if (
          dispatchStatus === "Rejected" &&
          alreadyNotifiedStatus !== "Rejected"
        ) {
          setNotice({
            type: "error",
            title: "Tow Truck Unavailable",
            message:
              "The selected tow truck is currently unavailable. Please choose another available tow truck.",
            details: [],
          });

          localStorage.setItem(
            "currentCustomerRequest",
            JSON.stringify({
              ...safeJsonParse(
                localStorage.getItem("currentCustomerRequest"),
                {}
              ),
              customerNotifiedStatus: "Rejected",
            })
          );
        }
      } catch (error) {
        console.error("Check tow truck request status error:", error);
      }
    };

    checkTowTruckRequest();

    const intervalId = window.setInterval(
      checkTowTruckRequest,
      3000
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [activeDispatchId]);

  const internalTrucks = useMemo(
    () => parkedTrucks.filter((truck) => truck.status === "Internal"),
    [parkedTrucks]
  );

  const externalTrucks = useMemo(
    () => parkedTrucks.filter((truck) => truck.status === "External"),
    [parkedTrucks]
  );

  const calculateTowPrice = (distanceKm) => 3500 + distanceKm * 600;

  const formatLKR = (amount) =>
    `LKR ${Math.round(amount).toLocaleString("en-LK")}`;

  const getTowChargeByTruck = (truck) =>
    formatLKR(calculateTowPrice(Number(truck?.distanceKm || 0)));

  const getTruckDistanceText = (truck) =>
    truck
      ? `${truck.distanceKm.toFixed(1)} KM • ${truck.etaMins} Minutes`
      : "Distance N/A";

  const handleStart = () => {
    if (vehicleStatus === "driveable") {
      if (setActiveTab) setActiveTab("navigation");
      else if (onNavigate) onNavigate("navigation-hub");
      return;
    }

    setSelectedTruck(null);
    setStep(0);
    setShowPopup(true);
  };

  const handleDispatchTruck = async () => {
    if (!selectedTruck || isSubmittingRequest) return;

    try {
      setIsSubmittingRequest(true);

      const requestId = Number(savedRequest?.requestId);
      const truckId = Number(selectedTruck.id);
      const driverId = Number(selectedTruck.driverId);
      const garageId = Number(selectedGarage.id);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        throw new Error("The customer service request ID is unavailable.");
      }

      if (!Number.isInteger(truckId) || truckId <= 0) {
        throw new Error("The selected tow truck ID is unavailable.");
      }

      if (!Number.isInteger(driverId) || driverId <= 0) {
        throw new Error("The selected tow truck driver ID is unavailable.");
      }

      if (!Number.isInteger(garageId) || garageId <= 0) {
        throw new Error("The selected garage ID is unavailable.");
      }

      const towCharge = getTowChargeByTruck(selectedTruck);

      const requestBody = {
        requestId,
        truckId,
        driverId,
        garageId,
        pickupLocation: `Customer GPS: ${customerLocation[0]}, ${customerLocation[1]}`,
        customerLatitude: customerLocation[0],
        customerLongitude: customerLocation[1],
        estimatedArrivalTime: `${selectedTruck.etaMins} Minutes`,
      };

      const response = await fetch(
        "http://localhost:5000/api/tow-dispatches",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit the tow truck request."
        );
      }

      const currentRequest = safeJsonParse(
        localStorage.getItem("currentCustomerRequest"),
        {}
      );

      localStorage.setItem(
        "currentCustomerRequest",
        JSON.stringify({
          ...currentRequest,
          requestId,
          ticketNumber: savedRequest?.ticketNumber,
          vehicleStatus: "non-driveable",
          currentLocation: {
            latitude: customerLocation[0],
            longitude: customerLocation[1],
          },
          selectedGarage,
          selectedTruck: {
            ...selectedTruck,
            price: towCharge,
            status: "Requested",
          },
          dispatchId: result.dispatch?.dispatchId,
          dispatchStatus:
            result.dispatch?.dispatchStatus ||
            "Pending Verification",
          customerNotifiedStatus: "",
          towCharge,
          status: "Tow Truck Request Submitted",
        })
      );

      setShowPopup(false);
      setStep(0);
      setActiveDispatchId(result.dispatch?.dispatchId || null);

      setNotice({
        type: "success",
        title: "Request Received",
        message:
          "Your tow truck request has been received. Our assistance team is arranging help for you.",
        details: [
          {
            label: "Requested Truck",
            value: selectedTruck.number,
          },
          {
            label: "Estimated Charge",
            value: towCharge,
          },
        ],
      });
    } catch (error) {
      console.error("Submit tow truck request error:", error);
      setNotice({
        type: "error",
        title: "Request Could Not Be Sent",
        message:
          error.message ||
          "Unable to submit the tow truck request. Please try again.",
        details: [],
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const modalShellClass =
    "w-full max-w-6xl h-[92vh] md:h-[650px] bg-[#0c0d19] border border-slate-700 rounded-2xl flex flex-col md:flex-row overflow-hidden relative";
  const mapClass =
    "w-full md:flex-1 h-[42vh] md:h-full relative bg-[#070710] overflow-hidden";
  const sidePanelClass =
    "w-full md:w-[380px] h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-slate-700 bg-[#0c0d19] flex flex-col";

  const renderTruckMap = () => (
    <MapContainer
      center={customerLocation}
      zoom={13}
      scrollWheelZoom
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={customerLocation}
        radius={11}
        pathOptions={{
          color: "#a78bfa",
          fillColor: "#a78bfa",
          fillOpacity: 0.95,
        }}
      >
        <Popup>
          <strong>Customer Current Location</strong>
          <br />
          Latitude: {customerLocation[0].toFixed(6)}
          <br />
          Longitude: {customerLocation[1].toFixed(6)}
        </Popup>
      </CircleMarker>

      {garageLocation && (
        <Marker position={garageLocation}>
          <Popup>
            <strong>{selectedGarage.name}</strong>
            {selectedGarage.address && (
              <>
                <br />
                {selectedGarage.address}
              </>
            )}
            <br />
            Internal Trucks: {internalTrucks.length}
            <br />
            External Trucks: {externalTrucks.length}
          </Popup>
        </Marker>
      )}

      {parkedTrucks.map((truck, index) => {
        if (
          !Number.isFinite(truck.latitude) ||
          !Number.isFinite(truck.longitude)
        ) {
          return null;
        }

        const offset = (index % 4) * 0.00018;

        return (
          <Marker
            key={`${truck.status}-${truck.id}`}
            position={[
              truck.latitude + offset,
              truck.longitude + offset,
            ]}
            icon={
              truck.status === "External"
                ? externalTruckIcon
                : internalTruckIcon
            }
            eventHandlers={{ click: () => setSelectedTruck(truck) }}
          >
            <Popup>
              <strong>{truck.number}</strong>
              <br />
              Type: {truck.status}
              <br />
              Driver: {truck.driverName}
              <br />
              Phone: {truck.phone || "N/A"}
              <br />
              Truck Type: {truck.truckType || "N/A"}
              <br />
              Distance / ETA: {getTruckDistanceText(truck)}
              <br />
              Estimated Charge: {getTowChargeByTruck(truck)}
            </Popup>
          </Marker>
        );
      })}

      {garageLocation && (
        <Polyline
          positions={[customerLocation, garageLocation]}
          pathOptions={{
            color: "#22d3ee",
            weight: 5,
            dashArray: "10 8",
          }}
        />
      )}

      {selectedTruck &&
        Number.isFinite(selectedTruck.latitude) &&
        Number.isFinite(selectedTruck.longitude) && (
          <Polyline
            positions={[
              [selectedTruck.latitude, selectedTruck.longitude],
              customerLocation,
            ]}
            pathOptions={{
              color: "#f43f5e",
              weight: 4,
              dashArray: "6 6",
            }}
          />
        )}
    </MapContainer>
  );

  const renderTruckCard = (truck) => (
    <div
      key={`${truck.status}-${truck.id}`}
      onClick={() => setSelectedTruck(truck)}
      className={`cursor-pointer rounded-xl border p-4 transition-all ${
        selectedTruck?.id === truck.id &&
        selectedTruck?.status === truck.status
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-slate-700 bg-[#10111f] hover:border-slate-500"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Truck
            className={`w-4 h-4 shrink-0 ${
              truck.status === "External"
                ? "text-rose-400"
                : "text-cyan-400"
            }`}
          />
          <span className="truncate text-sm font-bold text-white">
            {truck.number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
              truck.status === "External"
                ? "bg-rose-500/15 text-rose-300"
                : "bg-cyan-500/15 text-cyan-300"
            }`}
          >
            {truck.status}
          </span>
          {selectedTruck?.id === truck.id &&
            selectedTruck?.status === truck.status && (
              <Check className="w-4 h-4 text-cyan-400" />
            )}
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <p className="flex items-center gap-2">
          <Users className="w-3 h-3" />
          {truck.driverName}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-3 h-3" />
          {truck.phone || "N/A"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          {selectedGarage.name}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          {getTruckDistanceText(truck)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Estimated Charge
        </span>
        <span className="text-sm font-bold text-white">
          {getTowChargeByTruck(truck)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wide">
          Emergency Logistics
        </h1>
        <div className="w-24 h-1 bg-cyan-400 mt-4 rounded-full" />
        <p className="text-slate-400 mt-6 max-w-2xl text-sm leading-7">
          Select your current vehicle condition to continue recovery support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          onClick={() => setVehicleStatus("driveable")}
          className={`cursor-pointer rounded-xl border p-5 md:p-8 transition-all duration-300 hover:scale-[1.02] ${
            vehicleStatus === "driveable"
              ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
              : "border-slate-700 bg-[#0c0d19] hover:border-cyan-700"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Car className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white uppercase">
                Driveable
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Vehicle can continue driving safely to the accepted garage.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setVehicleStatus("non-driveable")}
          className={`cursor-pointer rounded-xl border p-5 md:p-8 transition-all duration-300 hover:scale-[1.02] ${
            vehicleStatus === "non-driveable"
              ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
              : "border-slate-700 bg-[#0c0d19] hover:border-red-700"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white uppercase">
                Non Driveable
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Vehicle requires towing or emergency roadside recovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className={`mt-8 md:mt-10 w-full rounded-xl p-4 md:p-5 transition-all duration-300 flex items-center justify-between font-bold uppercase tracking-wider text-sm md:text-base ${
          vehicleStatus === "driveable"
            ? "bg-cyan-600 hover:bg-cyan-500"
            : "bg-red-700 hover:bg-red-600"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <Rocket className="w-5 h-5 md:w-6 md:h-6" />
          <span>
            {vehicleStatus === "driveable"
              ? "Start Guided Recovery"
              : "Initiate Emergency Tow Dispatch"}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
          {step === 0 && (
            <div className={modalShellClass}>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-white z-30 bg-slate-900/70 md:bg-transparent rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={mapClass}>
                {renderTruckMap()}
                <div className="absolute bottom-4 left-4 z-[900] rounded-lg border border-slate-700 bg-black/80 p-3 text-[10px] font-bold uppercase tracking-wider text-white">
                  <p className="text-purple-300">● Customer</p>
                  <p className="mt-1 text-slate-200">📍 Garage</p>
                  <p className="mt-1 text-cyan-300">🚚 Internal Truck</p>
                  <p className="mt-1 text-rose-300">🚚 External Truck</p>
                </div>
              </div>

              <div className={sidePanelClass}>
                <div className="p-4 md:p-5 border-b border-slate-700">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
                    Request A Tow Truck
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    {selectedGarage.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-300">
                      Internal: {internalTrucks.length}
                    </span>
                    <span className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-300">
                      External: {externalTrucks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
                  {isLoadingTrucks && (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
                      Loading registered tow trucks...
                    </div>
                  )}

                  {!isLoadingTrucks && truckError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
                      {truckError}
                      <button
                        type="button"
                        onClick={loadTrucks}
                        className="mt-3 block rounded-lg border border-red-400/40 px-3 py-2 text-xs font-bold uppercase hover:bg-red-500/10"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!isLoadingTrucks &&
                    !truckError &&
                    parkedTrucks.length === 0 && (
                      <div className="rounded-xl border border-slate-700 bg-[#10111f] p-4 text-sm leading-6 text-slate-400">
                        No internal or external tow trucks are registered for
                        this garage.
                      </div>
                    )}

                  {internalTrucks.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-cyan-300">
                        Internal Tow Trucks
                      </h3>
                      <div className="space-y-3">
                        {internalTrucks.map(renderTruckCard)}
                      </div>
                    </div>
                  )}

                  {externalTrucks.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-rose-300">
                        External Tow Trucks
                      </h3>
                      <div className="space-y-3">
                        {externalTrucks.map(renderTruckCard)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4 border-t border-slate-700 space-y-3">
                  <button
                    type="button"
                    disabled={!selectedTruck}
                    onClick={() => selectedTruck && setStep(1)}
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedTruck
                        ? "bg-red-700 hover:bg-red-600 text-white"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Request Selected Truck
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && selectedTruck && (
            <div className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[#0c0d19] border border-slate-700 rounded-2xl p-5 md:p-6 relative">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase text-center">
                Request Summary
              </h2>
              <p className="text-center text-xs text-cyan-400 uppercase tracking-wide mt-2">
                {selectedGarage.name}
              </p>

              <div className="mt-6 rounded-xl border border-slate-700 bg-[#10111f] p-4 text-sm space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Category</span>
                  <span
                    className={
                      selectedTruck.status === "External"
                        ? "text-rose-300 font-bold"
                        : "text-cyan-300 font-bold"
                    }
                  >
                    {selectedTruck.status}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Truck Number</span>
                  <span className="text-white font-bold text-right">
                    {selectedTruck.number}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Driver Name</span>
                  <span className="text-white text-right">
                    {selectedTruck.driverName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white text-right">
                    {selectedTruck.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Distance / ETA</span>
                  <span className="text-white text-right">
                    {getTruckDistanceText(selectedTruck)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Estimated Price</span>
                  <span className="text-white font-bold text-right">
                    {getTowChargeByTruck(selectedTruck)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}

          {step === 2 && selectedTruck && (
            <div className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[#0c0d19] border border-slate-700 rounded-2xl p-5 md:p-6 relative">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl md:text-2xl font-black text-white text-center uppercase">
                Submit Tow Truck Request
              </h2>
              <p className="text-slate-400 text-center mt-4 text-sm leading-6">
                Submit your tow truck request. The Assistance Officer will verify the request before dispatching the selected truck.
              </p>

              <div className="mt-6 rounded-xl border border-slate-700 bg-[#10111f] p-4 text-sm space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Ticket</span>
                  <span className="text-white font-bold">
                    {savedRequest?.ticketNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Garage</span>
                  <span className="text-white text-right">
                    {selectedGarage.name}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Truck</span>
                  <span className="text-white font-bold">
                    {selectedTruck.number}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white">{selectedTruck.status}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Driver</span>
                  <span className="text-white">
                    {selectedTruck.driverName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Estimated Charge</span>
                  <span className="text-white font-bold">
                    {getTowChargeByTruck(selectedTruck)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchTruck}
                  disabled={isSubmittingRequest}
                  className="w-1/2 bg-green-600 hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {notice && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className={`relative w-full overflow-hidden rounded-2xl border border-slate-700 bg-[#0c0d19] shadow-2xl ${
              noticeView === "route" ? "max-w-4xl" : "max-w-md"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setNoticeView("summary");
              }}
              className="absolute right-4 top-4 z-20 rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close message"
            >
              <X className="h-5 w-5" />
            </button>

            {noticeView === "summary" && (
              <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-7">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    notice.type === "error"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {notice.type === "error" ? (
                    <XCircle className="h-7 w-7" />
                  ) : (
                    <CheckCircle2 className="h-7 w-7" />
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black text-white">
                  {notice.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {notice.message}
                </p>

                {Array.isArray(notice.details) &&
                  notice.details.length > 0 && (
                    <div className="mt-5 space-y-3 rounded-xl border border-slate-700 bg-[#10111f] p-4">
                      {notice.details.map((detail) => (
                        <div
                          key={detail.label}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <span className="text-slate-500">
                            {detail.label}
                          </span>

                          <span className="text-right font-bold text-white">
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                <div
                  className={`mt-6 grid gap-3 ${
                    notice.tracking ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {notice.tracking && (
                    <button
                      type="button"
                      onClick={() => setNoticeView("route")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3.5 font-bold text-white transition hover:bg-cyan-500"
                    >
                      <MapPin className="h-4 w-4" />
                      View Live Route
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setNoticeView("summary");
                    }}
                    className={`rounded-xl py-3.5 font-bold text-white transition ${
                      notice.type === "error"
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {noticeView === "route" && notice.tracking && (
              <div className="max-h-[92vh] overflow-y-auto">
                <div className="border-b border-slate-700 px-5 py-4 pr-14 sm:px-7">
                  <h2 className="text-xl font-black text-white sm:text-2xl">
                    Live Tow Truck Route
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Track the selected tow truck route to your current location.
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="overflow-hidden rounded-xl border border-slate-700">
                    <div className="h-[340px] w-full sm:h-[430px]">
                      <MapContainer
                        key={`${notice.tracking.truckLocation.join("-")}-${notice.tracking.customerLocation.join("-")}-${routeRefreshKey}`}
                        center={notice.tracking.customerLocation}
                        zoom={12}
                        scrollWheelZoom
                        className="h-full w-full z-0"
                      >
                        <TileLayer
                          attribution="&copy; OpenStreetMap contributors"
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker
                          position={notice.tracking.truckLocation}
                          icon={internalTruckIcon}
                        >
                          <Popup>
                            <strong>{notice.tracking.truckNumber}</strong>
                            <br />
                            Driver: {notice.tracking.driverName}
                            <br />
                            Tow Truck Location
                          </Popup>
                        </Marker>

                        <CircleMarker
                          center={notice.tracking.customerLocation}
                          radius={11}
                          pathOptions={{
                            color: "#a78bfa",
                            fillColor: "#a78bfa",
                            fillOpacity: 0.95,
                          }}
                        >
                          <Popup>
                            <strong>Your Location</strong>
                            <br />
                            Customer Pickup Location
                          </Popup>
                        </CircleMarker>

                        <Polyline
                          positions={[
                            notice.tracking.truckLocation,
                            notice.tracking.customerLocation,
                          ]}
                          pathOptions={{
                            color: "#22d3ee",
                            weight: 5,
                            dashArray: "10 8",
                          }}
                        />
                      </MapContainer>
                    </div>

                    <div className="bg-[#10111f] px-4 py-3 text-center text-xs text-slate-400">
                      Tow truck route to your current location
                    </div>
                  </div>

                  {Array.isArray(notice.details) &&
                    notice.details.length > 0 && (
                      <div className="mt-5 grid gap-3 rounded-xl border border-slate-700 bg-[#10111f] p-4 sm:grid-cols-2">
                        {notice.details.map((detail) => (
                          <div
                            key={`route-${detail.label}`}
                            className="rounded-lg border border-slate-800 bg-black/20 p-3"
                          >
                            <p className="text-xs text-slate-500">
                              {detail.label}
                            </p>

                            <p className="mt-1 font-bold text-white">
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setNoticeView("summary")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 py-3.5 font-bold text-white transition hover:bg-slate-600"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRouteRefreshKey((currentKey) => currentKey + 1)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3.5 font-bold text-white transition hover:bg-cyan-500"
                    >
                      <Rocket className="h-4 w-4" />
                      Refresh Route
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setNoticeView("summary");
                      }}
                      className="rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}