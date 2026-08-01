import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  Truck,
  User,
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
  useMap,
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

const API_URL = "http://localhost:5000/api";
const DEFAULT_MAP_CENTER = [6.8728, 79.8887];

const getStoredCustomerCoordinates = () => {
  try {
    const storedRequest =
      sessionStorage.getItem("latestServiceRequest") ||
      localStorage.getItem("latestServiceRequest");

    if (!storedRequest) {
      return null;
    }

    const request = JSON.parse(storedRequest);

    const latitude = Number(
      request?.customerLatitude ??
        request?.customer_latitude
    );

    const longitude = Number(
      request?.customerLongitude ??
        request?.customer_longitude
    );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return [latitude, longitude];
    }
  } catch (error) {
    console.error(
      "Unable to read stored customer coordinates:",
      error
    );
  }

  return null;
};

const getStoredGarageCoordinates = () => {
  try {
    const storedRequest =
      sessionStorage.getItem("latestServiceRequest") ||
      localStorage.getItem("latestServiceRequest");

    if (!storedRequest) {
      return null;
    }

    const request = JSON.parse(storedRequest);

    const latitude = Number(
      request?.garageLatitude ??
        request?.garage_latitude
    );

    const longitude = Number(
      request?.garageLongitude ??
        request?.garage_longitude
    );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return [latitude, longitude];
    }
  } catch (error) {
    console.error(
      "Unable to read stored garage coordinates:",
      error
    );
  }

  return null;
};

const formatDateTime = (value) => {
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

const getSavedRequestId = () => {
  const possibleKeys = [
    "serviceRequestId",
    "requestId",
    "latestServiceRequestId",
    "currentServiceRequestId",
    "towRequestId",
  ];

  for (const key of possibleKeys) {
    const sessionValue = sessionStorage.getItem(key);
    const localValue = localStorage.getItem(key);
    const value = sessionValue || localValue;

    const requestId = Number(value);

    if (Number.isInteger(requestId) && requestId > 0) {
      return requestId;
    }
  }

  const storedRequest =
    sessionStorage.getItem("latestServiceRequest") ||
    localStorage.getItem("latestServiceRequest") ||
    sessionStorage.getItem("serviceRequest") ||
    localStorage.getItem("serviceRequest");

  if (storedRequest) {
    try {
      const parsedRequest = JSON.parse(storedRequest);

      const requestId = Number(
        parsedRequest?.requestId ??
          parsedRequest?.request_id ??
          parsedRequest?.id
      );

      if (Number.isInteger(requestId) && requestId > 0) {
        return requestId;
      }
    } catch (error) {
      console.error("Invalid stored service request:", error);
    }
  }

  return null;
};

const statusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value === "approved" ||
    value === "dispatched" ||
    value === "completed"
  ) {
    return {
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      icon: <CheckCircle2 size={17} />,
    };
  }

  if (value === "rejected") {
    return {
      className:
        "border-red-500/30 bg-red-500/10 text-red-300",
      icon: <XCircle size={17} />,
    };
  }

  return {
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: <Clock size={17} />,
  };
};

const toNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
};

const parseCoordinatesFromText = (value) => {
  const matches = String(value || "").match(
    /-?\d+(?:\.\d+)?/g
  );

  if (!matches || matches.length < 2) {
    return null;
  }

  const latitude = Number(matches[0]);
  const longitude = Number(matches[1]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return [latitude, longitude];
};

const getTruckCoordinates = (dispatch) => {
  if (!dispatch) return null;

  const latitude = toNumber(
    dispatch.truckLatitude,
    dispatch.truck_latitude,
    dispatch.currentTruckLatitude,
    dispatch.current_truck_latitude,
    dispatch.currentLatitude,
    dispatch.current_latitude,
    dispatch.driverLatitude,
    dispatch.driver_latitude
  );

  const longitude = toNumber(
    dispatch.truckLongitude,
    dispatch.truck_longitude,
    dispatch.currentTruckLongitude,
    dispatch.current_truck_longitude,
    dispatch.currentLongitude,
    dispatch.current_longitude,
    dispatch.driverLongitude,
    dispatch.driver_longitude
  );

  if (latitude !== null && longitude !== null) {
    return [latitude, longitude];
  }

  return (
    parseCoordinatesFromText(
      dispatch.truckLocation ||
        dispatch.currentTruckLocation ||
        dispatch.driverLocation
    ) || null
  );
};

const getCustomerCoordinates = (dispatch) => {
  if (!dispatch) return null;

  const latitude = toNumber(
    dispatch.customerLatitude,
    dispatch.customer_latitude,
    dispatch.pickupLatitude,
    dispatch.pickup_latitude,
    dispatch.requestLatitude,
    dispatch.request_latitude
  );

  const longitude = toNumber(
    dispatch.customerLongitude,
    dispatch.customer_longitude,
    dispatch.pickupLongitude,
    dispatch.pickup_longitude,
    dispatch.requestLongitude,
    dispatch.request_longitude
  );

  if (latitude !== null && longitude !== null) {
    return [latitude, longitude];
  }

  return (
    parseCoordinatesFromText(
      dispatch.pickupLocation ||
        dispatch.customerLocation ||
        dispatch.location
    ) || null
  );
};

const getGarageCoordinates = (dispatch) => {
  if (!dispatch) return null;

  const latitude = toNumber(
    dispatch.garageLatitude,
    dispatch.garage_latitude,
    dispatch.destinationGarageLatitude,
    dispatch.destination_garage_latitude
  );

  const longitude = toNumber(
    dispatch.garageLongitude,
    dispatch.garage_longitude,
    dispatch.destinationGarageLongitude,
    dispatch.destination_garage_longitude
  );

  if (latitude !== null && longitude !== null) {
    return [latitude, longitude];
  }

  return (
    parseCoordinatesFromText(
      dispatch.garageLocation ||
        dispatch.destinationGarageLocation ||
        dispatch.destinationGarage
    ) || null
  );
};

const calculateDistanceKm = (
  firstCoordinates,
  secondCoordinates
) => {
  if (!firstCoordinates || !secondCoordinates) {
    return null;
  }

  const [latitude1, longitude1] = firstCoordinates;
  const [latitude2, longitude2] = secondCoordinates;

  const earthRadiusKm = 6371;
  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;
  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const calculation =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle =
    2 *
    Math.atan2(
      Math.sqrt(calculation),
      Math.sqrt(1 - calculation)
    );

  return earthRadiusKm * centralAngle;
};

const calculateEstimatedMinutes = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  const averageSpeedKmPerHour = 35;

  return Math.max(
    1,
    Math.round(
      (distanceKm / averageSpeedKmPerHour) * 60
    )
  );
};

const fetchOsrmRoute = async (
  startCoordinates,
  endCoordinates,
  signal
) => {
  if (!startCoordinates || !endCoordinates) {
    return null;
  }

  const [startLatitude, startLongitude] = startCoordinates;
  const [endLatitude, endLongitude] = endCoordinates;

  const routeUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${startLongitude},${startLatitude};` +
    `${endLongitude},${endLatitude}` +
    `?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(routeUrl, { signal });
  const result = await response.json();

  if (
    !response.ok ||
    result?.code !== "Ok" ||
    !Array.isArray(result?.routes) ||
    result.routes.length === 0
  ) {
    throw new Error(
      result?.message || "Unable to calculate the road route."
    );
  }

  const route = result.routes[0];
  const coordinates =
    route?.geometry?.coordinates?.map(
      ([longitude, latitude]) => [latitude, longitude]
    ) || [];

  if (coordinates.length < 2) {
    throw new Error("The routing service returned an empty route.");
  }

  return {
    coordinates,
    distanceKm: Number(route.distance) / 1000,
    durationMinutes: Math.max(
      1,
      Math.round(Number(route.duration) / 60)
    ),
  };
};

const FitRouteBounds = ({
  truckCoordinates,
  customerCoordinates,
  garageCoordinates,
}) => {
  const map = useMap();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      map.invalidateSize();

      const availablePoints = [
        truckCoordinates,
        customerCoordinates,
        garageCoordinates,
      ].filter(Boolean);

      if (availablePoints.length > 0) {
        map.fitBounds(
          availablePoints,
          {
            padding: [55, 55],
            maxZoom: 15,
            animate: true,
          }
        );
      }
    }, 180);

    return () =>
      window.clearTimeout(timerId);
  }, [
    customerCoordinates,
    garageCoordinates,
    map,
    truckCoordinates,
  ]);

  return null;
};

const TrackMyTowTruck = ({ onNavigate }) => {
  const [requestId, setRequestId] = useState(null);
  const [dispatch, setDispatch] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showLiveRoute, setShowLiveRoute] = useState(false);
  const [truckToCustomerRoute, setTruckToCustomerRoute] =
    useState(null);
  const [customerToGarageRoute, setCustomerToGarageRoute] =
    useState(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const loadTowTruckDetails = async ({
    silent = false,
  } = {}) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      setLoadError("");

      const savedRequestId = getSavedRequestId();

      if (!savedRequestId) {
        throw new Error(
          "No service request was found. Please submit a tow truck request first."
        );
      }

      setRequestId(savedRequestId);

      const response = await fetch(
        `${API_URL}/tow-dispatches/request/${savedRequestId}/latest`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load your tow truck details."
        );
      }

      setDispatch(result.dispatch || null);
    } catch (error) {
      console.error(
        "Load tow truck details error:",
        error
      );

      if (!silent) {
        setDispatch(null);
      }

      setLoadError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTowTruckDetails();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadTowTruckDetails({ silent: true });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentStatus = useMemo(
    () => statusStyle(dispatch?.dispatchStatus),
    [dispatch?.dispatchStatus]
  );

  const customerCoordinates = useMemo(() => {
    return (
      getCustomerCoordinates(dispatch) ||
      getStoredCustomerCoordinates() ||
      DEFAULT_MAP_CENTER
    );
  }, [dispatch]);

  const garageCoordinates = useMemo(() => {
    return (
      getGarageCoordinates(dispatch) ||
      getStoredGarageCoordinates() ||
      null
    );
  }, [dispatch]);

  const truckCoordinates = useMemo(() => {
    const liveTruckCoordinates =
      getTruckCoordinates(dispatch);

    if (liveTruckCoordinates) {
      return liveTruckCoordinates;
    }

    /*
      Temporary fallback so the map always opens during testing.
      When the backend returns truckLatitude and truckLongitude,
      the real truck location will be used automatically.
    */
    return [
      customerCoordinates[0] - 0.035,
      customerCoordinates[1] - 0.045,
    ];
  }, [customerCoordinates, dispatch]);

  useEffect(() => {
    if (
      !showLiveRoute ||
      !truckCoordinates ||
      !customerCoordinates
    ) {
      return undefined;
    }

    const controller = new AbortController();

    const loadRoadRoutes = async () => {
      setIsRouteLoading(true);
      setRouteError("");

      try {
        const truckRoutePromise = fetchOsrmRoute(
          truckCoordinates,
          customerCoordinates,
          controller.signal
        );

        const garageRoutePromise = garageCoordinates
          ? fetchOsrmRoute(
              customerCoordinates,
              garageCoordinates,
              controller.signal
            )
          : Promise.resolve(null);

        const [truckRoute, garageRoute] = await Promise.all([
          truckRoutePromise,
          garageRoutePromise,
        ]);

        setTruckToCustomerRoute(truckRoute);
        setCustomerToGarageRoute(garageRoute);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("OSRM route loading error:", error);
        setRouteError(
          error.message ||
            "Unable to load the road route. Showing a direct route instead."
        );
        setTruckToCustomerRoute(null);
        setCustomerToGarageRoute(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsRouteLoading(false);
        }
      }
    };

    loadRoadRoutes();

    return () => controller.abort();
  }, [
    customerCoordinates,
    garageCoordinates,
    showLiveRoute,
    truckCoordinates,
  ]);

  const remainingDistanceKm = useMemo(
    () =>
      truckToCustomerRoute?.distanceKm ??
      calculateDistanceKm(
        truckCoordinates,
        customerCoordinates
      ),
    [
      customerCoordinates,
      truckCoordinates,
      truckToCustomerRoute,
    ]
  );

  const remainingMinutes = useMemo(
    () =>
      truckToCustomerRoute?.durationMinutes ??
      calculateEstimatedMinutes(remainingDistanceKm),
    [remainingDistanceKm, truckToCustomerRoute]
  );

  const customerToGarageDistanceKm = useMemo(
    () =>
      customerToGarageRoute?.distanceKm ??
      calculateDistanceKm(
        customerCoordinates,
        garageCoordinates
      ),
    [
      customerCoordinates,
      customerToGarageRoute,
      garageCoordinates,
    ]
  );

  const customerToGarageMinutes = useMemo(
    () =>
      customerToGarageRoute?.durationMinutes ??
      calculateEstimatedMinutes(
        customerToGarageDistanceKm
      ),
    [customerToGarageDistanceKm, customerToGarageRoute]
  );

  const mapCenter =
    truckCoordinates ||
    customerCoordinates ||
    DEFAULT_MAP_CENTER;

  const canShowRoute =
    Boolean(truckCoordinates) &&
    Boolean(customerCoordinates);

  return (
    <div className="min-h-screen bg-[#070914] px-4 py-6 text-white sm:px-6 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                onNavigate("navigation-hub")
              }
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <h1 className="text-3xl font-black md:text-4xl">
              Track My Tow Truck
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              View your assigned tow truck, driver and
              arrival details.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadTowTruckDetails()
            }
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                isLoading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 text-center text-blue-200">
            Loading your tow truck details...
          </div>
        )}

        {!isLoading && loadError && !dispatch && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <XCircle
                size={24}
                className="shrink-0 text-red-400"
              />

              <div>
                <h2 className="font-bold text-red-300">
                  Unable to Load Tow Truck
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-200/80">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("garage-map")
                  }
                  className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500"
                >
                  Find a Tow Truck
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && dispatch && (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-3xl border border-slate-800 bg-[#0e1220] p-5 shadow-2xl sm:p-7">
              <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Assigned Tow Truck
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-white">
                    {dispatch.truckNumber ||
                      "Not assigned"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {dispatch.truckModel ||
                      dispatch.truckType ||
                      "Tow truck details unavailable"}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase ${currentStatus.className}`}
                >
                  {currentStatus.icon}
                  {dispatch.dispatchStatus ||
                    "Pending Verification"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<Truck size={20} />}
                  label="Tow Truck Number"
                  value={dispatch.truckNumber}
                />

                <InfoCard
                  icon={<Truck size={20} />}
                  label="Truck Type"
                  value={dispatch.truckType}
                />

                <InfoCard
                  icon={<User size={20} />}
                  label="Driver"
                  value={dispatch.driverName}
                />

                <InfoCard
                  icon={<Phone size={20} />}
                  label="Driver Contact"
                  value={dispatch.driverContact}
                />

                <InfoCard
                  icon={<Clock size={20} />}
                  label="Estimated Arrival"
                  value={
                    remainingMinutes !== null
                      ? `${remainingMinutes} Minutes`
                      : formatDateTime(
                          dispatch.estimatedArrivalTime
                        )
                  }
                />

                <InfoCard
                  icon={<MapPin size={20} />}
                  label="Remaining Distance"
                  value={
                    remainingDistanceKm !== null
                      ? `${remainingDistanceKm.toFixed(
                          1
                        )} KM`
                      : dispatch.estimatedDistance ||
                        dispatch.distance
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  console.log("Opening live route popup");
                  setShowLiveRoute(true);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-cyan-500"
              >
                <Navigation size={18} />
                View Live Route
              </button>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-800 bg-[#0e1220] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Your Request
                </p>

                <div className="mt-5 space-y-4">

                  <DetailRow
                    label="Customer Vehicle"
                    value={dispatch.vehicleNumber}
                  />

                  <DetailRow
                    label="Vehicle Type"
                    value={dispatch.vehicleType}
                  />

                  <DetailRow
                    label="Customer Name"
                    value={dispatch.customerName}
                  />

                  <DetailRow
                    label="Customer Contact"
                    value={dispatch.customerContact}
                  />
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>

      {showLiveRoute &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Live tow truck route"
          >
            <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#080b16] shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Route
                      size={20}
                      className="text-cyan-300"
                    />

                    <h2 className="text-xl font-black text-white">
                      Live Tow Truck Route
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Tow truck, customer and garage locations
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowLiveRoute(false)
                  }
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/50 hover:text-red-300"
                  aria-label="Close live route map"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid shrink-0 gap-3 border-b border-slate-800 bg-black/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <RouteSummaryCard
                  icon={<Truck size={18} />}
                  label="Tow Truck"
                  value={
                    dispatch?.truckNumber ||
                    "Not assigned"
                  }
                />

                <RouteSummaryCard
                  icon={<MapPin size={18} />}
                  label="Truck to Customer"
                  value={
                    remainingDistanceKm !== null
                      ? `${remainingDistanceKm.toFixed(
                          1
                        )} KM`
                      : "Unavailable"
                  }
                />

                <RouteSummaryCard
                  icon={<Clock size={18} />}
                  label="Estimated Arrival"
                  value={
                    remainingMinutes !== null
                      ? `${remainingMinutes} Minutes`
                      : formatDateTime(
                          dispatch?.estimatedArrivalTime
                        )
                  }
                />

                <RouteSummaryCard
                  icon={<MapPin size={18} />}
                  label="Garage"
                  value={
                    dispatch?.garageName ||
                    dispatch?.destinationGarage ||
                    "Selected Garage"
                  }
                />
              </div>

              <div className="relative min-h-0 flex-1">
                <MapContainer
                  key={`live-route-${showLiveRoute}`}
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom
                  className="h-full w-full"
                  style={{
                    height: "100%",
                    width: "100%",
                    minHeight: "420px",
                    zIndex: 0,
                  }}
                >
                  <FitRouteBounds
                    truckCoordinates={
                      truckCoordinates
                    }
                    customerCoordinates={
                      customerCoordinates
                    }
                    garageCoordinates={
                      garageCoordinates
                    }
                  />

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {truckCoordinates && (
                    <CircleMarker
                      center={truckCoordinates}
                      radius={13}
                      pathOptions={{
                        color: "#22d3ee",
                        fillColor: "#0891b2",
                        fillOpacity: 0.95,
                        weight: 4,
                      }}
                    >
                      <Popup>
                        <strong>
                          Tow Truck Current Location
                        </strong>
                        <br />
                        Truck:{" "}
                        {dispatch?.truckNumber || "N/A"}
                        <br />
                        Driver:{" "}
                        {dispatch?.driverName || "N/A"}
                      </Popup>
                    </CircleMarker>
                  )}

                  {customerCoordinates && (
                    <Marker
                      position={customerCoordinates}
                    >
                      <Popup>
                        <strong>
                          Customer Pickup Location
                        </strong>
                        <br />
                        Customer:{" "}
                        {dispatch?.customerName || "N/A"}
                        <br />
                        {dispatch?.pickupLocation ||
                          "GPS location"}
                      </Popup>
                    </Marker>
                  )}

                  {garageCoordinates && (
                    <CircleMarker
                      center={garageCoordinates}
                      radius={12}
                      pathOptions={{
                        color: "#a78bfa",
                        fillColor: "#7c3aed",
                        fillOpacity: 0.95,
                        weight: 4,
                      }}
                    >
                      <Popup>
                        <strong>
                          Destination Garage
                        </strong>
                        <br />
                        {dispatch?.garageName ||
                          dispatch?.destinationGarage ||
                          "Selected Garage"}
                        <br />
                        {dispatch?.garageAddress ||
                          "Garage location"}
                      </Popup>
                    </CircleMarker>
                  )}

                  {truckCoordinates &&
                    customerCoordinates && (
                      <Polyline
                        positions={
                          truckToCustomerRoute?.coordinates || [
                            truckCoordinates,
                            customerCoordinates,
                          ]
                        }
                        pathOptions={{
                          color: "#22d3ee",
                          weight: 6,
                          opacity: 0.95,
                          dashArray: truckToCustomerRoute
                            ? undefined
                            : "12 9",
                        }}
                      />
                    )}

                  {customerCoordinates &&
                    garageCoordinates && (
                      <Polyline
                        positions={
                          customerToGarageRoute?.coordinates || [
                            customerCoordinates,
                            garageCoordinates,
                          ]
                        }
                        pathOptions={{
                          color: "#a78bfa",
                          weight: 5,
                          opacity: 0.95,
                          dashArray: customerToGarageRoute
                            ? undefined
                            : "8 8",
                        }}
                      />
                    )}
                </MapContainer>

                {(isRouteLoading || routeError) && (
                  <div className="pointer-events-none absolute left-4 top-4 z-[900] max-w-md">
                    <div className="rounded-xl border border-slate-700 bg-[#07101f]/95 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
                      {isRouteLoading ? (
                        <p className="flex items-center gap-2 font-bold text-cyan-200">
                          <RefreshCw size={14} className="animate-spin" />
                          Calculating the road route...
                        </p>
                      ) : (
                        <p className="leading-5 text-amber-200">
                          {routeError}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[900] sm:right-auto sm:max-w-sm">
                  <div className="rounded-xl border border-cyan-500/30 bg-[#07101f]/95 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
                    <p className="font-black uppercase tracking-wider text-cyan-300">
                      Live Route
                    </p>

                    <p className="mt-1 text-slate-300">
                      Tow truck → Customer → Garage
                    </p>

                    {garageCoordinates && (
                      <p className="mt-1 text-slate-400">
                        Customer to garage:{" "}
                        {customerToGarageDistanceKm !==
                        null
                          ? `${customerToGarageDistanceKm.toFixed(
                              1
                            )} KM · ${
                              customerToGarageMinutes ||
                              "N/A"
                            } Minutes`
                          : "Distance unavailable"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words font-bold text-white">
          {value || "Not available"}
        </p>
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
    <span className="text-sm text-slate-500">
      {label}
    </span>

    <span className="text-right text-sm font-bold text-white">
      {value || "N/A"}
    </span>
  </div>
);

const RouteSummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-800 bg-[#0d1220] p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-black text-white">
          {value || "N/A"}
        </p>
      </div>
    </div>
  </div>
);

export default TrackMyTowTruck;