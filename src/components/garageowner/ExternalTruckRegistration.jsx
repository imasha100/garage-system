import React, { useEffect, useState } from "react";
import {
  Menu,
  Truck,
  Save,
  ArrowLeft,
  UserRound,
  MapPin,
  LocateFixed,
  LoaderCircle,
  Navigation,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_BASE = "http://localhost:5000";

// ======================================================
// SRI LANKAN VEHICLE NUMBER VALIDATION
// Accepts examples such as:
// LA-1234
// CBG-4587
// Spaces are normalized to a hyphen on blur/submit.
// ======================================================

const SRI_LANKAN_PLATE_REGEX =
  /^(?:[A-Z]{2}|[A-Z]{3})-\d{4}$/;

const normalizeSriLankanPlate = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");

// Fix the default Leaflet marker icon in Vite/React projects.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_LOCATION = {
  latitude: 6.9271,
  longitude: 79.8612,
};

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  React.useEffect(() => {
    if (
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude))
    ) {
      map.setView([Number(latitude), Number(longitude)], 15);
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function ExternalTruckRegistration({
  toggleSidebar,
  onNavigate,
}) {
  // ======================================================
  // LOGGED-IN GARAGE OWNER PROFILE
  // ======================================================

  const [ownerData, setOwnerData] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [ownerError, setOwnerError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({
    type: "",
    text: "",
  });

  // ======================================================
  // SUBMITTED REGISTRATION STATUS
  // ======================================================

  const [submittedRequest, setSubmittedRequest] =
    useState(() => {
      try {
        const storedRequest =
          localStorage.getItem(
            "externalTruckRegistrationRequest"
          );

        return storedRequest
          ? JSON.parse(storedRequest)
          : null;
      } catch (error) {
        console.error(
          "Read external truck registration request error:",
          error
        );

        return null;
      }
    });

  const [requestStatusLoading, setRequestStatusLoading] =
    useState(false);

  const [requestStatusError, setRequestStatusError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile = async () => {
      try {
        setOwnerLoading(true);
        setOwnerError("");

        const storedStaffUser =
          sessionStorage.getItem("staffUser");

        if (!storedStaffUser) {
          throw new Error(
            "Logged-in garage owner details were not found."
          );
        }

        const staffUser = JSON.parse(storedStaffUser);

        const loginId = Number(
          staffUser?.loginId ??
            staffUser?.login_id
        );

        if (
          !Number.isInteger(loginId) ||
          loginId <= 0
        ) {
          throw new Error(
            "A valid garage owner login ID was not found."
          );
        }

        const response = await fetch(
          `${API_BASE}/api/owners/profile/${loginId}`
        );

        const result = await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load garage owner profile."
          );
        }

        if (isMounted) {
          setOwnerData(result.data || null);
        }
      } catch (error) {
        console.error(
          "External Truck Registration owner loading error:",
          error
        );

        if (isMounted) {
          setOwnerError(
            error.message ||
              "Unable to load garage owner profile."
          );
        }
      } finally {
        if (isMounted) {
          setOwnerLoading(false);
        }
      }
    };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // POLL SUBMITTED REGISTRATION STATUS
  // ======================================================

  useEffect(() => {
    const registrationId =
      Number(
        submittedRequest?.registrationId
      );

    if (
      !Number.isInteger(registrationId) ||
      registrationId <= 0
    ) {
      return undefined;
    }

    let isMounted = true;

    const loadRequestStatus =
      async (showLoading = false) => {
        try {
          if (showLoading && isMounted) {
            setRequestStatusLoading(true);
          }

          if (isMounted) {
            setRequestStatusError("");
          }

          const response =
            await fetch(
              `${API_BASE}/api/external-truck-requests/${registrationId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false ||
            !result.request
          ) {
            throw new Error(
              result.message ||
                "Unable to load registration request status."
            );
          }

          if (!isMounted) {
            return;
          }

          const nextRequest = {
            registrationId:
              result.request.registrationId,
            status:
              result.request.status || "Pending",
            truckNumber:
              result.request.truckNumber || "",
            garageId:
              result.request.garageId || null,
            garageName:
              result.request.garageName || "",
            externalDriverId:
              result.request.externalDriverId || "",
            temporaryPassword:
              result.request.temporaryPassword || "",
          };

          setSubmittedRequest(nextRequest);

          localStorage.setItem(
            "externalTruckRegistrationRequest",
            JSON.stringify(nextRequest)
          );
        } catch (error) {
          console.error(
            "External truck registration status error:",
            error
          );

          if (isMounted) {
            setRequestStatusError(
              error.message ||
                "Unable to load registration request status."
            );
          }
        } finally {
          if (showLoading && isMounted) {
            setRequestStatusLoading(false);
          }
        }
      };

    loadRequestStatus(true);

    const interval =
      window.setInterval(
        () => {
          loadRequestStatus(false);
        },
        5000
      );

    return () => {
      isMounted = false;

      window.clearInterval(interval);
    };
  }, [
    submittedRequest?.registrationId,
  ]);

  const ownerName =
    ownerData?.owner?.fullName ??
    ownerData?.owner?.full_name ??
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage?.garageName ??
    ownerData?.garage?.garage_name ??
    (ownerLoading
      ? "Loading Garage..."
      : "Garage");

  const garageId = Number(
    ownerData?.garage?.garageId ??
      ownerData?.garage?.garage_id
  );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "GO";

  const profilePhotoPath =
    ownerData?.owner?.profilePhoto ??
    ownerData?.owner?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(profilePhotoPath).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  const generateTruckId = () =>
    `EXT-TRUCK-${Date.now().toString().slice(-6)}`;

  const generateDriverId = () =>
    `EXT-DRV-${Date.now().toString().slice(-6)}`;

  const getInitialFormData = () => ({
    // Truck Information
    truckId: generateTruckId(),
    plateNumber: "",
    truckModel: "",
    truckType: "",
    capacity: "",
    registrationDate: "",

    // Driver Information
    driverId: generateDriverId(),
    driverName: "",
    driverNic: "",
    driverEmail: "",
    contactNumber: "",
    licenseNumber: "",
    licenseExpireDate: "",
    driverExperience: "",

    // Service Location
    serviceArea: "",
    latitude: "",
    longitude: "",
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [isFindingAddress, setIsFindingAddress] = useState(false);
  const [locationMessage, setLocationMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (locationMessage.text) {
      setLocationMessage({ type: "", text: "" });
    }
  };

  const reverseGeocodeLocation = async (latitude, longitude) => {
    setIsFindingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to identify the selected location.");
      }

      const data = await response.json();
      const address = data.address || {};

      const serviceArea =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.county ||
        address.state_district ||
        data.display_name ||
        "";

      setFormData((previousData) => ({
        ...previousData,
        serviceArea,
      }));
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      setLocationMessage({
        type: "warning",
        text:
          "Coordinates were selected, but the service area could not be filled automatically. Please enter it manually.",
      });
    } finally {
      setIsFindingAddress(false);
    }
  };

  const setSelectedLocation = async (latitude, longitude) => {
    const formattedLatitude = Number(latitude).toFixed(8);
    const formattedLongitude = Number(longitude).toFixed(8);

    setFormData((previousData) => ({
      ...previousData,
      latitude: formattedLatitude,
      longitude: formattedLongitude,
    }));

    setLocationMessage({
      type: "success",
      text: "Location selected successfully.",
    });

    await reverseGeocodeLocation(formattedLatitude, formattedLongitude);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage({
        type: "error",
        text: "Location access is not supported by this browser.",
      });
      return;
    }

    setIsFindingLocation(true);
    setLocationMessage({ type: "", text: "" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await setSelectedLocation(
          position.coords.latitude,
          position.coords.longitude
        );

        setIsFindingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);

        let message = "Unable to get your current location.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access or select the location on the map.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setLocationMessage({
          type: "error",
          text: message,
        });

        setIsFindingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitMessage({
      type: "",
      text: "",
    });

    // ====================================================
    // SRI LANKAN TRUCK NUMBER VALIDATION
    // ====================================================

    const normalizedPlate =
      normalizeSriLankanPlate(
        formData.plateNumber
      );

    if (
      !SRI_LANKAN_PLATE_REGEX.test(
        normalizedPlate
      )
    ) {
      setSubmitMessage({
        type: "error",
        text:
          "Please enter a valid Sri Lankan vehicle number. Example: LA-1234 or CBG-4587.",
      });

      return;
    }

    // Keep the plate in a consistent format in the UI.
    setFormData((previousData) => ({
      ...previousData,
      plateNumber: normalizedPlate,
    }));

    // ====================================================
    // LOCATION VALIDATION
    // ====================================================

    if (!formData.latitude || !formData.longitude) {
      setLocationMessage({
        type: "error",
        text:
          "Please use your current location or select the truck location on the map.",
      });
      return;
    }

    // ====================================================
    // GARAGE VALIDATION
    // ====================================================

    if (
      !Number.isInteger(garageId) ||
      garageId <= 0
    ) {
      setSubmitMessage({
        type: "error",
        text:
          "The logged-in garage could not be identified. Please sign in again.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/api/external-truck-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            truckNumber: normalizedPlate,

            truckType:
              formData.truckType,

            capacity:
              formData.capacity,

            truckModel:
              formData.truckModel.trim(),

            registrationDate:
              formData.registrationDate,

            latitude:
              Number(formData.latitude),

            longitude:
              Number(formData.longitude),

            driverFullName:
              formData.driverName.trim(),

            driverNic:
              formData.driverNic
                .trim()
                .toUpperCase(),

            driverEmail:
              formData.driverEmail
                .trim()
                .toLowerCase(),

            driverContactNumber:
              formData.contactNumber.trim(),

            licenceNumber:
              formData.licenseNumber
                .trim()
                .toUpperCase(),

            licenceExpiryDate:
              formData.licenseExpireDate,

            experienceYears:
              Number(
                formData.driverExperience
              ),

            garageId,
          }),
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
            "Unable to submit external tow truck registration request."
        );
      }

      const savedRequest = {
        registrationId:
          result.request?.registrationId,
        status:
          result.request?.status || "Pending",
        truckNumber:
          result.request?.truckNumber || normalizedPlate,
        garageId:
          result.request?.garageId || garageId,
        garageName:
          garageName || "",
        externalDriverId: "",
        temporaryPassword: "",
      };

      setSubmittedRequest(
        savedRequest
      );

      localStorage.setItem(
        "externalTruckRegistrationRequest",
        JSON.stringify(savedRequest)
      );

      setSubmitMessage({
        type: "success",
        text:
          "External tow truck registration request submitted successfully. Waiting for garage approval.",
      });

      setFormData(
        getInitialFormData()
      );

      setLocationMessage({
        type: "",
        text: "",
      });
    } catch (error) {
      console.error(
        "External tow truck registration submit error:",
        error
      );

      setSubmitMessage({
        type: "error",
        text:
          error.message ||
          "Unable to submit external tow truck registration request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (typeof onNavigate === "function") {
      onNavigate("Registration");
    }
  };

  const mapLatitude = formData.latitude
    ? Number(formData.latitude)
    : DEFAULT_LOCATION.latitude;

  const mapLongitude = formData.longitude
    ? Number(formData.longitude)
    : DEFAULT_LOCATION.longitude;

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      {/* Header */}
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-black tracking-widest">
              EXTERNAL TRUCK REGISTRATION
            </h1>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Register third-party tow trucks and drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-[240px] truncate text-[10px] uppercase text-indigo-400">
              {garageName}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center overflow-hidden text-xs">
            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              ownerInitials
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {ownerError && (
          <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ownerError}
          </div>
        )}

        {submitMessage.text && (
          <div
            className={`mx-auto mb-6 max-w-5xl rounded-xl border px-4 py-3 text-sm ${
              submitMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {submittedRequest && (
          <div
            className={`mx-auto mb-6 max-w-5xl rounded-2xl border p-5 ${
              String(
                submittedRequest.status || ""
              ).toLowerCase() === "approved"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : String(
                    submittedRequest.status || ""
                  ).toLowerCase() === "rejected"
                ? "border-red-500/30 bg-red-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Registration Request Status
                </p>

                <h3 className="mt-2 text-lg font-black text-white">
                  {String(
                    submittedRequest.status || "Pending"
                  ).toLowerCase() === "approved"
                    ? "Registration Approved"
                    : String(
                        submittedRequest.status || "Pending"
                      ).toLowerCase() === "rejected"
                    ? "Registration Rejected"
                    : "Waiting for Garage Approval"}
                </h3>

                <p className="mt-2 text-sm text-gray-300">
                  Request ID:{" "}
                  <span className="font-mono font-bold text-white">
                    #{submittedRequest.registrationId}
                  </span>
                  {submittedRequest.truckNumber
                    ? ` • ${submittedRequest.truckNumber}`
                    : ""}
                </p>

                {String(
                  submittedRequest.status || ""
                ).toLowerCase() === "approved" && (
                  <div className="mt-4 space-y-2 rounded-xl border border-emerald-500/20 bg-black/20 p-4">
                    <p className="text-sm font-bold text-emerald-300">
                      Your external tow truck registration has been approved.
                    </p>

                    {submittedRequest.externalDriverId && (
                      <p className="text-sm text-gray-300">
                        External Driver ID:{" "}
                        <span className="font-mono font-black text-white">
                          {submittedRequest.externalDriverId}
                        </span>
                      </p>
                    )}

                    {submittedRequest.temporaryPassword && (
                      <p className="text-sm text-gray-300">
                        Temporary Password:{" "}
                        <span className="font-mono font-black text-white">
                          {submittedRequest.temporaryPassword}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {String(
                  submittedRequest.status || ""
                ).toLowerCase() === "rejected" && (
                  <p className="mt-4 text-sm font-bold text-red-300">
                    Your external tow truck registration request has been rejected.
                  </p>
                )}

                {requestStatusError && (
                  <p className="mt-3 text-xs text-red-300">
                    {requestStatusError}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {requestStatusLoading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-gray-300"
                  />
                )}

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    String(
                      submittedRequest.status || ""
                    ).toLowerCase() === "approved"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : String(
                          submittedRequest.status || ""
                        ).toLowerCase() === "rejected"
                      ? "bg-red-500/15 text-red-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {submittedRequest.status || "Pending"}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Registration
        </button>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <p className="text-purple-400 text-xs tracking-widest font-bold mb-2">
            THIRD-PARTY RECOVERY VEHICLE
          </p>

          <h2 className="text-2xl md:text-3xl font-black mb-2">
            Register External Tow Truck
          </h2>

          <p className="text-gray-400">
            Add external recovery vehicles and assigned drivers to the system.
          </p>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-5xl mx-auto bg-[#15151f] border border-white/10 rounded-2xl p-5 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Truck Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                  <Truck className="text-purple-400" size={24} />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black">
                    Truck Information
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Enter the external recovery vehicle details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="truckId"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK ID
                  </label>

                  <input
                    id="truckId"
                    type="text"
                    name="truckId"
                    value={formData.truckId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plateNumber"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    PLATE NUMBER
                  </label>

                  <input
                    id="plateNumber"
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z0-9 -]/g,
                            ""
                          );

                      setFormData(
                        (previousData) => ({
                          ...previousData,
                          plateNumber: value,
                        })
                      );

                      if (
                        submitMessage.type ===
                        "error"
                      ) {
                        setSubmitMessage({
                          type: "",
                          text: "",
                        });
                      }
                    }}
                    onBlur={() => {
                      if (formData.plateNumber) {
                        setFormData(
                          (previousData) => ({
                            ...previousData,
                            plateNumber:
                              normalizeSriLankanPlate(
                                previousData.plateNumber
                              ),
                          })
                        );
                      }
                    }}
                    placeholder="LA-1234 or CBG-4587"
                    required
                    maxLength={8}
                    autoComplete="off"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white uppercase placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />

                  <p className="mt-2 text-[11px] text-gray-500">
                    Format: LA-1234 or CBG-4587
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="truckModel"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK MODEL
                  </label>

                  <input
                    id="truckModel"
                    type="text"
                    name="truckModel"
                    value={formData.truckModel}
                    onChange={handleChange}
                    placeholder="Isuzu NPR / Toyota Dyna"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="truckType"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK TYPE
                  </label>

                  <select
                    id="truckType"
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#101018] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
                  >
                    <option value="">Select Truck Type</option>
                    <option value="Flatbed Tow Truck">
                      Flatbed Tow Truck
                    </option>
                    <option value="Wheel Lift Tow Truck">
                      Wheel Lift Tow Truck
                    </option>
                    <option value="Integrated Tow Truck">
                      Integrated Tow Truck
                    </option>
                    <option value="Heavy Duty Tow Truck">
                      Heavy Duty Tow Truck
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="capacity"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    CAPACITY (TONS)
                  </label>

                  <input
                    id="capacity"
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Example: 3"
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="registrationDate"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK REGISTRATION DATE
                  </label>

                  <input
                    id="registrationDate"
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Driver Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  <UserRound className="text-emerald-400" size={24} />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black">
                    Driver Information
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Enter the assigned driver details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="driverId"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER ID
                  </label>

                  <input
                    id="driverId"
                    type="text"
                    name="driverId"
                    value={formData.driverId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="driverName"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER FULL NAME
                  </label>

                  <input
                    id="driverName"
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Enter driver full name"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="driverNic"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER NIC
                  </label>

                  <input
                    id="driverNic"
                    type="text"
                    name="driverNic"
                    value={formData.driverNic}
                    onChange={handleChange}
                    placeholder="200012345678 or 901234567V"
                    required
                    maxLength={12}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="driverEmail"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER EMAIL
                  </label>

                  <input
                    id="driverEmail"
                    type="email"
                    name="driverEmail"
                    value={formData.driverEmail}
                    onChange={handleChange}
                    placeholder="driver@example.com"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    CONTACT NUMBER
                  </label>

                  <input
                    id="contactNumber"
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="0771234567"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LICENSE NUMBER
                  </label>

                  <input
                    id="licenseNumber"
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter driving license number"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseExpireDate"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LICENSE EXPIRE DATE
                  </label>

                  <input
                    id="licenseExpireDate"
                    type="date"
                    name="licenseExpireDate"
                    value={formData.licenseExpireDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="driverExperience"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVING EXPERIENCE (YEARS)
                  </label>

                  <input
                    id="driverExperience"
                    type="number"
                    name="driverExperience"
                    value={formData.driverExperience}
                    onChange={handleChange}
                    placeholder="Enter years of experience"
                    required
                    min="0"
                    max="60"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Service Location */}
            <section>
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="text-blue-400" size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-black">
                      Service Location
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Use your current location or select a point on the map
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isFindingLocation}
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFindingLocation ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Finding Location...
                    </>
                  ) : (
                    <>
                      <LocateFixed size={18} />
                      Use My Current Location
                    </>
                  )}
                </button>
              </div>

              {locationMessage.text && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    locationMessage.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : locationMessage.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {locationMessage.type === "success" ? (
                    <CheckCircle2 size={20} className="shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="shrink-0" />
                  )}

                  <p>{locationMessage.text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label
                    htmlFor="serviceArea"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    SERVICE AREA
                  </label>

                  <div className="relative">
                    <input
                      id="serviceArea"
                      type="text"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      placeholder="Automatically filled or enter manually"
                      required
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                    />

                    {isFindingAddress && (
                      <LoaderCircle
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-400"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LATITUDE
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Select using location or map"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LONGITUDE
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Select using location or map"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Navigation size={18} className="text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-white">
                          Select Truck Location
                        </p>
                        <p className="text-xs text-gray-500">
                          Click anywhere on the map to place the marker.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-[360px] w-full">
                    <MapContainer
                      center={[mapLatitude, mapLongitude]}
                      zoom={formData.latitude && formData.longitude ? 15 : 8}
                      scrollWheelZoom
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <MapClickHandler
                        onLocationSelect={setSelectedLocation}
                      />

                      <RecenterMap
                        latitude={mapLatitude}
                        longitude={mapLongitude}
                      />

                      {formData.latitude && formData.longitude && (
                        <Marker
                          position={[
                            Number(formData.latitude),
                            Number(formData.longitude),
                          ]}
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isFindingLocation || isFindingAddress || isSubmitting}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl px-8 py-3 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    SUBMITTING REQUEST...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    SUBMIT REGISTRATION REQUEST
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}