import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  MapPinned,
  MapPin,
  Navigation,
  Save,
  X,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons when the app is bundled with Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_MAP_CENTER = [6.8728, 79.8887];

const getToday = () => new Date().toISOString().split("T")[0];

const formatGarageCode = (garageId) =>
  `GAR-${String(garageId).padStart(3, "0")}`;

const createInitialForm = (garageCode = "Loading...") => ({
  garage: {
    garage_id: garageCode,
    garage_name: "",
    contact_number: "",
    address: "",
    district: "",
    latitude: "",
    longitude: "",
    capacity: "",
    opening_time: "08:00",
    closing_time: "18:00",
    working_days: "Monday - Saturday",
    shift_type: "Day Shift",
  },

  garage_owner: {
    garage_owner_id: "",
    garage_id: "",
    full_name: "",
    nic: "",
    email: "",
    contact_number: "",
    joined_date: getToday(),
    login_login_id: "",
  },

  login: {
    username: "",
    password: "",
    confirm_password: "",
  },
});

export default function GarageRegistration({ onNavigate }) {
  const [form, setForm] = useState(() => createInitialForm());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSelection, setMapSelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredGarageId, setRegisteredGarageId] = useState("");

  const garageId = useMemo(() => form.garage.garage_id, [form.garage.garage_id]);

  const loadNextGarageCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/garages");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to generate garage ID.");
      }

      const garages = Array.isArray(result.data) ? result.data : [];
      const highestGarageId = garages.reduce(
        (highest, currentGarage) =>
          Math.max(highest, Number(currentGarage.garage_id) || 0),
        0
      );

      const nextGarageCode = formatGarageCode(highestGarageId + 1);
      setForm(createInitialForm(nextGarageCode));
      return nextGarageCode;
    } catch (loadError) {
      console.error("Garage ID loading error:", loadError);
      setForm(createInitialForm("Unavailable"));
      setError(
        loadError.message || "Unable to generate the next garage ID."
      );
      return null;
    }
  };

  useEffect(() => {
    loadNextGarageCode();
  }, []);

  const passwordsDoNotMatch =
    form.login.confirm_password.length > 0 &&
    form.login.password !== form.login.confirm_password;

  const handleChange = (section) => (event) => {
    const { name } = event.target;
    let { value } = event.target;

    // Contact numbers: allow digits only and limit to 10 digits.
    if (name === "contact_number") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    // NIC:
    // - Old NIC: maximum 9 digits followed by V/X (10 characters total).
    // - New NIC: maximum 12 digits without V/X.
    if (section === "garage_owner" && name === "nic") {
      const cleanedValue = value.toUpperCase().replace(/[^0-9VX]/g, "");
      const nicSuffix = cleanedValue.match(/[VX]/)?.[0];

      if (nicSuffix) {
        const digits = cleanedValue.replace(/[VX]/g, "").slice(0, 9);
        value = `${digits}${nicSuffix}`;
      } else {
        value = cleanedValue.replace(/\D/g, "").slice(0, 12);
      }
    }

    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [name]: value,
      },
    }));

    setError("");
    setSuccess(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location service is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Keep the coordinates temporary until the user confirms the popup.
        setPendingLocation({
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        });
        setShowLocationConfirm(true);
        setLocationLoading(false);
      },
      (geoError) => {
        let message = "Unable to access the location.";

        if (geoError.code === geoError.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access or select the garage using the map.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message =
            "Your current location is unavailable. Please try again or use the map.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message =
            "Location request timed out. Please try again or select the location using the map.";
        }

        setError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const confirmCurrentLocation = () => {
    if (!pendingLocation) return;

    setForm((previous) => ({
      ...previous,
      garage: {
        ...previous.garage,
        latitude: pendingLocation.latitude,
        longitude: pendingLocation.longitude,
      },
    }));

    setPendingLocation(null);
    setShowLocationConfirm(false);
    setError("");
    setSuccess(false);
  };

  const cancelCurrentLocation = () => {
    setPendingLocation(null);
    setShowLocationConfirm(false);
  };

  const openMapPicker = () => {
    const hasSavedCoordinates =
      form.garage.latitude !== "" && form.garage.longitude !== "";

    const existingLatitude = Number(form.garage.latitude);
    const existingLongitude = Number(form.garage.longitude);

    if (
      hasSavedCoordinates &&
      Number.isFinite(existingLatitude) &&
      Number.isFinite(existingLongitude)
    ) {
      setMapSelection({
        lat: existingLatitude,
        lng: existingLongitude,
      });
    } else {
      setMapSelection(null);
    }

    setShowMap(true);
    setError("");
  };

  const confirmMapLocation = (confirmedPosition = mapSelection) => {
    if (!confirmedPosition) return;

    const confirmedLatitude = Number(confirmedPosition.lat);
    const confirmedLongitude = Number(confirmedPosition.lng);

    if (
      !Number.isFinite(confirmedLatitude) ||
      !Number.isFinite(confirmedLongitude)
    ) {
      setError("Please confirm valid latitude and longitude values.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      garage: {
        ...previous.garage,
        latitude: confirmedLatitude.toFixed(6),
        longitude: confirmedLongitude.toFixed(6),
      },
    }));

    setShowMap(false);
    setMapSelection(null);
    setError("");
    setSuccess(false);
  };

  const validateNic = (nic) => {
    const oldNicPattern = /^[0-9]{9}[VvXx]$/;
    const newNicPattern = /^[0-9]{12}$/;
    return oldNicPattern.test(nic) || newNicPattern.test(nic);
  };

  const validatePhone = (phone) => /^0\d{9}$/.test(phone.trim());

  const validateEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());

  const validateStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})/.test(
      password
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const { garage, garage_owner, login } = form;

    if (Number(garage.capacity) <= 0) {
      setError("Garage capacity must be at least 1 vehicle.");
      return;
    }

    if (!validatePhone(garage.contact_number)) {
      setError("Please enter a valid garage contact number.");
      return;
    }

    if (!validatePhone(garage_owner.contact_number)) {
      setError("Please enter a valid owner contact number.");
      return;
    }

    if (!validateNic(garage_owner.nic.trim())) {
      setError(
        "Please enter a valid NIC: 9 digits followed by V/X, or a 12-digit NIC."
      );
      return;
    }

    if (!validateEmail(garage_owner.email)) {
      setError("Please enter a valid owner email address.");
      return;
    }

    if (!validateStrongPassword(login.password)) {
      setError(
        "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    if (login.password !== login.confirm_password) {
      setError("Password and confirm password must be exactly the same.");
      return;
    }

    const payload = {
      garage: {
        garage_name: garage.garage_name.trim(),
        contact_number: garage.contact_number.trim(),
        address: garage.address.trim(),
        latitude: Number(garage.latitude),
        longitude: Number(garage.longitude),
        capacity: Number(garage.capacity),
        opening_time: garage.opening_time,
        closing_time: garage.closing_time,
        working_days: garage.working_days,
        shift_type: garage.shift_type,
        district: garage.district,
      },
      garage_owner: {
        full_name: garage_owner.full_name.trim(),
        nic: garage_owner.nic.trim().toUpperCase(),
        email: garage_owner.email.trim().toLowerCase(),
        contact_number: garage_owner.contact_number.trim(),
        joined_date: garage_owner.joined_date,
      },
      login: {
        username: login.username.trim(),
        password: login.password,
      },
    };

    try {
      setSubmitting(true);

      const response = await fetch("http://localhost:5000/api/garages/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Garage registration failed.");
      }

      const savedGarageCode =
        result.data?.garage_code ||
        formatGarageCode(result.data?.garage_id || 0);

      // Keep the database-generated code for the success message.
      setRegisteredGarageId(savedGarageCode);
      setSuccess(true);

      // Load the next code from the database and prepare a fresh form.
      await loadNextGarageCode();
      setPendingLocation(null);
      setShowLocationConfirm(false);
      setMapSelection(null);
      setShowMap(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (submitError) {
      console.error("Garage registration error:", submitError);
      setError(submitError.message || "Unable to register the garage.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = async () => {
    await loadNextGarageCode();
    setPendingLocation(null);
    setShowLocationConfirm(false);
    setMapSelection(null);
    setShowMap(false);
    setError("");
    setSuccess(false);
    setRegisteredGarageId("");
  };

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05080d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate("start")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-teal-400/40 hover:text-teal-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-2 font-black">
            <Wrench className="h-6 w-6 text-teal-400" />
            SwiftGarage <span className="text-teal-400">AI</span>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-400/25 bg-teal-400/10 text-teal-300">
              <Building2 className="h-8 w-8" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal-300">
              New Garage Partner
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Register Your Garage
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
              Create the garage profile and the first Garage Owner login
              account.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection icon={Building2} title="Garage Details">
              <Field
                label="Garage ID"
                name="garage_id"
                value={garageId}
                readOnly
                className="sm:col-span-2"
              />

              <Field
                label="Garage Name"
                name="garage_name"
                value={form.garage.garage_name}
                onChange={handleChange("garage")}
                required
              />

              <Field
                label="Garage Contact Number"
                name="contact_number"
                type="tel"
                value={form.garage.contact_number}
                onChange={handleChange("garage")}
                inputMode="numeric"
                maxLength={10}
                pattern="0[0-9]{9}"
                placeholder="Example: 0771234567"
                required
              />

              <Field
                label="Garage Address"
                name="address"
                value={form.garage.address}
                onChange={handleChange("garage")}
                required
                className="sm:col-span-2"
              />

              <SelectField
                label="District"
                name="district"
                value={form.garage.district}
                onChange={handleChange("garage")}
                required
                placeholder="Select district"
                options={[
                  "Ampara",
                  "Anuradhapura",
                  "Badulla",
                  "Batticaloa",
                  "Colombo",
                  "Galle",
                  "Gampaha",
                  "Hambantota",
                  "Jaffna",
                  "Kalutara",
                  "Kandy",
                  "Kegalle",
                  "Kilinochchi",
                  "Kurunegala",
                  "Mannar",
                  "Matale",
                  "Matara",
                  "Monaragala",
                  "Mullaitivu",
                  "Nuwara Eliya",
                  "Polonnaruwa",
                  "Puttalam",
                  "Ratnapura",
                  "Trincomalee",
                  "Vavuniya",
                ]}
              />

              <Field
                label="Garage Capacity (Vehicles)"
                name="capacity"
                type="number"
                min="1"
                step="1"
                value={form.garage.capacity}
                onChange={handleChange("garage")}
                required
                placeholder="Example: 10"
              />

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-bold text-white">Garage Location</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Use the garage&apos;s exact location.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-2.5 text-sm font-bold text-teal-300 transition hover:bg-teal-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      {locationLoading
                        ? "Finding Location..."
                        : "Use Current Location"}
                    </button>

                    <button
                      type="button"
                      onClick={openMapPicker}
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:bg-blue-400/15"
                    >
                      <MapPinned className="h-4 w-4" />
                      Enter Coordinates
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.garage.latitude}
                    readOnly
                    placeholder="Select a location"
                    required
                  />

                  <Field
                    label="Longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.garage.longitude}
                    readOnly
                    placeholder="Select a location"
                    required
                  />
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-5 text-slate-500">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  Confirmed latitude and longitude are filled automatically and
                  locked in this form. Use a location button again only when you need
                  to replace them.
                </div>
              </div>

              <Field
                label="Opening Time"
                name="opening_time"
                type="time"
                value={form.garage.opening_time}
                onChange={handleChange("garage")}
                required
              />

              <Field
                label="Closing Time"
                name="closing_time"
                type="time"
                value={form.garage.closing_time}
                onChange={handleChange("garage")}
                required
              />

              <SelectField
                label="Working Days"
                name="working_days"
                value={form.garage.working_days}
                onChange={handleChange("garage")}
                required
                options={[
                  "Monday - Friday",
                  "Monday - Saturday",
                  "Monday - Sunday",
                  "24 Hours",
                ]}
              />

              <SelectField
                label="Shift Type"
                name="shift_type"
                value={form.garage.shift_type}
                onChange={handleChange("garage")}
                required
                options={[
                  "Day Shift",
                  "Night Shift",
                  "24 Hours",
                ]}
              />

            </FormSection>

            <FormSection icon={UserRound} title="Garage Owner Details">
              <Field
                label="Garage ID"
                name="garage_id"
                value={garageId}
                readOnly
              />

              <Field
                label="Owner Full Name"
                name="full_name"
                value={form.garage_owner.full_name}
                onChange={handleChange("garage_owner")}
                required
              />

              <Field
                label="Owner NIC"
                name="nic"
                value={form.garage_owner.nic}
                onChange={handleChange("garage_owner")}
                required
                placeholder="200012345678 or 901234567V"
                maxLength={12}
                pattern="([0-9]{9}[VvXx]|[0-9]{12})"
                title="Enter 9 digits followed by V/X, or a 12-digit NIC"
              />

              <Field
                label="Owner Email"
                name="email"
                type="email"
                value={form.garage_owner.email}
                onChange={handleChange("garage_owner")}
                placeholder="owner@example.com"
                required
              />

              <Field
                label="Owner Contact Number"
                name="contact_number"
                type="tel"
                value={form.garage_owner.contact_number}
                onChange={handleChange("garage_owner")}
                inputMode="numeric"
                maxLength={10}
                pattern="0[0-9]{9}"
                placeholder="Example: 0771234567"
                required
              />

              <Field
                label="Joined Date"
                name="joined_date"
                type="date"
                value={form.garage_owner.joined_date}
                min={form.garage_owner.joined_date}
                max={form.garage_owner.joined_date}
                readOnly
                required
              />

            </FormSection>

            <FormSection icon={KeyRound} title="Garage Owner Login Details">
              <Field
                label="Username"
                name="username"
                value={form.login.username}
                onChange={handleChange("login")}
                placeholder="Use the owner email address as the username"
                required
                autoComplete="username"
              />

              <div className="hidden sm:block" />

              <PasswordField
                label="Password"
                name="password"
                value={form.login.password}
                onChange={handleChange("login")}
                visible={showPassword}
                onToggle={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
                autoComplete="new-password"
                minLength={8}
                title="Use at least 8 characters with uppercase, lowercase, number, and special character"
              />

              <p className="-mt-2 text-xs leading-5 text-slate-500 sm:col-span-2">
                Password must contain at least 8 characters, one uppercase letter,
                one lowercase letter, one number, and one special character.
              </p>

              <PasswordField
                label="Confirm Password"
                name="confirm_password"
                value={form.login.confirm_password}
                onChange={handleChange("login")}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                autoComplete="new-password"
                minLength={8}
              />

              <AnimatePresence>
                {form.login.confirm_password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className={`-mt-2 flex items-center gap-2 text-xs font-bold sm:col-span-2 ${
                      passwordsDoNotMatch
                        ? "text-red-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {passwordsDoNotMatch ? (
                      <>
                        <X className="h-4 w-4" />
                        Password and confirm password do not match.
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Passwords match.
                      </>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </FormSection>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-300"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-black">
                      Garage registration submitted successfully.
                    </p>

                    <p className="mt-1 text-sm text-emerald-200/75">
                      Garage ID: {registeredGarageId || garageId}. The garage and owner account were
                      saved successfully in the MySQL database.
                    </p>

                    <button
                      type="button"
                      onClick={() => onNavigate("staff-login")}
                      className="mt-4 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950"
                    >
                      Go to Staff Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck className="h-5 w-5 text-teal-300" />
                Owner credentials will belong to this registered garage.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate("start")}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3.5 font-black text-slate-950 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}

                  {submitting ? "Registering..." : "Register Garage"}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <AnimatePresence>
        {showLocationConfirm && pendingLocation && (
          <ConfirmationModal
            title="Current Location Found"
            message="Your current location was found successfully. Confirm to place these coordinates in the form."
            latitude={pendingLocation.latitude}
            longitude={pendingLocation.longitude}
            onConfirm={confirmCurrentLocation}
            onCancel={cancelCurrentLocation}
          />
        )}

        {showMap && (
          <MapPickerModal
            selectedPosition={mapSelection}
            onPositionChange={setMapSelection}
            garageName={form.garage.garage_name}
            garageAddress={form.garage.address}
            onConfirm={confirmMapLocation}
            onClose={() => {
              setShowMap(false);
              setMapSelection(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmationModal({
  title,
  message,
  latitude,
  longitude,
  onConfirm,
  onCancel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1119] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Close confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <CoordinatePreview label="Latitude" value={latitude} />
          <CoordinatePreview label="Longitude" value={longitude} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
          >
            <MapPin className="h-4 w-4" />
            Use Location
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MapPickerModal({
  selectedPosition,
  onPositionChange,
  onConfirm,
  onClose,
}) {
  const initialCenter = selectedPosition
    ? [selectedPosition.lat, selectedPosition.lng]
    : DEFAULT_MAP_CENTER;

  const [currentCenter, setCurrentCenter] = useState({
    lat: initialCenter[0],
    lng: initialCenter[1],
  });
  const [mapTarget, setMapTarget] = useState(null);
  const [latitudeInput, setLatitudeInput] = useState(
    selectedPosition ? String(selectedPosition.lat) : ""
  );
  const [longitudeInput, setLongitudeInput] = useState(
    selectedPosition ? String(selectedPosition.lng) : ""
  );
  const [coordinateError, setCoordinateError] = useState("");
  const [coordinatesLocked, setCoordinatesLocked] = useState(false);

  useEffect(() => {
    onPositionChange({
      lat: initialCenter[0],
      lng: initialCenter[1],
    });
  }, []);

  const handleCenterChange = (center) => {
    if (coordinatesLocked) return;

    setCurrentCenter(center);
    onPositionChange(center);
    setLatitudeInput(center.lat.toFixed(6));
    setLongitudeInput(center.lng.toFixed(6));
  };

  const handleCoordinateInput = (setter) => (event) => {
    const value = event.target.value;

    // Allow an optional minus sign and a maximum of 6 digits after the decimal point.
    if (/^-?\d{0,3}(?:\.\d{0,6})?$/.test(value)) {
      setter(value);
      setCoordinateError("");
    }
  };

  const goToCoordinates = () => {
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setCoordinateError("Enter valid latitude and longitude values.");
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setCoordinateError("Latitude must be between -90 and 90.");
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setCoordinateError("Longitude must be between -180 and 180.");
      return;
    }

    const fixedLatitude = Number(latitude.toFixed(6));
    const fixedLongitude = Number(longitude.toFixed(6));

    const position = {
      lat: fixedLatitude,
      lng: fixedLongitude,
    };

    setLatitudeInput(fixedLatitude.toFixed(6));
    setLongitudeInput(fixedLongitude.toFixed(6));
    setCurrentCenter(position);
    onPositionChange(position);
    setMapTarget(position);
    setCoordinatesLocked(true);
    setCoordinateError("");

    // Immediately send the confirmed coordinates to the parent form.
    // The parent saves them with 6 decimal places, closes this modal,
    // and keeps the form latitude/longitude fields read-only.
    onConfirm(position);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1119] shadow-2xl sm:min-h-0 sm:h-[calc(100dvh-3rem)]"
      >
        <div className="shrink-0 border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-300">
                <MapPinned className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Garage Location Picker
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-white sm:text-3xl">
                Enter Garage Coordinates
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Copy the exact latitude and longitude from Google Maps and confirm them. The values will be added to the form automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              aria-label="Close location picker"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Latitude
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={latitudeInput}
                onChange={handleCoordinateInput(setLatitudeInput)}
                readOnly={coordinatesLocked}
                placeholder="Example: 6.872800"
                className={`w-full rounded-xl border px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${
                  coordinatesLocked
                    ? "cursor-not-allowed border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-slate-950/80 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/10"
                }`}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Longitude
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={longitudeInput}
                onChange={handleCoordinateInput(setLongitudeInput)}
                readOnly={coordinatesLocked}
                placeholder="Example: 79.888700"
                className={`w-full rounded-xl border px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${
                  coordinatesLocked
                    ? "cursor-not-allowed border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-slate-950/80 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/10"
                }`}
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={goToCoordinates}
                disabled={coordinatesLocked}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-400 px-5 py-3.5 font-black text-slate-950 transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:bg-emerald-400 disabled:opacity-90 lg:w-auto"
              >
                {coordinatesLocked ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Navigation className="h-5 w-5" />
                )}
                {coordinatesLocked ? "Coordinates Confirmed" : "Confirm Coordinates"}
              </button>
            </div>
          </div>

          {coordinateError && (
            <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {coordinateError}
            </p>
          )}
        </div>

        <div className="relative min-h-[520px] flex-1 bg-slate-950 sm:min-h-[560px]">
          <MapContainer
            center={initialCenter}
            zoom={selectedPosition ? 17 : 14}
            scrollWheelZoom
            className="h-full min-h-[520px] w-full sm:min-h-[560px]"
          >
            <MapResizeFix />
            <MapFlyController target={mapTarget} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              crossOrigin=""
            />

            <MapCenterTracker
              onCenterChange={handleCenterChange}
              disabled={coordinatesLocked}
            />
          </MapContainer>

          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="relative -translate-y-5">
              <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rounded-full bg-black/35 blur-sm" />

              <MapPin
                className="h-14 w-14 fill-blue-400 text-blue-950 drop-shadow-[0_8px_12px_rgba(0,0,0,0.55)]"
                strokeWidth={2.2}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-[550] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-full border border-white/15 bg-slate-950/85 px-4 py-2 text-center text-xs font-bold text-slate-200 shadow-xl backdrop-blur-md">
            {coordinatesLocked
              ? "Coordinates are confirmed, saved to the form, and locked."
              : "Enter the coordinates and click Confirm Coordinates."}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0b1119] p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <CoordinatePreview
              label="Selected Latitude"
              value={currentCenter.lat.toFixed(6)}
            />

            <CoordinatePreview
              label="Selected Longitude"
              value={currentCenter.lng.toFixed(6)}
            />
          </div>

          <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm leading-6 text-blue-200">
            In Google Maps, right-click the garage location on a computer or
            long-press it on a phone. Copy the displayed coordinates and paste
            them above.
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Coordinates fills and locks the form automatically.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function MapFlyController({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo([target.lat, target.lng], 17, {
      duration: 1.1,
    });
  }, [map, target]);

  return null;
}

function MapCenterTracker({ onCenterChange, disabled = false }) {
  const updateMapData = (map) => {
    if (disabled) return;

    const center = map.getCenter();
    onCenterChange({
      lat: center.lat,
      lng: center.lng,
    });

  };

  const map = useMapEvents({
    moveend() {
      updateMapData(map);
    },

    zoomend() {
      updateMapData(map);
    },
  });

  useEffect(() => {
    updateMapData(map);
  }, [map, disabled]);

  return null;
}

function CoordinatePreview({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-7"
    >
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300">
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="text-xl font-black">{title}</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </motion.section>
  );
}

function Field({ label, className = "", readOnly = false, ...props }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        {...props}
        readOnly={readOnly}
        className={`w-full rounded-xl border px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 [color-scheme:dark] ${
          readOnly
            ? "cursor-not-allowed border-white/10 bg-slate-900/80 text-slate-400"
            : "border-white/10 bg-slate-950/70 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
        }`}
      />
    </label>
  );
}

function SelectField({ label, options, placeholder, ...props }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <select
        {...props}
        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PasswordField({ label, visible, onToggle, ...props }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

        <input
          {...props}
          type={visible ? "text" : "password"}
          required
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-12 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-teal-300"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </label>
  );
}