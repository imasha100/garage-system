import React, {
  useEffect,
  useState,
} from "react";

import {
  User,
  ArrowLeft,
  X,
  Search,
  PlusCircle,
  History,
} from "lucide-react";

import mechanicBg from "../../assets/mechanic-bg.jpg";

export default function CustomerLogin({
  onNavigate,
  setSelectedGarage,
}) {
  // ======================================================
  // PREVENT BROWSER BACK FROM LEAVING THIS PAGE
  // ======================================================

  useEffect(() => {
    const currentUrl =
      window.location.href;

    // Replace current history entry with this page
    window.history.replaceState(
      {
        customerHelpPage: true,
      },
      "",
      currentUrl
    );

    // Add another copy of this page to history
    window.history.pushState(
      {
        customerHelpPage: true,
      },
      "",
      currentUrl
    );

    const handleBrowserBack =
      () => {
        // If browser back is pressed,
        // immediately move forward again
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
  // STATE
  // ======================================================

  const [
    showContinuePopup,
    setShowContinuePopup,
  ] = useState(false);

  const [
    continueData,
    setContinueData,
  ] = useState({
    contactNumber: "",
    vehicleNumber: "",
  });

  const [
    continueError,
    setContinueError,
  ] = useState("");

  const [
    continueMessage,
    setContinueMessage,
  ] = useState("");

  const [
    isCheckingRequest,
    setIsCheckingRequest,
  ] = useState(false);

  // ======================================================
  // NORMALIZE VEHICLE NUMBER
  // ======================================================

  const normalizeVehicleNumber = (
    value
  ) => {
    return String(
      value || ""
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]/g,
        ""
      );
  };

  // ======================================================
  // RESET CONTINUE POPUP
  // ======================================================

  const resetContinuePopup =
    () => {
      setShowContinuePopup(
        false
      );

      setContinueData({
        contactNumber: "",
        vehicleNumber: "",
      });

      setContinueError("");
      setContinueMessage("");

      setIsCheckingRequest(
        false
      );
    };

  // ======================================================
  // CONTINUE FIELD CHANGE
  // ======================================================

  const handleContinueFieldChange = (
    field,
    value
  ) => {
    setContinueData(
      (
        previousData
      ) => ({
        ...previousData,

        [field]:
          value,
      })
    );

    setContinueError("");
    setContinueMessage("");
  };

  // ======================================================
  // CONTINUE EXISTING REQUEST
  // ======================================================

  const handleContinueRequest =
    async (
      event
    ) => {
      event.preventDefault();

      setContinueError("");
      setContinueMessage("");

      const contactNumber =
        continueData
          .contactNumber
          .trim()
          .replace(
            /\D/g,
            ""
          );

      const vehicleNumber =
        continueData
          .vehicleNumber
          .trim()
          .toUpperCase();

      // ==================================================
      // VALIDATE CONTACT NUMBER
      // ==================================================

      if (
        !/^0\d{9}$/.test(
          contactNumber
        )
      ) {
        setContinueError(
          "Enter a valid 10-digit contact number starting with 0."
        );

        return;
      }

      // ==================================================
      // VALIDATE VEHICLE NUMBER
      // ==================================================

      if (
        !vehicleNumber
      ) {
        setContinueError(
          "Vehicle number is required."
        );

        return;
      }

      try {
        setIsCheckingRequest(
          true
        );

        // ==================================================
        // GET LATEST CUSTOMER REQUEST
        // ==================================================

        const response =
          await fetch(
            `http://localhost:5000/api/service-requests/customer/${contactNumber}/latest`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.request
        ) {
          throw new Error(
            result.message ||
              "No existing request was found."
          );
        }

        const existingRequest =
          result.request;

        // ==================================================
        // CHECK VEHICLE NUMBER
        // ==================================================

        const savedVehicleNumber =
          normalizeVehicleNumber(
            existingRequest
              .vehicleNumber
          );

        const enteredVehicleNumber =
          normalizeVehicleNumber(
            vehicleNumber
          );

        if (
          savedVehicleNumber !==
          enteredVehicleNumber
        ) {
          throw new Error(
            "The contact number and vehicle number do not match an existing request."
          );
        }

        // ==================================================
        // CHECK WHETHER EXISTING REQUEST CAN BE CONTINUED
        // ==================================================

        if (
          result.canContinue ===
          false
        ) {
          sessionStorage.removeItem(
            "latestServiceRequest"
          );

          sessionStorage.removeItem(
            "latestTowDispatch"
          );

          sessionStorage.removeItem(
            "selectedGarage"
          );

          setContinueMessage(
            result.continueMessage ||
              "Your previous service has already been completed. Please create a new service request."
          );

          return;
        }

        // ==================================================
        // REQUEST STATUS
        // ==================================================

        const requestStatus =
          String(
            existingRequest
              .requestStatus ||
              existingRequest
                .status ||
              ""
          )
            .trim()
            .toLowerCase();

        // ==================================================
        // RESTORE SERVICE REQUEST
        // ==================================================

        const restoredRequest = {
          ...existingRequest,

          contact:
            existingRequest
              .customerContact ||
            contactNumber,

          customerLatitude:
            existingRequest
              .customerLatitude,

          customerLongitude:
            existingRequest
              .customerLongitude,

          status:
            requestStatus,
        };

        sessionStorage.setItem(
          "latestServiceRequest",
          JSON.stringify(
            restoredRequest
          )
        );

        // ==================================================
        // RESTORE LATEST TOW DISPATCH
        // ==================================================

        const serviceRequestId =
          existingRequest
            .requestId ||
          existingRequest
            .serviceRequestId ||
          existingRequest
            .request_id;

        sessionStorage.removeItem(
          "latestTowDispatch"
        );

        if (
          serviceRequestId
        ) {
          try {
            const towResponse =
              await fetch(
                `http://localhost:5000/api/tow-dispatches/request/${serviceRequestId}/latest`
              );

            const towResult =
              await towResponse.json();

            if (
              towResponse.ok &&
              towResult.success &&
              towResult.dispatch
            ) {
              sessionStorage.setItem(
                "latestTowDispatch",
                JSON.stringify(
                  towResult.dispatch
                )
              );
            }
          } catch (
            towError
          ) {
            console.error(
              "Unable to restore tow dispatch:",
              towError
            );

            sessionStorage.removeItem(
              "latestTowDispatch"
            );
          }
        }

        // ==================================================
        // ACCEPTED REQUEST
        // ==================================================

        if (
          requestStatus ===
          "accepted"
        ) {
          const restoredGarage = {
            id:
              existingRequest
                .garageId,

            name:
              existingRequest
                .garageName ||
              "Selected Garage",

            address:
              existingRequest
                .garageAddress ||
              "",

            contact:
              existingRequest
                .garageContact ||
              "",

            lat:
              Number(
                existingRequest
                  .garageLatitude
              ),

            lng:
              Number(
                existingRequest
                  .garageLongitude
              ),

            distance:
              existingRequest
                .estimatedDistance ||
              "N/A",

            time:
              existingRequest
                .estimatedTime ||
              "N/A",

            customerRequest:
              restoredRequest,
          };

          if (
            setSelectedGarage
          ) {
            setSelectedGarage(
              restoredGarage
            );
          }

          sessionStorage.setItem(
            "selectedGarage",
            JSON.stringify(
              restoredGarage
            )
          );

          resetContinuePopup();

          onNavigate(
            "navigation-hub"
          );

          return;
        }

        // ==================================================
        // PENDING REQUEST
        // ==================================================

        if (
          requestStatus ===
          "pending"
        ) {
          setContinueMessage(
            `Your request ${
              existingRequest
                .ticketNumber ||
              ""
            } is still waiting for garage approval.`
          );

          return;
        }

        // ==================================================
        // REJECTED REQUEST
        // ==================================================

        if (
          requestStatus ===
          "rejected"
        ) {
          setContinueMessage(
            "Your previous request was rejected. Please create a new service request and select another garage."
          );

          return;
        }

        // ==================================================
        // COMPLETED / CANCELLED REQUEST
        // ==================================================

        if (
          requestStatus ===
            "completed" ||
          requestStatus ===
            "cancelled"
        ) {
          sessionStorage.removeItem(
            "latestServiceRequest"
          );

          sessionStorage.removeItem(
            "latestTowDispatch"
          );

          sessionStorage.removeItem(
            "selectedGarage"
          );

          setContinueMessage(
            "Your previous request is no longer active. Please create a new service request."
          );

          return;
        }

        // ==================================================
        // OTHER STATUS
        // ==================================================

        setContinueMessage(
          `Current request status: ${
            existingRequest
              .requestStatus ||
            "Unknown"
          }.`
        );
      } catch (error) {
        console.error(
          "Continue existing request error:",
          error
        );

        setContinueError(
          error.message ||
            "Unable to continue the existing request."
        );
      } finally {
        setIsCheckingRequest(
          false
        );
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div
        className="w-screen h-screen max-h-screen overflow-hidden flex flex-col justify-between relative text-white font-sans selection:bg-cyan-500 selection:text-slate-950 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            `url(${mechanicBg})`,
        }}
      >
        {/* OVERLAY */}

        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />

        {/* NEON GLOWS */}

        <div className="absolute top-1/3 left-1/4 w-100 h-100 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="absolute bottom-1/3 right-1/4 w-100 h-100 bg-red-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* TOP NAVBAR */}

        <div className="w-full h-16 border-b border-slate-900/60 bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between z-10">

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "start"
              )
            }
            className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-cyan-400 uppercase transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to Home
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900/80 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors">
            <User className="w-4 h-4" />
          </div>

        </div>

        {/* CENTER CONTENT */}

        <div className="flex flex-col items-center justify-center text-center z-10 my-auto px-4 fade-in">

          <h2 className="text-5xl sm:text-5xl md:text-6xl font-black tracking-wide uppercase mb-4 max-w-4xl bg-clip-text text-transparent bg-linear-to-b from-white via-slate-100 to-slate-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            DO YOU WANT HELP?
          </h2>

          <p className="text-slate-200 text-lg sm:text-xl md:text-3xl tracking-wide max-w-3xl mb-12 font-medium drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            Create a new roadside assistance request or continue an existing request.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-3xl">

            {/* NEW SERVICE REQUEST */}

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  "garage-map"
                )
              }
              className="flex-1 text-left p-6 bg-red-600/90 hover:bg-red-500 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.35)] border border-red-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">

                <PlusCircle className="w-6 h-6 text-white" />

                <span className="block font-black text-xl sm:text-lg tracking-wider uppercase text-white">
                  NEW SERVICE REQUEST
                </span>

              </div>

              <span className="block text-sm sm:text-xs font-medium text-red-100/90 leading-relaxed">
                Find nearby garages and create a new roadside assistance request.
              </span>

            </button>

            {/* CONTINUE EXISTING REQUEST */}

            <button
              type="button"
              onClick={() => {
                setContinueError(
                  ""
                );

                setContinueMessage(
                  ""
                );

                setShowContinuePopup(
                  true
                );
              }}
              className="flex-1 text-left p-6 bg-slate-900/70 backdrop-blur-md border border-slate-700 hover:border-cyan-500/60 hover:bg-slate-900/95 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3 mb-2">

                <History className="w-6 h-6 text-cyan-400" />

                <span className="block font-black text-xl sm:text-lg tracking-wider uppercase text-slate-100">
                  CONTINUE EXISTING REQUEST
                </span>

              </div>

              <span className="block text-sm sm:text-xs font-medium text-slate-400 leading-relaxed">
                Continue your previous request using your contact number and vehicle number.
              </span>

            </button>

          </div>

        </div>

        {/* CONTINUE REQUEST POPUP */}

        {showContinuePopup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">

            <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b1120] p-6 shadow-[0_0_45px_rgba(6,182,212,0.2)]">

              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={
                  resetContinuePopup
                }
                className="absolute right-4 top-4 rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-red-400/50 hover:text-red-400 cursor-pointer"
                aria-label="Close popup"
              >
                <X size={18} />
              </button>

              {/* POPUP TITLE */}

              <div className="mb-6">

                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  Continue Request
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Enter the same contact number and vehicle number used for your service request.
                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleContinueRequest
                }
                className="space-y-4"
                noValidate
              >

                {/* CONTACT NUMBER */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact Number
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={
                      continueData
                        .contactNumber
                    }
                    onChange={(
                      event
                    ) =>
                      handleContinueFieldChange(
                        "contactNumber",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            10
                          )
                      )
                    }
                    placeholder="Example: 0712345678"
                    maxLength={10}
                    className="w-full rounded-lg border border-slate-700 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                  />

                </div>

                {/* VEHICLE NUMBER */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    value={
                      continueData
                        .vehicleNumber
                    }
                    onChange={(
                      event
                    ) =>
                      handleContinueFieldChange(
                        "vehicleNumber",
                        event.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z0-9\s-]/g,
                            ""
                          )
                      )
                    }
                    placeholder="Example: WP CAS 1234"
                    maxLength={15}
                    className="w-full rounded-lg border border-slate-700 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                  />

                </div>

                {/* ERROR */}

                {continueError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                    {
                      continueError
                    }
                  </div>
                )}

                {/* INFO MESSAGE */}

                {continueMessage && (
                  <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-200">
                    {
                      continueMessage
                    }
                  </div>
                )}

                {/* CONTINUE */}

                <button
                  type="submit"
                  disabled={
                    isCheckingRequest
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3.5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search size={18} />

                  {
                    isCheckingRequest
                      ? "Checking Request..."
                      : "Continue Request"
                  }
                </button>

                {/* CANCEL */}

                <button
                  type="button"
                  disabled={
                    isCheckingRequest
                  }
                  onClick={
                    resetContinuePopup
                  }
                  className="w-full rounded-lg border border-slate-700 bg-transparent py-3 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

              </form>

            </div>

          </div>
        )}

        {/* FOOTER */}

        <div className="w-full text-center py-6 text-[10px] tracking-widest text-slate-400 font-bold uppercase z-10">
          SwiftGarage AI • Emergency Routing System
        </div>

      </div>
    </>
  );
}