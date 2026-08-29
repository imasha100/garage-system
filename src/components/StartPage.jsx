import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Wrench,
  Cpu,
  ChevronDown,
  Info,
  MapPin,
  Truck,
  CheckCircle2,
  Navigation,
  BrainCircuit,
  Clock3,
  ShieldCheck,
  Phone,
  Mail,
  Menu,
  X,
  Send,
  ArrowUpRight,
  Sparkles,
  Headphones,
  CarFront,
  Gauge,
  UserRound,
  Building2,
  Search,
  LocateFixed,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import heroImage from "../assets/hero.jpg";
import aboutImage from "../assets/about.jpg";
import processImage from "../assets/process.jpg";
import technicianImage from "../assets/technician.jpg";
import supportImage from "../assets/support.jpg";

import towServiceImage from "../assets/service-tow.jpg";
import garageServiceImage from "../assets/service-garage.jpg";
import trackingServiceImage from "../assets/service-tracking1.jpg";
import aiServiceImage from "../assets/service-ai.jpg";
import recoveryServiceImage from "../assets/service-recovery.jpg";
import managementServiceImage from "../assets/service-management.jpg";

// ======================================================
// LEAFLET MARKER FIX
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
// DEFAULT TRUCK LOCATION
// ======================================================

const DEFAULT_TRUCK_LOCATION = {
  latitude: 7.8731,
  longitude: 80.7718,
};

// ======================================================
// TODAY DATE
// ======================================================

const getTodayDate = () => {
  const today = new Date();

  const timezoneOffset =
    today.getTimezoneOffset() *
    60 *
    1000;

  return new Date(
    today.getTime() -
      timezoneOffset
  )
    .toISOString()
    .slice(0, 10);
};

// ======================================================
// MAP CLICK HANDLER
// ======================================================

function TruckLocationClickHandler({
  onLocationSelect,
}) {
  useMapEvents({
    click(event) {
      onLocationSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

// ======================================================
// RECENTER MAP
// ======================================================

function RecenterTruckMap({
  latitude,
  longitude,
  zoom = 15,
}) {
  const map = useMap();

  useEffect(() => {
    const lat =
      Number(latitude);

    const lng =
      Number(longitude);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      map.setView(
        [lat, lng],
        zoom
      );
    }
  }, [
    latitude,
    longitude,
    zoom,
    map,
  ]);

  return null;
}

// ======================================================
// ANIMATIONS
// ======================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 45,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.7,
      ease: [
        0.22,
        1,
        0.36,
        1,
      ],
    },
  },
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const cardReveal = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.55,
      ease: [
        0.22,
        1,
        0.36,
        1,
      ],
    },
  },
};

const imageRevealLeft = {
  hidden: {
    opacity: 0,
    x: -55,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,

    transition: {
      duration: 0.8,
      ease: [
        0.22,
        1,
        0.36,
        1,
      ],
    },
  },
};

const imageRevealRight = {
  hidden: {
    opacity: 0,
    x: 55,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,

    transition: {
      duration: 0.8,
      ease: [
        0.22,
        1,
        0.36,
        1,
      ],
    },
  },
};

const premiumImageRevealLeft = {
  hidden: {
    opacity: 0,
    x: -90,
    y: 24,
    scale: 0.88,
    rotateY: 12,
    filter: "blur(14px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",

    transition: {
      duration: 1.05,
      ease: [
        0.16,
        1,
        0.3,
        1,
      ],
    },
  },
};

const premiumImageRevealRight = {
  hidden: {
    opacity: 0,
    x: 90,
    y: 24,
    scale: 0.88,
    rotateY: -12,
    filter: "blur(14px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",

    transition: {
      duration: 1.05,
      ease: [
        0.16,
        1,
        0.3,
        1,
      ],
    },
  },
};

const sectionViewport = {
  once: true,
  amount: 0.18,
};

// ======================================================
// START PAGE
// ======================================================

export default function StartPage({
  onNavigate,
}) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    contactForm,
    setContactForm,
  ] = useState({
    name: "",
    email: "",
    contactNumber: "",
    garageId: "",
    message: "",
  });

  const [
    messageSent,
    setMessageSent,
  ] = useState(false);

  const [
    contactSubmitError,
    setContactSubmitError,
  ] = useState("");

  const [
    isSubmittingContact,
    setIsSubmittingContact,
  ] = useState(false);

  const [
    truckRequestOpen,
    setTruckRequestOpen,
  ] = useState(false);

  const [
    selectedService,
    setSelectedService,
  ] = useState(null);

  const [
    truckRequestSent,
    setTruckRequestSent,
  ] = useState(false);

  const [
    truckRequestError,
    setTruckRequestError,
  ] = useState("");

  const [
    truckRequestErrorTitle,
    setTruckRequestErrorTitle,
  ] = useState("");

  const [
    isSubmittingTruckRequest,
    setIsSubmittingTruckRequest,
  ] = useState(false);

  // ====================================================
  // NEW: EXTERNAL DRIVER REGISTRATION STATUS
  // ====================================================

  const [
    truckRegistrationStatus,
    setTruckRegistrationStatus,
  ] = useState(null);

  const [
    isCheckingTruckRegistrationStatus,
    setIsCheckingTruckRegistrationStatus,
  ] = useState(false);

  const [
    truckRegistrationStatusError,
    setTruckRegistrationStatusError,
  ] = useState("");

  const [
    garages,
    setGarages,
  ] = useState([]);

  const [
    isLoadingGarages,
    setIsLoadingGarages,
  ] = useState(false);

  const [
    garageLoadError,
    setGarageLoadError,
  ] = useState("");

  const [
    locationSearch,
    setLocationSearch,
  ] = useState("");

  const [
    isSearchingLocation,
    setIsSearchingLocation,
  ] = useState(false);

  const [
    isFindingCurrentLocation,
    setIsFindingCurrentLocation,
  ] = useState(false);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    truckRequestForm,
    setTruckRequestForm,
  ] = useState({
    truckNumber: "",
    truckType: "",
    capacity: "",
    truckModel: "",
    registrationDate:
      getTodayDate(),
    latitude: "",
    longitude: "",
    driverFullName: "",
    driverNic: "",
    driverEmail: "",
    driverContactNumber: "",
    licenceNumber: "",
    licenceExpiryDate: "",
    experienceYears: "",
    garageId: "",
  });

  // ======================================================
  // PREVENT BROWSER BACK FROM LEAVING START PAGE
  // ======================================================

  useEffect(() => {
    const currentUrl =
      window.location.href;

    window.history.replaceState(
      {
        startPage: true,
      },
      "",
      currentUrl
    );

    window.history.pushState(
      {
        startPage: true,
      },
      "",
      currentUrl
    );

    const handleBrowserBack =
      () => {
        window.history.forward();
      };

    window.addEventListener(
      "popstate",
      handleBrowserBack
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleBrowserBack
      );
    };
  }, []);

  // ======================================================
  // CONTACT FORM
  // ======================================================

  const handleContactChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setContactForm(
        (previousForm) => ({
          ...previousForm,
          [name]: value,
        })
      );

      if (messageSent) {
        setMessageSent(false);
      }

      if (contactSubmitError) {
        setContactSubmitError("");
      }
    };

  const handleContactSubmit =
    async (event) => {
      event.preventDefault();

      setMessageSent(false);
      setContactSubmitError("");

      if (!contactForm.garageId) {
        setContactSubmitError(
          "Please select the garage you want to contact."
        );
        return;
      }

      setIsSubmittingContact(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/contact-messages",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              garageId: Number(
                contactForm.garageId
              ),
              fullName:
                contactForm.name.trim(),
              email:
                contactForm.email
                  .trim()
                  .toLowerCase(),
              contactNumber:
                contactForm.contactNumber.trim(),
              message:
                contactForm.message.trim(),
            }),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to send your message."
          );
        }

        setMessageSent(true);

        setContactForm({
          name: "",
          email: "",
          contactNumber: "",
          garageId: "",
          message: "",
        });
      } catch (error) {
        console.error(
          "Contact message submit error:",
          error
        );

        setContactSubmitError(
          error.message ||
            "Unable to send your message. Please try again."
        );
      } finally {
        setIsSubmittingContact(false);
      }
    };

  const scrollToAbout = () => {
    document
      .getElementById("about")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // ======================================================
  // EXTERNAL TRUCK REQUEST ID
  // ======================================================

  const getSavedExternalTruckRegistrationId =
    () => {
      const savedId =
        Number(
          localStorage.getItem(
            "externalTruckRegistrationRequestId"
          )
        );

      return (
        Number.isInteger(savedId) &&
        savedId > 0
      )
        ? savedId
        : null;
    };

  // ======================================================
  // OPEN TRUCK REGISTRATION
  // ======================================================

  const openTruckRequest = () => {
    setMobileMenuOpen(false);

    setTruckRequestError("");
    setTruckRequestErrorTitle("");

    setTruckRegistrationStatusError(
      ""
    );

    const savedRegistrationId =
      getSavedExternalTruckRegistrationId();

    if (savedRegistrationId) {
      setTruckRegistrationStatus(
        (previousStatus) => ({
          registrationId:
            savedRegistrationId,

          status:
            previousStatus
              ?.status ||
            "Pending",

          truckNumber:
            previousStatus
              ?.truckNumber ||
            "",

          garageId:
            previousStatus
              ?.garageId ||
            null,

          garageName:
            previousStatus
              ?.garageName ||
            "",

          externalDriverId:
            previousStatus
              ?.externalDriverId ||
            "",

          temporaryPassword:
            previousStatus
              ?.temporaryPassword ||
            "",
        })
      );

      setTruckRequestSent(true);
    } else {
      setTruckRequestSent(false);
    }

    setTruckRequestOpen(true);
  };

  const closeTruckRequest = () => {
    setTruckRequestOpen(false);
  };

  // ======================================================
  // CLEAR OLD / REJECTED REQUEST
  // ======================================================

  const clearExternalTruckRegistrationStatus =
    () => {
      localStorage.removeItem(
        "externalTruckRegistrationRequestId"
      );

      setTruckRegistrationStatus(
        null
      );

      setTruckRegistrationStatusError(
        ""
      );

      setTruckRequestSent(false);

      setTruckRequestError("");

      setTruckRequestErrorTitle("");
    };

  // ======================================================
  // GO TO EXTERNAL DRIVER LOGIN
  // ======================================================

  const goToExternalDriverLogin =
    () => {
      if (
        truckRegistrationStatus
          ?.externalDriverId
      ) {
        sessionStorage.setItem(
          "externalDriverPrefill",

          JSON.stringify({
            username:
              truckRegistrationStatus
                .externalDriverId,

            password:
              truckRegistrationStatus
                .temporaryPassword ||
              "",
          })
        );
      }

      setTruckRequestOpen(false);

      onNavigate(
        "external-driver-login"
      );
    };

  // ======================================================
  // TRUCK FORM CHANGE
  // ======================================================

  const handleTruckRequestChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setTruckRequestForm(
        (previousForm) => ({
          ...previousForm,

          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        })
      );

      if (truckRequestError) {
        setTruckRequestError("");

        setTruckRequestErrorTitle(
          ""
        );
      }
    };

  // ======================================================
  // SET TRUCK LOCATION
  // ======================================================

  const setTruckLocation = (
    latitude,
    longitude,
    message =
      "Location selected successfully."
  ) => {
    const lat =
      Number(latitude);

    const lng =
      Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setLocationError(
        "Invalid location coordinates."
      );

      return;
    }

    setTruckRequestForm(
      (previousForm) => ({
        ...previousForm,

        latitude:
          lat.toFixed(8),

        longitude:
          lng.toFixed(8),
      })
    );

    setLocationError("");

    setLocationMessage(
      message
    );
  };
    // ======================================================
  // USE CURRENT LOCATION
  // ======================================================

  const handleUseCurrentLocation =
    () => {
      if (!navigator.geolocation) {
        setLocationError(
          "Location access is not supported by this browser."
        );

        return;
      }

      setIsFindingCurrentLocation(
        true
      );

      setLocationError("");

      setLocationMessage("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTruckLocation(
            position.coords.latitude,
            position.coords.longitude,
            "Your current GPS location was selected."
          );

          setIsFindingCurrentLocation(
            false
          );
        },

        (error) => {
          let message =
            "Unable to get your current location.";

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            message =
              "Location permission was denied. Allow location access or search/select the location on the map.";
          } else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            message =
              "Your current location is unavailable.";
          } else if (
            error.code ===
            error.TIMEOUT
          ) {
            message =
              "Location request timed out. Please try again.";
          }

          setLocationError(
            message
          );

          setIsFindingCurrentLocation(
            false
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

  // ======================================================
  // SEARCH LOCATION
  // ======================================================

  const handleLocationSearch =
    async () => {
      const query =
        locationSearch.trim();

      if (!query) {
        setLocationError(
          "Enter a city, town or area to search."
        );

        return;
      }

      setIsSearchingLocation(
        true
      );

      setLocationError("");

      setLocationMessage("");

      try {
        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=lk&q=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                "Accept-Language":
                  "en",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to search for that location."
          );
        }

        const results =
          await response.json();

        if (
          !Array.isArray(
            results
          ) ||
          results.length === 0
        ) {
          throw new Error(
            "No matching location was found in Sri Lanka."
          );
        }

        const result =
          results[0];

        setTruckLocation(
          result.lat,
          result.lon,
          `Location found: ${result.display_name}`
        );
      } catch (error) {
        console.error(
          "Truck location search error:",
          error
        );

        setLocationError(
          error.message ||
            "Unable to search for that location."
        );
      } finally {
        setIsSearchingLocation(
          false
        );
      }
    };

  // ======================================================
  // LOAD REGISTERED GARAGES
  // Used by Contact form and Tow Truck registration.
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadGarages =
      async () => {
        setIsLoadingGarages(
          true
        );

        setGarageLoadError(
          ""
        );

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/garages"
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            data.success === false
          ) {
            throw new Error(
              data.message ||
                "Unable to load registered garages."
            );
          }

          const receivedGarages =
            Array.isArray(data)
              ? data
              : data.data ||
                data.garages ||
                [];

          if (isMounted) {
            setGarages(
              receivedGarages
            );
          }
        } catch (error) {
          console.error(
            "Load garages error:",
            error
          );

          if (isMounted) {
            setGarageLoadError(
              error.message ||
                "Unable to load registered garages."
            );

            setGarages([]);
          }
        } finally {
          if (isMounted) {
            setIsLoadingGarages(
              false
            );
          }
        }
      };

    loadGarages();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // CHECK EXTERNAL TRUCK REGISTRATION STATUS
  //
  // Pending  -> Waiting message
  // Approved -> Driver ID + Temporary Password
  // Rejected -> Rejected message
  // ======================================================

  const checkExternalTruckRegistrationStatus =
    async (
      registrationId,
      silent = true
    ) => {
      const numericRegistrationId =
        Number(
          registrationId
        );

      if (
        !Number.isInteger(
          numericRegistrationId
        ) ||
        numericRegistrationId <=
          0
      ) {
        return null;
      }

      if (!silent) {
        setIsCheckingTruckRegistrationStatus(
          true
        );
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/external-truck-requests/${numericRegistrationId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to check registration status."
          );
        }

        const request =
          data.request ||
          data.data ||
          null;

        if (!request) {
          throw new Error(
            "Registration status details were not returned."
          );
        }

        const status =
          String(
            request.status ||
              ""
          ).trim();

        const normalizedStatus =
          status.toLowerCase();

        const nextStatus = {
          registrationId:
            request.registrationId ??
            request.registration_id ??
            numericRegistrationId,

          status:
            status ||
            "Pending",

          truckNumber:
            request.truckNumber ??
            request.truck_number ??
            "",

          garageId:
            request.garageId ??
            request.garage_garage_id ??
            null,

          garageName:
            request.garageName ??
            request.garage_name ??
            "",

          driverFullName:
            request.driverFullName ??
            request.full_name ??
            "",

          externalDriverId:
            request.externalDriverId ??
            request.userName ??
            request.username ??
            "",

          temporaryPassword:
            request.temporaryPassword ??
            request.temporary_password ??
            "",
        };

        setTruckRegistrationStatus(
          nextStatus
        );

        setTruckRequestSent(
          true
        );

        setTruckRegistrationStatusError(
          ""
        );

        // Approved credentials are stored temporarily
        // for easy prefill on the login screen.
        if (
          normalizedStatus ===
            "approved" &&
          nextStatus.externalDriverId
        ) {
          sessionStorage.setItem(
            "externalDriverPrefill",
            JSON.stringify({
              username:
                nextStatus.externalDriverId,

              password:
                nextStatus.temporaryPassword ||
                "",
            })
          );
        }

        return nextStatus;
      } catch (error) {
        console.error(
          "External truck registration status error:",
          error
        );

        if (!silent) {
          setTruckRegistrationStatusError(
            error.message ||
              "Unable to check registration status."
          );
        }

        return null;
      } finally {
        if (!silent) {
          setIsCheckingTruckRegistrationStatus(
            false
          );
        }
      }
    };

  // ======================================================
  // AUTO STATUS CHECK
  //
  // Check every 3 seconds while the request is Pending.
  // ======================================================

  useEffect(() => {
    if (!truckRequestOpen) {
      return;
    }

    const registrationId =
      truckRegistrationStatus
        ?.registrationId ||
      getSavedExternalTruckRegistrationId();

    if (!registrationId) {
      return;
    }

    const currentStatus =
      String(
        truckRegistrationStatus
          ?.status ||
          "Pending"
      ).toLowerCase();

    // Run an immediate check first.
    checkExternalTruckRegistrationStatus(
      registrationId,
      true
    );

    // Approved / Rejected requests no longer need polling.
    if (
      currentStatus ===
        "approved" ||
      currentStatus ===
        "rejected"
    ) {
      return;
    }

    const intervalId =
      window.setInterval(
        () => {
          checkExternalTruckRegistrationStatus(
            registrationId,
            true
          );
        },
        3000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    truckRequestOpen,
    truckRegistrationStatus
      ?.registrationId,
    truckRegistrationStatus
      ?.status,
  ]);

  // ======================================================
  // RESTORE SAVED REQUEST STATUS
  //
  // If the driver refreshes the page, the request can
  // still be checked using the saved registration ID.
  // ======================================================

  useEffect(() => {
    const savedRegistrationId =
      getSavedExternalTruckRegistrationId();

    if (!savedRegistrationId) {
      return;
    }

    setTruckRegistrationStatus(
      (previousStatus) => ({
        registrationId:
          savedRegistrationId,

        status:
          previousStatus
            ?.status ||
          "Pending",

        truckNumber:
          previousStatus
            ?.truckNumber ||
          "",

        garageId:
          previousStatus
            ?.garageId ||
          null,

        garageName:
          previousStatus
            ?.garageName ||
          "",

        driverFullName:
          previousStatus
            ?.driverFullName ||
          "",

        externalDriverId:
          previousStatus
            ?.externalDriverId ||
          "",

        temporaryPassword:
          previousStatus
            ?.temporaryPassword ||
          "",
      })
    );

    checkExternalTruckRegistrationStatus(
      savedRegistrationId,
      true
    );
  }, []);

  // ======================================================
  // SUBMIT EXTERNAL TOW TRUCK REGISTRATION REQUEST
  // ======================================================

  const handleTruckRequestSubmit =
    async (event) => {
      event.preventDefault();

      setTruckRequestSent(
        false
      );

      setTruckRequestError(
        ""
      );

      setTruckRequestErrorTitle(
        ""
      );

      setTruckRegistrationStatusError(
        ""
      );

      if (
        !truckRequestForm.garageId
      ) {
        setTruckRequestErrorTitle(
          "Garage Required"
        );

        setTruckRequestError(
          "Please select the garage that should review this request."
        );

        return;
      }

      if (
        !truckRequestForm.latitude ||
        !truckRequestForm.longitude
      ) {
        setTruckRequestErrorTitle(
          "Truck Location Required"
        );

        setTruckRequestError(
          "Please use GPS, search for an area, or select the truck location on the map."
        );

        return;
      }

      setIsSubmittingTruckRequest(
        true
      );

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/external-truck-requests",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                truckNumber:
                  truckRequestForm
                    .truckNumber
                    .trim()
                    .toUpperCase(),

                truckType:
                  truckRequestForm
                    .truckType,

                capacity:
                  truckRequestForm
                    .capacity,

                truckModel:
                  truckRequestForm
                    .truckModel
                    .trim(),

                registrationDate:
                  truckRequestForm
                    .registrationDate,

                latitude:
                  truckRequestForm
                    .latitude,

                longitude:
                  truckRequestForm
                    .longitude,

                driverFullName:
                  truckRequestForm
                    .driverFullName
                    .trim(),

                driverNic:
                  truckRequestForm
                    .driverNic
                    .trim()
                    .toUpperCase(),

                driverEmail:
                  truckRequestForm
                    .driverEmail
                    .trim()
                    .toLowerCase(),

                driverContactNumber:
                  truckRequestForm
                    .driverContactNumber
                    .trim(),

                licenceNumber:
                  truckRequestForm
                    .licenceNumber
                    .trim()
                    .toUpperCase(),

                licenceExpiryDate:
                  truckRequestForm
                    .licenceExpiryDate,

                experienceYears:
                  truckRequestForm
                    .experienceYears,

                garageId:
                  Number(
                    truckRequestForm
                      .garageId
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          const submitError =
            new Error(
              data.message ||
                "Unable to submit the tow truck registration request."
            );

          submitError.code =
            data.code ||
            "";

          submitError.data =
            data;

          throw submitError;
        }

        const createdRequest =
          data.request ||
          data.data ||
          {};

        const registrationId =
          Number(
            createdRequest.registrationId ??
              createdRequest.registration_id
          );

        if (
          !Number.isInteger(
            registrationId
          ) ||
          registrationId <= 0
        ) {
          throw new Error(
            "The registration request was created, but a valid request ID was not returned."
          );
        }

        localStorage.setItem(
          "externalTruckRegistrationRequestId",
          String(
            registrationId
          )
        );

        const selectedGarageObject =
          garages.find(
            (garage) =>
              Number(
                garage.garage_id ??
                  garage.garageId
              ) ===
              Number(
                truckRequestForm
                  .garageId
              )
          );

        setTruckRegistrationStatus({
          registrationId,

          status:
            createdRequest.status ||
            "Pending",

          truckNumber:
            createdRequest.truckNumber ||
            truckRequestForm
              .truckNumber
              .trim()
              .toUpperCase(),

          garageId:
            Number(
              truckRequestForm
                .garageId
            ),

          garageName:
            selectedGarageObject
              ?.garage_name ??
            selectedGarageObject
              ?.garageName ??
            "",

          driverFullName:
            truckRequestForm
              .driverFullName
              .trim(),

          externalDriverId:
            "",

          temporaryPassword:
            "",
        });

        setTruckRequestSent(
          true
        );

        setTruckRequestError(
          ""
        );

        setTruckRequestErrorTitle(
          ""
        );

        // Keep the popup open so the driver can see
        // the Pending -> Approved / Rejected status.
        // Do not reset the form immediately.

        setLocationSearch("");

        setLocationError("");

        setLocationMessage("");

        // Confirm the current status immediately.
        await checkExternalTruckRegistrationStatus(
          registrationId,
          true
        );
      } catch (error) {
        console.error(
          "External truck request error:",
          error
        );

        const backendMessage =
          error.message ||
          "Unable to submit the tow truck registration request.";

        const normalizedMessage =
          backendMessage
            .toLowerCase();

        const isDuplicateTruck =
          normalizedMessage.includes(
            "tow truck with this number is already registered"
          ) ||
          normalizedMessage.includes(
            "truck number is already registered"
          ) ||
          normalizedMessage.includes(
            "truck already registered"
          );

        const isDuplicateRequest =
          normalizedMessage.includes(
            "pending registration request already exists"
          ) ||
          normalizedMessage.includes(
            "approved registration request already exists"
          ) ||
          normalizedMessage.includes(
            "pending or approved request already exists"
          ) ||
          normalizedMessage.includes(
            "request already exists"
          );

        const isDuplicateDriver =
          normalizedMessage.includes(
            "truck driver with this nic"
          ) ||
          normalizedMessage.includes(
            "truck driver with these details is already registered"
          ) ||
          normalizedMessage.includes(
            "driver already registered"
          );

        if (
          isDuplicateTruck
        ) {
          setTruckRequestErrorTitle(
            "Truck Already Registered"
          );

          setTruckRequestError(
            "This truck has already been registered in the system."
          );
        } else if (
          isDuplicateRequest
        ) {
          setTruckRequestErrorTitle(
            "Registration Request Already Exists"
          );

          setTruckRequestError(
            "A pending or approved registration request already exists for this truck or driver."
          );
        } else if (
          isDuplicateDriver
        ) {
          setTruckRequestErrorTitle(
            "Driver Already Registered"
          );

          setTruckRequestError(
            "A truck driver with this NIC, email, contact number or licence number is already registered."
          );
        } else {
          setTruckRequestErrorTitle(
            "Registration Request Failed"
          );

          setTruckRequestError(
            backendMessage
          );
        }
      } finally {
        setIsSubmittingTruckRequest(
          false
        );
      }
    };

  // ======================================================
  // SELECTED GARAGE
  // ======================================================

  const selectedGarage =
    garages.find(
      (garage) =>
        Number(
          garage.garage_id ??
            garage.garageId
        ) ===
        Number(
          truckRequestForm
            .garageId
        )
    );

  const selectedContactGarage =
    garages.find(
      (garage) =>
        Number(
          garage.garage_id ??
            garage.garageId
        ) ===
        Number(
          contactForm.garageId
        )
    );

      const services = [
    {
      icon: Truck,
      title: "Emergency Tow Dispatch",
      description:
        "Request the nearest available tow truck and receive coordinated roadside support during a breakdown.",
      details:
        "When a vehicle is non-driveable, SwiftGarage AI helps coordinate an available tow truck for roadside recovery. The customer can follow tow progress and receive service updates until the vehicle reaches the selected garage.",
      image: towServiceImage,
    },
    {
      icon: MapPin,
      title: "Nearby Garage Search",
      description:
        "Discover suitable garages around your live location and compare available service options instantly.",
      details:
        "The platform uses the customer's location to identify nearby registered garages. Customers can review garage information and select a suitable service location based on availability and their vehicle support needs.",
      image: garageServiceImage,
    },
    {
      icon: Navigation,
      title: "Live Service Tracking",
      description:
        "Follow technician arrival, tow movement and service progress through real-time status updates.",
      details:
        "Customers can monitor important stages of an active roadside request, including tow truck movement, technician assignment and service progress. This keeps the customer informed throughout the recovery and repair journey.",
      image: trackingServiceImage,
    },
    {
      icon: BrainCircuit,
      title: "AI-Powered Workload Monitoring",
      description:
        "Uses CCTV-based vehicle detection to monitor garage workload and display real-time availability on the map.",
      details:
        "The AI system analyzes CCTV feeds to detect the number of vehicles currently inside each garage. Based on the detected vehicle count and garage capacity, the system calculates the real-time workload and displays it on the customer map, helping customers identify less busy garages.",
      image: aiServiceImage,
    },
    {
      icon: Wrench,
      title: "Vehicle Recovery",
      description:
        "Access professional assistance for both driveable and non-driveable vehicle recovery situations.",
      details:
        "The system supports both driveable and non-driveable vehicle situations. Customers can continue with guided recovery when the vehicle is driveable or request emergency towing when roadside transport is required.",
      image: recoveryServiceImage,
    },
    {
      icon: CheckCircle2,
      title: "Digital Service Management",
      description:
        "Manage requests, invoices, payments, service history and customer feedback through one platform.",
      details:
        "Service activities are managed digitally from request creation to completion. The platform supports service progress, communication, invoicing, payments, service history and customer feedback in one connected workflow.",
      image: managementServiceImage,
    },
  ];

  const features = [
    {
      icon: Clock3,
      title: "Fast Response",
      description:
        "Rapidly connects customers with available garages, technicians and towing resources.",
      stat: "24/7",
      label: "Support coverage",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description:
        "Live location visibility helps customers monitor every stage of their roadside request.",
      stat: "Live",
      label: "Location updates",
    },
    {
      icon: BrainCircuit,
      title: "AI-Powered Workload Insights",
      description:
        "CCTV-based vehicle detection monitors garage workload and provides real-time availability insights on the map.",
      stat: "AI",
      label: "Workload monitoring",
    },
    {
      icon: ShieldCheck,
      title: "Secure Platform",
      description:
        "Role-based access protects customer, technician, assistance and garage owner operations.",
      stat: "4",
      label: "Protected user roles",
    },
  ];

  const processSteps = [
    {
      number: "01",
      icon: ShieldAlert,
      title: "Request Assistance",
      description:
        "Submit an emergency or roadside support request in seconds.",
    },
    {
      number: "02",
      icon: MapPin,
      title: "Share Live Location",
      description:
        "Provide the vehicle location and the required service details.",
    },
    {
      number: "03",
      icon: Truck,
      title: "Resource Dispatch",
      description:
        "The best available technician or tow truck is assigned.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Track & Complete",
      description:
        "Monitor progress until recovery or repair is fully completed.",
    },
  ];

  const navLinks = [
    ["About", "about"],
    ["How It Works", "how-it-works"],
    ["Services", "services"],
    ["Why Choose Us", "why-us"],
    ["Contact", "contact"],
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#05080d] text-white scroll-smooth selection:bg-teal-400 selection:text-slate-950">
      {/* STICKY NAVIGATION */}
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-[#05080d]/90 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-2">
                <Wrench className="h-5 w-5 text-teal-400" />
              </div>

              <span className="font-black tracking-wide">
                SwiftGarage <span className="text-teal-400">AI</span>
              </span>
            </a>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Main navigation"
            >
              {navLinks.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-teal-300 lg:px-4"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 xl:flex">
              <button
                type="button"
                onClick={() => onNavigate("garage-registration")}
                className="flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-2.5 text-sm font-black text-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-400/15"
              >
                <Building2 className="h-4 w-4" />
                Register Garage
              </button>

              <button
                type="button"
                onClick={openTruckRequest}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_10px_30px_rgba(45,212,191,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(45,212,191,0.3)]"
              >
                <Truck className="h-4 w-4" />
                Register Tow Truck
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-teal-400/30 hover:text-teal-300 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="overflow-hidden md:hidden"
                aria-label="Mobile navigation"
              >
                <div className="mb-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl">
                  {navLinks.map(([label, id]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-teal-400/10 hover:text-teal-300"
                    >
                      {label}
                    </a>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate("garage-registration");
                    }}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm font-black text-teal-200"
                  >
                    <Building2 className="h-4 w-4" />
                    Register Garage
                  </button>

                  <button
                    type="button"
                    onClick={openTruckRequest}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                  >
                    <Truck className="h-4 w-4" />
                    Register Tow Truck
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative min-h-screen overflow-hidden px-4 pb-5 pt-24 sm:px-8 sm:pt-24 md:px-12 lg:h-screen lg:min-h-[720px] lg:px-16 lg:pb-4 lg:pt-20 scroll-mt-20"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional mechanic working in a modern automotive service centre"
            className="h-full w-full object-cover object-center opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#05080d] via-[#05080d]/95 to-[#05080d]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080d] via-transparent to-[#05080d]/50" />
        </div>

        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-32 bottom-20 h-[460px] w-[460px] rounded-full bg-red-500/15 blur-[140px]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col lg:h-full lg:min-h-0">
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
            }}
            className="flex items-center justify-center gap-3 pt-1 lg:hidden"
          >
            <div className="relative rounded-2xl border border-teal-400/25 bg-slate-950/70 p-3 shadow-[0_0_35px_rgba(45,212,191,0.2)] backdrop-blur-xl">
              <Wrench className="h-8 w-8 text-teal-400 md:h-10 md:w-10" />
              <Cpu className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-cyan-300" />
            </div>

            <h1 className="bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-2xl font-black uppercase tracking-wider text-transparent sm:text-4xl md:text-5xl">
              SwiftGarage <span className="text-teal-400">AI</span>
            </h1>
          </motion.div>

          <div className="grid flex-1 items-center gap-8 py-8 lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-3">
            <motion.div
              initial={{
                opacity: 0,
                x: -55,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.12,
              }}
              className="text-center lg:text-left"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-300 backdrop-blur-md sm:text-sm">
                <Sparkles className="h-4 w-4" />
                Intelligent roadside assistance
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                Smarter roadside support,

                <span className="mt-2 block bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  whenever you need it.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:mx-0 lg:text-base xl:text-lg">
                Connect with nearby garages, qualified technicians and towing
                resources through one secure, intelligent and real-time service
                platform.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <motion.button
                  whileHover={{
                    scale: 1.025,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    onNavigate("customer-login")
                  }
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 px-6 py-4 font-black uppercase tracking-wider text-white shadow-[0_18px_50px_rgba(220,38,38,0.35)] transition-shadow hover:shadow-[0_22px_70px_rgba(220,38,38,0.5)] sm:w-auto"
                >
                  <ShieldAlert className="h-6 w-6 group-hover:animate-pulse" />
                  Emergency / Customer Login
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.button>

                <button
                  type="button"
                  onClick={scrollToAbout}
                  className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-slate-100 backdrop-blur-md transition hover:border-teal-400/40 hover:bg-teal-400/10"
                >
                  Explore Platform
                  <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("garage-registration")
                  }
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-6 py-4 font-bold text-blue-200 backdrop-blur-md transition hover:border-blue-300/60 hover:bg-blue-400/15 sm:w-auto"
                >
                  <Building2 className="h-5 w-5" />
                  Register Your Garage
                </button>

                <button
                  type="button"
                  onClick={openTruckRequest}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-teal-400/30 bg-teal-400/10 px-6 py-4 font-bold text-teal-200 backdrop-blur-md transition hover:border-teal-300/60 hover:bg-teal-400/15 sm:w-auto"
                >
                  <Truck className="h-5 w-5" />
                  Register Your Tow Truck
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 55,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.85,
                delay: 0.22,
              }}
              className="relative mx-auto w-full max-w-xl"
            >
              <motion.div
                animate={{
                  y: [0, -9, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/65 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              >
                <div className="relative h-[300px] overflow-hidden rounded-[1.55rem] sm:h-[380px] lg:h-[310px] xl:h-[350px]">
                  <img
                    src={towServiceImage}
                    alt="Roadside towing and vehicle recovery service"
                    className="h-full w-full object-cover transition-transform duration-[1500ms] hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-2xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                      Fast, Reliable Support When You Need It Most.
                    </h3>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.4,
            }}
            className="pb-1 lg:shrink-0"
          >
            <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
              <motion.button
                type="button"
                whileHover={{
                  y: -6,
                  scale: 1.015,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  onNavigate("staff-login")
                }
                className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left backdrop-blur-xl transition hover:border-teal-400/40 hover:bg-slate-900/80 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    <ShieldCheck className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Secure staff access
                    </p>

                    <p className="text-lg font-black text-white sm:text-xl">
                      Staff Login
                    </p>

                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Garage Owner, Technician and Assistance Officer
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-300" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{
                  y: -6,
                  scale: 1.015,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  onNavigate("external-driver-login")
                }
                className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-cyan-400/25 bg-slate-950/60 p-4 text-left backdrop-blur-xl transition hover:border-cyan-400/50 hover:bg-slate-900/80 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    <Truck className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      External partner access
                    </p>

                    <p className="text-lg font-black text-white sm:text-xl">
                      External Driver Login
                    </p>

                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Approved External Tow Truck Drivers
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-300" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative overflow-hidden bg-[#080d14] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[150px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{
              opacity: 0,
              y: 80,
              scale: 0.9,
              rotateX: 10,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            viewport={{
              once: true,
              amount: 0.28,
            }}
            transition={{
              duration: 1.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              y: -8,
              scale: 1.01,
            }}
            className="relative [perspective:1400px]"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.5)]"
            >
              <motion.img
                src={aboutImage}
                alt="Technician servicing a vehicle in a modern garage"
                initial={{
                  scale: 1.18,
                  filter: "blur(10px)",
                }}
                whileInView={{
                  scale: 1,
                  filter: "blur(0px)",
                }}
                viewport={{
                  once: true,
                  amount: 0.28,
                }}
                transition={{
                  duration: 1.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: 1.06,
                }}
                className="h-[420px] w-full object-cover sm:h-[540px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

              <motion.div
                initial={{
                  x: -28,
                  opacity: 0,
                }}
                whileInView={{
                  x: 0,
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
              >
                <div className="max-w-sm rounded-2xl border border-white/15 bg-slate-950/65 p-5 backdrop-blur-xl">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
                    Connected ecosystem
                  </p>

                  <p className="mt-2 text-xl font-black">
                    Customer. Garage. Technician. Assistance.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">
              <Info className="h-4 w-4" />
              About the platform
            </div>

            <h2 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              One intelligent platform for
              <span className="block text-teal-400">
                complete vehicle support.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              SwiftGarage AI connects customers, garage owners, technicians and
              assistance officers in real time, creating a faster and more reliable
              roadside service experience.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              From emergency towing and nearby garage discovery to technician
              assignment, live tracking, digital invoicing and AI-powered
              recommendations, every service is managed through one centralized system.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [
                  Gauge,
                  "Faster coordination",
                  "Reduce delays with real-time resource visibility.",
                ],
                [
                  ShieldCheck,
                  "Trusted operations",
                  "Secure role-based access for every platform user.",
                ],
                [
                  CarFront,
                  "End-to-end recovery",
                  "Support the customer from breakdown to completion.",
                ],
                [
                  BrainCircuit,
                  "Intelligent decisions",
                  "Use AI guidance to select suitable service options.",
                ],
              ].map(([Icon, title, text]) => (
                <motion.div
                  key={title}
                  whileHover={{
                    y: -5,
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-teal-400/30 hover:bg-teal-400/[0.06]"
                >
                  <Icon className="h-6 w-6 text-teal-300" />

                  <h3 className="mt-4 font-bold">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[#05080d] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="mx-auto mb-16 max-w-3xl text-center"
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">
              Simple process
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">
              From request to recovery in four steps.
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              A clear digital workflow helps customers receive faster, better coordinated roadside support.
            </p>
          </motion.div>

          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              variants={imageRevealLeft}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="relative overflow-hidden rounded-[2rem] border border-white/10"
            >
              <img
                src={processImage}
                alt="Vehicle travelling on a road with live assistance tracking"
                className="h-[470px] w-full object-cover sm:h-[620px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-slate-950/75 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-teal-400/15 p-3 text-teal-300">
                    <Navigation className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Real-time journey
                    </p>

                    <p className="mt-1 text-lg font-black">
                      Track every important service update.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="relative space-y-4"
            >
              <div className="absolute bottom-10 left-7 top-10 hidden w-px bg-gradient-to-b from-teal-400/70 via-teal-400/20 to-transparent sm:block" />

              {processSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.number}
                    variants={cardReveal}
                    whileHover={{
                      x: 6,
                    }}
                    className="group relative flex gap-5 rounded-3xl border border-white/10 bg-slate-900/55 p-6 backdrop-blur-sm transition hover:border-teal-400/35 hover:bg-slate-900/80 sm:p-7"
                  >
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300 shadow-[0_0_25px_rgba(45,212,191,0.1)]">
                      <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-black">
                          {step.title}
                        </h3>

                        <span className="text-3xl font-black text-white/[0.06]">
                          {step.number}
                        </span>
                      </div>

                      <p className="mt-2 leading-7 text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="bg-[#080d14] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
          >
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">
                What we provide
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">
                Professional services built around your journey.
              </h2>
            </div>

            <p className="max-w-md leading-7 text-slate-400">
              A complete set of digital services supports emergency response, recovery, communication and service management.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.title}
                  variants={cardReveal}
                  whileHover={{
                    y: -10,
                  }}
                  onClick={() =>
                    setSelectedService(service)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setSelectedService(service);
                    }
                  }}
                  className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70 shadow-[0_18px_55px_rgba(0,0,0,0.22)] transition hover:border-teal-400/35 hover:shadow-[0_24px_70px_rgba(0,0,0,0.36)] focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />

                    <div className="absolute bottom-4 left-5 rounded-2xl border border-white/15 bg-slate-950/75 p-3 text-teal-300 backdrop-blur-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-black">
                        {service.title}
                      </h3>

                      <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-300" />
                    </div>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {service.description}
                    </p>

                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-teal-300/80">
                      Click to learn more
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        id="why-us"
        className="relative overflow-hidden bg-[#05080d] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20"
      >
        <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[150px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">
              Why choose us
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">
              Reliable technology. Human-focused assistance.
            </h2>

            <p className="mt-6 max-w-2xl leading-8 text-slate-400">
              SwiftGarage AI combines automation, live information and coordinated service teams to create a dependable roadside support experience.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="mt-10 grid gap-5 sm:grid-cols-2"
            >
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    variants={cardReveal}
                    whileHover={{
                      y: -6,
                    }}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-teal-400/30 hover:bg-teal-400/[0.055]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-2xl bg-teal-400/10 p-3 text-teal-300">
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-white">
                          {feature.stat}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {feature.label}
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 110,
              rotate: 3,
              scale: 0.92,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              rotate: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.26,
            }}
            transition={{
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              rotate: -1,
              scale: 1.01,
            }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.012, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_35px_110px_rgba(0,0,0,0.52)]"
            >
              <img
                src={technicianImage}
                alt="Professional automotive technician using digital diagnostic technology"
                className="block h-[520px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[680px]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.94,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-slate-950/75 p-5 backdrop-blur-xl sm:left-8 sm:right-auto sm:max-w-sm"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                    Secure & connected
                  </p>

                  <p className="mt-1 font-black">
                    Built for trusted service operations.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative overflow-hidden bg-[#080d14] px-5 pt-24 sm:px-8 md:pt-32 lg:px-14 scroll-mt-20"
      >
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[150px]" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">
              Get in touch
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">
              We are ready to assist you.
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              Contact the SwiftGarage AI support team for roadside assistance or platform-related inquiries.
            </p>
          </motion.div>

          <div className="grid gap-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
                        <motion.div
              variants={imageRevealLeft}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="relative min-h-[620px] overflow-hidden rounded-[2rem] border border-white/10"
            >
              <img
                src={supportImage}
                alt="Customer support team ready to assist"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/15" />

              <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-end p-6 sm:p-8">
                <div className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-slate-950/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-300 backdrop-blur-xl">
                  <Headphones className="h-4 w-4" />
                  Support centre
                </div>

                <h3 className="max-w-md text-3xl font-black sm:text-4xl">
                  Professional support when every minute matters.
                </h3>

                <p className="mt-4 max-w-lg leading-7 text-slate-300">
                  Our support team helps coordinate assistance requests,
                  service communication and platform inquiries.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    [Phone, "+94 77 123 4567"],
                    [Mail, "support@swiftgarage.ai"],
                    [MapPin, "Colombo, Sri Lanka"],
                  ].map(([Icon, text]) => (
                    <div
                      key={text}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl"
                    >
                      <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="break-all font-semibold text-slate-200">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.form
              variants={imageRevealRight}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              onSubmit={handleContactSubmit}
              className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-9"
            >
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-300">
                  Send a message
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  How can we help?
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Complete the form and our support team will respond
                  as soon as possible.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Name
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Enter your name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Email
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-number"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Contact Number
                </label>

                <input
                  id="contact-number"
                  name="contactNumber"
                  type="tel"
                  value={contactForm.contactNumber}
                  onChange={handleContactChange}
                  placeholder="Enter your contact number"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-garage"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Select Garage
                </label>

                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-300" />

                  <select
                    id="contact-garage"
                    name="garageId"
                    value={contactForm.garageId}
                    onChange={handleContactChange}
                    required
                    disabled={
                      isLoadingGarages ||
                      isSubmittingContact
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-12 pr-11 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option
                      value=""
                      className="bg-slate-900"
                    >
                      {isLoadingGarages
                        ? "Loading registered garages..."
                        : "Select a registered garage"}
                    </option>

                    {garages.map((garage) => {
                      const garageId =
                        garage.garage_id ??
                        garage.garageId;

                      const garageName =
                        garage.garage_name ??
                        garage.garageName ??
                        "Garage";

                      const garageLocation =
                        garage.address ??
                        garage.location ??
                        "Location not available";

                      return (
                        <option
                          key={garageId}
                          value={garageId}
                          className="bg-slate-900"
                        >
                          {garageName} - {garageLocation}
                        </option>
                      );
                    })}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>

                {garageLoadError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{garageLoadError}</p>
                  </div>
                )}

                {selectedContactGarage && (
                  <div className="mt-3 rounded-xl border border-teal-400/20 bg-teal-400/[0.07] p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />

                      <div>
                        <p className="font-bold text-white">
                          {selectedContactGarage.garage_name ??
                            selectedContactGarage.garageName ??
                            "Selected Garage"}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {selectedContactGarage.address ??
                            selectedContactGarage.location ??
                            "Location not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Message / Comment
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Type your message or comment"
                  rows={6}
                  required
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                />
              </div>

              <AnimatePresence>
                {contactSubmitError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {contactSubmitError}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {messageSent && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    role="status"
                    className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />

                    Your message has been sent successfully.
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={{
                  scale: 1.015,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                disabled={
                  isSubmittingContact ||
                  isLoadingGarages
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-4 font-black tracking-wide text-slate-950 shadow-[0_15px_40px_rgba(45,212,191,0.2)] transition hover:shadow-[0_18px_55px_rgba(45,212,191,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingContact ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}

                {isSubmittingContact
                  ? "Sending Message..."
                  : "Send Message"}
              </motion.button>
            </motion.form>
          </div>
        </div>

        <footer className="border-t border-white/10 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-teal-400" />

                <span className="font-black tracking-wide">
                  SwiftGarage{" "}
                  <span className="text-teal-400">
                    AI
                  </span>
                </span>
              </div>

              <div
                className="flex items-center gap-3"
                aria-label="Social media"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-teal-400/40 hover:text-teal-300"
                  title="Facebook"
                >
                  <FaFacebookF className="h-4 w-4" />
                </div>

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-teal-400/40 hover:text-teal-300"
                  title="Instagram"
                >
                  <FaInstagram className="h-5 w-5" />
                </div>

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-teal-400/40 hover:text-teal-300"
                  title="LinkedIn"
                >
                  <FaLinkedinIn className="h-4 w-4" />
                </div>
              </div>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm"
            >
              <a
                href="#top"
                className="text-slate-400 transition hover:text-teal-300"
              >
                Home
              </a>

              {navLinks.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-slate-400 transition hover:text-teal-300"
                >
                  {label}
                </a>
              ))}
            </nav>

            <p className="text-center text-sm text-slate-500">
              © 2026 SwiftGarage AI. All Rights Reserved.
            </p>
          </div>
        </footer>
      </section>

      {/* SERVICE DETAILS POPUP */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={() =>
              setSelectedService(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 18,
                scale: 0.96,
              }}
              transition={{
                duration: 0.22,
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080d14] shadow-[0_35px_110px_rgba(0,0,0,0.7)]"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080d14] via-[#080d14]/45 to-transparent" />

                <button
                  type="button"
                  onClick={() =>
                    setSelectedService(null)
                  }
                  className="absolute right-4 top-4 rounded-xl border border-white/15 bg-slate-950/75 p-2.5 text-slate-200 backdrop-blur-xl transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                  aria-label="Close service details"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4 sm:bottom-6 sm:left-7 sm:right-7">
                  <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 p-3 text-teal-300 backdrop-blur-xl">
                    {React.createElement(
                      selectedService.icon,
                      {
                        className:
                          "h-7 w-7",
                      }
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                      SwiftGarage AI Service
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                      {selectedService.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-base leading-8 text-slate-300 sm:text-lg">
                  {selectedService.details}
                </p>

                <div className="mt-6 rounded-2xl border border-teal-400/15 bg-teal-400/[0.05] p-4">
                  <p className="text-sm leading-7 text-slate-400">
                    {selectedService.description}
                  </p>
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedService(null)
                    }
                    className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:-translate-y-0.5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
            {/* =====================================================
          EXTERNAL TOW TRUCK REGISTRATION POPUP
      ===================================================== */}
      <AnimatePresence>
        {truckRequestOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={closeTruckRequest}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                duration: 0.25,
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              className="my-4 max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080d14] shadow-[0_35px_120px_rgba(0,0,0,0.7)]"
            >
              {/* =================================================
                  POPUP HEADER
              ================================================= */}
              <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#080d14]/95 px-5 py-4 backdrop-blur-xl sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300">
                    <Truck className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                      External Partner Request
                    </p>

                    <h2 className="text-xl font-black sm:text-2xl">
                      Tow Truck Registration Request
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeTruckRequest}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                  aria-label="Close registration form"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleTruckRequestSubmit}
                className="space-y-8 p-5 sm:p-8"
              >
                {/* =================================================
                    REGISTRATION STATUS AREA
                ================================================= */}
                <AnimatePresence mode="wait">
                  {truckRegistrationStatus &&
                    String(
                      truckRegistrationStatus.status
                    ).toLowerCase() ===
                      "pending" && (
                      <motion.div
                        key="pending-registration"
                        initial={{
                          opacity: 0,
                          y: -15,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          scale: 0.98,
                        }}
                        className="overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-orange-400/[0.06] to-slate-950"
                      >
                        <div className="p-5 sm:p-7">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                              <Clock3 className="h-7 w-7" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-black text-white sm:text-2xl">
                                  Registration Request Pending
                                </h3>

                                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                                  Pending
                                </span>
                              </div>

                              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                                Your external tow truck
                                registration request has
                                been sent to the selected
                                garage owner.
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                Please wait while the garage
                                owner reviews your truck and
                                driver information. This
                                message will automatically
                                update when the request is
                                approved or rejected.
                              </p>

                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Request ID
                                  </p>

                                  <p className="mt-2 font-black text-white">
                                    EXT-REQ-
                                    {String(
                                      truckRegistrationStatus.registrationId ||
                                        ""
                                    ).padStart(
                                      4,
                                      "0"
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Selected Garage
                                  </p>

                                  <p className="mt-2 font-black text-white">
                                    {truckRegistrationStatus.garageName ||
                                      selectedGarage?.garage_name ||
                                      selectedGarage?.garageName ||
                                      "Selected Garage"}
                                  </p>
                                </div>

                                {truckRegistrationStatus.truckNumber && (
                                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                      Tow Truck
                                    </p>

                                    <p className="mt-2 font-black text-white">
                                      {
                                        truckRegistrationStatus.truckNumber
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-200">
                                  <LoaderCircle className="h-5 w-5 animate-spin" />

                                  Waiting for Garage Owner
                                  approval...
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    isCheckingTruckRegistrationStatus
                                  }
                                  onClick={() =>
                                    checkExternalTruckRegistrationStatus(
                                      truckRegistrationStatus.registrationId,
                                      false
                                    )
                                  }
                                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isCheckingTruckRegistrationStatus ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}

                                  {isCheckingTruckRegistrationStatus
                                    ? "Checking..."
                                    : "Check Status"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {truckRegistrationStatus &&
                    String(
                      truckRegistrationStatus.status
                    ).toLowerCase() ===
                      "approved" && (
                      <motion.div
                        key="approved-registration"
                        initial={{
                          opacity: 0,
                          y: -15,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          scale: 0.97,
                        }}
                        className="overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 via-teal-400/[0.07] to-slate-950 shadow-[0_20px_70px_rgba(16,185,129,0.08)]"
                      >
                        <div className="p-5 sm:p-7">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,0.12)]">
                              <CheckCircle2 className="h-9 w-9" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-black text-white sm:text-3xl">
                                  Registration Approved
                                </h3>

                                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
                                  Approved
                                </span>
                              </div>

                              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                                Your external tow truck
                                registration has been
                                approved by{" "}
                                <span className="font-bold text-emerald-300">
                                  {truckRegistrationStatus.garageName ||
                                    "the Garage Owner"}
                                </span>
                                .
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                Use the credentials below to
                                sign in to your External
                                Driver account.
                              </p>

                              <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5">
                                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                                    External Driver ID
                                  </p>

                                  <div className="mt-3 break-all rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-lg font-black text-white">
                                    {truckRegistrationStatus.externalDriverId ||
                                      "Loading..."}
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-5">
                                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                                    Temporary Password
                                  </p>

                                  <div className="mt-3 break-all rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-lg font-black text-white">
                                    {truckRegistrationStatus.temporaryPassword ||
                                      "Loading..."}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4">
                                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                                <div>
                                  <p className="font-bold text-amber-200">
                                    Keep these credentials
                                    secure.
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-amber-100/70">
                                    You can change the
                                    temporary password after
                                    signing in to your
                                    External Driver account.
                                    Your External Driver ID
                                    remains the same.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <motion.button
                                  type="button"
                                  whileHover={{
                                    y: -2,
                                    scale: 1.01,
                                  }}
                                  whileTap={{
                                    scale: 0.98,
                                  }}
                                  disabled={
                                    !truckRegistrationStatus.externalDriverId ||
                                    !truckRegistrationStatus.temporaryPassword
                                  }
                                  onClick={
                                    goToExternalDriverLogin
                                  }
                                  className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-6 py-4 font-black text-slate-950 shadow-[0_15px_45px_rgba(45,212,191,0.2)] transition disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <UserRound className="h-5 w-5" />
                                  GO TO DRIVER LOGIN
                                  <ArrowUpRight className="h-5 w-5" />
                                </motion.button>

                                <button
                                  type="button"
                                  onClick={
                                    closeTruckRequest
                                  }
                                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-slate-300 transition hover:bg-white/10"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {truckRegistrationStatus &&
                    String(
                      truckRegistrationStatus.status
                    ).toLowerCase() ===
                      "rejected" && (
                      <motion.div
                        key="rejected-registration"
                        initial={{
                          opacity: 0,
                          y: -15,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          scale: 0.97,
                        }}
                        className="overflow-hidden rounded-3xl border border-red-400/30 bg-gradient-to-br from-red-400/10 via-rose-400/[0.05] to-slate-950"
                      >
                        <div className="p-5 sm:p-7">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-400/30 bg-red-400/10 text-red-300">
                              <X className="h-8 w-8" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-black text-white sm:text-2xl">
                                  Registration Request
                                  Rejected
                                </h3>

                                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-300">
                                  Rejected
                                </span>
                              </div>

                              <p className="mt-3 leading-7 text-slate-300">
                                Your external tow truck
                                registration request was not
                                approved by the selected
                                garage.
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                You can clear this request
                                and submit a new registration
                                request after reviewing your
                                details.
                              </p>

                              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <button
                                  type="button"
                                  onClick={
                                    clearExternalTruckRegistrationStatus
                                  }
                                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3.5 font-black text-slate-950 transition hover:-translate-y-0.5"
                                >
                                  <Truck className="h-5 w-5" />
                                  Start New Registration
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    closeTruckRequest
                                  }
                                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* STATUS CHECK ERROR */}
                <AnimatePresence>
                  {truckRegistrationStatusError && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                      <div className="flex-1">
                        <p className="font-bold">
                          Unable to update registration
                          status
                        </p>

                        <p className="mt-1 text-red-200/75">
                          {
                            truckRegistrationStatusError
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTruckRegistrationStatusError(
                            ""
                          )
                        }
                        className="rounded-lg p-1 hover:bg-red-400/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* =================================================
                    FORM INFORMATION
                ================================================= */}
                {!truckRegistrationStatus && (
                  <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-5">
                    <p className="text-sm leading-7 text-slate-300">
                      Enter the tow truck and truck driver
                      details below. The request will be
                      reviewed by the selected garage owner
                      before the tow truck is added to the
                      SwiftGarage AI service network.
                    </p>
                  </div>
                )}

                {/* =================================================
                    ONLY SHOW EDITABLE FORM WHEN NO ACTIVE REQUEST
                ================================================= */}
                {!truckRegistrationStatus && (
                  <>
                    {/* SELECT GARAGE */}
                    <FormSection
                      icon={Building2}
                      title="Select Garage"
                    >
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-300">
                          Preferred Garage
                        </label>

                        <select
                          name="garageId"
                          value={
                            truckRequestForm.garageId
                          }
                          onChange={
                            handleTruckRequestChange
                          }
                          required
                          disabled={
                            isLoadingGarages ||
                            isSubmittingTruckRequest
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {isLoadingGarages
                              ? "Loading registered garages..."
                              : "Select a garage"}
                          </option>

                          {garages.map(
                            (garage) => {
                              const garageId =
                                garage.garage_id ??
                                garage.garageId;

                              const garageName =
                                garage.garage_name ??
                                garage.garageName;

                              const garageLocation =
                                garage.district ||
                                garage.address ||
                                "Location unavailable";

                              return (
                                <option
                                  key={
                                    garageId
                                  }
                                  value={
                                    garageId
                                  }
                                >
                                  {
                                    garageName
                                  }{" "}
                                  —{" "}
                                  {
                                    garageLocation
                                  }
                                </option>
                              );
                            }
                          )}
                        </select>

                        {garageLoadError && (
                          <p className="mt-2 text-sm text-red-300">
                            {
                              garageLoadError
                            }
                          </p>
                        )}
                      </div>

                      {selectedGarage && (
                        <div className="rounded-2xl border border-teal-400/20 bg-teal-400/[0.06] p-4 sm:col-span-2">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                                Selected Garage
                              </p>

                              <p className="mt-2 font-black text-white">
                                {selectedGarage.garage_name ??
                                  selectedGarage.garageName}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {selectedGarage.address ||
                                  "Address unavailable"}

                                {selectedGarage.district
                                  ? `, ${selectedGarage.district}`
                                  : ""}
                              </p>
                            </div>

                            {selectedGarage.latitude &&
                              selectedGarage.longitude && (
                                <a
                                  href={`https://www.google.com/maps?q=${selectedGarage.latitude},${selectedGarage.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm font-bold text-teal-200 transition hover:bg-teal-400/15"
                                >
                                  <MapPin className="h-4 w-4" />
                                  View Garage
                                  Location
                                </a>
                              )}
                          </div>
                        </div>
                      )}
                    </FormSection>

                    {/* TOW TRUCK DETAILS */}
                    <FormSection
                      icon={Truck}
                      title="Tow Truck Details"
                    >
                      <FormInput
                        label="Truck Number"
                        name="truckNumber"
                        value={
                          truckRequestForm.truckNumber
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        placeholder="CAB-1234 or WP CAA-1234"
                        pattern="(?:[A-Za-z]{2,3}-[0-9]{4}|[A-Za-z]{2} [A-Za-z]{1,3}-[0-9]{4})"
                        title="Examples: CAB-1234, AB-1234 or WP CAA-1234"
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormSelect
                        label="Truck Type"
                        name="truckType"
                        value={
                          truckRequestForm.truckType
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                        options={[
                          "Flatbed Tow Truck",
                          "Wheel Lift Tow Truck",
                          "Integrated Tow Truck",
                          "Heavy Duty Tow Truck",
                        ]}
                      />

                      <FormInput
                        label="Capacity (Tons)"
                        name="capacity"
                        value={
                          truckRequestForm.capacity
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        placeholder="Example: 5 tons"
                        type="number"
                        min="0.1"
                        step="0.1"
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Truck Model"
                        name="truckModel"
                        value={
                          truckRequestForm.truckModel
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Registration Date"
                        name="registrationDate"
                        type="date"
                        value={
                          truckRequestForm.registrationDate
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled
                        required
                      />

                      {/* LOCATION AREA */}
                      <div className="rounded-3xl border border-blue-400/20 bg-blue-400/[0.045] p-4 sm:col-span-2 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                              Search Truck City /
                              Area
                            </label>

                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                              <input
                                type="text"
                                value={
                                  locationSearch
                                }
                                onChange={(
                                  event
                                ) => {
                                  setLocationSearch(
                                    event
                                      .target
                                      .value
                                  );

                                  if (
                                    locationError
                                  ) {
                                    setLocationError(
                                      ""
                                    );
                                  }
                                }}
                                onKeyDown={(
                                  event
                                ) => {
                                  if (
                                    event.key ===
                                    "Enter"
                                  ) {
                                    event.preventDefault();

                                    handleLocationSearch();
                                  }
                                }}
                                placeholder="Example: Nugegoda, Maharagama, Kandy"
                                disabled={
                                  isSubmittingTruckRequest ||
                                  isSearchingLocation
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/10 disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={
                                handleLocationSearch
                              }
                              disabled={
                                isSubmittingTruckRequest ||
                                isSearchingLocation ||
                                !locationSearch.trim()
                              }
                              className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-5 py-3.5 text-sm font-black text-blue-300 transition hover:bg-blue-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSearchingLocation ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                              ) : (
                                <Search className="h-5 w-5" />
                              )}

                              {isSearchingLocation
                                ? "Searching..."
                                : "Search Area"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleUseCurrentLocation
                              }
                              disabled={
                                isSubmittingTruckRequest ||
                                isFindingCurrentLocation
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isFindingCurrentLocation ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                              ) : (
                                <LocateFixed className="h-5 w-5" />
                              )}

                              {isFindingCurrentLocation
                                ? "Finding GPS..."
                                : "Use My Current Location"}
                            </button>
                          </div>
                        </div>

                        {locationError && (
                          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                            <p>
                              {
                                locationError
                              }
                            </p>
                          </div>
                        )}

                        {locationMessage &&
                          !locationError && (
                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                              <p>
                                {
                                  locationMessage
                                }
                              </p>
                            </div>
                          )}

                        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                            <MapPin className="h-5 w-5 text-blue-300" />

                            <div>
                              <p className="text-sm font-black text-white">
                                Select Exact Truck
                                Location
                              </p>

                              <p className="text-xs text-slate-500">
                                Search first, use
                                GPS, or click
                                anywhere on the map
                                to adjust the
                                marker.
                              </p>
                            </div>
                          </div>

                          <div className="h-[360px] w-full">
                            <MapContainer
                              center={[
                                truckRequestForm.latitude
                                  ? Number(
                                      truckRequestForm.latitude
                                    )
                                  : DEFAULT_TRUCK_LOCATION.latitude,

                                truckRequestForm.longitude
                                  ? Number(
                                      truckRequestForm.longitude
                                    )
                                  : DEFAULT_TRUCK_LOCATION.longitude,
                              ]}
                              zoom={
                                truckRequestForm.latitude &&
                                truckRequestForm.longitude
                                  ? 15
                                  : 7
                              }
                              scrollWheelZoom
                              className="h-full w-full"
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />

                              <TruckLocationClickHandler
                                onLocationSelect={(
                                  latitude,
                                  longitude
                                ) =>
                                  setTruckLocation(
                                    latitude,
                                    longitude,
                                    "Truck location was selected from the map."
                                  )
                                }
                              />

                              <RecenterTruckMap
                                latitude={
                                  truckRequestForm.latitude ||
                                  DEFAULT_TRUCK_LOCATION.latitude
                                }
                                longitude={
                                  truckRequestForm.longitude ||
                                  DEFAULT_TRUCK_LOCATION.longitude
                                }
                                zoom={
                                  truckRequestForm.latitude &&
                                  truckRequestForm.longitude
                                    ? 15
                                    : 7
                                }
                              />

                              {truckRequestForm.latitude &&
                                truckRequestForm.longitude && (
                                  <Marker
                                    position={[
                                      Number(
                                        truckRequestForm.latitude
                                      ),

                                      Number(
                                        truckRequestForm.longitude
                                      ),
                                    ]}
                                  />
                                )}
                            </MapContainer>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                              Latitude
                            </label>

                            <input
                              type="text"
                              value={
                                truckRequestForm.latitude
                              }
                              readOnly
                              required
                              placeholder="Auto-filled from GPS, search or map"
                              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-slate-300 outline-none placeholder:text-slate-600"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                              Longitude
                            </label>

                            <input
                              type="text"
                              value={
                                truckRequestForm.longitude
                              }
                              readOnly
                              required
                              placeholder="Auto-filled from GPS, search or map"
                              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-slate-300 outline-none placeholder:text-slate-600"
                            />
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* DRIVER DETAILS */}
                    <FormSection
                      icon={UserRound}
                      title="Truck Driver Details"
                    >
                      <FormInput
                        label="Full Name"
                        name="driverFullName"
                        value={
                          truckRequestForm.driverFullName
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="NIC"
                        name="driverNic"
                        value={
                          truckRequestForm.driverNic
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        placeholder="200012345678 or 901234567V"
                        maxLength={12}
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Email"
                        name="driverEmail"
                        type="email"
                        value={
                          truckRequestForm.driverEmail
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Contact Number"
                        name="driverContactNumber"
                        type="tel"
                        value={
                          truckRequestForm.driverContactNumber
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        placeholder="07XXXXXXXX"
                        maxLength={10}
                        pattern="0[0-9]{9}"
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Licence Number"
                        name="licenceNumber"
                        value={
                          truckRequestForm.licenceNumber
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Licence Expiry Date"
                        name="licenceExpiryDate"
                        type="date"
                        value={
                          truckRequestForm.licenceExpiryDate
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        min={new Date()
                          .toISOString()
                          .slice(
                            0,
                            10
                          )}
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />

                      <FormInput
                        label="Experience (Years)"
                        name="experienceYears"
                        type="number"
                        min="0"
                        max="60"
                        step="1"
                        value={
                          truckRequestForm.experienceYears
                        }
                        onChange={
                          handleTruckRequestChange
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        required
                      />
                    </FormSection>

                    {/* SUBMISSION ERROR */}
                    <AnimatePresence>
                      {truckRequestError && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -8,
                            scale: 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                            scale: 0.98,
                          }}
                          role="alert"
                          className="flex items-start gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-300 shadow-[0_15px_45px_rgba(248,113,113,0.08)]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/25 bg-red-400/10">
                            <ShieldAlert className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-black text-red-300">
                              {truckRequestErrorTitle ||
                                "Registration Request Failed"}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-200/80">
                              {
                                truckRequestError
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTruckRequestError(
                                ""
                              );

                              setTruckRequestErrorTitle(
                                ""
                              );
                            }}
                            className="rounded-lg p-1 text-red-300/70 transition hover:bg-red-400/10 hover:text-red-200"
                            aria-label="Dismiss error message"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* FORM BUTTONS */}
                    <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={
                          closeTruckRequest
                        }
                        disabled={
                          isSubmittingTruckRequest
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <motion.button
                        type="submit"
                        disabled={
                          isSubmittingTruckRequest ||
                          isLoadingGarages
                        }
                        whileHover={
                          isSubmittingTruckRequest
                            ? {}
                            : {
                                y: -2,
                                scale: 1.01,
                              }
                        }
                        whileTap={
                          isSubmittingTruckRequest
                            ? {}
                            : {
                                scale: 0.98,
                              }
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3.5 font-black text-slate-950 shadow-[0_14px_40px_rgba(45,212,191,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingTruckRequest ? (
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}

                        {isSubmittingTruckRequest
                          ? "Submitting Request..."
                          : "Submit Registration Request"}
                      </motion.button>
                    </div>
                  </>
                )}

                {/* =================================================
                    PENDING REQUEST BOTTOM ACTIONS
                ================================================= */}
                {truckRegistrationStatus &&
                  String(
                    truckRegistrationStatus.status
                  ).toLowerCase() ===
                    "pending" && (
                    <div className="flex justify-end border-t border-white/10 pt-6">
                      <button
                        type="button"
                        onClick={
                          closeTruckRequest
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10"
                      >
                        Close & Continue Waiting
                      </button>
                    </div>
                  )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ======================================================
// FORM SECTION
// ======================================================

function FormSection({
  icon: Icon,
  title,
  children,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300">
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="text-lg font-black">
          {title}
        </h3>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

// ======================================================
// FORM INPUT
// ======================================================

function FormInput({
  label,
  className = "",
  type = "text",
  ...props
}) {
  const openCalendar = (
    event
  ) => {
    if (
      type === "date" &&
      typeof event.currentTarget
        .showPicker === "function"
    ) {
      event.currentTarget.showPicker();
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <input
        {...props}
        type={type}
        onClick={
          openCalendar
        }
        className={`w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          type === "date"
            ? "cursor-pointer [color-scheme:dark]"
            : ""
        }`}
      />
    </div>
  );
}

// ======================================================
// FORM SELECT
// ======================================================

function FormSelect({
  label,
  options,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <select
        {...props}
        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">
          Select {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

