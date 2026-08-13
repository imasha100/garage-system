import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ExternalDriverLogin({
  onNavigate,
}) {
  const [formData, setFormData] =
    useState({
      username: "",
      password: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isLoggingIn,
    setIsLoggingIn,
  ] = useState(false);

  const [
    loginError,
    setLoginError,
  ] = useState("");

  // =====================================================
  // LOAD APPROVED DRIVER CREDENTIALS
  // =====================================================

  useEffect(() => {
    try {
      const savedPrefill =
        sessionStorage.getItem(
          "externalDriverPrefill"
        );

      if (!savedPrefill) {
        return;
      }

      const parsedPrefill =
        JSON.parse(savedPrefill);

      setFormData({
        username:
          parsedPrefill.username || "",

        password:
          parsedPrefill.password || "",
      });
    } catch (error) {
      console.error(
        "External driver credential prefill error:",
        error
      );
    }
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

      if (loginError) {
        setLoginError("");
      }
    };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin =
    async (event) => {
      event.preventDefault();

      setLoginError("");

      const username =
        formData.username
          .trim()
          .toUpperCase();

      const password =
        formData.password;

      if (!username) {
        setLoginError(
          "Please enter your External Driver ID."
        );

        return;
      }

      if (!password) {
        setLoginError(
          "Please enter your password."
        );

        return;
      }

      setIsLoggingIn(true);

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/external-driver/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                username,
                password,
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
              "Invalid External Driver ID or password."
          );
        }

        const user =
          data.user ||
          data.data ||
          data.driver ||
          {};

        // =================================================
        // SUPPORT BOTH NEW + OLD BACKEND RESPONSE SHAPES
        // =================================================

        const truck =
          user.truck || {};

        const garage =
          user.garage || {};

        const normalizedSession = {
          loginId:
            user.loginId ??
            user.login_id ??
            null,

          driverId:
            user.driverId ??
            user.driver_id ??
            null,

          truckId:
            user.truckId ??
            user.truck_id ??
            truck.truckId ??
            truck.truck_id ??
            null,

          garageId:
            user.garageId ??
            user.garage_id ??
            garage.garageId ??
            garage.garage_id ??
            null,

          username:
            user.username ||
            user.externalDriverId ||
            username,

          externalDriverId:
            user.externalDriverId ||
            user.username ||
            username,

          fullName:
            user.fullName ||
            user.full_name ||
            "",

          email:
            user.email || "",

          nic:
            user.nic || "",

          contactNumber:
            user.contactNumber ||
            user.contact_number ||
            "",

          licenseNumber:
            user.licenseNumber ||
            user.licenceNumber ||
            user.license_number ||
            "",

          licenseExpiryDate:
            user.licenseExpiryDate ||
            user.licenceExpiryDate ||
            user.license_expire_date ||
            "",

          experienceYears:
            user.experienceYears ??
            user.experience_years ??
            null,

          truckNumber:
            user.truckNumber ||
            user.truck_number ||
            truck.truckNumber ||
            truck.truck_number ||
            "",

          truckType:
            user.truckType ||
            user.truck_type ||
            truck.truckType ||
            truck.truck_type ||
            "",

          truckModel:
            user.truckModel ||
            user.truck_model ||
            truck.truckModel ||
            truck.truck_model ||
            "",

          capacityTons:
            user.capacityTons ??
            user.capacity_tons ??
            truck.capacityTons ??
            truck.capacity_tons ??
            null,

          latitude:
            user.latitude ??
            truck.latitude ??
            null,

          longitude:
            user.longitude ??
            truck.longitude ??
            null,

          assignmentStatus:
            user.assignmentStatus ||
            user.assignment_status ||
            truck.assignmentStatus ||
            truck.assignment_status ||
            "",

          garageName:
            user.garageName ||
            user.garage_name ||
            garage.garageName ||
            garage.garage_name ||
            "",

          garageAddress:
            user.garageAddress ||
            user.garage_address ||
            garage.address ||
            "",

          garageContactNumber:
            user.garageContactNumber ||
            user.garage_contact_number ||
            garage.contactNumber ||
            garage.contact_number ||
            "",

          garageDistrict:
            user.garageDistrict ||
            user.garage_district ||
            garage.district ||
            "",

          role:
            user.role ||
            "external_driver",
        };

        // =================================================
        // STORE EXTERNAL DRIVER SESSION
        // =================================================

        localStorage.setItem(
          "externalDriverSession",
          JSON.stringify(
            normalizedSession
          )
        );

        // Remove temporary prefill after successful login.
        sessionStorage.removeItem(
          "externalDriverPrefill"
        );

        onNavigate(
          "external-driver-dashboard"
        );
      } catch (error) {
        console.error(
          "External driver login error:",
          error
        );

        setLoginError(
          error.message ||
            "Unable to login. Please try again."
        );
      } finally {
        setIsLoggingIn(false);
      }
    };

  // =====================================================
  // RETURN START PAGE
  // =====================================================

  const handleBack =
    () => {
      onNavigate("start");
    };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#05080d] text-white">
      <div className="relative min-h-screen overflow-hidden">
        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[150px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

        {/* HEADER */}

        <header className="relative z-20 border-b border-white/10 bg-[#05080d]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-2.5">
                <Wrench className="h-5 w-5 text-teal-300" />
              </div>

              <div>
                <p className="font-black tracking-wide">
                  SwiftGarage{" "}
                  <span className="text-teal-400">
                    AI
                  </span>
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  External Partner Portal
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* LOGIN CONTENT */}

        <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT SIDE */}

            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.65,
              }}
              className="relative overflow-hidden border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-400/[0.08] via-transparent to-cyan-400/[0.05]" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-teal-300">
                  <Truck className="h-4 w-4" />

                  Approved Tow Partner
                </div>

                <h1 className="mt-7 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  External Driver

                  <span className="block text-teal-400">
                    Secure Login
                  </span>
                </h1>

                <p className="mt-5 max-w-lg leading-7 text-slate-400">
                  Sign in using the External Driver ID
                  and password provided after your tow
                  truck registration was approved.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-bold">
                        Secure Access
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Only approved external tow
                        truck drivers can access this
                        portal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                      <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-bold">
                        Change Your Password
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        You can change your temporary
                        password from your External
                        Driver profile after login.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE - LOGIN FORM */}

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.08,
              }}
              className="flex items-center p-6 sm:p-10 lg:p-12"
            >
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300">
                    <UserRound className="h-7 w-7" />
                  </div>

                  <h2 className="mt-5 text-3xl font-black">
                    Welcome Back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your External Driver ID and
                    password to continue.
                  </p>
                </div>

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* DRIVER ID */}

                  <div>
                    <label
                      htmlFor="external-driver-id"
                      className="mb-2 block text-sm font-bold text-slate-300"
                    >
                      External Driver ID
                    </label>

                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                      <input
                        id="external-driver-id"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="EXT-DRV-0012"
                        autoComplete="username"
                        disabled={isLoggingIn}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-4 font-mono text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <label
                      htmlFor="external-driver-password"
                      className="mb-2 block text-sm font-bold text-slate-300"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                      <input
                        id="external-driver-password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        disabled={isLoggingIn}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-teal-300"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ERROR */}

                  {loginError && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                      <p>
                        {loginError}
                      </p>
                    </motion.div>
                  )}

                  {/* LOGIN BUTTON */}

                  <motion.button
                    type="submit"
                    disabled={isLoggingIn}
                    whileHover={
                      isLoggingIn
                        ? {}
                        : {
                            y: -2,
                            scale: 1.01,
                          }
                    }
                    whileTap={
                      isLoggingIn
                        ? {}
                        : {
                            scale: 0.98,
                          }
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 px-5 py-4 font-black text-slate-950 shadow-[0_15px_45px_rgba(45,212,191,0.2)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingIn ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-5 w-5" />
                        LOGIN
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-center text-xs leading-6 text-slate-500">
                    Your External Driver ID is permanent.
                    After signing in, you can change your
                    temporary password from the Security
                    section of your profile.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}