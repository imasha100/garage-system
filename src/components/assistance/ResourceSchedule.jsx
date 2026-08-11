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
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ======================================================
// LEAFLET MARKER ICON FIX
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================================================
// ROAD-FOLLOWING ROUTE
// Persistent cache prevents the road line from disappearing
// when ResourceSchedule auto-refreshes every 5 seconds.
// ======================================================

const roadRouteCache = new Map();

const RoadRoute = ({
  customerLocation,
  garageLocation,
}) => {
  const map = useMap();

  const routeKey = [
    Number(customerLocation?.[0]).toFixed(6),
    Number(customerLocation?.[1]).toFixed(6),
    Number(garageLocation?.[0]).toFixed(6),
    Number(garageLocation?.[1]).toFixed(6),
  ].join(":");

  const [routePositions, setRoutePositions] =
    useState(() => {
      return roadRouteCache.get(routeKey) || [];
    });

  useEffect(() => {
    if (
      !Array.isArray(customerLocation) ||
      !Array.isArray(garageLocation) ||
      customerLocation.length !== 2 ||
      garageLocation.length !== 2
    ) {
      return undefined;
    }

    const cachedRoute =
      roadRouteCache.get(routeKey);

    if (
      Array.isArray(cachedRoute) &&
      cachedRoute.length > 1
    ) {
      setRoutePositions(cachedRoute);
      return undefined;
    }

    let isMounted = true;
    const controller =
      new AbortController();

    const loadRoadRoute =
      async () => {
        try {
          const startLng =
            Number(customerLocation[1]);
          const startLat =
            Number(customerLocation[0]);
          const endLng =
            Number(garageLocation[1]);
          const endLat =
            Number(garageLocation[0]);

          const routeUrl =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${startLng},${startLat};${endLng},${endLat}` +
            `?overview=full&geometries=geojson&steps=false`;

          const response =
            await fetch(routeUrl, {
              signal:
                controller.signal,
            });

          const data =
            await response.json();

          if (
            !response.ok ||
            data?.code !== "Ok" ||
            !Array.isArray(
              data?.routes?.[0]
                ?.geometry
                ?.coordinates
            )
          ) {
            throw new Error(
              "Road route could not be loaded."
            );
          }

          const positions =
            data.routes[0]
              .geometry
              .coordinates
              .map(
                ([lng, lat]) => [
                  lat,
                  lng,
                ]
              )
              .filter(
                (point) =>
                  Number.isFinite(
                    point[0]
                  ) &&
                  Number.isFinite(
                    point[1]
                  )
              );

          if (
            positions.length < 2
          ) {
            throw new Error(
              "Road route contains insufficient coordinates."
            );
          }

          roadRouteCache.set(
            routeKey,
            positions
          );

          if (isMounted) {
            setRoutePositions(
              positions
            );
          }
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Load persistent road route error:",
              error
            );

            // IMPORTANT:
            // Do not clear an already-rendered route if a later
            // network refresh fails. This keeps the map stable.
            const lastGoodRoute =
              roadRouteCache.get(
                routeKey
              );

            if (
              isMounted &&
              Array.isArray(
                lastGoodRoute
              ) &&
              lastGoodRoute.length >
                1
            ) {
              setRoutePositions(
                lastGoodRoute
              );
            }
          }
        }
      };

    loadRoadRoute();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [routeKey]);

  useEffect(() => {
    if (
      !map ||
      !Array.isArray(
        routePositions
      ) ||
      routePositions.length < 2
    ) {
      return;
    }

    try {
      const bounds =
        L.latLngBounds(
          routePositions
        );

      map.fitBounds(bounds, {
        padding: [28, 28],
      });
    } catch (error) {
      console.warn(
        "Route fit bounds skipped:",
        error
      );
    }
  }, [map, routeKey, routePositions]);

  if (
    !Array.isArray(
      routePositions
    ) ||
    routePositions.length < 2
  ) {
    return null;
  }

  return (
    <Polyline
      positions={
        routePositions
      }
      pathOptions={{
        color: "#2563eb",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
};

// ======================================================
// DISTANCE AND ETA HELPER FUNCTIONS
// ======================================================

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const calculateDistanceKm = (
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude
) => {
  const values = [
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
  ].map(Number);

  if (!values.every(Number.isFinite)) {
    return null;
  }

  const [
    latitude1,
    longitude1,
    latitude2,
    longitude2,
  ] = values;

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    latitude2 - latitude1
  );

  const longitudeDifference = toRadians(
    longitude2 - longitude1
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
};

const calculateTravelDetails = (
  customerLatitude,
  customerLongitude,
  garageLatitude,
  garageLongitude
) => {
  const directDistance =
    calculateDistanceKm(
      customerLatitude,
      customerLongitude,
      garageLatitude,
      garageLongitude
    );

  if (!Number.isFinite(directDistance)) {
    return {
      distanceKm: null,
      distanceText: "Not available",
      etaMinutes: null,
      etaText: "Not available",
    };
  }

  // Approximate road distance.
  const estimatedRoadDistance =
    directDistance * 1.25;

  // Approximate urban driving speed: 30 km/h.
  const estimatedMinutes = Math.max(
    1,
    Math.ceil(
      (estimatedRoadDistance / 30) * 60
    )
  );

  return {
    distanceKm: Number(
      estimatedRoadDistance.toFixed(1)
    ),

    distanceText:
      `${estimatedRoadDistance.toFixed(1)} KM`,

    etaMinutes:
      estimatedMinutes,

    etaText:
      `${estimatedMinutes} MINS`,
  };
};

// ======================================================
// RESOURCE SCHEDULE COMPONENT
// ======================================================

const ResourceSchedule = ({
  searchQuery = "",
}) => {
  const [
  currentCapacity,
  setCurrentCapacity,
] = useState(0);

const [
  maxCapacity,
  setMaxCapacity,
] = useState(0);

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    color: "#52f0ac",
    showCancel: false,
    requestData: null,
  });

  const [
    showDetailsModal,
    setShowDetailsModal,
  ] = useState(null);

  const [
    acceptedRequests,
    setAcceptedRequests,
  ] = useState([]);

  const [
    rejectedRequests,
    setRejectedRequests,
  ] = useState([]);

  const [
    selectedVehicles,
    setSelectedVehicles,
  ] = useState({});

  const [
    emergencyRequests,
    setEmergencyRequests,
  ] = useState([]);

  const [
    selectedReq,
    setSelectedReq,
  ] = useState(null);

  const [
    requestsLoading,
    setRequestsLoading,
  ] = useState(true);

  const [
    requestsError,
    setRequestsError,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    assistanceId,
    setAssistanceId,
  ] = useState(null);

  const [
    garageId,
    setGarageId,
  ] = useState(null);

  const [availableTechs, setAvailableTechs] = useState([]);

const [activeTechs, setActiveTechs] = useState([]);

const [offShiftTechs, setOffShiftTechs] = useState([]);

const [techniciansLoading, setTechniciansLoading] = useState(false);

const [techniciansError, setTechniciansError] = useState("");

  const [extensionModal, setExtensionModal] = useState(null);
  const [extensionTime, setExtensionTime] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionLoading, setExtensionLoading] = useState(false);

  const [
    completingJobId,
    setCompletingJobId,
  ] = useState(null);

  const extensionTimeOptions = Array.from(
    { length: 16 },
    (_, index) => {
      const totalMinutes = (index + 1) * 15;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return {
        value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
        label:
          hours > 0
            ? `${hours} hr${hours > 1 ? "s" : ""}${minutes > 0 ? ` ${minutes} min` : ""}`
            : `${minutes} min`,
      };
    }
  );

  // ====================================================
  // NORMALISE SERVICE REQUEST
  // ====================================================

  const normalizeRequest = (request) => {
    const latitude = Number(
      request.customerLatitude
    );

    const longitude = Number(
      request.customerLongitude
    );

    const garageLatitude = Number(
      request.garageLatitude
    );

    const garageLongitude = Number(
      request.garageLongitude
    );

    const customerLat =
      Number.isFinite(latitude)
        ? latitude
        : null;

    const customerLng =
      Number.isFinite(longitude)
        ? longitude
        : null;

    const garageLat =
      Number.isFinite(garageLatitude)
        ? garageLatitude
        : null;

    const garageLng =
      Number.isFinite(garageLongitude)
        ? garageLongitude
        : null;

    const travelDetails =
      calculateTravelDetails(
        customerLat,
        customerLng,
        garageLat,
        garageLng
      );

    return {
      id:
        request.requestId,

      requestId:
        request.requestId,

      ticketNumber:
        request.ticketNumber ||
        `SR-${String(
          request.requestId
        ).padStart(4, "0")}`,

      name:
        request.customerName ||
        "Customer",

      contact:
        request.customerContact ||
        "Not available",

      vNo:
        request.vehicleNumber ||
        "Not available",

      vehicle:
        request.vehicleType ||
        "Not specified",

      loc:
        request.location ||
        "Customer Live GPS Location",

      garageId:
        request.garageId ||
        null,

      garageName:
        request.garageName ||
        "Selected Garage",

      garageAddress:
        request.garageAddress ||
        "",

      garageCode:
        request.garageCode ||
        "",

      lat:
        customerLat,

      lng:
        customerLng,

      garageLat,

      garageLng,

      eta:
        travelDetails.etaText,

      etaMinutes:
        travelDetails.etaMinutes,

      dist:
        travelDetails.distanceText,

      distanceKm:
        travelDetails.distanceKm,

      status:
        String(
          request.requestStatus ||
          "Pending"
        ).toLowerCase(),

      requestDate:
        request.requestDate ||
        null,

      requestTime:
        request.requestTime ||
        null,

      customerStage:
        String(
          request.customerStage ??
            request.customer_stage ??
            ""
        )
          .trim()
          .toUpperCase(),
    };
  };
    // ====================================================
  // LOAD REQUESTS FROM DATABASE
  // ====================================================

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError("");

      const storedStaffUser =
        sessionStorage.getItem(
          "staffUser"
        );

      if (!storedStaffUser) {
        throw new Error(
          "Logged-in assistance officer details were not found."
        );
      }

      const staffUser =
        JSON.parse(storedStaffUser);

      const loggedAssistanceId =
        Number(staffUser?.staffId);

      if (
        String(
          staffUser?.role || ""
        ).toLowerCase() !==
          "assistance" ||
        !Number.isInteger(
          loggedAssistanceId
        ) ||
        loggedAssistanceId <= 0
      ) {
        throw new Error(
          "A valid assistance officer account could not be identified."
        );
      }

      // Assistance officer details load කිරීම
      const assistanceResponse =
        await fetch(
          `http://localhost:5000/api/assistances/${loggedAssistanceId}`
        );

      const assistanceResult =
        await assistanceResponse.json();

      if (
        !assistanceResponse.ok ||
        assistanceResult.success ===
          false ||
        !assistanceResult.assistance
      ) {
        throw new Error(
          assistanceResult.message ||
            "Unable to load assistance officer details."
        );
      }

      const assistance =
        assistanceResult.assistance;

      const relatedGarageId =
        Number(
          assistance.garageId ??
            assistance.garage_id ??
            assistance.garageGarageId ??
            assistance.garage_garage_id
        );

      if (
        !Number.isInteger(
          relatedGarageId
        ) ||
        relatedGarageId <= 0
      ) {
        throw new Error(
          "The garage related to this assistance officer could not be identified."
        );
      }

      const garagesResponse = await fetch(
  "http://localhost:5000/api/garages"
);

const garagesResult =
  await garagesResponse.json();

if (
  !garagesResponse.ok ||
  !garagesResult.success
) {
  throw new Error(
    garagesResult.message ||
      "Unable to load garage capacity."
  );
}

// ==========================================
// LOAD TECHNICIANS FOR THIS GARAGE
// ==========================================

setTechniciansLoading(true);
setTechniciansError("");

const techniciansResponse = await fetch(
  `http://localhost:5000/api/technicians?garageId=${relatedGarageId}`
);

const techniciansResult =
  await techniciansResponse.json();

if (
  !techniciansResponse.ok ||
  techniciansResult.success === false
) {
  throw new Error(
    techniciansResult.message ||
      "Unable to load technicians."
  );
}

const garageTechnicians = Array.isArray(
  techniciansResult.technicians
)
  ? techniciansResult.technicians
  : [];

// ======================================================
// FILTER TECHNICIANS BY SHIFT + AVAILABILITY
// ======================================================

const isTechnicianOnShift = (technician) => {
  const shiftStatus = String(
    technician.shiftStatus ??
      technician.shift_status ??
      ""
  )
    .trim()
    .toUpperCase();

  return (
    shiftStatus === "ON" ||
    shiftStatus === "ON_SHIFT" ||
    shiftStatus === "ON-SHIFT" ||
    shiftStatus === "ACTIVE"
  );
};

const availableTechnicians =
  garageTechnicians.filter((technician) => {
    const availabilityStatus = String(
      technician.availabilityStatus ??
        technician.availability_status ??
        ""
    )
      .trim()
      .toUpperCase();

    return (
      isTechnicianOnShift(technician) &&
      availabilityStatus === "AVAILABLE"
    );
  });

const busyTechnicians =
  garageTechnicians.filter((technician) => {
    const availabilityStatus = String(
      technician.availabilityStatus ??
        technician.availability_status ??
        ""
    )
      .trim()
      .toUpperCase();

    return (
      isTechnicianOnShift(technician) &&
      availabilityStatus !== "AVAILABLE"
    );
  });

const offShiftTechnicians =
  garageTechnicians.filter(
    (technician) =>
      !isTechnicianOnShift(technician)
  );

setAvailableTechs(
  availableTechnicians
);

setOffShiftTechs(
  offShiftTechnicians
);

const activeTechniciansWithJobs = await Promise.all(
  busyTechnicians.map(async (technician) => {
    try {
      const jobsResponse = await fetch(
        `http://localhost:5000/api/service-jobs/technician/${technician.technicianId}`
      );

      const jobsResult = await jobsResponse.json();

      if (!jobsResponse.ok || jobsResult.success === false) {
        return { ...technician, jobId: null, jobStatus: "", vehicleNumber: "", ticketNumber: "", estimatedCompletionTime: null };
      }

      const technicianJobs = Array.isArray(jobsResult.jobs) ? jobsResult.jobs : [];
      const activeJob =
        technicianJobs.find((job) => String(job.jobStatus || "").toUpperCase() === "IN_PROGRESS") ||
        technicianJobs.find((job) => String(job.jobStatus || "").toUpperCase() === "ASSIGNED") ||
        null;

      return {
        ...technician,
        jobId: activeJob?.jobId ?? null,
        jobStatus: activeJob?.jobStatus || "",
        vehicleNumber: activeJob?.vehicleNumber || "",
        ticketNumber: activeJob?.ticketNumber || "",
        estimatedCompletionTime: activeJob?.estimatedCompletionTime || null,
      };
    } catch (error) {
      console.error("Load technician active job error:", error);
      return { ...technician, jobId: null, jobStatus: "", vehicleNumber: "", ticketNumber: "", estimatedCompletionTime: null };
    }
  })
);

setActiveTechs(activeTechniciansWithJobs);

setTechniciansLoading(false);

const currentGarage = (
  Array.isArray(garagesResult.data)
    ? garagesResult.data
    : []
).find(
  (garage) =>
    Number(garage.garage_id) ===
    relatedGarageId
);

if (!currentGarage) {
  throw new Error(
    "Garage capacity details were not found."
  );
}

setMaxCapacity(
  Number(currentGarage.capacity) || 0
);

setCurrentCapacity(
  Number(
    currentGarage.current_capacity
  ) || 0
);

      // Pending requests load කිරීම
      const pendingResponse =
        await fetch(
          `http://localhost:5000/api/service-requests?garageId=${relatedGarageId}&status=Pending`
        );

      const pendingResult =
        await pendingResponse.json();

      if (
        !pendingResponse.ok ||
        !pendingResult.success
      ) {
        throw new Error(
          pendingResult.message ||
            "Unable to load pending service requests."
        );
      }

      // Accepted requests load කිරීම
      const acceptedResponse =
        await fetch(
          `http://localhost:5000/api/service-requests?garageId=${relatedGarageId}&status=Accepted`
        );

      const acceptedResult =
        await acceptedResponse.json();

      if (
        !acceptedResponse.ok ||
        !acceptedResult.success
      ) {
        throw new Error(
          acceptedResult.message ||
            "Unable to load accepted service requests."
        );
      }

      const pendingRequests = (
        Array.isArray(
          pendingResult.requests
        )
          ? pendingResult.requests
          : []
      ).map(normalizeRequest);

      const accepted = (
        Array.isArray(
          acceptedResult.requests
        )
          ? acceptedResult.requests
          : []
      ).map(normalizeRequest);

      setAssistanceId(
        loggedAssistanceId
      );

      setGarageId(
        relatedGarageId
      );

      setEmergencyRequests(
        pendingRequests
      );

      setAcceptedRequests(
        accepted
      );

     

      setSelectedReq(
        (previousSelected) => {
          if (
            previousSelected &&
            pendingRequests.some(
              (request) =>
                request.id ===
                previousSelected.id
            )
          ) {
            return previousSelected;
          }

          return pendingRequests.length >
            0
            ? {
                ...pendingRequests[0],
                status: "pending",
              }
            : null;
        }
      );
    } catch (error) {
      console.error(
        "Load resource requests error:",
        error
      );

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

  const refreshInterval = setInterval(() => {
    loadRequests();
  }, 5000);

  return () => {
    clearInterval(refreshInterval);
  };
}, []);

  // ====================================================
  // ALLOCATE TECHNICIAN
  // ====================================================

  const handleAllocate = async (technician) => {
    const shiftStatus = String(
      technician.shiftStatus ??
        technician.shift_status ??
        ""
    )
      .trim()
      .toUpperCase();

    const availabilityStatus = String(
      technician.availabilityStatus ??
        technician.availability_status ??
        ""
    )
      .trim()
      .toUpperCase();

    const isOnShift =
      shiftStatus === "ON" ||
      shiftStatus === "ON_SHIFT" ||
      shiftStatus === "ON-SHIFT" ||
      shiftStatus === "ACTIVE";

    if (!isOnShift) {
      setPopup({
        show: true,
        title: "TECHNICIAN OFF SHIFT",
        message:
          `${technician.fullName || technician.name || "This technician"} is currently off shift and cannot be allocated.`,
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });

      return;
    }

    if (availabilityStatus !== "AVAILABLE") {
      setPopup({
        show: true,
        title: "TECHNICIAN UNAVAILABLE",
        message:
          `${technician.fullName || technician.name || "This technician"} is currently busy and cannot be allocated to another vehicle.`,
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });

      return;
    }

    const vehicleNumber = selectedVehicles[technician.technicianId];

    if (!vehicleNumber) {
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

    const selectedRequest = acceptedRequests.find(
      (request) => request.vNo === vehicleNumber
    );

    if (!selectedRequest) {
      setPopup({
        show: true,
        title: "REQUEST NOT FOUND",
        message: "Unable to identify the selected service request.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
      return;
    }

    // ====================================================
    // CUSTOMER ARRIVAL CHECK
    // Technician allocation is allowed only after the
    // customer reaches the selected garage.
    // ====================================================

    const customerStage = String(
      selectedRequest.customerStage || ""
    )
      .trim()
      .toUpperCase();

    if (customerStage !== "ARRIVED_AT_GARAGE") {
      setPopup({
        show: true,
        title: "CUSTOMER NOT ARRIVED",
        message:
          `Vehicle ${vehicleNumber} has not arrived at the garage yet. ` +
          "A technician can be assigned only after the customer arrives at the garage.",
        color: "#f59e0b",
        showCancel: false,
        requestData: selectedRequest,
      });

      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/service-jobs/assign",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: selectedRequest.requestId,
            technicianId: technician.technicianId,
            assistanceId,
            garageId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to assign technician.");
      }

      setSelectedVehicles((previousVehicles) => {
        const updatedVehicles = { ...previousVehicles };
        delete updatedVehicles[technician.technicianId];
        return updatedVehicles;
      });

      setPopup({
        show: true,
        title: "TECHNICIAN ALLOCATED",
        message: `${technician.fullName} has been assigned to vehicle ${vehicleNumber}.`,
        color: "#52f0ac",
        showCancel: false,
        requestData: selectedRequest,
      });

      await loadRequests();
    } catch (error) {
      console.error("Technician allocation error:", error);
      setPopup({
        show: true,
        title: "ALLOCATION FAILED",
        message: error.message || "Unable to assign technician.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // MARK SERVICE JOB AS COMPLETED
  // Technician verbally informs the Assistance Officer
  // after finishing the repair. The Assistance Officer
  // confirms completion from this page.
  // ====================================================

  const handleCompleteJob = async (technician) => {
    const jobId = Number(
      technician?.jobId
    );

    const jobStatus = String(
      technician?.jobStatus || ""
    )
      .trim()
      .toUpperCase();

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      setPopup({
        show: true,
        title: "JOB NOT FOUND",
        message:
          "A valid active service job could not be identified for this technician.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });

      return;
    }

    if (
      jobStatus !==
      "IN_PROGRESS"
    ) {
      setPopup({
        show: true,
        title: "JOB NOT IN PROGRESS",
        message:
          "Only an in-progress service job can be marked as completed.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });

      return;
    }

    const technicianName =
      technician?.fullName ||
      technician?.name ||
      "Technician";

    const vehicleNumber =
      technician?.vehicleNumber ||
      "this vehicle";

    const confirmed =
      window.confirm(
        `${technicianName} has informed you that the repair for ${vehicleNumber} is finished. Mark this job as COMPLETED?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setCompletingJobId(
        jobId
      );

      const response =
        await fetch(
          `http://localhost:5000/api/service-jobs/${jobId}/complete`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to complete the service job."
        );
      }

      setPopup({
        show: true,
        title: "JOB COMPLETED",
        message:
          `${vehicleNumber} has been marked as completed successfully. ` +
          `${technicianName} is now available for another service job.`,
        color: "#52f0ac",
        showCancel: false,
        requestData: null,
      });

      await loadRequests();
    } catch (error) {
      console.error(
        "Complete service job error:",
        error
      );

      setPopup({
        show: true,
        title: "COMPLETION FAILED",
        message:
          error.message ||
          "Unable to mark the service job as completed.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
    } finally {
      setCompletingJobId(
        null
      );
    }
  };

  const openExtensionModal = (technician) => {
    if (!technician?.jobId || String(technician.jobStatus || "").toUpperCase() !== "IN_PROGRESS") {
      setPopup({
        show: true,
        title: "JOB NOT STARTED",
        message: "Extra time can be added only after the technician starts the job.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
      return;
    }

    setExtensionModal(technician);
    setExtensionTime("");
    setExtensionReason("");
  };

  const closeExtensionModal = () => {
    if (extensionLoading) return;
    setExtensionModal(null);
    setExtensionTime("");
    setExtensionReason("");
  };

  const handleExtendTime = async () => {
    if (!extensionModal || extensionLoading) return;

    if (!extensionTime) {
      setPopup({ show: true, title: "SELECT EXTRA TIME", message: "Please select the extra time requested by the technician.", color: "#e78181", showCancel: false, requestData: null });
      return;
    }

    if (!extensionReason.trim()) {
      setPopup({ show: true, title: "REASON REQUIRED", message: "Please enter the reason for the time extension.", color: "#e78181", showCancel: false, requestData: null });
      return;
    }

    try {
      setExtensionLoading(true);
      const response = await fetch("http://localhost:5000/api/time-extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extensionModal.jobId,
          technicianId: extensionModal.technicianId,
          extraTime: extensionTime,
          reason: extensionReason.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to extend the service job time.");
      }

      const technicianName = extensionModal.fullName || extensionModal.name || "Technician";
      setExtensionModal(null);
      setExtensionTime("");
      setExtensionReason("");

      setPopup({
        show: true,
        title: "TIME EXTENDED",
        message: `${technicianName} received the requested additional time successfully.`,
        color: "#52f0ac",
        showCancel: false,
        requestData: null,
      });

      await loadRequests();
    } catch (error) {
      console.error("Extend service time error:", error);
      setPopup({
        show: true,
        title: "TIME EXTENSION FAILED",
        message: error.message || "Unable to extend the service job time.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });
    } finally {
      setExtensionLoading(false);
    }
  };

    // ====================================================
  // ACCEPT REQUEST
  // ====================================================

  const handleAccept = async () => {
    if (
      !selectedReq ||
      actionLoading
    ) {
      return;
    }

    if (
      currentCapacity >=
      maxCapacity
    ) {
      setPopup({
        show: true,
        title: "CAPACITY FULL",
        message:
          "Garage capacity is full. Cannot accept this request.",
        color: "#e78181",
        showCancel: false,
        requestData: null,
      });

      return;
    }

    if (
      !Number.isInteger(
        assistanceId
      ) ||
      assistanceId <= 0
    ) {
      setPopup({
        show: true,
        title:
          "OFFICER NOT FOUND",
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

      const response =
        await fetch(
          `http://localhost:5000/api/service-requests/${selectedReq.requestId}/accept`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              assistanceId,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to accept the service request."
        );
      }

      const acceptedRequest = {
        ...selectedReq,
        status: "accepted",

        ticketNumber:
          result.data
            ?.ticketNumber ||
          selectedReq.ticketNumber,
      };

      const updatedRequests =
        emergencyRequests.filter(
          (request) =>
            request.id !==
            selectedReq.id
        );

      setEmergencyRequests(
        updatedRequests
      );

      setAcceptedRequests(
        (previousRequests) => [
          acceptedRequest,

          ...previousRequests.filter(
            (request) =>
              request.id !==
              acceptedRequest.id
          ),
        ]
      );

      setCurrentCapacity(
        (previousCapacity) =>
          Math.min(
            previousCapacity + 1,
            maxCapacity
          )
      );

      setSelectedReq(
        updatedRequests.length > 0
          ? {
              ...updatedRequests[0],
              status: "pending",
            }
          : null
      );

      setPopup({
        show: true,

        title:
          "REQUEST ACCEPTED",

        message:
          `${acceptedRequest.ticketNumber} has been accepted successfully.`,

        color: "#52f0ac",

        showCancel: false,

        requestData:
          acceptedRequest,
      });
    } catch (error) {
      console.error(
        "Accept request error:",
        error
      );

      setPopup({
        show: true,

        title:
          "ACCEPT FAILED",

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

  // ====================================================
  // REJECT REQUEST
  // ====================================================

  const handleReject = async () => {
    if (
      !selectedReq ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await fetch(
          `http://localhost:5000/api/service-requests/${selectedReq.requestId}/reject`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to reject the service request."
        );
      }

      const rejectedRequest = {
        ...selectedReq,

        status: "rejected",

        ticketNumber:
          result.data
            ?.ticketNumber ||
          selectedReq.ticketNumber,
      };

      const updatedRequests =
        emergencyRequests.filter(
          (request) =>
            request.id !==
            selectedReq.id
        );

      setEmergencyRequests(
        updatedRequests
      );

      setRejectedRequests(
        (previousRequests) => [
          rejectedRequest,

          ...previousRequests.filter(
            (request) =>
              request.id !==
              rejectedRequest.id
          ),
        ]
      );

      setSelectedReq(
        updatedRequests.length > 0
          ? {
              ...updatedRequests[0],
              status: "pending",
            }
          : null
      );

      setPopup({
        show: true,

        title:
          "REQUEST REJECTED",

        message:
          `${rejectedRequest.ticketNumber} has been rejected successfully.`,

        color: "#f59e0b",

        showCancel: false,

        requestData:
          rejectedRequest,
      });
    } catch (error) {
      console.error(
        "Reject request error:",
        error
      );

      setPopup({
        show: true,

        title:
          "REJECT FAILED",

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

  // ====================================================
  // CLOSE POPUP
  // ====================================================

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

  // ====================================================
  // FILTER REQUESTS
  // ====================================================

  const filteredEmergencyRequests =
    emergencyRequests.filter(
      (request) => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          String(
            request.ticketNumber ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.id ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.name ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.contact ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.vNo ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.vehicle ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.loc ||
            ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            request.garageName ||
            ""
          )
            .toLowerCase()
            .includes(query)
        );
      }
    );
      // ====================================================
  // REQUEST MAP
  // ====================================================

  const RequestMap = ({
    request,
    height = "h-64",
  }) => {
    const hasCustomerLocation =
      Number.isFinite(
        Number(request?.lat)
      ) &&
      Number.isFinite(
        Number(request?.lng)
      );

    const hasGarageLocation =
      Number.isFinite(
        Number(request?.garageLat)
      ) &&
      Number.isFinite(
        Number(request?.garageLng)
      );

    if (!hasCustomerLocation) {
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
              Latitude and longitude
              were not received for
              this request.
            </p>
          </div>
        </div>
      );
    }

    const customerLocation = [
      Number(request.lat),
      Number(request.lng),
    ];

    const garageLocation =
      hasGarageLocation
        ? [
            Number(
              request.garageLat
            ),
            Number(
              request.garageLng
            ),
          ]
        : null;

    const mapCenter =
      garageLocation
        ? [
            (
              customerLocation[0] +
              garageLocation[0]
            ) / 2,

            (
              customerLocation[1] +
              garageLocation[1]
            ) / 2,
          ]
        : customerLocation;

    return (
      <div
        className={`${height} rounded-lg overflow-hidden border border-[#1a1f26] mb-6`}
      >
        <MapContainer
          key={`${request.id}-${customerLocation[0]}-${customerLocation[1]}-${garageLocation?.[0] ?? "no-garage"}-${garageLocation?.[1] ?? "no-garage"}`}
          center={mapCenter}
          zoom={
            garageLocation
              ? 12
              : 14
          }
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Customer Marker */}
          <Marker
            position={
              customerLocation
            }
          >
            <Popup>
              <strong>
                {request?.name}
              </strong>

              <br />
              Customer Location

              <br />
              Ticket:{" "}
              {request?.ticketNumber}

              <br />
              Contact:{" "}
              {request?.contact}

              <br />
              Vehicle:{" "}
              {request?.vehicle} (
              {request?.vNo})

              <br />
              Latitude:{" "}
              {customerLocation[0]
                .toFixed(6)}

              <br />
              Longitude:{" "}
              {customerLocation[1]
                .toFixed(6)}
            </Popup>
          </Marker>

          {/* Garage Marker and Route */}
          {garageLocation && (
            <>
              <Marker
                position={
                  garageLocation
                }
              >
                <Popup>
                  <strong>
                    {
                      request?.garageName
                    }
                  </strong>

                  <br />
                  Selected Garage

                  {request
                    ?.garageAddress && (
                    <>
                      <br />
                      {
                        request.garageAddress
                      }
                    </>
                  )}

                  <br />
                  Distance:{" "}
                  {request?.dist}

                  <br />
                  Estimated Time:{" "}
                  {request?.eta}
                </Popup>
              </Marker>

              <RoadRoute
                customerLocation={
                  customerLocation
                }
                garageLocation={
                  garageLocation
                }
              />
            </>
          )}
        </MapContainer>
      </div>
    );
  };

  // ====================================================
  // COMPONENT UI
  // ====================================================

  return (
    <>
      <div className="w-full h-full min-h-0 bg-[#0b0e14] text-[#a0a8b7] font-sans overflow-hidden flex flex-col">
      {/* HEADER */}

      

      <div className="flex-1 min-h-0 w-full bg-[#0b0e14] text-[#a0a8b7] p-4 md:p-8 font-sans overflow-y-auto relative">
        {/* REQUEST DETAILS MODAL */}

        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-5 md:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() =>
                  setShowDetailsModal(
                    null
                  )
                }
                className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
                aria-label="Close details"
              >
                <X />
              </button>

              <h2 className="text-xl font-bold text-white mb-6 uppercase">
                Request Details:{" "}
                {
                  showDetailsModal.ticketNumber
                }
              </h2>

              <RequestMap
                request={
                  showDetailsModal
                }
                height="h-56"
              />

              <div className="space-y-4 text-white">
                <p>
                  Ticket Number:{" "}
                  <span className="text-[#3b82f6] font-bold">
                    {
                      showDetailsModal.ticketNumber
                    }
                  </span>
                </p>

                <p>
                  Customer:{" "}
                  <span className="text-[#3b82f6]">
                    {
                      showDetailsModal.name
                    }
                  </span>
                </p>

                <p>
                  Contact:{" "}
                  {
                    showDetailsModal.contact
                  }
                </p>

                <p>
                  Vehicle:{" "}
                  {
                    showDetailsModal.vehicle
                  }{" "}
                  (
                  {
                    showDetailsModal.vNo
                  }
                  )
                </p>

                <p>
                  Garage:{" "}
                  {showDetailsModal.garageName ||
                    showDetailsModal.loc}
                </p>

                <p>
                  Distance to Garage:{" "}
                  <span className="font-bold text-[#3b82f6]">
                    {
                      showDetailsModal.dist
                    }
                  </span>
                </p>

                <p>
                  Estimated Travel
                  Time:{" "}
                  <span className="font-bold text-[#3b82f6]">
                    {
                      showDetailsModal.eta
                    }
                  </span>
                </p>

                <p className="text-xs text-[#6e7681]">
                  Distance and time
                  are approximate
                  estimates based on
                  GPS coordinates.
                </p>

                <p>
                  Status:{" "}
                  <span
                    className={`capitalize font-bold ${
                      showDetailsModal.status ===
                      "accepted"
                        ? "text-[#52f0ac]"
                        : showDetailsModal.status ===
                          "rejected"
                        ? "text-[#e78181]"
                        : "text-white"
                    }`}
                  >
                    {
                      showDetailsModal.status
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TIME EXTENSION MODAL */}

        {extensionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-6 md:p-8 w-full max-w-[480px] shadow-xl relative">
              <button
                type="button"
                onClick={closeExtensionModal}
                disabled={extensionLoading}
                className="absolute right-4 top-4 text-[#6e7681] hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white mb-2">EXTEND REPAIR TIME</h2>
              <p className="text-sm text-[#6e7681] mb-6">Record the extra time requested verbally by the technician.</p>

              <div className="bg-[#0b0e14] border border-[#1a1f26] rounded-lg p-4 mb-5 space-y-2">
                <p className="text-sm">Technician: <span className="text-white font-bold">{extensionModal.fullName || extensionModal.name || "Technician"}</span></p>
                <p className="text-sm">Vehicle: <span className="text-[#3b82f6] font-bold">{extensionModal.vehicleNumber || "Not available"}</span></p>
                <p className="text-sm">Ticket: <span className="text-white">{extensionModal.ticketNumber || "Not available"}</span></p>
                <p className="text-sm">Current Estimated Completion: <span className="text-white">{extensionModal.estimatedCompletionTime ? new Date(extensionModal.estimatedCompletionTime).toLocaleString() : "Not available"}</span></p>
              </div>

              <label className="block text-xs uppercase tracking-wider text-[#6e7681] mb-2">Extra Time</label>
              <select
                value={extensionTime}
                onChange={(event) => setExtensionTime(event.target.value)}
                disabled={extensionLoading}
                className="w-full bg-[#0b0e14] border border-[#2b313d] text-white rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#3b82f6]"
              >
                <option value="">Select Extra Time</option>
                {extensionTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <label className="block text-xs uppercase tracking-wider text-[#6e7681] mb-2">Reason</label>
              <textarea
                value={extensionReason}
                onChange={(event) => setExtensionReason(event.target.value)}
                disabled={extensionLoading}
                rows={4}
                placeholder="Enter the reason given by the technician..."
                className="w-full resize-none bg-[#0b0e14] border border-[#2b313d] text-white rounded-lg px-4 py-3 outline-none focus:border-[#3b82f6]"
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleExtendTime}
                  disabled={extensionLoading}
                  className="flex-1 bg-[#3b82f6] hover:bg-[#45cc92] disabled:opacity-60 text-black font-bold py-3 rounded-lg"
                >
                  {extensionLoading ? "UPDATING..." : "CONFIRM EXTENSION"}
                </button>
                <button
                  type="button"
                  onClick={closeExtensionModal}
                  disabled={extensionLoading}
                  className="flex-1 border border-[#6e7681] text-white disabled:opacity-60 py-3 rounded-lg"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERAL POPUP */}

        {popup.show && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-6 md:p-8 w-full max-w-[420px] text-center shadow-xl">
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  color:
                    popup.color,
                }}
              >
                {popup.title}
              </h2>

              <p className="text-[#cbd5e1] mb-6">
                {popup.message}
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPopup({
                      show: false,
                      title: "",
                      message: "",
                      color:
                        "#52f0ac",
                      showCancel:
                        false,
                      requestData:
                        null,
                    })
                  }
                  className="bg-[#3b82f6] hover:bg-[#45cc92] text-black font-bold px-6 py-2 rounded-lg cursor-pointer"
                >
                  OK
                </button>

                {popup.showCancel && (
                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg cursor-pointer"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGE TITLE */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold uppercase tracking-wider">
              Dispatch Center
            </h1>

            {garageId && (
              <p className="text-xs text-[#6e7681] mt-1">
                Garage ID:{" "}
                {garageId}
              </p>
            )}
          </div>

          <div className="text-sm">
            Capacity:
            <span className="text-white font-bold ml-2">
              {currentCapacity}/
              {maxCapacity}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`grid ${
              emergencyRequests.length ===
                0 &&
              !selectedReq
                ? "grid-cols-1"
                : "grid-cols-1 xl:grid-cols-2"
            } gap-6`}
          >
            {/* PENDING REQUESTS */}

            <div className="space-y-4">
              <h2 className="text-white font-bold mb-2">
                PENDING REQUESTS
              </h2>

              {requestsLoading ? (
                <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-8 text-center">
                  <p className="text-sm text-[#6e7681]">
                    Loading pending
                    requests...
                  </p>
                </div>
              ) : requestsError ? (
                <div className="bg-[#15191f] rounded-xl border border-red-900/40 p-8 text-center">
                  <AlertCircle
                    size={45}
                    className="text-[#e78181] mx-auto mb-4"
                  />

                  <h2 className="text-white font-bold">
                    Unable to Load
                    Requests
                  </h2>

                  <p className="text-sm text-[#e78181] mt-2">
                    {requestsError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadRequests
                    }
                    className="mt-4 bg-[#3b82f6] text-black px-4 py-2 rounded text-xs font-bold cursor-pointer"
                  >
                    TRY AGAIN
                  </button>
                </div>
              ) : filteredEmergencyRequests.length >
                0 ? (
                filteredEmergencyRequests.map(
                  (request) => (
                    <div
                      key={
                        request.id
                      }
                      onClick={() =>
                        setSelectedReq({
                          ...request,
                          status:
                            "pending",
                        })
                      }
                      className={`cursor-pointer rounded-xl p-6 border transition-all ${
                        selectedReq?.id ===
                        request.id
                          ? "border-[#3b82f6] shadow-[0_0_12px_rgba(82,240,172,0.2)]"
                          : "border-[#1a1f26] bg-[#15191f]"
                      }`}
                    >
                      <h2 className="text-[#ce2222] font-bold flex items-center gap-2">
                        <AlertCircle
                          size={18}
                        />

                        EMERGENCY
                        REQUEST
                      </h2>

                      <p className="text-xs text-[#3b82f6] font-bold mt-2 mb-4">
                        Ticket:{" "}
                        {
                          request.ticketNumber
                        }
                      </p>

                      <p className="text-sm">
                        Customer:
                        <span className="text-white ml-2">
                          {
                            request.name
                          }
                        </span>
                      </p>

                      <p className="text-sm mt-1">
                        Contact:
                        <span className="text-white ml-2">
                          {
                            request.contact
                          }
                        </span>
                      </p>

                      <p className="text-sm mt-1">
                        Vehicle No:
                        <span className="text-white ml-2">
                          {
                            request.vNo
                          }
                        </span>
                      </p>

                      <p className="text-sm mt-1">
                        Vehicle:
                        <span className="text-white ml-2">
                          {
                            request.vehicle
                          }
                        </span>
                      </p>

                      <p className="text-sm mt-1">
                        Garage:
                        <span className="text-white ml-2">
                          {request.garageName ||
                            request.loc}
                        </span>
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-8 text-center">
                  <AlertCircle
                    size={45}
                    className="text-[#3b82f6] mx-auto mb-4"
                  />

                  <h2 className="text-white font-bold">
                    No Pending Requests
                  </h2>

                  <p className="text-sm text-[#6e7681] mt-2">
                    Customer requests
                    will appear here
                    automatically.
                  </p>
                </div>
              )}
            </div>

                       {/* SELECTED REQUEST DETAILS */}

            {selectedReq ? (
              <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6 flex flex-col">
                <RequestMap
                  request={selectedReq}
                  height="h-64"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-black/40 px-4 py-3 rounded-lg border border-[#3b82f6]/30">
                  <div className="flex items-center gap-3 text-[#3b82f6]">
                    <Clock size={18} />

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#6e7681]">
                        Estimated Time
                      </p>

                      <span className="font-bold">
                        {selectedReq.eta}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[#3b82f6]">
                    <Navigation size={18} />

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#6e7681]">
                        Distance to Garage
                      </p>

                      <span className="font-bold">
                        {selectedReq.dist}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-[10px] text-[#3b82f6] uppercase tracking-widest">
                  {selectedReq.loc}
                </p>

                <div className="bg-[#0b0e14] border border-[#1a1f26] rounded-lg p-4 mb-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Ticket Number
                    </span>

                    <span className="text-[#3b82f6] font-bold text-right">
                      {selectedReq.ticketNumber}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Customer
                    </span>

                    <span className="text-white font-medium text-right">
                      {selectedReq.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Contact
                    </span>

                    <span className="text-white font-medium text-right">
                      {selectedReq.contact}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Vehicle
                    </span>

                    <span className="text-white font-medium text-right">
                      {selectedReq.vehicle} ({selectedReq.vNo})
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Garage
                    </span>

                    <span className="text-white font-medium text-right">
                      {selectedReq.garageName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#6e7681]">
                      Status
                    </span>

                    <span className="text-white font-bold">
                      {selectedReq.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-auto">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="flex-1 bg-[#52f0ac] hover:bg-[#45cc92] disabled:cursor-not-allowed disabled:opacity-60 text-black py-3 rounded font-bold cursor-pointer"
                  >
                    {actionLoading
                      ? "PROCESSING..."
                      : "ACCEPT REQUEST"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 border border-[#e78181] text-[#e78181] disabled:cursor-not-allowed disabled:opacity-60 py-3 rounded font-bold cursor-pointer"
                  >
                    {actionLoading
                      ? "PROCESSING..."
                      : "REJECT"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-12 flex flex-col items-center justify-center text-center">
                <AlertCircle
                  size={50}
                  className="text-[#3b82f6] mb-4"
                />

                <h2 className="text-white text-xl font-bold">
                  All Requests Processed
                </h2>
              </div>
            )}
          </div>

          {/* TECHNICIAN SECTIONS */}

          <div className="grid xl:grid-cols-2 gap-6">
            {/* AVAILABLE TECHNICIANS */}

            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
              <h2 className="text-[#3b82f6] font-bold mb-5">
                AVAILABLE TECHNICIANS
              </h2>

               {techniciansLoading ? (
  <p className="text-sm text-[#6e7681]">
    Loading technicians...
  </p>
) : techniciansError ? (
  <p className="text-sm text-[#e78181]">
    {techniciansError}
  </p>
) : availableTechs.length > 0 ? (
  availableTechs.map(
    (technician) => (
      <div
        key={technician.technicianId}
        className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4"
      >
        <div className="flex gap-3 items-center mb-2">
          <User size={35} />

          <div>
            <p className="text-white font-bold">
              {technician.fullName}
            </p>

            <p className="text-xs text-[#6e7681]">
              {technician.specialization?.length > 0
                ? technician.specialization.join(", ")
                : "No specialization"}
            </p>
          </div>
        </div>

        <select
          className="w-full bg-[#15191f] border border-[#1a2e26] text-white p-2 mb-2 rounded text-sm"
          value={
            selectedVehicles[
              technician.technicianId
            ] || ""
          }
          onChange={(event) =>
            setSelectedVehicles(
              (
                previousVehicles
              ) => ({
                ...previousVehicles,
                [technician.technicianId]:
                  event.target.value,
              })
            )
          }
        >
          <option value="">
            Select Vehicle
          </option>

          {acceptedRequests.map(
            (request) => (
              <option
                key={request.id}
                value={request.vNo}
              >
                {request.ticketNumber} - {request.vNo}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={() =>
            handleAllocate(
              technician
            )
          }
          className="w-full bg-[#3b82f6] text-black px-4 py-2 rounded text-xs font-bold hover:bg-[#45cc92] cursor-pointer"
        >
          ALLOCATE
        </button>
      </div>
    )
  )
) : (
                <p className="text-sm text-[#6e7681]">
                  No technicians are currently available.
                </p>
              )}
            </div>

            {/* ACTIVE FIELD TECHNICIANS */}

            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
              <h2 className="text-[#ce2222] font-bold mb-5">
                ACTIVE FIELD TECHS
              </h2>

              {techniciansLoading ? (
                <p className="text-sm text-[#6e7681]">Loading active technicians...</p>
              ) : techniciansError ? (
                <p className="text-sm text-[#e78181]">{techniciansError}</p>
              ) : activeTechs.length > 0 ? (
                activeTechs.map((technician) => {
                  const isInProgress =
                    String(technician.jobStatus || "").toUpperCase() === "IN_PROGRESS";

                  return (
                    <div
                      key={technician.technicianId}
                      className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 items-start">
                          <User size={35} />
                          <div>
                            <p className="text-white font-bold">
                              {technician.fullName || technician.name || "Technician"}
                            </p>
                            <p className="text-xs text-[#6e7681] mt-1">
                              {technician.specialization?.length > 0
                                ? technician.specialization.join(", ")
                                : "Active Technician"}
                            </p>
                          </div>
                        </div>

                        <p className="text-[#e78181] text-xs font-bold uppercase">
                          {technician.jobStatus || technician.availabilityStatus || "BUSY"}
                        </p>
                      </div>

                      <div className="mt-4 bg-[#15191f] border border-[#1a1f26] rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6e7681]">Vehicle</span>
                          <span className="text-white font-bold text-right">
                            {technician.vehicleNumber || "Waiting for job start"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6e7681]">Ticket</span>
                          <span className="text-[#3b82f6] text-right">
                            {technician.ticketNumber || "Not available"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6e7681]">Estimated Completion</span>
                          <span className="text-white text-right">
                            {technician.estimatedCompletionTime
                              ? new Date(technician.estimatedCompletionTime).toLocaleString()
                              : "Not set yet"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openExtensionModal(
                              technician
                            )
                          }
                          disabled={
                            !isInProgress ||
                            !technician.jobId ||
                            completingJobId ===
                              technician.jobId
                          }
                          className="w-full border border-[#f59e0b] text-[#f59e0b] px-4 py-2 rounded text-xs font-bold hover:bg-[#f59e0b]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isInProgress
                            ? "EXTEND TIME"
                            : "WAITING FOR JOB START"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteJob(
                              technician
                            )
                          }
                          disabled={
                            !isInProgress ||
                            !technician.jobId ||
                            completingJobId ===
                              technician.jobId
                          }
                          className="w-full border border-[#52f0ac] bg-[#52f0ac]/10 text-[#52f0ac] px-4 py-2 rounded text-xs font-bold hover:bg-[#52f0ac]/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {completingJobId ===
                          technician.jobId
                            ? "COMPLETING..."
                            : isInProgress
                            ? "MARK AS COMPLETED"
                            : "COMPLETE UNAVAILABLE"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-[#6e7681]">No active field technicians.</p>
              )}
            </div>

            {/* OFF SHIFT TECHNICIANS */}

            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6 xl:col-span-2">
              <h2 className="text-[#e78181] font-bold mb-5">
                OFF SHIFT TECHNICIANS
              </h2>

              {techniciansLoading ? (
                <p className="text-sm text-[#6e7681]">
                  Loading technicians...
                </p>
              ) : techniciansError ? (
                <p className="text-sm text-[#e78181]">
                  {techniciansError}
                </p>
              ) : offShiftTechs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {offShiftTechs.map((technician) => (
                    <div
                      key={technician.technicianId}
                      className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 opacity-75"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3 items-center">
                          <User size={35} />

                          <div>
                            <p className="text-white font-bold">
                              {technician.fullName ||
                                technician.name ||
                                "Technician"}
                            </p>

                            <p className="text-xs text-[#6e7681] mt-1">
                              {Array.isArray(
                                technician.specialization
                              ) &&
                              technician.specialization.length > 0
                                ? technician.specialization.join(", ")
                                : technician.specialization ||
                                  "No specialization"}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#e78181] border border-[#e78181]/40 bg-[#e78181]/10 px-2 py-1 rounded-full whitespace-nowrap">
                          OFF SHIFT
                        </span>
                      </div>

                      <div className="mt-4 bg-[#15191f] border border-[#1a1f26] rounded-lg p-3 text-xs">
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6e7681]">
                            Availability
                          </span>

                          <span className="text-[#6e7681] font-bold">
                            {technician.availabilityStatus ||
                              technician.availability_status ||
                              "UNKNOWN"}
                          </span>
                        </div>
                      </div>

                      <select
                        disabled
                        className="w-full mt-3 bg-[#15191f] border border-[#1a1f26] text-[#6e7681] p-2 rounded text-sm cursor-not-allowed opacity-50"
                      >
                        <option>
                          Technician is off shift
                        </option>
                      </select>

                      <button
                        type="button"
                        disabled
                        className="w-full mt-2 bg-[#2b313d] text-[#6e7681] px-4 py-2 rounded text-xs font-bold cursor-not-allowed"
                      >
                        ALLOCATE DISABLED
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6e7681]">
                  No technicians are currently off shift.
                </p>
              )}
            </div>
          </div>

          {/* ACCEPTED AND REJECTED REQUESTS */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {/* ACCEPTED REQUESTS */}

            <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
              <h2 className="text-[#52f0ac] font-bold mb-4">
                ACCEPTED REQUESTS
              </h2>

              {acceptedRequests.length > 0 ? (
                acceptedRequests.map(
                  (request) => (
                    <div
                      key={request.id}
                      className="bg-[#0b0e14] border border-[#1a2e26] rounded-lg p-4 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div>
                        <p className="text-white font-bold">
                          {request.ticketNumber}
                        </p>

                        <p className="text-sm text-white mt-1">
                          Vehicle:{" "}
                          {request.vNo}
                        </p>

                        <p className="text-xs text-[#52f0ac] mt-1">
                          Accepted
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowDetailsModal(
                            request
                          )
                        }
                        className="bg-[#3b82f6] text-black px-3 py-2 rounded text-xs font-bold cursor-pointer"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-[#6e7681]">
                  No accepted requests yet.
                </p>
              )}
            </div>

            {/* REJECTED REQUESTS */}

            <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
              <h2 className="text-[#e78181] font-bold mb-4">
                REJECTED REQUESTS
              </h2>

              {rejectedRequests.length > 0 ? (
                rejectedRequests.map(
                  (request) => (
                    <div
                      key={request.id}
                      className="bg-[#0b0e14] border border-[#2b1d1d] rounded-lg p-4 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div>
                        <p className="text-white font-bold">
                          {request.ticketNumber}
                        </p>

                        <p className="text-sm text-white mt-1">
                          Vehicle:{" "}
                          {request.vNo}
                        </p>

                        <p className="text-xs text-[#e78181] mt-1">
                          Rejected
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowDetailsModal(
                            request
                          )
                        }
                        className="border border-[#e78181] text-[#e78181] px-3 py-2 rounded text-xs font-bold cursor-pointer"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-[#6e7681]">
                  No rejected requests yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ResourceSchedule;