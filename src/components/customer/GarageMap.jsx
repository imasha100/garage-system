import React, { useEffect, useState } from "react";
import { X, Clock, MapPin, User, Users } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
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

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (Array.isArray(center) && center.length === 2) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);

  return null;
}

export default function GarageMap({
  onNavigate,
  setSelectedGarage,
  selectedGarage,
  setResourceRequests,
}) {
  const [isRequested, setIsRequested] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [loggedCustomerName, setLoggedCustomerName] =
    useState("Customer");

  useEffect(() => {
    const loadCustomerName = () => {
      try {
        const storedCustomer = JSON.parse(
          sessionStorage.getItem("customer") ||
            sessionStorage.getItem("loggedCustomer") ||
            sessionStorage.getItem("customerData") ||
            "null"
        );

        const customerName =
          storedCustomer?.fullName ||
          storedCustomer?.full_name ||
          storedCustomer?.customerName ||
          storedCustomer?.name;

        if (customerName) {
          setLoggedCustomerName(customerName);
          return;
        }

        const latestRequest = JSON.parse(
          sessionStorage.getItem("latestServiceRequest") ||
            "null"
        );

        const requestCustomerName =
          latestRequest?.customerName ||
          latestRequest?.name;

        if (requestCustomerName) {
          setLoggedCustomerName(
            requestCustomerName
          );
          return;
        }

        setLoggedCustomerName("Customer");
      } catch (error) {
        console.error(
          "Load customer name error:",
          error
        );

        setLoggedCustomerName(
          "Customer"
        );
      }
    };

    loadCustomerName();

    window.addEventListener(
      "latestServiceRequestUpdated",
      loadCustomerName
    );

    return () => {
      window.removeEventListener(
        "latestServiceRequestUpdated",
        loadCustomerName
      );
    };
  }, []);

  const [customerStatusPopup, setCustomerStatusPopup] = useState({
    show: false,
    title: "",
    message: "",
    ticketNumber: "",
    status: "",
  });

  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const INITIAL_MAP_CENTER = [7.8731, 80.7718];
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [garageList, setGarageList] = useState([]);
  const [garagesLoading, setGaragesLoading] = useState(true);
  const [garagesError, setGaragesError] = useState("");

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleTypesLoading, setVehicleTypesLoading] = useState(true);
  const [vehicleTypesError, setVehicleTypesError] = useState("");

  const [requestData, setRequestData] = useState({
    customerName: "",
    contact: "",
    vehicleNumber: "",
    vehicleType: "",
  });

  const [requestErrors, setRequestErrors] = useState({
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
    if (!userLocation) {
      return {
        ...garage,
        distanceValue: Number.POSITIVE_INFINITY,
        distance: "Waiting for location",
        time: "N/A",
      };
    }

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
      distanceValue: distanceKm,
      distance: `${distanceKm.toFixed(1)} KM`,
      time: `${timeMins} MINS`,
    };
  };

  const requestCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setUserLocation(null);
      setLocationError(
        "This browser does not support live location. Please use a browser with location access."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setLocationError("");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Unable to get current location:", error);
        setUserLocation(null);

        let message =
          "Unable to detect your current location. Please allow location access and try again.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Allow location access in the browser and click Use My Location.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Your current location is unavailable. Check Windows Location Services and try again.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "Location detection timed out. Please click Use My Location and try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let refreshInterval;

    const loadGaragesWithLiveTechnicians = async (
      showLoading = false
    ) => {
      try {
        if (showLoading) {
          setGaragesLoading(true);
        }

        setGaragesError("");

        const response = await fetch(
          "http://localhost:5000/api/garages"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load registered garages."
          );
        }

        const rawGarages =
          Array.isArray(result.data)
            ? result.data
            : [];

        const normalizedGarages =
          await Promise.all(
            rawGarages.map(async (garage) => {
              const latitude =
                Number(garage.latitude);
              const longitude =
                Number(garage.longitude);

              if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
              ) {
                return null;
              }

              const garageId =
                Number(garage.garage_id);

              let freeTechs = [];

              if (
                Number.isInteger(garageId) &&
                garageId > 0
              ) {
                try {
                  const techResponse =
                    await fetch(
                      `http://localhost:5000/api/technicians?garageId=${garageId}`
                    );

                  const techResult =
                    await techResponse.json();

                  if (
                    techResponse.ok &&
                    techResult.success !== false
                  ) {
                    const technicians =
                      Array.isArray(
                        techResult.technicians
                      )
                        ? techResult.technicians
                        : [];

                    freeTechs = technicians
                      .filter((technician) => {
                        const shiftStatus =
                          String(
                            technician.shiftStatus ??
                              technician.shift_status ??
                              "OFF"
                          )
                            .trim()
                            .toUpperCase();

                        const availabilityStatus =
                          String(
                            technician.availabilityStatus ??
                              technician.availability_status ??
                              "AVAILABLE"
                          )
                            .trim()
                            .toUpperCase();

                        return (
                          shiftStatus === "ON" &&
                          availabilityStatus ===
                            "AVAILABLE"
                        );
                      })
                      .map((technician) => ({
                        id:
                          technician.technicianId ??
                          technician.technician_id,
                        name:
                          technician.fullName ??
                          technician.full_name ??
                          "Technician",
                        specialization:
                          Array.isArray(
                            technician.specialization
                          )
                            ? technician.specialization
                                .filter(Boolean)
                                .join(", ")
                            : String(
                                technician.specialization ||
                                  "General Service"
                              ),
                        shiftStatus:
                          technician.shiftStatus ??
                          technician.shift_status ??
                          "ON",
                        availabilityStatus:
                          technician.availabilityStatus ??
                          technician.availability_status ??
                          "AVAILABLE",
                      }));
                  }
                } catch (technicianError) {
                  console.error(
                    `Failed to load technicians for garage ${garageId}:`,
                    technicianError
                  );
                }
              }

              return {
                id: garage.garage_id,
                name:
                  garage.garage_name ||
                  "Registered Garage",
                address:
                  garage.address ||
                  "Address not available",
                contact:
                  garage.contact_number ||
                  "Contact not available",
                district:
                  garage.district ||
                  "District not available",
                capacity:
                  Number(garage.capacity) || 0,
                openingTime:
                  garage.opening_time || "N/A",
                closingTime:
                  garage.closing_time || "N/A",
                workingDays:
                  garage.working_days || "N/A",
                shiftType:
                  garage.shift_type || "N/A",
                workload:
                  freeTechs.length > 0
                    ? "AVAILABLE"
                    : "QUEUEING",
                status: "REGISTERED GARAGE",
                specialization:
                  "General Vehicle Service",
                specDesc: `${
                  garage.garage_name ||
                  "This garage"
                } is registered in the SwiftGarage system.`,
                lat: latitude,
                lng: longitude,
                freeTechs,
              };
            })
          );

        const validGarages =
          normalizedGarages.filter(Boolean);

        if (isMounted) {
          setGarageList(validGarages);

          setSelectedGarage(
            (previousSelectedGarage) => {
              if (!previousSelectedGarage) {
                return previousSelectedGarage;
              }

              const refreshedGarage =
                validGarages.find(
                  (garage) =>
                    Number(garage.id) ===
                    Number(
                      previousSelectedGarage.id
                    )
                );

              if (!refreshedGarage) {
                return previousSelectedGarage;
              }

              return {
                ...previousSelectedGarage,
                ...refreshedGarage,
                distance:
                  previousSelectedGarage.distance,
                distanceValue:
                  previousSelectedGarage.distanceValue,
                time:
                  previousSelectedGarage.time,
              };
            }
          );
        }
      } catch (error) {
        console.error(
          "Failed to load garages:",
          error
        );

        if (isMounted) {
          setGaragesError(
            error.message ||
              "Unable to load registered garages from the server."
          );

          if (showLoading) {
            setGarageList([]);
          }
        }
      } finally {
        if (
          isMounted &&
          showLoading
        ) {
          setGaragesLoading(false);
        }
      }
    };

    loadGaragesWithLiveTechnicians(true);

    refreshInterval =
      window.setInterval(() => {
        loadGaragesWithLiveTechnicians(false);
      }, 5000);

    return () => {
      isMounted = false;

      if (refreshInterval) {
        window.clearInterval(
          refreshInterval
        );
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadVehicleTypes = async () => {
      try {
        setVehicleTypesLoading(true);
        setVehicleTypesError("");

        const response = await fetch(
          "http://localhost:5000/api/vehicle-types"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load vehicle types."
          );
        }

        if (isMounted) {
          setVehicleTypes(
            Array.isArray(result.data) ? result.data : []
          );
        }
      } catch (error) {
        console.error("Failed to load vehicle types:", error);

        if (isMounted) {
          setVehicleTypes([]);
          setVehicleTypesError(
            error.message || "Unable to load vehicle types."
          );
        }
      } finally {
        if (isMounted) {
          setVehicleTypesLoading(false);
        }
      }
    };

    loadVehicleTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const checkLatestRequestStatus = async () => {
      try {
        const storedRequest = JSON.parse(
          sessionStorage.getItem("latestServiceRequest") || "null"
        );

        const contact = String(
          storedRequest?.contact ||
            storedRequest?.customerContact ||
            ""
        )
          .trim()
          .replace(/\s+/g, "");

        const vehicleNumber = String(
          storedRequest?.vehicleNumber ||
            storedRequest?.vNo ||
            ""
        )
          .trim()
          .toUpperCase();

        if (
          !/^0\d{9}$/.test(contact) ||
          !vehicleNumber
        ) {
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/service-requests/customer/${encodeURIComponent(
            contact
          )}/latest?vehicleNumber=${encodeURIComponent(
            vehicleNumber
          )}`
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.request) {
          return;
        }

        const latestRequest = result.request;
        const latestStatus = String(
          latestRequest.requestStatus || "Pending"
        ).toLowerCase();

        const ticketNumber =
          latestRequest.ticketNumber ||
          storedRequest?.ticketNumber ||
          `SR-${String(
            latestRequest.requestId || storedRequest?.requestId || ""
          ).padStart(4, "0")}`;

        const updatedStoredRequest = {
          ...storedRequest,
          ...latestRequest,
          id: latestRequest.requestId,
          requestId: latestRequest.requestId,
          ticketNumber,
          contact,
          status: latestStatus,
          requestStatus: latestRequest.requestStatus || "Pending",
        };

        sessionStorage.setItem(
          "latestServiceRequest",
          JSON.stringify(updatedStoredRequest)
        );

        sessionStorage.setItem(
          "serviceRequestId",
          String(latestRequest.requestId)
        );

        if (
          !isMounted ||
          !["accepted", "rejected"].includes(latestStatus)
        ) {
          return;
        }

        const notificationKey =
          `customerRequestNotification:${latestRequest.requestId}:${latestStatus}`;

        if (sessionStorage.getItem(notificationKey)) {
          return;
        }

        sessionStorage.setItem(notificationKey, "shown");

        if (latestStatus === "accepted") {
          setCustomerStatusPopup({
            show: true,
            title: "Request Accepted",
            message: `Your request has been accepted by ${
              latestRequest.garageName || "the selected garage"
            }.

Garage Contact: ${
              latestRequest.garageContact || "Not available"
            }

The garage will contact you shortly. If you need immediate assistance, you may call the above number.`,
            ticketNumber,
            status: "accepted",
          });
        } else {
          setCustomerStatusPopup({
            show: true,
            title: "Request Rejected",
            message:
              "Your request could not be accepted by the selected garage. Please select another garage and submit a new request.",
            ticketNumber,
            status: "rejected",
          });
        }
      } catch (error) {
        console.error("Check customer request status error:", error);
      }
    };

    checkLatestRequestStatus();
    intervalId = window.setInterval(checkLatestRequestStatus, 5000);

    return () => {
      isMounted = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const resetForm = () => {
    setRequestData({
      customerName: "",
      contact: "",
      vehicleNumber: "",
      vehicleType: "",
    });

    setRequestErrors({
      customerName: "",
      contact: "",
      vehicleNumber: "",
      vehicleType: "",
    });
  };

  const updateRequestField = (field, value) => {
    setRequestData((previousData) => ({
      ...previousData,
      [field]: value,
    }));

    setRequestErrors((previousErrors) => ({
      ...previousErrors,
      [field]: "",
    }));
  };

  const validateRequestForm = () => {
    const errors = {};

    const customerName = requestData.customerName.trim();
    const contact = requestData.contact.trim();
    const vehicleNumber = requestData.vehicleNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");
    const vehicleType = requestData.vehicleType.trim();

    const customerNameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;
    const contactRegex = /^0\d{9}$/;
    // Sri Lankan vehicle registration formats supported:
    // Newer formats: ABC-1234, ABC 1234, AB-1234, AB 1234
    // Province-prefixed display: WP CAS 1234, WP-CAS-1234
    // Older numeric-prefix formats: 65-1234, 250-1234
    //
    // A plain four-digit number is not accepted.
    const vehicleNumberRegex =
      /^(?:[A-Z]{2}[\s-]?[A-Z]{2,3}[\s-]?\d{4}|[A-Z]{2,3}[\s-]?\d{4}|\d{2,3}[\s-]\d{4})$/;

    if (!customerName) {
      errors.customerName = "Customer name is required.";
    } else if (!customerNameRegex.test(customerName)) {
      errors.customerName =
        "Enter a valid customer name using letters only.";
    }

    if (!contact) {
      errors.contact = "Contact number is required.";
    } else if (!contactRegex.test(contact)) {
      errors.contact =
        "Enter a valid 10-digit contact number starting with 0.";
    }

    if (!vehicleNumber) {
      errors.vehicleNumber = "Vehicle number is required.";
    } else if (!vehicleNumberRegex.test(vehicleNumber)) {
      errors.vehicleNumber =
        "Enter a valid Sri Lankan vehicle number. Examples: ABC-1234, AB-1234, WP CAS 1234, 65-1234.";
    }

    if (!vehicleType) {
      errors.vehicleType = "Please select a vehicle type.";
    }

    setRequestErrors({
      customerName: errors.customerName || "",
      contact: errors.contact || "",
      vehicleNumber: errors.vehicleNumber || "",
      vehicleType: errors.vehicleType || "",
    });

    if (Object.keys(errors).length > 0) {
      return null;
    }

    return {
      customerName,
      contact,
      vehicleNumber,
      vehicleType,
    };
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

  const handleSubmitRequest = async () => {
    setRequestError("");

    const validatedData = validateRequestForm();

    if (!validatedData) {
      return;
    }

    if (!selectedGarage?.id) {
      setRequestError(
        "Please close the form and select a valid garage again."
      );
      return;
    }

    if (!Array.isArray(userLocation) || userLocation.length !== 2) {
      setRequestError(
        "Your GPS location is unavailable. Please allow location access and try again."
      );
      return;
    }

    try {
      setRequestSubmitting(true);

      const payload = {
        customerName: validatedData.customerName,
        contact: validatedData.contact,
        vehicleNumber: validatedData.vehicleNumber,
        vehicleType: validatedData.vehicleType,
        vehicleModel: validatedData.vehicleType,
        garageId: selectedGarage.id,
        location: "Customer Live GPS Location",
        customerLatitude: userLocation[0],
        customerLongitude: userLocation[1],
        requestType: "Garage Service",
        estimatedDistance: selectedGarage?.distance || "",
        estimatedTime: selectedGarage?.time || "",
      };

      const response = await fetch(
        "http://localhost:5000/api/service-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.request?.requestId
      ) {
        throw new Error(
          result.message || "Unable to submit the service request."
        );
      }

      const requestId = result.request.requestId;

      const savedRequest = {
        id: requestId,
        requestId,
        ticketNumber:
          result.request.ticketNumber ||
          `SR-${String(requestId).padStart(4, "0")}`,
        name: validatedData.customerName,
        customerName: validatedData.customerName,
        contact: validatedData.contact,
        customerContact: validatedData.contact,
        vehicle: validatedData.vehicleType,
        vehicleType: validatedData.vehicleType,
        vNo: validatedData.vehicleNumber,
        vehicleNumber: validatedData.vehicleNumber,
        eta: selectedGarage?.time || "N/A",
        estimatedTime: selectedGarage?.time || "N/A",
        dist: selectedGarage?.distance || "N/A",
        estimatedDistance: selectedGarage?.distance || "N/A",
        loc: selectedGarage?.name || "Selected Garage",
        location: "Customer Live GPS Location",
        garageId: selectedGarage.id,
        garageName: selectedGarage?.name || "Selected Garage",
        garageAddress: selectedGarage?.address || "",
        garageContact: selectedGarage?.contact || "",
        garageLatitude: selectedGarage?.lat ?? null,
        garageLongitude: selectedGarage?.lng ?? null,
        customerLatitude: userLocation[0],
        customerLongitude: userLocation[1],
        status: "pending",
        requestStatus: "Pending",
        customerStage:
          result.request.customerStage ||
          "REQUEST_CREATED",
        createdAt: new Date().toISOString(),
      };

      let oldRequests = [];

      try {
        const storedRequests = JSON.parse(
          sessionStorage.getItem("resourceRequests") || "[]"
        );

        oldRequests = Array.isArray(storedRequests)
          ? storedRequests
          : [];
      } catch (storageError) {
        console.error(
          "Read resource requests error:",
          storageError
        );
        oldRequests = [];
      }

      const updatedRequests = [
        savedRequest,
        ...oldRequests.filter(
          (request) =>
            Number(request?.requestId ?? request?.id) !==
            Number(requestId)
        ),
      ];

      sessionStorage.setItem(
        "resourceRequests",
        JSON.stringify(updatedRequests)
      );

      sessionStorage.setItem(
        "latestServiceRequest",
        JSON.stringify(savedRequest)
      );

      sessionStorage.setItem(
        "serviceRequestId",
        String(requestId)
      );

      sessionStorage.setItem(
        "requestId",
        String(requestId)
      );

      sessionStorage.setItem(
        "currentServiceRequestId",
        String(requestId)
      );

      sessionStorage.setItem(
        "customerContact",
        validatedData.contact
      );

      window.dispatchEvent(
        new Event("resourceRequestsUpdated")
      );

      window.dispatchEvent(
        new CustomEvent("latestServiceRequestUpdated", {
          detail: savedRequest,
        })
      );

      if (setResourceRequests) {
        setResourceRequests(updatedRequests);
      }

      setSelectedGarage({
        ...selectedGarage,
        customerRequest: savedRequest,
      });

      setIsRequested(true);
      setShowRequestForm(false);
      setShowSuccessMessage(true);
      resetForm();
    } catch (error) {
      console.error("Submit service request error:", error);

      setRequestError(
        error.message || "Unable to submit the service request."
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  const allGaragesWithDistance = userLocation
    ? garageList
        .map(getGarageWithLiveDistance)
        .sort(
          (firstGarage, secondGarage) =>
            firstGarage.distanceValue - secondGarage.distanceValue
        )
    : [];

  const liveGarages = allGaragesWithDistance
    .filter((garage) => garage.distanceValue <= 25)
    .slice(0, 6)
    .map((garage, index) => ({
      ...garage,
      status:
        index === 0 ? "NEAREST & RECOMMENDED" : garage.status,
    }));

  return (
    <>
      <style>{`
        .garage-map-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(99, 102, 241, 0.28);
          border-radius: 14px;
          background: #07101f;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        }

        .garage-map-popup .leaflet-popup-content {
          width: auto !important;
          margin: 0;
        }

        .garage-map-popup .leaflet-popup-tip {
          background: #07101f;
        }
      `}</style>

      <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#02050b] text-[#cbd5e1] font-mono flex flex-col">
        <div className="w-full h-14 border-b border-slate-900 bg-[#02050b]/90 backdrop-blur-md px-3 md:px-6 flex items-center justify-between z-20 text-xs shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate("customer-login")}
              className="flex items-center gap-2 px-3 py-2 border border-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-cyan-300 hover:border-cyan-500 transition-all"
            >
              ← BACK
            </button>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>

              <span className="text-slate-400 font-bold tracking-widest">
                LIVE GARAGE MAP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="block text-white font-bold tracking-wide">
                {loggedCustomerName}
              </span>
              <span className="block text-[9px] text-purple-400 tracking-widest uppercase">
                CUSTOMER
              </span>
            </div>

            <div className="w-8 h-8 rounded border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-1 w-full relative overflow-hidden">
          <MapContainer
            center={userLocation || INITIAL_MAP_CENTER}
            zoom={userLocation ? 14 : 8}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            {userLocation && (
              <RecenterMap center={userLocation} />
            )}

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
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
                  <strong>Your Current Location</strong>
                  <br />
                  Latitude: {userLocation[0].toFixed(5)}
                  <br />
                  Longitude: {userLocation[1].toFixed(5)}
                </Popup>
              </CircleMarker>
            )}

            {liveGarages.map((garage) => (
              <Marker
                key={garage.id}
                position={[garage.lat, garage.lng]}
                eventHandlers={{
                  mouseover: (event) => {
                    event.target.openPopup();
                  },
                  mouseout: (event) => {
                    event.target.closePopup();
                  },
                  click: () => handleSelectGarage(garage),
                }}
              >
                <Popup
                  closeButton={false}
                  offset={[0, -8]}
                  className="garage-map-popup"
                >
                  <div className="min-w-[250px] overflow-hidden rounded-xl bg-[#07101f] text-slate-200 shadow-2xl">
                    <div className="border-b border-white/10 bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black uppercase tracking-wider text-white">
                            {garage.name}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                            {garage.status}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
                          <MapPin size={17} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 px-4 py-3 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">
                          Distance
                        </span>
                        <span className="font-bold text-white">
                          {garage.distance}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">
                          Estimated Time
                        </span>
                        <span className="font-bold text-emerald-400">
                          {garage.time}
                        </span>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Address
                        </p>
                        <p className="mt-1 leading-5 text-slate-300">
                          {garage.address}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Contact
                          </p>
                          <p className="mt-1 truncate font-semibold text-slate-200">
                            {garage.contact}
                          </p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Capacity
                          </p>
                          <p className="mt-1 font-semibold text-slate-200">
                            {garage.capacity} vehicles
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute top-3 left-3 z-[25] max-w-[calc(100%-1.5rem)] rounded-lg border border-slate-700/70 bg-[#060b16]/95 p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-white">
                  {locationLoading
                    ? "Detecting your location..."
                    : userLocation
                    ? "Live location active"
                    : "Location access required"}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  {garagesError ||
                    locationError ||
                    (garagesLoading
                      ? "Loading registered garages from the database..."
                      : userLocation
                      ? `${liveGarages.length} nearby garage${
                          liveGarages.length === 1 ? "" : "s"
                        } found within 25 KM from ${
                          garageList.length
                        } registered garage${
                          garageList.length === 1 ? "" : "s"
                        }.`
                      : "Allow location access to show your current position and nearby registered garages.")}
                </p>

                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  disabled={locationLoading}
                  className="mt-2 rounded border border-cyan-500/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {locationLoading ? "Locating..." : "Use My Location"}
                </button>
              </div>
            </div>
          </div>

          {!locationLoading &&
            !garagesLoading &&
            !garagesError &&
            userLocation &&
            liveGarages.length === 0 && (
              <div className="absolute left-1/2 top-1/2 z-[24] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-amber-500/30 bg-[#0b1120]/95 p-6 text-center shadow-2xl backdrop-blur-md">
                <MapPin className="mx-auto h-8 w-8 text-amber-400" />
                <h2 className="mt-3 text-lg font-black uppercase tracking-widest text-white">
                  No Nearby Garages
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  No registered garage was found within 25 KM of your
                  current location. More garages will appear here
                  after they are added to the database.
                </p>
              </div>
            )}

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
                    <span className="mt-3 block text-slate-300 font-sans">
                      {selectedGarage.address}
                    </span>
                    <span className="mt-1 block text-slate-500 font-sans">
                      {selectedGarage.contact} ·{" "}
                      {selectedGarage.district}
                    </span>
                  </div>

                  <div className="bg-[#091124]/40 border border-slate-900 p-4 md:p-3 rounded-sm text-base md:text-xs mb-4">
                    <span className="font-bold text-slate-400 tracking-wider text-sm md:text-[9px] uppercase mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 md:w-3 md:h-3 text-slate-500 shrink-0" />
                      Available Specialists (
                      {selectedGarage.freeTechs?.length || 0})
                    </span>

                    {(selectedGarage.freeTechs?.length || 0) ===
                    0 ? (
                      <div className="text-slate-500 italic text-sm md:text-[11px] py-1">
                        No technicians free right now. Queueing active.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 md:gap-2 max-h-40 md:max-h-32 overflow-y-auto pr-1">
                        {(selectedGarage.freeTechs || []).map(
                          (tech, idx) => (
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
                          )
                        )}
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
                      onClick={() => {
                        setRequestError("");
                        setShowRequestForm(true);
                      }}
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
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestError("");
                      resetForm();
                    }}
                    className="text-slate-400 hover:text-white border border-slate-700 rounded p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  className="space-y-4"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmitRequest();
                  }}
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={requestData.customerName}
                      onChange={(e) =>
                        updateRequestField(
                          "customerName",
                          e.target.value
                        )
                      }
                      maxLength={100}
                      autoComplete="name"
                      className={`w-full bg-[#111827] border rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600 ${
                        requestErrors.customerName
                          ? "border-red-500 focus:border-red-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    />

                    {requestErrors.customerName && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        {requestErrors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter contact number"
                      value={requestData.contact}
                      onChange={(e) =>
                        updateRequestField(
                          "contact",
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      maxLength={10}
                      autoComplete="tel"
                      className={`w-full bg-[#111827] border rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600 ${
                        requestErrors.contact
                          ? "border-red-500 focus:border-red-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    />

                    {requestErrors.contact && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        {requestErrors.contact}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Ex: ABC-1234, WP CAS 1234, 65-1234"
                      value={requestData.vehicleNumber}
                      onChange={(e) =>
                        updateRequestField(
                          "vehicleNumber",
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9\s-]/g, "")
                        )
                      }
                      maxLength={16}
                      autoComplete="off"
                      className={`w-full bg-[#111827] border rounded-lg px-4 py-3 text-white outline-none placeholder:text-slate-600 ${
                        requestErrors.vehicleNumber
                          ? "border-red-500 focus:border-red-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    />

                    {requestErrors.vehicleNumber && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        {requestErrors.vehicleNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      value={requestData.vehicleType}
                      disabled={vehicleTypesLoading}
                      onChange={(e) =>
                        updateRequestField(
                          "vehicleType",
                          e.target.value
                        )
                      }
                      className={`w-full bg-[#111827] border rounded-lg px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                        requestErrors.vehicleType
                          ? "border-red-500 focus:border-red-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    >
                      <option value="">
                        {vehicleTypesLoading
                          ? "Loading Vehicle Types..."
                          : "Select Vehicle Type"}
                      </option>

                      {vehicleTypes.map((type) => (
                        <option
                          key={type.vehicle_type_id}
                          value={type.vehicle_type_name}
                        >
                          {type.vehicle_type_name}
                        </option>
                      ))}
                    </select>

                    {requestErrors.vehicleType && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        {requestErrors.vehicleType}
                      </p>
                    )}

                    {vehicleTypesError && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        {vehicleTypesError}
                      </p>
                    )}
                  </div>

                  {requestError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                      {requestError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-lg font-bold uppercase tracking-widest text-sm transition-all"
                  >
                    {requestSubmitting
                      ? "Sending Request..."
                      : "Send Request"}
                  </button>

                  <button
                    type="button"
                    disabled={requestSubmitting}
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestError("");
                      resetForm();
                    }}
                    className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60 rounded-lg font-bold uppercase tracking-widest text-sm"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {customerStatusPopup.show && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] px-4">
              <div
                className={`w-full max-w-md rounded-xl border p-6 text-center shadow-2xl ${
                  customerStatusPopup.status === "accepted"
                    ? "border-emerald-500/40 bg-[#0b1120] shadow-[0_0_35px_rgba(16,185,129,0.25)]"
                    : "border-red-500/40 bg-[#0b1120] shadow-[0_0_35px_rgba(239,68,68,0.22)]"
                }`}
              >
                <h2
                  className={`text-xl font-black uppercase tracking-widest mb-3 ${
                    customerStatusPopup.status === "accepted"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {customerStatusPopup.title}
                </h2>

                <div className="mb-4 rounded-lg border border-slate-700/70 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Ticket Number
                  </p>
                  <p className="mt-1 text-base font-black tracking-wider text-cyan-300">
                    {customerStatusPopup.ticketNumber}
                  </p>
                </div>

                <p className="text-sm leading-6 text-slate-300 whitespace-pre-line">
                  {customerStatusPopup.message}
                </p>

                {customerStatusPopup.status === "accepted" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerStatusPopup({
                        show: false,
                        title: "",
                        message: "",
                        ticketNumber: "",
                        status: "",
                      });

                      onNavigate("navigation-hub");
                    }}
                    className="mt-6 w-full rounded-lg bg-emerald-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-emerald-500"
                  >
                    Go to Navigation Hub
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCustomerStatusPopup({
                        show: false,
                        title: "",
                        message: "",
                        ticketNumber: "",
                        status: "",
                      })
                    }
                    className="mt-6 w-full rounded-lg bg-indigo-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-indigo-500"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}

          {showSuccessMessage && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
              <div className="w-full max-w-md bg-[#0b1120] border border-emerald-500/40 rounded-xl p-6 text-center shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                <h2 className="text-emerald-400 text-xl font-black uppercase tracking-widest mb-3">
                  Request Submitted
                </h2>

                <p className="text-slate-300 text-sm">
                  Your request was submitted successfully and is
                  waiting for assistance approval.
                </p>

                <div className="my-5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Ticket Number
                  </p>
                  <p className="mt-1 text-base font-black tracking-wider text-cyan-300">
                    {selectedGarage?.customerRequest?.ticketNumber ||
                      "Pending"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuccessMessage(false)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase tracking-widest text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}